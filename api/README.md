# 포트폴리오 질문하기 API (Cloudflare Worker + Gemini)

포트폴리오 사이트의 "💬 질문하기" 위젯이 호출하는 백엔드입니다.
`src/data/resume.js`를 시스템 프롬프트로 넣고 Gemini API에 질문을 전달해 답변을 스트리밍합니다.
API 키는 Worker 안에만 두므로 정적 사이트(GitHub Pages)에 노출되지 않습니다.

## 구성

```
api/
├── src/index.js      Worker 진입점 - POST /chat (SSE), GET /health, CORS
├── src/context.js    resume.js → 시스템 프롬프트 변환 (전화번호 제외)
├── wrangler.toml     Worker 설정 (허용 출처 ALLOWED_ORIGINS, 모델 GEMINI_MODEL)
└── .dev.vars.example 로컬 개발용 키 파일 예시
```

- 모델: `gemini-flash-latest` (wrangler.toml의 `GEMINI_MODEL`로 변경 가능)
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

```bash
cd api
npx wrangler login                       # 최초 1회, 브라우저 로그인
npx wrangler secret put GEMINI_API_KEY   # 키 입력 (파일에 저장되지 않음)
npm run deploy                           # https://sshportfolio-chat.<계정>.workers.dev
```

배포가 끝나면 GitHub 저장소 **Settings → Secrets and variables → Actions → Variables** 에
`CHAT_API_URL` = 위 Worker 주소를 등록합니다. 다음 push부터 사이트에 질문하기 위젯이 켜집니다.
변수를 비워두면 위젯은 렌더되지 않고 사이트는 기존과 똑같이 동작합니다.

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
- 포트폴리오 방문자 트래픽에는 Flash 계열이면 충분하고, 일일 한도가 부족하면 `GEMINI_MODEL`을 Flash-Lite 계열로 바꾸면 한도가 더 넉넉합니다. 현재 모델 ID와 한도는 https://ai.google.dev/gemini-api/docs/models 와 https://ai.google.dev/gemini-api/docs/rate-limits 에서 확인합니다.
- 무료 티어는 입력 내용이 Google 모델 개선에 쓰일 수 있습니다. 이 챗봇은 공개된 이력 정보만 다루므로 문제는 없지만, 알고 쓰는 게 좋습니다.

## 보안 메모

- `ALLOWED_ORIGINS`에 적힌 출처만 허용합니다. 다른 도메인에서 호출하면 브라우저가 차단합니다.
- 다만 curl 등 브라우저 밖에서는 CORS가 막지 못하므로, 무료 한도를 남이 소진하는 게 걱정되면 Cloudflare 대시보드에서 **Rate Limiting 규칙**(예: IP당 분당 5회)을 추가하세요.
