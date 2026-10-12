# LLM 파인튜닝 실험 (QLoRA)

포트폴리오 챗봇의 답변 규칙을 공개 소형 LLM에 직접 추가 학습하고, **같은 기반 모델의 학습 전후**를 비교하는 실험 환경입니다.

- 운영 챗봇(`api/` Gemini Worker, `src/components/AskMe.jsx`)은 그대로입니다. 이 폴더는 운영 코드에서 import 하지 않습니다.
- Mac에서는 데이터 준비·검증·코드 편집만 합니다. 모델 다운로드·학습·추론은 Google Colab GPU에서 합니다.
- 이력을 외우게 하는 것이 아니라 **주어진 이력 문맥에 근거해 답하는 행동**을 학습합니다. 학습과 추론 모두 운영과 같은 시스템 프롬프트(규칙 + 이력 전체)를 넣습니다.
- 1차 범위에서 운영 모델 교체, RAG, 모델 병합, 모델 공개 업로드는 하지 않습니다.

## 구성

| 경로 | 역할 | 실행 위치 |
| --- | --- | --- |
| `scripts/export-context.mjs` | `api/src/context.js` 의 `buildSystemPrompt()` 를 그대로 호출해 `data/generated/context.json` 생성 (전화번호 제외·draft 사례 규칙 동일, 외국어 질문 처리 문구는 `index.js` 와 대조) | Mac (Node 18+) |
| `data/curated.jsonl` | 검토용 원본 데이터 (출처·검토 상태 포함, 현재 전부 `draft`) | Mac에서 검토 |
| `data/README.md` | 데이터 작성·검토·분할 기준 | |
| `scripts/validate_dataset.py` | JSONL·필수 필드·출처 경로·프로젝트 ID·답변 형식·숫자 출처·중복·분할 누수 검사 | Mac / Colab |
| `scripts/prepare_dataset.py` | `reviewed` 항목만 group 단위로 train/validation/test 분할 → `data/processed/` | Mac / Colab |
| `scripts/package_for_colab.py` | 커밋 안 한 파일까지 담은 업로드용 ZIP (`dist/sshportfolio-llm.zip`) + 코드 버전 기록 | Mac |
| `train.py` | 토큰 길이·마스크 검사 → QLoRA 학습 → 어댑터·실행 기록 저장 (체크포인트 재개) | Colab GPU |
| `evaluate.py` | `generate`: 학습 전/후 답변 생성(GPU) · `compare`: 비교 보고서(CPU) | Colab / Mac |
| `checks.py`, `common.py`, `modeling.py` | 형식 검사, 공통 함수, 모델 로딩 | |
| `configs/experiment.json` | 모델·revision·LoRA·학습·생성·분할 설정 | |
| `requirements-colab.txt` | Colab 설치 버전 (torch는 Colab 기본값 사용) | |
| `notebooks/finetune_colab.ipynb` | GPU 확인부터 비교 보고서·복구까지 순서대로 실행하는 노트북 | Colab |
| `reports/evaluation-template.md` | 자동 지표 + 사람 평가 보고서 양식 | |

Git에서 제외: `data/generated/`, `data/processed/`, `dist/`, `runs/`, 모델·어댑터 바이너리(`*.safetensors` 등). 학습 결과는 Google Drive에 저장합니다.

## 선택한 모델: `Qwen/Qwen3-1.7B`

| 조건 | 확인 내용 |
| --- | --- |
| 크기 | 1.7B. 무료 Colab T4(16GB급)에서 4-bit 로드 후 LoRA 학습을 노리는 크기 |
| 한국어 | Qwen3는 다국어(한국어 포함) 지원 모델로 알려져 있으나, 이 작업 환경에서는 Hugging Face 접근이 막혀 모델 카드를 직접 열어 확인하지 못했습니다. 한국어 답변 품질은 노트북 8번 셀(학습 전 추론)에서 직접 확인합니다 |
| 라이선스 | Apache-2.0 (웹 검색으로 본 모델 카드 메타데이터 기준, 공식 페이지 직접 확인은 못함). 노트북 7번 셀이 Hub에서 다시 조회해 `model.json` 에 남기고, `apache-2.0` 이 아니면 경고 |
| 접근 조건 | gated 아님으로 알려져 있음. 실제 값은 `model.json` 의 `gated` 로 확인 |
| chat template | TRL 1.15에 Qwen3 원본 템플릿과 학습용(`{% generation %}` 표시) 템플릿이 있어 `assistant_only_loss` 로 정답 토큰만 학습 가능. 로컬에서 같은 템플릿으로 마스크를 확인함 |
| 사고(thinking) 모드 | 기본값이 켜짐. 학습·평가 모두 `enable_thinking=False` (Qwen 공식 스위치)로 끔. 학습 템플릿은 빈 `<think></think>` 를 정답 앞에 넣음 |
| LoRA 대상 | Qwen3 의 `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj` (transformers 5.19의 Qwen3 구조에서 확인). `train.py` 가 실제 모델에서 다시 확인 |
| revision | 이 작업 환경에서 Hugging Face 접근이 막혀 커밋 SHA를 미리 고정하지 못했습니다. **처음 Colab 실행 때 main 의 SHA를 조회해 `model.json` 에 고정**하고 이후 모든 단계가 그 값을 씁니다. 재현하려면 그 SHA를 `configs/experiment.json` 의 `model.revision` 에 적으세요 |

