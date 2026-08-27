import { useId } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { handwritingTiming } from '@/lib/handwriting'

type Props = {
  words: readonly string[]
  /** Index of the word to underline with a drawn thread. */
  threadWord?: number
  className?: string
  startDelay?: number
}

/** A hand does not write on a perfectly level baseline. Deterministic, so the
 *  line looks the same on every render rather than jittering on re-mount. */
const tilt = (i: number) => [-0.55, 0.4, -0.25, 0.6, -0.4, 0.3][i % 6]

/**
 * Writes the hero line on, a word at a time, by wiping a clip from left to
 * right across each word — the way a nib lays ink down. Each word takes time in
 * proportion to its length, so the line paces itself like a hand rather than
 * ticking along on a fixed stagger.
 */
export function AnimatedHeadline({ words, threadWord, className = '', startDelay = 0.3 }: Props) {
  const reduced = useReducedMotion()
  const { starts, durations, settled } = handwritingTiming(words, startDelay)
  const label = words.join(' ')

  return (
    <h1 className={`font-hand ${className}`} aria-label={label}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true" className="relative inline-block align-baseline">
          <motion.span
            className="relative inline-block"
            style={{ rotate: reduced ? 0 : tilt(i) }}
            initial={reduced ? false : { clipPath: 'inset(-18% 100% -18% -4%)' }}
            animate={{ clipPath: 'inset(-18% -4% -18% -4%)' }}
            transition={
              reduced
                ? { duration: 0.01 }
                : { duration: durations[i], delay: starts[i], ease: 'linear' }
            }
          >
            {w}
            {i === threadWord && <ThreadUnderline draw={!reduced} delay={settled + 0.12} />}
          </motion.span>
          {i < words.length - 1 && <span className="inline-block w-[0.28em]" />}
        </span>
      ))}
    </h1>
  )
}

function ThreadUnderline({ draw, delay }: { draw: boolean; delay: number }) {
  const clipId = useId().replace(/:/g, '') + '-stitch'

  /* Revealed by a clip wipe rather than framer's pathLength, which drives
     strokeDasharray internally and would flatten the running stitch. */
  return (
    <svg
      viewBox="0 0 200 10"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      className="absolute inset-x-0 -bottom-[0.02em] h-[0.14em] w-full overflow-visible"
    >
      <defs>
        <clipPath id={clipId}>
          <motion.rect
            x={0}
            y={-6}
            height={22}
            initial={draw ? { width: 0 } : { width: 200 }}
            animate={{ width: 200 }}
            transition={{ duration: 0.55, ease: 'linear', delay }}
          />
        </clipPath>
      </defs>
      <path
        d="M 2 5 C 40 1.5, 80 8.5, 118 4.5 S 176 2, 198 5"
        stroke="var(--color-accent)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray="26 13"
        vectorEffect="non-scaling-stroke"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  )
}
