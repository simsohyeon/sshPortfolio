import resume from "../data/resume";

// 경력기술서(문서형). 웹 포트폴리오와 같은 resume.js 를 사용하며,
// 웹과 같은 구조(문제·접근·성과)로 A4 문서 출력. 판단 근거·회고는 데이터에만 남겨 면접 준비용으로 사용.

const SKILL_LEVEL = {
  Frontend: "실무 운영 가능 수준",
  Backend: "주력 - 설계부터 배포까지",
  Database: "쿼리 튜닝 / 인덱스 설계 경험",
  "AI / LLM": "주력 개발 방식 · 매일 사용",
  "Infra / DevOps": "Docker·K8s·Jenkins 배포 환경 개발·운영",
  Tools: "협업 환경 능숙",
};

function Section({ title, children }) {
  return (
    <section className="rs-section">
      <h2 className="rs-section-title">{title}</h2>
      {children}
    </section>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="rs-detail">
      <span className="rs-label">{label}</span>
      <div className="rs-detail-body">{children}</div>
    </div>
  );
}

function CaseBlock({ item }) {
  return (
    <div className="rs-item">
      <h4 className="rs-item-title">{item.title}</h4>
      {item.problem && <DetailRow label="문제">{item.problem}</DetailRow>}
      {item.solution && <DetailRow label="접근">{item.solution}</DetailRow>}
      <DetailRow label="성과">
        <ul className="rs-results">
          {item.results.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </DetailRow>
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
      <p className="rs-stack">{proj.org} · {proj.stack.join(" · ")}</p>
      {proj.clients && <p className="rs-stack">고객사 · {proj.clients.join(" · ")}</p>}
      {proj.oneLiner && <p className="rs-summary">{proj.oneLiner}</p>}
      {proj.cases.map((item, i) => <CaseBlock key={i} item={item} />)}
    </div>
  );
}

export default function ResumePrint() {
  const sideProjects = (resume.sideProjects || []).slice(0, 1);

  return (
    <div className="rs-page">
      <div className="rs-toolbar no-print">
        <span>A4 기준 인쇄 최적화 문서입니다. 브라우저 인쇄에서 PDF로 저장하세요.</span>
        <button type="button" onClick={() => window.print()}>
          PDF로 저장 (Ctrl+P)
        </button>
      </div>

      <header className="rs-header">
        <div>
          <h1 className="rs-name">
            {resume.name} <span className="rs-title">{resume.title}</span>
          </h1>
          <p className="rs-tagline">{resume.tagline}</p>
        </div>
        <div className="rs-contact rs-mono">
          <div>{resume.contact.email}</div>
          <div>{resume.contact.phone}</div>
          <div>{resume.contact.github}</div>
          <div>{resume.contact.portfolio}</div>
        </div>
      </header>

      <Section title="요약">
        <p className="rs-about">{resume.about}</p>
        <ul className="rs-stats">
          {resume.stats.map((s, i) => (
            <li key={i}>
              <strong>{s.label} · {s.value}</strong> - {s.sub}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="기술 스택">
        <table className="rs-skills">
          <tbody>
            {Object.entries(resume.skills).map(([category, items]) => (
              <tr key={category}>
                <th>{category}</th>
                <td>
                  {items.join(" · ")}
                  {SKILL_LEVEL[category] && <span className="rs-level"> - {SKILL_LEVEL[category]}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="경력">
        {resume.career.map((c, i) => (
          <div className="rs-company-head" key={i}>
            <h3>
              {c.company} <span className="rs-position">{c.position}</span>
              <span className="rs-role-inline"> · {c.role}</span>
            </h3>
            <span className="rs-mono">{c.period}</span>
          </div>
        ))}
      </Section>

      <Section title="프로젝트">
        {resume.projects.map((proj, i) => <ProjectBlock key={i} proj={proj} />)}
      </Section>

      {sideProjects.length > 0 && (
        <Section title="사이드 프로젝트">
          {sideProjects.map((proj, i) => (
            <div className="rs-project" key={i}>
              <div className="rs-project-head">
                <h3 className="rs-project-name">{proj.name}</h3>
                <span className="rs-mono">{proj.period}</span>
              </div>
              <p className="rs-stack">
                {proj.stack.join(" · ")}
                {proj.links && proj.links.filter(l => l.url).map((l, li) => (
                  <span key={li}> · {l.url}</span>
                ))}
              </p>
              {proj.context && <p className="rs-stack">{proj.context}</p>}
              <p className="rs-summary">{proj.summary}</p>
              {proj.contributions && (
                <ul className="rs-results">
                  {proj.contributions.map((c, ci) => <li key={ci}>{c}</li>)}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      <Section title="자격 · 수상 · 학력">
        <ul className="rs-plain">
          {resume.certifications.map((c, i) => (
            <li key={i}>
              {c.name} <span className="rs-muted">({c.org}, {c.date})</span>
            </li>
          ))}
          {resume.awards.map((a, i) => <li key={`a${i}`}>{a}</li>)}
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
