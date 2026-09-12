import { useEffect } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { CustomCursor } from './components/CustomCursor'
import { Experience } from './components/Experience'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Projects } from './components/Projects'
import { Skills } from './components/Skills'
import { SmoothScroll } from './components/SmoothScroll'
import { ScrollTrigger } from './lib/gsap'

function App() {
  // Newsreader/Archivo load async (display: swap) and can shift section
  // heights after ScrollTrigger's first measurement — refresh once settled.
  useEffect(() => {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <SmoothScroll>
      <div className="grain-overlay" />
      {/* CursorTrail and CanvasParticles were built on a trial basis
       * (EFFECTS_PLAN.md's experimental trio) and cut in the Task 13 QA pass
       * — the trail duplicated CustomCursor's dot+ring vocabulary, and the
       * particle field read as noise in the negative space the minimal
       * design depends on. Both components stay on disk, unmounted, matching
       * this codebase's convention for superseded code. */}
      <CustomCursor />
      <div className="relative">
        <Nav />
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </div>
    </SmoothScroll>
  )
}

export default App
