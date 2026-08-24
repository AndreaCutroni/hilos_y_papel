import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sketchbook } from '@/components/sketchbook/Sketchbook'
import { ThreadDivider } from '@/components/motifs/ThreadDivider'
import { FounderName } from '@/components/Wordmark'
import { sketchbookIntro } from '@/content/sketchbook'
import { contact, story } from '@/content/brand'
import { rise, riseStagger, whileInViewProps } from '@/lib/motion'
import chiara from '@/assets/images/chiara.webp'

export function ChiSono() {
  return (
    <>
      <section className="paper-grain relative bg-paper">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 md:px-8 md:pt-20">
          <motion.div variants={riseStagger(0.08)} initial="hidden" animate="visible">
            <motion.p
              variants={rise}
              className="text-label font-bold tracking-[0.14em] text-accent uppercase"
            >
              {sketchbookIntro.eyebrow}
            </motion.p>

            <div className="mt-6 grid items-end gap-10 md:grid-cols-[1fr_auto] md:gap-14">
              <div>
                <motion.h1
                  variants={rise}
                  className="font-wordmark text-h2 leading-[1.05] font-bold text-ink md:text-h1"
                >
                  <FounderName />
                </motion.h1>
                <motion.p
                  variants={rise}
                  className="mt-6 max-w-xl font-display text-h4 leading-[1.3] text-ink text-pretty md:text-h3"
                >
                  {sketchbookIntro.lede}
                </motion.p>
                <motion.p
                  variants={rise}
                  className="mt-5 max-w-xl text-body-lg text-ink-soft text-pretty"
                >
                  {sketchbookIntro.body}
                </motion.p>
              </div>

              <motion.figure
                variants={rise}
                className="m-0 w-full max-w-[260px] justify-self-start md:justify-self-end"
              >
                <img
                  src={chiara}
                  width={718}
                  height={702}
                  alt={sketchbookIntro.photoAlt}
                  className="block h-auto w-full rounded-[3px]"
                  decoding="async"
                />
              </motion.figure>
            </div>
          </motion.div>
        </div>

        <ThreadDivider className="mx-auto max-w-6xl px-6 md:px-8" />

        {/* ------------------------------------------------- the sketchbook */}
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-20 md:px-8 md:pt-16 md:pb-28">
          <motion.h2
            variants={rise}
            {...whileInViewProps}
            className="mb-10 max-w-2xl font-display text-h3 text-ink md:text-h2"
          >
            Nove tavole sul mestiere
          </motion.h2>
          <Sketchbook />
        </div>
      </section>

      <section className="bg-paper-lift">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-24">
          <motion.div variants={riseStagger(0.08)} {...whileInViewProps} className="max-w-2xl">
            <motion.p
              variants={rise}
              className="font-display text-h4 text-ink text-pretty md:text-h3"
            >
              {story.invitation}
            </motion.p>
            <motion.p variants={rise} className="mt-6 text-body-lg text-ink-soft">
              Per qualsiasi dubbio o informazione, scrivimi: decidiamo insieme come farlo.
            </motion.p>
            <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center rounded-sm bg-brick px-6 py-3 text-label font-bold tracking-wide text-on-brick uppercase transition-colors duration-200 hover:bg-brick-deep"
              >
                Scrivimi
              </a>
              <Link
                to="/componi-il-tuo"
                className="group inline-flex items-center gap-2 text-label font-bold tracking-wide text-ink uppercase"
              >
                Componi il tuo quaderno
                <span
                  aria-hidden="true"
                  className="h-px w-8 origin-left bg-accent transition-transform duration-200 ease-out group-hover:scale-x-125"
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
