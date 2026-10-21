import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ThreadDivider } from '@/components/motifs/ThreadDivider'
import { contact } from '@/content/brand'
import { tipologie, type Tipologia } from '@/content/products'
import { rise, riseStagger } from '@/lib/motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import rigidoCopertina from '@/assets/tipologie/rigido-copertina.webp'
import rigidoCucitura from '@/assets/tipologie/rigido-cucitura.webp'
import flexCopertina from '@/assets/tipologie/flex-copertina.webp'
import flexBorsa from '@/assets/tipologie/flex-borsa.webp'
import './tipologie.css'

type Fotografia = {
  src: string
  alt: string
  width: number
  height: number
}

// Page 4 of the brochure shows both the covers and the way each binding behaves.
const fotografie: Record<Tipologia, Fotografia[]> = {
  rigido: [
    {
      src: rigidoCopertina,
      alt: 'Quaderno rigido con copertina a riquadri rossi e arancioni e cucitura a vista.',
      width: 240,
      height: 240,
    },
    {
      src: rigidoCucitura,
      alt: 'Dettaglio del quaderno rigido aperto: il filo arancione unisce i fascicoli sul dorso.',
      width: 240,
      height: 240,
    },
  ],
  flex: [
    {
      src: flexCopertina,
      alt: 'La copertina del quaderno Flex si piega tra le dita.',
      width: 240,
      height: 320,
    },
    {
      src: flexBorsa,
      alt: 'Un quaderno Flex piegato all’interno di una borsa.',
      width: 320,
      height: 240,
    },
  ],
}

export function Tipologie() {
  const reduced = useReducedMotion()
  const scrivimiAlbum = `mailto:${contact.email}?subject=${encodeURIComponent('Un album Hilos y Papel')}`
  const scrivimiRefill = `mailto:${contact.email}?subject=${encodeURIComponent('Refill per il mio quaderno rigido')}`

  return (
    <section className="tipologie bg-paper" aria-labelledby="tipologie-titolo">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 md:px-8 md:pt-20">
        <motion.div
          variants={riseStagger(0.08)}
          initial={reduced ? false : 'hidden'}
          animate="visible"
        >
          <motion.p
            variants={rise}
            className="text-label font-bold tracking-[0.14em] text-accent uppercase"
          >
            Quaderni fatti a mano
          </motion.p>
          <motion.h1
            id="tipologie-titolo"
            variants={rise}
            className="mt-4 text-h2 text-ink md:text-h1"
          >
            Tipologie
          </motion.h1>
          <motion.p
            variants={rise}
            className="mt-6 max-w-xl text-body-lg text-ink-soft text-pretty"
          >
            Rigido, Flex e Album. Ogni progetto comincia dalla sua forma.
          </motion.p>
          <motion.p variants={rise} className="mt-4 text-label text-ink-soft">
            <a href="#refill" className="tipologie-anchor">
              Hai già un quaderno rigido? Scopri Refill ↓
            </a>
          </motion.p>
        </motion.div>
      </div>

      <ThreadDivider className="mx-auto max-w-6xl px-6 md:px-8" />

      <div className="mx-auto max-w-6xl px-6 pt-10 pb-16 md:px-8 md:pb-20">
        <div className="tipologie-cards">
          {tipologie.map((tipo) => (
            <article
              key={tipo.id}
              id={tipo.id}
              className="tipologie-card"
              aria-labelledby={`titolo-${tipo.id}`}
            >
              <div>
                <h2 id={`titolo-${tipo.id}`} className="text-h3 text-ink md:text-h2">
                  {tipo.name}
                </h2>
                <p className="tipologie-tagline">
                  {tipo.id === 'rigido' ? 'Il filo resta a vista.' : 'Ti segue dappertutto.'}
                </p>
              </div>
              <p className="tipologie-description">{tipo.traits[2]}</p>
              <ul className="tipologie-traits">
                {tipo.traits.slice(0, 2).map((tratto) => (
                  <li key={tratto}>{tratto}</li>
                ))}
              </ul>
              <div className="tipologie-photos" role="group" aria-label={`Fotografie ${tipo.name}`}>
                {fotografie[tipo.id].map((foto) => (
                  <figure key={foto.src} className="tipologie-photo">
                    <img
                      src={foto.src}
                      width={foto.width}
                      height={foto.height}
                      alt={foto.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                ))}
              </div>
            </article>
          ))}
        </div>

        <article id="album" className="tipologie-album" aria-labelledby="titolo-album">
          <div>
            <h2 id="titolo-album" className="text-h3 text-ink md:text-h2">
              Album
            </h2>
            <p className="mt-4 max-w-md text-body text-ink-soft text-pretty">
              Hai in mente un album? Scegliamo insieme i dettagli.
            </p>
            <a
              href={scrivimiAlbum}
              className="tipologie-anchor mt-4 inline-flex text-label font-bold text-accent"
            >
              Parliamone →
            </a>
          </div>
          <div className="tipologie-photos" role="group" aria-label="Fotografie Album">
            {/* Keep the same two photo frames until dedicated Album images are available. */}
            {[1, 2].map((numero) => (
              <div
                key={numero}
                className="tipologie-photo tipologie-photo-placeholder"
                role="img"
                aria-label={`Fotografia Album ${numero} da aggiungere`}
              />
            ))}
          </div>
        </article>
      </div>

      <section id="refill" className="bg-paper-lift" aria-labelledby="titolo-refill">
        <div className="tipologie-refill mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-14">
          <div>
            <p className="text-label font-bold tracking-[0.12em] text-accent uppercase">
              Per chi ha già un quaderno rigido
            </p>
            <h2 id="titolo-refill" className="mt-3 text-h3 text-ink">
              Refill
            </h2>
          </div>
          <div>
            <p className="font-display text-h4 font-semibold text-ink">
              Nuovi fogli, stesso quaderno.
            </p>
            <p className="mt-3 max-w-lg text-body text-ink-soft text-pretty">
              Se hai già un quaderno rigido, puoi aggiungere nuovi fogli e continuare a usarlo.
            </p>
            <a
              href={scrivimiRefill}
              className="tipologie-anchor mt-5 inline-flex text-label font-bold text-accent"
            >
              Scrivimi per un refill →
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 pt-14 pb-4 md:flex-row md:items-center md:justify-between md:px-8 md:pt-16">
        <div>
          <h2 className="text-h4 text-ink md:text-h3">Da quale forma cominciamo?</h2>
          <p className="mt-3 text-body text-ink-soft">
            Carte, fili e colori: il prossimo passo è renderlo tuo.
          </p>
        </div>
        <Link
          to="/componi-il-tuo"
          className="inline-flex shrink-0 items-center rounded-sm bg-brick px-6 py-3 text-label font-bold tracking-wide text-on-brick uppercase transition-colors duration-200 hover:bg-brick-deep"
        >
          Componi il tuo quaderno
        </Link>
      </div>
    </section>
  )
}
