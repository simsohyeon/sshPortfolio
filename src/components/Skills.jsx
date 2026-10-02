import FadeIn from "./common/FadeIn";

const GROUPS = [
  {
    title: "Core Backend",
    level: "주력",
    description: "실무에서 설계·개발·성능 개선까지 직접 다룬 기술",
    items: ["Java", "Spring Boot", "REST API", "PostgreSQL", "MongoDB"],
  },
  {
    title: "Application / Web",
    level: "실사용",
    description: "제품과 프로젝트에서 실제 기능 구현에 사용",
    items: ["JPA", "MyBatis", "Spring Batch", "React", "Vue", "TypeScript"],
  },
  {
    title: "Project Environment",
    level: "프로젝트 환경",
    description: "서비스 개발·배포 환경에서 사용하거나 연동 경험이 있는 기술",
    items: ["Spring Cloud", "Kafka", "Redis", "Docker", "Kubernetes", "Jenkins"],
  },
  {
    title: "AI-assisted Engineering",
    level: "개발 워크플로",
    description: "규칙·검증 절차를 포함한 개발 생산성 도구로 활용",
    items: ["AI Coding Agents", "Rules / Skills / Hooks", "Test Automation", "Documentation Automation"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="section" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Skills</p>
          <h2 className="section-title">기술 스택</h2>
          <p className="section-sub">
            단순 나열보다 실제 활용 범위가 보이도록 주력 기술과 프로젝트 환경을 구분했습니다.
          </p>
        </FadeIn>

        <div className="section-content" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "12px",
        }}>
          {GROUPS.map((group, i) => (
            <FadeIn key={group.title} delay={i * 0.05}>
              <div className="card" style={{ height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h3 style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--color-text-strong)",
                    margin: 0,
                  }}>
                    {group.title}
                  </h3>
                  <span className="tag tag-accent">{group.level}</span>
                </div>

                <p style={{
                  fontSize: "0.8rem",
                  color: "var(--color-muted)",
                  marginTop: "8px",
                  marginBottom: "14px",
                  lineHeight: 1.6,
                }}>
                  {group.description}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {group.items.map(item => (
                    <span key={item} className="tag">{item}</span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
