#!/usr/bin/env node
// 챗봇 질문 로그(KV CHAT_LOG) 리뷰 리포트.
// 사용법: npm run logs            → 최근 7일
//        npm run logs -- 30       → 최근 30일
// wrangler 로그인이 되어 있어야 한다 (npx wrangler whoami). 결과는 stdout 과 logs/latest.md 에 쓴다.
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const API_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const days = Number(process.argv[2] || 7);
const since = new Date(Date.now() - days * 864e5).toISOString();

function wrangler(args) {
  const out = execSync(`npx wrangler ${args}`, { encoding: "utf8", cwd: API_DIR, stdio: ["ignore", "pipe", "ignore"] });
  // 경고 줄 등을 건너뛰고 첫 JSON 토큰부터 파싱
  const i = Math.min(...["[", "{"].map(c => out.indexOf(c)).filter(x => x >= 0));
  return JSON.parse(out.slice(i));
}

// 1) 키 목록 (키 = ISO 시각 + 난수) → 기간 필터
const keys = wrangler("kv key list --binding CHAT_LOG --remote").map(k => k.name).filter(k => k >= since).sort();
if (!keys.length) {
  console.log(`최근 ${days}일 로그가 없습니다.`);
  process.exit(0);
}

// 2) 값 일괄 조회 (100개씩)
const entries = [];
for (let i = 0; i < keys.length; i += 100) {
  const file = join(tmpdir(), `chatlog-keys-${i}.json`);
  writeFileSync(file, JSON.stringify(keys.slice(i, i + 100)));
  const got = wrangler(`kv bulk get "${file}" --binding CHAT_LOG --remote`);
  for (const [k, v] of Object.entries(got)) {
    try { entries.push({ key: k, ...JSON.parse(v) }); } catch { /* 깨진 값은 건너뜀 */ }
  }
}
entries.sort((a, b) => (a.ts > b.ts ? 1 : -1));

// 3) 집계
const count = (arr, f) => arr.reduce((m, x) => { const k = f(x); if (k != null) m[k] = (m[k] || 0) + 1; return m; }, {});
const norm = q => (q || "").trim().toLowerCase().replace(/\s+/g, " ").replace(/[?？!.。]+$/g, "");
const errors = entries.filter(e => e.error);
const answered = entries.filter(e => !e.error);
const misses = answered.filter(e => e.miss === true || (e.miss == null && /포트폴리오에 없/.test(e.a || "")));
const tokens = answered.reduce((s, e) => ({ input: s.input + (e.tokens?.input || 0), output: s.output + (e.tokens?.output || 0) }), { input: 0, output: 0 });
const avgMs = answered.length ? Math.round(answered.reduce((s, e) => s + (e.ms || 0), 0) / answered.length) : 0;
const byQuestion = Object.entries(count(entries, e => norm(e.q))).sort((a, b) => b[1] - a[1]);
const finishes = count(answered, e => e.finish || "-");
const errorKinds = count(errors, e => String(e.error).slice(0, 60));

const fmt = d => d.slice(0, 16).replace("T", " ");
const lines = [];
lines.push(`# 챗봇 질문 로그 리포트 (최근 ${days}일, ${fmt(since)} ~ ${fmt(new Date().toISOString())} UTC)`, "");
lines.push(`- 질문 ${entries.length}건 · 답변 ${answered.length} · 오류 ${errors.length} · 자료 없음 ${misses.length}`);
lines.push(`- 평균 응답 ${avgMs}ms · 토큰 입력 ${tokens.input.toLocaleString()} / 출력 ${tokens.output.toLocaleString()}`);
lines.push(`- 종료 사유: ${Object.entries(finishes).map(([k, v]) => `${k} ${v}`).join(", ") || "-"}`, "");

lines.push(`## 자료에 없어서 못 답한 질문 (${misses.length}) - resume.js 보강 후보`);
if (!misses.length) lines.push("- 없음");
for (const e of misses.slice(-40).reverse()) lines.push(`- [${fmt(e.ts)}] ${e.q}${e.a ? `\n  → ${e.a.slice(0, 140).replace(/\n+/g, " ")}` : ""}`);
lines.push("");

lines.push(`## 오류 (${errors.length})`);
if (!errors.length) lines.push("- 없음");
for (const [k, v] of Object.entries(errorKinds).sort((a, b) => b[1] - a[1])) lines.push(`- ${v}건: ${k}`);
for (const e of errors.slice(-10).reverse()) lines.push(`  - [${fmt(e.ts)}] ${e.q}`);
lines.push("");

lines.push(`## 많이 묻는 질문 (상위 ${Math.min(30, byQuestion.length)})`);
for (const [q, n] of byQuestion.slice(0, 30)) lines.push(`- ${n}× ${q}`);
lines.push("");

lines.push(`## 전체 질문 (최근순, 최대 100)`);
for (const e of entries.slice(-100).reverse()) {
  const tag = e.error ? "오류" : (e.miss === true || /포트폴리오에 없/.test(e.a || "")) ? "자료없음" : "답변";
  lines.push(`- [${fmt(e.ts)}] (${tag}) ${e.q}`);
}

const report = lines.join("\n");
console.log(report);
mkdirSync(join(API_DIR, "logs"), { recursive: true });
writeFileSync(join(API_DIR, "logs", "latest.md"), report);
console.error(`\n→ logs/latest.md 에 저장했습니다.`);
