import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

const ABOUT_SHORT = `사용자 경험과 유지보수성을 중요하게 생각하는 풀스택 개발자입니다. React 기반 프론트엔드와 Java/Spring 백엔드를 모두 다루며, 엔터프라이즈 솔루션의 설계·개발·운영 전 단계에 참여한 경험이 있습니다. 결함이 적은 구조 설계와 데이터 기반 성능 개선에 강점을 가지고 있습니다.`;

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
          }}>{ABOUT_SHORT}</p>

          <div style={{
            marginTop: "32px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}>
            {items.map((item, i) => (
              <div key={i} className="card" style={{ padding: "18px 20px" }}>
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
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--color-text-strong)",
                  marginTop: "8px",
                  lineHeight: 1.4,
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
