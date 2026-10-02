import resume from "../data/resume";

import careerCases from "./careerCases";

// 회사 경력만 담는 경력기술서. 포트폴리오 데이터는 그대로 유지합니다.
const PROJECT_DETAIL = {
  "next-product": {
    overview: "고객사별 자산 분류와 관리 항목을 관리자가 직접 정의하는 IT 자산관리 신제품",
    role: "자산 원장 도메인·DB 설계, 외부 수집 동기화, API·Vue 화면 개발, 권한 검증 및 AI 개발 자동화",
    tech: "Java / Spring Boot · Vue / TypeScript · PostgreSQL",
  },
  polestar10: {
    overview: "IT 서비스 요청과 자산을 통합 관리하는 ITSM/ITAM 웹 제품",
    role: "4개 모듈 도메인·권한 설계, Spring Boot API·React 화면 개발, MongoDB 조회 최적화 및 통합검색 구현",
    tech: "Spring Boot / Spring Cloud · React / TypeScript · MongoDB",
  },
  "itsm-itam": {
    overview: "공공기관·민간기업 고객사 5곳의 IT 서비스·자산관리 솔루션 구축 및 운영",
    role: "Java/Spring 백엔드·Webix 화면 개발, SQL 튜닝, 고객사 현장 패치·사용자 교육 및 운영 안정화",
    tech: "Java / Spring · Webix · Oracle / Tibero",
  },
  "gangneung-asan": {
    overview: "강릉아산병원 차세대 의료정보시스템(EMR) 구축 및 운영",
    role: "Java/Spring 공통 프레임워크·API 개발, 외부 의료 API 연동 배치 구현, C# 업무 화면 개발 및 부서 간 시스템 연계",
    tech: "Java / Spring / Spring Batch · C# / .NET WinForm",
  },
};

function Section({ title, children }) {
  return <section className="rs-section"><h2 className="rs-section-title">{title}</h2><div className="rs-section-body">{children}</div></section>;
}

function CaseBlock({ item, index }) {
  return (
    <section className="rs-case">
      <h5 className="rs-case-title"><span>{String(index + 1).padStart(2, "0")}</span>{item.title}</h5>
      <dl className="rs-case-detail">
        {item.problem && <div><dt>문제</dt><dd>{item.problem}</dd></div>}
        {item.solution && <div><dt>수행</dt><dd>{Array.isArray(item.solution)
          ? <ul className="rs-results">{item.solution.map((step, i) => <li key={i}>{step}</li>)}</ul>
          : item.solution}</dd></div>}
        <div>
          <dt className="rs-outcome-label">성과</dt>
          <dd><ul className="rs-results">{item.results.map((result, i) => <li key={i}>{result}</li>)}</ul></dd>
        </div>
      </dl>
    </section>
  );
}

function ProjectBlock({ project }) {
  const detail = PROJECT_DETAIL[project.id];
  return (
    <article className="rs-project">
      <header className="rs-project-head">
        <h4>{project.name}</h4>
        <span className="rs-period">{project.period}</span>
      </header>
      <p className="rs-overview">{detail.overview}</p>
      <dl className="rs-project-meta">
        <div><dt>담당 범위</dt><dd><ul className="rs-role-list">{detail.role.split(", ").map(role => <li key={role}>{role}</li>)}</ul></dd></div>
        <div className="rs-tech"><dt>사용 기술</dt><dd>{detail.tech}</dd></div>
      </dl>
      {careerCases[project.id].map((item, index) => <CaseBlock key={item.title} item={item} index={index} />)}
    </article>
  );
}

export default function ResumePrint() {
  return (
    <main className="rs-page">
      <header className="rs-header">
        <div className="rs-toolbar">
          <p className="rs-eyebrow">경력기술서</p>
          <button className="no-print" type="button" onClick={() => window.print()}>PDF로 저장</button>
        </div>
        <h1>{resume.name}<span>풀스택 개발자</span></h1>
        <p className="rs-intro">Java/Spring 백엔드를 중심으로 화면 개발부터 서비스 운영까지 담당합니다.</p>
        <div className="rs-contact">
          <a href={`mailto:${resume.contact.email}`}>{resume.contact.email}</a>
          <span>{resume.contact.phone}</span>
          <a href={resume.contact.portfolio} target="_blank" rel="noreferrer">포트폴리오 ↗</a>
          <a href={resume.contact.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </header>
      <Section title="경력 요약">
        <p className="rs-intro">IT 서비스·자산관리와 의료정보시스템의 설계·개발·운영 경험을 보유하고 있습니다. 도메인·API·DB 설계, 조회 성능 개선, React·Vue 및 C# 화면 개발을 수행했으며, AI를 활용해 반복 개발·테스트·문서 작성 업무를 자동화하고 있습니다.</p>
      </Section>
      <Section title="경력 상세">
        {resume.career.map(company => (
          <section className="rs-company" key={company.company}>
            <header className="rs-company-head">
              <div><h3>{company.company}</h3><p>{company.position} · 풀스택 개발</p></div>
              <span className="rs-period">{company.period}</span>
            </header>
            {resume.projects.filter(project => project.org === company.company).map(project => <ProjectBlock key={project.id} project={project} />)}
          </section>
        ))}
      </Section>
      <Section title="기술 역량">
        <dl className="rs-skill-list">
          <div><dt>백엔드</dt><dd>Java · Spring Boot · Spring Cloud · JPA / QueryDSL · MyBatis · Spring Batch</dd></div>
          <div><dt>화면 개발</dt><dd>React · Vue · TypeScript · Webix · C# / .NET WinForm</dd></div>
          <div><dt>데이터·운영</dt><dd>PostgreSQL · MongoDB · Oracle · Tibero · Kafka · Redis · Docker · Kubernetes · Jenkins</dd></div>
          <div><dt>AI 활용</dt><dd>규칙 문서·Skills·Hooks 기반 개발 자동화 · 테스트 및 문서 자동화</dd></div>
        </dl>
      </Section>
      <Section title="직무 관련 자격">
        <ul className="rs-certifications">
          {resume.certifications.map(item => <li key={item.name}><strong>{item.name}</strong><span>{item.org} · {item.date}</span></li>)}
        </ul>
      </Section>
    </main>
  );
}
