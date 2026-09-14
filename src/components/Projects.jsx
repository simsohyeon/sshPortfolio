import FadeIn from "./common/FadeIn";
import Expandable from "./common/Expandable";
import resume from "../data/resume";

// (미사용) 숫자 자동 강조 - 문장형 서술로 바꾼 뒤 시각적 소음이라 해제. 필요 시 <HighlightMetrics text={r} /> 로 복원
// eslint-disable-next-line no-unused-vars
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

// Problem / Approach / Decision / Retrospective - 웹에서만 노출(.no-print), PDF는 압축 유지
function DetailBlock({ label, accent, body }) {
  if (!body) return null;
  return (
    <div style={{
      padding: "12px 14px",
      background: accent ? "var(--color-accent-soft)" : "var(--color-bg-alt)",
      borderRadius: "var(--radius-md)",
    }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: "0.66rem", fontWeight: 500,
        color: accent ? "var(--color-accent)" : "var(--color-muted)",
        letterSpacing: "0.04em",
      }}>{label}</span>
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 400,
        color: accent ? "var(--color-text)" : "var(--color-text-soft)",
        margin: "6px 0 0", lineHeight: 1.7,
      }}>{body}</p>
    </div>
  );
}

function CaseStudy({ item, showDetail }) {
  const hasDetail = showDetail && (item.problem || item.solution || item.decision || item.retrospective);

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

      <ul style={{
        margin: "10px 0 0", padding: 0, listStyle: "none",
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
            <span>{r}</span>
          </li>
        ))}
      </ul>

      {hasDetail && (
        <div className="no-print" style={{
          marginTop: "12px",
          display: "grid", gap: "8px",
        }}>
          <DetailBlock label="문제" body={item.problem} />
          <DetailBlock label="접근" body={item.solution} />
          <DetailBlock label="판단 근거" body={item.decision} />
          <DetailBlock label="회고" body={item.retrospective} />
        </div>
      )}
    </div>
  );
}

function ProjectCard({ proj }) {
  return (
    <article className="card">
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", flexWrap: "wrap",
        gap: "8px", marginBottom: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {proj.featured && <span className="tag tag-accent">대표 프로젝트</span>}
          <h3 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.12rem",
            fontWeight: 600,
            color: "var(--color-text-strong)",
            margin: 0,
            letterSpacing: "-0.01em",
            lineHeight: 1.4,
          }}>{proj.name}</h3>
        </div>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "var(--color-muted)",
          paddingTop: "4px",
          whiteSpace: "nowrap",
        }}>{proj.period}</span>
      </div>

      {/* 회사 · 유형 메타 */}
      <p style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.82rem",
        fontWeight: 500,
        color: "var(--color-muted)",
        margin: "0 0 12px",
      }}>
        {proj.org}{proj.type ? ` · ${proj.type}` : ""}
      </p>

      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {proj.stack.map((s, si) => (
          <span key={si} className="tag">{s}</span>
        ))}
      </div>

      {proj.oneLiner && (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.9rem",
          fontWeight: 400,
          color: "var(--color-text-soft)",
          margin: "12px 0 0",
          lineHeight: 1.7,
        }}>
          {proj.oneLiner}
        </p>
      )}

      {proj.clients && (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.82rem",
          fontWeight: 400,
          color: "var(--color-muted)",
          margin: "8px 0 0",
        }}>
          <span style={{ color: "var(--color-muted-2)" }}>적용 기관 · </span>
          {proj.clients.join(" · ")}
        </p>
      )}

      {proj.links && proj.links.filter(l => l.url).length > 0 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
          {proj.links.filter(l => l.url).map((l, li) => (
            <a key={li} href={l.url} target="_blank" rel="noopener noreferrer"
              className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.82rem" }}>
              {l.label} ↗
            </a>
          ))}
        </div>
      )}

      <div>
        {proj.cases.map((item, ii) => <CaseStudy key={ii} item={item} showDetail={false} />)}
      </div>

      {proj.cases.some(c => c.problem || c.decision || c.retrospective) && (
        <Expandable label="문제 · 접근 · 판단 근거 · 회고 보기" closeLabel="접기" style={{ marginTop: "14px" }}>
          <div style={{ display: "grid", gap: "14px" }}>
            {proj.cases.filter(c => c.problem || c.solution || c.decision || c.retrospective).map((c, ci) => (
              <div key={ci}>
                <p style={{
                  fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600,
                  color: "var(--color-text-strong)", margin: "0 0 8px",
                }}>{c.title}</p>
                <div style={{ display: "grid", gap: "8px" }}>
                  <DetailBlock label="문제" body={c.problem} />
                  <DetailBlock label="접근" body={c.solution} />
                  <DetailBlock label="판단 근거" body={c.decision} />
                  <DetailBlock label="회고" body={c.retrospective} />
                </div>
              </div>
            ))}
          </div>
        </Expandable>
      )}
    </article>
  );
}

export default function Projects() {
  // 데이터 순서(최신순) 유지 - featured는 배지로만 표시 (정렬하면 연도 순서가 뒤섞임)
  const ordered = resume.projects;

  return (
    <section id="work" className="section" style={{ background: "var(--color-bg-alt)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Projects</p>
          <h2 className="section-title">프로젝트</h2>
        </FadeIn>

        <div className="section-content" style={{
          display: "flex", flexDirection: "column", gap: "12px",
        }}>
          {ordered.map((proj, i) => (
            <FadeIn key={proj.id || i} delay={i * 0.05}>
              <ProjectCard proj={proj} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
