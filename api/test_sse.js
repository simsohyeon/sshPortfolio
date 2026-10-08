// node test_sse.js  - readSSE 가 구분자 없이 끝난 마지막 이벤트와 잘린 조각을 제대로 다루는지 확인
import assert from "node:assert/strict";
import { readSSE } from "./src/sse.js";

function stream(chunks) {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(c) {
      for (const ch of chunks) c.enqueue(enc.encode(ch));
      c.close();
    },
  });
}

async function collect(chunks) {
  const out = [];
  for await (const ev of readSSE(stream(chunks))) out.push(ev);
  return out;
}

// 1) 정상: \r\n\r\n 구분, 이벤트가 청크 경계에서 쪼개져도 됨
assert.deepEqual(
  await collect(['data: {"a":1}\r\n\r\ndata: {"b":', '2}\r\n\r\n']),
  [{ a: 1 }, { b: 2 }]
);
// 2) SDK 가 죽던 케이스: 마지막 이벤트 뒤에 구분자 없이 스트림 종료 → 그래도 이벤트로 처리
assert.deepEqual(
  await collect(['data: {"a":1}\n\n', 'data: {"last":true}']),
  [{ a: 1 }, { last: true }]
);
// 3) 진짜 잘린 JSON → cut 신호
assert.deepEqual(
  await collect(['data: {"a":1}\n\n', 'data: {"broken":']),
  [{ a: 1 }, { cut: true }]
);
// 4) 멀티바이트(한글)가 청크 경계에서 쪼개져도 됨
const bytes = new TextEncoder().encode('data: {"t":"한글"}\n\n');
const half = bytes.length - 6;
const dec = new TextDecoder();
const out = [];
const enc = new TextEncoder();
const s = new ReadableStream({
  start(c) { c.enqueue(bytes.slice(0, half)); c.enqueue(bytes.slice(half)); c.close(); },
});
for await (const ev of readSSE(s)) out.push(ev);
assert.deepEqual(out, [{ t: "한글" }]);
void dec; void enc;

console.log("sse ok");
