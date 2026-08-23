import { useId } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { EASE_OUT } from '@/lib/motion'

type Props = {
  words: readonly string[]
  /** Index of the word to underline with a drawn thread. */
  threadWord?: number
  className?: string
  startDelay?: number
}

const wordWrap: Variants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: { staggerChildren: 0.075, delayChildren: delay },
  }),
}

const wordInner: Variants = {
  hidden: { y: '108%', rotate: 2.5, opacity: 0 },
  visible: {
    y: '0%',
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
}

/**
 * Sets the headline a word at a time: each word rises out of a clipped baseline,
 * the way a line of type is composed rather than typed. The closing word is
 * underscored with a thread that draws itself once the line has settled.
 */
export function AnimatedHeadline({ words, threadWord, className = '', startDelay = 0.15 }: Props) {
  const reduced = useReducedMotion()
  const threadDelay = startDelay + words.length * 0.075 + 0.2

  /* The words are split across elements for the reveal, which leaves no whitespace
     for a screen reader to break on — so the line is announced from aria-label and
     the visual pieces are hidden from the accessibility tree. */
  const label = words.join(' ')

  if (reduced) {
    return (
      <h1 className={className} aria-label={label}>
        {words.map((w, i) => (
          <span key={`${w}-${i}`} aria-hidden="true" className="relative inline-block">
            {w}
            {i === threadWord && <ThreadUnderline draw={false} delay={0} />}
            {i < words.length - 1 && <span className="inline-block w-[0.26em]" />}
          </span>
        ))}
      </h1>
    )
  }

  return (
    <motion.h1
      className={className}
      aria-label={label}
      variants={wordWrap}
      initial="hidden"
      animate="visible"
      custom={startDelay}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          aria-hidden="true"
          className="relative inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span className="relative inline-block" variants={wordInner}>
            {w}
            {i === threadWord && <ThreadUnderline draw delay={threadDelay} />}
          </motion.span>
          {i < words.length - 1 && <span className="inline-block w-[0.26em]" />}
        </span>
      ))}
    </motion.h1>
  )
}

function ThreadUnderline({ draw, delay }: { draw: boolean; delay: number }) {
  const clipId = useId().replace(/:/g, '') + '-stitch'

  /* The stitch is revealed by wiping a clip across it rather than by animating
     pathLength — pathLength drives strokeDasharray internally, which would flatten
     the running stitch into a solid rule. */
  return (
    <svg
      viewBox="0 0 200 10"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      className="absolute inset-x-0 -bottom-[0.06em] h-[0.16em] w-full overflow-visible"
    >
      <defs>
        <clipPath id={clipId}>
          <motion.rect
            x={0}
            y={-6}
            height={22}
            initial={draw ? { width: 0 } : { width: 200 }}
            animate={{ width: 200 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay }}
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
