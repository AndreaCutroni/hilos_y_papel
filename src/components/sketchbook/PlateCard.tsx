import type { Plate } from '@/content/sketchbook'
import {
  PlateArgentina,
  PlateCarte,
  PlateCopertina,
  PlateCopta,
  PlateForatura,
  PlatePiega,
  PlateSedici,
  PlateTempo,
  PlateTesi,
} from './plates'

const sketches: Record<string, (p: { className?: string }) => React.JSX.Element> = {
  argentina: PlateArgentina,
  sedici: PlateSedici,
  tempo: PlateTempo,
  piega: PlatePiega,
  foratura: PlateForatura,
  copta: PlateCopta,
  carte: PlateCarte,
  copertina: PlateCopertina,
  tesi: PlateTesi,
}

/**
 * The narrow-screen reading of a plate: drawing over note, in one column.
 *
 * A two-page spread with a dragged page turn is a large-pointer affordance — at
 * phone width the same layout leaves the caption unreadable — so below `md` the
 * plate is presented stacked and paged with the buttons instead.
 */
export function PlateCard({ plate }: { plate: Plate }) {
  const Sketch = sketches[plate.id]
  return (
    <article className="rounded-[3px] bg-paper-lift px-6 py-8 shadow-[0_1px_0_rgba(46,26,24,0.18)]">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-label tracking-[0.3em] text-ink-soft">{plate.mark}</span>
        <span className="text-micro tracking-[0.18em] text-ink-soft uppercase">Hilos y Papel</span>
      </div>

      <div className="mt-6 flex justify-center">
        {Sketch && <Sketch className="block h-auto w-full" />}
      </div>

      <h3 className="mt-8 font-display text-h4 leading-[1.15] font-semibold text-ink">
        {plate.title}
      </h3>
      <p className="mt-2 font-display text-body-lg italic text-brick">{plate.lede}</p>
      <div className="mt-4 space-y-3">
        {plate.body.map((para) => (
          <p key={para.slice(0, 24)} className="text-body text-ink-soft">
            {para}
          </p>
        ))}
      </div>
    </article>
  )
}
