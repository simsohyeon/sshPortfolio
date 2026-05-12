import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

function BulletList({ items, color = "var(--color-accent)" }) {
  return (
    <ul style={{
      margin: "10px 0 0", padding: 0, listStyle: "none",
      display: "flex", flexDirection: "column", gap: "6px",
    }}>
      {items.map((it, i) => (
        <li key={i} style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",
          fontWeight: 400,
          color: "var(--color-text-soft)",
          display: "flex", alignItems: "flex-start", gap: "10px",
          lineHeight: 1.7,
        }}>
          <span style={{
            width: "5px", height: "5px",
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
            marginTop: "9px",
          }} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function SideProjectCard({ proj }) {
  return (
    <article className="card">
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", flexWrap: "wrap",
        gap: "8px", marginBottom: "12px",
      }}>
        <h3 style={{
          fontFamily: "var(--font-sans)",
          fontSize: "1.05rem",
          fontWeight: 600,
          color: "var(--color-text-strong)",
          margin: 0,
          letterSpacing: "-0.01em",
          lineHeight: 1.4,
        }}>{proj.name}</h3>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "var(--color-muted)",
          paddingTop: "4px",
          whiteSpace: "nowrap",
        }}>{proj.period}</span>
      </div>

      <div style={{
        display: "flex", gap: "5px", flexWrap: "wrap",
      }}>
        {proj.stack.map((s, si) => (
          <span key={si} className="tag">{s}</span>
        ))}
      </div>

      {proj.context && (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.82rem",
          fontWeight: 400,
          color: "var(--color-muted)",
          margin: "10px 0 0",
        }}>
          {proj.context}
        </p>
      )}

      {proj.summary && (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",
          fontWeight: 400,
          color: "var(--color-text-soft)",
          margin: "12px 0 0",
          lineHeight: 1.7,
        }}>
          {proj.summary}
        </p>
      )}

      {proj.contributions && proj.contributions.length > 0 && (
        <div style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: "16px",
          marginTop: "16px",
        }}>
          <h4 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "var(--color-text-strong)",
            margin: 0,
            letterSpacing: "-0.005em",
            lineHeight: 1.45,
          }}>담당 역할</h4>
          <BulletList items={proj.contributions} />
        </div>
      )}

      {proj.takeaways && proj.takeaways.length > 0 && (
        <div style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: "16px",
          marginTop: "16px",
        }}>
          <h4 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "var(--color-text-strong)",
            margin: 0,
            letterSpacing: "-0.005em",
            lineHeight: 1.45,
          }}>배운 점</h4>
          <BulletList items={proj.takeaways} />
        </div>
      )}
    </article>
  );
}

export default function SideProjects() {
  if (!resume.sideProjects || resume.sideProjects.length === 0) return null;

  return (
    <section id="side-projects" className="section" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Side Projects</p>
          <h2 className="section-title">사이드 프로젝트</h2>
          <p className="section-sub">
            업무 외에 개인적으로 학습·구현한 프로젝트를 정리했습니다.
          </p>
        </FadeIn>

        <div className="section-content" style={{
          display: "flex", flexDirection: "column", gap: "12px",
        }}>
          {resume.sideProjects.map((proj, pi) => (
            <FadeIn key={pi} delay={pi * 0.05}>
              <SideProjectCard proj={proj} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
