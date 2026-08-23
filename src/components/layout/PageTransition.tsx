import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { EASE_OUT } from '@/lib/motion'

export function PageTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()

  return (
    <motion.main
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={reduced ? { duration: 0.01 } : { duration: 0.28, ease: EASE_OUT }}
    >
      {children}
    </motion.main>
  )
}
