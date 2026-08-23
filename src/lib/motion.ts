import type { Transition, Variants } from 'framer-motion'

export const EASE_OUT = [0.22, 0.61, 0.36, 1] as const

export const transition = {
  quick: { duration: 0.22, ease: EASE_OUT },
  base: { duration: 0.32, ease: EASE_OUT },
  slow: { duration: 0.4, ease: EASE_OUT },
} satisfies Record<string, Transition>

/** Fade + short lift, used for scroll reveals and page content. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transition.base },
}

export const riseStagger = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

/** Shared props for scroll-triggered reveals. */
export const whileInViewProps = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount: 0.25 },
} as const
