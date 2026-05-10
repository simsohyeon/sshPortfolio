import { useState } from "react";
import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

function ImplementationItem({ item }) {
  const [open, setOpen] = useState(false);
  const hasDetail = item.problem || item.solution;

  return (
    <div style={{
      borderTop: "1px solid var(--color-border)",
      paddingTop: "18px",
      marginTop: "18px",
    }}>
      <div
        onClick={() => hasDetail && setOpen(o => !o)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          cursor: hasDetail ? "pointer" : "default",
        }}
      >
        <h4 style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.98rem",
          fontWeight: 600,
          color: "var(--color-text-strong)",
          margin: 0,
          letterSpacing: "-0.005em",
          lineHeight: 1.45,
        }}>
          {item.title}
        </h4>
        {hasDetail && (
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              fontWeight: 500,
              color: "var(--color-accent)",
              background: "var(--color-accent-soft)",
              border: "1px solid var(--color-accent-border)",
              padding: "4px 9px",
              borderRadius: "6px",
              cursor: "pointer",
              flexShrink: 0,
              letterSpacing: "0.02em",
              transition: "background 0.15s var(--ease)",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#DBEAFE"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--color-accent-soft)"}
          >
            {open ? "− 닫기" : "+ 상세"}
          </button>
        )}
      </div>

      <ul style={{
        margin: "12px 0 0", padding: 0, listStyle: "none",
        display: "flex", flexDirection: "column", gap: "6px",
      }}>
        {item.results.map((r, i) => (
          <li key={i} style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.88rem",
            fontWeight: 400,
            color: "var(--color-text-soft)",
            display: "flex", alignItems: "flex-start", gap: "10px",
            lineHeight: 1.65,
          }}>
            <span style={{
              width: "5px", height: "5px",
              borderRadius: "50%",
              background: "var(--color-accent)",
              flexShrink: 0,
              marginTop: "9px",
            }} />
            {r}
          </li>
        ))}
      </ul>

      {open && hasDetail && (
        <div style={{
          marginTop: "16px",
          display: "grid", gap: "10px",
        }}>
          {item.problem && (
            <div style={{
              background: "#FEF2F2",
              borderLeft: "3px solid var(--color-danger)",
              padding: "12px 14px",
              borderRadius: "0 6px 6px 0",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "0.66rem", fontWeight: 500,
                color: "var(--color-danger)", letterSpacing: "0.14em", textTransform: "uppercase",
              }}>Problem</span>
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 400,
                color: "var(--color-text)", margin: "6px 0 0", lineHeight: 1.7,
              }}>{item.problem}</p>
            </div>
          )}
          {item.solution && (
            <div style={{
              background: "var(--color-accent-soft)",
              borderLeft: "3px solid var(--color-accent)",
              padding: "12px 14px",
              borderRadius: "0 6px 6px 0",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "0.66rem", fontWeight: 500,
                color: "var(--color-accent)", letterSpacing: "0.14em", textTransform: "uppercase",
              }}>Solution</span>
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 400,
                color: "var(--color-text)", margin: "6px 0 0", lineHeight: 1.7,
              }}>{item.solution}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ proj }) {
  return (
    <article className="card" style={{ padding: "24px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", flexWrap: "wrap",
        gap: "8px", marginBottom: "12px",
      }}>
        <h3 style={{
          fontFamily: "var(--font-sans)",
          fontSize: "1.15rem",
          fontWeight: 600,
          color: "var(--color-text-strong)",
          margin: 0,
          letterSpacing: "-0.01em",
          lineHeight: 1.35,
        }}>{proj.name}</h3>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.74rem",
          color: "var(--color-muted)",
          paddingTop: "3px",
          letterSpacing: "0",
        }}>{proj.period}</span>
      </div>

      <div style={{
        display: "flex", gap: "6px", flexWrap: "wrap",
        marginBottom: proj.clients ? "8px" : "0",
      }}>
        {proj.stack.map((s, si) => (
          <span key={si} className="tag">{s}</span>
        ))}
      </div>

      {proj.clients && (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.82rem",
          fontWeight: 400,
          color: "var(--color-muted)",
          margin: "8px 0 0",
        }}>
          <span style={{ color: "var(--color-muted-2)" }}>적용 기관 · </span>
          {proj.clients.join(" · ")}
        </p>
      )}

      <div>
        {proj.items.map((item, ii) => <ImplementationItem key={ii} item={item} />)}
      </div>
    </article>
  );
}

function CompanyBlock({ exp, index }) {
  return (
    <FadeIn delay={index * 0.05}>
      <div style={{ marginBottom: "48px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "8px",
        }}>
          <div>
            <h3 style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(1.2rem, 3vw, 1.4rem)",
              fontWeight: 600,
              color: "var(--color-text-strong)",
              margin: 0,
              letterSpacing: "-0.015em",
              lineHeight: 1.35,
            }}>
              {exp.company}
              {exp.position && (
                <span style={{
                  color: "var(--color-text-soft)",
                  fontWeight: 500,
                }}> · {exp.position}</span>
              )}
            </h3>
            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.92rem",
              fontWeight: 400,
              color: "var(--color-text-soft)",
              margin: "6px 0 0",
              lineHeight: 1.6,
            }}>{exp.role}</p>
          </div>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
            color: "var(--color-muted)",
            paddingTop: "4px",
          }}>{exp.period}</span>
        </div>

        <div style={{
          display: "flex", flexDirection: "column", gap: "14px",
          marginTop: "20px",
        }}>
          {exp.projects.map((proj, pi) => <ProjectCard key={pi} proj={proj} />)}
        </div>
      </div>
    </FadeIn>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="section" style={{ background: "var(--color-bg-alt)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Experience</p>
          <h2 className="section-title">경력 & 프로젝트</h2>
          <p className="section-sub">
            엔터프라이즈 솔루션 풀스택 개발 · 성능 최적화 · 운영 안정화 중심으로 정리했습니다.
          </p>
        </FadeIn>

        <div style={{ marginTop: "40px" }}>
          {resume.experience.map((exp, i) => <CompanyBlock key={i} exp={exp} index={i} />)}
        </div>
      </div>
    </section>
  );
}
