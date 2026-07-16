import resume from "../data/resume";

// 경력기술서(문서형)에서는 최신 사이드 프로젝트 1건만 노출
const PRINT_SIDE_PROJECTS = resume.sideProjects.slice(0, 1);

function Section({ title, children }) {
  return (
    <section className="rs-section">
      <h2 className="rs-section-title">{title}</h2>
      {children}
    </section>
  );
}

function ItemBlock({ item }) {
  return (
    <div className="rs-item">
      <h4 className="rs-item-title">{item.title}</h4>
      {item.problem && (
        <p className="rs-detail">
          <span className="rs-label">문제</span>
          {item.problem.replace(/\n/g, " ")}
        </p>
      )}
      {item.solution && (
        <p className="rs-detail">
          <span className="rs-label">해결</span>
          {item.solution.replace(/\n/g, " ")}
        </p>
      )}
      <ul className="rs-results">
        {item.results.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

function ProjectBlock({ proj }) {
  return (
    <div className="rs-project">
      <div className="rs-project-head">
        <h3 className="rs-project-name">{proj.name}</h3>
        <span className="rs-mono">{proj.period}</span>
      </div>
      <p className="rs-stack">{proj.stack.join(" · ")}</p>
      {proj.summary && <p className="rs-summary">{proj.summary.replace(/\n/g, " ")}</p>}
      {proj.items.map((item, i) => (
        <ItemBlock key={i} item={item} />
      ))}
    </div>
  );
}

export default function ResumePrint() {
  return (
    <div className="rs-page">
      <div className="rs-toolbar no-print">
        <span>A4 기준 인쇄 최적화 문서입니다. 대상: 채용 담당자 제출용.</span>
        <button type="button" onClick={() => window.print()}>
          PDF로 저장 (Ctrl+P)
        </button>
      </div>

      {/* 헤더 */}
      <header className="rs-header">
        <div>
          <h1 className="rs-name">
            {resume.name} <span className="rs-title">{resume.title}</span>
          </h1>
          <p className="rs-tagline">
            Java/Spring 백엔드 주력 · React/Vue 화면까지 커버하는 엔터프라이즈 5년차
          </p>
        </div>
        <div className="rs-contact rs-mono">
          <div>{resume.contact.email}</div>
          <div>{resume.contact.phone}</div>
          <div>{resume.contact.github}</div>
          <div>{resume.contact.portfolio}</div>
        </div>
      </header>

      {/* 요약 */}
      <Section title="요약">
        <p className="rs-about">{resume.about}</p>
        <ul className="rs-stats">
          {resume.stats.map((s, i) => (
            <li key={i}>
              <strong>{s.label} {s.value}</strong> — {s.sub}
            </li>
          ))}
        </ul>
      </Section>

      {/* 기술 스택 */}
      <Section title="기술 스택">
        <table className="rs-skills">
          <tbody>
            {resume.skills.map(({ category, level, items }) => (
              <tr key={category}>
                <th>{category}</th>
                <td>
                  {items.join(" · ")}
                  <span className="rs-level"> — {level}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* 경력 */}
      <Section title="경력">
        {resume.experience.map((exp, i) => (
          <div className="rs-company" key={i}>
            <div className="rs-company-head">
              <h3>
                {exp.company} <span className="rs-position">{exp.position}</span>
              </h3>
              <span className="rs-mono">{exp.period}</span>
            </div>
            <p className="rs-role">{exp.role}</p>
            {exp.projects.map((proj, pi) => (
              <ProjectBlock key={pi} proj={proj} />
            ))}
          </div>
        ))}
      </Section>

      {/* 사이드 프로젝트 */}
      <Section title="사이드 프로젝트">
        {PRINT_SIDE_PROJECTS.map((proj, i) => (
          <div className="rs-project" key={i}>
            <div className="rs-project-head">
              <h3 className="rs-project-name">{proj.name}</h3>
              <span className="rs-mono">{proj.period}</span>
            </div>
            <p className="rs-stack">
              {proj.stack.join(" · ")}
              {proj.link && <> · {proj.link}</>}
            </p>
            <p className="rs-summary">{proj.summary}</p>
            <ul className="rs-results">
              {proj.contributions.map((c, ci) => (
                <li key={ci}>{c}</li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      {/* 자격 · 학력 */}
      <Section title="자격 · 학력">
        <ul className="rs-plain">
          {resume.certifications.map((c, i) => (
            <li key={i}>
              {c.name} <span className="rs-muted">({c.org}, {c.date})</span>
            </li>
          ))}
          <li>
            {resume.education.school}{" "}
            <span className="rs-muted">
              ({resume.education.period}, 학점 {resume.education.gpa})
            </span>
          </li>
        </ul>
      </Section>
    </div>
  );
}
