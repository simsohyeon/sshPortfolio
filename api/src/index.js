// Cloudflare Worker - 포트폴리오 "질문하기" 챗봇 API (Gemini API)
// POST /chat  { messages: [{ role: "user"|"assistant", content: string }, ...] }
// 응답: text/event-stream  (data: {"text": "..."} / data: {"notice": "..."} / data: {"done": true} / data: {"error": "..."})
//       스트림을 열기 전에 실패하면 JSON { error } 를 HTTP 상태코드와 함께 돌려준다 (429, 4xx, 5xx)
import { buildSystemPrompt } from "./context.js";
import { readSSE } from "./sse.js";

const DEFAULT_MODEL = "gemini-flash-lite-latest"; // wrangler.toml 의 GEMINI_MODEL 로 덮어쓸 수 있다
const MAX_MESSAGES = 12; // 보내는 대화 길이 상한 (user+assistant 합계)
const MAX_MESSAGE_CHARS = 1000; // 방문자 메시지 하나의 글자 수 상한 (assistant 답변은 서버가 만든 것이라 검사하지 않는다)
const MAX_OUTPUT_TOKENS = 1024;
const MAX_OUTPUT_TOKENS_WITH_THINKING = 4096; // thinkingConfig 를 못 쓰는 모델은 생각 토큰이 상한을 먹으므로 넉넉히
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const RATE_LIMITED = "rate limited"; // 우리 요청 제한에 걸린 429 (Gemini 의 한도 429 와 구분해 로그를 남기지 않는다)

// 시스템 프롬프트는 요청마다 같아야 하므로 모듈 로드 시 1회 생성
const SYSTEM_PROMPT = buildSystemPrompt();

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const ok = allowed.length === 0 || allowed.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin || "*" : allowed[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

// 클라이언트가 보낸 대화를 검증하고 Gemini contents 형식으로 정리한다
function sanitizeMessages(input) {
  if (!Array.isArray(input) || input.length === 0) return { error: "messages가 비어 있습니다." };
  const trimmed = input.slice(-MAX_MESSAGES);
  const messages = [];
  for (const m of trimmed) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return { error: "role이 올바르지 않습니다." };
    if (typeof m.content !== "string") return { error: "content는 문자열이어야 합니다." };
    const content = m.content.trim();
    if (!content) continue; // 실패한 턴의 빈 assistant 등
    if (m.role === "user" && content.length > MAX_MESSAGE_CHARS) {
      return { error: `메시지는 ${MAX_MESSAGE_CHARS}자 이내로 입력해 주세요.` };
    }
    const last = messages[messages.length - 1];
    if (last && last.role === m.role) {
      // 같은 role 연속: user 는 앞 질문이 실패했다는 뜻이므로 최신 것으로 교체, assistant 는 이어 붙인다
      if (m.role === "user") last.content = content;
      else last.content += "\n" + content;
    } else {
      messages.push({ role: m.role, content });
    }
  }
  // 첫 메시지는 user여야 한다
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return { error: "마지막 메시지는 user여야 합니다." };
  }
  // Gemini는 assistant 역할을 "model" 로 부른다
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  return { contents };
}

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function errorMessage(err) {
  if (err instanceof ApiError) {
    if (err.status === 400 && /api key/i.test(err.message)) return "API 키가 올바르지 않습니다.";
    if (err.status === 401 || err.status === 403) return "API 키가 올바르지 않거나 권한이 없습니다.";
    if (err.status === 429) return "요청이 많아 잠시 쉬어가는 중입니다. 잠시 후 다시 시도해 주세요.";
    if (err.status >= 500) return "답변 모델이 잠시 바쁩니다. 몇 초 뒤 다시 시도해 주세요.";
    return `API 오류 (${err.status})`;
  }
  return "잠시 후 다시 시도해 주세요.";
}

// 질문 로그: 어떤 질문이 들어오는지 보고 resume.js 를 보강하기 위한 용도. IP·UA 등 개인정보는 남기지 않는다
function logChat(env, ctx, entry) {
  if (!env.CHAT_LOG) return;
  const key = `${entry.ts}-${Math.random().toString(36).slice(2, 8)}`;
  ctx.waitUntil(
    env.CHAT_LOG.put(key, JSON.stringify(entry), { expirationTtl: 60 * 60 * 24 * 90 }).catch(e => console.error("log error", e))
  );
}

