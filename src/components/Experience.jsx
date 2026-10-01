import FadeIn from "./common/FadeIn";
import ProjectCard from "./common/ProjectCard";
import resume from "../data/resume";

function CompanyGroup({ company, projects }) {
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

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {projects.map(proj => <ProjectCard key={proj.id} proj={proj} kind="company" />)}
      </div>
    </div>
  );
}

export default function Experience() {
  // 회사(career) 아래로 프로젝트를 묶는다. 데이터 순서(최신순) 유지
  const groups = resume.career.map(c => ({
    company: c,
    projects: resume.projects.filter(p => p.org === c.company),
  }));
  const grouped = new Set(groups.flatMap(g => g.projects.map(p => p.id)));
  const orphans = resume.projects.filter(p => !grouped.has(p.id));

  return (
    <section id="experience" className="section" style={{ background: "var(--color-bg-alt)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Experience</p>
          <h2 className="section-title">경력</h2>
        </FadeIn>

        <div className="section-content" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {groups.map((g, i) => (
            <FadeIn key={g.company.company} delay={i * 0.05}>
              <CompanyGroup company={g.company} projects={g.projects} />
            </FadeIn>
          ))}
          {orphans.length > 0 && (
            <FadeIn>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {orphans.map(proj => <ProjectCard key={proj.id} proj={proj} kind="company" />)}
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </section>
  );
}
