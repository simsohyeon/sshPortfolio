# 학습 데이터 작성·검토·분할 기준

## 원칙

- 원본은 `src/data/resume.js` 와 `api/src/context.js` 의 답변 규칙입니다. 문맥은 `node llm/scripts/export-context.mjs` 로 운영과 똑같이 만듭니다(전화번호 제외, `draft: true` 사례의 판단 근거·회고 제외).
- 이력을 외우게 하는 데이터가 아닙니다. 학습할 때도 이력 전체가 시스템 프롬프트로 들어가고, 모델은 **그 문맥에서 근거를 찾아 규칙대로 답하는 방식**을 배웁니다.
- 공개 자료와 직접 작성한 질문만 씁니다. 방문자 질문 로그(KV)는 자동으로 넣지 않습니다. 로그에서 질문 아이디어를 얻었다면 질문 문장을 직접 다시 쓰고, 답은 원문에서 새로 작성합니다.
- AI가 만든 답변은 모두 초안입니다. 사람이 원문과 대조하기 전까지 `draft` 로 둡니다.
- `resume.js` 에서 🔴 [확인필요]로 표시한 초안 값(`role`, `status`, `summary`, `decision`, `retrospective`, `contributions`)이나 `draft: true` 사례로 **새로운 사실이나 판단 근거를 만들지 않습니다.** 검증기가 이런 출처를 경고로 알려 줍니다.
- 처음에는 30~50개로 시작하고, 필요하면 100~200개로 늘립니다. 이 숫자는 성능을 보장하는 기준이 아닙니다.

## 형식 (`curated.jsonl`, 한 줄에 객체 하나)

```json
{
  "id": "tech-kafka-01",
  "group_id": "tech-kafka",
  "category": "tech_usage",
  "question": "Kafka는 어디에 사용했나요?",
  "answer": "Kafka는 통합신제품 Polestar 10에서 ...\n\n관련: polestar10\n다음: Redis는 어디에 사용했나요? | Polestar 10은 어떤 제품인가요?",
  "source_refs": ["src/data/resume.js: projects[polestar10].techNotes[0]", "src/data/resume.js: projects[polestar10].period"],
  "expected_project_ids": ["polestar10"],
  "review_status": "draft",
  "review_note": "(선택) 검토 메모",
  "reviewer": "(선택) 검토자"
}
```

| 필드 | 규칙 |
| --- | --- |
| `id` | 고유값. 영문 소문자·숫자·`-`·`_` |
| `group_id` | 같은 질문을 표현만 바꾼 항목끼리 같은 값. 같은 group은 항상 같은 분할에 들어갑니다 |
| `category` | 아래 범주 중 하나 |
| `answer` | 운영 시스템 프롬프트의 [형식] 규칙을 따른 모범 답변 (아래 체크리스트) |
| `source_refs` | 답변 근거. `src/data/resume.js: <경로>` 또는 `api/src/context.js: "<규칙 문구>"` |
| `expected_project_ids` | 답변 끝 `관련:` 줄의 ID와 같아야 합니다(없으면 `[]`) |
| `review_status` | `draft`(초안) · `reviewed`(검토 완료, 학습에 사용) · `rejected`(제외) |

### 출처 경로 쓰는 법

- 객체 키: `skills.Backend`, 공백·기호가 있는 키는 `skills["AI / LLM"]`
- id가 있는 배열 원소: `projects[polestar10]`, `sideProjects[staymaru]`
- 그 밖의 배열 원소: 0부터 시작하는 번호 `highlights[1]`, `cases[0].results[0]`, `career[1]`
- 규칙 근거: `api/src/context.js: "전화번호 등 자료에 없는 개인정보는 제공하지 않습니다"` (시스템 프롬프트에 있는 문구를 그대로, 안의 큰따옴표는 `\"`)
- `contact.phone` 은 출처로 쓸 수 없습니다.

검증기는 경로가 실제로 존재하는지, **답변의 숫자가 출처 문장(또는 질문, 프로젝트 이름)에 있는지** 확인합니다. 숫자 오류가 나면 출처를 빠뜨렸거나 수치를 잘못 쓴 것입니다.

## 범주

| category | 내용 | 현재 초안 수 |
| --- | --- | --- |
| `project_overview` | 프로젝트 소개 | 6 |
| `project_role` | 프로젝트별 역할 | 4 |
| `profile_fact` | 경력·자격증·학력 | 3 |
| `skill_level` | 기술 숙련도 (활용 수준·프로젝트·기간), 기술 우열 질문 | 5 |
| `tech_usage` | 기술 선택·사용 목적 (근거 있을 때만, 없으면 없다고) | 6 |
| `problem_solving` | 문제 해결 사례, 순위를 묻는 질문 | 7 |
| `unknown_info` | 자료에 없는 정보 (연봉, 이직 사유, 나이, 전화번호, 없는 기술, 선호) | 7 |
| `partial_answer` | 일부만 답할 수 있는 질문 | 3 |
| `off_topic` | 포트폴리오와 무관한 질문 (거절, `관련:`/`다음:` 없음) | 3 |
| `manipulation` | 경력·수치 조작 요구, 지시 무시 요구 | 3 |
| `format_followup` | 여러 프로젝트를 묶는 답의 `관련:`/`다음:` 형식 | 2 |
| `foreign_language` | 외국어 질문 (본문은 그 언어, `관련:`/`다음:` 머리말은 한국어) | 2 |