// Gemini 호출은 이 Durable Object 안에서 한다. Worker 는 방문자 근처(한국이면 홍콩 HKG)에서 실행되는데
// Gemini API 가 홍콩을 지원하지 않아 "User location is not supported" 400 이 났다.
// DO 는 처음 만들 때 locationHint 로 리전을 고정할 수 있어서, 미국 서부에서 호출하도록 한다.
// 요청 제한도 여기서 센다: Rate Limiting 바인딩은 데이터센터별로 따로 세는데, DO 는 한 곳에서만 돌아 카운터가 하나로 모인다.
export class GeminiProxy {
  constructor(state, env) {
    this.env = env;
  }
  async fetch(request) {
    const ip = request.headers.get("x-client-ip") || "unknown";
    const [perIp, global] = await Promise.all([
      this.env.RL_IP ? this.env.RL_IP.limit({ key: ip }) : { success: true },
      this.env.RL_GLOBAL ? this.env.RL_GLOBAL.limit({ key: "all" }) : { success: true },
    ]);
    if (!perIp.success || !global.success) {
      return json({ error: { code: 429, message: RATE_LIMITED } }, 429, {});
    }
    const model = request.headers.get("x-model");
    const res = await fetch(`${GEMINI_BASE}/models/${model}:streamGenerateContent?alt=sse`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": this.env.GEMINI_API_KEY },
      body: request.body,
    });
    return new Response(res.body, { status: res.status, headers: { "Content-Type": res.headers.get("Content-Type") || "text/plain" } });
  }
}

async function readError(res) {
  let msg = res.statusText;
  try { msg = (await res.json()).error?.message || msg; } catch { /* 본문 없음 */ }
  return msg;
}

// Gemini REST 스트리밍 호출(DO 경유). SDK 대신 직접 호출해 마지막 조각까지 우리가 파싱한다 (sse.js 참고)
// thinking 은 최소로: 생각 토큰이 maxOutputTokens 를 소진해 답이 41토큰 만에 잘리던 문제.
// 모델이 thinkingConfig 를 거부하면("-latest" 별칭이 바뀌었을 때, 400 본문에 thinking 언급) 옵션 없이 상한을 넉넉히 해서 한 번 더 시도.
// 5xx(모델 과부하 등)는 1초 뒤 한 번 재시도한다.
async function openGeminiStream(env, model, contents, ip) {
  const proxy = env.GEMINI_PROXY.get(env.GEMINI_PROXY.idFromName("us"), { locationHint: "wnam" });
  const call = (thinkingConfig, maxOutputTokens) => proxy.fetch("https://gemini-proxy/", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-model": model, "x-client-ip": ip },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens, temperature: 0.3, ...(thinkingConfig && { thinkingConfig }) },
    }),
  });
  let res = await call({ thinkingLevel: "minimal" }, MAX_OUTPUT_TOKENS);
  if (res.status === 400) {
    const msg = await readError(res);
    if (!/thinking/i.test(msg)) throw new ApiError(400, msg);
    console.warn("thinkingConfig rejected by", model, "- retrying without it");
    res = await call(null, MAX_OUTPUT_TOKENS_WITH_THINKING);
  }
  if (res.status >= 500) {
    const msg = await readError(res);
    console.warn("gemini", res.status, msg, "- retrying once");
    await new Promise(r => setTimeout(r, 1000));
    res = await call({ thinkingLevel: "minimal" }, MAX_OUTPUT_TOKENS);
  }
  if (!res.ok) throw new ApiError(res.status, await readError(res));
  if (!res.body) throw new Error("Gemini 응답 본문이 비어 있습니다.");
  return readSSE(res.body);
}

