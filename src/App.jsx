import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import About from "./components/About";
import Projects from "./components/Projects";
import FeaturedEngineeringProject from "./components/FeaturedEngineeringProject";
import Skills from "./components/Skills";
import AIEngineering from "./components/AIEngineering";
import AdditionalInfo from "./components/AdditionalInfo";
import Footer from "./components/Footer";

export default function App() {
  const [activeNav, setActiveNav] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveNav(e.target.id); });
      },
      { rootMargin: "-30% 0px -65% 0px", threshold: 0 }
    );

    ["about", "work", "engineering-project", "skills", "info"].forEach(id => {
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
      <Projects />
      <FeaturedEngineeringProject />
      <Skills />
      <AIEngineering />
      <AdditionalInfo />
      <Footer />
    </div>
  );
}
