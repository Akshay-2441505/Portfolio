import { useState } from 'react'
import { Contact } from './components/Contact'
import { CustomCursor } from './components/CustomCursor'
import { Experience } from './components/Experience'
import { FifaCard } from './components/FifaCard'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { MatchClock } from './components/MatchClock'
import { Nav } from './components/Nav'
import { PitchGrid } from './components/PitchGrid'
import { Preloader } from './components/Preloader'
import { Projects } from './components/Projects'
import { SmoothScroll } from './components/SmoothScroll'
import { ScrollTrigger } from './lib/gsap'

const VISITED_KEY = 'portfolio-visited'

function hasVisitedThisSession() {
  try {
    return sessionStorage.getItem(VISITED_KEY) === '1'
  } catch {
    return false
  }
}

function App() {
  const [loading, setLoading] = useState(() => !hasVisitedThisSession())

  return (
    <SmoothScroll>
      {loading && (
        <Preloader
          onComplete={() => {
            try {
              sessionStorage.setItem(VISITED_KEY, '1')
            } catch {
              // ignore — worst case the preloader replays next load
            }
            setLoading(false)
            requestAnimationFrame(() => ScrollTrigger.refresh())
          }}
        />
      )}
      <div className="grain-overlay" />
      <PitchGrid />
      <MatchClock />
      <CustomCursor />
      <div className="relative">
        <Nav />
        <Hero revealReady={!loading} />
        <Marquee />
        <FifaCard />
        <Experience />
        <Projects />
        <Contact />
      </div>
    </SmoothScroll>
  )
}

export default App
