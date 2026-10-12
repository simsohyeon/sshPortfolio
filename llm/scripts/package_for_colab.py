#!/usr/bin/env python3
"""Colab 에 올릴 ZIP 을 만든다 (커밋·푸시하지 않은 파일도 그대로 담는다).

담는 것: llm/ (결과·캐시·이전 ZIP 제외) + 문맥 원본(src/data/resume.js, api/src/context.js, api/src/index.js)
함께 VERSION.json 을 넣어 Colab 의 실행 기록에 코드 버전(git 커밋, 미커밋 여부, llm/ 내용 해시)이 남게 한다.

사용: python3 llm/scripts/package_for_colab.py   →  llm/dist/sshportfolio-llm.zip
그 다음 Colab 노트북의 '코드 가져오기' 셀에서 이 ZIP 을 업로드한다.
"""
from __future__ import annotations

import json
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from common import LLM_DIR, ROOT, code_version, load_config, load_context  # noqa: E402

EXTRA = ["src/data/resume.js", "api/src/context.js", "api/src/index.js"]
# ZIP 에서 빼는 것: 결과물·캐시·이전 ZIP. data/generated 와 data/processed 는 Colab 에서 바로 쓰도록 넣는다.
ZIP_EXCLUDE = ("dist", "runs", "__pycache__", ".ipynb_checkpoints", "VERSION.json")


def main() -> int:
    cfg = load_config()
    ctx = load_context(cfg)  # context.json 이 없으면 여기서 안내 후 종료
    version = code_version()
    version["packaged_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    version["system_prompt_sha256"] = ctx["system_prompt_sha256"]
    version.pop("packaged", None)

    out = LLM_DIR / "dist" / "sshportfolio-llm.zip"
    out.parent.mkdir(parents=True, exist_ok=True)
    files = []
    for p in sorted(LLM_DIR.rglob("*")):
        rel = p.relative_to(LLM_DIR).as_posix()
        if p.is_file() and not any(rel == x or rel.startswith(x + "/") or f"/{x}/" in f"/{rel}" for x in ZIP_EXCLUDE):
            files.append(p)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for p in files:
            z.write(p, p.relative_to(ROOT).as_posix())
        for rel in EXTRA:
            z.write(ROOT / rel, rel)
        z.writestr("llm/VERSION.json", json.dumps(version, ensure_ascii=False, indent=2) + "\n")
    processed = (LLM_DIR / "data" / "processed" / "manifest.json").exists()
    print(f"저장: {out.relative_to(ROOT)} ({out.stat().st_size / 1024:.0f} KB, 파일 {len(files) + len(EXTRA) + 1}개)")
    print(f"코드 버전: commit {version.get('commit', '?')[:12]} dirty={version.get('dirty')} llm_tree {version['llm_tree_sha256'][:12]}")
    if not processed:
        print("참고: llm/data/processed 가 없습니다. 검토 후 prepare_dataset.py 를 실행하면 분할 데이터도 함께 담깁니다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
