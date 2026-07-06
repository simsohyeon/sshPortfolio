import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

export default function About() {
  const items = [
    { label: "Education", value: resume.education.school, sub: `학점 ${resume.education.gpa} · ${resume.education.period}` },
    { label: "Career", value: "4년차 (2022~)", sub: "엔키아 · 엠투아이티" },
    { label: "Certificate", value: "SQLD · 정보처리기사", sub: "한국데이터산업진흥원 외" },
  ];

  return (
    <section id="about" className="section" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">About</p>
          <h2 className="section-title">개발자 심소현</h2>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1rem",
            fontWeight: 400,
            color: "var(--color-text-soft)",
            lineHeight: 1.85,
            marginTop: "20px",
            maxWidth: "780px",
          }}>{resume.about}</p>

          <div className="section-content" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}>
            {items.map((item, i) => (
              <div key={i} className="card">
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.66rem",
                  fontWeight: 500,
                  color: "var(--color-accent)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}>{item.label}</div>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--color-text-strong)",
                  marginTop: "10px",
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                }}>{item.value}</div>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  fontWeight: 400,
                  color: "var(--color-muted)",
                  marginTop: "4px",
                }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
