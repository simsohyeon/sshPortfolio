# 포트폴리오 질문하기 API (Cloudflare Worker)

포트폴리오 사이트의 "💬 질문하기" 위젯이 호출하는 백엔드입니다.
`src/data/resume.js`를 시스템 프롬프트로 넣고 Claude API에 질문을 전달해 답변을 스트리밍합니다.
API 키는 Worker 안에만 두므로 정적 사이트(GitHub Pages)에 노출되지 않습니다.

## 구성

```
api/
├── src/index.js     Worker 진입점 - POST /chat (SSE), GET /health, CORS
├── src/context.js   resume.js → 시스템 프롬프트 변환 (전화번호 제외)
├── wrangler.toml    Worker 설정 (허용 출처 ALLOWED_ORIGINS)
└── .dev.vars.example 로컬 개발용 키 파일 예시
```

- 모델: `claude-opus-5-5`, effort `low` (짧은 Q&A에 맞춰 속도·비용 우선)
- 시스템 프롬프트에 프롬프트 캐시를 걸어 같은 문맥의 입력 비용을 줄입니다
- 안전 분류기 거절 시 서버 측 fallback(`fallbacks: "default"`)으로 다른 모델이 이어서 답합니다
- 대화는 최근 12개 메시지, 메시지당 1,000자, 답변 1,024 토큰으로 제한합니다

## 준비물

1. **Anthropic API 키** - https://platform.claude.com 에서 발급 (선불 크레딧 충전 필요)
2. **Cloudflare 계정** - Workers 무료 플랜이면 충분 (카드 등록 불필요)

## 로컬 실행

```bash
cd api
npm install
cp .dev.vars.example .dev.vars   # ANTHROPIC_API_KEY 채우기
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
npx wrangler login                          # 최초 1회, 브라우저 로그인
npx wrangler secret put ANTHROPIC_API_KEY   # 키 입력 (파일에 저장되지 않음)
npm run deploy                              # https://sshportfolio-chat.<계정>.workers.dev
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

## 비용 감 잡기

시스템 프롬프트(이력 전체)는 약 1만 자입니다. 첫 질문은 문맥 전체를 읽고, 5분 안의 후속 질문은 캐시에서 읽어 입력 비용이 크게 줄어듭니다.
질문 하나당 대략 10~40원 수준이며, Cloudflare 대시보드에서 요청 수를, Anthropic 콘솔에서 토큰 사용량을 볼 수 있습니다.
더 저렴하게 쓰려면 `src/index.js`의 `MODEL`을 `claude-haiku-4-5`로 바꾸면 됩니다 (이 경우 `fallbacks`·`output_config` 줄은 제거).

## 보안 메모

- `ALLOWED_ORIGINS`에 적힌 출처만 허용합니다. 다른 도메인에서 호출하면 브라우저가 차단합니다.
- 다만 curl 등 브라우저 밖에서는 CORS가 막지 못하므로, 사용량이 걱정되면 Cloudflare 대시보드에서 **Rate Limiting 규칙**(예: IP당 분당 10회)을 추가하세요.
