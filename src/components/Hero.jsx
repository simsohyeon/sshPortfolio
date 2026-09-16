import resume from "../data/resume";

const SUMMARY_BULLETS = [
  "웹 시스템(IT 운영관리·병원 정보시스템) 풀스택 개발 5년차",
  "금융·공공·민간 고객사 8곳에 공급된 솔루션의 성능 최적화 · SQL 튜닝 · 운영 안정화 수행",
  "AI 하네스 엔지니어링으로 기획 → 개발 → 테스트 자동화",
];

const PRIMARY_STACK = ["React", "Vue", "TypeScript", "Java", "Spring Boot", "PostgreSQL", "MongoDB", "AI 코딩 에이전트"];

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
          <p className="eyebrow">Available for hire · 2026</p>

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
            Java/Spring · React/Vue 기반 웹 풀스택 개발자.
            <br />
            운영 안정화·성능 최적화 경험 위에, AI를 개발 프로세스에 녹인 워크플로로 일합니다.
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
              경력기술서 (PDF) ↗
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
