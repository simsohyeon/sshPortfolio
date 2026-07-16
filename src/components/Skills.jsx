import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

export default function Skills() {
  return (
    <section id="skills" className="section" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Skills</p>
          <h2 className="section-title">기술 스택</h2>
          <p className="section-sub">
            주력과 활용 경험을 구분해 정리했습니다. 모든 항목은 실제 프로젝트에서 사용한 기술입니다.
          </p>
        </FadeIn>

        <div className="section-content" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "12px",
        }}>
          {resume.skills.map(({ category, level, items }, i) => (
            <FadeIn key={category} delay={i * 0.05}>
              <div className="card" style={{ height: "100%" }}>
                <h3 style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--color-text-strong)",
                  margin: 0,
                  letterSpacing: "-0.005em",
                  lineHeight: 1.4,
                }}>{category}</h3>
                <p style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  color: "var(--color-accent)",
                  marginTop: "6px",
                  marginBottom: "16px",
                }}>{level || ""}</p>
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
