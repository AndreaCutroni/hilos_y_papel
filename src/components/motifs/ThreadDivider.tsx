import { motion } from 'framer-motion'
import { useId } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { EASE_OUT } from '@/lib/motion'

type Props = {
  className?: string
  /** Thread colour. Defaults to the maroon linen thread used on the real bindings. */
  color?: string
  /** Sew the thread on as the divider scrolls into view. */
  animate?: boolean
}

const HOLES = [40, 130, 220, 310, 400, 490, 580, 670, 760]

/**
 * A running stitch: thread lies on the surface for a span, dips through a hole,
 * and runs underneath before surfacing again — so the visible line is dashed and
 * pierced at intervals. Mirrors the sewing on the real books.
 */
export function ThreadDivider({ className = '', color, animate = true }: Props) {
  const reduced = useReducedMotion()
  const clipId = useId().replace(/:/g, '') + '-stitch'
  const stroke = color ?? 'var(--color-thread-maroon)'
  const draw = animate && !reduced

  return (
    <div className={`w-full ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 16" fill="none" preserveAspectRatio="none" className="h-4 w-full">
        <defs>
          <clipPath id={clipId}>
            {/* Wiping a clip preserves the dash pattern; animating pathLength would
                overwrite strokeDasharray and draw a solid rule instead. */}
            <motion.rect
              x={0}
              y={0}
              height={16}
              initial={draw ? { width: 0 } : { width: 800 }}
              whileInView={{ width: 800 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            />
          </clipPath>
        </defs>

        {HOLES.map((x) => (
          <ellipse key={x} cx={x} cy={8} rx={1.6} ry={2.2} fill="var(--color-ink)" opacity={0.28} />
        ))}

        <path
          d="M 40 8 H 795"
          stroke={stroke}
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeDasharray="62 28"
          clipPath={`url(#${clipId})`}
        />
      </svg>
    </div>
  )
}
