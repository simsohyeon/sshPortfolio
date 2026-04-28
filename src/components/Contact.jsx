import FadeIn from "./common/FadeIn";
import resume from "../data/resume";

export default function Contact() {
  const emailUrl = `https://mail.google.com/mail/?view=cm&to=${resume.contact.email}&subject=${encodeURIComponent("채용 문의드립니다")}`;

  const items = [
    { label: "EMAIL", value: resume.contact.email, href: emailUrl, target: "_blank" },
    { label: "PHONE", value: resume.contact.phone, href: `sms:${resume.contact.phone}`, target: undefined },
    { label: "GITHUB", value: "github.com/simsohyeon", href: resume.contact.github, target: "_blank" },
  ];

  return (
    <section id="contact" style={{ padding: "6rem clamp(1.5rem,5vw,4rem)", background: "var(--color-dark)" }}>
      <FadeIn>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-accent)", letterSpacing: "0.12em", marginBottom: "0.8rem" }}>CONTACT</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "var(--color-white)", margin: "0 0 1rem" }}>
            함께 일하고 싶다면<span style={{ color: "var(--color-accent)" }}>.</span>
          </h2>
          <p style={{ fontFamily: "var(--font-korean)", fontSize: "0.95rem", color: "var(--color-muted)", lineHeight: 1.8, marginBottom: "2.5rem" }}>
            더 나은 시스템을 함께 만들어갈 팀을 찾고 있습니다.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
            {items.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target={item.target}
                rel="noreferrer"
                style={{
                  display: "flex", gap: "1.5rem", alignItems: "center", textDecoration: "none",
                  padding: "0.8rem 2rem", border: "1px solid #333", width: "100%", maxWidth: "380px",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-accent)", letterSpacing: "0.1em", minWidth: "52px" }}>{item.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#ccc" }}>{item.value}</span>
              </a>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
