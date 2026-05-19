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
  about: `사용성과 유지보수성을 함께 고려해 시스템을 설계하고, 개선 결과를 수치로 확인하며 일하는 4년 차 풀스택 개발자입니다. ITSM·ITAM 등 엔터프라이즈 업무 시스템 도메인에서 프론트엔드와 백엔드 양쪽을 경험해 왔습니다. 기능을 만드는 데 그치지 않고 QA 결함이 덜 나오는 구조를 고민하며, 운영 단계까지 책임지고 참여하려 합니다.`,
  stats: [
    { value: "80%", label: "QA 결함 감소", sub: "500건 → 92건" },
    { value: "61%", label: "응답시간 개선", sub: "p95 1.8s → 0.7s" },
    { value: "0건", label: "운영 반영 후 DB 구조 변경", sub: "설계 안정성 확인" },
    { value: "64%", label: "온보딩 기간 단축", sub: "2주 → 5일" },
  ],
  skills: {
    Frontend: ["React.js", "TypeScript", "HTML / CSS / SCSS", "C# / .NET WinForm"],
    Backend: ["Java", "Spring Boot", "Spring Framework", "MyBatis", "Spring Batch"],
    Database: ["Oracle DB", "MySQL", "Tibero", "MongoDB"],
    "Infra / DevOps": ["Docker", "Kubernetes", "Jenkins"],
    Tools: ["Git / GitHub / GitLab", "Figma", "IntelliJ"],
  },
  experience: [
    {
      company: "엔키아 NKIA",
      position: "대리",
      period: "2024.01 ~ 현재",
      role: "ITSM 솔루션 개발 / 차세대 통합신제품 풀스택 개발",
      projects: [
        {
          name: "통합신제품 Polestar 10",
          period: "2025.02 ~ 현재",
          summary: "ITIL 4 기반 차세대 통합 ITSM/ITAM 제품. 서비스 포트폴리오·카탈로그·포탈 메인·KMS 모듈에서 React 화면과 Spring Boot API 개발을 담당.",
          stack: ["React", "TypeScript", "Spring Boot", "MongoDB"],
          items: [
            {
              title: "ITIL 4 도메인 모델 · 라이프사이클 상태머신 · Validation/RBAC 통합 설계",
              problem: "ITSM/ITAM/CMDB/KEDB 4개 모듈의 라이프사이클과 권한 체계가 모듈별로 상이해 비즈니스 규칙 변경 시 영향 범위 추적이 어려웠고, 상태 전이 로직이 컴포넌트 전반에 산재해 QA 결함 평균 500건/프로젝트 반복 발생",
              solution: "ITIL 4를 기준으로 Portfolio→Catalog→Service→Request 4계층 도메인 구조를 정리하고, 5단계 라이프사이클과 상태별 전이 규칙을 명시화. 서비스도메인 단일 화면에서 ITAM 자산·CMDB 구성·요청 이력을 권한별로 함께 조회하도록 다모듈 조회 구조를 설계했고, 탭·액션·행 단위 RBAC와 Validation 로직을 프론트·백엔드로 분리해 책임 경계를 명확히 함.",
              results: [
                "담당 모듈 기준 QA 결함 500건 → 92건 (↓80%)",
                "입력 검증 오류 60% → 15%",
                "QA 리드타임 14일 → 5일",
                "비즈니스 규칙 변경 시 수정 파일 12개 → 2개",
                "신규 라이프사이클 추가 리드타임 5일 → 1일",
                "ITIL 4 표준 준수 — 모듈 간 도메인 정합성 위반 0건",
              ],
            },
            {
              title: "MongoDB Aggregation 성능 최적화",
              problem: "$lookup 과다 사용으로 p95 응답시간 1.8초, timeout 발생률 3%, 피크 CPU 70% (100만 건↑ 컬렉션, 일 평균 조회 5만 건)",
              solution: "실행계획 분석으로 병목 구간 식별 → 복합 인덱스 재설계 및 파이프라인 재구성으로 불필요한 $lookup 제거 및 순서 최적화 적용",
              results: ["담당 API 기준 p95 응답시간 1.8s → 0.7s (↓61%)", "timeout 발생률 3% → 0%", "피크 CPU 70% → 45%"],
            },
            {
              title: "ITSM 통합검색 — 6 카테고리 + 결과 내 재검색 + 추천 검색어",
              problem: "요청·서비스카탈로그·KEDB·공지·댓글·첨부파일에 흩어진 정보가 단일 검색으로 조회 불가, LIKE 기반 부분 검색은 응답 느리고 정확도 낮음",
              solution: "6개 카테고리를 단일 인덱스로 통합하고, 첨부파일은 메타와 본문 텍스트까지 추출해 함께 인덱싱. 결과 내 재검색은 포함/제외 태그와 기간 필터, 자주 쓰는 키워드 추천으로 구성. 권한 필터를 검색 단계에서 적용해 사용자가 볼 수 없는 데이터는 결과에 노출되지 않도록 처리.",
              results: [
                "담당 통합검색 기능 기준 평균 응답 2.4s → 0.6s 개선",
                "통합검색 관련 반복 문의 월 8건 → 0건 수준으로 감소",
              ],
            },
            {
              title: "운영 안정성 기여",
              problem: "",
              solution: "",
              results: [
                "담당 영역 스키마 설계 변경 3회 → 운영 반영 후 구조 변경 없이 기능 확장",
                "장애·핫픽스 월 5건 → 1건 이하 수준으로 감소",
                "신규 운영 인력 온보딩 2주 → 5일로 단축",
                "반복 운영 이슈 월 30건 → 10건 이하 수준으로 감소",
                "생성형 AI 활용해 지정 시간대 DB 백업 자동화 프로세스 직접 설계·구축 → 수작업 백업 공수 주 2시간 절감, 데이터 손실 리스크 사전 차단",
              ],
            },
          ],
        },
        {
          name: "ITSM/ITAM 솔루션",
          period: "2024.01 ~ 2025.02",
          stack: ["Java", "Spring", "Oracle", "Tibero", "Webix"],
          clients: ["다수 공공기관 및 민간기업"],
          items: [
            {
              title: "SQL 튜닝 및 조회 성능 개선",
              problem: "Oracle·Tibero 환경에서 복잡 조회 쿼리 응답시간 2.5초 → 대량 데이터 환경에서 SLA 위협",
              solution: "실행계획 분석으로 풀스캔 구간 식별 → 인덱스 재설계 및 쿼리 구조 개선",
              results: ["응답시간 2.5s → 1.1s (↓56%)", "SLA 준수율 90% → 98%", "장애·핫픽스 월 12건 → 4건 이하"],
            },
            {
              title: "UI 성능 개선 — Webix 기반",
              problem: "화면 로딩 3.2초로 사용자 불만 및 SLA 위협",
              solution: "렌더링 병목 구간 분석 후 데이터 바인딩 구조 개선 및 불필요한 재렌더링 제거",
              results: ["로딩속도 3.2s → 1.4s (↓56%)", "릴리즈 준수율 100% 달성"],
            },
          ],
        },
      ],
    },
    {
      company: "엠투아이티 M2IT",
      position: "사원",
      period: "2022.01 ~ 2023.03",
      role: "강릉아산병원 차세대 의료정보시스템 공통 프레임워크 백엔드 개발",
      projects: [
        {
          name: "강릉아산병원 차세대 의료정보시스템",
          period: "2022.01 ~ 2023.03",
          stack: ["Java", "Spring", "Spring Batch", "JSch"],
          items: [
            {
              title: "외부 API 연동 배치 시스템 설계 및 구현",
              problem: "실시간 연동 방식에서 데이터 동기화 지연 평균 30분, 연동 실패율 2.5% 발생",
              solution: "Spring Batch + JSch 기반 SFTP 배치 아키텍처 설계 → 변경 데이터만 선별하여 파일 시스템에 저장 후, 지정 시간에 외부 API가 읽어가는 구조로 전환",
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
  sideProjects: [
    {
      name: "실시간 위치 기록 안드로이드 앱",
      period: "2021.03 ~ 2021.12",
      context: "가톨릭관동대 캡스톤디자인 졸업작품 — 2021 LINC+ 캡스톤디자인 경진대회 우수상",
      stack: ["Android", "Java", "SQLite", "Google Maps API"],
      summary: "사용자의 이동 경로를 자동으로 기록하고, 주변 약국·병원·접종센터를 지도에서 함께 확인할 수 있는 안드로이드 앱.",
      contributions: [
        "실시간 위치 데이터를 주기적으로 수집·저장하는 로직 설계 및 구현",
        "위치 권한 요청과 권한 상태별 예외 처리 로직 개발",
        "SQLite 기반 로컬 DB 구조 설계 — 이동 경로 데이터 저장·조회 처리",
        "Google Maps에 약국·병원·접종센터 위치를 오버레이로 표시하는 기능 구현",
      ],
      takeaways: [
        "모바일 환경에서의 데이터 처리·권한 관리·백그라운드 서비스 구성 경험",
        "Google Maps API · SQLite를 활용한 로컬 저장소와 UI 연동 기초 역량",
      ],
    },
  ],
  certifications: [
    { name: "SQLD — SQL 개발자", org: "한국데이터산업진흥원", date: "2024.04" },
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
