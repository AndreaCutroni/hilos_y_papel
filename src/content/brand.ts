/**
 * Brand copy and contact details transcribed from the Hilos y Papel brochure.
 * Wording is the founder’s own — keep edits to punctuation and line breaks.
 */

export const brand = {
  name: 'Hilos y Papel',
  founder: 'Chiara Castracane',
  tagline: 'Quaderni fatti a mano',
} as const

export const contact = {
  email: 'chiaracastracane@gmail.com',
  instagram: {
    handle: 'hilos_y_papel',
    url: 'https://www.instagram.com/hilos_y_papel/',
  },
  facebook: {
    handle: 'Hilos y Papel',
    url: 'https://www.facebook.com/people/Hilos-y-Papel/',
  },
} as const

export const hero = {
  eyebrow: 'Rilegatura artigianale · Roma',
  /** Split into words so the headline can be revealed a word at a time. */
  headline: ['Dietro', 'ogni', 'oggetto', 'c’è', 'un', 'tempo', 'da', 'rispettare.'],
  subhead:
    'A 16 anni ho imparato a cucire la carta, per le strade colorate dell’Argentina, e non ho più smesso. Ogni quaderno nasce da una scelta accurata tra fili, colori, carta e creatività.',
  primaryCta: { label: 'Componi il tuo quaderno', to: '/componi-il-tuo' },
  secondaryCta: { label: 'Guarda i quaderni', to: '/quaderni' },
} as const

export const story = {
  origin:
    'Hilos y Papel racchiude la storia di una passione nata per le strade colorate dell’Argentina, dove ho imparato l’arte della rilegatura a mano.',
  time: 'Un tempo di ideazione, di scelta e di realizzazione. Quando impariamo a rispettare questo tempo, comprendiamo il valore che si racchiude dietro ogni singolo oggetto.',
  invitation:
    'Se ti piacciono le cose semplici e autentiche o sei in cerca di un regalo originale, Hilos y Papel fa al caso tuo.',
  audience:
    'Una linea di quaderni fatti a mano per chi ama ancora scrivere con la penna, disegnare sulla carta e avere sempre a portata di mano un taccuino personalizzato.',
} as const

/** The three things that make a Hilos y Papel notebook what it is. */
export const pillars = [
  {
    title: 'Cucito a mano',
    body: 'Ogni blocco di fogli è piegato e cucito singolarmente. Nei quaderni rigidi la rilegatura resta a vista: il filo è parte della copertina, non un dettaglio da nascondere.',
  },
  {
    title: 'Carte scelte una a una',
    body: 'Carte fantasia lavorate a mano, alcune giapponesi, altre molto pregiate e in esaurimento. Interni in carta riciclata o bianca, a seconda di come vuoi scrivere.',
  },
  {
    title: 'Fatto per te',
    body: 'Dammi una foto, un tema o anche solo un colore: reinterpreto l’immagine e realizzo l’illustrazione che finirà sulla copertina. Puoi scegliere di inserire il nome.',
  },
] as const

export const navigation = [
  { label: 'Quaderni', to: '/quaderni' },
  { label: 'Tipologie', to: '/tipologie' },
  { label: 'Carte', to: '/carte' },
  { label: 'Componi il tuo', to: '/componi-il-tuo' },
  { label: 'Chi sono', to: '/chi-sono' },
] as const
