import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

export default function Skills() {
  return (
    <section id="skills" style={{ padding: "6rem clamp(1.5rem,5vw,4rem)", background: "var(--color-bg-alt)" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <FadeIn>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-accent)", letterSpacing: "0.12em", marginBottom: "0.8rem" }}>SKILLS</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "var(--color-dark)", margin: "0 0 2.5rem" }}>
            기술 스택<span style={{ color: "var(--color-accent)" }}>.</span>
          </h2>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
          {Object.entries(resume.skills).map(([cat, items], i) => (
            <FadeIn key={cat} delay={i * 0.1}>
              <div style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", padding: "1.5rem" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--color-accent)", letterSpacing: "0.1em", margin: "0 0 1rem" }}>{cat.toUpperCase()}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {items.map((item, j) => (
                    <span key={j} style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", padding: "0.3rem 0.7rem", background: "var(--color-bg-alt)", color: "var(--color-text)", letterSpacing: "0.02em" }}>{item}</span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
            <div style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", padding: "1.5rem" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--color-accent)", letterSpacing: "0.1em", margin: "0 0 1rem" }}>CERTIFICATIONS</p>
              {resume.certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: "0.6rem" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-dark)" }}>{c.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-muted)" }}>{c.org} · {c.date}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", padding: "1.5rem" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--color-accent)", letterSpacing: "0.1em", margin: "0 0 1rem" }}>AWARDS</p>
              {resume.awards.map((a, i) => (
                <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-text)", marginBottom: "0.5rem", display: "flex", gap: "0.4rem" }}>
                  <span style={{ color: "var(--color-accent)" }}>·</span>{a}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
