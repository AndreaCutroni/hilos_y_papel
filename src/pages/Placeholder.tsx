import { motion } from 'framer-motion'
import { ThreadDivider } from '@/components/motifs/ThreadDivider'
import { rise, riseStagger } from '@/lib/motion'

type Props = {
  title: string
  intro: string
}

/** Stand-in for the pages not yet designed. Proves routing and page transitions. */
export function Placeholder({ title, intro }: Props) {
  return (
    <section className="paper-grain relative bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
        <motion.div variants={riseStagger(0.08)} initial="hidden" animate="visible">
          <motion.p
            variants={rise}
            className="text-label font-bold tracking-[0.14em] text-accent uppercase"
          >
            In lavorazione
          </motion.p>
          <motion.h1 variants={rise} className="mt-4 text-h2 text-ink md:text-h1">
            {title}
          </motion.h1>
          <motion.div variants={rise} className="mt-8 max-w-md">
            <ThreadDivider />
          </motion.div>
          <motion.p
            variants={rise}
            className="mt-8 max-w-xl text-body-lg text-ink-soft text-pretty"
          >
            {intro}
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
