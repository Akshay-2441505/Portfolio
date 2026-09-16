import { useEffect } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
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
      {/* CursorTrail, CanvasParticles, and (after several rounds of custom-
       * cursor exploration — dot+ring, crosshair variants, a spotlight glow
       * — none of it read as better than just leaving it alone) CustomCursor
       * itself were all cut. All three stay on disk, unmounted, matching
       * this codebase's convention for superseded code. The native cursor
       * is the actual answer here, not a placeholder for one. */}
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
