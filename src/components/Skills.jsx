import FadeIn from "./common/FadeIn";
import LabelRow from "./common/LabelRow";
import resume from "../data/resume";

export default function Skills() {
  const primary = new Set(resume.primarySkillCategories || []);

  return (
    <section id="skills" className="section" style={{ background: "var(--color-bg-alt)" }}>
      <div className="container">
        <FadeIn>
          <p className="eyebrow">Skills</p>
          <h2 className="section-title">기술 스택</h2>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="section-content">
            {Object.entries(resume.skills).map(([cat, items]) => (
              <LabelRow key={cat} label={cat} sub={resume.skillLevels[cat]} accent={primary.has(cat)}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {items.map((item, j) => <span key={j} className="tag">{item}</span>)}
                </div>
              </LabelRow>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
