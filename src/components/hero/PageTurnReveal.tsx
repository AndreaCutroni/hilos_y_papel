import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { CopticSeam } from '@/components/motifs/CopticSeam'

type Props = {
  children: ReactNode
  delay?: number
  className?: string
}

/* A page turn carries weight, so it runs longer than the 200-400ms used elsewhere
   on the site. Anything shorter reads as a slide rather than paper moving. */
const TURN_DURATION = 0.85

export function PageTurnReveal({ children, delay = 0.4, className = '' }: Props) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`relative ${className}`} style={{ perspective: 1800 }}>
      {children}

      {/* Shadow the closed cover casts on the page beneath, sweeping off as it opens. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[3px]"
        style={{
          background:
            'linear-gradient(100deg, rgba(42,22,20,0.5) 0%, rgba(42,22,20,0.22) 45%, rgba(42,22,20,0) 78%)',
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: TURN_DURATION * 0.8, ease: 'easeOut', delay: delay + 0.1 }}
      />

      {/* The cover itself, hinged on the spine at the left edge. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: -168 }}
        transition={{ duration: TURN_DURATION, ease: [0.32, 0.24, 0.16, 1], delay }}
      >
        {/* outer face */}
        <div
          className="paper-grain absolute inset-0 overflow-hidden rounded-[3px] bg-paper-deep"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-y-0 left-0 w-9 py-3">
            <CopticSeam rows={11} delay={0} />
          </div>
          {/* light catching the curl */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.5) 72%, rgba(42,22,20,0.12) 100%)',
            }}
          />
        </div>

        {/* inner face, seen once the cover passes the upright */}
        <div
          className="paper-grain absolute inset-0 rounded-[3px] bg-paper"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(255deg, rgba(42,22,20,0.16) 0%, rgba(42,22,20,0) 38%)',
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}
