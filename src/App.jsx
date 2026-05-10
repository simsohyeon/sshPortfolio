import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import About from "./components/About";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import AdditionalInfo from "./components/AdditionalInfo";
import Footer from "./components/Footer";

export default function App() {
  const [activeNav, setActiveNav] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveNav(e.target.id); });
      },
      // viewport 상단 ~30% 지점에 가상의 트리거 라인을 두고,
      // 그 라인을 가로지르는 섹션을 active로 표시 → 섹션 길이와 무관하게 동작
      { rootMargin: "-30% 0px -65% 0px", threshold: 0 }
    );
    ["about", "experience", "skills", "info"].forEach(id => {
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
      <AdditionalInfo />
      <Footer />
    </div>
  );
}
