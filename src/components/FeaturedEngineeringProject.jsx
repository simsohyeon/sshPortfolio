import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

const ENGINEERING_POINTS = [
  {
    title: "API Gateway & Failure Handling",
    body: "브라우저는 /api/*만 호출하고 Vercel Edge에서 외부 API 키를 주입합니다. API 미신청·장애 시 기능 단위 graceful fallback으로 전체 서비스가 멈추지 않게 구성했습니다.",
  },
  {
    title: "Course Generation Engine",
    body: "취향·동반자·접근성·날씨·숨은지역 가중치를 점수화하고, quota → 지역 클러스터 → nearest-neighbor → 2-opt 순으로 여행 동선을 구성합니다.",
  },
  {
    title: "Caching & Data Layer",
    body: "IndexedDB 캐시와 CDN 캐시를 함께 사용하고, 경북 장소 데이터는 Supabase에 주기적으로 적재해 외부 API 지연을 사용자 경로에서 줄였습니다.",
  },
  {
    title: "Quality & Troubleshooting",
    body: "TypeScript·ESLint·build·실 API 호출을 QA 게이트로 반복 검증하고, 좌표 누락으로 8,900km 코스가 생성된 오류 등 실제 결함을 문서화하고 수정했습니다.",
  },
];

export default function FeaturedEngineeringProject() {
  const project = resume.sideProjects?.find(p => p.name.includes("쉼마루"));
  if (!project) return null;

  return (
    <section id="engineering-project" className="section" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Featured Engineering Project</p>
          <h2 className="section-title">공개 코드로 확인할 수 있는 프로젝트</h2>
          <p className="section-sub">
            실무 프로젝트에서 설명한 설계·문제 해결 역량을 공개 저장소에서 직접 확인할 수 있는 개인 프로젝트입니다.
          </p>
        </FadeIn>

        <FadeIn delay={0.05}>
          <article className="card section-content">
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
              flexWrap: "wrap",
            }}>
              <div>
                <span className="tag tag-accent">대표 공개 프로젝트</span>
                <h3 style={{
                  fontSize: "1.25rem",
                  color: "var(--color-text-strong)",
                  marginTop: "10px",
                  lineHeight: 1.35,
                }}>
                  쉼마루 (Shimmaru)
                </h3>
                <p style={{ color: "var(--color-muted)", marginTop: "4px", fontSize: "0.84rem" }}>
                  2026 관광데이터 활용 공모전 출품작 · 개인 프로젝트
                </p>
              </div>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.74rem",
                color: "var(--color-muted)",
              }}>
                {project.period}
              </span>
            </div>

            <p style={{
              marginTop: "16px",
              color: "var(--color-text-soft)",
              lineHeight: 1.8,
              maxWidth: "880px",
            }}>
              한국관광공사·축제·기상 데이터를 조합해 사용자의 지역·일정·동행·취향에 맞는
              경북 전통문화 여행 코스를 생성하는 모바일 우선 PWA입니다. 화면 구현보다
              외부 데이터 통합, 실패 대응, 코스 생성 로직, 캐시와 데이터 계층을 중심으로 설계했습니다.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "14px" }}>
              {["React 19", "TypeScript", "Supabase", "Vercel Edge", "Zustand", "Vitest", "PWA"].map(item => (
                <span className="tag" key={item}>{item}</span>
              ))}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "10px",
              marginTop: "20px",
            }}>
              {ENGINEERING_POINTS.map(point => (
                <div key={point.title} style={{
                  padding: "16px",
                  background: "var(--color-bg-alt)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                }}>
                  <strong style={{ color: "var(--color-text-strong)", fontSize: "0.9rem" }}>
                    {point.title}
                  </strong>
                  <p style={{
                    color: "var(--color-text-soft)",
                    fontSize: "0.84rem",
                    lineHeight: 1.7,
                    marginTop: "6px",
                  }}>
                    {point.body}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "18px" }}>
              <a
                href="https://github.com/simsohyeon/StayMaru"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                GitHub에서 코드 보기 ↗
              </a>
              <a
                href="https://github.com/simsohyeon/StayMaru/blob/main/doc/ARCHITECTURE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Architecture 문서 ↗
              </a>
            </div>
          </article>
        </FadeIn>
      </div>
    </section>
  );
}
