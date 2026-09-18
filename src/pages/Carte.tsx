import { useLayoutEffect, useRef, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ThreadDivider } from '@/components/motifs/ThreadDivider'
import { carteFantasia, nomeTipo, problemiCarte, type CartaFantasia } from '@/content/carte'
import { generi } from '@/content/products'
import { rise, riseStagger } from '@/lib/motion'
import { useReducedMotion } from '@/lib/useReducedMotion'

const fantasia = generi.find((g) => g.id === 'fantasia')

/**
 * The papers, each hanging rolled up and unrolling downward as it comes up the
 * screen. Under each: its name, its type, the «Ultimi fogli» stamp when it is
 * running out, and a notebook icon when the catalogue has one made with it.
 */
export function Carte() {
  const reduced = useReducedMotion()
  const elenco = useRef<HTMLUListElement>(null)
  useSrotola(elenco, reduced)

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 md:px-8 md:pt-20">
        <motion.div variants={riseStagger(0.08)} initial="hidden" animate="visible">
          <motion.p
            variants={rise}
            className="text-label font-bold tracking-[0.14em] text-accent uppercase"
          >
            Carte fantasia
          </motion.p>
          <motion.h1 variants={rise} className="mt-4 text-h2 text-ink md:text-h1">
            Carte
          </motion.h1>
          {fantasia && (
            <motion.p
              variants={rise}
              className="mt-6 max-w-xl text-body-lg text-ink-soft text-pretty"
            >
              {fantasia.description}
            </motion.p>
          )}
        </motion.div>
      </div>

      <ThreadDivider className="mx-auto max-w-6xl px-6 md:px-8" />

      <div className="mx-auto max-w-6xl px-6 pt-12 pb-24 md:px-8 md:pt-16 md:pb-32">
        {import.meta.env.DEV && problemiCarte.length > 0 && <DaSistemare />}

        <ul
          ref={elenco}
          className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-16"
        >
          {carteFantasia.map((c) => (
            <li key={c.slug}>
              <CartaAppesa carta={c} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function CartaAppesa({ carta }: { carta: CartaFantasia }) {
  return (
    <figure className="m-0">
      {/* The roll's copy of the photo is set by useSrotola once the paper is
          near the screen, so it loads as lazily as the sheet itself. */}
      <div className="cr-area" data-foto={carta.foto}>
        <img
          src={carta.foto}
          alt=""
          width={900}
          height={1200}
          loading="lazy"
          decoding="async"
          className="cr-foglio"
        />
        <div className="cr-piega" aria-hidden="true" />
        <div className="cr-rotolo" aria-hidden="true" />
      </div>
      <figcaption className="mt-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-h4 leading-tight text-ink">{carta.nome}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-label text-ink-soft">
            {nomeTipo[carta.tipo]}
            {carta.ultimiFogli && <span className="cr-timbro">Ultimi fogli</span>}
          </p>
        </div>
        {/* A notebook of the catalogue made with this paper, as an example. */}
        {carta.quaderno && (
          <Link
            to={`/quaderni/${encodeURIComponent(carta.quaderno.slug)}`}
            aria-label={`Un quaderno con questa carta: ${carta.quaderno.nome}`}
            title="Vedi un quaderno fatto con questa carta"
            className="-mr-2.5 -mb-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-ink-soft transition-colors duration-200 hover:text-brick"
          >
            <IconaQuaderno />
          </Link>
        )}
      </figcaption>
    </figure>
  )
}

/** A notebook with its binding showing: the stitches cross the spine the way
    the Coptic sewing does on the real ones. */
function IconaQuaderno() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="6.5" y="3" width="13" height="18" rx="1.5" />
      <path d="M4 6.5h5M4 10.5h5M4 14.5h5M4 18.5h5" />
    </svg>
  )
}

/**
 * Each paper unrolls with the scroll: rolled while it sits low on the screen,
 * open by the time its top is a third of the way down, and rolling back up if
 * the reader scrolls back. Everything is written straight onto the elements,
 * as the sketchbook does, and every position is read before any is written, so
 * a scroll frame lays the page out once however many papers there are. Under
 * reduced motion every paper is simply open.
 */
function useSrotola(elenco: RefObject<HTMLUListElement | null>, reduced: boolean) {
  useLayoutEffect(() => {
    const ul = elenco.current
    if (!ul) return
    const pezzi = Array.from(ul.querySelectorAll<HTMLElement>('.cr-area')).flatMap((area) => {
      const foglio = area.querySelector<HTMLElement>('.cr-foglio')
      const piega = area.querySelector<HTMLElement>('.cr-piega')
      const rotolo = area.querySelector<HTMLElement>('.cr-rotolo')
      return foglio && piega && rotolo ? [{ area, foglio, piega, rotolo, caricata: false }] : []
    })

    let raf = 0
    /* the first pass, and every resize, places every paper; a scroll frame
       only moves the ones near the screen */
    let tutte = true
    const aggiorna = () => {
      raf = 0
      const vh = innerHeight
      const misure = pezzi.map((p) => ({
        r: p.area.getBoundingClientRect(),
        rh: p.rotolo.offsetHeight,
        ph: p.piega.offsetHeight,
      }))
      pezzi.forEach((p, i) => {
        const { r, rh, ph } = misure[i]
        if (!p.caricata && r.top < vh * 2.5 && r.bottom > -vh) {
          p.rotolo.style.backgroundImage = `url("${p.area.dataset.foto}")`
          p.caricata = true
        }
        /* far off screen nothing moves: a paper is always rolled before it
           comes into view from below, and open once it has left at the top */
        if (!tutte && (r.top > vh * 1.5 || r.bottom < -vh)) return
        const t = reduced ? 1 : Math.min(1, Math.max(0, (vh * 0.92 - r.top) / (vh * 0.6)))
        const k = t * t * (3 - 2 * t)
        const y = k * (r.height - rh)
        /* the sheet shows down to the middle of the roll */
        p.foglio.style.clipPath = `inset(0 0 ${Math.max(0, r.height - y - rh / 2).toFixed(1)}px 0)`
        p.piega.style.transform = `translateY(${(y + rh / 2 - ph).toFixed(1)}px)`
        p.piega.style.opacity = (Math.min(1, k * 4) * (1 - k * 0.6)).toFixed(3)
        p.rotolo.style.transform = `translateY(${y.toFixed(1)}px)`
        /* the photo on the roll, squeezed like the curved surface it is drawn
           on, turning as the roll travels */
        p.rotolo.style.backgroundSize = `${(r.width * 1.03).toFixed(0)}px ${(r.height * 0.45).toFixed(0)}px`
        p.rotolo.style.backgroundPosition = `center ${(y * 1.6).toFixed(1)}px`
      })
      tutte = false
    }
    const chiedi = () => {
      if (!raf) raf = requestAnimationFrame(aggiorna)
    }
    const ridimensiona = () => {
      tutte = true
      chiedi()
    }

    aggiorna()
    addEventListener('scroll', chiedi, { passive: true })
    addEventListener('resize', ridimensiona)
    return () => {
      removeEventListener('scroll', chiedi)
      removeEventListener('resize', ridimensiona)
      cancelAnimationFrame(raf)
    }
  }, [elenco, reduced])
}

/** Dev only: the paper folders that could not go on the page, or look odd. */
function DaSistemare() {
  return (
    <div role="note" className="mb-10 rounded-sm border border-brick/40 bg-paper-lift px-5 py-4">
      <p className="text-label font-bold tracking-wide text-accent uppercase">
        Da sistemare — visibile solo in locale
      </p>
      <ul className="mt-2 space-y-1 text-body text-ink">
        {problemiCarte.map((p) => (
          <li key={p.slug}>
            <span className="font-bold">{p.slug}</span>: {p.messaggi.join(' · ')}
          </li>
        ))}
      </ul>
    </div>
  )
}
