import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Hero } from '@/components/hero/Hero'
import { ThreadDivider } from '@/components/motifs/ThreadDivider'
import { pillars, story } from '@/content/brand'
import { rise, riseStagger, whileInViewProps } from '@/lib/motion'
import notebookPatchwork from '@/assets/images/notebook-patchwork.webp'
import notebookStanding from '@/assets/images/notebook-standing.webp'

export function Home() {
  return (
    <>
      <Hero />

      <ThreadDivider className="mx-auto max-w-6xl px-6 md:px-8" />

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-24">
        <motion.div variants={riseStagger(0.08)} {...whileInViewProps}>
          <motion.h2 variants={rise} className="max-w-2xl text-h3 text-ink md:text-h2">
            {story.audience}
          </motion.h2>

          <motion.ul variants={riseStagger(0.08)} className="mt-14 grid gap-10 md:grid-cols-3">
            {pillars.map((p) => (
              <motion.li key={p.title} variants={rise}>
                <h3 className="text-h4 text-ink">{p.title}</h3>
                <p className="mt-3 text-body text-ink-soft text-pretty">{p.body}</p>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </section>

      <section className="bg-paper-deep">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-8 md:py-24">
          <motion.figure variants={rise} {...whileInViewProps} className="m-0">
            <img
              src={notebookPatchwork}
              width={651}
              height={627}
              alt="Quaderno Flex A6 con copertina in carte fantasia rosse e arancioni applicate a riquadri."
              className="block h-auto w-full rounded-[3px]"
              loading="lazy"
              decoding="async"
            />
          </motion.figure>

          <motion.div variants={riseStagger(0.08)} {...whileInViewProps}>
            <motion.p
              variants={rise}
              className="font-display text-h4 font-semibold text-ink text-pretty md:text-h3"
            >
              {story.origin}
            </motion.p>
            <motion.p variants={rise} className="mt-6 text-body-lg text-ink-soft text-pretty">
              {story.time}
            </motion.p>
            <motion.p variants={rise} className="mt-8">
              <Link
                to="/chi-sono"
                className="group inline-flex items-center gap-2 text-label font-bold tracking-wide text-accent uppercase"
              >
                La mia storia
                <span
                  aria-hidden="true"
                  className="h-px w-8 origin-left bg-accent transition-transform duration-200 ease-out group-hover:scale-x-125"
                />
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-[0.85fr_1.15fr]">
          <motion.figure variants={rise} {...whileInViewProps} className="order-2 m-0 md:order-1">
            <img
              src={notebookStanding}
              width={1000}
              height={1224}
              alt="Tesi rilegata a mano: dorso a vista cucito con filo bordeaux fra copertina rossa e piatto avorio."
              className="block h-auto w-full rounded-[3px]"
              loading="lazy"
              decoding="async"
            />
          </motion.figure>

          <motion.div
            variants={riseStagger(0.08)}
            {...whileInViewProps}
            className="order-1 md:order-2"
          >
            <motion.h2 variants={rise} className="text-h3 text-ink md:text-h2">
              {story.invitation}
            </motion.h2>
            <motion.p variants={rise} className="mt-6 max-w-md text-body-lg text-ink-soft">
              Scegli genere, tipologia, formato e carta: il quaderno si compone un passo alla volta.
            </motion.p>
            <motion.p variants={rise} className="mt-8">
              <Link
                to="/componi-il-tuo"
                className="inline-flex items-center rounded-sm bg-accent px-6 py-3 text-label font-bold tracking-wide text-paper uppercase transition-colors duration-200 hover:bg-wine"
              >
                Componi il tuo quaderno
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
