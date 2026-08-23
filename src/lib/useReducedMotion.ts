import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

/**
 * Returns true when the visitor has asked for reduced motion.
 * Framer's hook already tracks the media query; this wrapper just gives a
 * non-nullable boolean so callers can branch without a null check.
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false
}
