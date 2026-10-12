#!/usr/bin/env python3
"""학습 데이터 검증 (GPU·외부 라이브러리 불필요, Mac 에서 실행).

검사 대상
  1) llm/data/curated.jsonl (검토용 원본)
     - JSONL 파싱, 필수 필드·타입, id 중복, 범주·검토 상태 값
     - source_refs 가 실제 resume.js 경로 / context.js 규칙 문구를 가리키는지
     - expected_project_ids 가 실제 프로젝트 id 인지
     - 모범 답변의 형식(관련:/다음:, 마크다운, 3인칭, 전화번호 등) - checks.py
     - 답변의 숫자가 출처 문장에 있는지 (만들어낸 수치 방지)
     - 스키마 예시 문구가 그대로 남아 있지 않은지, 같은 질문이 중복되지 않는지
  2) llm/data/processed/ (prepare_dataset.py 결과, 있으면)
     - 같은 group_id 가 두 분할에 들어갔는지, 질문·답변 복사본이 분할을 넘나드는지
     - 시스템 프롬프트가 현재 context.json 과 같은지, manifest 해시가 맞는지

사용: python3 llm/scripts/validate_dataset.py [--config llm/configs/experiment.json] [--strict]
  --strict: 경고도 실패로 처리
종료 코드: 0 통과, 1 오류
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checks import check_answer  # noqa: E402
from common import (  # noqa: E402
    build_messages, load_config, load_context, read_jsonl, repo_path, sha256_file,
)

REQUIRED = {
    "id": str,
    "group_id": str,
    "category": str,
    "question": str,
    "answer": str,
    "source_refs": list,
    "expected_project_ids": list,
    "review_status": str,
}
OPTIONAL = {"review_note": str, "reviewer": str}
REVIEW_STATUSES = {"draft", "reviewed", "rejected"}
ID_RE = re.compile(r"^[a-z0-9][a-z0-9_-]*$")
SCHEMA_PLACEHOLDERS = ["공개 자료를 대조한 모범 답변", "실제 데이터의 객체 경로"]
SPLITS = ("train", "validation", "test")
NEAR_DUP_RATIO = 0.9

RESUME_PREFIX = "src/data/resume.js:"
CONTEXT_PREFIX = "api/src/context.js:"
PATH_TOKEN_RE = re.compile(r'\s*(?:\.?([A-Za-z_][A-Za-z0-9_]*)|\[\s*(?:"([^"]*)"|(\d+)|([A-Za-z0-9_-]+))\s*\])')
NUMBER_RE = re.compile(r"\d+(?:[.,]\d+)*")


class Report:
    def __init__(self):
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, msg):
        self.errors.append(msg)

    def warn(self, msg):
        self.warnings.append(msg)


def parse_path(path: str) -> list[tuple[str, object]] | None:
    """'projects[polestar10].cases[1].results[0]' -> [('key','projects'),('id','polestar10'),...]"""
    tokens, pos = [], 0
    while pos < len(path):
        m = PATH_TOKEN_RE.match(path, pos)
        if not m or m.end() == pos:
            return None
        key, quoted, index, ident = m.groups()
        if key is not None:
            tokens.append(("key", key))
        elif quoted is not None:
            tokens.append(("key", quoted))
        elif index is not None:
            tokens.append(("index", int(index)))
        else:
            tokens.append(("id", ident))
        pos = m.end()
    return tokens


def resolve(resume: dict, tokens):
    node = resume
    canon = []  # 와일드카드 비교용 경로 (id 와 인덱스를 * 로)
    for kind, val in tokens:
        if kind == "key":
            if not isinstance(node, dict) or val not in node:
                return None, None
            node = node[val]
            canon.append(val)
        elif kind == "index":
            if not isinstance(node, list) or not (0 <= val < len(node)):
                return None, None
            node = node[val]
            canon.append("[*]")
        else:
            if not isinstance(node, list):
                return None, None
            match = [x for x in node if isinstance(x, dict) and x.get("id") == val]
            if not match:
                return None, None
            node = match[0]
            canon.append("[*]")
    pattern = ""
    for c in canon:
        pattern += c if c == "[*]" else (("." if pattern else "") + c)
    return node, pattern


def flatten(node) -> str:
    if isinstance(node, str):
        return node
    if isinstance(node, dict):
        return "\n".join(flatten(v) for v in node.values())
    if isinstance(node, list):
        return "\n".join(flatten(v) for v in node)
    return "" if node is None else str(node)


def check_ref(ref: str, ctx: dict, unconfirmed: set[str], rep: Report, where: str) -> str | None:
    """출처 하나를 확인하고 그 문장(숫자 대조용)을 돌려준다."""
    resume = ctx["resume"]
    if ref.startswith(RESUME_PREFIX):
        path = ref[len(RESUME_PREFIX):].strip()
        if path.startswith("contact.phone"):
            rep.error(f"{where}: 전화번호는 챗봇 문맥에서 제외된 값이라 출처로 쓸 수 없습니다 ({ref})")
            return None
        tokens = parse_path(path)
        if not tokens:
            rep.error(f"{where}: 출처 경로 형식 오류 ({ref})")
            return None
        node, pattern = resolve(resume, tokens)
        if node is None:
            rep.error(f"{where}: resume.js 에 없는 경로 ({ref})")
            return None
        # draft 사례의 판단 근거·회고는 챗봇 문맥에도 안 나간다 (context.js renderCase)
        m = re.match(r"projects\[\s*([A-Za-z0-9_-]+|\d+)\s*\]\.cases\[\s*(\d+)\s*\]\.(decision|retrospective)", path)
        if m:
            proj, _ = resolve(resume, parse_path(f"projects[{m.group(1)}]"))
            case = (proj or {}).get("cases", [])[int(m.group(2))]
            if case.get("draft"):
                rep.error(f"{where}: draft 사례의 {m.group(3)} 는 확정 사실이 아니라 출처로 쓸 수 없습니다 ({ref})")
        for u in unconfirmed:
            if pattern == u or pattern.startswith(u + "[*]") or pattern.startswith(u + "."):
                rep.warn(f"{where}: 🔴 초안 필드를 출처로 사용 - 사실 확인 필요 ({ref})")
                break
        return flatten(node)
    if ref.startswith(CONTEXT_PREFIX):
        rest = ref[len(CONTEXT_PREFIX):].strip()
        try:
            phrase = json.loads(rest)  # 문구 안의 따옴표는 \" 로 적는다
        except json.JSONDecodeError:
            phrase = None
        if not isinstance(phrase, str) or not phrase:
            rep.error(f'{where}: context.js 출처는 규칙 문구를 큰따옴표로 감싸 적습니다 (예: {CONTEXT_PREFIX} "전화번호 등"): {ref}')
            return None
        if phrase not in ctx["system_prompt"]:
            rep.error(f"{where}: 시스템 프롬프트에 없는 규칙 문구 ({ref})")
            return None
        return phrase
    rep.error(f"{where}: 출처는 '{RESUME_PREFIX} 경로' 또는 '{CONTEXT_PREFIX} \"규칙 문구\"' 형식이어야 합니다 ({ref})")
    return None


def normalize_q(q: str) -> str:
    q = unicodedata.normalize("NFKC", q).lower()
    return re.sub(r"[\s\W_]+", "", q)


def validate_curated(cfg: dict, ctx: dict, rep: Report) -> list[dict]:
    path = repo_path(cfg["data"]["curated"])
    if not path.exists():
        rep.error(f"{path} 이 없습니다.")
        return []
    categories = set(cfg["data"]["categories"])
    unconfirmed = set(cfg["data"].get("unconfirmed_fields", []))
    projects = ctx["projects"]
    known_ids = {p["id"] for p in projects}
    items, seen_ids, seen_q = [], {}, {}

    for line_no, obj, err in read_jsonl(path):
        where = f"curated.jsonl:{line_no}"
        if err:
            rep.error(f"{where}: JSON 파싱 오류 - {err}")
            continue
        if not isinstance(obj, dict):
            rep.error(f"{where}: 객체가 아닙니다")
            continue
        ok = True
        for k, t in REQUIRED.items():
            if k not in obj:
                rep.error(f"{where}: 필수 필드 없음 - {k}")
                ok = False
            elif not isinstance(obj[k], t):
                rep.error(f"{where}: {k} 타입 오류 (기대 {t.__name__})")
                ok = False
        for k in obj:
            if k not in REQUIRED and k not in OPTIONAL:
                rep.error(f"{where}: 알 수 없는 필드 - {k}")
        if not ok:
            continue
        sid = obj["id"]
        where = f"curated.jsonl:{line_no} ({sid})"
        if not ID_RE.match(sid) or not ID_RE.match(obj["group_id"]):
            rep.error(f"{where}: id/group_id 는 영문 소문자·숫자·-·_ 만 씁니다")
        if sid in seen_ids:
            rep.error(f"{where}: id 중복 (줄 {seen_ids[sid]})")
        seen_ids[sid] = line_no
        if obj["category"] not in categories:
            rep.error(f"{where}: 알 수 없는 category - {obj['category']}")
        if obj["review_status"] not in REVIEW_STATUSES:
            rep.error(f"{where}: review_status 는 {sorted(REVIEW_STATUSES)} 중 하나")
        q, a = obj["question"].strip(), obj["answer"].strip()
        if not q or not a:
            rep.error(f"{where}: question/answer 가 비어 있습니다")
            continue
        for ph in SCHEMA_PLACEHOLDERS:
            if ph in a or any(ph in r for r in obj["source_refs"]):
                rep.error(f"{where}: 스키마 예시 문구가 남아 있습니다 ({ph})")
        if q in ("질문",) or a in ("답변",):
            rep.error(f"{where}: 예시 값이 그대로입니다")

        nq = normalize_q(q)
        if nq in seen_q:
            rep.error(f"{where}: 같은 질문이 이미 있습니다 ({seen_q[nq]})")
        seen_q[nq] = sid

        bad_ids = [i for i in obj["expected_project_ids"] if i not in known_ids]
        if bad_ids:
            rep.error(f"{where}: 없는 프로젝트 id - {bad_ids}")

        if not obj["source_refs"]:
            rep.error(f"{where}: source_refs 가 비어 있습니다")
        source_text = [check_ref(r, ctx, unconfirmed, rep, where) for r in obj["source_refs"]]
        # 프로젝트 이름(예: "Polestar 10")의 숫자는 수치가 아니므로 이름도 출처 문장에 포함한다
        names = "\n".join(p["name"] for p in projects)
        source_blob = "\n".join(t for t in source_text if t) + "\n" + q + "\n" + names

        # 답변 숫자는 출처 문장(또는 질문)에 있어야 한다
        source_numbers = set(NUMBER_RE.findall(source_blob))
        for num in sorted(set(NUMBER_RE.findall(a))):
            if num not in source_numbers:
                rep.error(f"{where}: 답변의 숫자 '{num}' 이 출처 문장에 없습니다 - 출처를 추가하거나 수치를 확인하세요")

        res = check_answer(a, q, obj["category"], projects, obj["expected_project_ids"])
        failed = [k for k, v in res["checks"].items() if v is False]
        if failed:
            rep.error(f"{where}: 답변 형식 검사 실패 {failed} (details: {res['details']})")
        items.append(obj)
    return items


def validate_processed(cfg: dict, ctx: dict, rep: Report) -> None:
    pdir = repo_path(cfg["data"]["processed_dir"])
    manifest_path = pdir / "manifest.json"
    if not manifest_path.exists():
        return
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    rows_by_split = {}
    for s in SPLITS:
        f = pdir / f"{s}.jsonl"
        if not f.exists():
            rep.error(f"processed/{s}.jsonl 이 없습니다")
            continue
        if manifest.get("files", {}).get(f"{s}.jsonl") != sha256_file(f):
            rep.error(f"processed/{s}.jsonl 해시가 manifest 와 다릅니다 (손으로 고쳤거나 prepare 를 다시 돌려야 함)")
        rows = []
        for line_no, obj, err in read_jsonl(f):
            if err:
                rep.error(f"processed/{s}.jsonl:{line_no}: JSON 오류 {err}")
                continue
            rows.append(obj)
        rows_by_split[s] = rows

    if manifest.get("curated_sha256") != sha256_file(repo_path(cfg["data"]["curated"])):
        rep.warn("curated.jsonl 이 분할 이후 바뀌었습니다 - prepare_dataset.py 를 다시 실행하세요")
    if manifest.get("system_prompt_sha256") != ctx["system_prompt_sha256"]:
        rep.warn("context.json(시스템 프롬프트)이 분할 이후 바뀌었습니다 - prepare_dataset.py 를 다시 실행하세요")

    group_split, id_split = {}, {}
    for s, rows in rows_by_split.items():
        for r in rows:
            where = f"processed/{s}.jsonl ({r.get('id')})"
            msgs = r.get("messages")
            if not (isinstance(msgs, list) and len(msgs) == 3 and [m.get("role") for m in msgs] == ["system", "user", "assistant"]):
                rep.error(f"{where}: messages 는 system/user/assistant 3개여야 합니다")
                continue
            expected = build_messages(r["question"], ctx, r["reference"])
            if msgs != expected:
                rep.error(f"{where}: messages 가 현재 문맥·질문·답변으로 만든 값과 다릅니다")
            g = r["group_id"]
            if g in group_split and group_split[g] != s:
                rep.error(f"분할 누수: group_id {g} 가 {group_split[g]} 와 {s} 에 모두 있습니다")
            group_split[g] = s
            if r["id"] in id_split:
                rep.error(f"분할 누수: id {r['id']} 가 {id_split[r['id']]} 와 {s} 에 중복")
            id_split[r["id"]] = s

    # 질문·답변 복사본이 분할을 넘나드는지 (다른 group 이라도)
    flat = [(s, r) for s, rows in rows_by_split.items() for r in rows]
    for i, (s1, r1) in enumerate(flat):
        for s2, r2 in flat[i + 1:]:
            if s1 == s2:
                continue
            qa, qb = normalize_q(r1["question"]), normalize_q(r2["question"])
            if difflib.SequenceMatcher(None, qa, qb).ratio() >= NEAR_DUP_RATIO:
                rep.error(f"분할 누수: 비슷한 질문이 {s1}({r1['id']}) 와 {s2}({r2['id']}) 에 있습니다 - 같은 group_id 로 묶으세요")
            if r1["reference"].strip() == r2["reference"].strip():
                rep.error(f"분할 누수: 같은 답변이 {s1}({r1['id']}) 와 {s2}({r2['id']}) 에 있습니다")


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config")
    ap.add_argument("--strict", action="store_true")
    args = ap.parse_args(argv)
    cfg = load_config(args.config)
    ctx = load_context(cfg)
    rep = Report()
    items = validate_curated(cfg, ctx, rep)
    validate_processed(cfg, ctx, rep)

    status = Counter(i["review_status"] for i in items)
    by_cat = defaultdict(Counter)
    for i in items:
        by_cat[i["category"]][i["review_status"]] += 1
    groups = len({i["group_id"] for i in items})
    print(f"curated: {len(items)}건 (group {groups}개) - " + ", ".join(f"{k} {v}" for k, v in sorted(status.items())))
    for c in cfg["data"]["categories"]:
        cnt = by_cat.get(c, Counter())
        print(f"  {c:<18} reviewed {cnt['reviewed']:>2} / draft {cnt['draft']:>2} / rejected {cnt['rejected']:>2}")
    for w in rep.warnings:
        print(f"WARN  {w}")
    for e in rep.errors:
        print(f"ERROR {e}")
    print(f"결과: 오류 {len(rep.errors)}건, 경고 {len(rep.warnings)}건")
    if rep.errors or (args.strict and rep.warnings):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
