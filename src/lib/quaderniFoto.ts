import { quaderni, type Quaderno } from '@/content/quaderni'

/**
 * The notebook photos written by scripts/quaderni-webp.py, found by glob so a
 * new photo needs the script re-run and nothing else. Every photo exists 800px
 * and 1600px wide; only the URLs end up in the bundle.
 */
const piccole = import.meta.glob<string>('/src/assets/quaderni/*/*-800.webp', {
  eager: true,
  import: 'default',
})
const grandi = import.meta.glob<string>('/src/assets/quaderni/*/*-1600.webp', {
  eager: true,
  import: 'default',
})

export type Foto = {
  /** File name without the size suffix, e.g. "onde-rosse-02". */
  nome: string
  piccola: string
  grande: string
  /** Both widths, ready for `srcSet`. */
  srcSet: string
}

const perQuaderno = new Map<string, Foto[]>()
for (const [percorso, piccola] of Object.entries(piccole)) {
  const trovato = percorso.match(/\/quaderni\/([^/]+)\/(.+)-800\.webp$/)
  const grande = grandi[percorso.replace(/-800\.webp$/, '-1600.webp')]
  if (!trovato || !grande) continue
  const [, slug, nome] = trovato
  const foto = { nome, piccola, grande, srcSet: `${piccola} 800w, ${grande} 1600w` }
  perQuaderno.set(slug, [...(perQuaderno.get(slug) ?? []), foto])
}

/** A notebook's photos in file order, with its cover moved to the front. */
export function fotoDi(q: Quaderno): Foto[] {
  const tutte = [...(perQuaderno.get(q.slug) ?? [])].sort((a, b) => a.nome.localeCompare(b.nome))
  const i = tutte.findIndex((f) => f.nome === q.copertina)
  if (i > 0) tutte.unshift(...tutte.splice(i, 1))
  return tutte
}

// A renamed folder or cover photo would otherwise just leave an empty square.
if (import.meta.env.DEV) {
  for (const q of quaderni) {
    const tutte = perQuaderno.get(q.slug) ?? []
    if (!tutte.length)
      console.warn(`quaderni: nessuna foto per "${q.slug}" — rilancia scripts/quaderni-webp.py`)
    else if (!tutte.some((f) => f.nome === q.copertina))
      console.warn(`quaderni: la copertina "${q.copertina}" di "${q.slug}" non esiste`)
  }
}
