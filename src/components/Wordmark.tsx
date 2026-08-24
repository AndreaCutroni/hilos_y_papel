type Props = {
  className?: string
  /** Colour of the italic "y". Defaults to the sand tint, for use on brick. */
  accentColor?: string
}

/**
 * "Hilos y Papel" set in Amiri: the two nouns in bold upright, the conjunction
 * in italic so it reads as a swash linking them — the relationship the brochure
 * wordmark draws between "threads" and "paper".
 */
export function Wordmark({ className = '', accentColor }: Props) {
  return (
    <span className={`font-wordmark font-bold tracking-tight ${className}`}>
      Hilos{' '}
      <span
        className="font-normal italic tracking-normal"
        style={{ color: accentColor ?? 'var(--color-paper)' }}
      >
        y
      </span>{' '}
      Papel
    </span>
  )
}

/** The founder's name, set in the wordmark's italic to sit under it. */
export function FounderName({ className = '' }: { className?: string }) {
  return <span className={`font-wordmark italic ${className}`}>Chiara Castracane</span>
}
