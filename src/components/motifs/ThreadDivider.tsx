import { motion } from 'framer-motion'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { EASE_OUT } from '@/lib/motion'

type Props = {
  className?: string
  /** Thread colour. Defaults to the maroon linen thread used on the real bindings. */
  color?: string
  /** Sew the thread on as the divider scrolls into view. */
  animate?: boolean
}

const STITCH_COUNT = 5

/**
 * Raised lengths of linen thread enter paired holes in the paper. The hidden
 * spans run underneath. Five stitches share the available width; only their
 * length changes, while the thread thickness, fibres and holes stay readable.
 */
export function ThreadDivider({ className = '', color, animate = true }: Props) {
  const reduced = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(1120)
  const id = useId().replace(/:/g, '')
  const clipId = `${id}-reveal`
  const patternId = `${id}-stitch`
  const fibreId = `${id}-fibre`
  const threadMaskId = `${id}-thread`
  const stroke = color ?? 'var(--color-thread-maroon)'
  const draw = animate && !reduced
  const pitch = width / STITCH_COUNT
  const start = pitch * 0.18
  const end = pitch * 0.82
  const controlStart = start + (end - start) * 0.2
  const controlEnd = end - (end - start) * 0.2
  const stitch = `M ${start} 17 C ${controlStart} 15, ${controlEnd} 15, ${end} 17`

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    setWidth(svg.getBoundingClientRect().width)
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width)
    })
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={`w-full ${className}`} aria-hidden="true">
      <svg ref={svgRef} fill="none" className="h-8 w-full">
        <defs>
          <pattern
            id={fibreId}
            width={5}
            height={5}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <path d="M 0 0 V 5" stroke="var(--color-paper-lift)" strokeOpacity={0.2} />
            <path
              d="M 1.5 0 V 5"
              stroke="var(--color-ink)"
              strokeOpacity={0.14}
              strokeWidth={0.6}
            />
          </pattern>
          <mask id={threadMaskId} maskUnits="userSpaceOnUse" x={0} y={0} width={pitch} height={32}>
            <path d={stitch} stroke="white" strokeWidth={3.4} strokeLinecap="round" />
          </mask>
          <pattern id={patternId} width={pitch} height={32} patternUnits="userSpaceOnUse">
            {/* A paper rim and a dark centre make both entry and exit holes visible. */}
            {[start, end].map((x) => (
              <g key={x}>
                <ellipse
                  cx={x}
                  cy={17.5}
                  rx={4.2}
                  ry={3.8}
                  fill="var(--color-ink)"
                  opacity={0.08}
                />
                <ellipse
                  cx={x}
                  cy={17}
                  rx={3}
                  ry={3.2}
                  fill="var(--color-paper-lift)"
                  stroke="var(--color-ink)"
                  strokeOpacity={0.22}
                  strokeWidth={0.7}
                />
                <ellipse cx={x} cy={17} rx={1.9} ry={2.3} fill="var(--color-ink)" opacity={0.72} />
              </g>
            ))}

            {/* Twisted fibres, a contact shadow and a fine highlight give the linen volume. */}
            <path
              d={stitch}
              transform="translate(0 0.9)"
              stroke="var(--color-ink)"
              strokeOpacity={0.12}
              strokeWidth={4.5}
              strokeLinecap="round"
            />
            <path d={stitch} stroke={stroke} strokeWidth={3.8} strokeLinecap="round" />
            <rect
              width={pitch}
              height={32}
              fill={`url(#${fibreId})`}
              mask={`url(#${threadMaskId})`}
            />
            <path
              d={`M ${start + 1} 16.5 C ${controlStart} 14.5, ${controlEnd} 14.5, ${end - 1} 16.5`}
              stroke="var(--color-paper-lift)"
              strokeOpacity={0.25}
              strokeWidth={0.6}
              strokeLinecap="round"
            />
          </pattern>
          <clipPath id={clipId}>
            {/* Reveal the holes and their stitches together, from left to right. */}
            <motion.rect
              x={0}
              y={0}
              height={32}
              initial={draw ? { width: '0%' } : { width: '100%' }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 2.8, ease: EASE_OUT }}
            />
          </clipPath>
        </defs>

        <rect width="100%" height={32} fill={`url(#${patternId})`} clipPath={`url(#${clipId})`} />
      </svg>
    </div>
  )
}
