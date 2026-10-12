"""답변 형식 자동 검사 (표준 라이브러리만 사용).

학습 데이터의 모범 답변 검증(validate_dataset.py)과 학습 전후 생성 답변 비교(evaluate.py)에서 같은 함수를 쓴다.
여기서 하는 것은 '형식' 검사다. 사실이 맞는지는 사람이 원문과 대조해야 하고, 이 검사 통과를 정확성 근거로 쓰지 않는다.
"""
from __future__ import annotations

import re

from common import HANGUL_RE, is_foreign

# src/components/AskMe.jsx 의 META_RE 와 같은 규칙: 콜론이 있어야 메타 줄
META_RE = re.compile(r"^(관련|다음)(?:\s*(?:프로젝트|질문))?\s*(?::\s*(.*)|)$")
MAX_RELATED = 3

# 본문에서 프로젝트 언급을 찾을 때 화면 이름(short_name) 외에 함께 볼 표현
PROJECT_ALIASES = {
    "polestar10": ["Polestar 10"],
    "gangneung-asan": ["강릉아산병원"],
    "solution-build": ["IT 서비스·자산관리 솔루션"],
    "next-product": ["next-generation product"],
    "staymaru": ["StayMaru"],
    "ansim-corona": ["Ansim Corona"],
}

MARKDOWN_RES = [
    re.compile(r"\*\*"),
    re.compile(r"(^|\n)\s*#{1,6}\s"),
    re.compile(r"`"),
    re.compile(r"\[[^\]\n]+\]\([^)\n]+\)"),
]
PHONE_RE = re.compile(r"01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}")
FIRST_PERSON_RE = re.compile(r"(^|[\s\"'(])(저는|제가|저의|제\s)")
UNKNOWN_PHRASE = "포트폴리오에 없"

# 이 범주는 "포트폴리오에 없습니다" 같은 모름 표시가 있어야 한다 (형식 수준 확인)
NEEDS_UNKNOWN_PHRASE = {"unknown_info", "partial_answer"}
# 이 범주는 거절 응답이라 관련:/다음: 줄이 없어야 한다
REFUSAL_CATEGORIES = {"off_topic"}


def split_meta(text: str) -> dict:
    """답변을 본문과 관련:/다음: 메타 줄로 나눈다. 같은 머리말이 여러 번 나오면 마지막 것을 쓴다 (AskMe.jsx 와 동일)."""
    related_raw = None
    next_raw = None
    body = []
    meta_count = {"관련": 0, "다음": 0}
    for line in text.split("\n"):
        m = META_RE.match(line.strip())
        if not m:
            body.append(line)
            continue
        meta_count[m.group(1)] += 1
        value = m.group(2) or ""
        if m.group(1) == "관련":
            related_raw = [x.strip() for x in value.split(",") if x.strip()]
        else:
            next_raw = [x.strip() for x in value.split("|")]
    return {
        "body": "\n".join(body).strip(),
        "related": related_raw,
        "next": next_raw,
        "meta_count": meta_count,
    }


def mentioned_projects(body: str, projects: list[dict]) -> list[str]:
    found = []
    for p in projects:
        names = [p["short_name"], *PROJECT_ALIASES.get(p["id"], [])]
        if any(n and n in body for n in names):
            found.append(p["id"])
    return found


def check_answer(answer: str, question: str, category: str | None, projects: list[dict],
                 expected_ids: list[str] | None = None) -> dict:
    """형식 검사 결과. 값은 True(통과) / False(실패) / None(해당 없음). details 에 판단 근거를 남긴다."""
    known = {p["id"] for p in projects}
    meta = split_meta(answer)
    body = meta["body"]
    related = meta["related"]
    nexts = meta["next"]
    foreign = is_foreign(question)
    refusal = category in REFUSAL_CATEGORIES
    mentioned = mentioned_projects(body, projects)
    r: dict = {}
    d: dict = {"mentioned": mentioned, "related": related, "next": nexts}

    r["non_empty"] = bool(body)
    r["meta_once"] = meta["meta_count"]["관련"] <= 1 and meta["meta_count"]["다음"] <= 1
    # 메타 줄은 본문 뒤에 와야 한다 (마지막 비어 있지 않은 줄들이 메타 줄)
    lines = [l.strip() for l in answer.strip().split("\n") if l.strip()]
    tail_meta = 0
    for l in reversed(lines):
        if META_RE.match(l):
            tail_meta += 1
        else:
            break
    r["meta_at_end"] = tail_meta == sum(meta["meta_count"].values())

    if refusal:
        r["related_ids_valid"] = None
        r["related_matches_mentions"] = None
        r["refusal_no_meta"] = related is None and nexts is None
    else:
        r["refusal_no_meta"] = None
        ids = related or []
        r["related_ids_valid"] = all(i in known for i in ids) and len(ids) <= MAX_RELATED and len(set(ids)) == len(ids)
        if mentioned:
            want = set(mentioned) if len(mentioned) <= MAX_RELATED else None
            if want is not None:
                r["related_matches_mentions"] = set(ids) == want
            else:  # 4개 이상 언급하면 언급한 것 중 3개
                r["related_matches_mentions"] = len(ids) == MAX_RELATED and set(ids) <= set(mentioned)
        else:
            r["related_matches_mentions"] = related is None
    if expected_ids is not None and not refusal:
        r["related_matches_expected"] = set(related or []) == set(expected_ids)
    else:
        r["related_matches_expected"] = None

    if refusal:
        r["next_two_questions"] = None
    else:
        r["next_two_questions"] = nexts is not None and len(nexts) == 2 and all(nexts)

    r["no_markdown"] = not any(rx.search(answer) for rx in MARKDOWN_RES)
    r["no_id_leak"] = "[id:" not in answer
    r["no_phone"] = not PHONE_RE.search(answer)

    if foreign:
        hangul = len(HANGUL_RE.findall(body))
        letters = sum(ch.isalpha() for ch in body) or 1
        d["hangul_ratio"] = round(hangul / letters, 3)
        r["language_match"] = hangul / letters < 0.3  # 고유명사(자격증명 등) 한글은 허용
        r["third_person_honorific"] = None
        r["no_first_person"] = None
    else:
        r["language_match"] = bool(HANGUL_RE.search(body))
        # "심소현" 뒤에는 항상 "님" (예: "심소현 님은"). "심소현의", "심소현은" 은 실패
        r["third_person_honorific"] = all(
            re.match(r"\s*님", body[m.end():]) for m in re.finditer("심소현", body)
        )
        r["no_first_person"] = not FIRST_PERSON_RE.search(body)

    if category in NEEDS_UNKNOWN_PHRASE:
        r["unknown_phrase"] = UNKNOWN_PHRASE in body
    else:
        r["unknown_phrase"] = None

    d["chars"] = len(body)
    if not body:
        # 빈 답변이 "마크다운 없음" 같은 항목을 공짜로 통과하지 않도록 해당 항목을 모두 실패로 센다
        r = {k: (None if v is None else False) for k, v in r.items()}
    return {"checks": r, "details": d}


def summarize(results: list[dict]) -> dict:
    """검사 항목별 (통과 수, 해당 건수)."""
    out: dict = {}
    for res in results:
        for k, v in res["checks"].items():
            if v is None:
                continue
            ok, n = out.get(k, (0, 0))
            out[k] = (ok + (1 if v else 0), n + 1)
    return out
