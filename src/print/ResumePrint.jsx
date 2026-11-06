import resume from "../data/resume";

import careerCases from "./careerCases";

// 회사 경력만 담는 경력기술서. 포트폴리오 데이터는 그대로 유지합니다.

// 30초 스캔용 핵심 요약 (경력기술서 전용). 본문 케이스의 확정 문구만 사용. 측정 조건은 해당 사례의 resultNote에서 표기.
const HEADLINE = [
  { label: "담당 범위", text: "금융기관에서 운영 중인 신제품의 자산관리 영역 풀스택 전담, 데이터 구조 설계와 Spring Boot API 중심" },
  { label: "성능 개선", text: "원장 이관 2,000행 약 3분 → 43초, 입고 승인 2,000건 68초 → 35초 단축" },
  { label: "공통 기능", text: "Polestar 10의 공통 화면 컴포넌트와 권한 기반 통합검색 개발" },
  { label: "구축 경험", text: "공공·민간 고객사 5곳의 요구사항 협의부터 개발·현장 적용·운영 인계까지 전담" },
];
const PROJECT_DETAIL = {
  "next-product": {
    "overview": "Polestar 10의 후속 노코드 IT 서비스·자산관리 플랫폼. 증권사·손해보험사 등 금융기관 3개사에 납품되어 운영 중",
    "role": [
      "자산관리 영역 풀스택 전담: 데이터 구조 설계, Spring Boot API·외부 수집 연동·Vue 화면 개발",
      "보안취약점 관리 기능 구현: 외부 보안 솔루션 API로 자산·소프트웨어별 취약점을 수집하고, 우선순위·조치기한과 조치요청부터 예외·위험수용까지 상태를 한 화면에서 추적",
      "엑셀 일괄등록·원장 이관 처리 성능·정합성 개선"
    ],
    "tech": "Java 21 · Spring Boot · Vue · TypeScript · PostgreSQL"
  },
  "polestar10": {
    "overview": "JSON 메타데이터로 화면을 구성하는 업무 요청·결재와 자산 관리 통합 웹 제품. 금융권·공공기관 고객사에 적용되어 운영 중",
    "role": [
      "서비스 요청·자산·업무 지식·포털 업무 모듈의 동적 화면·공통 컴포넌트 개발",
      "조직·역할 기반 데이터 권한, 통합검색, 결재 위임·채번 등 업무 공통 기능과 운영 설정 관리 화면 개발"
    ],
    "tech": "Spring Boot · React · TypeScript · MongoDB"
  },
  "solution-build": {
    "overview": "고객사별 요구를 소스 수정과 현장 패치로 반영하는 구축형 IT 서비스·자산관리 솔루션",
    "role": [
      "공공·민간 고객사 5곳의 솔루션 구축 전담, Java/Spring 백엔드·Webix 화면 개발",
      "Oracle/Tibero SQL 튜닝·조직별 대시보드 집계 쿼리 개발 및 현장 대응"
    ],
    "tech": "Java · Spring · Webix · Oracle · Tibero"
  },
  "gangneung-asan": {
    "overview": "대형 종합병원의 차세대 의료정보시스템 구축. 외부 의료 데이터 연동과 EMR 업무 화면 개발 담당",
    "role": [
      "외부 의료 API 연동 배치 설계·구현 및 JSch 기반 파일 전송",
      "C#/.NET 기반 EMR 업무 화면 및 Java/Spring 기반 백엔드 개발"
    ],
    "tech": "Java · Spring · Spring Batch · MyBatis · JSch · C# / .NET WinForm"
  }
};

function Section({ title, children }) {
  return <section className="rs-section"><h2 className="rs-section-title">{title}</h2><div className="rs-section-body">{children}</div></section>;
}

// 성과 문자열의 **구절**을 굵게 렌더 (경력기술서 전용 표기)
function em(text) {
  return text.split("**").map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
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
          <dd>
            <ul className="rs-results">{item.results.map((result, i) => <li key={i}>{em(result)}</li>)}</ul>
            {item.resultNote && <p className="rs-result-note">{item.resultNote}</p>}
          </dd>
        </div>}
      </dl>
    </section>
  );
}

function ProjectBlock({ project }) {
  const detail = PROJECT_DETAIL[project.id];
  if (!detail) return null; // 경력기술서에 정리하지 않은 프로젝트는 건너뜀 (id 가 바뀌어도 페이지 전체가 깨지지 않게)
  const cases = careerCases[project.id] || [];
  return (
    <article className="rs-project">
      <header className="rs-project-head">
        <h4>{project.name}</h4>
        <span className="rs-period">{project.period}</span>
      </header>
      <p className="rs-overview">{detail.overview}</p>
      <dl className="rs-project-meta">
        <div><dt>담당 범위</dt><dd><ul className="rs-role-list">{detail.role.map(role => <li key={role}>{role}</li>)}</ul></dd></div>
        <div className="rs-tech"><dt>사용 기술</dt><dd>{detail.tech}</dd></div>
      </dl>
      {cases.map((item, index) => <CaseBlock key={item.title} item={item} index={index} />)}
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
          <h1>{resume.name}<span>백엔드 기반 풀스택 개발자 · 경력 약 4년</span></h1>
        <div className="rs-contact">
          <a href={`tel:${resume.contact.phone}`}>{resume.contact.phone}</a>
          <a href={`mailto:${resume.contact.email}`}>{resume.contact.email}</a>
          <a href={resume.contact.portfolio} target="_blank" rel="noreferrer">포트폴리오 ↗</a>
          <a href={resume.contact.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
        </div>
        <ul className="rs-headline">{HEADLINE.map(line => <li key={line.label}><strong>{line.label}</strong>{line.text}</li>)}</ul>

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
          <div><dt>AI 개발 도구</dt><dd>Claude Code · Hooks/Skills. 커밋 전 테스트·영향도 점검 절차를 운영하고, 매뉴얼 생성·개발환경 설정 도구를 만들어 팀 표준화</dd></div>
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
