import resume from "../data/resume";

const PRIMARY_STACK = ["Java", "Spring Boot", "PostgreSQL", "MongoDB", "React"];

export default function Hero() {
  const scrollToProjects = (e) => {
    e.preventDefault();
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="hero" style={{
      paddingTop: "calc(var(--nav-height) + 48px)",
      paddingBottom: "40px",
      background: "var(--color-bg)",
    }}>
      <div className="container">
        <p className="eyebrow">Backend Engineer · 2026</p>

        <h1 style={{
          fontFamily: "var(--font-sans)",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 650,
          color: "var(--color-text-strong)",
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          margin: "12px 0 0",
        }}>
          {resume.name},{" "}
          <span style={{ color: "var(--color-accent)" }}>{resume.title}</span>
        </h1>

        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "clamp(1rem, 1.5vw, 1.08rem)",
          color: "var(--color-text-soft)",
          marginTop: "16px",
          maxWidth: "760px",
          lineHeight: 1.8,
        }}>
          Java/Spring을 중심으로 도메인·API·데이터베이스를 설계하고,
          실제 운영 환경에서 발생하는 성능과 품질 문제까지 해결합니다.
          <br />
          React/Vue 기반 프론트엔드와 배포 환경을 함께 경험해 서비스 전체 흐름을 이해하며 개발합니다.
        </p>

        <div style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}>
          {PRIMARY_STACK.map(s => (
            <span key={s} className="tag">{s}</span>
          ))}
        </div>

        <div className="cta-group" style={{ marginTop: "24px" }}>
          <a href="#work" onClick={scrollToProjects} className="btn btn-primary">
            프로젝트 보기
          </a>
          <a
            href={resume.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            GitHub ↗
          </a>
          <a
            href={`${import.meta.env.BASE_URL}resume.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            경력기술서 ↗
          </a>
        </div>

        <div className="print-only print-contact">
          <div><strong>Email</strong> &nbsp; {resume.contact.email}</div>
          <div><strong>Phone</strong> &nbsp; {resume.contact.phone}</div>
          <div><strong>GitHub</strong> &nbsp; {resume.contact.github}</div>
        </div>
      </div>
    </section>
  );
}
