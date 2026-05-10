import resume from "../data/resume";

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--color-border)",
      background: "var(--color-bg)",
      padding: "32px 0",
    }}>
      <div className="container" style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "var(--color-text-soft)",
        }}>
          {resume.name} · {resume.title}
        </p>
      </div>
    </footer>
  );
}
