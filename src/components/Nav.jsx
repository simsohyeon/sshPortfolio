const links = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export default function Nav({ active }) {
  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(252,251,248,0.88)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--color-border)",
      display: "flex", justifyContent: "center", alignItems: "center",
      height: "60px",
    }}>
      <div style={{ display: "flex", gap: "2.5rem" }}>
        {links.map(l => (
          <a
            key={l.id}
            href={`#${l.id}`}
            onClick={(e) => handleClick(e, l.id)}
            style={{
              fontFamily: "var(--font-mono)", fontSize: "0.78rem",
              color: active === l.id ? "var(--color-accent)" : "#555",
              textDecoration: "none", letterSpacing: "0.05em",
              borderBottom: active === l.id ? "2px solid var(--color-accent)" : "2px solid transparent",
              paddingBottom: "2px", transition: "color 0.2s, border-color 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={e => { if (active !== l.id) e.currentTarget.style.color = "var(--color-dark)"; }}
            onMouseLeave={e => { if (active !== l.id) e.currentTarget.style.color = "#555"; }}
          >{l.label}</a>
        ))}
      </div>
    </nav>
  );
}
