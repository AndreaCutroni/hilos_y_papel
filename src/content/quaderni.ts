import type { Genere, Tipologia } from './products'

/**
 * The notebooks on /quaderni, in catalogue order.
 *
 * One entry per folder under references/images/quaderni; scripts/quaderni-webp.py
 * turns each folder's photos into src/assets/quaderni/<slug>/. Cover type,
 * format and genre are the owner's own answers — never guess them from a photo.
 * A personalizzato cover is always rigido: the brochure only prints the
 * illustrated covers on board.
 */

export type Taglia = 'A5' | 'A6'
export type Orientamento = 'verticale' | 'orizzontale'

export type Quaderno = {
  /** Folder name and URL: /quaderni/<slug>. */
  slug: string
  nome: string
  tipologia: Tipologia
  taglia: Taglia
  orientamento: Orientamento
  genere: Genere
  /** The photo shown in the grid and first in the gallery: file name, no size suffix. */
  copertina: string
  /** `object-position` for the square crop in the grid, when the centre misses the notebook. */
  taglio?: string
}

export const quaderni: Quaderno[] = [
  {
    slug: 'onde-rosse',
    nome: 'Onde rosse',
    tipologia: 'rigido',
    taglia: 'A5',
    orientamento: 'verticale',
    genere: 'fantasia',
    copertina: 'onde-rosse-04',
  },
  {
    slug: 'corea',
    nome: 'Corea',
    tipologia: 'rigido',
    taglia: 'A5',
    orientamento: 'verticale',
    genere: 'personalizzato',
    copertina: 'erika-porta-01',
  },
  {
    slug: 'crisantemi-blu',
    nome: 'Crisantemi blu',
    tipologia: 'flex',
    taglia: 'A6',
    orientamento: 'verticale',
    genere: 'fantasia',
    copertina: 'crisantemi-blu-01',
  },
  {
    slug: 'fiori-verde',
    nome: 'Fiori verde',
    tipologia: 'rigido',
    taglia: 'A5',
    orientamento: 'orizzontale',
    genere: 'fantasia',
    copertina: 'fiori-verde-01',
  },
  {
    slug: 'giappone',
    nome: 'Giappone',
    tipologia: 'rigido',
    taglia: 'A5',
    orientamento: 'verticale',
    genere: 'personalizzato',
    copertina: 'daniel-torii-02',
  },
  {
    slug: 'marmorizzato-blu',
    nome: 'Marmorizzato blu',
    tipologia: 'rigido',
    taglia: 'A5',
    orientamento: 'verticale',
    genere: 'fantasia',
    copertina: 'marmorizzato-blu-04',
  },
  {
    slug: 'griglia-rossa',
    nome: 'Griglia rossa',
    tipologia: 'flex',
    taglia: 'A5',
    orientamento: 'verticale',
    genere: 'fantasia',
    copertina: 'griglia-rossa-01',
    taglio: '0% 50%',
  },
  {
    slug: 'lepre',
    nome: 'Lepre',
    tipologia: 'rigido',
    taglia: 'A5',
    orientamento: 'orizzontale',
    genere: 'fantasia',
    copertina: 'lepre-02',
  },
  {
    slug: 'monica',
    nome: 'Monica',
    tipologia: 'rigido',
    taglia: 'A5',
    orientamento: 'verticale',
    genere: 'fantasia',
    copertina: 'monica-09',
  },
  {
    slug: 'elefantini',
    nome: 'Elefantini',
    tipologia: 'rigido',
    taglia: 'A6',
    orientamento: 'verticale',
    genere: 'fantasia',
    copertina: 'archi-01',
  },
  {
    slug: 'foglie-bordeaux',
    nome: 'Foglie bordeaux',
    tipologia: 'flex',
    taglia: 'A6',
    orientamento: 'verticale',
    genere: 'fantasia',
    copertina: 'foglie-bordeaux-03',
  },
  {
    slug: 'luna-dorata',
    nome: 'Luna dorata',
    tipologia: 'rigido',
    taglia: 'A5',
    orientamento: 'verticale',
    genere: 'personalizzato',
    copertina: 'luna-dorata-03',
  },
  {
    slug: 'carta-artigianale-rosa',
    nome: 'Carta artigianale rosa',
    tipologia: 'rigido',
    taglia: 'A5',
    orientamento: 'verticale',
    genere: 'fantasia',
    copertina: 'carta-artigianale-rosa-02',
  },
  {
    slug: 'blu',
    nome: 'Blu',
    tipologia: 'flex',
    taglia: 'A6',
    orientamento: 'verticale',
    genere: 'fantasia',
    copertina: 'blu-01',
    taglio: '40% 50%',
  },
  {
    slug: 'illustrato-grigio',
    nome: 'Illustrato grigio',
    tipologia: 'rigido',
    taglia: 'A5',
    orientamento: 'verticale',
    genere: 'fantasia',
    copertina: 'illustrato-grigio-01',
  },
]

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