검토했지만 고르지 않은 후보:

- Gemma·Llama 계열 소형 모델: Hub 접근 승인(gated)이 필요해 초보자 진입 단계가 늘어납니다.
- 한국어 특화 소형 모델(EXAONE, Kanana 등): 이 환경에서 모델 카드·라이선스·템플릿을 직접 확인하지 못했고, TRL의 assistant 마스킹용 학습 템플릿 목록에 없어 템플릿을 직접 만들어야 합니다.
- Qwen3.5 소형 모델: TRL에 학습 템플릿은 있지만, 모델 구조와 4-bit·T4 조합의 호환성을 이 환경에서 확인하지 못했습니다. 1차 실험 뒤 비교 후보로 둡니다.

모델을 바꾸려면 `model.id` 와 `lora.target_modules` 를 바꾸고 `experiment_name` 도 바꿉니다. `train.py` 는 TRL이 마스킹을 지원하지 않는 템플릿이면 학습하지 않고 멈춥니다.

## 1. Mac에서 준비

Python 3.9 이상(표준 라이브러리만 사용)과 Node 18 이상이면 됩니다. GPU 라이브러리(torch 등)는 설치하지 않습니다.

```bash
cd sshPortfolio
node llm/scripts/export-context.mjs          # 이력 문맥 추출 (resume.js 를 고칠 때마다 다시)
python3 llm/scripts/validate_dataset.py      # 데이터 검사 (오류 0건이어야 함)
```

### 학습 데이터 검토 (필수)

`llm/data/curated.jsonl` 의 51개 항목은 AI가 만든 **초안(`draft`)** 입니다. 검토 완료 항목만 학습에 쓰고, 30건 미만이면 분할·학습이 시작되지 않습니다.
절차는 [`data/README.md`](data/README.md) 를 따릅니다. 요약하면:

1. 항목마다 `answer` 를 `source_refs` 가 가리키는 `src/data/resume.js` 원문과 대조합니다.
2. 맞으면 `"review_status": "reviewed"`, 틀리면 고치거나 `"rejected"` 로 바꿉니다.
3. `validate_dataset.py` 가 띄우는 🔴 초안 필드 경고(`role`, `status`, `summary`, `decision`, `retrospective`, `contributions`)는 `resume.js` 에서도 [확인필요]로 표시된 값입니다. 본인 경험과 맞는지 특히 확인합니다.

```bash
python3 llm/scripts/validate_dataset.py
python3 llm/scripts/prepare_dataset.py       # reviewed 30건 이상이면 data/processed/ 생성
python3 llm/scripts/package_for_colab.py     # → llm/dist/sshportfolio-llm.zip
```

## 2. Colab에서 실행

1. https://colab.research.google.com → **파일 → 노트북 업로드** → `llm/notebooks/finetune_colab.ipynb`
2. **런타임 → 런타임 유형 변경 → GPU(T4 등)** → 저장
3. 1번 셀부터 순서대로 실행. 3번 셀에서 `llm/dist/sshportfolio-llm.zip` 업로드(한 번 올리면 Drive에 보관)
4. 결과는 `MyDrive/sshportfolio-llm/<experiment_name>/` 에 저장됩니다.

```
MyDrive/sshportfolio-llm/
├── sshportfolio-llm.zip                 업로드한 코드·데이터
└── qwen3-1.7b-qlora-v1/
    ├── model.json                       기반 모델 ID·커밋 SHA·라이선스 (실험 전체 공통)
    ├── smoke/                           5스텝 시험 학습
    └── full/
        ├── run_info.json                seed·모델·데이터 해시·코드 버전·라이브러리·GPU·설정·학습 시간·peak VRAM
        ├── token_stats.json · mask_check.json · log_history.json · training_chat_template.jinja
        ├── checkpoints/                 재개용 (최근 2개)
        ├── adapter/                     LoRA 어댑터 + 토크나이저
        └── eval/                        test-base.jsonl · test-tuned.jsonl · *.meta.json · compare-*.md
```

### 검토한 데이터를 반영하려면

