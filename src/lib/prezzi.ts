import listino from '@/content/listinoPrezzi.json'
import type { Genere, Tipologia } from '@/content/products'

type FasciaPrezzo = { minimo: number; massimo: number }
type SceltePrezzo = { genere?: Genere; tipologia?: Tipologia; formato?: string }

/** Accept both a fixed price ("25") and a range ("25-35") from the price list. */
export function leggiPrezzo(valore: string | number): FasciaPrezzo {
  const parti = String(valore)
    .trim()
    .match(/^(\d+(?:[.,]\d{1,2})?)(?:\s*[-–]\s*(\d+(?:[.,]\d{1,2})?))?$/)
  if (!parti) throw new Error(`Prezzo non valido nel listino: ${valore}`)

  const minimo = Number(parti[1].replace(',', '.'))
  const massimo = parti[2] ? Number(parti[2].replace(',', '.')) : minimo
  if (!Number.isFinite(minimo) || !Number.isFinite(massimo) || massimo < minimo)
    throw new Error(`Intervallo di prezzo non valido nel listino: ${valore}`)
  return { minimo, massimo }
}

const normalizzaFormato = (formato: string) => formato.trim().toLowerCase().replace(/\s+/g, ' ')
const prezzi = listino.map((voce) => ({
  ...voce,
  formato: normalizzaFormato(voce.formato),
  ...leggiPrezzo(voce.prezzo),
}))

/** Include every row still compatible with the choices, without pricing missing combinations. */
export function fasciaPrezzo(scelte: SceltePrezzo): FasciaPrezzo | null {
  const compatibili = prezzi.filter(
    (voce) =>
      (!scelte.genere || voce.genere === scelte.genere) &&
      (!scelte.tipologia || voce.tipologia === scelte.tipologia) &&
      (!scelte.formato || voce.formato === normalizzaFormato(scelte.formato))
  )
  if (!compatibili.length) return null
  return {
    minimo: Math.min(...compatibili.map((voce) => voce.minimo)),
    massimo: Math.max(...compatibili.map((voce) => voce.massimo)),
  }
}

const numero = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 })

export function formattaPrezzo(fascia: FasciaPrezzo | null): string {
  if (!fascia) return 'Prezzo da concordare'
  const minimo = numero.format(fascia.minimo)
  return fascia.minimo === fascia.massimo
    ? `${minimo} €`
    : `${minimo}–${numero.format(fascia.massimo)} €`
}
