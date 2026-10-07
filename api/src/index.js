// Cloudflare Worker - 포트폴리오 "질문하기" 챗봇 API
// POST /chat  { messages: [{ role: "user"|"assistant", content: string }, ...] }
// 응답: text/event-stream  (data: {"text": "..."} / data: {"done": true} / data: {"error": "..."})
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "./context.js";

const MODEL = "claude-opus-5-5";
const MAX_MESSAGES = 12; // 보내는 대화 길이 상한 (user+assistant 합계)
const MAX_MESSAGE_CHARS = 1000; // 메시지 하나의 글자 수 상한
const MAX_OUTPUT_TOKENS = 1024;

// 시스템 프롬프트는 요청마다 같아야 프롬프트 캐시가 적중한다 - 모듈 로드 시 1회 생성
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

// 클라이언트가 보낸 대화를 검증하고 API 형식으로 정리한다
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
    // 같은 role이 연속되면 합친다 (API는 허용하지만 깔끔하게)
    const last = messages[messages.length - 1];
    if (last && last.role === m.role) last.content += "\n" + content;
    else messages.push({ role: m.role, content });
  }
  // 첫 메시지는 user여야 한다
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return { error: "마지막 메시지는 user여야 합니다." };
  }
  return { messages };
}

async function handleChat(request, env) {
  const origin = request.headers.get("Origin") || "";
  const cors = corsHeaders(origin, env);

  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다." }, 500, cors);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON 본문이 필요합니다." }, 400, cors);
  }

  const { messages, error } = sanitizeMessages(body.messages);
  if (error) return json({ error }, 400, cors);

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    // 안전 분류기가 요청을 거절하면 서버 쪽에서 다른 모델로 자동 재시도
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    // 짧은 Q&A라 사고 깊이는 낮게 - 응답 속도·비용 우선
    output_config: { effort: "low" },
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  const sse = new ReadableStream({
    async start(controller) {
      const send = obj => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send({ text: event.delta.text });
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          send({ text: "죄송합니다. 이 질문에는 답변드리기 어렵습니다. 포트폴리오 관련 질문을 해 주세요." });
        } else if (final.stop_reason === "max_tokens") {
          send({ text: "\n\n(답변이 길어 여기서 줄였습니다. 더 구체적으로 물어봐 주세요.)" });
        }
        send({
          done: true,
          usage: {
            input: final.usage.input_tokens,
            cached: final.usage.cache_read_input_tokens ?? 0,
            output: final.usage.output_tokens,
          },
        });
      } catch (err) {
        let message = "잠시 후 다시 시도해 주세요.";
        if (err instanceof Anthropic.AuthenticationError) message = "API 키가 올바르지 않습니다.";
        else if (err instanceof Anthropic.RateLimitError) message = "요청이 많아 잠시 쉬어가는 중입니다. 잠시 후 다시 시도해 주세요.";
        else if (err instanceof Anthropic.APIError) message = `API 오류 (${err.status})`;
        console.error("chat error", err);
        send({ error: message });
      } finally {
        controller.close();
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
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }
    if (url.pathname === "/health") {
      return json({ ok: true, model: MODEL }, 200, corsHeaders(origin, env));
    }
    if (url.pathname === "/chat" && request.method === "POST") {
      return handleChat(request, env);
    }
    return json({ error: "Not found" }, 404, corsHeaders(origin, env));
  },
};
