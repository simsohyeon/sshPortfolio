import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

// 숫자 + 단위 (%, 건, 초, 분, s, ms 등) 또는 ↓/↑ 변화량을 강조 표시
const METRIC_SPLIT_RE = /(↓\d+(?:\.\d+)?%?|↑\d+(?:\.\d+)?%?|\d+(?:\.\d+)?(?:%|건|초|분|시간|일|s|ms|x|배|점)?)/g;
const METRIC_TEST_RE = /^(↓|↑)?\d/;

function HighlightMetrics({ text }) {
  const parts = text.split(METRIC_SPLIT_RE);
  return (
    <>
      {parts.map((p, i) =>
        METRIC_TEST_RE.test(p)
          ? <span key={i} style={{
              color: "var(--color-text-strong)",
              fontWeight: 600,
            }}>{p}</span>
          : p
      )}
    </>
  );
}

function DetailRow({ label, text, accent }) {
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.66rem",
        fontWeight: 500,
        color: accent ? "var(--color-accent)" : "var(--color-muted)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        flexShrink: 0,
        width: "56px",
        paddingTop: "5px",
      }}>{label}</span>
      <p style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.875rem",
        fontWeight: 400,
        color: accent ? "var(--color-text)" : "var(--color-text-soft)",
        margin: 0,
        lineHeight: 1.7,
      }}>{text}</p>
    </div>
  );
}

function ImplementationItem({ item }) {
  const hasDetail = item.problem || item.solution;

  return (
    <div style={{
      borderTop: "1px solid var(--color-border)",
      paddingTop: "16px",
      marginTop: "16px",
    }}>
      <h4 style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "var(--color-text-strong)",
        margin: 0,
        letterSpacing: "-0.005em",
        lineHeight: 1.45,
      }}>
        {item.title}
      </h4>

      {hasDetail && (
        <div style={{ marginTop: "10px", display: "grid", gap: "6px" }}>
          {item.problem && <DetailRow label="Problem" text={item.problem} />}
          {item.solution && <DetailRow label="Solution" text={item.solution} accent />}
        </div>
      )}

      <ul style={{
        margin: hasDetail ? "12px 0 0" : "10px 0 0",
        padding: hasDetail ? "10px 0 0" : 0,
        borderTop: hasDetail ? "1px dashed var(--color-border)" : "none",
        listStyle: "none",
        display: "flex", flexDirection: "column", gap: "6px",
      }}>
        {item.results.map((r, i) => (
          <li key={i} style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
            fontWeight: 400,
            color: "var(--color-text-soft)",
            display: "flex", alignItems: "flex-start", gap: "10px",
            lineHeight: 1.7,
          }}>
            <span style={{
              width: "5px", height: "5px",
              borderRadius: "50%",
              background: "var(--color-accent)",
              flexShrink: 0,
              marginTop: "9px",
            }} />
            <span><HighlightMetrics text={r} /></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectCard({ proj }) {
  return (
    <article className="card">
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", flexWrap: "wrap",
        gap: "8px", marginBottom: "12px",
      }}>
        <h3 style={{
          fontFamily: "var(--font-sans)",
          fontSize: "1.05rem",
          fontWeight: 600,
          color: "var(--color-text-strong)",
          margin: 0,
          letterSpacing: "-0.01em",
          lineHeight: 1.4,
        }}>{proj.name}</h3>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "var(--color-muted)",
          paddingTop: "4px",
          whiteSpace: "nowrap",
        }}>{proj.period}</span>
      </div>

      <div style={{
        display: "flex", gap: "5px", flexWrap: "wrap",
      }}>
        {proj.stack.map((s, si) => (
          <span key={si} className="tag">{s}</span>
        ))}
      </div>

      {proj.summary && (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",
          fontWeight: 400,
          color: "var(--color-text-soft)",
          margin: "12px 0 0",
          lineHeight: 1.7,
        }}>
          {proj.summary}
        </p>
      )}

      {proj.clients && (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.82rem",
          fontWeight: 400,
          color: "var(--color-muted)",
          margin: "10px 0 0",
        }}>
          <span style={{ color: "var(--color-muted-2)" }}>적용 기관 · </span>
          {proj.clients.join(" · ")}
        </p>
      )}

      <div>
        {proj.items.map((item, ii) => <ImplementationItem key={ii} item={item} />)}
      </div>
    </article>
  );
}

function CompanyBlock({ exp, index }) {
  return (
    <FadeIn delay={index * 0.05}>
      <div className="experience-company" style={{ marginBottom: "44px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "8px",
        }}>
          <div>
            <h3 style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(1.3rem, 3.2vw, 1.55rem)",
              fontWeight: 700,
              color: "var(--color-text-strong)",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
            }}>
              {exp.company}
              {exp.position && (
                <span style={{
                  color: "var(--color-text-soft)",
                  fontWeight: 500,
                }}> · {exp.position}</span>
              )}
            </h3>
            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.92rem",
              fontWeight: 400,
              color: "var(--color-muted)",
              margin: "6px 0 0",
              lineHeight: 1.6,
            }}>{exp.role}</p>
          </div>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
            color: "var(--color-muted)",
            paddingTop: "4px",
            whiteSpace: "nowrap",
          }}>{exp.period}</span>
        </div>

        <div style={{
          display: "flex", flexDirection: "column", gap: "12px",
          marginTop: "18px",
        }}>
          {exp.projects.map((proj, pi) => <ProjectCard key={pi} proj={proj} />)}
        </div>
      </div>
    </FadeIn>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="section" style={{ background: "var(--color-bg-alt)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Experience</p>
          <h2 className="section-title">경력 &amp; 프로젝트</h2>
          <p className="section-sub">
            팀 AI 워크플로우 구축부터 도메인 설계·성능 최적화·운영 안정화까지, 문제 → 해결 → 결과 순으로 정리했습니다.
          </p>
        </FadeIn>

        <div className="section-content">
          {resume.experience.map((exp, i) => <CompanyBlock key={i} exp={exp} index={i} />)}
        </div>
      </div>
    </section>
  );
}
