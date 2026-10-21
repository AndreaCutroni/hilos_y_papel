import sample from '@/content/dietroHandwriting.json'

/**
 * Pacing for the hero line that writes itself on.
 *
 * A hand does not move at a constant rate per word — a long word takes longer
 * than a short one — so each word is given time in proportion to its length,
 * with a short lift between words. The underline follows `settled`; the rest
 * of the hero appears independently while the writing is still in progress.
 */

/** Seconds of pen time per character. */
const PER_CHAR = 0.052
/** No word is written faster than this, however short. */
const MIN_WORD = 0.2
/** The lift between one word and the next. */
const WORD_GAP = 0.055

export type HandwritingTiming = {
  starts: number[]
  durations: number[]
  /** When the last word finishes. */
  settled: number
}

export function handwritingTiming(words: readonly string[], startDelay: number): HandwritingTiming {
  const starts: number[] = []
  const durations: number[] = []
  let t = startDelay
  for (const w of words) {
    const d = w === sample.word ? sample.duration : Math.max(MIN_WORD, w.length * PER_CHAR)
    starts.push(t)
    durations.push(d)
    t += d + WORD_GAP
  }
  return { starts, durations, settled: t - WORD_GAP }
}
