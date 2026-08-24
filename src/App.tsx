import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageTransition } from '@/components/layout/PageTransition'
import { Home } from '@/pages/Home'
import { Quaderni, Tipologie, Carte, ComponiIlTuo, ChiSono } from '@/pages/stubs'

export default function App() {
  const location = useLocation()

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
          <PageTransition key={location.pathname}>
            <ScrollToTop />
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/quaderni" element={<Quaderni />} />
              <Route path="/tipologie" element={<Tipologie />} />
              <Route path="/carte" element={<Carte />} />
              <Route path="/componi-il-tuo" element={<ComponiIlTuo />} />
              <Route path="/chi-sono" element={<ChiSono />} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </div>

      <Footer />
    </>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
