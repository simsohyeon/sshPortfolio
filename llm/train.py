#!/usr/bin/env python3
"""QLoRA 학습 (Colab GPU 런타임용).

단계
  1. 분할 데이터(prepare_dataset.py 결과)가 현재 curated.jsonl·context.json 과 맞는지 확인
  2. 모델 커밋(revision) 고정, 토크나이저 로드
  3. 토큰 길이 측정 → max_length 결정 (상한을 넘으면 자르지 않고 중단)
  4. assistant 정답 토큰에만 loss 가 걸리는지 마스크 검사 (토크나이저 단계)
     --check-only 면 여기까지 하고 끝난다 (GPU 없이도 가능)
  5. 기반 모델 4-bit 로드, LoRA 대상 모듈 존재 확인
  6. SFTTrainer 구성 후 실제 배치의 labels 를 다시 검사 (system·user·padding 제외 확인)
  7. 학습 (체크포인트가 있으면 이어서), 어댑터·토크나이저·실행 기록 저장

사용 (저장소 루트에서)
  python llm/train.py --check-only                 # 길이·마스크만 확인
  python llm/train.py --smoke                      # 5스텝 시험 학습 → <output-root>/<experiment>/smoke
  python llm/train.py                              # 소규모 전체 학습 → <output-root>/<experiment>/full
  옵션: --config, --output-root (기본: config 의 output.colab_drive_root), --fresh(기존 체크포인트 무시 금지 확인)

결과 폴더
  ../model.json   실험 전체가 쓰는 기반 모델 ID·커밋 SHA (처음 실행 때 고정)
  run_info.json   모델 ID·revision·seed·데이터 해시·코드 버전·라이브러리·GPU·설정·시간·peak VRAM
  token_stats.json, mask_check.json, log_history.json
  checkpoints/    재개용 체크포인트 (save_total_limit 개만 유지)
  adapter/        LoRA 어댑터 + 토크나이저 (기반 모델 없이 단독 실행 불가 - README 참고)
"""
from __future__ import annotations

import argparse
import json
import math
import statistics
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import code_version, load_config, load_context, load_jsonl, repo_path, sha256_file, write_json  # noqa: E402
from modeling import (  # noqa: E402
    chat_template_kwargs, encode_chat, gpu_info, lib_versions, linear_module_names, load_model, load_tokenizer,
    no_math_attention, require_gpu, resolve_revision,
)

SPLITS = ("train", "validation", "test")
LABEL_CHECK_SAMPLES = 8


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def load_splits(cfg: dict, ctx: dict) -> tuple[dict, dict]:
    pdir = repo_path(cfg["data"]["processed_dir"])
    mpath = pdir / "manifest.json"
    if not mpath.exists():
        raise SystemExit("분할 데이터가 없습니다. 먼저 `python llm/scripts/prepare_dataset.py` 를 실행하세요.")
    manifest = json.loads(mpath.read_text(encoding="utf-8"))
    problems = []
    if manifest["curated_sha256"] != sha256_file(repo_path(cfg["data"]["curated"])):
        problems.append("curated.jsonl 이 분할 이후 바뀌었습니다")
    if manifest["system_prompt_sha256"] != ctx["system_prompt_sha256"]:
        problems.append("context.json(시스템 프롬프트)이 분할 이후 바뀌었습니다")
    if manifest["seed"] != cfg["seed"] or manifest["split_ratios"] != cfg["data"]["split_ratios"]:
        problems.append("seed 또는 split_ratios 가 분할 당시와 다릅니다")
    for s in SPLITS:
        if manifest["files"][f"{s}.jsonl"] != sha256_file(pdir / f"{s}.jsonl"):
            problems.append(f"{s}.jsonl 이 manifest 와 다릅니다")
    if problems:
        raise SystemExit("분할 데이터가 최신이 아닙니다: " + "; ".join(problems) + " - prepare_dataset.py 를 다시 실행하세요.")
    return {s: load_jsonl(pdir / f"{s}.jsonl") for s in SPLITS}, manifest


