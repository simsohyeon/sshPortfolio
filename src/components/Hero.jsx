import resume from "../data/resume";

export default function Hero() {
  const emailUrl = `mailto:${resume.contact.email}?subject=${encodeURIComponent("채용 문의")}`;
  const current = resume.career[0];
  const currentLine = [current.company, current.position, current.period].filter(Boolean).join(" · ");

  return (
    <section id="hero" style={{
      paddingTop: "calc(var(--nav-height) + 40px)",
      paddingBottom: "48px",
      background: "var(--color-bg)",
    }}>
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">{resume.heroEyebrow}</p>

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
            fontSize: "clamp(0.98rem, 1.4vw, 1.08rem)",
            fontWeight: 400,
            color: "var(--color-text-soft)",
            marginTop: "16px",
            lineHeight: 1.7,
          }}>
            {resume.tagline}
          </p>

          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.88rem",
            fontWeight: 500,
            color: "var(--color-muted)",
            marginTop: "10px",
            lineHeight: 1.6,
          }}>
            {currentLine}
          </p>

          <div className="cta-group" style={{ marginTop: "28px" }}>
            <a href={emailUrl} className="btn btn-primary">이메일로 연락하기</a>
            <a href={resume.contact.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              GitHub ↗
            </a>
            <a href={`${import.meta.env.BASE_URL}resume.html`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              경력기술서 ↗
            </a>
          </div>

          {/* 인쇄/PDF 저장 시에만 노출되는 연락처 영역 */}
          <div className="print-only print-contact">
            <div><strong>Email</strong> &nbsp; {resume.contact.email}</div>
            <div><strong>Phone</strong> &nbsp; {resume.contact.phone}</div>
            <div><strong>GitHub</strong> &nbsp; {resume.contact.github}</div>
          </div>
        </div>

        {/* 우측: (사진이 있으면) 프로필 + 팩트 카드 - 경력 · 역할 범위 · 대표 성과 */}
        <div className="hero-side">
          {resume.photo && (
            <img
              className="hero-photo"
              src={`${import.meta.env.BASE_URL}${resume.photo.src}`}
              alt={resume.photo.alt || resume.name}
              width={112}
              height={112}
            />
          )}
          <dl className="fact-card" style={{ width: "100%" }}>
            {resume.stats.map((s, i) => (
              <div key={i} className="fact">
                <dt>{s.label}</dt>
                <dd>
                  <strong>{s.value}</strong>
                  <span>{s.sub}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
