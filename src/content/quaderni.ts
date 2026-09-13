import type { Genere, Tipologia } from './products'

/**
 * The catalogue, read straight from the notebook folders: no script, no
 * generated file. Each src/assets/quaderni/<slug>/ holds
 *
 *   quaderno.json   the details, checked by `leggi` below
 *   cover1.*        the photo in the grid, cropped square if it isn't already
 *   cover2.*        the photo that fades in over it on hover (optional)
 *   images/         the photos on the notebook's page, in file-name order
 *
 * and its name is the URL: /quaderni/<slug>. The owner's guide, in Italian, is
 * src/assets/quaderni/LEGGIMI.md.
 *
 * Nothing resizes the photos: they are served as saved, so they must go in at
 * web size. A folder that cannot become a notebook stays off the site; it and
 * anything odd in the others are listed in `problemiQuaderni`, which /quaderni
 * shows in dev together with any photo heavier than PESO_MASSIMO.
 */

export type Taglia = 'A5' | 'A6'
export type Orientamento = 'verticale' | 'orizzontale'

export type Quaderno = {
  /** Folder name and URL: /quaderni/<slug>. */
  slug: string
  nome: string
  /** The owner's own words about this notebook, or '' when there are none. */
  descrizione: string
  tipologia: Tipologia
  taglia: Taglia
  orientamento: Orientamento
  genere: Genere
  cover1: string
  cover2: string | null
  /** The gallery: images/ in file-name order, or the covers when it is empty. */
  foto: string[]
}

export type Problema = { slug: string; messaggi: string[] }

/** Heavier than this, a photo is almost certainly a camera original never resized. */
export const PESO_MASSIMO = 1_000_000

const schede = import.meta.glob<unknown>('/src/assets/quaderni/*/quaderno.json', {
  eager: true,
  import: 'default',
})
const nellaCartella = import.meta.glob<string>(
  '/src/assets/quaderni/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true, import: 'default' }
)
const inImages = import.meta.glob<string>(
  '/src/assets/quaderni/*/images/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true, import: 'default' }
)

