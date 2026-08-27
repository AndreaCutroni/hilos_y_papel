type Props = {
  className?: string
}

/**
 * "Hilos y Papel" set in Amiri italic throughout, the two nouns bold and the
 * conjunction light so it reads as a swash between them. Inherits
 * `currentColor` — the caller decides the colour, and it is one colour.
 */
export function Wordmark({ className = '' }: Props) {
  return (
    <span className={`font-wordmark font-bold italic tracking-tight ${className}`}>
      Hilos <span className="font-normal tracking-normal">y</span> Papel
    </span>
  )
}

/** The founder's name, in the wordmark's italic. */
export function FounderName({ className = '' }: { className?: string }) {
  return <span className={`font-wordmark italic ${className}`}>Chiara Castracane</span>
}

/**
 * The full lockup: the wordmark over the founder's name, optionally with the
 * line of business under both.
 *
 * "Chiara Castracane" is sized so it renders to **the same width** as "Hilos y
 * Papel" above it. That ratio is tuned to these exact strings in Amiri —
 * **re-measure if the wording or the typeface changes**, since nothing enforces
 * the alignment at runtime.
 *
 * Scale the whole block by setting `font-size` on it; every line is in `em`.
 */
export function BrandLockup({ className = '', tagline = false }: Props & { tagline?: boolean }) {
  return (
    <span className={`font-wordmark flex flex-col items-start leading-[1.06] ${className}`}>
      <span className="font-bold italic tracking-tight">
        Hilos <span className="font-normal tracking-normal">y</span> Papel
      </span>
      <span className="italic" style={{ fontSize: '0.710em' }}>
        Chiara Castracane
      </span>
      {tagline && (
        <span className="font-sans opacity-80" style={{ fontSize: '0.505em' }}>
          Quaderni fatti a mano
        </span>
      )}
    </span>
  )
}
