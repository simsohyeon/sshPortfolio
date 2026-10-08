# 포트폴리오 질문하기 API (Cloudflare Worker + Gemini)

포트폴리오 사이트의 "💬 질문하기" 위젯이 호출하는 백엔드입니다.
`src/data/resume.js`를 시스템 프롬프트로 넣고 Gemini REST API(`streamGenerateContent?alt=sse`)에 질문을 전달해 답변을 스트리밍합니다. 외부 런타임 의존성은 없습니다.
API 키는 Worker 안에만 두므로 정적 사이트(GitHub Pages)에 노출되지 않습니다.

## 구성

```
api/
├── src/index.js      Worker 진입점 - POST /chat (SSE), GET /health, CORS
├── src/context.js    resume.js → 시스템 프롬프트 변환 (전화번호 제외)
├── src/sse.js        Gemini SSE 스트림 파서 (SDK 없이 REST 직접 호출, 끝에 남은 조각까지 처리)
│                     index.js 의 GeminiProxy(Durable Object, 미국 서부 고정)가 실제 Gemini 호출을 담당 - 한국 방문자는 Worker 가 홍콩(HKG)에서 실행되는데 Gemini 가 홍콩을 지원하지 않아서
├── wrangler.toml     Worker 설정 (허용 출처 ALLOWED_ORIGINS, 모델 GEMINI_MODEL)
└── .dev.vars.example 로컬 개발용 키 파일 예시
```

- 모델: `gemini-flash-lite-latest` (wrangler.toml의 `GEMINI_MODEL`로 변경 가능). `gemini-flash-latest` 는 2026-10 기준 gemini-3.8-flash 로 풀리는데 무료 티어 일일 한도가 **20건** 뿐이라 Lite 계열을 기본으로 둔다
- 대화는 최근 12개 메시지, 메시지당 1,000자, 답변 1,024 토큰으로 제한합니다
- 안전 필터에 걸리거나 답변이 비면 안내 문구로 대체합니다

## 준비물

1. **Gemini API 키** - https://aistudio.google.com/apikey 에서 발급 (Google 계정만 있으면 되고, 무료 티어는 결제 등록 불필요)
2. **Cloudflare 계정** - Workers 무료 플랜이면 충분 (카드 등록 불필요)

## 로컬 실행

```bash
cd api
npm install
cp .dev.vars.example .dev.vars   # GEMINI_API_KEY 채우기
npm run dev                       # http://localhost:8787
```

프런트엔드는 저장소 루트에서:

```bash
echo "VITE_CHAT_API_URL=http://localhost:8787" > .env.local
npm run dev
```

## 배포

> `src/data/resume.js` 를 고치면 **Worker 도 다시 배포**해야 챗봇이 새 내용을 봅니다 (`cd api && npm run deploy`). 사이트(Pages)는 push 로 자동 배포되지만 Worker 는 아닙니다.

```bash
cd api
npx wrangler login                       # 최초 1회, 브라우저 로그인
npx wrangler secret put GEMINI_API_KEY   # 키 입력 (파일에 저장되지 않음)
npm run deploy                           # https://sshportfolio-chat.<계정>.workers.dev
```

배포가 끝나면 GitHub 저장소 **Settings → Secrets and variables → Actions → Variables** 에
`CHAT_API_URL` = 위 Worker 주소를 등록합니다. 다음 push부터 사이트에 질문하기 위젯이 켜집니다.
변수를 비워두면 위젯은 렌더되지 않고 사이트는 기존과 똑같이 동작합니다.

## 질문 로그 리뷰

```bash
npm run logs          # 최근 7일 리포트 (stdout + logs/latest.md)
npm run logs -- 30    # 최근 30일
```

리포트에는 "자료에 없어서 못 답한 질문"(답변에 "포트폴리오에 없"이 들어간 건), 오류, 많이 묻는 질문이 정리됩니다.
못 답한 질문 중 공개해도 되는 사실은 `src/data/resume.js` 에 채우고 Worker 를 재배포하면 다음부터 답합니다.