Mac에서 `curated.jsonl` 수정 → `validate_dataset.py` → `prepare_dataset.py` → `package_for_colab.py` → 노트북 3번 셀을 `UPLOAD_NEW_ZIP = True` 로 실행 → 6번 셀부터.
데이터가 바뀐 뒤 이미 학습한 실험을 다시 돌리면 `train.py` 가 "분할 데이터가 최신이 아님"이나 "이미 끝난 실행"으로 멈춥니다. 새 실험은 `experiment_name` 을 바꿔 구분합니다.

### 연결이 끊기면

GPU 런타임을 다시 고르고 1→5번 셀을 실행한 뒤, 끊긴 단계의 셀을 다시 실행합니다. 학습은 Drive의 마지막 체크포인트에서 이어지고, 평가는 이미 만든 파일을 건너뜁니다.

### 커밋하지 않은 파일을 쓰는 방법

`package_for_colab.py` 가 작업 폴더의 현재 파일을 그대로 ZIP에 담고, `VERSION.json` 에 git 커밋·미커밋 여부·`llm/` 내용 해시를 남깁니다. GitHub에 푸시한 뒤라면 노트북 3번 셀의 `CODE_SOURCE = "git"` 과 브랜치 이름으로 clone 할 수 있습니다(기본 브랜치에 `llm/` 이 있다고 가정하지 않음).

## 3. 학습 설계

- **QLoRA**: 기반 모델을 4-bit NF4(double quant)로 로드하고 LoRA(r=8, alpha=16, dropout 0.05)만 학습합니다.
- **정답 토큰만 loss**: TRL `assistant_only_loss=True`. 학습 전에 두 번 검사합니다.
  1. 토크나이저 단계: 학습 대상 텍스트가 정답(+끝 토큰)이고 system·user 문장이 들어가지 않는지 (`mask_check.json`)
  2. SFTTrainer가 만든 실제 배치: labels가 -100이 아닌 토큰이 정답뿐인지, padding이 제외되는지
- **길이**: 실제 토크나이저로 잰 최대 길이 + 여유분으로 `max_length` 를 정합니다. `max_length_cap`(기본 12288)을 넘는 샘플이 있으면 자르지 않고 멈춥니다. 정답이 잘린 샘플은 학습에 들어가지 않습니다.
- **배치**: batch 1 × gradient accumulation 8, gradient checkpointing, `paged_adamw_8bit`.
- **정밀도**: GPU가 bf16을 지원하면(compute capability 8.0+) bf16, 아니면(T4) fp16. TRL은 4-bit 모델의 LoRA 가중치를 bf16으로 바꿉니다.
- **보수적 시작값**: lr 1e-4, 2 epoch, cosine, warmup 10%. validation loss(epoch마다)로 조정합니다. train loss만 계속 내려가고 validation loss가 오르면 과적합이므로 epoch·lr을 줄입니다.
- **기록**: seed, 모델 ID·revision, 데이터 해시(curated·context·분할 파일), 코드 버전, 라이브러리 버전, 설정 전체, GPU 이름·VRAM, 학습 시간, peak VRAM(allocated/reserved), loss 기록 → `run_info.json`, `log_history.json`.
- **모델 병합**은 하지 않습니다(1차 범위 밖).

### OOM·길이 초과가 나면

1. 출력된 `torch.cuda.memory_summary` 와 `nvidia-smi` 로 실제 GPU와 사용량을 확인합니다. 무료 Colab은 GPU가 바뀔 수 있습니다.
2. batch가 이미 1이면 `gradient_checkpointing` 이 켜져 있는지 확인하고, 필요하면 `lora.r` 을 낮춥니다.
3. `token_stats.json` 에서 문맥 길이를 봅니다. 대부분은 시스템 프롬프트(이력 전체)입니다. 문맥을 줄여야 한다면 **질문에 필요한 근거가 남는지** 확인하는 단축 방식(예: 프로젝트 단위 발췌)을 별도로 설계하고, 줄인 문맥으로 모든 정답이 여전히 뒷받침되는지 `source_refs` 로 다시 검사합니다. 무조건 자르지 않습니다.
4. 그래도 안 되면 더 작은 모델(예: 같은 계열 0.6B급)을 검토합니다. 모델을 바꾸면 `experiment_name` 도 바꿉니다.

## 4. 평가

