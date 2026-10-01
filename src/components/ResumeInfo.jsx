import FadeIn from "./common/FadeIn";
import LabelRow from "./common/LabelRow";
import resume from "../data/resume";

function PlainList({ items }) {
  return (
    <ul style={{
      listStyle: "none", padding: 0, margin: 0,
      display: "flex", flexDirection: "column", gap: "8px",
    }}>
      {items.map((item, i) => (
        <li key={i} style={{
          fontFamily: "var(--font-sans)", fontSize: "0.92rem",
          color: "var(--color-text)", lineHeight: 1.6,
        }}>
          {item.main}
          {item.sub && (
            <span style={{ color: "var(--color-muted)", fontSize: "0.82rem", marginLeft: "8px" }}>
              {item.sub}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

// 학력 · 자격증 · 수상을 한 블록에 - 국내 경력직 이력서 순서
export default function ResumeInfo() {
  const { education, certifications, awards } = resume;

  return (
    <section id="resume" className="section" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Resume</p>
          <h2 className="section-title">이력</h2>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="section-content">
            <LabelRow label="학력">
              <PlainList items={[{ main: education.school, sub: `${education.period} · 학점 ${education.gpa}` }]} />
            </LabelRow>
            <LabelRow label="자격증">
              <PlainList items={certifications.map(c => ({ main: c.name, sub: `${c.org} · ${c.date}` }))} />
            </LabelRow>
            <LabelRow label="수상">
              <PlainList items={awards.map(a => ({ main: a }))} />
            </LabelRow>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
