import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { EASE_OUT } from '@/lib/motion'

type Props = {
  className?: string
  /** Number of sewing stations down the seam. */
  rows?: number
  color?: string
  delay?: number
  /** Draw the folded signature edges the thread passes through. Turn off when the
   *  seam overlays a photograph, where the lines read as artefacts. */
  showSignatures?: boolean
}

const PITCH = 22
const LEFT = 7
const RIGHT = 29

/**
 * The exposed Coptic binding used on the rigid notebooks: thread crosses back and
 * forth between two columns of sewing stations, so each pair of signatures is
 * linked by an X and the spine reads as a chain. Geometry traced from the real
 * bindings photographed in the brochure.
 */
export function CopticSeam({
  className = '',
  rows = 9,
  color,
  delay = 0,
  showSignatures = true,
}: Props) {
  const reduced = useReducedMotion()
  const stroke = color ?? 'var(--color-thread-maroon)'
  const height = PITCH * rows + 16
  const stations = Array.from({ length: rows }, (_, i) => 8 + i * PITCH)

  const crossings = stations.slice(0, -1).flatMap((y, i) => {
    const next = stations[i + 1]
    return [
      { d: `M ${LEFT} ${y} L ${RIGHT} ${next}`, key: `a${i}` },
      { d: `M ${RIGHT} ${y} L ${LEFT} ${next}`, key: `b${i}` },
    ]
  })

  return (
    <svg
      viewBox={`0 0 36 ${height}`}
      fill="none"
      className={className}
      style={{ height: '100%', width: 'auto' }}
      aria-hidden="true"
    >
      {/* edges of the folded signatures the thread is sewn through */}
      {showSignatures &&
        stations.map((y) => (
          <line
            key={`sig${y}`}
            x1={0}
            y1={y}
            x2={36}
            y2={y}
            stroke="var(--color-ink)"
            strokeWidth={0.6}
            opacity={0.22}
          />
        ))}

      {crossings.map((c, i) => (
        <motion.path
          key={c.key}
          d={c.d}
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          whileInView={reduced ? undefined : { pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.3, ease: EASE_OUT, delay: delay + i * 0.035 }}
        />
      ))}

      {/* the thread surfacing at each station */}
      {stations.map((y) => (
        <g key={`k${y}`}>
          <circle cx={LEFT} cy={y} r={2} fill={stroke} />
          <circle cx={RIGHT} cy={y} r={2} fill={stroke} />
        </g>
      ))}
    </svg>
  )
}
