import resume from "../data/resume";

export default function Footer() {
  const links = [
    { label: "이메일", href: `mailto:${resume.contact.email}?subject=${encodeURIComponent("채용 문의")}`, external: false },
    { label: "GitHub", href: resume.contact.github, external: true },
    { label: "경력기술서", href: `${import.meta.env.BASE_URL}resume.html`, external: true },
  ];

  return (
    <footer style={{
      borderTop: "1px solid var(--color-border)",
      background: "var(--color-bg)",
      padding: "32px 0",
    }}>
      <div className="container" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px 24px",
      }}>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "var(--color-text-soft)",
        }}>
          {resume.name} · {resume.title}
        </p>

        <div className="no-print" style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
          {links.map(l => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--color-text-soft)",
                transition: "color 0.15s var(--ease)",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--color-accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--color-text-soft)"; }}
            >
              {l.label}{l.external ? " ↗" : ""}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
