import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import {
  componiSimile,
  formatoDi,
  latiCm,
  misureDi,
  quaderni,
  type Quaderno as Voce,
  type Taglia,
} from '@/content/quaderni'
import { generi, tipologie } from '@/content/products'
import { riseStagger, transition } from '@/lib/motion'
import { useReducedMotion } from '@/lib/useReducedMotion'

/**
 * One notebook, as a pop-up over whatever page called it up: its photographs on
 * the left, what it is made of on the right, and the previous/next pair at the
 * foot.
 *
 * It is a native `<dialog>` opened with `showModal()`, so the browser gives us
 * what a hand-built overlay has to reinvent: focus kept inside, Escape, the
 * page behind made inert and a `::backdrop` to blur it. It closes on Escape, on
 * a click outside and on the button at the top right, always back to the page
 * it was opened from — the catalogue, or the papers on `/carte`.
 *
 * On a wide screen it is **one screenful and never scrolls**: the type takes
 * what it needs and the photograph takes the rest. A phone shows the same
 * details — the sheet drawing and both descriptions included — and lets the
 * reader scroll them with a finger, which is the easier gesture there; the
 * close button and previous/next stay put above and below.
 */
export function Quaderno({ slug }: { slug: string }) {
  const dialogo = useRef<HTMLDialogElement>(null)
  /* true only when the pop-up is being closed, not when the reader leaves
     for another page */
  const torna = useRef(false)
  const navigate = useNavigate()
  const { state } = useLocation()
  const reduced = useReducedMotion()

  useEffect(() => {
    /* Read first, put back on the way out: Chrome keeps the page behind
       where it was while it is held still, but Safari does not, and this
       costs nothing where it is already right. A real page change scrolls
       to the top after this anyway, since ScrollToTop runs later. */
    const y = window.scrollY
    const d = dialogo.current
    if (d && !d.open) d.showModal()
    return () => {
      if (!torna.current) return
      const rimetti = () => window.scrollTo(0, y)
      rimetti()
      /* once more after the browser has put focus back on whatever opened
         the pop-up, which scrolls that card into view */
      requestAnimationFrame(rimetti)
    }
  }, [])

  /* Straight back to the page the pop-up was opened from, filters and all, or
     to the catalogue when someone lands on a notebook's address directly.
     Never history.back(): after stepping through a few notebooks inside the
     pop-up, that only goes back one notebook. */
  const sfondo = (state as { sfondo?: { pathname: string; search: string } } | null)?.sfondo
  const chiudi = () => {
    torna.current = true
    navigate(sfondo ? sfondo.pathname + sfondo.search : '/quaderni')
  }

  const i = quaderni.findIndex((x) => x.slug === slug)
  const q = quaderni[i]
  const n = quaderni.length
  const precedente = q ? quaderni[(i - 1 + n) % n] : null
  const successivo = q ? quaderni[(i + 1) % n] : null

  return (
    <dialog
      ref={dialogo}
      aria-label={q ? q.nome : 'Quaderno non trovato'}
      onCancel={(e) => {
        e.preventDefault()
        chiudi()
      }}
      /* A click on the backdrop lands on the dialog itself. */
      onClick={(e) => {
        if (e.target === dialogo.current) chiudi()
      }}
      className="m-auto w-[min(64rem,100%-1.5rem)] max-w-none rounded-[4px] bg-paper p-0 text-ink shadow-[0_30px_70px_-25px_rgba(46,26,24,0.6)] backdrop:bg-ink/40 backdrop:backdrop-blur-[6px]"
    >
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0.01 } : transition.base}
        className="flex h-[calc(100dvh-1.5rem)] flex-col px-4 pt-3 pb-4 md:h-auto md:max-h-[calc(100dvh-4rem)] md:px-7 md:pt-4 md:pb-6"
      >
        {/* The close button has a row of its own, so its circle never crosses
            the rule that starts the notebook's details. */}
        <div className="flex shrink-0 justify-end">
          <button
            type="button"
            onClick={chiudi}
            aria-label="Chiudi"
            title="Chiudi"
            className="-mt-1 -mr-1 flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-ink/5 hover:text-brick"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
            </svg>
          </button>
        </div>

        {!q ? (
          <NonTrovato onClose={chiudi} />
        ) : (
          <>
            <div className="mt-1 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain md:mt-2">
              <div className="grid gap-5 md:h-full md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-10">
                {/* Keyed so the gallery starts again from the first photo on every notebook. */}
                <Galleria key={q.slug} q={q} />
                <Dati q={q} />
              </div>
            </div>

            {/* Only "previous" and "next": the neighbours' names are left to the
                screen reader, like every other notebook name on the site. */}
            <nav
              aria-label="Altri quaderni"
              className="mt-3 flex shrink-0 items-center justify-between gap-6 border-t border-ink/15 pt-2.5 md:mt-4 md:pt-3"
            >
              {precedente && (
                <Link
                  to={`/quaderni/${encodeURIComponent(precedente.slug)}`}
                  state={state}
                  aria-label={`Quaderno precedente: ${precedente.nome}`}
                  className="text-body text-ink transition-colors duration-200 hover:text-brick"
                >
                  <span aria-hidden="true">← </span>Precedente
                </Link>
              )}
              {successivo && (
                <Link
                  to={`/quaderni/${encodeURIComponent(successivo.slug)}`}
                  state={state}
                  aria-label={`Quaderno successivo: ${successivo.nome}`}
                  className="text-body text-ink transition-colors duration-200 hover:text-brick"
                >
                  Successivo<span aria-hidden="true"> →</span>
                </Link>
              )}
            </nav>
          </>
        )}
      </motion.div>
    </dialog>
  )
}

