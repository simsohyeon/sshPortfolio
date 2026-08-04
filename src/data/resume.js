// ✏️ 이 파일만 수정하면 포트폴리오 전체에 반영됩니다.

const resume = {
  name: "심소현",
  nameEn: "Sim Sohyeon",
  title: "Backend Developer",
  contact: {
    email: "tlathgus3466@gmail.com",
    phone: "010-4415-3460",
    github: "https://github.com/simsohyeon",
    portfolio: "https://simsohyeon.github.io/sshPortfolio/",
  },
  about: `Java/Spring 기반 엔터프라이즈 시스템 백엔드를 주력으로 하는 5년차 개발자입니다.

ITSM·ITAM·EMR 도메인에서 도메인 모델 설계, 쿼리·인덱스 튜닝, 배치·메시징 아키텍처를 담당해 왔고, React·Vue로 담당 모듈의 화면까지 직접 개발하는 풀스택 커버리지를 갖추고 있습니다.

반복되는 문제를 발견하면 자동화·표준화로 팀 전체가 쓰는 도구로 만듭니다. Claude 기반 산출물 자동화 스킬 3종을 직접 개발해 팀 표준으로 정착시켰고, 기능 구현에 그치지 않고 운영 단계까지 책임지고 참여합니다.`,
  stats: [
    { value: "61%", label: "MongoDB 조회 응답 개선", sub: "1.8s → 0.7s · 동일 조건 API 응답 로그 기준" },
    { value: "92%", label: "매뉴얼 작성 자동화", sub: "2시간 → 10분 · 직접 개발한 Claude 스킬, 팀원 실사용 기준" },
    { value: "64%", label: "온보딩 기간 단축", sub: "2주 → 5일 · 실제 신규 입사자 사례" },
    { value: "3종", label: "AI 스킬 팀 표준 배포", sub: "팀원 5명 이상 실사용" },
  ],
  skills: [
    {
      category: "Backend",
      level: "주력 — 설계·구현·튜닝·운영",
      items: ["Java 21", "Spring Boot 3", "Spring Cloud (MSA)", "JPA / QueryDSL", "MyBatis", "Spring Batch", "Kafka", "Redis"],
    },
    {
      category: "Database",
      level: "주력 — 실행계획 분석·인덱스 설계",
      items: ["Oracle", "PostgreSQL", "MongoDB", "Tibero"],
    },
    {
      category: "Frontend",
      level: "실무 커버 — 담당 모듈 화면 직접 개발",
      items: ["React", "Vue 3", "TypeScript", "Tailwind CSS"],
    },
    {
      category: "AI · Automation",
      level: "팀 표준 도구 직접 설계·배포·운영",
      items: ["Claude Code 스킬 설계·배포", "AI 에이전트 워크플로우 구축", "반복 업무 자동화·표준화", "AI 신제품(ITAM) 개발 참여"],
    },
    {
      category: "Infra / Tools",
      level: "활용 경험",
      items: ["Docker", "Kubernetes", "Jenkins", "Git / GitLab", "Figma"],
    },
  ],
  experience: [
    {
      company: "엔키아 NKIA",
      position: "대리",
      period: "2024.01 ~ 현재",
      role: "ITSM 솔루션 개발 / 차세대 통합신제품·AI 신제품 백엔드 중심 풀스택 개발",
      projects: [
        {
          name: "ITAM 자산 노코딩 빌더 — AI 신제품",
          period: "2026.04 ~ 현재 (진행 중)",
          summary: "Polestar 10 구축 사업 대응과 병행하며 개발 중인 차기 AI 신제품.\n고객사마다 다른 자산 분류 체계·관리 항목·화면 구성을 개발자 코드 수정 없이 정의할 수 있는 노코딩 빌더로, Vue 3·Java 21 기반 신규 스택으로 구축.",
          stack: ["Spring Boot 3 / Java 21", "JPA · QueryDSL", "PostgreSQL", "Vue 3", "TypeScript", "Tailwind CSS"],
          items: [
            {
              title: "자산 노코딩 빌더 설계·개발",
              problem: "ITAM 구축 사업마다 고객사별 자산 분류 체계와 관리 항목이 달라, 화면과 스키마를 개발자가 매번 직접 수정해야 했음.\n커스터마이징 공수가 사업 건마다 반복 발생",
              solution: "자산 유형·관리 항목·화면 구성을 관리자가 코드 없이 정의하는 노코딩 빌더로 설계.\n동적 스키마를 안정적으로 다루기 위한 메타데이터 모델과 검증 계층을 백엔드에서 설계",
              results: ["2026.04 개발 착수 — 성과 지표는 출시 후 업데이트 예정"],
            },
          ],
        },
        {
          name: "팀 AI 워크플로우 구축 — 반복 업무를 팀 공용 도구로",
          period: "2025 ~ 현재 (제품 개발과 병행)",
          summary: "매뉴얼·PM 산출물·개발환경 세팅처럼 담당자마다 품질이 들쭉날쭉하던 반복 업무를 Claude 기반 도구로 만들어 팀 전체가 쓰도록 정착시킴.\n단순 자동화에 그치지 않고, 회사 표준을 결과물에 강제하고 여러 사람이 안정적으로 쓸 수 있도록 설계·운영하는 데 초점을 둠.",
          stack: ["Claude Code", "Node.js", "MongoDB"],
          items: [
            {
              title: "Claude 스킬 3종 설계·배포 및 팀 표준화",
              problem: "매뉴얼 한 건에 평균 2시간이 들고 산출물 품질은 담당자마다 제각각.\n신규 인력 온보딩 환경 세팅과 DB 백업도 수작업에 의존해 누락 위험이 있었음",
              solution: "회사 표준 양식 매뉴얼 생성 · PM 산출물 작성 · 개발환경 세팅을 각각 스킬로 만들어 배포.\n회사 표준 양식과 작성 규칙을 도구 안에 담아 결과물이 표준을 벗어나지 않게 했고, 팀원이 실제로 쓰며 준 피드백으로 반복 개선.\nDB 백업은 자동 스크립트로 전환해 하루 3회 실행",
              results: [
                "매뉴얼 작성 2시간 → 10분, 산출물 품질 편차 해소",
                "신규 인력 온보딩 2주 → 5일",
                "팀원 5명 이상이 상시 쓰는 팀 표준 도구로 정착",
                "DB 백업 수작업 제거로 백업 누락 위험 차단",
              ],
            },
          ],
        },
        {
          name: "통합신제품 Polestar 10",
          period: "2025.02 ~ 2026.03",
          summary: "ITIL 4 기반 차세대 통합 ITSM/ITAM 제품 — 서비스 포트폴리오·카탈로그·포탈 메인·KMS 모듈 풀스택 담당.\nSpring Cloud 기반 MSA 구조에 Kafka 메시징·Redis 캐시·멀티테넌트 지원.\n2026.03 개발 완료 후 구축 사업 대응 병행 중.",
          stack: ["Spring Boot 3 / Java 21", "Spring Cloud", "MongoDB", "Kafka", "Redis", "React", "TypeScript"],
          items: [
            {
              title: "MongoDB 성능 최적화 · 통합검색 구축",
              problem: "100만 건 이상 컬렉션에서 $lookup 과다로 응답 1.8초, timeout 3%.\n요청·카탈로그·KEDB 등 정보가 흩어져 한 번에 검색할 수 없었고, LIKE 검색은 느리고 부정확",
              solution: "실행계획(explain)으로 병목을 찾아 $match를 파이프라인 앞으로 재배치하고, 불필요한 $lookup 제거·복합 인덱스 재설계.\n통합검색은 카테고리별 컬렉션에 MongoDB text index를 구성해, 컬렉션별 검색 결과를 한 화면에서 통합 제공 — 별도 검색 엔진 추가 없이 구현",
              results: [
                "조회 응답 1.8s → 0.7s, timeout 3% → 0% — 동일 조건 API 응답 로그 기준",
                "6개 카테고리 통합검색 제공 — 흩어져 있던 정보의 검색 동선 일원화",
              ],
            },
            {
              title: "ITIL 4 도메인 모델 · 라이프사이클 · 권한 기반 화면 제어 설계",
              problem: "ITSM/ITAM/CMDB/KEDB 4개 모듈의 라이프사이클·권한 체계가 제각각이고 상태 전이 로직이 화면 곳곳에 흩어져 QA 결함이 반복 발생",
              solution: "ITIL 4 기준 4계층 도메인(Portfolio→Catalog→Service→Request)과 5단계 라이프사이클·상태 전이 규칙을 명시화.\n자산·구성·요청 이력을 권한별로 한 화면에서 조회하도록 설계",
              results: [
                "상태 전이 규칙 표준화로 모듈 전반 QA 결함 감소에 기여 — 이슈 시스템 집계 기준 500건 → 92건 (팀 지표)",
                "규칙 변경 시 수정 범위 축소 — 신규 라이프사이클 추가 5일 → 1일",
              ],
            },
            {
              title: "운영 안정화 · 프론트 표준화 — 반복 문제의 구조적 차단",
              problem: "비슷한 렌더 오류·결함이 화면만 바뀌어 반복되고, 화면마다 UI·상태 처리 방식이 달라 중복 구현 발생.\n잦은 항목·프로세스 변경에 고정 스키마로는 장애 위험이 컸음",
              solution: "반복 UI는 공통 컴포넌트로, 반복 오류는 공통 처리 로직으로 묶어 구조적으로 차단. QA와 결함 유형·원인을 문서화해 코드 리뷰 체크 기준으로 공유.\n스키마는 확장 여지와 방어 로직을 갖춰 변경에 견디는 구조로 설계",
              results: [
                "반복 운영 이슈 월 30건 → 10건 이하 — 이슈 시스템 집계 기준",
                "공통 컴포넌트 재사용 정착 — 신규 화면 중복 구현 감소",
                "운영 중 스키마 변경 3회를 구조 변경 없이 흡수",
              ],
            },
          ],
        },
        {
          name: "ITSM/ITAM 솔루션",
          period: "2024.01 ~ 2025.02",
          summary: "공공기관·민간기업에서 운영 중인 ITSM/ITAM 시스템 유지보수. 대량 데이터 환경에서 SLA를 위협하던 조회 성능과 화면 로딩 속도 개선에 집중.",
          stack: ["Java", "Spring", "Oracle", "Tibero", "Webix"],
          clients: ["다수 공공기관 및 민간기업"],
          items: [
            {
              title: "SQL 튜닝 및 조회 성능 개선",
              problem: "Oracle·Tibero 환경에서 복잡 조회 쿼리 응답시간 2.5초 → 대량 데이터 환경에서 SLA 위협",
              solution: "실행계획 분석으로 풀스캔 구간 식별 → 인덱스 재설계 및 쿼리 구조 개선",
              results: ["응답시간 2.5s → 1.1s — DB 툴 실측·운영 응답 로그 기준", "SLA 준수율 90% → 98%"],
            },
            {
              title: "UI 성능 개선 — Webix 기반",
              problem: "화면 로딩 3.2초로 사용자 불만 및 SLA 위협",
              solution: "렌더링 병목 구간 분석 후 데이터 바인딩 구조 개선 및 불필요한 재렌더링 제거",
              results: ["로딩속도 3.2s → 1.4s"],
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
          stack: ["Java", "Spring", "Spring Batch", "JSch", "C# / .NET WinForm"],
          items: [
            {
              title: "외부 API 연동 배치 시스템 설계 및 구현",
              problem: "실시간 연동 방식에서 데이터 동기화 지연 평균 30분, 연동 실패율 2.5% 발생",
              solution: "Spring Batch + JSch 기반 SFTP 배치 아키텍처 설계 → 변경 데이터만 선별하여 파일 시스템에 저장 후, 지정 시간에 외부 API가 읽어가는 구조로 전환",
              results: ["동기화 지연 30분 → 5분 이내, 연동 실패율 2.5% → 0.3% — 배치 실행 로그 집계 기준"],
            },
            {
              title: "공통 프레임워크 및 운영 안정화",
              problem: "",
              solution: "",
              results: [
                "Java/Spring 기반 공통 API를 개발해 각 업무 시스템이 공통 규격으로 연동되도록 지원",
                "EMR 시스템을 유지보수하며 반복되던 운영 장애를 진단·개선",
              ],
            },
          ],
        },
      ],
    },
  ],
  sideProjects: [
    {
      name: "쉼마루 (StayMaru) — 관광 데이터 기반 여행 루트 추천 웹앱",
      period: "2026.06 ~ (진행 중)",
      context: "2026 관광데이터 활용 공모전 출품작 — 경북 전통문화 여행 루트 추천 서비스",
      link: "https://staymaru.vercel.app/",
      repo: "https://github.com/simsohyeon/StayMaru",
      stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Kakao Map"],
      summary: "지역·기간·동행·취향에 대한 챗봇 질문에 답하면 실제 관광 데이터를 활용해 최적 여행 일정을 자동 생성해 주는 다국어 웹앱. 유명 관광지뿐 아니라 방문 데이터 기반의 숨은 지역까지 함께 추천한다.",
      contributions: [
        "카테고리 가중치·동선 반경·숨은 지역 보너스·동행/날씨 선호를 결합한 가중치 점수화 + 2-opt 최적화 기반 루트 생성 엔진 구현",
        "한국관광공사 Open API 5종(다국어 관광정보·무장애·반려동물·방문 패턴·행사 일정) 연동 및 조합·가공",
        "Vite 프록시(개발) / Vercel Edge Functions(운영)로 API 키를 노출 없이 보호하는 구조 설계",
        "i18next 기반 4개 국어(한·영·일·중) 지원, 오프라인 지원·홈 화면 설치형 웹앱, 지역 방문 인사이트 대시보드 구현",
      ],
      takeaways: [
        "외부 Open API 데이터를 조합·가공해 추천 로직으로 만든 경험",
        "다국어·접근성·오프라인을 고려한 웹앱 프론트엔드 설계 경험",
      ],
    },
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
