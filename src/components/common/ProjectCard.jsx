const BASE = import.meta.env.BASE_URL;
// 포트폴리오는 선별본 - 카드당 성과 2개까지만. 전문은 별도 경력기술서(resume.html)에
const VISIBLE_HIGHLIGHTS = 2;
const STATUS_CLASS = { active: "tag tag-accent", live: "tag tag-accent", done: "tag" };

function Period({ children }) {
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: "0.74rem",
      color: "var(--color-muted)", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function Bullets({ items, marginTop = "12px" }) {
  if (!items || items.length === 0) return null;
  return (
    <ul style={{
      margin: `${marginTop} 0 0`, padding: 0, listStyle: "none",
      display: "flex", flexDirection: "column", gap: "6px",
    }}>
      {items.map((text, i) => (
        <li key={i} style={{
          fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 400,
          color: "var(--color-text-soft)", display: "flex", alignItems: "flex-start",
          gap: "10px", lineHeight: 1.65,
        }}>
          <span style={{
            width: "5px", height: "5px", borderRadius: "50%",
            background: "var(--color-accent)", flexShrink: 0, marginTop: "9px",
          }} />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

// 우측 패널은 실제 화면 이미지가 있는 개인 프로젝트에만. 회사 프로젝트는 텍스트로만
function Panel({ proj, kind }) {
  if (kind !== "personal") return null;
  if (proj.image) {
    return (
      <img
        className="card-image no-print"
        src={`${BASE}${proj.image.src}`}
        alt={proj.image.alt}
        width={proj.image.width}
        height={proj.image.height}
        loading="lazy"
      />
    );
  }
  // 이미지 자리 표시 - 로컬 개발 화면에서만. 배포 빌드에는 패널 없이 1열로 나간다
  if (import.meta.env.DEV) {
    return (
      <div className="image-slot no-print" aria-hidden="true">
        <span>이미지 자리</span>
        <span>1200 × 630 · png / webp</span>
        <span>resume.js image 필드에 연결</span>
      </div>
    );
  }
  return null;
}

// 모든 프로젝트 공용 카드. kind: "company" | "personal"
export default function ProjectCard({ proj, kind = "company" }) {
  const hasPanel = kind === "personal" && Boolean(proj.image || import.meta.env.DEV);
  const meta = kind === "company" ? proj.role : proj.context;
  const links = (proj.links || []).filter(l => l.url);
  // 회사 프로젝트는 성과 2개, 개인 프로젝트는 담당 역할 - 같은 자리, 같은 모양
  const bullets = kind === "company"
    ? (proj.highlights || []).slice(0, VISIBLE_HIGHLIGHTS)
    : (proj.contributions || []);
  const bulletLabel = kind === "company" ? "핵심 성과" : "담당 역할";

  return (
    <article className="card">
      <div className={hasPanel ? "project-grid" : undefined}>
        <div className="card-text">
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            flexWrap: "wrap", gap: "8px",
          }}>
            <h3 style={{
              fontFamily: "var(--font-sans)", fontSize: "1.08rem", fontWeight: 600,
              color: "var(--color-text-strong)", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.4,
            }}>{proj.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "3px" }}>
              {proj.status && <span className={STATUS_CLASS[proj.statusKind] || "tag"}>{proj.status}</span>}
              <Period>{proj.period}</Period>
            </div>
          </div>

          {meta && (
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 500,
              color: "var(--color-muted)", margin: "4px 0 0",
            }}>{meta}</p>
          )}

          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "12px" }}>
            {proj.stack.map((s, i) => <span key={i} className="tag">{s}</span>)}
          </div>

          {proj.summary && (
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 400,
              color: "var(--color-text-soft)", margin: "12px 0 0", lineHeight: 1.7,
            }}>{proj.summary}</p>
          )}

          {proj.clients && proj.clients.length > 0 && (
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: "0.82rem",
              color: "var(--color-muted)", margin: "8px 0 0",
            }}>
              <span style={{ color: "var(--color-muted-2)" }}>적용 기관 · </span>
              {proj.clients.join(" · ")}
            </p>
          )}

          {bullets.length > 0 && (
            <div style={{ marginTop: "14px" }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 500,
                letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-accent)",
              }}>{bulletLabel}</span>
              <Bullets items={bullets} marginTop="8px" />
            </div>
          )}

          {links.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "14px" }}>
              {links.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                  className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.82rem" }}>
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}

        </div>

        <Panel proj={proj} kind={kind} />
      </div>
    </article>
  );
}
