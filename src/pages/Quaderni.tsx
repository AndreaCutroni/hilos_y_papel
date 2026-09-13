import { useEffect, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ThreadDivider } from '@/components/motifs/ThreadDivider'
import {
  formatoDi,
  immaginiDaControllare,
  PESO_MASSIMO,
  problemiQuaderni,
  quaderni,
  type Quaderno,
} from '@/content/quaderni'
import { tipologie } from '@/content/products'
import { rise, riseStagger, transition } from '@/lib/motion'
import { useReducedMotion } from '@/lib/useReducedMotion'

const nomeTipologia = new Map<string, string>(tipologie.map((t) => [t.id, t.name]))

/** The catalogue grid. Filters live in the query string, so a filtered view can
    be shared and is still there when the visitor comes back from a notebook. */
export function Quaderni() {
  const [params, setParams] = useSearchParams()
  const reduced = useReducedMotion()
  const copertina = params.get('copertina')
  const formato = params.get('formato')
  const personalizzati = params.get('personalizzati') === '1'

  const visibili = quaderni.filter(
    (q) =>
      (!copertina || q.tipologia === copertina) &&
      (!formato || q.taglia === formato) &&
      (!personalizzati || q.genere === 'personalizzato')
  )

  const imposta = (chiave: string, valore: string | null) =>
    setParams(
      (prima) => {
        const dopo = new URLSearchParams(prima)
        if (valore) dopo.set(chiave, valore)
        else dopo.delete(chiave)
        return dopo
      },
      { replace: true }
    )

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 md:px-8 md:pt-20">
        <motion.div variants={riseStagger(0.08)} initial="hidden" animate="visible">
          <motion.p
            variants={rise}
            className="text-label font-bold tracking-[0.14em] text-accent uppercase"
          >
            Catalogo
          </motion.p>
          <motion.h1 variants={rise} className="mt-4 text-h2 text-ink md:text-h1">
            Quaderni
          </motion.h1>
          <motion.p
            variants={rise}
            className="mt-6 max-w-xl text-body-lg text-ink-soft text-pretty"
          >
            Ogni quaderno è cucito a mano, uno alla volta. Aprine uno per vedere tutte le foto e
            com’è fatto.
          </motion.p>
        </motion.div>
      </div>

      <ThreadDivider className="mx-auto max-w-6xl px-6 md:px-8" />

      <div className="mx-auto max-w-6xl px-6 pt-10 pb-20 md:px-8 md:pb-28">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Gruppo nome="Copertina">
              <Chip attivo={!copertina} onClick={() => imposta('copertina', null)}>
                Tutte
              </Chip>
              <Chip attivo={copertina === 'rigido'} onClick={() => imposta('copertina', 'rigido')}>
                Rigido
              </Chip>
              <Chip attivo={copertina === 'flex'} onClick={() => imposta('copertina', 'flex')}>
                Flex
              </Chip>
            </Gruppo>
            <Gruppo nome="Formato">
              <Chip attivo={!formato} onClick={() => imposta('formato', null)}>
                Tutti
              </Chip>
              <Chip attivo={formato === 'A5'} onClick={() => imposta('formato', 'A5')}>
                A5
              </Chip>
              <Chip attivo={formato === 'A6'} onClick={() => imposta('formato', 'A6')}>
                A6
              </Chip>
            </Gruppo>
            <Chip
              attivo={personalizzati}
              onClick={() => imposta('personalizzati', personalizzati ? null : '1')}
            >
              Solo personalizzati
            </Chip>
          </div>
          <p aria-live="polite" className="text-label text-ink-soft">
            {visibili.length} {visibili.length === 1 ? 'quaderno' : 'quaderni'}
          </p>
        </div>

        {import.meta.env.DEV && <DaSistemare />}

        <ul className="relative mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-14">
          <AnimatePresence mode="popLayout">
            {visibili.map((q, i) => (
              <motion.li
                key={q.slug}
                layout={reduced ? false : 'position'}
                transition={transition.base}
                initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { ...transition.base, delay: reduced ? 0 : Math.min(i, 8) * 0.04 },
                }}
                exit={{ opacity: 0, transition: transition.quick }}
              >
                <VoceCatalogo q={q} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {visibili.length === 0 && (
          <div className="mt-2">
            <p className="text-body-lg text-ink">
              {/* The one empty combination worth explaining comes from the brochure:
                  illustrated covers are printed on board, so never flex. */}
              {personalizzati && copertina === 'flex'
                ? 'I quaderni personalizzati hanno sempre la copertina rigida.'
                : 'Nessun quaderno con questa combinazione.'}
            </p>
            <button
              type="button"
              onClick={() => setParams({}, { replace: true })}
              className="mt-4 text-label font-bold tracking-wide text-accent uppercase underline-offset-4 hover:underline"
            >
              Mostra tutti
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function VoceCatalogo({ q }: { q: Quaderno }) {
  return (
    <Link to={`/quaderni/${encodeURIComponent(q.slug)}`} className="group block rounded-[3px]">
      <div className="relative aspect-square overflow-hidden rounded-[3px] bg-paper-lift">
        <img
          src={q.cover1}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* cover2 fades in on hover. It is only rendered where a real hover
            exists: on touch it would be downloaded and never seen. */}
        {q.cover2 && (
          <img
            src={q.cover2}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 [@media(hover:hover)]:block"
          />
        )}
      </div>
      <h2 className="mt-4 text-body-lg leading-tight text-ink transition-colors duration-200 group-hover:text-brick md:text-h4">
        {q.nome}
      </h2>
      <p className="mt-1.5 text-label text-ink-soft">
        {nomeTipologia.get(q.tipologia)} · {formatoDi(q)}
      </p>
      {q.genere === 'personalizzato' && (
        <p className="mt-1 text-label font-bold tracking-wide text-accent uppercase">
          Personalizzato
        </p>
      )}
    </Link>
  )
}

/** Dev only: what keeps a notebook folder off the site or looks odd in it, and
    any photo too heavy to serve as it is. The owner sees it while previewing
    locally; the live site never ships it. */
function DaSistemare() {
  const pesanti = useFotoPesanti()
  if (!problemiQuaderni.length && !pesanti.length) return null

  return (
    <div role="note" className="mt-8 rounded-sm border border-brick/40 bg-paper-lift px-5 py-4">
      <p className="text-label font-bold tracking-wide text-accent uppercase">
        Da sistemare — visibile solo in locale
      </p>
      <ul className="mt-2 space-y-1 text-body text-ink">
        {problemiQuaderni.map((p) => (
          <li key={p.slug}>
            <span className="font-bold">{p.slug}</span>: {p.messaggi.join(' · ')}
          </li>
        ))}
        {pesanti.map((f) => (
          <li key={f.file}>
            <span className="font-bold">{f.file}</span> pesa {f.mb} MB: salvala più piccola (circa
            1600 px sul lato lungo, 1000 per le cover)
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Asks the dev server how big each photo in the notebook folders is. Nothing
    resizes them, so a camera original dropped in as it is would slow every
    page it appears on. */
function useFotoPesanti() {
  const [pesanti, setPesanti] = useState<{ file: string; mb: string }[]>([])
  useEffect(() => {
    let attivo = true
    Promise.all(
      immaginiDaControllare().map(({ file, url }) =>
        fetch(url, { method: 'HEAD' }).then((r) => ({
          file,
          byte: Number(r.headers.get('content-length')) || 0,
        }))
      )
    )
      .then((tutte) => {
        if (!attivo) return
        setPesanti(
          tutte
            .filter((f) => f.byte > PESO_MASSIMO)
            .map((f) => ({ file: f.file, mb: (f.byte / 1e6).toFixed(1).replace('.', ',') }))
        )
      })
      .catch(() => {})
    return () => {
      attivo = false
    }
  }, [])
  return pesanti
}

function Gruppo({ nome, children }: { nome: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={nome} className="flex flex-wrap items-center gap-2">
      <span aria-hidden="true" className="mr-1 text-label text-ink-soft">
        {nome}
      </span>
      {children}
    </div>
  )
}

function Chip({
  attivo,
  onClick,
  children,
}: {
  attivo: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={attivo}
      onClick={onClick}
      className={`rounded-sm border px-3 py-1.5 text-label font-semibold transition-colors duration-200 ${
        attivo
          ? 'border-brick bg-brick text-on-brick'
          : 'border-ink/20 text-ink hover:border-brick hover:text-brick'
      }`}
    >
      {children}
    </button>
  )
}
