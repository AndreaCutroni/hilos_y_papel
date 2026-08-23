/**
 * Product structure transcribed from the Hilos y Papel brochure.
 * Feeds the configurator, catalogue and thesis-binding pages.
 */

export type Genere = 'fantasia' | 'personalizzato'
export type Tipologia = 'rigido' | 'flex'
export type Formato = 'a5-verticale' | 'a6-verticale' | 'a6-orizzontale'
export type Carta = 'riciclata' | 'bianca'

export const generi = [
  {
    id: 'fantasia' satisfies Genere,
    name: 'Fantasia',
    priceFrom: 15,
    priceTo: 40,
    description:
      'Copertina realizzata con carte e/o stoffe lavorate con motivi e fantasie di diverso genere. I colori sono svariati e combinabili tra loro.',
  },
  {
    id: 'personalizzato' satisfies Genere,
    name: 'Personalizzato',
    priceFrom: 25,
    priceTo: 60,
    description:
      'Copertina personalizzabile a piacimento. Puoi darmi una foto, un’idea o un tema e realizzerò il disegno illustrato da stampare sulla copertina. Puoi scegliere di inserire il nome.',
  },
] as const

export const tipologie = [
  {
    id: 'rigido' satisfies Tipologia,
    name: 'Rigido',
    traits: [
      'Copertina rigida',
      'Rilegatura a vista',
      'Adatto per occasioni speciali ma anche per appunti e schizzi di tutti i giorni',
    ],
  },
  {
    id: 'flex' satisfies Tipologia,
    name: 'Flex',
    traits: [
      'Flessibile, pieghevole, agevole, tascabile',
      'Rilegatura non a vista',
      'Comodo da portare in giro e mettere in borsa o in tasca',
    ],
  },
] as const

export const formati = [
  { id: 'a5-verticale' satisfies Formato, name: 'A5 verticale', size: '14,8 × 21,0 cm' },
  { id: 'a6-verticale' satisfies Formato, name: 'A6 verticale', size: '10,5 × 14,8 cm' },
  { id: 'a6-orizzontale' satisfies Formato, name: 'A6 orizzontale', size: '14,8 × 10,5 cm' },
] as const

export const carte = [
  {
    id: 'riciclata' satisfies Carta,
    name: 'Carta riciclata',
    note: 'Consigliata per l’ambiente e per la resa con le carte fantasia.',
    recommended: true,
  },
  {
    id: 'bianca' satisfies Carta,
    name: 'Carta bianca',
    note: null,
    recommended: false,
  },
] as const

/** Rarity marks used in the brochure’s fantasy-paper catalogue. */
export const carteFantasiaLegenda = [
  { mark: '*', meaning: 'in esaurimento' },
  { mark: '**', meaning: 'molto pregiate' },
  { mark: '***', meaning: 'carta giapponese' },
] as const

/** How a personalizzato cover gets designed. */
export const personalizzazione = {
  routes: [
    {
      from: 'Una foto',
      detail:
        'Reinterpreterò l’immagine e realizzerò un’illustrazione che verrà stampata sul fronte della copertina.',
    },
    {
      from: 'Un tema',
      detail:
        'Realizzerò un disegno inerente alla tematica indicata e lo stamperò sul fronte della copertina.',
    },
    {
      from: 'Un colore o due parole sulla persona',
      detail:
        'Con qualche informazione su chi riceverà il quaderno creo un disegno adatto per il fronte della copertina.',
    },
  ],
  examples: [
    { basis: 'da info sulla persona', value: 'è un architetto' },
    { basis: 'da colore', value: 'giallo' },
    { basis: 'da foto', value: 'insegnante di Pilates' },
  ],
  constraints: [
    'Si tratta di stampe su carta realizzate ad hoc: in questo caso le copertine possono essere solo rigide.',
    'I disegni seguono lo stile che vedi negli esempi.',
  ],
} as const

export type Esempio = {
  genere: Genere
  tipologia: Tipologia
  formato: string
  price: number
  label?: string
}

/** Real examples with the brochure’s own pricing. */
export const esempi: Esempio[] = [
  { genere: 'fantasia', tipologia: 'flex', formato: 'A6 verticale/orizzontale', price: 15 },
  { genere: 'fantasia', tipologia: 'flex', formato: 'A5 verticale', price: 20 },
  { genere: 'fantasia', tipologia: 'rigido', formato: 'A6 verticale', price: 25 },
  { genere: 'fantasia', tipologia: 'rigido', formato: 'A6 orizzontale', price: 25 },
  { genere: 'fantasia', tipologia: 'rigido', formato: 'A5 verticale', price: 35 },
  { genere: 'fantasia', tipologia: 'rigido', formato: 'A5 verticale', price: 40 },
  { genere: 'personalizzato', tipologia: 'rigido', formato: 'A6 verticale', price: 35 },
  { genere: 'personalizzato', tipologia: 'rigido', formato: 'A6 orizzontale', price: 35 },
  { genere: 'personalizzato', tipologia: 'rigido', formato: 'A5 verticale', price: 40 },
  {
    genere: 'fantasia',
    tipologia: 'flex',
    formato: 'A6 verticale',
    price: 38,
    label: 'Tris di quaderni',
  },
]

export const prezziNota =
  'In base al tipo di carta fantasia e alla personalizzazione, il prezzo può variare di pochi euro, a scendere o a salire rispetto a quello indicato negli esempi.'

/** Rilegatura Tesi — the separate thesis-binding service. */
export const rilegaturaTesi = {
  title: 'Rilegatura Tesi',
  intro: 'Rilega la tua tesi di laurea.',
  method:
    'La rilegatura a mano viene realizzata tramite la cucitura di singoli blocchi di fogli accorpati e piegati insieme.',
  fileSetup: [
    {
      title: 'Il formato va sempre raddoppiato',
      detail:
        'Se desideri una tesi in A4 dovrai fornire due pagine A4 affiancate inserite in un A3, in modo da permettere la piegatura e la cucitura.',
    },
    {
      title: 'Scritte solo a destra',
      detail:
        'Se le scritte dovranno apparire solo sulla pagina di destra, il file da fornire alla stampa avrà le scritte solo a destra e sarà stampato fronte-retro.',
    },
    {
      title: 'Scritte su entrambi i lati',
      detail:
        'Se le scritte dovranno apparire in ambo i lati, il file avrà le scritte in ambo le parti: bisogna però affiancare alla prima pagina di ogni decina la sua ultima.',
    },
  ],
  margins: [
    'Lasciare un margine laterale di almeno 1 cm per i fogli interni.',
    'Lasciare un margine di almeno 1,5 cm per la copertina.',
  ],
  threads:
    'Per la rilegatura si possono scegliere i colori dei fili che si preferiscono, anche in funzione della copertina, e il design a vista resta visibile sul dorso.',
} as const
