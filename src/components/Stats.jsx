import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

export default function Stats() {
  return (
    <section style={{ background: "var(--color-dark)", padding: "4rem clamp(1.5rem,5vw,4rem)" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "2rem", maxWidth: "900px", margin: "0 auto",
      }}>
        {resume.stats.map((s, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
                color: "var(--color-accent)", lineHeight: 1,
              }}>{s.value}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-white)", marginTop: "0.5rem", letterSpacing: "0.08em" }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-muted)", marginTop: "0.3rem" }}>{s.sub}</div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
