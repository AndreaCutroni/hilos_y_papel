/**
 * The nine plates of the "Chi sono" sketchbook.
 *
 * Every caption is drawn from the brochure: Chiara's own account of learning to
 * bind in Argentina, the philosophy of respecting the time behind an object, and
 * the steps of the craft as the brochure describes them. Nothing here is
 * invented about the process — where the brochure is silent, the plate stays
 * descriptive rather than inventing detail.
 */

export type Plate = {
  /** Stable id, also the sketch component key. */
  id: string
  /** Roman numeral shown as the plate mark. */
  mark: string
  title: string
  /** Short editorial standfirst, set in the display face. */
  lede: string
  /** Body copy — two short paragraphs at most, this is a caption not an essay. */
  body: string[]
  /** Index label — terser than the title. */
  index: string
}

export const plates: Plate[] = [
  {
    id: 'argentina',
    mark: 'I',
    title: 'Le strade colorate',
    lede: 'Dove tutto è cominciato.',
    body: [
      'Hilos y Papel racchiude la storia di una passione nata per le strade colorate dell’Argentina, dove ho imparato l’arte della rilegatura a mano.',
      'Da lì viene anche il nome: fili e carta, le due sole cose che servono davvero.',
    ],
    index: 'Argentina',
  },
  {
    id: 'sedici',
    mark: 'II',
    title: 'A sedici anni',
    lede: 'Ho imparato a cucire la carta e non ho più smesso.',
    body: [
      'Il primo gesto è sempre lo stesso: un ago, un filo, una piega. Da allora ogni quaderno passa dalle mie mani una pagina alla volta.',
    ],
    index: 'A sedici anni',
  },
  {
    id: 'tempo',
    mark: 'III',
    title: 'Un tempo da rispettare',
    lede: 'Ideazione, scelta, realizzazione.',
    body: [
      'Ho capito che dietro ogni oggetto c’è un tempo da rispettare: un tempo di ideazione, di scelta e di realizzazione.',
      'Quando impariamo a rispettare questo tempo, comprendiamo il valore che si racchiude dietro ogni singolo oggetto.',
    ],
    index: 'Il tempo',
  },
  {
    id: 'piega',
    mark: 'IV',
    title: 'La piega',
    lede: 'Fogli accorpati e piegati insieme.',
    body: [
      'I fogli si raccolgono in piccoli blocchi e si piegano a metà. Ogni blocco diventa un fascicolo, e i fascicoli in fila diventano il corpo del quaderno.',
    ],
    index: 'La piega',
  },
  {
    id: 'foratura',
    mark: 'V',
    title: 'I punti di cucitura',
    lede: 'Prima del filo viene il foro.',
    body: [
      'Ogni fascicolo va forato sulla piega, negli stessi punti e alla stessa distanza. È il passaggio che decide se il dorso resterà dritto.',
    ],
    index: 'La foratura',
  },
  {
    id: 'copta',
    mark: 'VI',
    title: 'La cucitura copta',
    lede: 'Il filo è parte della copertina.',
    body: [
      'Nei quaderni rigidi la rilegatura resta a vista: il filo incrocia i fascicoli sul dorso e il disegno della cucitura si vede tutto.',
      'I colori dei fili si scelgono anche in funzione della copertina.',
    ],
    index: 'Cucitura copta',
  },
  {
    id: 'carte',
    mark: 'VII',
    title: 'Le carte',
    lede: 'Scelte una a una.',
    body: [
      'Carte fantasia lavorate a mano, alcune giapponesi, altre molto pregiate e ormai in esaurimento. I colori sono svariati e combinabili tra loro.',
      'Per gli interni consiglio la carta riciclata, per l’ambiente e per la resa con le carte fantasia.',
    ],
    index: 'Le carte',
  },
  {
    id: 'copertina',
    mark: 'VIII',
    title: 'Fantasia o su misura',
    lede: 'Due modi di arrivare alla copertina.',
    body: [
      'La copertina Fantasia nasce da carte e stoffe lavorate con motivi di diverso genere. Quella Personalizzata nasce da te: una foto, un tema, anche solo un colore.',
      'Reinterpreto l’immagine e realizzo l’illustrazione che verrà stampata sul fronte.',
    ],
    index: 'La copertina',
  },
  {
    id: 'tesi',
    mark: 'IX',
    title: 'Rilegare una tesi',
    lede: 'Lo stesso gesto, su misura più grande.',
    body: [
      'La tesi si rilega a mano con la stessa cucitura a blocchi: per questo il file va impaginato al doppio del formato, così i fogli si possono piegare e cucire.',
      'Per qualsiasi dubbio o informazione, scrivimi.',
    ],
    index: 'La tesi',
  },
]

export const sketchbookIntro = {
  eyebrow: 'Chi sono',
  title: 'Chiara Castracane',
  lede: 'Se ami la sensazione della carta sotto le dita e la magia del fatto a mano, sei nel posto giusto.',
  body: 'Ogni quaderno che creo è frutto di una scelta accurata tra fili, colori, carta e creatività, pensato per chi apprezza le cose sincere e ricerca l’autenticità in ogni pagina.',
  photoAlt:
    'Chiara Castracane sorride tenendo in mano un quaderno rilegato a mano con copertina chiara.',
} as const

export const sketchbookHint = 'Trascina la pagina per voltarla · trascina la lente per ingrandire'