- 주 비교는 **같은 기반 모델·같은 커밋**의 학습 전과 학습 후입니다. 같은 문맥·질문·생성 설정(greedy, `max_new_tokens` 512)을 씁니다. `compare` 는 revision·생성 설정·시스템 프롬프트가 다르면 경고합니다.
- 자동 검사(`checks.py`)는 **형식**만 봅니다: `관련:` ID 유효성·개수·본문 언급과 일치·정답과 일치, `다음:` 2개, 무관 질문 거절 시 메타 줄 생략, 마크다운·`[id:]`·전화번호 노출, 질문 언어, `심소현 님` 3인칭, 1인칭, 모름 표시. 빈 답변은 모든 항목에서 실패로 셉니다.
- 사실 정확성·근거 없는 주장·부분 답변·지시 공격 대응은 `compare-*.md` 의 질문별 나란히 보기(질문, 근거, 모범 답변, 학습 전/후)를 보고 사람이 채웁니다. 양식은 [`reports/evaluation-template.md`](reports/evaluation-template.md).
- Gemini 답변과의 비교는 선택 사항입니다. 모델 규모와 구조가 달라 그 비교만으로 파인튜닝 효과를 판단하지 않습니다.
- 테스트셋은 현재 데이터 기준 7건 안팎입니다. 결과는 "이 평가셋에서의 관찰"로만 적고, 성능 상승 자체를 완료 조건으로 삼지 않습니다. 재현 가능한 실행과 실패 분석까지 하면 결과로 인정합니다.

### 어댑터만으로는 실행되지 않습니다

`adapter/` 에는 LoRA 가중치만 있습니다. 같은 기반 모델(`model.json` 의 ID·커밋)을 먼저 로드하고 그 위에 붙여야 합니다. 노트북 13번 셀이 예시입니다.

```python
base = AutoModelForCausalLM.from_pretrained(pinned["id"], revision=pinned["revision"], quantization_config=bnb, ...)
model = PeftModel.from_pretrained(base, f"{RUN_FULL}/adapter")
```

## 5. 운영 챗봇 연결 (후속 단계, 이번에 구현하지 않음)

학습 결과를 검증한 뒤 연결한다면 다음 구조를 권장합니다.

```
브라우저 (AskMe.jsx, 변경 없음)
  → Cloudflare Worker (입력 검증·요청 제한·오류 처리·SSE 계약 유지: data: {"text"|"notice"|"error"|"done"})
      → 기본: Gemini (현재 경로)
      → 선택: 별도 추론 서버 (기반 모델 + 어댑터 로드, 답변 생성)
```

- Worker에 `MODEL_PROVIDER` 같은 설정을 두고 **기본값은 gemini** 로 둡니다. 메시지 형식(`role: model` 등)과 스트리밍 차이는 Worker에서 변환해 프론트의 `/chat` 계약을 그대로 유지합니다.
- 추론 서버의 키는 Worker 비밀(`wrangler secret`)에만 두고 프론트에 노출하지 않습니다.
- 추론 서버 호출에 타임아웃, 요청 취소(클라이언트 연결 종료 전파), 동시 요청 제한을 둡니다.
- Gemini fallback은 사용 여부와 비용을 설정으로 명시합니다. **평가 기간에는 fallback을 꺼서** 학습 모델의 실패가 숨겨지지 않게 합니다.
- 무료 Colab은 상시 API 서버로 쓰지 않습니다. 학습을 무료 GPU로 했다고 운영도 무료는 아닙니다. 추론 서버는 모델 크기, 목표 응답 시간, 예상 트래픽, 월 예산을 정한 뒤 별도로 고릅니다.
- GitHub Pages나 현재 Worker에 모델 파일을 넣는다고 GPU 추론이 되지 않습니다.

## 6. 검증 범위

| 항목 | 상태 |
| --- | --- |
| 문맥 추출(전화번호 제외, draft 규칙, index.js 외국어 문구 대조) | 로컬 실행 확인 |
| JSONL 파싱·필수 필드·출처 경로·프로젝트 ID·답변 형식·숫자 출처 검사 | 로컬 실행 확인 (51건 오류 0, 경고 16) |
| 그룹 단위 분할·재현성·누수 검사 | 로컬 실행 확인 (검토 완료로 가정한 임시 복사본으로) |
| 노트북 JSON 형식·코드 셀 문법 | 로컬 확인 |
| 라이브러리 설치·import (transformers 5.19, peft 0.21.2, trl 1.15, accelerate 1.15, datasets 5.1, torch 2.14 CPU) | 로컬 확인 |
| Qwen3 템플릿 마스킹·실제 배치 라벨·LoRA 학습·체크포인트 재개·어댑터 저장·학습 전후 생성·비교 보고서 | **작은 무작위 Qwen3 구조 모델 + CPU**로 흐름만 확인. TRL의 GPU 전용 loss 커널은 CPU용 대체 구현으로 바꿔 실행 |
| 실제 Qwen3-1.7B 다운로드·토크나이저 길이 측정·4-bit 로드(bitsandbytes) | **미실행** (Colab GPU 필요) |
| smoke test·전체 학습·peak VRAM·fp16 안정성 | **미실행** |
| 새 런타임에서 어댑터 재로드·학습 전후 평가 결과 | **미실행** |