## 모범 답변 체크리스트

검토할 때 항목마다 확인합니다. 형식 항목은 `validate_dataset.py` 가 자동으로 확인하고, **사실 항목은 사람만 확인할 수 있습니다.**

사실 (사람)
- [ ] 회사명·프로젝트명·기간·수치·기술이 `resume.js` 원문과 같다 (과장·반올림·바꿔 말하기로 의미가 달라지지 않았다)
- [ ] 원문에 없는 사실, 선호, 순위, 평가, 개인정보를 덧붙이지 않았다
- [ ] 기술을 "어떻게" 썼는지는 `techNotes`·사례에 근거가 있을 때만 설명했다
- [ ] 🔴 초안 필드를 근거로 쓴 경우, 본인 경험과 맞는지 확인했다
- [ ] `다음:` 의 두 질문은 자료로 답할 수 있다

형식 (자동 + 눈으로)
- [ ] 3인칭, 이름 뒤 항상 "님" (`심소현 님은`)
- [ ] 첫 문장에서 핵심을 답하고, 여러 항목은 `- 이름: 설명` 한 줄씩
- [ ] 마크다운(`**`, `#`, 백틱, `[텍스트](주소)`)과 `[id: ...]` 표기를 쓰지 않았다
- [ ] 본문에 언급한 프로젝트 = `관련:` ID (최대 3개) = `expected_project_ids`
- [ ] `다음: 질문1 | 질문2` 두 개. 무관 질문 거절일 때만 `관련:`/`다음:` 생략
- [ ] 모름·부분 답변은 "○○는 포트폴리오에 없습니다"로 없는 부분만 짚었다
- [ ] 외국어 질문은 본문을 그 언어로, `관련:`/`다음:` 머리말만 한국어

## 검토 절차

1. 편집기에서 `llm/data/curated.jsonl` 을 엽니다(한 줄이 한 항목). 줄을 나누지 말고, 답변 안의 줄바꿈은 `\n` 그대로 둡니다.
2. 항목마다 `source_refs` 의 원문을 `src/data/resume.js` 에서 찾아 체크리스트대로 대조합니다.
3. 맞으면 `"review_status": "reviewed"` 로 바꿉니다. 고칠 부분이 있으면 `answer` 를 고친 뒤 `reviewed` 로, 쓰지 않을 항목은 `"rejected"` 로 바꿉니다. 필요하면 `review_note` 를 남깁니다.
4. `python3 llm/scripts/validate_dataset.py` → 오류 0건 확인.
5. `python3 llm/scripts/prepare_dataset.py` → 검토 완료가 30건 이상이면 분할합니다. 모자라면 남은 초안 목록을 보여 줍니다.

`review_status` 는 사람이 직접 바꿉니다. 스크립트가 자동으로 바꾸지 않습니다.

## 분할

- 기본 비율은 train 0.7 / validation 0.15 / test 0.15 입니다(`configs/experiment.json` 의 `split_ratios`). 지침의 80/10/10 대신 70/15/15로 둔 이유는 50건 규모에서 test가 4~5건이면 범주를 거의 덮지 못하기 때문입니다. 데이터가 100건을 넘으면 80/10/10으로 바꿔도 됩니다.
- 같은 `group_id` 는 같은 분할에 넣습니다. 범주별로 섞은 뒤 비율이 가장 모자란 분할에 배정해 범주가 고르게 퍼지게 합니다.
- seed(기본 42)와 group별 배정, 파일 해시를 `processed/manifest.json` 에 저장합니다. 같은 seed·같은 데이터면 같은 결과가 나옵니다.
- validation은 학습 설정 조정용, test는 마지막 확인용입니다. **test 결과를 본 뒤 그 질문·정답을 학습 데이터에 넣지 않습니다.** 같은 이력 사실을 다른 질문에서 참고하는 것은 괜찮지만, 질문·답변 복사본이 분할을 넘나들면 검증기가 오류를 냅니다(유사 질문 0.9 이상, 동일 답변).
- 분할 후 `curated.jsonl` 이나 문맥이 바뀌면 `train.py` 가 학습을 거부합니다. `prepare_dataset.py` 를 다시 실행하세요.
