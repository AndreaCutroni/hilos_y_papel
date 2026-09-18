import { quaderni } from './quaderni'

/**
 * The papers on /carte, read straight from their folders like the notebooks:
 * no script, no generated file. Each src/assets/carte/<slug>/ holds
 *
 *   carta.json   { "nome": "Onde rosse",
 *                  "tipo": "giapponese" | "artigianale" | "stampata",
 *                  "ultimi fogli": true | false,
 *                  "quaderno": "onde-rosse", "ordine": 1 }
 *   one photo    the sheet, flat and straight on, any file name
 *
 * Under each paper the page writes its name, its type in words and, when it is
 * running out, the «Ultimi fogli» stamp; when "quaderno" names a notebook of
 * the catalogue, a notebook icon links to it as an example. The owner's guide,
 * in Italian, is src/assets/carte/LEGGIMI.md.
 */

export type TipoCarta = 'giapponese' | 'artigianale' | 'stampata'

/** What the page writes under a paper for each type. */
export const nomeTipo: Record<TipoCarta, string> = {
  giapponese: 'Carta giapponese',
  artigianale: 'Carta artigianale',
  stampata: 'Carta stampata',
}

export type CartaFantasia = {
  slug: string
  nome: string
  tipo: TipoCarta
  ultimiFogli: boolean
  /** The catalogue notebook made with this paper, when there is one. */
  quaderno: { slug: string; nome: string } | null
  foto: string
}

export type ProblemaCarta = { slug: string; messaggi: string[] }

const schede = import.meta.glob<unknown>('/src/assets/carte/*/carta.json', {
  eager: true,
  import: 'default',
})
const fotoTrovate = import.meta.glob<string>(
  '/src/assets/carte/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true, import: 'default' }
)

const TIPI: readonly string[] = ['giapponese', 'artigianale', 'stampata']

/** "onde-rosse", from a glob key. */
const cartellaDi = (percorso: string) => percorso.split('/').at(-2) ?? ''

/** "Onde rosse", from a folder name, for a sheet that gives no "nome". */
const daCartella = (slug: string) => {
  const parole = slug.replace(/-/g, ' ')
  return parole.charAt(0).toUpperCase() + parole.slice(1)
}

/** Each folder's photos, in file-name order. */
const fotoPerCartella = new Map<string, { file: string; url: string }[]>()
for (const [percorso, url] of Object.entries(fotoTrovate)) {
  const slug = cartellaDi(percorso)
  const file = percorso.split('/').at(-1) ?? ''
  fotoPerCartella.set(slug, [...(fotoPerCartella.get(slug) ?? []), { file, url }])
}
for (const foto of fotoPerCartella.values()) foto.sort((a, b) => a.file.localeCompare(b.file))

type Letta = { carta: CartaFantasia | null; ordine: number; messaggi: string[] }

/**
 * One folder read and checked. `carta` is null when something keeps it off the
 * site; `messaggi` says what, and also flags what is merely odd.
 */
function leggi(slug: string, scheda: unknown): Letta {
  const errori: string[] = []
  const avvisi: string[] = []
  const foto = fotoPerCartella.get(slug) ?? []
  if (!foto.length) errori.push('manca la foto della carta')
  else if (foto.length > 1)
    avvisi.push(`ci sono ${foto.length} foto: uso ${foto[0].file}, le altre non compaiono`)

  if (typeof scheda !== 'object' || scheda === null || Array.isArray(scheda))
    return {
      carta: null,
      ordine: Infinity,
      messaggi: ['carta.json deve contenere un oggetto { ... }', ...avvisi],
    }
  const s = scheda as Record<string, unknown>

  const nome = typeof s.nome === 'string' && s.nome.trim() ? s.nome.trim() : daCartella(slug)
  if (s.nome !== undefined && typeof s.nome !== 'string')
    errori.push('"nome" deve essere un testo tra virgolette')
  const tipo = typeof s.tipo === 'string' ? s.tipo.trim().toLowerCase() : ''
  if (!TIPI.includes(tipo))
    errori.push('"tipo" deve essere "giapponese", "artigianale" o "stampata"')
  const ultimi = s['ultimi fogli']
  if (ultimi !== undefined && typeof ultimi !== 'boolean')
    errori.push('"ultimi fogli" deve essere true o false')
  if (s.ordine !== undefined && typeof s.ordine !== 'number')
    errori.push('"ordine" deve essere un numero')

  /* a notebook that is not in the catalogue only loses the icon */
  let quaderno: CartaFantasia['quaderno'] = null
  const voluto = s.quaderno
  if (typeof voluto === 'string' && voluto.trim()) {
    const q = quaderni.find((x) => x.slug === voluto.trim())
    if (q) quaderno = { slug: q.slug, nome: q.nome }
    else avvisi.push(`"quaderno": nel catalogo non c’è un quaderno "${voluto}", niente icona`)
  } else if (voluto !== undefined && typeof voluto !== 'string')
    errori.push('"quaderno" deve essere il nome della cartella di un quaderno, tra virgolette')

  const messaggi = [...errori, ...avvisi]
  if (errori.length) return { carta: null, ordine: Infinity, messaggi }
  return {
    ordine: typeof s.ordine === 'number' ? s.ordine : Infinity,
    messaggi,
    carta: {
      slug,
      nome,
      tipo: tipo as TipoCarta,
      ultimiFogli: ultimi === true,
      quaderno,
      foto: foto[0].url,
    },
  }
}

const lette: Letta[] = []
const problemi: ProblemaCarta[] = []
for (const [percorso, scheda] of Object.entries(schede)) {
  const slug = cartellaDi(percorso)
  const letta = leggi(slug, scheda)
  if (letta.messaggi.length) problemi.push({ slug, messaggi: letta.messaggi })
  lette.push(letta)
}
const conScheda = new Set(Object.keys(schede).map(cartellaDi))
for (const slug of fotoPerCartella.keys())
  if (!conScheda.has(slug))
    problemi.push({ slug, messaggi: ['manca carta.json: senza, la carta non compare sul sito'] })

/** The papers in page order: by `ordine`, then by folder name. */
export const carteFantasia: CartaFantasia[] = lette
  .filter((l): l is Letta & { carta: CartaFantasia } => l.carta !== null)
  .sort((a, b) => a.ordine - b.ordine || a.carta.slug.localeCompare(b.carta.slug))
  .map((l) => l.carta)

/** Folders kept off the site, or with something odd in them, and why. */
export const problemiCarte: ProblemaCarta[] = problemi.sort((a, b) => a.slug.localeCompare(b.slug))