def training_template(tokenizer) -> str:
    """assistant 마스크용 {% generation %} 표시가 있는 학습용 chat template.

    TRL 이 아는 템플릿(Qwen3 등)이면 TRL 의 학습용 템플릿을 쓴다. SFTTrainer 도 assistant_only_loss=True 일 때
    같은 함수로 템플릿을 바꾸므로, 여기서 검사한 마스크와 학습 때 마스크가 같다.
    """
    from trl.chat_template_utils import get_training_chat_template, has_generation_markers, is_chat_template_stop_token_trained

    tmpl = get_training_chat_template(tokenizer)
    if tmpl is None:
        tmpl = tokenizer.chat_template
    if not has_generation_markers(tmpl):
        raise SystemExit(
            "이 모델의 chat template 은 TRL 의 assistant-only 마스킹을 지원하지 않습니다. "
            "TRL 이 지원하는 모델(trl/chat_templates 의 *_training.jinja)을 고르거나 학습용 템플릿을 직접 만들어야 합니다."
        )
    if not is_chat_template_stop_token_trained(tokenizer, chat_template=tmpl):
        raise SystemExit("학습용 템플릿이 답변 끝 토큰을 loss 에 포함하지 않습니다 - 모델이 멈추는 법을 배우지 못하므로 중단합니다.")
    return tmpl


def token_stats(tokenizer, tmpl: str, splits: dict, cfg: dict) -> dict:
    gen_kwargs = chat_template_kwargs(cfg)
    per = {}
    for s, rows in splits.items():
        full, prompt, answer = [], [], []
        for r in rows:
            enc = encode_chat(tokenizer, r["messages"], chat_template=tmpl, return_assistant_tokens_mask=True)
            full.append(len(enc["input_ids"]))
            answer.append(sum(enc["assistant_masks"]))
            # 평가 때 실제로 넣는 입력 (원래 템플릿 + 생성 프롬프트)
            p = encode_chat(tokenizer, r["messages"][:-1], add_generation_prompt=True, **gen_kwargs)
            prompt.append(len(p["input_ids"]))
        per[s] = {
            "n": len(rows),
            "full_max": max(full), "full_mean": round(statistics.mean(full), 1),
            "prompt_max": max(prompt), "prompt_min": min(prompt),
            "answer_max": max(answer), "answer_mean": round(statistics.mean(answer), 1),
        }
    need = max(v["full_max"] for k, v in per.items() if k in ("train", "validation"))
    cap = cfg["training"]["max_length_cap"]
    max_length = int(math.ceil((need + 16) / 64) * 64)
    return {"per_split": per, "needed": need, "cap": cap, "max_length": max_length, "fits": max_length <= cap}


def mask_check(tokenizer, tmpl: str, rows: list[dict]) -> dict:
    """토크나이저 단계 마스크 검사: 마스크된(=학습할) 토큰이 정답 + 끝 토큰뿐인지."""
    failures, example = [], None
    for r in rows:
        enc = encode_chat(tokenizer, r["messages"], chat_template=tmpl, return_assistant_tokens_mask=True)
        ids, mask = enc["input_ids"], enc["assistant_masks"]
        learned = tokenizer.decode([t for t, m in zip(ids, mask) if m])
        ignored = tokenizer.decode([t for t, m in zip(ids, mask) if not m])
        sys_text, user_text = r["messages"][0]["content"], r["messages"][1]["content"]
        ok = (
            r["reference"] in learned
            and sys_text not in learned and user_text not in learned
            and sys_text in ignored and user_text in ignored
            and 0 < sum(mask) < len(ids)
        )
        if not ok:
            failures.append(r["id"])
        if example is None:
            example = {"id": r["id"], "learned_text": learned, "learned_tokens": sum(mask), "total_tokens": len(ids)}
    return {"checked": len(rows), "failures": failures, "example": example}


