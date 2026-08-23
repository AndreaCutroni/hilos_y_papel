type Props = {
  className?: string
  /** Colour of the swash "y". Defaults to the accent tint for dark surfaces. */
  accentColor?: string
}

/**
 * "Hilos y Papel" set as in the brochure: bold italic serif with the conjunction
 * carried by a lighter, wider-tracked italic so it reads as a swash between the
 * two nouns.
 */
export function Wordmark({ className = '', accentColor }: Props) {
  return (
    <span className={`font-display font-bold italic tracking-tight ${className}`}>
      Hilos{' '}
      <span
        className="font-normal tracking-normal"
        style={{ color: accentColor ?? 'var(--color-accent-on-dark)' }}
      >
        y
      </span>{' '}
      Papel
    </span>
  )
}
