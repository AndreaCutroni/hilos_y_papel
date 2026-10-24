import { useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { generi, tipologie, formati, carte, personalizzazione } from '@/content/products'
import { carteFantasia } from '@/content/carte'
import { quaderni } from '@/content/quaderni'
import { contact } from '@/content/brand'
import { ThreadDivider } from '@/components/motifs/ThreadDivider'
import { rise, riseStagger } from '@/lib/motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { fasciaPrezzo, formattaPrezzo } from '@/lib/prezzi'
import './componi.css'

const passi = ['Genere', 'Tipologia', 'Formato', 'Fogli interni', 'Copertina', 'Riepilogo']
const titoli = [
  'Da dove vuoi partire?',
  'Rigido o Flex: quale fa per te?',
  'Quanto spazio per le tue idee?',
  'Su quale carta scriverai?',
  'Diamogli il tuo carattere.',
  'Il tuo quaderno, fin qui.',
]
const introduzioni = [
  'Carte e fantasie da abbinare, oppure un’illustrazione che nasce da una tua idea.',
  'Copertina rigida e cucitura a vista, oppure flessibile e rilegatura nascosta.',
  'Confronta le proporzioni e scegli il formato che fa per te.',
  'Carta riciclata o bianca: scegli i fogli interni del tuo quaderno.',
  'Un primo spunto: i dettagli si possono decidere insieme a Chiara.',
  'Riguarda le tue scelte. Puoi tornare a ogni passaggio e cambiarle.',
]
const a5Orizzontale = {
  id: 'a5-orizzontale',
  name: 'A5 orizzontale',
  size: 'Formato del catalogo, da concordare',
}

export function ComponiIlTuo() {
  const reduced = useReducedMotion()
  const [params, setParams] = useSearchParams()
  const genere = generi.find((g) => g.id === params.get('genere'))
  const tipologia = tipologie.find(
    (t) => t.id === (genere?.id === 'personalizzato' ? 'rigido' : params.get('tipologia'))
  )
  const formatiVisibili =
    params.get('formato') === a5Orizzontale.id ? [...formati, a5Orizzontale] : formati
  const formato = formatiVisibili.find((f) => f.id === params.get('formato'))
  const carta = carte.find((c) => c.id === params.get('carta'))
  const copertina = carteFantasia.find((c) => c.slug === params.get('copertina'))
  const prezzo = fasciaPrezzo({
    genere: genere?.id,
    tipologia: tipologia?.id,
    formato: formato?.name,
  })
  const [idea, setIdea] = useState('')
  const [nome, setNome] = useState('')
  const scelte = [
    genere?.name,
    tipologia?.name,
    formato?.name,
    carta?.name,
    genere?.id === 'fantasia' ? copertina?.nome : nome || (idea ? 'La tua idea' : undefined),
  ]
  const primoIncompleto = [genere, tipologia, formato, carta].findIndex((v) => !v)
  const limite = primoIncompleto === -1 ? 5 : primoIncompleto
  const [passo, setPasso] = useState(() => (primoIncompleto === -1 ? 3 : primoIncompleto))
  const attivo = Math.min(passo, limite)
  const percorso = useRef<HTMLDivElement>(null)

  function scegli(chiave: string, valore: string) {
    setParams(
      (prima) => {
        const prossimi = new URLSearchParams(prima)
        prossimi.set(chiave, valore)
        if (chiave === 'genere' && valore === 'personalizzato') prossimi.set('tipologia', 'rigido')
        return prossimi
      },
      { replace: true }
    )
  }

  function vai(indice: number) {
    setPasso(indice)
    // Focus follows explicit navigation; radio choices keep their native focus.
    requestAnimationFrame(() => {
      const titolo = percorso.current?.querySelector<HTMLElement>(`#componi-titolo-${indice}`)
      titolo?.focus({ preventScroll: true })
      if (percorso.current) {
        const top = percorso.current.getBoundingClientRect().top
        if (top < 100) titolo?.scrollIntoView({ block: 'center' })
      }
    })
  }

  const esempioFantasia = quaderni.find((q) => q.genere === 'fantasia')
  const esempioPersonale = quaderni.find((q) => q.genere === 'personalizzato')

  const richiesta = [
    'Ciao Chiara, vorrei realizzare un quaderno con queste caratteristiche:',
    '',
    ...passi.slice(0, 5).map((voce, i) => `${voce}: ${scelte[i] ?? 'Da decidere insieme'}`),
    ...(genere?.id === 'personalizzato' && idea ? ['', `La mia idea: ${idea}`] : []),
    '',
    'Possiamo concordare disponibilità, dettagli e prezzo finale?',
  ].join('\n')
  const emailRichiesta = `mailto:${contact.email}?subject=${encodeURIComponent('Il mio quaderno Hilos y Papel')}&body=${encodeURIComponent(richiesta)}`

  function riepilogo() {
    return (
      <dl className="componi-summary">
        {passi.slice(0, 5).map((voce, i) => (
          <div key={voce}>
            <dt>{voce}</dt>
            <dd>
              {scelte[i] ?? (i === 4 ? 'Da decidere insieme' : 'Da scegliere')}
              {i <= limite && (
                <button
                  type="button"
                  onClick={() => vai(i)}
                  aria-label={`Modifica ${voce.toLowerCase()}`}
                >
                  Modifica
                </button>
              )}
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  function contenuto(indice: number) {
    if (indice === 0)
      return (
        <>
          <div
            className="componi-choices componi-genres"
            role="radiogroup"
            aria-label="Genere del quaderno"
          >
            {generi.map((g) => (
              <Scelta
                key={g.id}
                gruppo="genere"
                valore={g.id}
                selezionata={genere?.id === g.id}
                cambia={() => scegli('genere', g.id)}
              >
                <img
                  className="componi-choice-photo"
                  src={(g.id === 'fantasia' ? esempioFantasia : esempioPersonale)?.cover1}
                  alt=""
                />
                <span className="componi-choice-copy">
                  <strong>{g.name}</strong>
                  <span>{g.description}</span>
                  <small>
                    Prezzo indicativo · {formattaPrezzo(fasciaPrezzo({ genere: g.id }))}
                  </small>
                </span>
              </Scelta>
            ))}
          </div>
          <p className="mt-4 text-label text-ink-soft">
            Le immagini che vedi sono esemplificative: il tuo quaderno sarà realizzato con la carta
            e i colori che sceglierai.
          </p>
        </>
      )
    if (indice === 1)
      return (
        <>
          {genere?.id === 'personalizzato' && (
            <p className="componi-note">
              Per la copertina illustrata si usa solo il Rigido. Lo trovi già selezionato.
            </p>
          )}
          <div className="componi-choices" role="radiogroup" aria-label="Tipologia del quaderno">
            {tipologie.map((t) => {
              const foto = quaderni.find((q) => q.tipologia === t.id && q.genere === 'fantasia')
              return (
                <Scelta
                  key={t.id}
                  gruppo="tipologia"
                  valore={t.id}
                  selezionata={tipologia?.id === t.id}
                  disabilitata={genere?.id === 'personalizzato' && t.id === 'flex'}
                  cambia={() => scegli('tipologia', t.id)}
                >
                  <img className="componi-choice-photo" src={foto?.cover1} alt="" />
                  <span className="componi-choice-copy">
                    <strong>{t.name}</strong>
                    {t.traits.map((tratto) => (
                      <span key={tratto}>{tratto}</span>
                    ))}
                  </span>
                </Scelta>
              )
            })}
          </div>
        </>
      )
    if (indice === 2)
      return (
        <>
          <div
            className="componi-choices componi-formats"
            role="radiogroup"
            aria-label="Formato del quaderno"
          >
            {formatiVisibili.map((f) => (
              <Scelta
                key={f.id}
                gruppo="formato"
                valore={f.id}
                selezionata={formato?.id === f.id}
                cambia={() => scegli('formato', f.id)}
              >
                <span className="componi-format-space" aria-hidden="true">
                  <span className={`componi-format-shape ${f.id}`}>
                    <span>{f.name.split(' ')[0]}</span>
                  </span>
                </span>
                <span className="componi-choice-copy">
                  <strong>{f.name}</strong>
                  <span>{f.size}</span>
                </span>
              </Scelta>
            ))}
          </div>
          {formato?.id === a5Orizzontale.id && (
            <p className="componi-note">
              Hai ripreso un A5 orizzontale dal catalogo. La brochure propone A5 verticale e A6 nei
              due orientamenti: confermeremo questo formato con Chiara.
            </p>
          )}
        </>
      )
    if (indice === 3)
      return (
        <div className="componi-choices" role="radiogroup" aria-label="Fogli interni">
          {carte.map((c) => (
            <Scelta
              key={c.id}
              gruppo="carta"
              valore={c.id}
              selezionata={carta?.id === c.id}
              cambia={() => scegli('carta', c.id)}
            >
              <span className={`componi-paper-sample ${c.id}`} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="componi-choice-copy">
                <strong>{c.name}</strong>
                {c.note && <span>{c.note}</span>}
                {c.recommended && <small>Consigliata da Chiara</small>}
              </span>
            </Scelta>
          ))}
        </div>
      )
    if (indice === 4)
      return genere?.id === 'fantasia' ? (
        <>
          <p className="componi-note">
            Scegli una carta come punto di partenza, oppure prosegui e decidiamola insieme. La
            disponibilità va confermata.
          </p>
          <div className="componi-swatches" role="radiogroup" aria-label="Carta per la copertina">
            {carteFantasia.map((c) => (
              <Scelta
                key={c.slug}
                gruppo="copertina"
                valore={c.slug}
                selezionata={copertina?.slug === c.slug}
                cambia={() => scegli('copertina', c.slug)}
              >
                <img src={c.foto} alt="" loading="lazy" />
                <span className="componi-choice-copy">
                  <strong>{c.nome}</strong>
                  {c.ultimiFogli && <small>Ultimi fogli</small>}
                </span>
              </Scelta>
            ))}
          </div>
        </>
      ) : (
        <div className="componi-personal">
          <p>{personalizzazione.constraints[0]}</p>
          <div className="componi-inspirations">
            {personalizzazione.routes.map((r) => (
              <p key={r.from}>
                <strong>{r.from}</strong>
                <span>{r.detail}</span>
              </p>
            ))}
          </div>
          <label htmlFor="componi-idea">
            Racconta la tua idea <span>(facoltativo)</span>
          </label>
          <textarea
            id="componi-idea"
            rows={4}
            maxLength={1500}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Un tema, un colore, qualcosa sulla persona che riceverà il quaderno…"
          />
          <label htmlFor="componi-nome">
            Nome sulla copertina <span>(facoltativo)</span>
          </label>
          <input
            id="componi-nome"
            maxLength={80}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Il nome che vorresti inserire"
          />
          <p className="componi-note">
            {personalizzazione.constraints[1]} Se parti da una foto, potrai condividerla con Chiara
            al momento del contatto.
          </p>
        </div>
      )
    return (
      <>
        {riepilogo()}
        {genere?.id === 'personalizzato' && idea && (
          <p className="componi-idea">
            <strong>La tua idea</strong>
            {idea}
          </p>
        )}
        <div className="componi-finish">
          <p className="componi-kicker">Il prossimo passo</p>
          <h3>Ne parliamo con Chiara.</h3>
          <p>
            Apri un’email con le tue scelte per concordare disponibilità, dettagli e prezzo finale.
          </p>
          <div className="componi-finish-actions">
            <a className="componi-primary" href={emailRichiesta}>
              Scrivi a Chiara <span aria-hidden="true">→</span>
            </a>
            <button className="componi-secondary" type="button" onClick={() => vai(0)}>
              Rivedi dall’inizio
            </button>
          </div>
        </div>
      </>
    )
  }

  function pannello(indice: number) {
    return (
      <div className="componi-panel">
        <div className="componi-panel-heading">
          <p className="componi-kicker">Passo {String(indice + 1).padStart(2, '0')} / 06</p>
          <h2 id={`componi-titolo-${indice}`} tabIndex={-1}>
            {titoli[indice]}
          </h2>
          <p>{introduzioni[indice]}</p>
        </div>
        {contenuto(indice)}
        {indice < 5 && (
          <div className="componi-actions">
            <button
              type="button"
              className="componi-back"
              disabled={indice === 0}
              onClick={() => vai(indice - 1)}
            >
              ← Indietro
            </button>
            <button
              type="button"
              className="componi-primary"
              disabled={indice < 4 && !scelte[indice]}
              onClick={() => vai(indice + 1)}
            >
              {indice === 4 ? 'Vedi il riepilogo' : 'Continua'} <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="componi-page">
      <header className="mx-auto max-w-6xl px-6 pt-16 pb-10 md:px-8 md:pt-20">
        <motion.div
          variants={riseStagger(0.08)}
          initial={reduced ? false : 'hidden'}
          animate="visible"
        >
          <motion.p
            variants={rise}
            className="text-label font-bold tracking-[0.14em] text-accent uppercase"
          >
            Un quaderno fatto a mano. Le tue scelte.
          </motion.p>
          <motion.h1 variants={rise} className="mt-4 text-h2 text-ink md:text-h1">
            Componi il tuo <span className="text-accent">quaderno.</span>
          </motion.h1>
          <motion.p
            variants={rise}
            className="mt-6 max-w-xl text-body-lg text-ink-soft text-pretty"
          >
            Partiamo da quello che hai in mente, un passo alla volta.
          </motion.p>
        </motion.div>
      </header>
      <ThreadDivider className="mx-auto max-w-6xl px-6 md:px-8" />
      <div className="componi-container">
        <div className="componi-content" ref={percorso}>
          <nav className="componi-step-nav" aria-label="Passaggi della configurazione">
            <ol>
              {passi.map((p, i) => (
                <li key={p}>
                  <button
                    type="button"
                    disabled={i > limite}
                    aria-current={attivo === i ? 'step' : undefined}
                    onClick={() => vai(i)}
                  >
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {p}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <div className="componi-workspace">
            <div className="componi-main">{pannello(attivo)}</div>
            <aside
              className="componi-desk"
              aria-label={attivo === 5 ? 'Dettagli e fascia di prezzo' : 'Il tuo quaderno fin qui'}
            >
              <p className="componi-kicker">
                {attivo === 5 ? 'Il tuo quaderno' : 'Il tuo quaderno, fin qui'}
              </p>
              {copertina && genere?.id === 'fantasia' && (
                <figure>
                  <img src={copertina.foto} alt={`Carta ${copertina.nome}`} />
                  <figcaption>La carta che hai scelto</figcaption>
                </figure>
              )}
              {attivo !== 5 && riepilogo()}
              {genere && (
                <p className="componi-price" role="status" aria-live="polite" aria-atomic="true">
                  {prezzo && 'Prezzo indicativo'}
                  <strong>{formattaPrezzo(prezzo)}</strong>
                  <span>Il prezzo finale si concorda con Chiara.</span>
                </p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}

function Scelta({
  gruppo,
  valore,
  selezionata,
  cambia,
  children,
  disabilitata = false,
}: {
  gruppo: string
  valore: string
  selezionata: boolean
  cambia: () => void
  children: ReactNode
  disabilitata?: boolean
}) {
  return (
    <label
      className={`componi-choice ${selezionata ? 'is-selected' : ''} ${disabilitata ? 'is-disabled' : ''}`}
    >
      <input
        type="radio"
        name={gruppo}
        value={valore}
        checked={selezionata}
        onChange={cambia}
        disabled={disabilitata}
      />
      <span className="componi-check" aria-hidden="true">
        {selezionata ? '✓' : ''}
      </span>
      {children}
    </label>
  )
}
