import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
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
import { fotoDi } from '@/lib/quaderniFoto'
import { rise, riseStagger, transition } from '@/lib/motion'
import { useReducedMotion } from '@/lib/useReducedMotion'

/** One notebook: its photos on the left, what it is made of on the right. */
export function Quaderno() {
  const { slug } = useParams()
  const i = quaderni.findIndex((q) => q.slug === slug)
  if (i < 0) return <NonTrovato />

  const q = quaderni[i]
  const n = quaderni.length
  const precedente = quaderni[(i - 1 + n) % n]
  const successivo = quaderni[(i + 1) % n]

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-20 md:px-8 md:pt-14 md:pb-28">
        <Link
          to="/quaderni"
          className="group inline-flex items-center gap-2 text-label font-bold tracking-wide text-accent uppercase"
        >
          <span
            aria-hidden="true"
            className="h-px w-6 origin-right bg-accent transition-transform duration-200 ease-out group-hover:scale-x-125"
          />
          Tutti i quaderni
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-14">
          {/* Keyed so the gallery starts again from the cover on every notebook. */}
          <Galleria key={q.slug} q={q} />
          <Dati q={q} />
        </div>

        <nav
          aria-label="Altri quaderni"
          className="mt-16 flex items-start justify-between gap-6 border-t border-ink/15 pt-6"
        >
          <Link to={`/quaderni/${precedente.slug}`} className="group">
            <span className="block text-label text-ink-soft">
              <span aria-hidden="true">← </span>Precedente
            </span>
            <span className="mt-1 block text-body-lg text-ink transition-colors duration-200 group-hover:text-brick">
              {precedente.nome}
            </span>
          </Link>
          <Link to={`/quaderni/${successivo.slug}`} className="group text-right">
            <span className="block text-label text-ink-soft">
              Successivo<span aria-hidden="true"> →</span>
            </span>
            <span className="mt-1 block text-body-lg text-ink transition-colors duration-200 group-hover:text-brick">
              {successivo.nome}
            </span>
          </Link>
        </nav>
      </div>
    </section>
  )
}

/** The photos at their own proportions — contained, never cropped — with the
    arrows beside them as on the sketchbook, thumbnails below, and a swipe on
    touch. */
function Galleria({ q }: { q: Voce }) {
  const foto = fotoDi(q)
  const [indice, setIndice] = useState(0)
  const reduced = useReducedMotion()
  const piuFoto = foto.length > 1
  const vai = (passo: number) => setIndice((v) => (v + passo + foto.length) % foto.length)
  const f = foto[indice]
  if (!f) return null

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') vai(-1)
        else if (e.key === 'ArrowRight') vai(1)
      }}
    >
      <div className="flex items-center gap-1 sm:gap-2">
        {piuFoto && (
          <Freccia label="Foto precedente" onClick={() => vai(-1)}>
            <path d="M15 6l-7 7 7 7" />
          </Freccia>
        )}
        <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[3px] bg-paper-lift">
          <AnimatePresence initial={false}>
            <motion.img
              key={f.nome}
              src={f.grande}
              srcSet={f.srcSet}
              sizes="(min-width: 768px) 45vw, 88vw"
              alt={`${q.nome}, foto ${indice + 1} di ${foto.length}`}
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain"
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
        // Inset by the width of an arrow and its gap, so the strip lines up
        // with the photo rather than with the arrows.
        <ul
          aria-label="Tutte le foto"
          className="mt-4 grid grid-cols-5 gap-2 px-9 sm:grid-cols-7 sm:px-12"
        >
          {foto.map((t, n) => (
            <li key={t.nome}>
              <button
                type="button"
                onClick={() => setIndice(n)}
                aria-label={`Foto ${n + 1} di ${foto.length}`}
                aria-current={n === indice ? 'true' : undefined}
                className={`block aspect-square w-full overflow-hidden rounded-[3px] ring-offset-2 ring-offset-paper transition-shadow duration-200 ${
                  n === indice ? 'ring-2 ring-brick' : 'hover:ring-1 hover:ring-ink-soft'
                }`}
              >
                <img
                  src={t.piccola}
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

function Dati({ q }: { q: Voce }) {
  const tipologia = tipologie.find((t) => t.id === q.tipologia)
  const genere = generi.find((g) => g.id === q.genere)

  return (
    <motion.div
      variants={riseStagger(0.06)}
      initial="hidden"
      animate="visible"
      className="md:sticky md:top-32 md:self-start"
    >
      <motion.h1 variants={rise} className="text-h2 text-ink md:text-h1">
        {q.nome}
      </motion.h1>

      <motion.dl variants={rise} className="mt-8 border-t border-ink/15">
        <Riga termine="Copertina">
          <span className="block text-body-lg text-ink">{tipologia?.name}</span>
          <span className="mt-1 block text-body text-ink-soft">
            {tipologia?.traits.slice(0, 2).join(' · ')}
          </span>
        </Riga>
        <Riga termine="Formato">
          <span className="flex items-end justify-between gap-6">
            <span>
              <span className="block text-body-lg text-ink">{formatoDi(q)}</span>
              <span className="mt-1 block text-body text-ink-soft tabular-nums">{misureDi(q)}</span>
            </span>
            <ScalaFormato q={q} />
          </span>
        </Riga>
        <Riga termine="Genere">
          <span className="block text-body-lg text-ink">{genere?.name}</span>
          <span className="mt-1 block text-body text-ink-soft text-pretty">
            {genere?.description}
          </span>
        </Riga>
      </motion.dl>

      <motion.p variants={rise} className="mt-8">
        <Link
          to={componiSimile(q)}
          className="inline-flex items-center rounded-sm bg-brick px-6 py-3 text-label font-bold tracking-wide text-on-brick uppercase transition-colors duration-200 hover:bg-brick-deep"
        >
          Componine uno simile
        </Link>
      </motion.p>
    </motion.div>
  )
}

function Riga({ termine, children }: { termine: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b border-ink/15 py-5">
      <dt className="pt-1 text-label tracking-wide text-ink-soft uppercase">{termine}</dt>
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
  // The drawing is always 5.5rem wide, so a centimetre shrinks when the sheets
  // lie horizontally. Lines and labels are sized in screen pixels (at the 16px
  // root) through this factor, so they read the same in both orientations.
  const px = (larghezza + 1) / 88
  const fogli = [
    { taglia: 'A5' as const, x: 0, w: w5, h: h5 },
    { taglia: 'A6' as const, x: w5 + stacco, w: w6, h: h6 },
  ]

  return (
    <svg
      viewBox={`-0.5 -0.5 ${larghezza + 1} ${altezza + 1}`}
      className="h-auto w-[5.5rem] shrink-0"
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

function NonTrovato() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
        <h1 className="text-h2 text-ink md:text-h1">Quaderno non trovato</h1>
        <p className="mt-6 max-w-xl text-body-lg text-ink-soft">
          Questo indirizzo non corrisponde a nessun quaderno del catalogo.
        </p>
        <p className="mt-8">
          <Link
            to="/quaderni"
            className="text-label font-bold tracking-wide text-accent uppercase underline-offset-4 hover:underline"
          >
            Tutti i quaderni
          </Link>
        </p>
      </div>
    </section>
  )
}
