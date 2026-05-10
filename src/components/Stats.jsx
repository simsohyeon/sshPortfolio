import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

export default function Stats() {
  return (
    <section style={{
      paddingBottom: "40px",
      background: "var(--color-bg)",
    }}>
      <div className="container">
        <FadeIn>
          <div style={{
            background: "var(--color-bg-alt)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "20px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
          }}>
            {resume.stats.map((s, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1.7rem",
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}>{s.value}</div>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.86rem",
                  fontWeight: 500,
                  color: "var(--color-text-strong)",
                  marginTop: "8px",
                }}>{s.label}</div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--color-muted)",
                  marginTop: "4px",
                }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
