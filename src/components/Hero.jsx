import resume from "../data/resume";

const SUMMARY_BULLETS = [
  "Java/Spring 엔터프라이즈 백엔드 5년차 — 도메인 설계 · 쿼리/인덱스 튜닝 · 배치/메시징",
  "React·Vue로 담당 모듈 화면까지 직접 개발하는 풀스택 커버리지",
  "Claude 스킬 3종을 팀 표준으로 정착 — AI 워크플로우 구축 주도",
];

const PRIMARY_STACK = ["Java", "Spring Boot", "Oracle", "MongoDB", "React", "TypeScript"];

const BulletDot = () => (
  <span style={{
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "var(--color-accent)",
    flexShrink: 0,
    marginTop: "9px",
  }} />
);

export default function Hero() {
  const emailUrl = `mailto:${resume.contact.email}?subject=${encodeURIComponent("채용 문의")}`;

  return (
    <section id="hero" style={{
      paddingTop: "calc(var(--nav-height) + 32px)",
      paddingBottom: "32px",
      background: "var(--color-bg)",
    }}>
      <div className="container">
        <div>
          <p className="eyebrow">Backend Developer · 5년차</p>

          <h1 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(1.85rem, 4.6vw, 2.6rem)",
            fontWeight: 600,
            color: "var(--color-text-strong)",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            margin: "10px 0 0",
          }}>
            {resume.name},{" "}
            <span style={{ color: "var(--color-accent)" }}>{resume.title}</span>
          </h1>

          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(0.95rem, 1.4vw, 1.02rem)",
            fontWeight: 400,
            color: "var(--color-text-soft)",
            marginTop: "12px",
            lineHeight: 1.7,
          }}>
            Java/Spring 백엔드를 주력으로, React·Vue 화면까지 커버하는 엔터프라이즈 개발자입니다.
            <br />
            반복되는 문제를 자동화·표준화로 풀고, 개선 결과를 수치로 확인합니다.
          </p>

          <ul style={{
            listStyle: "none",
            padding: 0,
            marginTop: "16px",
            display: "grid",
            gap: "6px",
          }}>
            {SUMMARY_BULLETS.map((b, i) => (
              <li key={i} style={{
                display: "flex",
                gap: "10px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.92rem",
                fontWeight: 400,
                color: "var(--color-text-soft)",
                lineHeight: 1.7,
              }}>
                <BulletDot />
                {b}
              </li>
            ))}
          </ul>

          <div style={{
            display: "flex", gap: "6px", flexWrap: "wrap",
            marginTop: "18px",
          }}>
            {PRIMARY_STACK.map((s, i) => (
              <span key={i} className="tag">{s}</span>
            ))}
          </div>

          <div className="cta-group" style={{ marginTop: "22px" }}>
            <a href={emailUrl} className="btn btn-primary">
              이메일로 연락하기
            </a>
            <a
              href={resume.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              GitHub ↗
            </a>
            <a
              href={`${import.meta.env.BASE_URL}resume.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              경력기술서 PDF ↗
            </a>
          </div>

          {/* 인쇄/PDF 저장 시에만 노출되는 연락처 영역 */}
          <div className="print-only print-contact">
            <div><strong>Email</strong> &nbsp; {resume.contact.email}</div>
            <div><strong>Phone</strong> &nbsp; {resume.contact.phone}</div>
            <div><strong>GitHub</strong> &nbsp; {resume.contact.github}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
