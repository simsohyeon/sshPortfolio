import { useState } from "react";
import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

function ProjectItem({ item }) {
  const [open, setOpen] = useState(false);
  const hasDetail = item.problem || item.solution;

  return (
    <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.2rem", marginTop: "1.2rem" }}>
      <div
        onClick={() => hasDetail && setOpen(o => !o)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: hasDetail ? "pointer" : "default" }}
      >
        <h5 style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--color-dark)", margin: 0, letterSpacing: "0.03em" }}>
          {item.title}
        </h5>
        {hasDetail && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-accent)", marginLeft: "1rem", flexShrink: 0 }}>
            {open ? "▲ 닫기" : "▼ 상세"}
          </span>
        )}
      </div>

      {open && hasDetail && (
        <div style={{ marginTop: "1rem", display: "grid", gap: "0.8rem" }}>
          {item.problem && (
            <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", padding: "0.8rem 1rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-accent)", letterSpacing: "0.08em" }}>PROBLEM</span>
              <p style={{ fontFamily: "var(--font-korean)", fontSize: "0.85rem", color: "var(--color-text)", margin: "0.3rem 0 0", lineHeight: 1.7 }}>{item.problem}</p>
            </div>
          )}
          {item.solution && (
            <div style={{ background: "#f0f4ff", border: "1px solid #c8d8ff", padding: "0.8rem 1rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#2563eb", letterSpacing: "0.08em" }}>SOLUTION</span>
              <p style={{ fontFamily: "var(--font-korean)", fontSize: "0.85rem", color: "var(--color-text)", margin: "0.3rem 0 0", lineHeight: 1.7 }}>{item.solution}</p>
            </div>
          )}
        </div>
      )}

      <ul style={{ margin: "0.9rem 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {item.results.map((r, i) => (
          <li key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text)", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <span style={{ color: "var(--color-accent)", flexShrink: 0 }}>→</span>{r}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExperienceCard({ exp, index }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <FadeIn delay={index * 0.15}>
      <div style={{ borderLeft: "3px solid var(--color-border)", paddingLeft: "1.8rem", marginBottom: "3rem", position: "relative" }}>
        <div style={{ position: "absolute", left: "-7px", top: "4px", width: "11px", height: "11px", borderRadius: "50%", background: "var(--color-accent)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--color-dark)", margin: 0 }}>{exp.company}</h3>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-muted)", margin: "0.3rem 0 0", letterSpacing: "0.05em" }}>{exp.role}</p>
            {exp.growth && (
              <span style={{
                display: "inline-block", marginTop: "0.5rem",
                fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                background: "var(--color-dark)", color: "var(--color-white)", padding: "0.2rem 0.7rem", letterSpacing: "0.05em",
              }}>🚀 {exp.growth}</span>
            )}
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-muted)", letterSpacing: "0.05em", flexShrink: 0 }}>{exp.period}</span>
        </div>

        <button
          onClick={() => setOpen(o => !o)}
          style={{
            marginTop: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.72rem",
            color: "var(--color-accent)", background: "none", border: "1px solid var(--color-accent)",
            padding: "0.3rem 0.8rem", cursor: "pointer", letterSpacing: "0.05em",
          }}
        >{open ? "▲ 접기" : "▼ 프로젝트 보기"}</button>

        {open && (
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
            {exp.projects.map((proj, pi) => (
              <div key={pi} style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.8rem" }}>
                  <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", color: "var(--color-dark)", margin: 0 }}>{proj.name}</h4>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--color-muted)" }}>{proj.period}</span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                  {proj.stack.map((s, si) => (
                    <span key={si} style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "0.2rem 0.6rem", background: "var(--color-bg-alt)", color: "#555", letterSpacing: "0.03em" }}>{s}</span>
                  ))}
                </div>
                {proj.clients && (
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--color-muted)", margin: "0.5rem 0" }}>
                    적용 기관: {proj.clients.join(" · ")}
                  </p>
                )}
                {proj.items.map((item, ii) => <ProjectItem key={ii} item={item} />)}
              </div>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}

export default function Experience() {
  return (
    <section id="experience" style={{ padding: "6rem clamp(1.5rem,5vw,4rem)", background: "var(--color-bg)" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <FadeIn>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-accent)", letterSpacing: "0.12em", marginBottom: "0.8rem" }}>EXPERIENCE</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "var(--color-dark)", margin: "0 0 3rem" }}>
            경력<span style={{ color: "var(--color-accent)" }}>.</span>
          </h2>
        </FadeIn>
        {resume.experience.map((exp, i) => <ExperienceCard key={i} exp={exp} index={i} />)}
      </div>
    </section>
  );
}