const FORMATI: Record<string, readonly [Taglia, Orientamento]> = {
  'a5 verticale': ['A5', 'verticale'],
  'a5 orizzontale': ['A5', 'orizzontale'],
  'a6 verticale': ['A6', 'verticale'],
  'a6 orizzontale': ['A6', 'orizzontale'],
}
const NOME_CARTELLA = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** "onde-rosse/images/01.webp", from a glob key. */
const relativo = (percorso: string) => percorso.replace(/^\/src\/assets\/quaderni\//, '')

type Cartella = {
  cover1?: string
  cover2?: string
  images: { file: string; url: string }[]
  /** Photos loose in the folder that are neither cover: shown nowhere. */
  fuori: string[]
}
const cartelle = new Map<string, Cartella>()
function cartella(slug: string) {
  let c = cartelle.get(slug)
  if (!c) {
    c = { images: [], fuori: [] }
    cartelle.set(slug, c)
  }
  return c
}
for (const [percorso, url] of Object.entries(nellaCartella)) {
  const [slug, file] = relativo(percorso).split('/')
  const nome = file.replace(/\.[^.]+$/, '').toLowerCase()
  if (nome === 'cover1') cartella(slug).cover1 = url
  else if (nome === 'cover2') cartella(slug).cover2 = url
  else cartella(slug).fuori.push(file)
}
for (const [percorso, url] of Object.entries(inImages)) {
  const [slug, , file] = relativo(percorso).split('/')
  cartella(slug).images.push({ file, url })
}
for (const c of cartelle.values())
  c.images.sort((a, b) => a.file.localeCompare(b.file, 'it', { numeric: true }))

const testo = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

type Letto = { quaderno: Quaderno | null; ordine: number; messaggi: string[] }

/**
 * One folder read and checked. `quaderno` is null when something keeps it off
 * the site; `messaggi` says what, and also flags what is merely odd.
 */
function leggi(slug: string, scheda: unknown): Letto {
  const c = cartella(slug)
  const errori: string[] = []
  const avvisi: string[] = []

  if (!NOME_CARTELLA.test(slug))
    avvisi.push(
      'il nome della cartella diventa l’indirizzo della pagina: meglio solo minuscole, numeri e trattini'
    )
  if (c.fuori.length) {
    const uno = c.fuori.length === 1
    avvisi.push(
      `${c.fuori.join(', ')} ${uno ? 'non è' : 'non sono'} in images e non ${uno ? 'si chiama' : 'si chiamano'} cover1 o cover2: non ${uno ? 'compare' : 'compaiono'} sul sito`
    )
  }

  if (typeof scheda !== 'object' || scheda === null || Array.isArray(scheda))
    return {
      quaderno: null,
      ordine: Infinity,
      messaggi: ['quaderno.json deve contenere un oggetto { ... }', ...avvisi],
    }
  const s = scheda as Record<string, unknown>

  const nome = testo(s.nome)
  if (!nome) errori.push('manca "nome"')
  const tipologia = testo(s.tipologia).toLowerCase()
  if (tipologia !== 'rigido' && tipologia !== 'flex')
    errori.push('"tipologia" deve essere "rigido" o "flex"')
  const formato = FORMATI[testo(s.formato).toLowerCase().replace(/\s+/g, ' ')]
  if (!formato)
    errori.push(
      '"formato" deve essere "A5 verticale", "A5 orizzontale", "A6 verticale" o "A6 orizzontale"'
    )
  if (typeof s.personalizzato !== 'boolean')
    errori.push('"personalizzato" deve essere true o false')
  if (s.ordine !== undefined && typeof s.ordine !== 'number')
    errori.push('"ordine" deve essere un numero')
  if (s.descrizione !== undefined && typeof s.descrizione !== 'string')
    errori.push('"descrizione" deve essere un testo tra virgolette')
  if (s.personalizzato === true && tipologia === 'flex')
    avvisi.push('personalizzato e flex, ma la brochure dice che i personalizzati sono solo rigidi')

  const images = c.images.map((f) => f.url)
  const cover1 = c.cover1 ?? images[0]
  if (!cover1) errori.push('mancano le foto: metti cover1 nella cartella e le altre foto in images')
  else if (!c.cover1) avvisi.push('manca cover1: nel catalogo uso la prima foto di images')

  const messaggi = [...errori, ...avvisi]
  if (errori.length || !formato || !cover1) return { quaderno: null, ordine: Infinity, messaggi }
  const cover2 = c.cover2 ?? null
  return {
    ordine: typeof s.ordine === 'number' ? s.ordine : Infinity,
    messaggi,
    quaderno: {
      slug,
      nome,
      descrizione: testo(s.descrizione),
      tipologia: tipologia as Tipologia,
      taglia: formato[0],
      orientamento: formato[1],
      genere: s.personalizzato ? 'personalizzato' : 'fantasia',
      cover1,
      cover2,
      foto: images.length ? images : cover2 ? [cover1, cover2] : [cover1],
    },
  }
}

const letti: Letto[] = []
const problemi: Problema[] = []
for (const [percorso, scheda] of Object.entries(schede)) {
  const slug = relativo(percorso).split('/')[0]
  const letto = leggi(slug, scheda)
  if (letto.messaggi.length) problemi.push({ slug, messaggi: letto.messaggi })
  letti.push(letto)
}
const conScheda = new Set(Object.keys(schede).map((p) => relativo(p).split('/')[0]))
for (const slug of cartelle.keys())
  if (!conScheda.has(slug))
    problemi.push({
      slug,
      messaggi: ['manca quaderno.json: senza, il quaderno non compare sul sito'],
    })

/** The notebooks in catalogue order: by `ordine`, then by name. */
export const quaderni: Quaderno[] = letti
  .filter((l): l is Letto & { quaderno: Quaderno } => l.quaderno !== null)
  .sort((a, b) => a.ordine - b.ordine || a.quaderno.nome.localeCompare(b.quaderno.nome, 'it'))
  .map((l) => l.quaderno)

/** Folders kept off the site, or with something odd in them, and why. */
export const problemiQuaderni: Problema[] = problemi.sort((a, b) => a.slug.localeCompare(b.slug))

/** Every photo in the folders, by path, for the dev-only weight check on /quaderni. */
export function immaginiDaControllare() {
  return [...Object.entries(nellaCartella), ...Object.entries(inImages)].map(([percorso, url]) => ({
    file: relativo(percorso),
    url,
  }))
}

/** Sheet sides in cm, short side first. */
export const latiCm: Record<Taglia, readonly [number, number]> = {
  A5: [14.8, 21],
  A6: [10.5, 14.8],
}

const cm = (n: number) => n.toFixed(1).replace('.', ',')

/** "A5 verticale". */
export const formatoDi = (q: Quaderno) => `${q.taglia} ${q.orientamento}`

/** Width × height in the brochure's notation: "14,8 × 21,0 cm". */
export function misureDi(q: Quaderno) {
  const [corto, lungo] = latiCm[q.taglia]
  const [largo, alto] = q.orientamento === 'verticale' ? [corto, lungo] : [lungo, corto]
  return `${cm(largo)} × ${cm(alto)} cm`
}

/**
 * The configurator with this notebook's choices made. The configurator is not
 * built yet: it will have to read these parameters, and to cope with an A5
 * orizzontale, which the brochure's own format list does not offer.
 */
export function componiSimile(q: Quaderno) {
  const scelte = new URLSearchParams({
    genere: q.genere,
    tipologia: q.tipologia,
    formato: `${q.taglia.toLowerCase()}-${q.orientamento}`,
  })
  return `/componi-il-tuo?${scelte}`
}
