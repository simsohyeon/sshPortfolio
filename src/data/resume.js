import careerCases from "../print/careerCases.js";

// ✏️ 이 파일만 수정하면 포트폴리오 전체에 반영됩니다.
//
// 구조: 프로젝트(projects)가 1급 단위입니다. 회사 경력은 career(연표)로 분리했습니다.
//
// 🔴 [확인필요] 표시가 붙은 값은 제가 기존 내용에서 추론해 채운 "초안"입니다.
//    면접에서 그대로 말할 내용이므로, 반드시 본인 경험·표현으로 검토/수정하세요.
//    특히 role(기여도), decision(의사결정), retrospective(회고), 링크 URL을 확인하세요.

const resume = {
  name: "심소현",
  nameEn: "Sim Sohyeon",
  title: "Full Stack Developer",
  // 첫 화면 상단 작은 라벨. 재직 중 공개 페이지라 구직 표시 대신 중립 문구
  heroEyebrow: "Portfolio · 2026",
  // 프로필 사진(선택). public/images 에 넣고 { src: "images/profile.jpg", alt: "심소현" } 으로 채우면 첫 화면 우측 상단에 표시. 없으면 자리 없이 렌더
  photo: null,
  tagline: "IT 서비스·자산관리 제품의 데이터 모델·API부터 화면까지 만드는 풀스택 개발자",
  contact: {
    email: "tlathgus3466@gmail.com",
    phone: "010-4415-3460",
    github: "https://github.com/simsohyeon",
    portfolio: "https://simsohyeon.github.io/sshPortfolio/",
  },
  keywords: [
    "도메인·API 설계",
    "화면 개발",
    "조회 성능 개선",
    "개발 자동화"
  ],
  aboutShort: "IT 서비스·자산관리 제품에서 데이터 모델과 API를 설계하고, React·Vue 화면까지 구현해 왔습니다. 현재는 고객사마다 다른 자산 관리 항목을 관리자가 설정으로 정의할 수 있는 신제품을 개발하고 있습니다. AI 코딩 에이전트 작업 과정에 커밋 전 테스트·검증 절차를 구성했으며, 직접 만든 반복 작업 자동화 스킬(도구)은 팀 표준으로 채택되었습니다. 이전 고객사 구축·운영 과정에서는 SQL 튜닝과 화면 렌더링 구조 개선으로 조회·화면 성능을 높였습니다.",
  about: "엔키아에서 IT 서비스·자산관리(ITSM/ITAM) 제품을 개발해 왔습니다. 고객사별 구축형으로 시작해 화면 설정형을 거쳤고, 지금은 노코드 신제품을 만들고 있습니다.\n\nPolestar 10에서는 4개 업무 모듈이 사용하는 동적 화면과 공통 컴포넌트를 개발하고, 운영 설정 관리와 검색 기능을 구현했습니다. 현재는 신제품의 자산관리 영역을 풀스택으로 전담합니다. ITAM 빌더로 고객사마다 필요한 관리 항목을 추가하고, 승인 방식은 설정에서 고를 수 있게 만들고 있습니다.\n\nAI 코딩 도구로 개발할 때는 커밋 전에 테스트와 영향도 점검을 반드시 거치게 해 두었습니다. 직접 만든 매뉴얼 생성·개발환경 설정 도구는 팀 표준이 됐습니다.",
  stats: [
    {
      "label": "주력 기술",
      "value": "Java / Spring",
      "sub": "React · Vue · TypeScript 화면 개발"
    },
    {
      "label": "담당 범위",
      "value": "데이터 모델부터 화면까지",
      "sub": "도메인·DB 설계 · API 구현 · 화면 연동"
    },
    {
      "label": "실무 경험",
      "value": "제품 개발과 고객사 구축",
      "sub": "IT 서비스·자산관리 · 의료정보시스템"
    }
  ],
  skills: {
    Frontend: ["React.js", "Vue.js", "TypeScript", "HTML / CSS / SCSS"],
    Backend: ["Java", "Spring Boot", "Spring Cloud (MSA)", "JPA", "MyBatis", "Spring Batch", "Kafka", "Redis", "Node.js", "REST API"],
    Database: ["PostgreSQL", "Oracle DB", "MySQL", "Tibero", "MongoDB"],
    "AI 활용·개발 자동화": [
      "AI 코딩 에이전트 활용",
      "하네스 엔지니어링 (규칙 문서 · Skills · Hooks)",
      "프롬프트 설계",
      "AI 기반 테스트 자동화",
    ],
    "Infra / DevOps": ["Docker", "Kubernetes", "Jenkins"],
  },
  // 카테고리별 활용 수준 - 웹·경력기술서 공용
  skillLevels: {
    Frontend: "실무 운영 가능 수준",
    Backend: "주력 - 설계부터 배포까지",
    Database: "쿼리 튜닝 / 인덱스 설계 경험",
    "AI 활용·개발 자동화": "규칙·검증 절차 구성 및 반복 업무 자동화",
    "Infra / DevOps": "Docker·K8s·Jenkins 배포 환경 개발·운영",
  },
  // 주력으로 강조할 카테고리
  primarySkillCategories: ["Backend", "AI 활용·개발 자동화"],

  // ───────────────────────────────────────────────
  // 프로젝트 (1급 단위). 웹은 모든 프로젝트를 같은 카드로 그린다 - 회사 프로젝트는 텍스트만, 개인 프로젝트는 우측에 화면 이미지.
  // 웹 카드: summary(한 문장) + highlights 앞 2개만 노출. oneLiner·cases는 경력기술서(resume.html)에서 사용.
  // role·status·summary는 oneLiner에서 추린 초안 🔴 [확인필요]
  // 각 case는 problem → solution(접근) → decision(왜) → results(결과) → retrospective(회고).
  // ───────────────────────────────────────────────
  projects: [
    {
      id: "next-product",
      name: "IT 서비스·자산관리 신제품 (Polestar 10 후속)",
      org: "엔키아 NKIA",
      period: "2026.04 ~ 현재",
      type: "회사",
      role: "자산관리 기능 풀스택 전담 · Spring Boot API / Vue 화면",
      team: "자산관리 영역 풀스택 전담",
      // 챗봇 컨텍스트 전용 (웹 카드·경력기술서엔 노출 안 함). "AI 하네스가 구체적으로 뭐예요?", "어떤 도구 쓰세요?" 질문용
      techNotes: [
        "AI 하네스 도구: Claude Code. 규칙 문서(CLAUDE.md)·커스텀 Skills·Hooks 로 구성",
        "규칙 문서: 프로젝트 개발 규칙(아키텍처 제약, 성능·검증 규칙, API 규약·화면 패턴·DDL 금지·공통 컴포넌트 사용)과 팀 운영 규칙(결함 즉시 수정, 같은 시도 반복 시 실측 검증, 커밋 메시지 규약, 그리드 표시 표준) 두 종류",
        "Hooks: 세션 시작 시 최소 해법 강제, 커밋 전 테스트·검증·영향도 체크·동기화",
        "Skills: 개발환경 자동 구축, 이슈 조회·등록, 매뉴얼 생성, 표준 페이지 추가, 결함 수정 표준 루프, 성능 점검, 업머지·다운머지, 테스트 케이스 생성 등 반복 작업 자동화",
      ],
      status: "개발 진행 중",
      statusKind: "active",
      featured: true,
      summary: "기업의 IT 자산과 서비스 요청 절차를 관리하는 플랫폼입니다. Polestar 10은 화면을 설정으로 구성하고 데이터 구조는 코드로 관리했다면, 후속 제품은 데이터 항목까지 관리자가 빌더로 정의합니다. 자산관리 영역을 전담하며 ITAM 빌더를 활용한 데이터 구조 설계, Spring Boot API·Vue 화면 개발과 외부 수집 연동을 맡고 있습니다.",
      oneLiner:
        "고객사마다 다른 자산 분류와 관리 항목을 관리자가 코드 없이 정의하는 IT 자산관리 신제품. 자산 원장 도메인 모델과 스키마, 외부 수집 동기화, 권한·테스트 체계를 담당해 기획부터 검수까지 진행 중이며, AI 기반 개발 하네스로 이 흐름을 자동화.",
      stack: ["Vue", "TypeScript", "Java", "Spring Boot", "JPA", "PostgreSQL", "AI 코딩 에이전트"],
      links: [],
      // 웹 카드 기본 노출 - 한 줄 불릿. 케이스 전문은 접기와 경력기술서에서.
      highlights: [
  "3~4개 메뉴에 흩어진 등록 진입점을 한 메뉴로 통합. 개발 중 추가된 자산 점검 항목과 승인 방식 전환을 코드 수정 없이 설정으로 반영",
  "직접 개발한 매뉴얼 생성·개발환경 설정 도구가 팀 표준으로 채택"
],
      cases: careerCases["next-product"],
    },
    {
      id: "polestar10",
      name: "IT 서비스·자산관리 제품 Polestar 10",
      org: "엔키아 NKIA",
      period: "2025.02 ~ 2026.03",
      type: "회사",
      role: "동적 화면·공통 컴포넌트 개발, 운영 설정 관리 및 포털·검색 기능 개발",
      team: "공통 영역 풀스택 전담",
      status: "운영 중",
      statusKind: "live",
      featured: true,
      summary: "화면을 JSON 설정으로 구성하는 IT 서비스·자산관리 통합 웹 제품입니다. 서비스요청·자산·SLA·프로젝트 4개 모듈의 화면이 공통 컴포넌트 위에서 설정으로 렌더링됩니다.",
      oneLiner: "IT 서비스 요청과 자산을 함께 관리하는 통합 웹 제품. 공통 영역의 MongoDB 설계·Spring Boot API·React 화면 개발 담당. 상태 전이 규칙은 DB의 버전별 프로세스 설계에 정의되고 서버 엔진이 집행·검증하며, 화면은 처리 버튼 노출을 제어했으며, MongoDB 조회 최적화와 검색 쿼리 단계의 권한 필터 구현을 수행.",
      stack: ["React", "TypeScript", "Spring Boot", "Spring Cloud (MSA)", "MongoDB"],
      // 챗봇 컨텍스트 전용 (웹 카드·경력기술서엔 노출 안 함): 기술을 어디에 썼는지. "X를 어디에 썼나요?" 질문용
      techNotes: [
        "상태 처리 구조: 버전 관리되는 프로세스 설계를 MongoDB에 저장하고 요청별 설계 버전을 고정. 기존 서버 엔진이 다음 단계·담당자를 결정하고 종료 상태 및 설계 외 전이를 검증. 화면은 처리 버튼 노출 담당. 서버 엔진 자체를 본인이 구현했다는 의미는 아님",
        "인덱스 확인 범위: 초기 스키마 36개 컬렉션에서 단일 필드 인덱스를 확인. 초기 스키마 확인만으로 운영 환경의 인덱스 전체나 튜닝 시 추가 인덱스를 단정하지 않음",
        "기능 권한 목록은 로그인 시 클라이언트에 캐시되어 화면 표시를 제어. 이 캐시는 서버의 최종 권한 검증을 대체하지 않음",
        "Kafka: 서비스 간 비동기 이벤트 전달. 조직·사용자 변경 이벤트를 받아 테넌트·사용자 정보를 동기화하고, 배치 스케줄 관리와 이메일·SMS 통보 요청을 Kafka로 전달",
        "Redis: 공통 인증 계층에서 로그인·권한 정보 저장, 동시 로그인 제한과 로그인 타임아웃 검사",
        "서버 메모리 캐시: ITG 카펠라 컴포넌트 캐시",
        "localStorage: 클라이언트 설정·사용자 정보 저장",
      ],
      clients: ["증권사·생명보험사 등 금융권", "고용 분야 공공기관"],
      links: [], // 회사 코드 비공개 - 공개 가능한 데모/문서가 있으면 {label, url} 추가
      highlights: [
  "여러 업무 영역을 한 번에 검색하고, 사용자 권한에 맞는 데이터로만 결과·건수·페이지 구성",
  "기존 설정 반영 구조와 연동하는 운영 설정 관리 화면을 개발해, 패치·재기동 없이 설정 변경 지원"
],
      cases: careerCases["polestar10"],
    },
    {
      id: "solution-build",
      name: "IT 서비스·자산관리 솔루션 구축",
      org: "엔키아 NKIA",
      period: "2024.01 ~ 2025.02",
      type: "회사",
      role: "풀스택 개발, 고객사 구축 프로젝트 전담",
      team: "프로젝트 전담 메인 개발자로 참여",
      status: "고객사 5곳 구축 완료",
      statusKind: "done",
      featured: false,
      summary: "고객사마다 소스를 수정해 현장에 패치하는 구축형 IT 서비스·자산관리 솔루션입니다. 요구사항 협의부터 백엔드·화면 개발, SQL 튜닝, 사용자 교육과 운영 인계까지 맡았습니다.",
      oneLiner:
        "공공기관·민간기업 고객사 5곳에 적용된 IT 서비스·자산관리 솔루션의 Java·Spring 백엔드 개발, Oracle/Tibero 쿼리 튜닝, Webix 화면 성능 개선과 운영 안정화를 담당. 고객사 현장 패치와 사용자 교육까지 직접 수행.",
      stack: ["Java", "Spring", "Oracle", "Tibero", "Webix"],
      clients: ["지방자치단체·중앙행정기관", "형사사법 분야 공공 시스템", "리조트·교통 결제 분야 대기업"],
      links: [],
      highlights: [
  "고객사 요구사항 협의부터 소스·화면 수정, 현장 패치, 운영 인계 문서까지 전담",
  "Oracle/Tibero 실행계획을 분석해 SQL·인덱스를 개선하고, Webix 렌더링 구조를 정리해 대량 데이터 조회와 화면 로딩의 지연을 줄임"
],
      cases: careerCases["solution-build"],
    },
    {
      id: "gangneung-asan",
      name: "강릉아산병원 차세대 의료정보시스템 (EMR)",
      org: "엠투아이티 M2IT",
      period: "2022.01 ~ 2023.03",
      type: "회사 · 헬스케어/의료",
      role: "풀스택 개발, 외부 의료 API 연동 배치와 EMR 업무 화면 담당",
      status: "구축 완료",
      statusKind: "done",
      featured: false,
      summary: "대형 종합병원 차세대 EMR 구축 프로젝트입니다. 외부 기관과 주고받는 데이터를 실시간 호출 대신 파일 교환과 배치 수집 방식으로 연동했습니다.",
      oneLiner:
        "대형 종합병원 차세대 의료정보시스템의 Java/Spring 기반 외부 의료 API 연동 배치 설계, EMR 업무 화면(C#/.NET) 개발 담당. 환자·진료 데이터를 다루는 의료 도메인 경험.",
      stack: ["Java", "Spring", "MyBatis", "Spring Batch", "JSch", "C# / .NET WinForm"],
      links: [],
      highlights: [
  "실시간 호출 대신 파일 교환 배치로 연동해, 외부 기관에 장애·지연이 생겨도 병원 업무 처리를 계속하고 데이터는 지정된 배치 시점에 수집",
  "접수·원무 등 타 부서 시스템과 연계되는 EMR 업무 화면 개발"
],
      cases: careerCases["gangneung-asan"],
    },
  ],

  // ───────────────────────────────────────────────
  // 사이드 프로젝트 (개인)
  // ───────────────────────────────────────────────
  sideProjects: [
    {
      id: "staymaru",
      name: "쉼마루 (StayMaru) - 경북 전통문화 여행 일정 추천",
      period: "2026.05 ~ 2026.09",
      featured: true,
      context: "2026 관광데이터 활용 데이터 공모전 출품작 · 개인 프로젝트",
      stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Zustand", "i18next", "Kakao Map SDK", "PWA"],
      links: [
        { label: "사이트", url: "https://staymaru.vercel.app" },
        { label: "GitHub", url: "https://github.com/simsohyeon/StayMaru" },
      ],
      // public/images 기준 경로. 배포 사이트 /insights(지금 경북) 화면 캡처(1200×630)
      image: { src: "images/staymaru-insights.jpg", alt: "쉼마루 지금 경북 화면 - 이번 주말 한적한 지역 추천과 붐빔 데이터", width: 1200, height: 630 },
      summary:
        "챗봇 문답으로 지역·일정·동행·취향을 입력받아, 한옥·서원·사찰·체험·시장·축제 등 경북 전통문화 관광지를 잇는 여행 일정을 자동 생성하는 모바일 우선 웹앱.",
      // 개인 프로젝트라 전 영역 담당. 기존 요약·스택 내용을 역할 단위로 나눈 초안 🔴 [확인필요]
      contributions: [
        "챗봇 문답으로 지역·일정·동행·취향을 입력받는 일정 생성 흐름 설계·구현",
        "한국관광공사 관광데이터 API 5종을 조합한 가중치 점수·경로 최적화 일정 생성 로직",
        "카테고리·지역 필터와 지도 기반 장소 탐색 화면",
        "한·영·일·중 4개국어와 오프라인 사용 지원",
      ],
    },
    {
      id: "ansim-corona",
      name: "안심코로나 - 실시간 위치 기록 안드로이드 앱",
      period: "2021.03 ~ 2021.12",
      context: "가톨릭관동대 캡스톤디자인 졸업작품 - 2021 LINC+ 캡스톤디자인 경진대회 우수상",
      stack: ["Android", "Java", "SQLite", "Google Maps API"],
      // 앱 화면 5장(홈 · 이동 경로 · 의료시설 지도)
      image: { src: "images/ansim-corona.png", alt: "안심코로나 앱 화면 - 홈, 이동 경로, 의료시설 지도", width: 823, height: 308 },
      summary:
        "사용자의 이동 경로를 자동으로 기록하고, 주변 약국·병원·접종센터를 지도에서 함께 확인할 수 있는 안드로이드 앱.",
      contributions: [
        "실시간 위치 데이터를 주기적으로 수집·저장하는 로직 설계 및 구현",
        "위치 권한 요청과 권한 상태별 예외 처리 로직 개발",
        "이동 경로 데이터를 저장·조회하는 로컬 DB 구조 설계",
        "지도에 약국·병원·접종센터 위치를 오버레이로 표시하는 기능 구현",
      ],
      takeaways: [
        "모바일 환경에서의 데이터 처리·권한 관리·백그라운드 서비스 구성 경험",
        "Google Maps API · SQLite를 활용한 로컬 저장소와 UI 연동 기초 역량",
      ],
    },
  ],

  // ───────────────────────────────────────────────
  // 경력 연표 (이력서 요약 - 프로젝트 상세는 projects에서)
  // ───────────────────────────────────────────────
  career: [
    {
      company: "엔키아 NKIA",
      position: "대리",
      period: "2024.01 ~ 현재",
      role: "IT 서비스·자산관리 제품의 데이터 모델·API·화면 개발 및 고객사 구축",
    },
    {
      company: "엠투아이티 M2IT",
      position: "사원",
      period: "2022.01 ~ 2023.03",
      role: "강릉아산병원 차세대 의료정보시스템 풀스택 개발",
    },
  ],

  certifications: [
    { name: "SQLD - SQL 개발자", org: "한국데이터산업진흥원", date: "2024.04" },
    { name: "정보처리기사", org: "한국산업인력공단", date: "2023.09" },
  ],
  awards: [
    { name: "2021 LINC+ 캡스톤디자인 경진대회 우수상", date: "2021.07" },
    { name: "공과대학 자유주제 경진대회 우수상", date: "2021.06" },
    { name: "공과대학 창의적 아이디어 경진대회 우수상", date: "2019.11" },
  ],
  activities: [
    "소프트웨어학과 부학회장 (2021)",
    "공과대학 학생회 홍보부장 (2019)",
    "2018 평창 동계올림픽 자원봉사",
  ],
  education: {
    school: "가톨릭관동대학교 소프트웨어학과",
    period: "2018.03 ~ 2022.02",
    gpa: "4.1 / 4.5",
  },
};

export default resume;
