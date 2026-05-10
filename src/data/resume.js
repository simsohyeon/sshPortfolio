// ✏️ 이 파일만 수정하면 포트폴리오 전체에 반영됩니다.

const resume = {
  name: "심소현",
  nameEn: "Sim Sohyeon",
  title: "Full Stack Developer",
  tagline: "설계부터 운영까지, 수치로 증명하는 풀스택 개발자",
  contact: {
    email: "tlathgus3466@gmail.com",
    phone: "010-4415-3460",
    github: "https://github.com/simsohyeon",
    portfolio: "https://simsohyeon.github.io/sshPortfolio/",
  },
  keywords: ["성능 최적화", "결함 없는 설계", "운영 오너십"],
  about: `사용성과 유지보수성을 모두 고려한 시스템을 설계하며, 수치로 검증 가능한 개선 성과를 만들어내는 4년 차 풀스택 개발자입니다. 프론트엔드와 백엔드 모두에 강점을 가지고 있으며, 코드를 잘 짜는 것을 넘어 QA 결함이 덜 발생하는 구조를 설계하고, 운영 단계까지 오너십을 가지고 기여합니다.`,
  stats: [
    { value: "80%", label: "QA 결함 감소", sub: "500건 → 92건" },
    { value: "61%", label: "응답시간 개선", sub: "p95 1.8s → 0.7s" },
    { value: "0건", label: "운영 중 구조 변경", sub: "설계 안정성 검증" },
    { value: "64%", label: "온보딩 기간 단축", sub: "2주 → 5일" },
  ],
  skills: {
    Frontend: ["React.js", "TypeScript", "HTML/CSS (SCSS)", "C# / .NET WinForm"],
    Backend: ["Java", "Spring Boot", "Spring Framework", "MyBatis", "Spring Batch"],
    Database: ["Oracle DB", "MySQL", "Tibero", "MongoDB"],
    "Infra / DevOps": ["Docker", "Kubernetes", "Jenkins"],
    Tools: ["Git / GitHub / GitLab", "Figma", "IntelliJ"],
  },
  experience: [
    {
      company: "엔키아 (NKIA)",
      position: "대리",
      period: "2024.01 ~ 현재",
      role: "ITSM 솔루션 개발 / 차세대 통합신제품 풀스택 개발",
      projects: [
        {
          name: "통합신제품 Polestar 10",
          period: "2025.02 ~ 현재",
          stack: ["React", "Spring Boot", "MongoDB"],
          items: [
            {
              title: "상태 관리 및 Validation 구조 설계",
              problem: "복잡한 상태 전이 로직이 컴포넌트 전반에 산재 → 신규 상태 추가 시 영향 범위 파악 불가, QA 결함 평균 500건/프로젝트 반복",
              solution: "상태 전이 표 기반 화면 동작 정의 / Validation Layer를 프론트·백엔드로 명시적 분리 → 신규 규칙 추가 시 레이어 일부만 수정하는 확장 구조 구축",
              results: ["QA 결함 500건 → 92건 (↓80%)", "입력 검증 오류 60% → 15%", "QA 리드타임 14일 → 5일", "릴리즈 준수율 95% 목표 → 100% 달성"],
            },
            {
              title: "MongoDB Aggregation 성능 최적화",
              problem: "$lookup 과다 사용으로 p95 응답시간 1.8초, timeout 발생률 3%, 피크 CPU 70% (100만 건↑ 컬렉션, 일 평균 조회 5만 건)",
              solution: "실행계획 분석으로 병목 구간 식별 → 복합 인덱스 재설계 + 파이프라인 재구성 (불필요한 $lookup 제거 및 순서 최적화)",
              results: ["p95 응답시간 1.8s → 0.7s (↓61%)", "timeout 발생률 3% → 0%", "피크 CPU 70% → 45%"],
            },
            {
              title: "운영 안정성 기여",
              problem: "",
              solution: "",
              results: [
                "DB 스키마 설계 변경 3회 → 운영 중 구조 변경 0건",
                "장애·핫픽스 월 5건 → 1건 이하",
                "신규 운영 인력 온보딩 2주 → 5일",
                "반복 운영 이슈 월 30건 → 10건 이하",
              ],
            },
          ],
        },
        {
          name: "ITSM/ITAM 솔루션",
          period: "2024.01 ~ 2025.02",
          stack: ["Java", "Spring", "Oracle", "Tibero", "Webix"],
          clients: ["파라다이스", "형사사법", "대검찰청", "티머니", "인천시청"],
          items: [
            {
              title: "SQL 튜닝 및 조회 성능 개선",
              problem: "Oracle·Tibero 환경에서 복잡 조회 쿼리 응답시간 2.5초 → 대량 데이터 환경에서 SLA 위협",
              solution: "실행계획(Explain Plan) 분석으로 풀스캔 구간 식별 → 인덱스 재설계 및 쿼리 구조 개선",
              results: ["응답시간 2.5s → 1.1s (↓56%)", "SLA 준수율 90% → 98%", "장애·핫픽스 월 12건 → 4건 이하"],
            },
            {
              title: "UI 성능 개선 (Webix 기반)",
              problem: "화면 로딩 3.2초로 사용자 불만 및 SLA 위협",
              solution: "렌더링 병목 구간 분석 후 데이터 바인딩 구조 개선 및 불필요한 재렌더링 제거",
              results: ["로딩속도 3.2s → 1.4s (↓56%)", "릴리즈 준수율 100% 달성"],
            },
          ],
        },
      ],
    },
    {
      company: "엠투아이티 (M2IT)",
      position: "사원",
      period: "2022.01 ~ 2023.03",
      role: "강릉아산병원 차세대 의료정보시스템 공통 프레임워크 백엔드 개발",
      projects: [
        {
          name: "강릉아산병원 차세대 의료정보시스템",
          period: "2022.01 ~ 2023.04",
          stack: ["Java", "Spring", "Spring Batch", "JSch (SFTP)"],
          items: [
            {
              title: "외부 API 연동 배치 시스템 설계 및 구현",
              problem: "실시간 연동 방식에서 데이터 동기화 지연 평균 30분, 연동 실패율 2.5% 발생",
              solution: "Spring Batch + JSch(SFTP) 기반 배치 아키텍처 설계 → 변경 데이터만 선별하여 파일 시스템 저장 후, 지정 시간에 외부 API가 읽어가는 구조로 전환",
              results: ["동기화 지연 30분 → 5분 이내 (↓83%)", "연동 실패율 2.5% → 0.3% (↓88%)"],
            },
            {
              title: "공통 프레임워크 및 운영 안정화",
              problem: "",
              solution: "",
              results: [
                "Java/Spring 기반 공통 API 개발 → 각 업무 시스템 연동 지원",
                "EMR 시스템 유지보수 → 운영 장애 월 10건 → 3건 이하",
              ],
            },
          ],
        },
      ],
    },
  ],
  certifications: [
    { name: "SQLD (SQL 개발자)", org: "한국데이터산업진흥원", date: "2024.04" },
    { name: "정보처리기사", org: "한국산업인력공단", date: "2023.09" },
  ],
  awards: [
    "2021 LINC+ 캡스톤디자인 경진대회 우수상",
    "공과대학 자유주제 경진대회 우수상",
    "공과대학 창의적 아이디어 경진대회 우수상",
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
