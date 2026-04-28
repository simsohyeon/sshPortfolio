import { useState, useEffect } from "react";
import resume from "../data/resume";

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const emailUrl = `https://mail.google.com/mail/?view=cm&to=${resume.contact.email}&subject=${encodeURIComponent("채용 문의드립니다")}`;

  return (
    <section id="hero" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "clamp(2rem,8vw,6rem)",
      paddingTop: "100px", position: "relative", overflow: "hidden",
    }}>
      {/* background grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "48px 48px", opacity: 0.5,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "860px" }}>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: "0.8rem",
          color: "var(--color-accent)", letterSpacing: "0.12em", marginBottom: "1.2rem",
          opacity: mounted ? 1 : 0, transition: "opacity 0.5s 0.1s",
        }}>FULL STACK DEVELOPER · 4 YEARS</p>

        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(3rem, 8vw, 6rem)",
          lineHeight: 1.05, color: "var(--color-dark)", margin: 0,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s 0.2s, transform 0.6s 0.2s",
        }}>
          {resume.name}<span style={{ color: "var(--color-accent)" }}>.</span>
        </h1>

        <p style={{
          fontFamily: "var(--font-korean)",
          fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
          color: "var(--color-text)", marginTop: "1.4rem", lineHeight: 1.7, maxWidth: "600px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s 0.4s, transform 0.6s 0.4s",
        }}>{resume.tagline}</p>

        <div style={{
          display: "flex", gap: "0.8rem", flexWrap: "wrap", marginTop: "2rem",
          opacity: mounted ? 1 : 0, transition: "opacity 0.6s 0.6s",
        }}>
          {resume.keywords.map((k, i) => (
            <span key={i} style={{
              fontFamily: "var(--font-mono)", fontSize: "0.75rem",
              padding: "0.4rem 0.9rem", border: "1.5px solid var(--color-dark)",
              color: "var(--color-dark)", letterSpacing: "0.05em",
            }}>{k}</span>
          ))}
        </div>

        <div style={{
          display: "flex", gap: "1.2rem", marginTop: "2.5rem", flexWrap: "wrap",
          opacity: mounted ? 1 : 0, transition: "opacity 0.6s 0.8s",
        }}>
          <a
            href={emailUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: "var(--font-mono)", fontSize: "0.8rem",
              padding: "0.7rem 1.8rem", background: "var(--color-dark)", color: "var(--color-white)",
              textDecoration: "none", letterSpacing: "0.05em",
            }}>Contact Me</a>
          <a
            href={resume.contact.github}
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: "var(--font-mono)", fontSize: "0.8rem",
              padding: "0.7rem 1.8rem", border: "1.5px solid var(--color-dark)", color: "var(--color-dark)",
              textDecoration: "none", letterSpacing: "0.05em",
            }}>GitHub →</a>
        </div>
      </div>
    </section>
  );
}
