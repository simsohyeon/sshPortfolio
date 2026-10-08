import { useEffect, useRef, useState } from "react";
import resume from "../data/resume";

// 포트폴리오 "질문하기" 위젯.
// VITE_CHAT_API_URL 이 비어 있으면 아무것도 렌더하지 않는다 (API 없이도 사이트는 그대로 동작).
const API_URL = (import.meta.env.VITE_CHAT_API_URL || "").replace(/\/$/, "");
const STORAGE_KEY = "askme:messages"; // 새로고침해도 대화 유지 (탭 닫으면 사라짐)

// 모델이 규칙을 어기고 마크다운을 보내도 기호만 걷어낸다 (렌더러 없음)
const plain = t => t.replace(/\*\*|__|`/g, "").replace(/^#{1,6}\s+/gm, "").replace(/^\s*[*•]\s+/gm, "- ");

const PROJECT_NAMES = Object.fromEntries(
  [...resume.projects, ...(resume.sideProjects || [])].map(p => [p.id, p.name.split(" - ")[0].replace(/\s*\(.*\)$/, "")])
);

// 답변 끝의 메타 줄을 떼어낸다: "관련: id1, id2" → 근거 프로젝트 칩, "다음: 질문1 | 질문2" → 이어서 물어볼 질문
function splitMeta(text) {
  const lines = text.trimEnd().split("\n");
  let ids = [];
  let nexts = [];
  while (lines.length) {
    const last = lines[lines.length - 1].trim();
    const rel = last.match(/^관련\s*:\s*(.+)$/);
    const nxt = last.match(/^다음\s*:\s*(.+)$/);
    if (rel) ids = rel[1].split(",").map(x => x.trim()).filter(id => PROJECT_NAMES[id]);
    else if (nxt) nexts = nxt[1].split("|").map(x => x.trim()).filter(Boolean).slice(0, 2);
    else if (last === "") { /* 메타 줄 앞의 빈 줄 */ }
    else break;
    lines.pop();
  }
  return { body: lines.join("\n").trimEnd(), ids, nexts };
}
function jumpTo(id) {
  document.getElementById(`proj-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const INITIAL = resume.name.slice(0, 1); // 아바타 글자

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

function loadMessages() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) && saved.length ? [WELCOME, ...saved] : [WELCOME];
  } catch {
    return [WELCOME];
  }
}

export default function AskMe() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadMessages);
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
  }, [messages, open, busy]);

  // 대화 저장 (환영 메시지 제외). 답변 생성 중엔 완성본만 남기도록 busy 가 풀릴 때 저장
  useEffect(() => {
    if (busy) return;
    try {
      const toSave = messages.slice(1).filter(m => m.content || m.error); // [0] 은 항상 환영 메시지
      if (toSave.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* 저장 불가 환경 */ }
  }, [messages, busy]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (!API_URL) return null;

  function stop() {
    abortRef.current?.abort();
  }

  function reset() {
    stop();
    setMessages([WELCOME]);
    setInput("");
    inputRef.current?.focus();
  }

  // 실패한 답변의 "다시 시도": 마지막 질문을 실패한 턴 없이 다시 보낸다
  function retry() {
    const last = messages[messages.length - 1];
    const q = messages[messages.length - 2];
    if (!last?.error || q?.role !== "user") return;
    send(q.content, messages.slice(0, -2));
  }

  async function send(text, base = messages) {
    const question = text.trim();
    if (!question || busy) return;

    // 환영 메시지는 서버로 보내지 않는다
    const history = base.slice(1); // [0] 은 환영 메시지
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
      if (err.name === "AbortError") {
        // 중지: 지금까지 받은 내용은 그대로 두고, 아무것도 못 받았으면 안내만
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return last?.role === "assistant" && !last.content
            ? [...prev.slice(0, -1), { ...last, content: "(중지됨)" }]
            : prev;
        });
      } else {
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

  const lastIndex = messages.length - 1;
  const showSuggestions = messages.length === 1 && !busy;

  return (
    <div className="no-print askme-root">
      {open && (
        <section className="askme-panel" role="dialog" aria-label="포트폴리오 질문하기">
          <header className="askme-head">
            <div className="askme-head-id">
              <span className="askme-avatar" aria-hidden="true">{INITIAL}</span>
              <div className="askme-head-text">
                <strong>{resume.name} 님의 포트폴리오 도우미</strong>
                <span className="askme-online">AI가 이력 내용을 바탕으로 답합니다</span>
              </div>
            </div>
            <div className="askme-head-actions">
              {messages.length > 1 && (
                <button type="button" className="askme-icon" onClick={reset} aria-label="새 대화" title="새 대화">↺</button>
              )}
              <button type="button" className="askme-icon" onClick={() => setOpen(false)} aria-label="닫기" title="닫기">×</button>
            </div>
          </header>

          <div className="askme-list" ref={listRef}>
            {messages.map((m, i) => {
              const isAssistant = m.role === "assistant";
              const { body, ids, nexts } = isAssistant ? splitMeta(plain(m.content)) : { body: m.content, ids: [], nexts: [] };
              const isLast = i === lastIndex;
              const showNexts = isAssistant && isLast && !busy && nexts.length > 0;
              return (
                <div key={i} className={`askme-msg askme-${m.role}`}>
                  {isAssistant && <span className="askme-avatar" aria-hidden="true">{INITIAL}</span>}
                  <div className="askme-col">
                    <div className="askme-bubble">
                      {body || (busy && isLast
                        ? <span className="askme-dots" role="status" aria-label="답변 작성 중"><i /><i /><i /></span>
                        : null)}
                      {m.error && (
                        <div className="askme-error">
                          {m.error}
                          {isLast && !busy && (
                            <button type="button" className="askme-retry" onClick={retry}>다시 시도</button>
                          )}
                        </div>
                      )}
                      {ids.length > 0 && (
                        <div className="askme-related">
                          {ids.map(id => (
                            <button key={id} type="button" className="tag" onClick={() => jumpTo(id)}>
                              {PROJECT_NAMES[id]} ↗
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {showNexts && (
                      <div className="askme-suggest">
                        {nexts.map(q => (
                          <button key={q} type="button" className="tag" onClick={() => send(q)}>{q}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
            {busy ? (
              <button type="button" className="btn" onClick={stop}>중지</button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={!input.trim()}>보내기</button>
            )}
          </form>
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
