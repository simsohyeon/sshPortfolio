import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

// 회사 경력은 타임라인 요약만 보여준다. 상세 사례는 경력기술서(인쇄본) 담당.
function CompanyTimeline({ company, projects }) {
  return (
    <div className="company-group">
      <div className="company-head">
        <div>
          <span style={{
            fontFamily: "var(--font-sans)", fontSize: "1.05rem", fontWeight: 600,
            color: "var(--color-text-strong)",
          }}>{company.company}</span>
          {company.position && (
            <span style={{ fontSize: "0.88rem", color: "var(--color-text-soft)", marginLeft: "8px" }}>
              {company.position}
            </span>
          )}
          <span style={{
            display: "block", fontFamily: "var(--font-sans)", fontSize: "0.84rem",
            color: "var(--color-muted)", marginTop: "2px",
          }}>{company.role}</span>
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "0.74rem",
          color: "var(--color-muted)", whiteSpace: "nowrap",
        }}>{company.period}</span>
      </div>

      <ul style={{
        listStyle: "none", padding: 0, margin: 0,
        display: "flex", flexDirection: "column", gap: "14px",
      }}>
        {projects.map(p => (
          <li key={p.id} style={{
            display: "flex", justifyContent: "space-between",
            gap: "12px", alignItems: "baseline",
          }}>
            <div style={{ minWidth: 0 }}>
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: "0.94rem", fontWeight: 500,
                color: "var(--color-text)",
              }}>{p.name}</span>
              <span style={{
                display: "block", fontSize: "0.84rem", color: "var(--color-text-soft)",
                marginTop: "3px", lineHeight: 1.6,
              }}>{p.role}</span>
            </div>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.72rem",
              color: "var(--color-muted)", whiteSpace: "nowrap",
            }}>{p.period}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Experience() {
  // 회사(career) 아래로 프로젝트를 묶는다. 데이터 순서(최신순) 유지
  const groups = resume.career.map(c => ({
    company: c,
    projects: resume.projects.filter(p => p.org === c.company),
  }));

  return (
    <section id="experience" className="section" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Experience</p>
          <h2 className="section-title">경력</h2>
        </FadeIn>

        <div className="section-content" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {groups.map((g, i) => (
            <FadeIn key={g.company.company} delay={i * 0.05}>
              <CompanyTimeline company={g.company} projects={g.projects} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
