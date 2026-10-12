#!/usr/bin/env python3
"""학습 전후 비교 평가.

하위 명령
  generate  (Colab GPU) 같은 기반 모델로 답변을 생성한다. --adapter 를 주면 학습 후, 없으면 학습 전.
            같은 문맥·질문·생성 설정(기본 greedy)을 쓰고, 지연 시간·토큰 수·peak VRAM 을 기록한다.
  compare   (Mac 가능) 두 generate 결과를 나란히 놓고 형식 검사 집계와 사람 평가 양식을 만든다.

사용 예 (저장소 루트)
  python llm/evaluate.py generate --run-dir <Drive>/<experiment>/full --tag base --limit 3
  python llm/evaluate.py generate --run-dir <Drive>/<experiment>/full --tag base
  python llm/evaluate.py generate --run-dir <Drive>/<experiment>/full --tag tuned --adapter <Drive>/<experiment>/full/adapter
  python llm/evaluate.py compare --before <run>/eval/test-base.jsonl --after <run>/eval/test-tuned.jsonl

주의: 형식 검사는 관련:/다음: 줄, 마크다운, 3인칭 같은 '형식'만 본다. 사실 정확성은 compare 가 만드는
보고서의 사람 평가 칸을 원문(source_refs)과 대조해 채워야 하며, 자동 검사 통과를 정확성 근거로 쓰지 않는다.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from checks import check_answer, summarize  # noqa: E402
from common import code_version, load_config, load_context, load_jsonl, repo_path, write_json, write_jsonl  # noqa: E402

THINK_RE = re.compile(r"<think>.*?</think>\s*", re.S)

CHECK_LABELS = {
    "non_empty": "답변이 비어 있지 않음",
    "meta_once": "관련:/다음: 줄 중복 없음",
    "meta_at_end": "관련:/다음: 줄이 답변 끝에 있음",
    "related_ids_valid": "관련: ID 유효·3개 이하·중복 없음",
    "related_matches_mentions": "관련: ID = 본문에 언급한 프로젝트",
    "related_matches_expected": "관련: ID = 정답의 expected_project_ids",
    "next_two_questions": "다음: 후속 질문 2개",
    "refusal_no_meta": "무관 질문 거절 시 관련:/다음: 생략",
    "no_markdown": "마크다운 없음",
    "no_id_leak": "[id: ...] 표기 노출 없음",
    "no_phone": "전화번호 노출 없음",
    "language_match": "질문 언어로 답변",
    "third_person_honorific": "3인칭 '심소현 님' 호칭",
    "no_first_person": "1인칭(저는/제가) 없음",
    "unknown_phrase": "모름·부분 답변에 '포트폴리오에 없' 표시",
}

MANUAL_ITEMS = [
    "사실 정확성 (경력·기간·기술·수치가 원문과 일치)",
    "근거 없는 주장 없음",
    "모름 처리 적절",
    "부분 답변 구분",
    "프로젝트 연결 적절",
    "후속 질문이 자료로 답할 수 있음",
    "스타일 (3인칭·간결)",
    "지시 공격에 넘어가지 않음",
]


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# ───────────────────────── generate (GPU) ─────────────────────────

def cmd_generate(args) -> int:
    import torch
    from modeling import chat_template_kwargs, gpu_info, lib_versions, load_model, load_tokenizer, require_gpu, resolve_revision

    cfg = load_config(args.config)
    ctx = load_context(cfg)
    run_dir = Path(args.run_dir)
    run_dir.mkdir(parents=True, exist_ok=True)
    out_dir = run_dir / "eval"
    suffix = f"-limit{args.limit}" if args.limit else ""
    out_path = Path(args.out) if args.out else out_dir / f"{args.split}-{args.tag}{suffix}.jsonl"
    if out_path.exists() and not args.overwrite:
        print(f"{out_path} 이 이미 있어 건너뜁니다 (다시 만들려면 --overwrite).")
        return 0

    rows = load_jsonl(repo_path(cfg["data"]["processed_dir"]) / f"{args.split}.jsonl")
    if args.limit:
        rows = rows[: args.limit]
    gpu = gpu_info() if args.allow_cpu else require_gpu()
    # 실험 폴더에 고정된 revision 을 쓴다 (학습 전후가 같은 기반 모델이어야 비교가 성립)
    model_info = resolve_revision(cfg, run_dir.parent / "model.json")
    revision = model_info["revision"]
    tokenizer = load_tokenizer(cfg, revision)
    model, _ = load_model(cfg, revision, gpu)
    adapter = None
    if args.adapter:
        from peft import PeftModel
        adapter = str(Path(args.adapter))
        model = PeftModel.from_pretrained(model, adapter)
    model.eval()

    g = cfg["generation"]
    gen_kwargs = {
        "max_new_tokens": g["max_new_tokens"],
        "do_sample": g["do_sample"],
        "repetition_penalty": g["repetition_penalty"],
        "pad_token_id": tokenizer.pad_token_id,
    }
    if not g["do_sample"]:
        # 일부 모델은 generation_config 에 temperature/top_p 기본값이 있어 greedy 와 함께 경고가 난다
        gen_kwargs.update(temperature=None, top_p=None, top_k=None)
    tmpl_kwargs = chat_template_kwargs(cfg)
    device = next(model.parameters()).device
    if gpu.get("available"):
        torch.cuda.reset_peak_memory_stats()

    results = []
    for i, r in enumerate(rows, 1):
        msgs = r["messages"][:-1]  # system + user (정답 제외)
        enc = tokenizer.apply_chat_template(
            msgs, add_generation_prompt=True, tokenize=True, return_dict=True, return_tensors="pt", **tmpl_kwargs
        )
        input_ids = enc["input_ids"].to(device)
        attn = enc["attention_mask"].to(device)
        if gpu.get("available"):
            torch.cuda.synchronize()
        t0 = time.time()
        with torch.no_grad():
            out = model.generate(input_ids=input_ids, attention_mask=attn, **gen_kwargs)
        if gpu.get("available"):
            torch.cuda.synchronize()
        dt = time.time() - t0
        new = out[0, input_ids.shape[1]:]
        text = THINK_RE.sub("", tokenizer.decode(new, skip_special_tokens=True)).strip()
        res = check_answer(text, r["question"], r["category"], ctx["projects"], r["expected_project_ids"])
        results.append({
            "id": r["id"], "group_id": r["group_id"], "category": r["category"],
            "question": r["question"], "reference": r["reference"], "source_refs": r["source_refs"],
            "expected_project_ids": r["expected_project_ids"],
            "answer": text,
            "input_tokens": int(input_ids.shape[1]), "output_tokens": int(new.shape[0]),
            "hit_max_new_tokens": int(new.shape[0]) >= g["max_new_tokens"],
            "latency_s": round(dt, 2),
            **res,
        })
        print(f"[{i}/{len(rows)}] {r['id']} {dt:.1f}s {new.shape[0]}tok")
        if args.show:
            print("  Q:", r["question"])
            print("  A:", text.replace("\n", "\n     "))

    write_jsonl(out_path, results)
    meta = {
        "created_at": now(),
        "tag": args.tag,
        "split": args.split,
        "limit": args.limit,
        "model": model_info,
        "adapter": adapter,
        "generation": gen_kwargs | {"chat_template_kwargs": tmpl_kwargs},
        "gpu": gpu,
        "peak_vram_gib": round(torch.cuda.max_memory_allocated() / 1024**3, 2) if gpu.get("available") else None,
        "libraries": lib_versions(),
        "code_version": code_version(),
        "system_prompt_sha256": ctx["system_prompt_sha256"],
    }
    write_json(out_path.with_suffix(".meta.json"), meta)
    summ = summarize(results)
    print(f"저장: {out_path}")
    for k, (ok, n) in summ.items():
        print(f"  {CHECK_LABELS.get(k, k)}: {ok}/{n}")
    return 0


# ───────────────────────── compare (CPU) ─────────────────────────

def _fmt_answer(text: str) -> str:
    return "\n".join("> " + l if l.strip() else ">" for l in (text or "(빈 답변)").split("\n"))


def _failed(r: dict) -> list[str]:
    return [k for k, v in r["checks"].items() if v is False]


def cmd_compare(args) -> int:
    before_path, after_path = Path(args.before), Path(args.after)
    before = {r["id"]: r for r in load_jsonl(before_path)}
    after = {r["id"]: r for r in load_jsonl(after_path)}
    meta_b = _read_meta(before_path)
    meta_a = _read_meta(after_path)
    warnings = []
    if set(before) != set(after):
        warnings.append(f"두 결과의 질문 집합이 다릅니다 (before {len(before)}, after {len(after)}). 공통 질문만 비교합니다.")
    ids = [i for i in before if i in after]
    if meta_b and meta_a:
        if meta_b["model"].get("revision") != meta_a["model"].get("revision"):
            warnings.append("학습 전후의 기반 모델 revision 이 다릅니다 - 비교가 성립하지 않습니다.")
        if meta_b.get("generation") != meta_a.get("generation"):
            warnings.append("생성 설정이 다릅니다 - 같은 설정으로 다시 생성하세요.")
        if meta_b.get("system_prompt_sha256") != meta_a.get("system_prompt_sha256"):
            warnings.append("시스템 프롬프트(이력 문맥)가 다릅니다.")
    else:
        warnings.append("meta.json 이 없어 모델·생성 설정 동일성을 확인하지 못했습니다.")

    sb = summarize([before[i] for i in ids])
    sa = summarize([after[i] for i in ids])
    improved, worsened, same = [], [], []
    for i in ids:
        fb, fa = set(_failed(before[i])), set(_failed(after[i]))
        if len(fa) < len(fb):
            improved.append(i)
        elif len(fa) > len(fb):
            worsened.append(i)
        else:
            same.append(i)

    def lat(rows):
        xs = [r["latency_s"] for r in rows]
        return (round(sum(xs) / len(xs), 2), max(xs)) if xs else (None, None)

    lb, la = lat([before[i] for i in ids]), lat([after[i] for i in ids])
    cats = sorted({before[i]["category"] for i in ids})

    L = []
    L.append("# 학습 전후 비교 보고서 (자동 생성 초안)")
    L.append("")
    L.append(f"- 생성: {now()}")
    L.append(f"- 학습 전: `{before_path}`")
    L.append(f"- 학습 후: `{after_path}`")
    L.append(f"- 평가셋 크기: {len(ids)}건 (범주: {', '.join(cats)})")
    if meta_a:
        L.append(f"- 기반 모델: {meta_a['model'].get('id')} @ {meta_a['model'].get('revision')}")
        L.append(f"- 어댑터: {meta_a.get('adapter')}")
        L.append(f"- 생성 설정: `{json.dumps(meta_a.get('generation'), ensure_ascii=False)}`")
        L.append(f"- 측정 환경: GPU {meta_a.get('gpu', {}).get('name')} · {json.dumps(meta_a.get('libraries'), ensure_ascii=False)}")
        L.append(f"- peak VRAM(생성): 학습 전 {meta_b.get('peak_vram_gib') if meta_b else '?'} GiB / 학습 후 {meta_a.get('peak_vram_gib')} GiB")
    L.append(f"- 평균 지연(초): 학습 전 {lb[0]} (최대 {lb[1]}) / 학습 후 {la[0]} (최대 {la[1]})")
    for w in warnings:
        L.append(f"- ⚠️ {w}")
    L.append("")
    L.append(f"> 표본이 {len(ids)}건뿐이라 아래 수치는 이 평가셋에서의 관찰일 뿐, 일반적인 성능으로 해석하지 않습니다.")
    L.append("> 자동 검사는 형식만 봅니다. 내용 정확성은 아래 '사람 평가' 칸을 원문과 대조해 채워야 확인됩니다.")
    L.append("")
    L.append("## 1. 자동 형식 검사 (통과 / 해당 건수)")
    L.append("")
    L.append("| 항목 | 학습 전 | 학습 후 |")
    L.append("| --- | --- | --- |")
    for k in CHECK_LABELS:
        if k in sb or k in sa:
            b, a = sb.get(k, (0, 0)), sa.get(k, (0, 0))
            L.append(f"| {CHECK_LABELS[k]} | {b[0]}/{b[1]} | {a[0]}/{a[1]} |")
    hit_b = sum(before[i]["hit_max_new_tokens"] for i in ids)
    hit_a = sum(after[i]["hit_max_new_tokens"] for i in ids)
    L.append(f"| max_new_tokens 도달(답변 잘림 가능, 낮을수록 좋음) | {hit_b}/{len(ids)} | {hit_a}/{len(ids)} |")
    L.append("")
    L.append("## 2. 자동 검사 기준 변화")
    L.append("")
    L.append(f"- 실패 항목이 줄어든 질문 ({len(improved)}건): {', '.join(improved) or '없음'}")
    L.append(f"- 실패 항목이 늘어난 질문 ({len(worsened)}건): {', '.join(worsened) or '없음'}")
    L.append(f"- 변화 없음 ({len(same)}건)")
    L.append("")
    L.append("## 3. 사람 평가 요약 (직접 채우기)")
    L.append("")
    L.append("| 항목 | 학습 전 성공 / 분모 | 학습 후 성공 / 분모 | 메모 |")
    L.append("| --- | --- | --- | --- |")
    for m in MANUAL_ITEMS:
        L.append(f"| {m} | / | / | |")
    L.append("")
    L.append("## 4. 개선·악화 사례와 실패 원인 추정 (직접 작성)")
    L.append("")
    L.append("- 개선된 사례:")
    L.append("- 악화된 사례:")
    L.append("- 실패 원인 추정 (데이터 부족·범주 편중·문맥 길이·생성 설정·과적합 등):")
    L.append("")
    L.append("## 5. 질문별 비교")
    for i in ids:
        b, a = before[i], after[i]
        L.append("")
        L.append(f"### {i} · {b['category']}")
        L.append("")
        L.append(f"**질문**: {b['question']}")
        L.append("")
        L.append("**근거 (source_refs)**:")
        for s in b["source_refs"]:
            L.append(f"- `{s}`")
        L.append("")
        L.append("**검토한 모범 답변**:")
        L.append("")
        L.append(_fmt_answer(b["reference"]))
        L.append("")
        L.append(f"**학습 전** ({b['latency_s']}s, {b['output_tokens']}tok) · 형식 실패: {', '.join(_failed(b)) or '없음'}")
        L.append("")
        L.append(_fmt_answer(b["answer"]))
        L.append("")
        L.append(f"**학습 후** ({a['latency_s']}s, {a['output_tokens']}tok) · 형식 실패: {', '.join(_failed(a)) or '없음'}")
        L.append("")
        L.append(_fmt_answer(a["answer"]))
        L.append("")
        L.append("| 사람 평가 | 학습 전 | 학습 후 |")
        L.append("| --- | --- | --- |")
        for m in MANUAL_ITEMS:
            L.append(f"| {m} | ☐ | ☐ |")
        L.append("")
        L.append("메모:")
    L.append("")
    L.append("## 6. 미검증 항목")
    L.append("")
    L.append("- 사람 평가 칸을 채우기 전까지 내용 정확성은 미검증입니다.")
    L.append("- 이 평가셋 밖의 질문, 여러 턴 대화, 실제 방문자 질문 분포에서의 동작은 측정하지 않았습니다.")
    L.append("- 운영 서버(Worker) 연결·스트리밍·동시 요청 환경의 지연과 비용은 측정하지 않았습니다.")
    L.append("")

    out_dir = Path(args.out_dir) if args.out_dir else after_path.parent
    stem = f"compare-{before_path.stem}-vs-{after_path.stem}"
    out_md = out_dir / f"{stem}.md"
    out_md.parent.mkdir(parents=True, exist_ok=True)
    out_md.write_text("\n".join(L), encoding="utf-8")
    write_json(out_dir / f"{stem}.json", {
        "n": len(ids),
        "before": {k: list(v) for k, v in sb.items()},
        "after": {k: list(v) for k, v in sa.items()},
        "improved": improved, "worsened": worsened, "unchanged": same,
        "latency_mean_s": {"before": lb[0], "after": la[0]},
        "warnings": warnings,
    })
    print(f"저장: {out_md}")
    for w in warnings:
        print(f"WARN {w}")
    return 0


def _read_meta(path: Path) -> dict | None:
    m = path.with_suffix(".meta.json")
    return json.loads(m.read_text(encoding="utf-8")) if m.exists() else None


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("generate", help="답변 생성 (GPU)")
    g.add_argument("--config")
    g.add_argument("--run-dir", required=True, help="train.py 결과 폴더 (상위 폴더 model.json 의 revision 을 씀)")
    g.add_argument("--tag", required=True, help="결과 이름 (예: base, tuned)")
    g.add_argument("--adapter", help="LoRA 어댑터 폴더. 없으면 학습 전 기반 모델")
    g.add_argument("--split", default="test", choices=["train", "validation", "test"])
    g.add_argument("--limit", type=int, help="앞에서 N개만")
    g.add_argument("--out")
    g.add_argument("--overwrite", action="store_true")
    g.add_argument("--show", action="store_true", help="답변을 화면에 출력")
    g.add_argument("--allow-cpu", action="store_true", help=argparse.SUPPRESS)
    c = sub.add_parser("compare", help="학습 전후 비교 보고서 (CPU)")
    c.add_argument("--before", required=True)
    c.add_argument("--after", required=True)
    c.add_argument("--out-dir")
    args = ap.parse_args(argv)
    return cmd_generate(args) if args.cmd == "generate" else cmd_compare(args)


if __name__ == "__main__":
    sys.exit(main())
