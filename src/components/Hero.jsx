import resume from "../data/resume";

const SUMMARY_BULLETS = [
  "ITSM·EMR 등 엔터프라이즈 솔루션 풀스택 4년차",
  "성능 최적화 / SQL 튜닝 / 운영 안정화 다수 수행",
  "결함 적은 구조 설계 · 데이터 기반 개선",
];

const PRIMARY_STACK = ["React", "TypeScript", "Java", "Spring Boot", "Oracle", "MongoDB"];

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
        <div style={{ maxWidth: "680px" }}>
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
            Java/Spring · React 기반 엔터프라이즈 풀스택 개발자.
            <br />
            운영 안정화 및 성능 최적화 경험 중심.
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
            <a href={resume.contact.github} target="_blank" rel="noreferrer" className="btn btn-secondary">
              GitHub ↗
            </a>
            <a href="#experience" className="btn btn-ghost">
              프로젝트 보기 ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
