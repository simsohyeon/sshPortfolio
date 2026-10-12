"""llm/ 실험 코드 공통 함수 (표준 라이브러리만 사용 - Mac 에서 GPU 라이브러리 없이 import 가능)."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

LLM_DIR = Path(__file__).resolve().parent
ROOT = LLM_DIR.parent
DEFAULT_CONFIG = LLM_DIR / "configs" / "experiment.json"

HANGUL_RE = re.compile(r"[가-힣]")


def load_config(path: str | Path | None = None) -> dict:
    path = Path(path) if path else DEFAULT_CONFIG
    with open(path, encoding="utf-8") as f:
        cfg = json.load(f)
    cfg["_config_path"] = str(path)
    return cfg


def repo_path(rel: str) -> Path:
    """설정 파일의 저장소 상대 경로를 절대 경로로 바꾼다."""
    p = Path(rel)
    return p if p.is_absolute() else ROOT / p


def read_jsonl(path: str | Path) -> list[tuple[int, dict | None, str | None]]:
    """(줄 번호, 객체 또는 None, 파싱 오류 또는 None) 목록. 빈 줄은 건너뛴다."""
    rows = []
    with open(path, encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            if not line.strip():
                continue
            try:
                rows.append((i, json.loads(line), None))
            except json.JSONDecodeError as e:
                rows.append((i, None, str(e)))
    return rows


def load_jsonl(path: str | Path) -> list[dict]:
    out = []
    for line_no, obj, err in read_jsonl(path):
        if err:
            raise ValueError(f"{path}:{line_no}: JSON 오류 - {err}")
        out.append(obj)
    return out


def write_jsonl(path: str | Path, rows: list[dict]) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def write_json(path: str | Path, obj) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: str | Path) -> str:
    return sha256_bytes(Path(path).read_bytes())


def load_context(cfg: dict) -> dict:
    path = repo_path(cfg["data"]["context"])
    if not path.exists():
        raise SystemExit(
            f"{path} 이 없습니다. 저장소 루트에서 `node llm/scripts/export-context.mjs` 를 먼저 실행하세요."
        )
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def is_foreign(question: str) -> bool:
    """api/src/index.js 와 같은 기준: 한글이 하나도 없으면 외국어 질문."""
    return bool(question) and not HANGUL_RE.search(question)


def build_messages(question: str, ctx: dict, answer: str | None = None) -> list[dict]:
    """운영 Worker 와 같은 입력을 만든다. 외국어 질문이면 index.js 처럼 시스템 프롬프트 끝과 질문 앞에 지시를 붙인다."""
    system = ctx["system_prompt"]
    user = question
    if is_foreign(question):
        system += ctx["foreign"]["extra_system"]
        user = ctx["foreign"]["question_prefix"] + question
    msgs = [{"role": "system", "content": system}, {"role": "user", "content": user}]
    if answer is not None:
        msgs.append({"role": "assistant", "content": answer})
    return msgs


# 코드 해시에서 뺄 경로 (생성물·결과·캐시)
TREE_EXCLUDE = ("data/generated", "data/processed", "dist", "runs", "VERSION.json", "__pycache__", ".ipynb_checkpoints")


def tree_sha256(base: Path = LLM_DIR) -> str:
    """llm/ 아래 소스·데이터 파일 내용의 해시. 커밋 전 파일(ZIP 업로드)도 같은 내용이면 같은 값이 나온다."""
    h = hashlib.sha256()
    for p in sorted(base.rglob("*")):
        rel = p.relative_to(base).as_posix()
        if not p.is_file() or any(rel == x or rel.startswith(x + "/") or f"/{x}/" in f"/{rel}" for x in TREE_EXCLUDE):
            continue
        h.update(rel.encode() + b"\0" + p.read_bytes() + b"\0")
    return h.hexdigest()


def code_version() -> dict:
    """llm/ 내용 해시 + git 커밋 SHA·미커밋 변경 여부. ZIP 으로 올린 경우 package_for_colab.py 가 남긴 VERSION.json 도 함께 남긴다."""
    version_file = LLM_DIR / "VERSION.json"
    info: dict = {}
    try:
        sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
        status = subprocess.run(
            ["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True, check=True
        ).stdout
        diff = subprocess.run(["git", "diff", "HEAD"], cwd=ROOT, capture_output=True, check=True).stdout
        info = {"source": "git", "commit": sha, "dirty": bool(status.strip()), "diff_sha256": sha256_bytes(diff)}
    except (OSError, subprocess.CalledProcessError):
        pass
    if version_file.exists():
        with open(version_file, encoding="utf-8") as f:
            packaged = json.load(f)
        if not info:
            # ZIP 으로 올린 경우: 만들 때의 git 정보 + 지금 llm/ 내용 해시 (둘이 다르면 업로드 뒤 파일이 바뀐 것)
            info = {"source": "zip", "packaged": packaged}
        else:
            info["packaged"] = packaged
    info = info or {"source": "unknown"}
    info["llm_tree_sha256"] = tree_sha256()
    packaged_tree = info.get("packaged", {}).get("llm_tree_sha256")
    if packaged_tree:
        info["changed_since_packaged"] = packaged_tree != info["llm_tree_sha256"]
    return info
