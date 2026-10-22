import resume from "../data/resume";

import careerCases from "./careerCases";

// 회사 경력만 담는 경력기술서. 포트폴리오 데이터는 그대로 유지합니다.
const PROJECT_DETAIL = {
  "next-product": {
    overview: "Polestar 10의 후속 노코드 IT 서비스·자산관리 플랫폼. 관리자가 빌더를 통해 데이터 항목과 화면을 정의하는 제품",
    role: "자산관리 영역 풀스택 전담, ITAM 빌더로 데이터 구조 설계, Spring Boot API·Vue 화면 구현 및 외부 수집 연동",
    tech: "Java / Spring Boot · Vue / TypeScript · PostgreSQL",
  },
  polestar10: {
    overview: "화면을 JSON 설정으로 구성하는 IT 서비스·자산관리(ITSM/ITAM) 통합 웹 제품. 금융권·공공기관 고객사에 적용되어 운영 중",
    role: "4개 모듈(서비스요청·자산·SLA·프로젝트)의 동적 화면·공통 컴포넌트 개발, 화면 설정·운영 설정 관리 및 포털·검색 기능 개발",
    tech: "Spring Boot / Spring Cloud(MSA) · React / TypeScript · MongoDB",
  },
  "solution-build": {
    overview: "공공기관·민간기업 고객사 5곳의 IT 서비스·자산관리 솔루션 구축 및 운영",
    role: "공공·민간 고객사 5곳의 솔루션 구축에서 프로젝트 전담 개발, Java/Spring 백엔드·Webix 화면 개발 및 Oracle/Tibero SQL 튜닝·조직별 대시보드 집계 쿼리 작성",
    tech: "Java / Spring · Webix · Oracle / Tibero",
  },
  "gangneung-asan": {
    overview: "대형 종합병원 차세대 EMR 구축에서 외부 의료 API 연동 배치와 업무 화면 개발 담당",
    role: "Java/Spring 기반 외부 의료 API 연동 배치 설계·구현, C#/.NET 업무 화면 개발 및 접수·원무 등 타 부서 연계 화면·데이터 흐름 설계",
    tech: "Java / Spring / MyBatis / Spring Batch · JSch · C# / .NET WinForm",
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
        {item.results?.length > 0 && <div>
          <dt className="rs-outcome-label">성과</dt>
          <dd><ul className="rs-results">{item.results.map((result, i) => <li key={i}>{result}</li>)}</ul></dd>
        </div>}
      </dl>
    </section>
  );
}

function ProjectBlock({ project }) {
  const detail = PROJECT_DETAIL[project.id];
  if (!detail) return null; // 경력기술서에 정리하지 않은 프로젝트는 건너뜀 (id 가 바뀌어도 페이지 전체가 깨지지 않게)
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
      {(careerCases[project.id] || []).map((item, index) => <CaseBlock key={item.title} item={item} index={index} />)}
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
        <div className="rs-identity">
          <h1>{resume.name}<span>풀스택 개발자</span></h1>
        <div className="rs-contact">
          <a href={`mailto:${resume.contact.email}`}>{resume.contact.email}</a>
          <a href={resume.contact.portfolio} target="_blank" rel="noreferrer">포트폴리오 ↗</a>
          <a href={resume.contact.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
        </div>
        <div className="rs-intro">{resume.about.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>

      </header>
      <Section title="경력">
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
          <div><dt>백엔드</dt><dd>Java · Spring Boot · MyBatis · Spring Batch · JSch</dd></div>
          <div><dt>화면 개발</dt><dd>React · Vue · TypeScript · Webix · C# / .NET WinForm</dd></div>
          <div><dt>데이터베이스</dt><dd>PostgreSQL · MongoDB · Oracle · Tibero</dd></div>
          <div><dt>프로젝트 환경</dt><dd>Spring Cloud(MSA) · Docker · Jenkins</dd></div>
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
