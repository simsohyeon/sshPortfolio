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

        <div className="section-content" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "12px",
        }}>
          {Object.entries(resume.skills).map(([cat, items], i) => (
            <FadeIn key={cat} delay={i * 0.05}>
              <div className="card" style={{ height: "100%" }}>
                <h3 style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--color-text-strong)",
                  margin: 0,
                  letterSpacing: "-0.005em",
                  lineHeight: 1.4,
                }}>{cat}</h3>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  color: "var(--color-accent)",
                  marginTop: "6px",
                  marginBottom: "16px",
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

      </div>
    </section>
  );
}
