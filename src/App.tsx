import { useEffect } from 'react'
import { Route, Routes, useLocation, useMatch, type Location } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageTransition } from '@/components/layout/PageTransition'
import { Home } from '@/pages/Home'
import { Quaderni } from '@/pages/Quaderni'
import { Quaderno } from '@/pages/Quaderno'
import { Carte } from '@/pages/Carte'
import { Tipologie } from '@/pages/Tipologie'
import { ComponiIlTuo } from '@/pages/ComponiIlTuo'
import { ChiSono } from '@/pages/ChiSono'

export default function App() {
  const location = useLocation()
  /* A notebook opens as a pop-up over the catalogue. The page underneath is the
     one it was opened from — carried in the link's state — or the catalogue
     itself when someone lands on a notebook's address directly. */
  const sfondo = (location.state as { sfondo?: Location } | null)?.sfondo ?? null
  const dietro = sfondo ?? location
  const quaderno = useMatch('/quaderni/:slug')

  return (
    <>
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:text-label focus:font-bold focus:text-on-brick"
      >
        Salta al contenuto
      </a>

      <Header />

      <div id="contenuto">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={dietro.pathname}>
            <ScrollToTop percorso={dietro.pathname} />
            <Routes location={dietro}>
              <Route path="/" element={<Home />} />
              <Route path="/quaderni" element={<Quaderni />} />
              {/* the catalogue is also what sits behind the pop-up */}
              <Route path="/quaderni/:slug" element={<Quaderni />} />
              <Route path="/tipologie" element={<Tipologie />} />
              <Route path="/carte" element={<Carte />} />
              <Route path="/componi-il-tuo" element={<ComponiIlTuo />} />
              <Route path="/chi-sono" element={<ChiSono />} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </div>

      <Footer />

      {quaderno?.params.slug && <Quaderno slug={quaderno.params.slug} />}
    </>
  )
}

/** The page behind a pop-up keeps its place, so only a real page change scrolls
    back to the top. */
function ScrollToTop({ percorso }: { percorso: string }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [percorso])
  return null
}
