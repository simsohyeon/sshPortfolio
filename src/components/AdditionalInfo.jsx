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
          <p className="eyebrow">Career & Information</p>
          <h2 className="section-title">경력 · 사이드 프로젝트 · 기타</h2>
        </FadeIn>

        {/* 경력 연표 - 상세 성과는 Projects 섹션 참고 */}
        <FadeIn delay={0.03}>
          <div className="card section-content" style={{ marginBottom: "12px" }}>
            <h3 style={{
              fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 600,
              color: "var(--color-text-strong)", margin: "0 0 14px",
              letterSpacing: "-0.005em",
            }}>경력</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {resume.career.map((c, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", flexWrap: "wrap", gap: "6px",
                }}>
                  <div>
                    <span style={{
                      fontFamily: "var(--font-sans)", fontSize: "0.92rem", fontWeight: 600,
                      color: "var(--color-text-strong)",
                    }}>{c.company}</span>
                    {c.position && (
                      <span style={{ color: "var(--color-text-soft)", fontSize: "0.88rem" }}> · {c.position}</span>
                    )}
                    <span style={{
                      display: "block",
                      fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 400,
                      color: "var(--color-muted)", marginTop: "2px", lineHeight: 1.6,
                    }}>{c.role}</span>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.74rem",
                    color: "var(--color-muted)", whiteSpace: "nowrap",
                  }}>{c.period}</span>
                </div>
              ))}
              {resume.education && (
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", flexWrap: "wrap", gap: "6px",
                  borderTop: "1px solid var(--color-border)", paddingTop: "12px",
                }}>
                  <div>
                    <span style={{
                      fontFamily: "var(--font-sans)", fontSize: "0.92rem", fontWeight: 600,
                      color: "var(--color-text-strong)",
                    }}>{resume.education.school}</span>
                    <span style={{
                      display: "block",
                      fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 400,
                      color: "var(--color-muted)", marginTop: "2px",
                    }}>학점 {resume.education.gpa}</span>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.74rem",
                    color: "var(--color-muted)", whiteSpace: "nowrap",
                  }}>{resume.education.period}</span>
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* 사이드 프로젝트 - 요약만 */}
        {resume.sideProjects && resume.sideProjects.length > 0 && (
          <FadeIn delay={0.04}>
            <div className="card" style={{ marginBottom: "12px" }}>
              <h3 style={{
                fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 600,
                color: "var(--color-text-strong)", margin: "0 0 14px",
                letterSpacing: "-0.005em",
              }}>사이드 프로젝트</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {resume.sideProjects.map((sp, i) => (
                  <div key={i}>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "baseline", flexWrap: "wrap", gap: "6px",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.92rem", fontWeight: 600,
                        color: "var(--color-text-strong)",
                      }}>{sp.name}</span>
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: "0.74rem",
                        color: "var(--color-muted)", whiteSpace: "nowrap",
                      }}>{sp.period}</span>
                    </div>
                    {sp.context && (
                      <p style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.82rem",
                        color: "var(--color-muted)", margin: "4px 0 0",
                      }}>{sp.context}</p>
                    )}
                    {sp.summary && (
                      <p style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.875rem",
                        color: "var(--color-text-soft)", margin: "8px 0 0", lineHeight: 1.7,
                      }}>{sp.summary}</p>
                    )}
                    {sp.stack && (
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "10px" }}>
                        {sp.stack.map((s, si) => <span key={si} className="tag">{s}</span>)}
                      </div>
                    )}
                    {sp.links && sp.links.filter(l => l.url).length > 0 && (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                        {sp.links.filter(l => l.url).map((l, li) => (
                          <a key={li} href={l.url} target="_blank" rel="noopener noreferrer"
                            className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.82rem" }}>
                            {l.label} ↗
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.05}>
          <div className="card">
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
