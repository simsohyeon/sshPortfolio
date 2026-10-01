import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import PersonalProjects from "./components/PersonalProjects";
import Skills from "./components/Skills";
import ResumeInfo from "./components/ResumeInfo";
import Footer from "./components/Footer";

const SECTION_IDS = ["about", "experience", "projects", "skills", "resume"];

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
    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // 마지막 섹션이 짧으면 트리거 라인을 못 넘기므로 스크롤 끝에서 강제 지정
    const last = SECTION_IDS[SECTION_IDS.length - 1];
    const onScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) setActiveNav(last);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Nav active={activeNav} />
      <Hero />
      <About />
      <Experience />
      <PersonalProjects />
      <Skills />
      <ResumeInfo />
      <Footer />
    </div>
  );
}
