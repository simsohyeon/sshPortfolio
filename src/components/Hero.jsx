import resume from "../data/resume";

const SUMMARY_BULLETS = [
  "ITSM·EMR 엔터프라이즈 솔루션 설계·개발·운영 4년차",
  "팀 AI 워크플로우 구축 — 산출물 자동화·온보딩 표준화 주도",
  "성능 최적화 · 결함 적은 구조 설계 · 수치 기반 개선",
];

const PRIMARY_STACK = ["React", "TypeScript", "Java", "Spring Boot", "Oracle", "MongoDB"];

const BulletDot = () => (
  <span style={{
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "var(--color-accent)",
    flexShrink: 0,
    marginTop: "9px",
  }} />
);

export default function Hero() {
  const emailUrl = `mailto:${resume.contact.email}?subject=${encodeURIComponent("채용 문의")}`;

  const handlePrintResume = () => {
    const originalTitle = document.title;
    document.title = "SimSohyeon_Resume";
    const restore = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  return (
    <section id="hero" style={{
      paddingTop: "calc(var(--nav-height) + 32px)",
      paddingBottom: "32px",
      background: "var(--color-bg)",
    }}>
      <div className="container">
        <div style={{ maxWidth: "680px" }}>
          <p className="eyebrow">Full Stack Developer · 4 Years</p>

          <h1 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(1.85rem, 4.6vw, 2.6rem)",
            fontWeight: 600,
            color: "var(--color-text-strong)",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            margin: "10px 0 0",
          }}>
            {resume.name},{" "}
            <span style={{ color: "var(--color-accent)" }}>{resume.title}</span>
          </h1>

          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(0.95rem, 1.4vw, 1.02rem)",
            fontWeight: 400,
            color: "var(--color-text-soft)",
            marginTop: "12px",
            lineHeight: 1.7,
          }}>
            React · Java/Spring 기반 엔터프라이즈 풀스택 개발자입니다.
            <br />
            반복되는 문제를 문서화·자동화·표준화로 풀고, 개선 결과를 수치로 확인합니다.
          </p>

          <ul style={{
            listStyle: "none",
            padding: 0,
            marginTop: "16px",
            display: "grid",
            gap: "6px",
          }}>
            {SUMMARY_BULLETS.map((b, i) => (
              <li key={i} style={{
                display: "flex",
                gap: "10px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.92rem",
                fontWeight: 400,
                color: "var(--color-text-soft)",
                lineHeight: 1.7,
              }}>
                <BulletDot />
                {b}
              </li>
            ))}
          </ul>

          <div style={{
            display: "flex", gap: "6px", flexWrap: "wrap",
            marginTop: "18px",
          }}>
            {PRIMARY_STACK.map((s, i) => (
              <span key={i} className="tag">{s}</span>
            ))}
          </div>

          <div className="cta-group" style={{ marginTop: "22px" }}>
            <a href={emailUrl} className="btn btn-primary">
              이메일로 연락하기
            </a>
            <a
              href={resume.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              GitHub ↗
            </a>
            <button
              type="button"
              onClick={handlePrintResume}
              className="btn btn-secondary"
            >
              Resume PDF ↓
            </button>
          </div>

          {/* 인쇄/PDF 저장 시에만 노출되는 연락처 영역 */}
          <div className="print-only print-contact">
            <div><strong>Email</strong> &nbsp; {resume.contact.email}</div>
            <div><strong>Phone</strong> &nbsp; {resume.contact.phone}</div>
            <div><strong>GitHub</strong> &nbsp; {resume.contact.github}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
