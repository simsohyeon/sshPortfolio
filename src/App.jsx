import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import About from "./components/About";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Footer from "./components/Footer";

export default function App() {
  const [activeNav, setActiveNav] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveNav(e.target.id); }); },
      { threshold: 0.4 }
    );
    ["about", "experience", "skills"].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Nav active={activeNav} />
      <Hero />
      <Stats />
      <About />
      <Experience />
      <Skills />
      <Footer />
    </div>
  );
}
