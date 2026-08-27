import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { navigation } from '@/content/brand'
import { BrandLockup } from '@/components/Wordmark'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { transition } from '@/lib/motion'
import marchio from '@/assets/images/marchio-mano.webp'

export function Header() {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()

  return (
    <header className="sticky top-0 z-50 bg-brick text-on-brick">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 md:px-8 md:py-5">
        {/* The mark echoes the brochure cover: a round photograph of the work in
            progress, set beside the wordmark with the founder's name beneath. */}
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="group flex items-center gap-3 text-paper"
          aria-label="Hilos y Papel, Chiara Castracane — home"
        >
          <img
            src={marchio}
            width={240}
            height={240}
            alt=""
            aria-hidden="true"
            className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-paper/35 md:h-13 md:w-13"
          />
          <BrandLockup className="text-[1.45rem] md:text-[1.75rem]" />
        </Link>

        <nav aria-label="Principale" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {navigation.map((item) => (
              <li key={item.to}>
                <NavItem to={item.to} label={item.label} />
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          className="-mr-2 flex h-10 w-10 items-center justify-center rounded-sm md:hidden"
        >
          <span className="sr-only">{open ? 'Chiudi il menu' : 'Apri il menu'}</span>
          <MenuGlyph open={open} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="menu-mobile"
            key="menu"
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0.01 } : transition.base}
            className="overflow-hidden border-t border-paper/15 md:hidden"
          >
            <nav aria-label="Principale, mobile" className="px-6 py-3">
              <ul className="flex flex-col">
                {navigation.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block py-3 text-body-lg font-semibold ${
                          isActive ? 'text-on-brick' : 'text-paper'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative block py-1 text-label font-semibold tracking-wide uppercase transition-colors duration-200 ${
          isActive ? 'text-on-brick' : 'text-paper hover:text-on-brick'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          <span
            aria-hidden="true"
            className={`absolute -bottom-0.5 left-0 h-px w-full origin-left transition-transform duration-200 ease-out ${
              isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, currentColor 0 6px, transparent 6px 10px)',
              color: 'var(--color-on-brick)',
              backgroundColor: 'transparent',
            }}
          />
        </>
      )}
    </NavLink>
  )
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <motion.line
        x1="3"
        y1="7"
        x2="21"
        y2="7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray="4 2.8"
        animate={open ? { rotate: 45, y: 5, x: 0 } : { rotate: 0, y: 0 }}
        style={{ originX: '50%', originY: '50%' }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      />
      <motion.line
        x1="3"
        y1="17"
        x2="21"
        y2="17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray="4 2.8"
        animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
        style={{ originX: '50%', originY: '50%' }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      />
    </svg>
  )
}