/** The photos from the notebook's images/ folder at their own proportions —
    contained, never cropped — with the arrows beside them as on the
    sketchbook, thumbnails below, and a swipe on touch. The photograph takes
    whatever height the pop-up has left, so nothing has to scroll. Keys are
    positions, not URLs: two files with the same content can share one URL in a
    build. */
function Galleria({ q }: { q: Voce }) {
  const foto = q.foto
  const [indice, setIndice] = useState(0)
  const reduced = useReducedMotion()
  const piuFoto = foto.length > 1
  const vai = (passo: number) => setIndice((v) => (v + passo + foto.length) % foto.length)
  const f = foto[indice]
  if (!f) return null

  return (
    <div
      /* the gap is small because the thumbnails carry their ring's padding */
      className="flex flex-col gap-1.5 md:min-h-0"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') vai(-1)
        else if (e.key === 'ArrowRight') vai(1)
      }}
    >
      <div className="flex items-center gap-1 sm:gap-2 md:min-h-0 md:flex-1">
        {piuFoto && (
          <Freccia label="Foto precedente" onClick={() => vai(-1)}>
            <path d="M15 6l-7 7 7 7" />
          </Freccia>
        )}
        {/* A share of the screen on a phone, where the details scroll under
            it; above md the square is capped both by the screen's height and by
            the room the details leave (the 100% below), so the whole pop-up
            stays one screenful however much type there is. */}
        <div className="relative h-[45dvh] min-h-[13rem] min-w-0 flex-1 md:aspect-square md:h-auto md:max-h-[min(52dvh,30rem,100%)] md:min-h-0">
          <AnimatePresence initial={false}>
            <motion.img
              key={indice}
              src={f}
              alt={`${q.nome}, foto ${indice + 1} di ${foto.length}`}
              draggable={false}
              className="absolute inset-0 h-full w-full rounded-[3px] object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0.01 } : transition.quick}
              drag={piuFoto && !reduced ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) vai(1)
                else if (info.offset.x > 60) vai(-1)
              }}
            />
          </AnimatePresence>
        </div>
        {piuFoto && (
          <Freccia label="Foto successiva" onClick={() => vai(1)}>
            <path d="M9 6l7 7-7 7" />
          </Freccia>
        )}
      </div>

      {piuFoto && (
        <ul
          aria-label="Tutte le foto"
          /* contain-paint as well as the scroll: an overflowing row otherwise
             widens the page behind, as the catalogue strip once did. The padding
             is the selected thumbnail's ring: the row clips its own content, so
             without it the ring is cut off on every side. */
          className="flex shrink-0 justify-center gap-2 overflow-x-auto p-1.5 contain-paint [scrollbar-width:none]"
        >
          {foto.map((t, n) => (
            <li key={n}>
              <button
                type="button"
                onClick={() => setIndice(n)}
                aria-label={`Foto ${n + 1} di ${foto.length}`}
                aria-current={n === indice ? 'true' : undefined}
                className={`block h-9 w-9 overflow-hidden rounded-[3px] ring-offset-2 ring-offset-paper transition-shadow duration-200 sm:h-11 sm:w-11 ${
                  n === indice ? 'ring-2 ring-brick' : 'hover:ring-1 hover:ring-ink-soft'
                }`}
              >
                <img
                  src={t}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="sr-only" aria-live="polite">
        Foto {indice + 1} di {foto.length}
      </p>
    </div>
  )
}

/** The details appear by fading alone: the pop-up already rises as one, and a
    lift inside it would push the last line past the foot of a box that can
    scroll, flashing a scrollbar as it opens. */
const apparire: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.base },
}

/** What the notebook is made of, in full: nothing here is clamped, so every
    description can be read. On a wide screen the photograph gives up its height
    to make room for it. */
function Dati({ q }: { q: Voce }) {
  const tipologia = tipologie.find((t) => t.id === q.tipologia)
  const genere = generi.find((g) => g.id === q.genere)

  return (
    <motion.div
      variants={riseStagger(0.06)}
      initial="hidden"
      animate="visible"
      className="flex flex-col md:min-h-0"
    >
      {/* The name still titles the pop-up for screen readers, but is not shown:
          the owner wants the notebook to speak through its photographs. */}
      <h1 className="sr-only">{q.nome}</h1>
      {/* The owner's own words from quaderno.json, when there are any. */}
      {q.descrizione && (
        <motion.p
          variants={apparire}
          className="text-body text-ink-soft text-pretty md:text-body-lg"
        >
          {q.descrizione}
        </motion.p>
      )}

      <motion.dl
        variants={apparire}
        className={`border-t border-ink/15 ${q.descrizione ? 'mt-4' : ''}`}
      >
        <Riga termine="Copertina">
          <span className="block text-body text-ink md:text-body-lg">{tipologia?.name}</span>
          <span className="mt-0.5 block text-label text-ink-soft md:text-body">
            {tipologia?.traits.slice(0, 2).join(' · ')}
          </span>
        </Riga>
        <Riga termine="Formato">
          <span className="flex items-end justify-between gap-6">
            <span>
              <span className="block text-body text-ink md:text-body-lg">{formatoDi(q)}</span>
              <span className="mt-0.5 block text-label text-ink-soft tabular-nums md:text-body">
                {misureDi(q)}
              </span>
            </span>
            <ScalaFormato q={q} />
          </span>
        </Riga>
        <Riga termine="Genere">
          <span className="block text-body text-ink md:text-body-lg">{genere?.name}</span>
          <span className="mt-0.5 block text-label text-ink-soft text-pretty md:text-body">
            {genere?.description}
          </span>
        </Riga>
      </motion.dl>

      <motion.p variants={apparire} className="mt-4 md:mt-5">
        <Link
          to={componiSimile(q)}
          className="inline-flex items-center rounded-sm bg-brick px-5 py-2.5 text-label font-bold tracking-wide text-on-brick uppercase transition-colors duration-200 hover:bg-brick-deep"
        >
          Componine uno simile
        </Link>
      </motion.p>
    </motion.div>
  )
}

function Riga({ termine, children }: { termine: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 border-b border-ink/15 py-2 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-4 sm:py-2.5">
      <dt className="pt-0.5 text-label tracking-wide text-ink-soft uppercase sm:pt-1">{termine}</dt>
      <dd className="m-0">{children}</dd>
    </div>
  )
}

/** The notebook's sheet drawn to scale beside the other size, so A5 and A6 read
    as objects in the hand rather than paper codes. Drawn in centimetres. */
function ScalaFormato({ q }: { q: Voce }) {
  const lati = (t: Taglia) => {
    const [corto, lungo] = latiCm[t]
    return q.orientamento === 'verticale' ? [corto, lungo] : [lungo, corto]
  }
  const [w5, h5] = lati('A5')
  const [w6, h6] = lati('A6')
  const stacco = 2.5
  const larghezza = w5 + stacco + w6
  const altezza = Math.max(h5, h6)
  // The drawing is always 4.5rem wide, so a centimetre shrinks when the sheets
  // lie horizontally. Lines and labels are sized in screen pixels (at the 16px
  // root) through this factor, so they read the same in both orientations.
  const px = (larghezza + 1) / 72
  const fogli = [
    { taglia: 'A5' as const, x: 0, w: w5, h: h5 },
    { taglia: 'A6' as const, x: w5 + stacco, w: w6, h: h6 },
  ]

  return (
    <svg
      viewBox={`-0.5 -0.5 ${larghezza + 1} ${altezza + 1}`}
      className="h-auto w-[4.5rem] shrink-0"
      aria-hidden="true"
    >
      {fogli.map(({ taglia, x, w, h }) => {
        const questo = taglia === q.taglia
        return (
          <g key={taglia}>
            <rect
              x={x}
              y={altezza - h}
              width={w}
              height={h}
              strokeWidth={1.25 * px}
              strokeDasharray={questo ? undefined : `${3 * px} ${2 * px}`}
              className={questo ? 'fill-paper-lift stroke-brick' : 'fill-none stroke-ink-soft'}
            />
            <text
              x={x + w / 2}
              y={altezza - h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11 * px}
              className={`font-sans ${questo ? 'fill-brick font-bold' : 'fill-ink-soft'}`}
            >
              {taglia}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** A page arrow beside the photo, drawn like the sketchbook's. */
function Freccia({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-12 w-8 shrink-0 items-center justify-center rounded-sm text-ink-soft transition-colors duration-200 hover:text-brick sm:h-16 sm:w-10"
    >
      <svg
        viewBox="0 0 24 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  )
}

function NonTrovato({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-10 text-center md:py-16">
      <h1 className="text-h3 text-ink md:text-h2">Quaderno non trovato</h1>
      <p className="mx-auto mt-5 max-w-md text-body-lg text-ink-soft">
        Questo indirizzo non corrisponde a nessun quaderno del catalogo.
      </p>
      <p className="mt-8">
        <button
          type="button"
          onClick={onClose}
          className="text-label font-bold tracking-wide text-accent uppercase underline-offset-4 hover:underline"
        >
          Tutti i quaderni
        </button>
      </p>
    </div>
  )
}
