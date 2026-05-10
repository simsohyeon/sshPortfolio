import resume from "../data/resume";

const SUMMARY_BULLETS = [
  "Java/Spring · React 기반 풀스택 개발 4년차",
  "ITSM·EMR 등 엔터프라이즈 솔루션 설계·개발·운영 경험",
  "성능 최적화 / SQL 튜닝 / 운영 안정화 다수 수행",
  "결함 적은 구조 설계 및 데이터 기반 개선",
];

const PRIMARY_STACK = ["React", "TypeScript", "Java", "Spring Boot", "MongoDB", "Oracle"];

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
      paddingTop: "calc(var(--nav-height) + 48px)",
      paddingBottom: "44px",
      background: "var(--color-bg)",
    }}>
      <div className="container">
        <div style={{ maxWidth: "680px" }}>
          <p className="eyebrow">Available for hire · 2026</p>

          <h1 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(1.9rem, 5vw, 2.8rem)",
            fontWeight: 600,
            color: "var(--color-text-strong)",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            margin: "12px 0 0",
          }}>
            {resume.name},{" "}
            <span style={{ color: "var(--color-accent)" }}>{resume.title}</span>
          </h1>

          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(0.95rem, 1.4vw, 1.02rem)",
            fontWeight: 400,
            color: "var(--color-text-soft)",
            marginTop: "14px",
            lineHeight: 1.7,
          }}>
            엔터프라이즈 솔루션을 설계·개발·운영하며 수치로 증명한 개선 성과를
            만들어온 풀스택 개발자입니다. 결함 적은 구조 설계와 성능 최적화에
            강점을 가지고 있습니다.
          </p>

          <ul style={{
            listStyle: "none",
            padding: 0,
            marginTop: "18px",
            display: "grid",
            gap: "8px",
          }}>
            {SUMMARY_BULLETS.map((b, i) => (
              <li key={i} style={{
                display: "flex",
                gap: "10px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.92rem",
                fontWeight: 400,
                color: "var(--color-text-soft)",
                lineHeight: 1.65,
              }}>
                <BulletDot />
                {b}
              </li>
            ))}
          </ul>

          <div style={{
            display: "flex", gap: "6px", flexWrap: "wrap",
            marginTop: "22px",
          }}>
            {PRIMARY_STACK.map((s, i) => (
              <span key={i} className="tag">{s}</span>
            ))}
          </div>

          <div className="cta-group" style={{ marginTop: "26px" }}>
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
