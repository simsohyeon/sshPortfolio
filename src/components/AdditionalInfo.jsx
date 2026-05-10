import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

export default function AdditionalInfo() {
  const blocks = [
    { title: "Certifications", items: resume.certifications.map(c => c.name) },
    { title: "Awards", items: resume.awards },
    { title: "Activities", items: resume.activities },
  ];

  return (
    <section id="info" className="section" style={{
      background: "var(--color-bg-alt)",
    }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Additional Information</p>
          <h2 className="section-title">자격증 · 수상 · 활동</h2>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="card section-content">
            <div className="info-grid">
              {blocks.map((block, i) => (
                <div key={i}>
                  <h3 style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--color-text-strong)",
                    margin: "0 0 14px",
                    letterSpacing: "-0.005em",
                    lineHeight: 1.4,
                  }}>
                    {block.title}
                  </h3>
                  <ul style={{
                    listStyle: "none", padding: 0, margin: 0,
                    display: "flex", flexDirection: "column", gap: "6px",
                  }}>
                    {block.items.map((item, j) => (
                      <li key={j} style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.875rem",
                        fontWeight: 400,
                        color: "var(--color-muted)",
                        display: "flex", gap: "8px", alignItems: "flex-start",
                        lineHeight: 1.7,
                      }}>
                        <span style={{
                          color: "var(--color-muted-2)",
                          flexShrink: 0,
                        }}>·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
