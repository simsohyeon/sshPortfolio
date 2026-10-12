"""모델·토크나이저 로딩 공통 코드 (train.py·evaluate.py 공용). GPU 라이브러리는 함수 안에서 import 한다."""
from __future__ import annotations

import json
import platform
from importlib import metadata
from pathlib import Path

from common import sha256_bytes

LIBS = ["torch", "transformers", "peft", "trl", "accelerate", "bitsandbytes", "datasets", "huggingface_hub"]


def lib_versions() -> dict:
    out = {"python": platform.python_version()}
    for name in LIBS:
        try:
            out[name] = metadata.version(name)
        except metadata.PackageNotFoundError:
            out[name] = None
    try:
        import torch
        out["cuda_runtime"] = torch.version.cuda
    except ImportError:
        pass
    return out


def gpu_info() -> dict:
    import torch
    if not torch.cuda.is_available():
        return {"available": False}
    props = torch.cuda.get_device_properties(0)
    major, minor = torch.cuda.get_device_capability(0)
    return {
        "available": True,
        "name": props.name,
        "total_memory_gib": round(props.total_memory / 1024**3, 2),
        "capability": f"{major}.{minor}",
        # T4(7.5)는 bf16 연산을 하드웨어로 지원하지 않는다. 8.0 이상(A100·L4 등)만 bf16 사용
        "bf16": major >= 8,
    }


def require_gpu() -> dict:
    info = gpu_info()
    if not info["available"]:
        raise SystemExit(
            "GPU 가 없습니다. Colab 메뉴 [런타임] → [런타임 유형 변경] → 하드웨어 가속기에서 GPU(T4 등)를 고른 뒤 "
            "처음 셀부터 다시 실행하세요. CPU 로는 학습하지 않습니다."
        )
    return info


def is_local_model(model_id: str) -> bool:
    return Path(model_id).is_dir()


def resolve_revision(cfg: dict, pin_path: Path) -> dict:
    """사용할 모델 커밋을 정하고 실험 폴더에 고정한다.

    우선순위: 실험 폴더의 model.json(이미 고정된 값) > config 의 revision > Hub 의 현재 커밋 SHA.
    처음 정할 때 model.json 에 저장하므로 길이 검사·smoke·본 학습·평가가 모두 같은 커밋을 쓴다.
    Hub 조회 시 라이선스·gated 여부도 함께 남긴다.
    """
    model_id = cfg["model"]["id"]
    wanted = cfg["model"].get("revision")
    if pin_path.exists():
        pinned = json.loads(pin_path.read_text(encoding="utf-8"))
        if pinned.get("id") != model_id or (wanted and wanted != pinned.get("revision")):
            raise SystemExit(
                f"{pin_path} 에 고정된 모델({pinned.get('id')} @ {pinned.get('revision')})과 config 가 다릅니다. "
                "다른 모델로 실험하려면 configs/experiment.json 의 experiment_name 을 바꾸세요."
            )
        return pinned
    if is_local_model(model_id):
        files = sorted(p for p in Path(model_id).rglob("*") if p.is_file())
        digest = sha256_bytes(b"".join(p.name.encode() + p.read_bytes() for p in files))
        out = {"id": model_id, "revision": wanted or f"local-{digest[:12]}", "source": "local", "license": None}
    else:
        from huggingface_hub import HfApi
        info = HfApi().model_info(model_id, revision=wanted) if wanted else HfApi().model_info(model_id)
        card = info.card_data.to_dict() if getattr(info, "card_data", None) else {}
        out = {
            "id": model_id,
            "revision": info.sha,
            "source": "config" if wanted else "hub_main",
            "license": card.get("license"),
            "gated": getattr(info, "gated", None),
        }
        expected = cfg["model"].get("license_expected")
        if expected and out["license"] != expected:
            print(f"WARN 모델 라이선스가 예상({expected})과 다릅니다: {out['license']} - 모델 카드를 직접 확인하세요.")
    pin_path.parent.mkdir(parents=True, exist_ok=True)
    pin_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return out


def load_tokenizer(cfg: dict, revision: str):
    from transformers import AutoTokenizer
    kwargs = {"trust_remote_code": cfg["model"].get("trust_remote_code", False)}
    if not is_local_model(cfg["model"]["id"]):
        kwargs["revision"] = revision
    tok = AutoTokenizer.from_pretrained(cfg["model"]["id"], **kwargs)
    if tok.pad_token is None:
        tok.pad_token = tok.eos_token
    return tok


def load_model(cfg: dict, revision: str, gpu: dict):
    import torch
    from transformers import AutoModelForCausalLM, BitsAndBytesConfig

    q = cfg["quantization"]
    use_cuda = gpu.get("available", False)
    compute_dtype = torch.bfloat16 if gpu.get("bf16") else (torch.float16 if use_cuda else torch.float32)
    kwargs = {
        "dtype": compute_dtype,
        "trust_remote_code": cfg["model"].get("trust_remote_code", False),
        "attn_implementation": "sdpa",
    }
    if not is_local_model(cfg["model"]["id"]):
        kwargs["revision"] = revision
    if q.get("load_in_4bit"):
        if not use_cuda:
            raise SystemExit("4-bit(QLoRA) 로딩은 CUDA GPU 가 필요합니다.")
        kwargs["quantization_config"] = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type=q["bnb_4bit_quant_type"],
            bnb_4bit_use_double_quant=q["bnb_4bit_use_double_quant"],
            bnb_4bit_compute_dtype=compute_dtype,
        )
    if use_cuda:
        kwargs["device_map"] = {"": 0}
    model = AutoModelForCausalLM.from_pretrained(cfg["model"]["id"], **kwargs)
    return model, compute_dtype


def linear_module_names(model) -> set[str]:
    """LoRA 를 붙일 수 있는 Linear 계열 모듈의 마지막 이름 (예: q_proj)."""
    import torch
    names = set()
    for name, mod in model.named_modules():
        if isinstance(mod, torch.nn.Linear) or mod.__class__.__name__ in {"Linear4bit", "Linear8bitLt"}:
            names.add(name.split(".")[-1])
    return names


def chat_template_kwargs(cfg: dict) -> dict:
    return dict(cfg["model"].get("chat_template_kwargs") or {})


def encode_chat(tokenizer, messages, **kwargs) -> dict:
    """apply_chat_template 결과를 {input_ids: list[int], ...} 로 맞춘다 (transformers 버전별 반환 형태 차이 흡수)."""
    out = tokenizer.apply_chat_template(messages, tokenize=True, return_dict=True, **kwargs)
    res = {}
    for k, v in dict(out).items():
        if hasattr(v, "tolist"):
            v = v.tolist()
        if isinstance(v, list) and v and isinstance(v[0], list):
            v = v[0]
        res[k] = v
    return res
