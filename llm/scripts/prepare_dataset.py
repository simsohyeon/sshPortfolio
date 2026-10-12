#!/usr/bin/env python3
"""검토 완료(review_status == "reviewed") 항목만 학습·검증·평가 데이터로 변환한다 (GPU 불필요).

- 먼저 validate_dataset 의 원본 검사를 돌리고, 오류가 있으면 중단한다.
- 검토 완료 항목이 data.min_reviewed 보다 적으면 분할하지 않고, 검토해야 할 항목을 안내한 뒤 종료 코드 2 로 끝난다.
- 같은 group_id 는 같은 분할에 넣는다. 범주가 분할마다 고르게 퍼지도록 범주별로 섞은 뒤 비율이 가장 모자란 분할에 배정한다.
- 출력: llm/data/processed/{train,validation,test}.jsonl + manifest.json (seed, 그룹별 배정, 해시)
  각 줄: {"id","group_id","category","question","reference","source_refs","expected_project_ids","messages"}
  messages 는 system(행동 규칙+이력 문맥)/user(질문)/assistant(검토한 답변). 메타데이터는 messages 밖에 둔다.

사용: python3 llm/scripts/prepare_dataset.py [--config ...]
"""
from __future__ import annotations

import argparse
import random
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import (  # noqa: E402
    build_messages, code_version, load_config, load_context, repo_path, sha256_file, write_json, write_jsonl,
)
import validate_dataset  # noqa: E402

SPLITS = ("train", "validation", "test")


def group_split(items: list[dict], ratios: dict, seed: int) -> dict[str, str]:
    """group_id -> split. 결정적(같은 seed·같은 데이터면 같은 결과)."""
    groups: dict[str, list[dict]] = defaultdict(list)
    for it in items:
        groups[it["group_id"]].append(it)
    by_cat: dict[str, list[str]] = defaultdict(list)
    for g, members in sorted(groups.items()):
        cat = Counter(m["category"] for m in members).most_common(1)[0][0]
        by_cat[cat].append(g)
    rng = random.Random(seed)
    order: list[str] = []
    for cat in sorted(by_cat):
        gs = by_cat[cat]
        rng.shuffle(gs)
        order.extend(gs)
    # 범주별로 묶인 순서대로 배정하면 각 범주가 분할마다 비율에 가깝게 퍼진다
    counts = {s: 0 for s in SPLITS}
    assign: dict[str, str] = {}
    for g in order:
        size = len(groups[g])
        total = sum(counts.values()) + size
        # 이 그룹을 넣었을 때 목표 대비 가장 모자란 분할
        best = max(SPLITS, key=lambda s: (ratios[s] * total - counts[s], -SPLITS.index(s)))
        assign[g] = best
        counts[best] += size
    return assign


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config")
    args = ap.parse_args(argv)
    cfg = load_config(args.config)
    ctx = load_context(cfg)

    rep = validate_dataset.Report()
    items = validate_dataset.validate_curated(cfg, ctx, rep)
    if rep.errors:
        for e in rep.errors:
            print(f"ERROR {e}")
        print("원본 데이터 오류가 있어 분할하지 않습니다. validate_dataset.py 결과를 먼저 해결하세요.")
        return 1

    reviewed = [i for i in items if i["review_status"] == "reviewed"]
    need = cfg["data"]["min_reviewed"]
    if len(reviewed) < need:
        drafts = [i for i in items if i["review_status"] == "draft"]
        print(f"검토 완료 항목이 {len(reviewed)}건으로, 학습 시작 기준({need}건)보다 적어 분할하지 않습니다.")
        print("llm/data/README.md 의 검토 절차대로 아래 항목을 원문과 대조하고 review_status 를 reviewed 로 바꿔 주세요.")
        by_cat = defaultdict(list)
        for d in drafts:
            by_cat[d["category"]].append(d["id"])
        for c in cfg["data"]["categories"]:
            if by_cat.get(c):
                print(f"  {c}: {', '.join(by_cat[c])}")
        return 2

    seed = cfg["seed"]
    ratios = cfg["data"]["split_ratios"]
    assign = group_split(reviewed, ratios, seed)
    rows = {s: [] for s in SPLITS}
    for it in sorted(reviewed, key=lambda x: x["id"]):
        s = assign[it["group_id"]]
        rows[s].append({
            "id": it["id"],
            "group_id": it["group_id"],
            "category": it["category"],
            "question": it["question"],
            "reference": it["answer"],
            "source_refs": it["source_refs"],
            "expected_project_ids": it["expected_project_ids"],
            "messages": build_messages(it["question"], ctx, it["answer"]),
        })
    for s in SPLITS:
        if not rows[s]:
            print(f"{s} 분할이 비었습니다. 검토 완료 데이터를 늘리거나 split_ratios 를 조정하세요.")
            return 1

    pdir = repo_path(cfg["data"]["processed_dir"])
    files = {}
    for s in SPLITS:
        write_jsonl(pdir / f"{s}.jsonl", rows[s])
        files[f"{s}.jsonl"] = sha256_file(pdir / f"{s}.jsonl")
    manifest = {
        "seed": seed,
        "split_ratios": ratios,
        "counts": {s: len(rows[s]) for s in SPLITS},
        "counts_by_category": {s: dict(Counter(r["category"] for r in rows[s])) for s in SPLITS},
        "group_assignment": dict(sorted(assign.items())),
        "excluded": {
            "draft": sorted(i["id"] for i in items if i["review_status"] == "draft"),
            "rejected": sorted(i["id"] for i in items if i["review_status"] == "rejected"),
        },
        "curated_sha256": sha256_file(repo_path(cfg["data"]["curated"])),
        "context_sha256": sha256_file(repo_path(cfg["data"]["context"])),
        "system_prompt_sha256": ctx["system_prompt_sha256"],
        "files": files,
        "code_version": code_version(),
    }
    write_json(pdir / "manifest.json", manifest)

    # 분할 결과 누수 검사
    rep2 = validate_dataset.Report()
    validate_dataset.validate_processed(cfg, ctx, rep2)
    for e in rep2.errors:
        print(f"ERROR {e}")
    print(f"분할 완료 (seed {seed}): " + ", ".join(f"{s} {len(rows[s])}" for s in SPLITS))
    for s in SPLITS:
        print(f"  {s}: {manifest['counts_by_category'][s]}")
    print(f"저장: {pdir}")
    return 1 if rep2.errors else 0


if __name__ == "__main__":
    sys.exit(main())
