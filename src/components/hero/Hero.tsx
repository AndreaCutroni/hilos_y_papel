import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { hero } from '@/content/brand'
import { AnimatedHeadline } from './AnimatedHeadline'
import { CopticSeam } from '@/components/motifs/CopticSeam'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { EASE_OUT } from '@/lib/motion'
import { handwritingTiming } from '@/lib/handwriting'
import notebookOpen from '@/assets/images/notebook-open-green.webp'
import stitchDetail from '@/assets/images/stitch-detail.webp'

export function Hero() {
  const reduced = useReducedMotion()
  const HEAD_START = 0.3
  /* Everything under the headline waits for the pen to finish. */
  const settle = handwritingTiming(hero.headline, HEAD_START).settled

  const fadeUp = (delay: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.01 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: EASE_OUT, delay },
        }

  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-20 md:px-8 md:pt-20 md:pb-28 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Copy */}
          <div className="max-w-xl">
            <motion.p
              {...fadeUp(0.05)}
              className="text-label font-bold tracking-[0.14em] text-accent uppercase"
            >
              {hero.eyebrow}
            </motion.p>

            {/* Caveat has a small eye, so it is set well above the display size
                Fraunces used here to carry the same weight on the page. */}
            <AnimatedHeadline
              words={hero.headline}
              threadWord={hero.headline.length - 1}
              startDelay={HEAD_START}
              className="mt-5 text-[3.4rem] leading-[1.02] font-medium text-ink sm:text-[4.6rem] lg:text-[5.9rem]"
            />

            <motion.p
              {...fadeUp(settle)}
              className="mt-7 max-w-lg text-body-lg text-ink-soft text-pretty"
            >
              {hero.subhead}
            </motion.p>

            <motion.div
              {...fadeUp(settle + 0.1)}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                to={hero.primaryCta.to}
                className="inline-flex items-center rounded-sm bg-brick px-6 py-3 text-label font-bold tracking-wide text-on-brick uppercase transition-colors duration-200 hover:bg-brick-deep"
              >
                {hero.primaryCta.label}
              </Link>
              <Link
                to={hero.secondaryCta.to}
                className="group inline-flex items-center gap-2 text-label font-bold tracking-wide text-ink uppercase"
              >
                {hero.secondaryCta.label}
                <span
                  aria-hidden="true"
                  className="h-px w-8 origin-left bg-accent transition-transform duration-200 ease-out group-hover:scale-x-125"
                />
              </Link>
            </motion.div>
          </div>

          {/* Photograph. Width is capped near the image's native 636px below lg so
              it never upscales into softness. */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced ? { duration: 0.01 } : { duration: 0.4, ease: EASE_OUT, delay: 0.2 }
            }
            className="relative mx-auto w-full max-w-[520px] lg:mx-0 lg:max-w-none"
          >
            <figure className="relative m-0 overflow-hidden rounded-[3px]">
              <img
                src={notebookOpen}
                width={636}
                height={597}
                alt="Quaderno rigido A6 orizzontale aperto: copertina verde con soffioni ricamati a filo e pagine in carta riciclata."
                className="block h-auto w-full rounded-[3px] object-cover"
                fetchPriority="high"
                decoding="async"
              />
            </figure>

            {/* Detail of the real Coptic binding, offset off the right edge */}
            <motion.figure
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduced ? { duration: 0.01 } : { duration: 0.4, ease: EASE_OUT, delay: 0.7 }
              }
              className="absolute -right-4 -bottom-10 m-0 hidden w-44 sm:block lg:-right-12 lg:w-56"
            >
              <img
                src={stitchDetail}
                width={868}
                height={562}
                alt="Dettaglio della cucitura copta a vista: filo bordeaux che incrocia i fascicoli sul dorso."
                className="block h-auto w-full rounded-[3px] shadow-[0_10px_30px_-12px_rgba(46,26,24,0.45)]"
                loading="lazy"
                decoding="async"
              />
            </motion.figure>

            {/* The seam straddles the left edge, sitting where a spine would —
                centred on that edge rather than running the full height. */}
            <div className="pointer-events-none absolute top-1/2 left-0 hidden h-[72%] -translate-x-1/2 -translate-y-1/2 lg:block">
              <CopticSeam rows={12} delay={0.5} showSignatures={false} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
