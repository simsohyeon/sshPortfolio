const links = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
];

export default function Nav({ active }) {
  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(8px) saturate(180%)",
      WebkitBackdropFilter: "blur(8px) saturate(180%)",
      borderBottom: "1px solid var(--color-border)",
      height: "var(--nav-height)",
    }}>
      <div className="container" style={{
        height: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "12px",
      }}>
        <a
          href="#hero"
          onClick={goTop}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.9rem",
            fontWeight: 500,
            color: "var(--color-text-strong)",
          }}
        >
          simsohyeon<span style={{ color: "var(--color-accent)" }}>.dev</span>
        </a>

        <div style={{
          display: "flex", alignItems: "center",
          gap: "clamp(2px, 1.5vw, 16px)",
        }}>
          {links.map(l => {
            const isActive = active === l.id;
            return (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => handleClick(e, l.id)}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(0.82rem, 1.6vw, 0.88rem)",
                  fontWeight: 500,
                  color: isActive ? "var(--color-accent)" : "var(--color-text-soft)",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  transition: "color 0.15s var(--ease)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "var(--color-text)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "var(--color-text-soft)"; }}
              >
                {l.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
