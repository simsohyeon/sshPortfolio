// SSE(text/event-stream) 본문을 이벤트 단위로 읽어 JSON 으로 돌려주는 파서.
// @google/genai SDK 는 스트림이 구분자 없이 끝나면 "Incomplete JSON segment at the end" 를 던진다
// (googleapis/js-genai#1342). 여기서는 마지막에 남은 조각도 완전한 이벤트면 처리하고, 아니면 cut 으로 알린다.
const DELIM = /\r?\n\r?\n/;

function parseEvent(raw) {
  const data = raw
    .split(/\r?\n/)
    .filter(l => l.startsWith("data:"))
    .map(l => l.slice(5).trim())
    .join("\n");
  if (!data) return undefined; // 주석·빈 이벤트
  return JSON.parse(data); // 깨진 JSON 은 호출자가 잡는다
}

// yield: 파싱된 이벤트 객체. 스트림이 조각 중간에서 끊기면 { cut: true } 를 마지막으로 yield
export async function* readSSE(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let m;
    while ((m = DELIM.exec(buffer))) {
      const raw = buffer.slice(0, m.index);
      buffer = buffer.slice(m.index + m[0].length);
      const ev = parseEvent(raw);
      if (ev !== undefined) yield ev;
    }
  }
  buffer += decoder.decode();
  if (buffer.trim()) {
    try {
      const ev = parseEvent(buffer);
      if (ev !== undefined) yield ev;
    } catch {
      yield { cut: true };
    }
  }
}
