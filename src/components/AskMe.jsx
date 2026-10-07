import { useEffect, useRef, useState } from "react";
import resume from "../data/resume";

// 포트폴리오 "질문하기" 위젯.
// VITE_CHAT_API_URL 이 비어 있으면 아무것도 렌더하지 않는다 (API 없이도 사이트는 그대로 동작).
const API_URL = (import.meta.env.VITE_CHAT_API_URL || "").replace(/\/$/, "");

const SUGGESTIONS = [
  "어떤 프로젝트를 맡았나요?",
  "AI를 개발에 어떻게 활용하나요?",
  "성능 개선 경험이 있나요?",
  "백엔드 기술 스택이 궁금해요",
];

const WELCOME = {
  role: "assistant",
  content: `안녕하세요. ${resume.name} 님의 포트폴리오 도우미입니다. 경력·프로젝트·기술에 대해 물어보세요.`,
};

export default function AskMe() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (!API_URL) return null;

  async function send(text) {
    const question = text.trim();
    if (!question || busy) return;

    // 환영 메시지는 서버로 보내지 않는다
    const history = messages.filter(m => m !== WELCOME);
    const next = [...history, { role: "user", content: question }];
    setMessages([WELCOME, ...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const appendToLast = patch =>
      setMessages(prev => {
        const copy = prev.slice();
        const last = { ...copy[copy.length - 1] };
        if (patch.text !== undefined) last.content += patch.text;
        if (patch.error) last.error = patch.error;
        copy[copy.length - 1] = last;
        return copy;
      });

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        let msg = "응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요.";
        try { msg = (await res.json()).error || msg; } catch { /* 본문 없음 */ }
        appendToLast({ error: msg });
        return;
      }

      // SSE 파싱: "data: {...}\n\n" 단위
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n\n")) >= 0) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const line = chunk.split("\n").find(l => l.startsWith("data: "));
          if (!line) continue;
          let payload;
          try { payload = JSON.parse(line.slice(6)); } catch { continue; }
          if (payload.text) appendToLast({ text: payload.text });
          if (payload.error) appendToLast({ error: payload.error });
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        appendToLast({ error: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." });
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  }

  const showSuggestions = messages.length === 1 && !busy;

  return (
    <div className="no-print askme-root">
      {open && (
        <section className="askme-panel" role="dialog" aria-label="포트폴리오 질문하기">
          <header className="askme-head">
            <div>
              <strong>질문하기</strong>
              <span>AI가 포트폴리오 내용을 바탕으로 답합니다</span>
            </div>
            <button type="button" className="askme-icon" onClick={() => setOpen(false)} aria-label="닫기">
              ×
            </button>
          </header>

          <div className="askme-list" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`askme-msg askme-${m.role}`}>
                <div className="askme-bubble">
                  {m.content || (busy && i === messages.length - 1 ? <span className="askme-dots" aria-label="답변 작성 중" /> : null)}
                  {m.error && <div className="askme-error">{m.error}</div>}
                </div>
              </div>
            ))}
            {showSuggestions && (
              <div className="askme-suggest">
                {SUGGESTIONS.map(s => (
                  <button key={s} type="button" className="tag" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <form
            className="askme-form"
            onSubmit={e => { e.preventDefault(); send(input); }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="예: Kafka를 어디에 썼나요?"
              maxLength={1000}
              disabled={busy}
            />
            <button type="submit" className="btn btn-primary" disabled={busy || !input.trim()}>
              보내기
            </button>
          </form>
          <p className="askme-note">답변은 AI가 생성하며 정확하지 않을 수 있습니다. 중요한 내용은 이메일로 확인해 주세요.</p>
        </section>
      )}

      <button
        type="button"
        className="askme-fab"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={open ? "질문 창 닫기" : "포트폴리오에 대해 질문하기"}
      >
        {open ? "닫기" : "💬 질문하기"}
      </button>
    </div>
  );
}
