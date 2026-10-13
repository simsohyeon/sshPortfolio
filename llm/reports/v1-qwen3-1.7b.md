# 1차 실험 결과 — qwen3-1.7b-qlora-v1

> Colab에서 실제로 실행한 출력에서 옮긴 값입니다. 사람 평가(사실 정확성 등)는 아래 관찰 외에 칸별로 채우지 않았습니다.
> 결과 파일: Google Drive `MyDrive/sshportfolio-llm/qwen3-1.7b-qlora-v1/`

## 0. 실험 정보

| 항목 | 값 |
| --- | --- |
| 기반 모델 / 커밋 | Qwen/Qwen3-1.7B @ `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` (apache-2.0, gated 아님) |
| 코드 버전 | git `78fecd5` (미커밋 변경 없음) |
| 데이터 | reviewed 48건 → train 34 / validation 7 / test 7 (seed 42) |
| 데이터 해시 | curated `a0c6567d…`, system prompt `dc1f6481…` |
| 학습 설정 | QLoRA NF4, LoRA r=8·alpha=16·dropout 0.05 (q,k,v,o,gate,up,down), lr 1e-4 cosine, warmup 10%, 2 epoch, batch 1 × accum 8, max_length 8960 |
| GPU / 정밀도 | Tesla T4 14.56 GiB, fp16 (bf16 미지원), LoRA 가중치 fp32 |
| 라이브러리 | torch 2.11.0+cu130, transformers 5.19.0, peft 0.21.2, trl 1.15.0, accelerate 1.15.0, bitsandbytes 0.50.2, datasets 5.1.0, Python 3.13.15 |
| 학습 시간 / peak VRAM | 15.6분 / 5.87 GiB |
| 최적화 스텝 | 10 (그중 5번째는 fp16 기울기 overflow로 건너뜀, grad_norm inf) |
| train loss | 1.78 → 1.78 → 1.59 → 1.14 → (2.81, 건너뛴 스텝) → 1.47 → 0.96 → 1.09 → 0.88 → 0.92 |
| eval loss (validation 7건) | epoch 1: 1.243 → epoch 2: 0.992 |
| eval 정답 토큰 정확도 | 0.806 → 0.810 (학습 첫 스텝 train 0.780) |
| 생성 설정 | greedy, max_new_tokens 512, repetition_penalty 1.0, enable_thinking False |

## 실행 중 해결한 문제

1. **OOM (peak 14.5 GiB)**: transformers 가 Qwen3 의 GQA 를 SDPA `enable_gqa` 로 계산하는데, Flash 어텐션이 없는 T4 에서는 math 커널로 넘어가 약 9천 토큰 문맥에서 메모리가 부족했다. T4 에서는 키·값을 펼쳐 메모리 절약 커널을 쓰게 바꿨다 (결과 동일, peak 5.85 GiB).
2. **bf16 기울기 unscale 오류**: TRL 이 4-bit 모델의 LoRA 가중치를 bf16 으로 바꾸는데 T4 의 fp16 GradScaler 가 처리하지 못했다. fp16 학습일 때 LoRA 가중치를 fp32 로 두었다.

## 1. 자동 형식 검사 (test 7건, 통과 / 해당 건수)

| 항목 | 학습 전 | 학습 후 |
| --- | --- | --- |
| 관련: ID 유효·3개 이하 | 5/7 | 7/7 |
| 관련: ID = 본문 언급 프로젝트 | 4/7 | 5/7 |
| 관련: ID = expected_project_ids | 2/7 | 2/7 |
| 다음: 후속 질문 2개 | 3/7 | 1/7 |
| 관련:/다음: 줄이 답변 끝 | 7/7 | 6/7 |
| 마크다운 없음 | 7/7 | 4/7 |
| 모름·부분 답변 표시 | 2/2 | 1/2 |
| 3인칭·1인칭 없음·전화번호·질문 언어 | 7/7 | 7/7 |
| max_new_tokens(512) 도달 | 0/7 | 2/7 |
| 평균 지연 | 약 13초 | 약 39초 (긴 답변·반복 때문) |

## 2. 관찰 (학습 후 답변)

- **거의 학습되지 않음**: `manip-k8s-01` 의 첫 문장이 학습 전과 글자까지 같다. 최적화 10스텝으로는 형식(관련:/다음:)을 익히지 못했다.
- **학습 데이터에 없는 행동**: 모범 답변에 없는 마크다운(`**`, 백틱)이 3건에서 나왔다.
- **반복 생성**: `tech-redis-01` 은 같은 구절을 512토큰까지 반복, `manip-k8s-01` 도 같은 문장을 되풀이.
- **근거 없는 주장**: `skill-main-01` 이 이력에 없는 Python·Webix 등을 주력 기술로 나열. `tech-redis-01` 이 Redis 를 React Router 와 엮는 내용을 지어냄 (실제 근거: Polestar 10 공통 인증 계층의 로그인·권한 정보 저장).
- **지시 공격**: `manip-k8s-01` 은 학습 전후 모두 조작 요구를 그대로 따름.
- **맞은 사례**: `unknown-age-01`("포트폴리오에 없습니다"), `overview-ansim-01` 본문 내용은 원문과 일치 (형식은 미흡).

## 3. 실패 원인 추정

- **과소 학습**: 34건 × 2 epoch ÷ accum 8 = 최적화 10스텝(1스텝 건너뜀), lr 1e-4. eval loss 가 계속 내려가는 중에 끝났다 (과적합 신호 없음).
- **생성 설정**: greedy + repetition_penalty 1.0 에서 소형 모델의 반복이 그대로 드러남.
- **데이터 규모**: 학습 34건, 범주당 1~5건.

## 4. 다음 실험 (v2)

- accum 8 → 4, epoch 2 → 6, lr 1e-4 → 2e-4 (최적화 약 54스텝), epoch 마다 검증하고 검증 손실 최저 epoch 을 최종 어댑터로.
- 생성 repetition_penalty 1.1 을 학습 전후 모두에 똑같이 적용하고 학습 전 답변도 다시 생성.
- 같은 기반 모델 커밋 고정 (`70d244c…`).

## 5. 미검증

- 사람 평가 표(사실 정확성·근거 없는 주장 등)의 칸별 집계.
- test 7건 밖의 질문, 여러 턴 대화.
- 운영 연결(Worker → 추론 서버)의 지연·비용.
