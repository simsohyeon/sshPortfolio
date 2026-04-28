import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

export default function About() {
  return (
    <section id="about" style={{ padding: "6rem clamp(1.5rem,5vw,4rem)", background: "var(--color-bg)" }}>
      <FadeIn>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-accent)", letterSpacing: "0.12em", marginBottom: "1rem" }}>ABOUT</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "var(--color-dark)", margin: "0 0 1.8rem" }}>
            문제를 구조로 해결합니다<span style={{ color: "var(--color-accent)" }}>.</span>
          </h2>
          <p style={{ fontFamily: "var(--font-korean)", fontSize: "1.05rem", color: "var(--color-text)", lineHeight: 1.9 }}>{resume.about}</p>
          <div style={{ marginTop: "2rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {[
              { label: "학점", value: `${resume.education.gpa} (${resume.education.school})` },
              { label: "자격증", value: "SQLD · 정보처리기사" },
              { label: "경력", value: "4년차 (2022~)" },
            ].map((item, i) => (
              <div key={i} style={{ borderLeft: "3px solid var(--color-accent)", paddingLeft: "0.8rem" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-muted)", letterSpacing: "0.08em" }}>{item.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--color-dark)", marginTop: "0.2rem" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
