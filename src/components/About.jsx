import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

export default function About() {
  return (
    <section id="about" className="section" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">About</p>
          <h2 className="section-title">개발자 심소현</h2>

          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.02rem",
            fontWeight: 400,
            color: "var(--color-text-soft)",
            lineHeight: 1.9,
            marginTop: "22px",
          }}>{resume.aboutShort}</p>
        </FadeIn>
      </div>
    </section>
  );
}
