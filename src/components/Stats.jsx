import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

// 첫 화면 요약 블록: 라벨 → 핵심 문구 → 보조 설명
export default function Stats() {
  return (
    <section className="no-print" style={{
      paddingTop: "8px",
      paddingBottom: "32px",
      background: "var(--color-bg)",
    }}>
      <div className="container">
        <FadeIn>
          <div className="stats-grid" style={{
            background: "var(--color-bg-alt)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px 28px",
          }}>
            {resume.stats.map((s, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  letterSpacing: "0.06em",
                }}>{s.label}</div>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--color-text-strong)",
                  lineHeight: 1.35,
                  letterSpacing: "-0.01em",
                  marginTop: "6px",
                }}>{s.value}</div>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--color-muted)",
                  marginTop: "4px",
                  lineHeight: 1.6,
                }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
