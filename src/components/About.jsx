import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

const ABOUT_SHORT = `Java/Spring 기반 백엔드 개발을 주력으로 웹 시스템의 설계·개발·운영 전 단계에 참여해 왔습니다. 도메인 모델링, API·DB 설계, 성능 개선을 수행했으며 React·Vue 프론트엔드 경험을 바탕으로 서비스 전체 흐름을 이해하고 구현합니다. 기능 구현 이후의 성능·품질·운영 문제까지 직접 확인하고 개선하는 것을 중요하게 생각합니다.`;

export default function About() {
  const items = [
    { label: "Education", value: resume.education.school, sub: `학점 ${resume.education.gpa} · ${resume.education.period}` },
    { label: "Career", value: "2022 ~ 현재", sub: "엔키아 · 엠투아이티" },
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
          }}>{ABOUT_SHORT}</p>

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