def label_check(trainer, tokenizer, rows: list[dict], stats: dict) -> dict:
    """SFTTrainer 가 실제로 만든 배치의 labels 검사 (system·user·padding 이 -100 인지, 잘림이 없는지)."""
    ds = trainer.train_dataset
    by_len = {}
    failures = []
    n = min(len(ds), LABEL_CHECK_SAMPLES)
    for i in range(n):
        batch = trainer.data_collator([ds[i]])
        ids, labels = batch["input_ids"][0].tolist(), batch["labels"][0].tolist()
        learned = tokenizer.decode([t for t, l in zip(ids, labels) if l != -100])
        r = rows[i]
        if not (r["reference"] in learned and r["messages"][0]["content"] not in learned
                and r["messages"][1]["content"] not in learned):
            failures.append(f"{r['id']}: 학습 대상 토큰이 정답과 다릅니다")
        by_len[i] = len(ids)
    if len(ds) >= 2:
        # 길이가 다른 두 샘플을 한 배치로 묶어 padding 위치가 학습에서 빠지는지 확인
        batch = trainer.data_collator([ds[0], ds[1]])
        attn = batch["attention_mask"]
        pad_labels = batch["labels"][attn == 0]
        if pad_labels.numel() and (pad_labels != -100).any():
            failures.append("padding 토큰에 loss 가 걸립니다")
    if max(by_len.values(), default=0) > stats["max_length"]:
        failures.append("max_length 를 넘는 샘플이 있습니다")
    total = sum(len(x["input_ids"]) for x in ds)
    return {"checked": n, "failures": failures, "dataset_tokens": total}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config")
    ap.add_argument("--output-root")
    ap.add_argument("--smoke", action="store_true", help="smoke_max_steps 만 학습")
    ap.add_argument("--check-only", action="store_true", help="길이·마스크 검사만 (GPU 불필요)")
    ap.add_argument("--fresh", action="store_true", help="기존 체크포인트가 있으면 이어서 하지 않고 중단")
    ap.add_argument("--allow-cpu", action="store_true", help=argparse.SUPPRESS)  # 로컬 코드 검증용 (작은 무작위 모델)
    args = ap.parse_args(argv)

    cfg = load_config(args.config)
    ctx = load_context(cfg)
    splits, manifest = load_splits(cfg, ctx)
    output_root = Path(args.output_root or cfg["output"]["colab_drive_root"])
    run_dir = output_root / cfg["experiment_name"] / ("smoke" if args.smoke else "full")
    run_dir.mkdir(parents=True, exist_ok=True)
    info_path = run_dir / "run_info.json"
    if info_path.exists() and not args.check_only:
        prev_status = json.loads(info_path.read_text(encoding="utf-8")).get("status")
        if prev_status == "completed":
            print(f"{run_dir} 는 이미 학습이 끝난 실행입니다. 다시 학습하려면 configs/experiment.json 의 experiment_name 을 바꾸세요.")
            return 0

    model_info = resolve_revision(cfg, run_dir.parent / "model.json")
    revision = model_info["revision"]
    print(f"모델: {model_info['id']} @ {revision} (license: {model_info.get('license')})")
    tokenizer = load_tokenizer(cfg, revision)
    tmpl = training_template(tokenizer)
    (run_dir / "training_chat_template.jinja").write_text(tmpl, encoding="utf-8")

    stats = token_stats(tokenizer, tmpl, splits, cfg)
    write_json(run_dir / "token_stats.json", stats)
    for s, v in stats["per_split"].items():
        print(f"  {s:<10} n={v['n']:<3} 전체 최대 {v['full_max']} / 평균 {v['full_mean']} · 프롬프트 최대 {v['prompt_max']} · 정답 최대 {v['answer_max']}")
    print(f"max_length = {stats['max_length']} (필요 {stats['needed']}, 상한 {stats['cap']})")
    if not stats["fits"]:
        raise SystemExit(
            "가장 긴 샘플이 max_length_cap 을 넘습니다. 답변 근거가 사라지므로 자르지 않습니다. "
            "README 의 'OOM·길이 초과' 절차대로 GPU 메모리를 확인하고 상한을 올리거나 문맥 단축을 설계하세요."
        )

    mc = mask_check(tokenizer, tmpl, splits["train"] + splits["validation"])
    write_json(run_dir / "mask_check.json", mc)
    print(f"마스크 검사(토크나이저): {mc['checked']}건, 실패 {len(mc['failures'])}건")
    if mc["example"]:
        print("  예시 - 학습 대상 텍스트:\n" + "\n".join("    | " + l for l in mc["example"]["learned_text"].split("\n")))
    if mc["failures"]:
        raise SystemExit(f"마스크 검사 실패: {mc['failures']}")
    if args.check_only:
        print(f"--check-only: 검사 결과를 {run_dir} 에 저장했습니다.")
        return 0

    import torch
    from datasets import Dataset
    from peft import LoraConfig, prepare_model_for_kbit_training
    from transformers import set_seed
    from trl import SFTConfig, SFTTrainer

    gpu = gpu_info() if args.allow_cpu else require_gpu()
    print(f"GPU: {gpu}")
    set_seed(cfg["seed"])

    ckpt_dir = run_dir / "checkpoints"
    existing = sorted(ckpt_dir.glob("checkpoint-*")) if ckpt_dir.exists() else []
    if existing and args.fresh:
        raise SystemExit(f"{ckpt_dir} 에 체크포인트가 있습니다. 새로 시작하려면 폴더를 직접 지우거나 experiment_name 을 바꾸세요.")
    resume = bool(existing)

    t = cfg["training"]
    run_info = {
        "status": "running",
        "started_at": now(),
        "mode": "smoke" if args.smoke else "full",
        "resumed_from": existing[-1].name if resume else None,
        "seed": cfg["seed"],
        "model": model_info,
        "data": {
            "curated_sha256": manifest["curated_sha256"],
            "context_sha256": manifest["context_sha256"],
            "system_prompt_sha256": manifest["system_prompt_sha256"],
            "split_files_sha256": manifest["files"],
            "counts": manifest["counts"],
        },
        "code_version": code_version(),
        "libraries": lib_versions(),
        "gpu": gpu,
        "config": {k: v for k, v in cfg.items() if not k.startswith("_")},
        "max_length": stats["max_length"],
        "attention": "sdpa-repeat-kv" if gpu.get("available") and not gpu.get("bf16") else "default",
    }
    write_json(info_path, run_info)

    model, compute_dtype = load_model(cfg, revision, gpu)
    targets = cfg["lora"]["target_modules"]
    available = linear_module_names(model)
    missing = [m for m in targets if m not in available]
    if missing:
        raise SystemExit(f"LoRA 대상 모듈 {missing} 이 이 모델에 없습니다. 모델의 Linear 모듈: {sorted(available)}")
    if cfg["quantization"].get("load_in_4bit"):
        model = prepare_model_for_kbit_training(model, use_gradient_checkpointing=t["gradient_checkpointing"])

    lora = LoraConfig(
        r=cfg["lora"]["r"], lora_alpha=cfg["lora"]["alpha"], lora_dropout=cfg["lora"]["dropout"],
        target_modules=targets, bias="none", task_type="CAUSAL_LM",
    )
    use_bf16 = bool(gpu.get("bf16"))
    use_fp16 = bool(gpu.get("available")) and not use_bf16
    sft_args = SFTConfig(
        output_dir=str(ckpt_dir),
        seed=cfg["seed"],
        data_seed=cfg["seed"],
        per_device_train_batch_size=t["per_device_train_batch_size"],
        per_device_eval_batch_size=t["per_device_eval_batch_size"],
        gradient_accumulation_steps=t["gradient_accumulation_steps"],
        learning_rate=t["learning_rate"],
        num_train_epochs=t["num_train_epochs"],
        max_steps=t["smoke_max_steps"] if args.smoke else -1,
        lr_scheduler_type=t["lr_scheduler_type"],
        warmup_steps=t["warmup_steps"],
        weight_decay=t["weight_decay"],
        max_grad_norm=t["max_grad_norm"],
        optim=t["optim"],
        gradient_checkpointing=t["gradient_checkpointing"],
        logging_steps=t["logging_steps"],
        eval_strategy="no" if args.smoke else t["eval_strategy"],
        save_strategy=t["save_strategy"],
        save_steps=t["save_steps"],
        save_total_limit=t["save_total_limit"],
        bf16=use_bf16,
        fp16=use_fp16,
        report_to="none",
        max_length=stats["max_length"],
        assistant_only_loss=True,
        packing=False,
        dataset_num_proc=1,
    )
    train_ds = Dataset.from_list([{"messages": r["messages"]} for r in splits["train"]])
    eval_ds = Dataset.from_list([{"messages": r["messages"]} for r in splits["validation"]])
    trainer = SFTTrainer(
        model=model, args=sft_args, train_dataset=train_ds, eval_dataset=eval_ds,
        processing_class=tokenizer, peft_config=lora,
    )
    if use_fp16:
        # TRL 은 4-bit 모델의 LoRA 가중치를 bf16 으로 바꾸는데, fp16 GradScaler 는 bf16 기울기를 unscale 하지 못한다
        # ("_amp_foreach_non_finite_check_and_unscale_cuda" not implemented for 'BFloat16'). bf16 이 없는 GPU(T4)에서는
        # 학습 대상 파라미터만 fp32 로 둔다 (fp16 혼합 정밀도 학습의 표준 방식, LoRA 라 메모리 부담이 작다).
        for prm in trainer.model.parameters():
            if prm.requires_grad and prm.dtype != torch.float32:
                prm.data = prm.data.float()
    trainable_dtypes = sorted({str(prm.dtype) for prm in trainer.model.parameters() if prm.requires_grad})
    print(f"학습 파라미터 dtype: {trainable_dtypes} · 혼합 정밀도: {'bf16' if use_bf16 else 'fp16' if use_fp16 else '없음(CPU)'}")
    lc = label_check(trainer, tokenizer, splits["train"], stats)
    print(f"라벨 검사(실제 배치): {lc['checked']}건, 실패 {lc['failures'] or '없음'}")
    if lc["failures"]:
        raise SystemExit("라벨 검사 실패 - 학습하지 않습니다.")
    trainable, total = 0, 0
    for p in trainer.model.parameters():
        total += p.numel()
        trainable += p.numel() if p.requires_grad else 0
    print(f"학습 파라미터: {trainable:,} / {total:,} ({100 * trainable / total:.3f}%)")

    if gpu.get("available"):
        torch.cuda.reset_peak_memory_stats()
    t0 = time.time()
    try:
        with no_math_attention(gpu):
            trainer.train(resume_from_checkpoint=True if resume else None)
    except RuntimeError as e:
        if "No available kernel" not in str(e):
            raise
        run_info.update(status="attention_kernel_unavailable", failed_at=now(), error=str(e)[:2000])
        write_json(info_path, run_info)
        raise SystemExit(
            "메모리 절약 어텐션 커널을 쓸 수 없어 학습을 멈췄습니다 (그대로 두면 약 9천 토큰 문맥에서 OOM). "
            "위 오류 메시지 전체를 공유해 주세요."
        )
    except torch.cuda.OutOfMemoryError:
        run_info.update(status="oom", failed_at=now(), memory_summary=torch.cuda.memory_summary(abbreviated=True))
        write_json(info_path, run_info)
        print(torch.cuda.memory_summary(abbreviated=True))
        raise SystemExit(
            "GPU 메모리 부족(OOM). README 의 'OOM·길이 초과' 절차를 따르세요: "
            "1) 위 메모리 사용량 확인 2) batch·max_length 확인 3) 문맥 길이 검토 4) 더 작은 모델 검토"
        )
    elapsed = time.time() - t0
    with no_math_attention(gpu):
        eval_metrics = trainer.evaluate() if len(eval_ds) else {}

    adapter_dir = run_dir / "adapter"
    trainer.save_model(str(adapter_dir))
    tokenizer.save_pretrained(str(adapter_dir))
    write_json(run_dir / "log_history.json", trainer.state.log_history)
    losses = [x["loss"] for x in trainer.state.log_history if "loss" in x]
    run_info.update(
        status="completed",
        finished_at=now(),
        train_seconds=round(elapsed, 1),
        global_step=trainer.state.global_step,
        epochs=trainer.state.epoch,
        final_train_loss=losses[-1] if losses else None,
        nan_loss=any(isinstance(x, float) and math.isnan(x) for x in losses),
        eval_metrics=eval_metrics,
        trainable_params=trainable,
        trainable_dtypes=trainable_dtypes,
        dataset_tokens=lc["dataset_tokens"],
        peak_vram_gib=round(torch.cuda.max_memory_allocated() / 1024**3, 2) if gpu.get("available") else None,
        peak_vram_reserved_gib=round(torch.cuda.max_memory_reserved() / 1024**3, 2) if gpu.get("available") else None,
        adapter_dir=str(adapter_dir),
    )
    write_json(info_path, run_info)
    print(f"완료: {elapsed / 60:.1f}분, step {trainer.state.global_step}, peak VRAM {run_info['peak_vram_gib']} GiB")
    print(f"eval: {eval_metrics}")
    if run_info["nan_loss"]:
        print("WARN loss 에 NaN 이 있습니다. fp16 불안정일 수 있으니 learning_rate 를 낮추거나 bf16 지원 GPU 에서 다시 확인하세요.")
    print(f"저장: {run_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
