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

/** Plate id to its drawing. Kept beside the only consumer so `plates.tsx`
 *  exports nothing but components and fast refresh keeps working. */
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

type Side = 'left' | 'right'

/**
 * One leaf of the sketchbook. The verso carries the drawing, the recto the
 * note — the way a plate book pairs an image with its caption.
 *
 * Rendered flat when the book is at rest, and again inside each strip of the
 * turning leaf, so it must lay out purely from its own box with no dependence
 * on where it sits.
 */
export function SketchPage({ plate, side }: { plate: Plate; side: Side }) {
  const Sketch = sketches[plate.id]

  if (side === 'left') {
    return (
      <div className="flex h-full w-full flex-col justify-between px-[7%] py-[8%]">
        <span className="font-display text-[clamp(0.7rem,1.5cqw,0.95rem)] tracking-[0.3em] text-ink-soft">
          {plate.mark}
        </span>
        {/* The drawing is landscape and the plate is portrait, so it spans the
            full measure and the leftover height reads as the plate's margin. */}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          {Sketch && <Sketch className="block h-auto w-full" />}
        </div>
        <span className="text-[clamp(0.6rem,1.2cqw,0.75rem)] tracking-[0.18em] text-ink-soft uppercase">
          Hilos y Papel
        </span>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col justify-center px-[9%] py-[8%]">
      <h3 className="font-display text-[clamp(1.1rem,3.4cqw,2rem)] leading-[1.1] font-semibold text-ink">
        {plate.title}
      </h3>
      <p className="mt-[3%] font-display text-[clamp(0.8rem,1.9cqw,1.1rem)] italic text-brick">
        {plate.lede}
      </p>
      <div className="mt-[6%] space-y-[3%]">
        {plate.body.map((para) => (
          <p
            key={para.slice(0, 24)}
            className="text-[clamp(0.7rem,1.55cqw,0.95rem)] leading-[1.6] text-ink-soft"
          >
            {para}
          </p>
        ))}
      </div>
    </div>
  )
}
