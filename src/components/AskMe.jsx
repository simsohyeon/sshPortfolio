import { useEffect, useRef, useState } from "react";
import resume from "../data/resume";

// 포트폴리오 "질문하기" 위젯.
// VITE_CHAT_API_URL 이 비어 있으면 아무것도 렌더하지 않는다 (API 없이도 사이트는 그대로 동작).
const API_URL = (import.meta.env.VITE_CHAT_API_URL || "").replace(/\/$/, "");
const STORAGE_KEY = "askme:messages"; // 새로고침해도 대화 유지 (탭 닫으면 사라짐)

// 모델이 규칙을 어기고 마크다운을 보내도 기호만 걷어낸다 (렌더러 없음)
const plain = t => t
  .replace(/\*\*|__|`/g, "")
  .replace(/^#{1,6}\s+/gm, "")
  .replace(/^\s*[*•]\s+/gm, "- ")
  .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1 $2") // [텍스트](주소) → 텍스트 주소
  .replace(/\s*\[id:\s*[\w-]+\]/g, ""); // 자료의 [id: x] 표기를 본문에 베껴 쓴 경우

const PROJECT_NAMES = Object.fromEntries(
  [...resume.projects, ...(resume.sideProjects || [])].map(p => [p.id, p.name.split(" - ")[0].replace(/\s*\(.*\)$/, "")])
);

// 답변 끝의 메타 줄을 떼어낸다: "관련: id1, id2" → 근거 프로젝트 칩, "다음: 질문1 | 질문2" → 이어서 물어볼 질문
// 메타 줄은 보통 맨 끝 두 줄이지만, 스트리밍 중 머리말만 먼저 도착하거나("관련", "관련:") 서버 안내가 뒤에 붙는 경우도
// 있어서 끝줄만 보지 않고 모든 줄에서 걸러낸다. 본문 중간에 "관련:" 로 시작하는 문장은 프롬프트상 나오지 않는다.
const META_RE = /^(관련|다음)(?:\s*(?:프로젝트|질문))?\s*:?\s*(.*)$/;
function splitMeta(text) {
  let ids = [];
  let nexts = [];
  const body = text.split("\n").filter(line => {
    const m = line.trim().match(META_RE);
    if (!m) return true;
    if (m[1] === "관련") ids = m[2].split(",").map(x => x.trim()).filter(id => PROJECT_NAMES[id]);
    else nexts = m[2].split("|").map(x => x.trim()).filter(Boolean).slice(0, 2);
    return false;
  });
  return { body: body.join("\n").trim(), ids, nexts };
}
function jumpTo(id) {
  document.getElementById(`proj-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const INITIAL = resume.name.slice(0, 1); // 아바타 글자

// 헤더 아이콘: 글리프마다 크기가 달라서 SVG 로 통일
const ICON = {
  reset: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  stop: (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </svg>
  ),
};

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
  const stickRef = useRef(true); // 목록이 바닥 근처일 때만 새 내용을 따라 스크롤 (위로 올려 읽는 중엔 끌어내리지 않음)

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, open, busy]);

  // 답변이 끝나면(입력창 disabled 해제) 포커스를 되돌린다 - disabled 로 바뀌면 브라우저가 포커스를 body 로 떨어뜨림
  useEffect(() => {
    if (open && !busy) inputRef.current?.focus();
  }, [busy, open]);

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
    stickRef.current = true;
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
        if (patch.notice) last.notice = patch.notice;
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
          if (payload.notice) appendToLast({ notice: payload.notice });
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
        <section
          className="askme-panel"
          role="dialog"
          aria-label="포트폴리오 질문하기"
          onKeyDown={e => { if (e.key === "Escape") setOpen(false); }}
        >
          <header className="askme-head">
            <div className="askme-head-title">{ICON.spark}포트폴리오 도우미</div>
            <div className="askme-head-actions">
              {messages.length > 1 && (
                <button type="button" className="askme-icon" onClick={reset} aria-label="새 대화" title="새 대화">{ICON.reset}</button>
              )}
              <button type="button" className="askme-icon" onClick={() => setOpen(false)} aria-label="닫기" title="닫기">{ICON.close}</button>
            </div>
          </header>

          <div
            className="askme-list"
            ref={listRef}
            aria-live="polite"
            aria-busy={busy}
            onScroll={e => {
              const el = e.currentTarget;
              stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
            }}
          >
            {showSuggestions && (
              <div className="askme-empty">
                <span className="askme-avatar" aria-hidden="true">{INITIAL}</span>
                <h3>무엇이 궁금하세요?</h3>
                <p>{resume.name} 님의 경력·프로젝트·기술에 대해 답해드려요</p>
                <div className="askme-cards">
                  {SUGGESTIONS.map(s => (
                    <button key={s} type="button" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => {
              if (i === 0) return null; // 환영 메시지는 첫 화면 인사로 대체
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
                      {m.notice && <div className="askme-notice">{m.notice}</div>}
                      {m.error && (
                        <div className="askme-error" role="alert">
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
                          <button key={q} type="button" onClick={() => send(q)}>{q}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <form
            className="askme-form"
            onSubmit={e => { e.preventDefault(); send(input); }}
          >
            <div className="askme-input">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="무엇이든 물어보세요"
                aria-label="질문 입력"
                maxLength={1000}
                disabled={busy}
              />
              {busy ? (
                <button type="button" className="askme-send" onClick={stop} aria-label="중지" title="중지">{ICON.stop}</button>
              ) : (
                <button type="submit" className="askme-send" disabled={!input.trim()} aria-label="보내기" title="보내기">{ICON.send}</button>
              )}
            </div>
            <small>AI 답변은 이력 내용을 바탕으로 하며 부정확할 수 있어요</small>
          </form>
        </section>
      )}

      {!open && (
        <button type="button" className="askme-fab" onClick={() => setOpen(true)} aria-label="포트폴리오에 대해 질문하기">
          💬 질문하기
        </button>
      )}
    </div>
  );
}
