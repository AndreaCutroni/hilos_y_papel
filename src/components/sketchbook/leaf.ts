/**
 * Geometry and light of the turning leaf, kept apart from the component so the
 * shape of a page turn can be read and tuned without the React around it.
 *
 * The leaf is a chain of STRIPS flat strips hinged at the spine. `theta` is how
 * far it has swung: 0 lying on its own page, π lying on the other. It bends as
 * it goes, the way paper held by its edge bends — most of the bend near the
 * spine, the free edge leading — and the bend peaks as the leaf stands upright.
 */

export type Dir = 'next' | 'prev'
export type Side = 'front' | 'back'

export const STRIPS = 12

/** Peak bend, in radians, reached with the leaf upright. Kept under 1 so no
 *  part of the leaf ever dips below the page it rises from or lands on. */
const BEND = 0.52

/** The eye's distance from the book, in page widths. index.css sets the book's
 *  perspective to 1.95 book widths, which is this. Keep the two in step. */
export const EYE = 3.9

/* Light from a little to the left and mostly in front, like the room's light
   on the desk: enough to tell the two directions apart, not so much that the
   back of a leaf going over turns grey. Only x and z matter — every strip
   turns about the vertical spine, so no surface ever leans up or down. */
const LIGHT_X = -0.12 / Math.hypot(0.12, 1)
const LIGHT_Z = 1 / Math.hypot(0.12, 1)
/** What still reaches a face turned right away from the light. */
const AMBIENT = 0.36

/** How much of the bend is taken up at fraction s along the leaf. */
const taken = (s: number) => 2 * s - s * s

/** The leaf's angle at fraction s along it, from the spine (0) to the free edge (1). */
export function angleAt(theta: number, s: number) {
  return theta + BEND * Math.sin(theta) * (2 * taken(s) - 1)
}

export type Leaf = {
  /** The plane each strip lies in, as its angle off its own page. */
  planes: number[]
  /** The angle at every strip boundary, spine first: where the light is read. */
  bounds: number[]
  /** The free edge, in page widths: how far out from the spine, and how high. */
  edgeX: number
  edgeZ: number
}

export function leafAt(theta: number): Leaf {
  const planes: number[] = []
  const bounds: number[] = []
  let x = 0
  let z = 0
  for (let b = 0; b <= STRIPS; b++) bounds.push(angleAt(theta, b / STRIPS))
  for (let i = 0; i < STRIPS; i++) {
    const a = angleAt(theta, (i + 0.5) / STRIPS)
    planes.push(a)
    x += Math.cos(a) / STRIPS
    z += Math.sin(a) / STRIPS
  }
  return { planes, bounds, edgeX: x, edgeZ: z }
}

/* Where the free edge lies for each swing, sampled once. It only ever falls,
   from 1 (flat on its own page) to -1 (flat on the other), so it inverts by
   bisection. */
const SAMPLES = 256
const EDGE = Array.from({ length: SAMPLES + 1 }, (_, k) => leafAt((Math.PI * k) / SAMPLES).edgeX)

/** The swing that puts the free edge x page widths out from the spine. */
export function thetaForEdge(x: number) {
  if (x >= EDGE[0]) return 0
  if (x <= EDGE[SAMPLES]) return Math.PI
  let lo = 0
  let hi = SAMPLES
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (EDGE[mid] > x) lo = mid
    else hi = mid
  }
  const f = (EDGE[lo] - x) / (EDGE[lo] - EDGE[hi])
  return (Math.PI * (lo + f)) / SAMPLES
}

/** Where the eye sees the free edge, in page widths from the spine: the
 *  perspective pushes a raised edge outward. */
export function edgeOnScreen(leaf: Leaf) {
  return (leaf.edgeX * EYE) / (EYE - leaf.edgeZ)
}

/**
 * The tint laid over one face where its surface stands at angle `phi`. A page
 * lying flat gets none at all, so the leaf matches the pages exactly where it
 * leaves and where it lands. `lift` (0 to 1) lets the face catch a little
 * extra light while it is up in the air.
 */
export function shade(phi: number, side: Side, dir: Dir, lift: number) {
  /* the front's normal leans the way the leaf travels; the back's is opposite */
  const s = side === 'front' ? 1 : -1
  const nx = s * (dir === 'next' ? -1 : 1) * Math.sin(phi)
  const nz = s * Math.cos(phi)
  const d = Math.max(0, nx * LIGHT_X + nz * LIGHT_Z)
  const b = AMBIENT + (1 - AMBIENT) * (d / LIGHT_Z) + 0.1 * lift * d * d
  if (b < 1) return `rgba(46,26,24,${Math.min(0.36, (1 - b) * 0.55).toFixed(3)})`
  return `rgba(255,250,240,${Math.min(0.24, (b - 1) * 1.1).toFixed(3)})`
}
