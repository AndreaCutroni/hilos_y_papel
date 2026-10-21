import { useId } from 'react'
import { motion } from 'framer-motion'
import sample from '@/content/dietroHandwriting.json'

type Props = {
  startDelay: number
  reduced: boolean
}

/** Caveat Medium outlines, revealed by pen strokes rather than a horizontal wipe.
 * Font outlines: Google Fonts / Caveat, SIL OFL (public/licenses/Caveat-OFL.txt).
 */
export function DietroHandwriting({ startDelay, reduced }: Props) {
  const id = useId().replace(/:/g, '')

  return (
    <span className="relative inline-block">
      {/* Keep the live font's wrapping, advance width and baseline. */}
      <span className="invisible">{sample.word}</span>
      <svg
        viewBox={`0 0 ${sample.width} ${sample.height}`}
        className="absolute top-1/2 left-0 h-[1.26em] w-full -translate-y-1/2 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {sample.letters.map((glyph, i) => (
            <mask
              key={glyph.letter}
              id={`${id}-${i}`}
              maskUnits="userSpaceOnUse"
              x={-10}
              y={0}
              width={sample.width + 20}
              height={sample.height}
            >
              {glyph.strokes.map((stroke, j) => (
                <motion.path
                  key={j}
                  d={stroke.d}
                  fill="none"
                  stroke="white"
                  strokeWidth={stroke.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: {
                      duration: reduced ? 0 : stroke.duration,
                      delay: reduced ? 0 : startDelay + stroke.delay,
                      ease: [0.3, 0, 0.55, 1],
                    },
                    opacity: {
                      duration: 0.01,
                      delay: reduced ? 0 : startDelay + stroke.delay,
                    },
                  }}
                />
              ))}
            </mask>
          ))}
        </defs>
        {sample.letters.map((glyph, i) => (
          <path
            key={glyph.letter}
            d={glyph.path}
            fill="currentColor"
            mask={reduced ? undefined : `url(#${id}-${i})`}
          />
        ))}
      </svg>
    </span>
  )
}
