import resume from "../data/resume";

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--color-border)",
      background: "var(--color-bg)",
      padding: "28px 0",
    }}>
      <div className="container" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.85rem",
          fontWeight: 500,
          color: "var(--color-text-soft)",
        }}>
          {resume.name} · {resume.title}
        </p>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "var(--color-muted)",
        }}>
          © {new Date().getFullYear()} {resume.nameEn} · Built with React &amp; Vite
        </p>
      </div>
    </footer>
  );
}
