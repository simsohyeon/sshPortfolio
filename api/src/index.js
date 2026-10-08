// Cloudflare Worker - 포트폴리오 "질문하기" 챗봇 API (Gemini API)
// POST /chat  { messages: [{ role: "user"|"assistant", content: string }, ...] }
// 응답: text/event-stream  (data: {"text": "..."} / data: {"done": true} / data: {"error": "..."})
import { GoogleGenAI, ApiError } from "@google/genai";
import { buildSystemPrompt } from "./context.js";

const DEFAULT_MODEL = "gemini-flash-latest"; // wrangler.toml 의 GEMINI_MODEL 로 덮어쓸 수 있다
const MAX_MESSAGES = 12; // 보내는 대화 길이 상한 (user+assistant 합계)
const MAX_MESSAGE_CHARS = 1000; // 메시지 하나의 글자 수 상한
const MAX_OUTPUT_TOKENS = 1024;

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
    if (!content) continue;
    if (content.length > MAX_MESSAGE_CHARS) return { error: `메시지는 ${MAX_MESSAGE_CHARS}자 이내로 입력해 주세요.` };
    // 같은 role이 연속되면 합친다
    const last = messages[messages.length - 1];
    if (last && last.role === m.role) last.content += "\n" + content;
    else messages.push({ role: m.role, content });
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

function errorMessage(err) {
  if (err instanceof ApiError) {
    if (err.status === 400 && /api key/i.test(err.message)) return "API 키가 올바르지 않습니다.";
    if (err.status === 401 || err.status === 403) return "API 키가 올바르지 않거나 권한이 없습니다.";
    if (err.status === 429) return "요청이 많아 잠시 쉬어가는 중입니다. 잠시 후 다시 시도해 주세요.";
    return `API 오류 (${err.status})`;
  }
  return "잠시 후 다시 시도해 주세요.";
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

  const { contents, error } = sanitizeMessages(body.messages);
  if (error) return json({ error }, 400, cors);

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const model = env.GEMINI_MODEL || DEFAULT_MODEL;

  const encoder = new TextEncoder();
  const sse = new ReadableStream({
    async start(controller) {
      const send = obj => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      let finishReason;
      let usage;
      let sentAny = false;
      let logError;
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            temperature: 0.3,
            thinkingConfig: { thinkingBudget: 0 }, // thinking 토큰이 maxOutputTokens 를 소진해 41토큰 만에 잘리던 문제
          },
        });

        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            sentAny = true;
            send({ text });
          }
          const cand = chunk.candidates?.[0];
          if (cand?.finishReason) finishReason = cand.finishReason;
          if (chunk.usageMetadata) usage = chunk.usageMetadata;
          if (chunk.promptFeedback?.blockReason) finishReason = "SAFETY";
        }

        if (finishReason === "SAFETY" || finishReason === "PROHIBITED_CONTENT" || finishReason === "RECITATION") {
          send({ text: (sentAny ? "\n\n" : "") + "죄송합니다. 이 질문에는 답변드리기 어렵습니다. 포트폴리오 관련 질문을 해 주세요." });
        } else if (finishReason === "MAX_TOKENS") {
          send({ text: "\n\n(답변이 길어 여기서 줄였습니다. 더 구체적으로 물어봐 주세요.)" });
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
        logError = String(err?.message || err).slice(0, 200); // 로그엔 원인 그대로 (화면 문구 말고)
      } finally {
        controller.close();
        // 질문 로그: 어떤 질문이 들어오는지 보고 resume.js 를 보강하기 위한 용도. IP·UA 등 개인정보는 남기지 않는다
        if (env.CHAT_LOG) {
          const last = contents[contents.length - 1]?.parts?.[0]?.text || "";
          const entry = {
            ts: new Date(startedAt).toISOString(),
            q: last.slice(0, 300),
            turns: contents.length,
            ms: Date.now() - startedAt,
            tokens: { input: usage?.promptTokenCount ?? 0, output: usage?.candidatesTokenCount ?? 0 },
            finish: finishReason || null,
            error: logError || null,
          };
          const key = `${entry.ts}-${Math.random().toString(36).slice(2, 8)}`;
          ctx.waitUntil(env.CHAT_LOG.put(key, JSON.stringify(entry), { expirationTtl: 60 * 60 * 24 * 90 }).catch(e => console.error("log error", e)));
        }
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
      return json({ ok: true, model: env.GEMINI_MODEL || DEFAULT_MODEL }, 200, corsHeaders(origin, env));
    }
    if (url.pathname === "/chat" && request.method === "POST") {
      return handleChat(request, env, ctx);
    }
    return json({ error: "Not found" }, 404, corsHeaders(origin, env));
  },
};
