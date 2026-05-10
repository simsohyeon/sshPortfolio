import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

const SKILL_LEVEL = {
  Frontend: "실무 운영 가능 수준",
  Backend: "주력 · 설계부터 배포까지",
  Database: "쿼리 튜닝 / 인덱스 설계 경험",
  "Infra / DevOps": "기본 운영 가능 수준",
  Tools: "협업 환경 능숙",
};

export default function Skills() {
  return (
    <section id="skills" className="section" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Skills</p>
          <h2 className="section-title">기술 스택</h2>
          <p className="section-sub">
            카테고리별 활용 수준입니다. 모든 항목은 실제 프로젝트에서 사용한 기술입니다.
          </p>
        </FadeIn>

        <div style={{
          marginTop: "32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "12px",
        }}>
          {Object.entries(resume.skills).map(([cat, items], i) => (
            <FadeIn key={cat} delay={i * 0.05}>
              <div className="card" style={{ height: "100%", padding: "20px" }}>
                <h3 style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--color-text-strong)",
                  margin: 0,
                }}>{cat}</h3>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  color: "var(--color-accent)",
                  marginTop: "4px",
                  marginBottom: "14px",
                  letterSpacing: "0",
                }}>{SKILL_LEVEL[cat] || ""}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {items.map((item, j) => (
                    <span key={j} className="tag">{item}</span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.15}>
          <div style={{
            marginTop: "12px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "12px",
          }}>
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "var(--color-text-strong)",
                margin: "0 0 14px",
              }}>Certifications</h3>
              {resume.certifications.map((c, i) => (
                <div key={i} style={{
                  marginBottom: i === resume.certifications.length - 1 ? 0 : "10px",
                  paddingBottom: i === resume.certifications.length - 1 ? 0 : "10px",
                  borderBottom: i === resume.certifications.length - 1 ? "none" : "1px solid var(--color-border)",
                }}>
                  <div style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.92rem",
                    fontWeight: 500,
                    color: "var(--color-text)",
                  }}>{c.name}</div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    color: "var(--color-muted)",
                    marginTop: "3px",
                  }}>{c.org} · {c.date}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "var(--color-text-strong)",
                margin: "0 0 14px",
              }}>Awards</h3>
              {resume.awards.map((a, i) => (
                <div key={i} style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.86rem",
                  fontWeight: 400,
                  color: "var(--color-text-soft)",
                  marginBottom: i === resume.awards.length - 1 ? 0 : "8px",
                  display: "flex", gap: "8px", alignItems: "flex-start",
                  lineHeight: 1.6,
                }}>
                  <span style={{ color: "var(--color-accent)", flexShrink: 0 }}>·</span>
                  {a}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