async function handleChat(request, env, ctx) {
  const startedAt = Date.now();
  const origin = request.headers.get("Origin") || "";
  const cors = corsHeaders(origin, env);

  if (!env.GEMINI_API_KEY) {
    return json({ error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다." }, 500, cors);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON 본문이 필요합니다." }, 400, cors);
  }

  const { contents, error } = sanitizeMessages(body?.messages);
  if (error) return json({ error }, 400, cors);

  const model = env.GEMINI_MODEL || DEFAULT_MODEL;
  const question = contents[contents.length - 1]?.parts?.[0]?.text || "";
  const entry = extra => ({
    ts: new Date(startedAt).toISOString(),
    q: question.slice(0, 300),
    turns: contents.length,
    ms: Date.now() - startedAt,
    ...extra,
  });

  // 스트림을 열기 전에 실패하면(요청 제한, 키 오류, Gemini 한도·장애) 일반 HTTP 오류로 돌려준다
  let events;
  try {
    events = await openGeminiStream(env, model, contents, request.headers.get("CF-Connecting-IP") || "unknown");
  } catch (err) {
    const limited = err instanceof ApiError && err.status === 429 && err.message === RATE_LIMITED;
    if (!limited) {
      console.error("chat error", err);
      logChat(env, ctx, entry({ tokens: { input: 0, output: 0 }, finish: null, error: String(err?.message || err).slice(0, 400) }));
    }
    return json({ error: errorMessage(err) }, err instanceof ApiError ? err.status : 502, cors);
  }

  const encoder = new TextEncoder();
  const sse = new ReadableStream({
    async start(controller) {
      const send = obj => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      let finishReason;
      let usage;
      let sentAny = false;
      let logError;
      try {
        for await (const ev of events) {
          if (ev.cut) {
            // 스트림이 조각 중간에서 끊김. 이미 보낸 답은 살리고, 끊겼다는 안내(+다시 시도)를 붙인다
            finishReason = finishReason || "STREAM_CUT";
            break;
          }
          if (ev.error) throw new ApiError(ev.error.code || 500, ev.error.message || "unknown");
          const cand = ev.candidates?.[0];
          const text = (cand?.content?.parts || []).map(p => p.text || "").join("");
          if (text) {
            sentAny = true;
            send({ text });
          }
          if (cand?.finishReason) finishReason = cand.finishReason;
          if (ev.usageMetadata) usage = ev.usageMetadata;
          if (ev.promptFeedback?.blockReason) finishReason = "SAFETY";
        }

        // 서버 안내문은 text 와 섞지 않고 notice 로 보낸다 - 본문 끝의 "관련:/다음:" 메타 줄 파싱을 깨지 않도록
        if (finishReason === "STREAM_CUT") {
          send({ error: "답변이 중간에 끊겼습니다." });
        } else if (finishReason === "SAFETY" || finishReason === "PROHIBITED_CONTENT" || finishReason === "RECITATION") {
          const msg = "죄송합니다. 이 질문에는 답변드리기 어렵습니다. 포트폴리오 관련 질문을 해 주세요.";
          send(sentAny ? { notice: msg } : { text: msg });
        } else if (finishReason === "MAX_TOKENS") {
          send({ notice: "답변이 길어 여기서 줄였습니다. 더 구체적으로 물어봐 주세요." });
        } else if (!sentAny) {
          send({ text: "답변을 만들지 못했습니다. 질문을 조금 바꿔서 다시 시도해 주세요." });
        }

        send({
          done: true,
          usage: {
            input: usage?.promptTokenCount ?? 0,
            cached: usage?.cachedContentTokenCount ?? 0,
            output: usage?.candidatesTokenCount ?? 0,
          },
        });
      } catch (err) {
        console.error("chat error", err);
        send({ error: errorMessage(err) });
        logError = String(err?.message || err).slice(0, 400); // 로그엔 원인 그대로 (화면 문구 말고). 429 는 한도 종류가 뒤쪽에 나온다
      } finally {
        controller.close();
        logChat(env, ctx, entry({
          tokens: { input: usage?.promptTokenCount ?? 0, output: usage?.candidatesTokenCount ?? 0 },
          finish: finishReason || null,
          error: logError || null,
        }));
      }
    },
  });

  return new Response(sse, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      ...cors,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }
    if (url.pathname === "/health") {
      return json({ ok: true, model: env.GEMINI_MODEL || DEFAULT_MODEL, colo: request.cf?.colo }, 200, corsHeaders(origin, env));
    }
    if (url.pathname === "/chat" && request.method === "POST") {
      return handleChat(request, env, ctx);
    }
    return json({ error: "Not found" }, 404, corsHeaders(origin, env));
  },
};
