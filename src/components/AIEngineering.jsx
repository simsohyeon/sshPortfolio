import FadeIn from "./common/FadeIn";

const FLOW = [
  ["01", "Context", "도메인 규칙·요구사항·기존 코드 구조를 먼저 고정"],
  ["02", "Implementation", "반복 코드·초안·테스트 케이스 생성에 에이전트 활용"],
  ["03", "Validation", "빌드·타입·테스트·규칙 위반을 자동 검증"],
  ["04", "Human Review", "설계 판단·트레이드오프·최종 코드 리뷰는 직접 수행"],
];

export default function AIEngineering() {
  return (
    <section id="ai-engineering" className="section" style={{ background: "var(--color-bg-alt)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">AI-assisted Engineering</p>
          <h2 className="section-title">
            AI는 검증 가능한 개발 워크플로 안에서 활용합니다.
          </h2>
          <p className="section-sub" style={{ maxWidth: "800px" }}>
            규칙 문서·Skills·Hooks와 테스트/빌드 검증을 함께 사용해 반복 작업을 줄이고,
            도메인 설계와 코드 리뷰에 더 많은 시간을 쓰는 방식으로 활용합니다.
          </p>
        </FadeIn>

        <div className="section-content" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "12px",
        }}>
          {FLOW.map(([no, title, body], i) => (
            <FadeIn key={title} delay={i * 0.04}>
              <div className="card" style={{ height: "100%" }}>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--color-accent)",
                }}>
                  {no}
                </span>
                <h3 style={{
                  marginTop: "8px",
                  fontSize: "1rem",
                  color: "var(--color-text-strong)",
                }}>
                  {title}
                </h3>
                <p style={{
                  marginTop: "8px",
                  fontSize: "0.84rem",
                  color: "var(--color-text-soft)",
                  lineHeight: 1.7,
                }}>
                  {body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