## 질문 로그 (KV)

어떤 질문이 들어오는지 보고 `resume.js` 를 보강하기 위해 질문·토큰수·소요시간만 KV(`CHAT_LOG`)에 90일 보관합니다. IP·UA 는 남기지 않습니다.

```bash
npx wrangler kv namespace create CHAT_LOG   # 출력된 id 를 wrangler.toml 의 kv_namespaces.id 에 적는다
npx wrangler kv key list --binding CHAT_LOG            # 배포본 로그 키 목록 (--local 붙이면 로컬)
npx wrangler kv key get  --binding CHAT_LOG <key>      # 항목 하나 보기
```

로그가 필요 없으면 `wrangler.toml` 의 `[[kv_namespaces]]` 블록을 지우면 됩니다.

## 동작 확인

```bash
curl https://sshportfolio-chat.<계정>.workers.dev/health
curl -N -X POST https://sshportfolio-chat.<계정>.workers.dev/chat \
  -H "Content-Type: application/json" \
  -H "Origin: https://simsohyeon.github.io" \
  -d '{"messages":[{"role":"user","content":"어떤 프로젝트를 했나요?"}]}'
```

## 무료 티어 메모

- 무료 티어는 분당·일일 요청 수 제한이 있고 모델마다 다릅니다. 한도를 넘으면 429가 오고 위젯에는 "잠시 후 다시 시도" 안내가 뜹니다.
- 한도는 모델마다 다르고 자주 바뀝니다. 실제 수치는 https://aistudio.google.com/rate-limit 에서 내 프로젝트 기준으로 확인합니다. 한도를 넘으면 429가 오고 위젯엔 "요청이 많아 잠시 쉬어가는 중" 안내가 뜹니다. 질문 로그(KV)의 `error` 에 어떤 한도(분당/일일)인지 원문이 남습니다. 현재 모델 ID와 한도는 https://ai.google.dev/gemini-api/docs/models 와 https://ai.google.dev/gemini-api/docs/rate-limits 에서 확인합니다.
- 무료 티어는 입력 내용이 Google 모델 개선에 쓰일 수 있습니다. 이 챗봇은 공개된 이력 정보만 다루므로 문제는 없지만, 알고 쓰는 게 좋습니다.

## 지역 메모

- Gemini API 는 홍콩 등 일부 지역에서 호출을 거부합니다("User location is not supported"). Cloudflare 는 방문자와 가까운 데이터센터에서 Worker 를 실행하므로 한국 방문자의 요청이 HKG 에서 처리되면 Gemini 가 400 을 냅니다. 그래서 Gemini 호출만 `locationHint: "wnam"` 으로 만든 Durable Object(GeminiProxy) 안에서 합니다. `/health` 응답의 `colo` 로 Worker 실행 위치를 볼 수 있습니다.

## 요청 제한

Workers Rate Limiting 바인딩(무료)으로 Worker 안에서 막습니다. workers.dev 주소에는 대시보드의 WAF Rate Limiting 규칙을 걸 수 없기 때문입니다.

- 방문자 IP당 60초에 10회, 전체 합계 60초에 40회 (`wrangler.toml` 의 `[[ratelimits]]`)
- 넘으면 Gemini 를 호출하지 않고 429 → 위젯에 "요청이 많아 잠시 쉬어가는 중" + 다시 시도
- Rate Limiting 바인딩은 데이터센터별로 따로 세기 때문에, 카운트는 한 곳에서만 도는 GeminiProxy(Durable Object) 안에서 합니다. 그래서 설정값 그대로 적용됩니다.

## 보안 메모

- `ALLOWED_ORIGINS`에 적힌 출처만 허용합니다. 다른 도메인에서 호출하면 브라우저가 차단합니다.
- curl 등 브라우저 밖에서는 CORS가 막지 못합니다. 그래서 위의 요청 제한을 둡니다.
