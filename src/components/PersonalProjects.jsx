import FadeIn from "./common/FadeIn";
import ProjectCard from "./common/ProjectCard";
import resume from "../data/resume";

export default function PersonalProjects() {
  const projects = resume.sideProjects || [];
  if (projects.length === 0) return null;

  return (
    <section id="projects" className="section" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Projects</p>
          <h2 className="section-title">개인 프로젝트</h2>
        </FadeIn>

        <div className="section-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {projects.map((proj, i) => (
            <FadeIn key={proj.name} delay={i * 0.05}>
              <ProjectCard proj={proj} kind="personal" />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
