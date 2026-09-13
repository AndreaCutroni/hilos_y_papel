import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { plates, sketchbookHint } from '@/content/sketchbook'
import { SketchPage } from './SketchPage'
import { PlateCard } from './PlateCard'
import { STRIPS as N, edgeOnScreen, leafAt, shade, thetaForEdge, type Dir } from './leaf'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useMediaQuery } from '@/lib/useMediaQuery'

const M = plates.length
const PI = Math.PI
/** Sewing stations down the fold, as a share of the page's height. */
const STATIONS = [10, 26, 42, 58, 74, 90]

type Turn = { dir: Dir; from: number; to: number }

/** What is moving the leaf: the hand holding it, a spring settling it once the
 *  hand lets go, or a turn begun from the arrows or the keyboard. */
type Drive =
  | { kind: 'hand'; target: number }
  | { kind: 'spring'; target: number; done: () => void }
  | { kind: 'glide'; from: number; dur: number; at: number; done: () => void }

/** The elements a frame writes to, found once each time a leaf is mounted. */
type Rig = {
  dir: Dir
  curl: HTMLElement
  strips: { el: HTMLElement; front: HTMLElement; back: HTMLElement }[]
}

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2)
const neighbour = (i: number, dir: Dir) => (dir === 'next' ? (i + 1) % M : (i - 1 + M) % M)

export function Sketchbook() {
  const reduced = useReducedMotion()
  /* The dragged spread needs room for two pages of type; below that the plate
     is read as a single stacked card. */
  const asSpread = useMediaQuery('(min-width: 768px)')

  const [idx, setIdx] = useState(0)
  const [turn, setTurn] = useState<Turn | null>(null)
  const [hintGone, setHintGone] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<HTMLDivElement>(null)
  const deskRef = useRef<HTMLDivElement>(null)
  const occlL = useRef<HTMLDivElement>(null)
  const occlR = useRef<HTMLDivElement>(null)
  const bandL = useRef<HTMLDivElement>(null)
  const bandR = useRef<HTMLDivElement>(null)

  /* The swing lives in refs and is written straight onto the elements that
     show it, so neither a drag nor a landing re-renders React mid-flight.
     `live` and `shown` are what the handlers read; state is what the markup
     needs. */
  const sim = useRef({
    theta: 0,
    v: 0,
    drive: null as Drive | null,
    raf: null as number | null,
    last: 0,
  })
  const rig = useRef<Rig | null>(null)
  const live = useRef<Turn | null>(null)
  const shown = useRef(0)
  /** A turn from the arrows waits here for its leaf to be in the DOM. */
  const onMount = useRef<(() => void) | null>(null)

  /* --------------------------------------------------------- geometry */
  const measure = useCallback(() => {
    const book = bookRef.current
    const host = hostRef.current
    if (!book || !host) return
    host.style.setProperty('--bw', book.clientWidth + 'px')
    host.style.setProperty('--pw', book.clientWidth / 2 + 'px')
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (bookRef.current) ro.observe(bookRef.current)
    return () => ro.disconnect()
  }, [measure, asSpread])

  /* ------------------------------------------------------- one frame */
  /* Every value that moves during a turn is written onto the one element that
     uses it: a rotation per strip, a light per face, a fade and a slide for the
     shadows. Nothing inherits a changing value, so a frame never restyles the
     pages inside the leaf. */
  const applyLeaf = useCallback((theta: number) => {
    const r = rig.current
    if (!r) return
    const leaf = leafAt(theta)
    const lift = Math.sin(theta)
    const sign = r.dir === 'next' ? -1 : 1
    const next = r.dir === 'next'

    r.curl.style.transform = `translateZ(0.5px) rotateY(${(sign * leaf.planes[0]).toFixed(4)}rad)`
    for (let i = 0; i < r.strips.length; i++) {
      const s = r.strips[i]
      if (i > 0) {
        const bend = sign * (leaf.planes[i] - leaf.planes[i - 1])
        s.el.style.transform = `rotateY(${bend.toFixed(4)}rad)`
      }
      /* each gradient runs between the light at the strip's two edges, which
         its neighbours share, so the leaf shades as one continuous sheet */
      const f0 = shade(leaf.bounds[i], 'front', r.dir, lift)
      const f1 = shade(leaf.bounds[i + 1], 'front', r.dir, lift)
      const b0 = shade(leaf.bounds[i], 'back', r.dir, lift)
      const b1 = shade(leaf.bounds[i + 1], 'back', r.dir, lift)
      s.front.style.background = `linear-gradient(90deg,${next ? f0 : f1},${next ? f1 : f0})`
      s.back.style.background = `linear-gradient(90deg,${next ? b1 : b0},${next ? b0 : b1})`
    }

    /* The soft shadow just past the free edge, on whichever page the edge is
       over: tight and dark while the edge is low, wide and faint up high. */
    const x = (next ? 1 : -1) * edgeOnScreen(leaf)
    const band = x >= 0 ? bandR.current : bandL.current
    const other = x >= 0 ? bandL.current : bandR.current
    if (band) {
      const width = 0.05 + 0.5 * leaf.edgeZ
      /* faded out as the edge crosses the spine, so it changes pages unseen */
      const k = Math.min(1, Math.abs(x) / 0.12)
      const alpha =
        (0.5 * (1 - Math.min(1, leaf.edgeZ * 1.3)) ** 1.5 + 0.05 * lift) * k * k * (3 - 2 * k)
      band.style.opacity = alpha.toFixed(3)
      band.style.transform = `translateX(${(x * 100).toFixed(2)}%) scaleX(${width.toFixed(3)})`
    }
    if (other) other.style.opacity = '0'

    /* the spine side of both pages dims while the leaf stands over it */
    const occl = (0.5 * lift ** 1.3).toFixed(3)
    if (occlL.current) occlL.current.style.opacity = occl
    if (occlR.current) occlR.current.style.opacity = occl
    if (deskRef.current) deskRef.current.style.opacity = (1 - 0.28 * lift).toFixed(3)
  }, [])

  const clearShadows = useCallback(() => {
    for (const el of [occlL.current, occlR.current, bandL.current, bandR.current])
      if (el) el.style.opacity = '0'
    if (deskRef.current) deskRef.current.style.opacity = '1'
  }, [])

  /* ------------------------------------------------------------- loop */
  const run = useCallback(() => {
    const S = sim.current
    if (S.raf !== null) return
    S.last = performance.now()
    const tick = (now: number) => {
      S.raf = null
      const dt = Math.min(0.034, Math.max(0.001, (now - S.last) / 1000))
      S.last = now
      const d = S.drive
      if (!d) return
      if (d.kind === 'glide') {
        d.at += dt
        const next = d.from + (PI - d.from) * ease(Math.min(1, d.at / d.dur))
        S.v = (next - S.theta) / dt
        S.theta = next
      } else {
        /* a critically damped spring: stiff while the hand holds the leaf,
           so it follows closely but never jitters, softer once it is let go */
        const k = d.kind === 'hand' ? 1600 : 120
        S.v += (k * (d.target - S.theta) - 2 * Math.sqrt(k) * S.v) * dt
        S.theta += S.v * dt
      }
      /* the leaf cannot pass through the pages it lies between */
      if (S.theta < 0) {
        S.theta = 0
        S.v = Math.max(0, S.v)
      } else if (S.theta > PI) {
        S.theta = PI
        S.v = Math.min(0, S.v)
      }
      applyLeaf(S.theta)
      const landed =
        (d.kind === 'glide' && d.at >= d.dur) ||
        (d.kind === 'spring' && (d.target > PI / 2 ? S.theta >= PI : S.theta <= 0))
      if (landed) {
        S.drive = null
        S.v = 0
        d.done()
        return
      }
      S.raf = requestAnimationFrame(tick)
    }
    S.raf = requestAnimationFrame(tick)
  }, [applyLeaf])

  const halt = useCallback(() => {
    const S = sim.current
    if (S.raf !== null) cancelAnimationFrame(S.raf)
    S.raf = null
    S.drive = null
  }, [])
  useEffect(() => halt, [halt])

  /* ------------------------------------------------------ turn control */
  const land = useCallback(
    (t: Turn, over: boolean) => {
      if (live.current !== t) return
      live.current = null
      rig.current = null
      shown.current = over ? t.to : t.from
      clearShadows()
      setIdx(over ? t.to : t.from)
      setTurn(null)
    },
    [clearShadows]
  )

  const begin = useCallback(
    (dir: Dir) => {
      halt()
      /* a turn still in the air lands where it was going */
      if (live.current) shown.current = live.current.to
      const t: Turn = { dir, from: shown.current, to: neighbour(shown.current, dir) }
      live.current = t
      rig.current = null
      sim.current.theta = 0
      sim.current.v = 0
      clearShadows()
      setIdx(t.from)
      setTurn(t)
      return t
    },
    [halt, clearShadows]
  )

  /** A whole turn, lifted gently and laid down gently. */
  const glide = useCallback(
    (t: Turn) => {
      const S = sim.current
      S.drive = {
        kind: 'glide',
        from: S.theta,
        dur: 0.56 * (1 - S.theta / PI) + 0.08,
        at: 0,
        done: () => land(t, true),
      }
      run()
    },
    [run, land]
  )

  const step = useCallback(
    (dir: Dir) => {
      setHintGone(true)
      if (reduced) {
        halt()
        live.current = null
        rig.current = null
        shown.current = neighbour(shown.current, dir)
        setTurn(null)
        setIdx(shown.current)
        return
      }
      const t = begin(dir)
      onMount.current = () => glide(t)
    },
    [reduced, halt, begin, glide]
  )

  const goTo = useCallback(
    (i: number) => {
      setHintGone(true)
      const at = live.current ? live.current.to : shown.current
      if (i === at) return
      if ((i - at + M) % M === 1) step('next')
      else if ((at - i + M) % M === 1) step('prev')
      else {
        halt()
        live.current = null
        rig.current = null
        clearShadows()
        shown.current = i
        setTurn(null)
        setIdx(i)
      }
    },
    [step, halt, clearShadows]
  )

  /* find the new leaf's elements as soon as it is in the DOM */
  useLayoutEffect(() => {
    if (!turn) return
    const curl = hostRef.current?.querySelector<HTMLElement>('.sb-curl')
    if (!curl) return
    const strips: Rig['strips'] = []
    for (const el of Array.from(curl.querySelectorAll<HTMLElement>('.sb-strip'))) {
      const front = el.querySelector<HTMLElement>(':scope > .sb-face.front > .sb-lit')
      const back = el.querySelector<HTMLElement>(':scope > .sb-face.back > .sb-lit')
      if (front && back) strips.push({ el, front, back })
    }
    rig.current = { dir: turn.dir, curl, strips }
    applyLeaf(sim.current.theta)
    const go = onMount.current
    onMount.current = null
    go?.()
  }, [turn, applyLeaf])

  /* ------------------------------------------------------------- drag */
  const drag = useRef<{
    turn: Turn | null
    dir: Dir
    spine: number
    half: number
    u0: number
    x0: number
    moved: number
  } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest('button')) return
    const book = bookRef.current
    if (!book) return
    const r = book.getBoundingClientRect()
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
      return
    e.preventDefault()
    setHintGone(true)
    stageRef.current?.setPointerCapture(e.pointerId)
    const spine = r.left + r.width / 2
    const half = r.width / 2
    const dir: Dir = e.clientX >= spine ? 'next' : 'prev'
    const t = reduced ? null : begin(dir)
    if (t) sim.current.drive = { kind: 'hand', target: 0 }
    drag.current = {
      turn: t,
      dir,
      spine,
      half,
      u0: Math.max(0.05, Math.abs(e.clientX - spine) / half),
      x0: e.clientX,
      moved: 0,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    d.moved = Math.max(d.moved, Math.abs(e.clientX - d.x0))
    const S = sim.current
    if (!d.turn || S.drive?.kind !== 'hand') return
    /* The free edge follows the hand. From where the page was picked up to the
       far page's outer edge is the whole turn, however near the spine it was
       taken. */
    const u = ((e.clientX - d.spine) / d.half) * (d.dir === 'next' ? 1 : -1)
    S.drive.target = thetaForEdge(1 - (2 * (d.u0 - u)) / (d.u0 + 1))
    run()
  }

  const endDrag = () => {
    const d = drag.current
    if (!d) return
    drag.current = null
    /* reduced motion: no leaf, a tap simply turns */
    if (!d.turn) {
      if (d.moved < 6) step(d.dir)
      return
    }
    const t = d.turn
    if (live.current !== t) return
    if (d.moved < 6) {
      glide(t)
      return
    }
    /* let go past halfway and it lands; a flick carries it either way. The
       spring starts from the hand's own speed, so nothing stops and restarts. */
    const S = sim.current
    const over = S.theta > PI / 2 ? S.v > -2.2 : S.v > 2.6
    S.drive = over
      ? { kind: 'spring', target: PI + 0.08, done: () => land(t, true) }
      : { kind: 'spring', target: -0.08, done: () => land(t, false) }
    run()
  }

  /* -------------------------------------------------------- keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const stage = stageRef.current
      if (!stage) return
      /* only when the book is actually on screen */
      const r = stage.getBoundingClientRect()
      if (r.bottom < 0 || r.top > innerHeight) return
      e.preventDefault()
      step(e.key === 'ArrowRight' ? 'next' : 'prev')
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [step])

  /* ----------------------------------------------------------- render */
  const spread = (i: number) => ({
    left: <SketchPage plate={plates[i]} side="left" />,
    right: <SketchPage plate={plates[i]} side="right" />,
  })

  const flat = spread(idx)
  const staticLeft = turn ? spread(turn.dir === 'next' ? turn.from : turn.to).left : flat.left
  const staticRight = turn ? spread(turn.dir === 'next' ? turn.to : turn.from).right : flat.right

  /* what the two faces of the turning leaf carry */
  const leafFront = turn
    ? turn.dir === 'next'
      ? spread(turn.from).right
      : spread(turn.from).left
    : null
  const leafBack = turn
    ? turn.dir === 'next'
      ? spread(turn.to).left
      : spread(turn.to).right
    : null

  const current = plates[turn ? turn.to : idx]

  if (!asSpread) {
    return (
      <div className="w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={
              reduced ? { duration: 0.01 } : { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }
            }
          >
            <PlateCard plate={current} />
          </motion.div>
        </AnimatePresence>
        <Pager idx={idx} turn={turn} step={step} />
        <PlateList plates={plates} activeIdx={turn ? turn.to : idx} goTo={goTo} />
        <p className="sr-only" aria-live="polite">
          Tavola {(turn ? turn.to : idx) + 1} di {M}: {current.title}. {current.lede}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div
        ref={stageRef}
        className="relative mx-auto flex max-w-5xl touch-pan-y items-center gap-1 select-none sm:gap-3"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDragStart={(e) => e.preventDefault()}
      >
        <SideArrow label="Tavola precedente" onClick={() => step('prev')}>
          <path d="M15 5L8 13l7 8" />
        </SideArrow>

        <div ref={hostRef} className="sb-3d relative min-w-0 flex-1 md:max-w-4xl">
          <div ref={deskRef} className="sb-desk" aria-hidden="true">
            <div className="sb-cast ambient" />
            <div className="sb-cast contact" />
            <div className="sb-cast edge" />
          </div>
          {/* the block of pages under the spread, showing along its foot */}
          <div className="sb-block" aria-hidden="true" />

          <div ref={bookRef} className="sb-book">
            {/* the paper, on its own layer: see .sb-sheet in index.css */}
            <div className="sb-sheet sb-paper" aria-hidden="true" />
            <div className="sb-half left">
              {staticLeft}
              <div ref={occlL} className="sb-occl" aria-hidden="true" />
              <div ref={bandL} className="sb-band" aria-hidden="true" />
            </div>
            <div className="sb-half right">
              {staticRight}
              <div ref={occlR} className="sb-occl" aria-hidden="true" />
              <div ref={bandR} className="sb-band" aria-hidden="true" />
            </div>

            <Binding />

            {turn && (
              <div className={`sb-curl ${turn.dir}`} style={{ ['--n' as string]: N }}>
                <Strip i={0} dir={turn.dir} front={leafFront} back={leafBack} />
              </div>
            )}
          </div>
        </div>

        <SideArrow label="Tavola successiva" onClick={() => step('next')}>
          <path d="M9 5l7 8-7 8" />
        </SideArrow>
      </div>

      <p className="mt-5 text-center text-label tracking-wide text-ink-soft tabular-nums">
        {(turn ? turn.to : idx) + 1} / {M}
      </p>

      <p
        className={`mt-2 text-center text-label text-ink-soft transition-opacity duration-300 ${
          hintGone ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden={hintGone}
      >
        {sketchbookHint}
      </p>

      <PlateList plates={plates} activeIdx={turn ? turn.to : idx} goTo={goTo} />

      {/* what a screen reader follows, since the book itself is a drawing */}
      <p className="sr-only" aria-live="polite">
        Tavola {(turn ? turn.to : idx) + 1} di {M}: {current.title}. {current.lede}
      </p>
    </div>
  )
}

/** The thread in the fold. Inside a signature it shows only where it runs along
 *  the fold, so it appears in lengths between pierced stations — in through
 *  one, along the crease, out through the next. The paper's fall into the fold
 *  belongs to each page instead (SketchPage), so that part turns with the leaf. */
function Binding() {
  return (
    <div className="sb-sewing" aria-hidden="true">
      {STATIONS.map((y) => (
        <span key={y} className="sb-hole" style={{ top: `${y}%` }} />
      ))}
      {[0, 2, 4].map((k) => (
        <span
          key={`t${k}`}
          className="sb-thread"
          style={{ top: `${STATIONS[k]}%`, height: `${STATIONS[k + 1] - STATIONS[k]}%` }}
        />
      ))}
    </div>
  )
}

/** One link in the strip chain — each strip hosts the next, so rotations compound. */
function Strip({
  i,
  dir,
  front,
  back,
}: {
  i: number
  dir: Dir
  front: React.ReactNode
  back: React.ReactNode
}) {
  if (i >= N) return null
  /* Where this strip's slice sits within the page it shows. `next` reads the
     recto outward from the gutter; the verso behind it is mirrored, so it
     counts in from the far edge. `prev` is the same idea reflected. */
  const frac = `calc(var(--pw, 0px) / ${N})`
  const fromGutter = `calc(-1 * ${i} * ${frac})`
  const fromEdge = `calc(-1 * (var(--pw, 0px) - ${i + 1} * ${frac}))`
  const frontShift = dir === 'next' ? fromGutter : fromEdge
  const backShift = dir === 'next' ? fromEdge : fromGutter

  return (
    <div className={`sb-strip${i === N - 1 ? ' edge' : ''}`}>
      <div className="sb-face front">
        <div className="sb-slice" style={{ transform: `translateX(${frontShift})` }}>
          {front}
        </div>
        <div className="sb-lit" />
      </div>
      <div className="sb-face back">
        <div className="sb-slice" style={{ transform: `translateX(${backShift})` }}>
          {back}
        </div>
        <div className="sb-lit" />
      </div>
      <Strip i={i + 1} dir={dir} front={front} back={back} />
    </div>
  )
}

/** The editorial index; jumping is the keyboard-and-screen-reader route through
 *  the book, so it carries the same plates in the same order. */
function PlateList({
  plates: list,
  activeIdx,
  goTo,
}: {
  plates: typeof plates
  activeIdx: number
  goTo: (i: number) => void
}) {
  return (
    <div className="mx-auto mt-12 max-w-4xl">
      <h3 className="text-label font-bold tracking-[0.16em] text-ink-soft uppercase">Indice</h3>
      <ol className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => {
          const active = i === activeIdx
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={active ? 'true' : undefined}
                className={`group flex w-full items-baseline gap-3 border-b border-ink/12 py-2 text-left transition-colors duration-200 ${
                  active ? 'text-brick' : 'text-ink hover:text-brick'
                }`}
              >
                <span
                  className={`font-display text-label tracking-widest ${active ? '' : 'text-ink-soft group-hover:text-brick'}`}
                >
                  {p.mark}
                </span>
                <span className="flex-1 text-body">{p.index}</span>
                <span
                  aria-hidden="true"
                  className={`h-px w-6 origin-right bg-brick transition-transform duration-200 ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** A page arrow standing beside the book, where a hand would reach for it. */
function SideArrow({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-12 w-8 shrink-0 items-center justify-center rounded-sm text-ink-soft transition-colors duration-200 hover:text-brick sm:h-16 sm:w-10"
    >
      <svg
        viewBox="0 0 24 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  )
}

/** Just the counter now — the arrows live beside the pages, and the stacked
 *  card keeps this pair under the plate where there is no room at the sides. */
function Pager({ idx, turn, step }: { idx: number; turn: Turn | null; step: (d: Dir) => void }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <ToolButton label="Tavola precedente" onClick={() => step('prev')}>
        <path d="M13 4L7 10l6 6" />
      </ToolButton>
      <span className="min-w-[5.5rem] text-center text-label tracking-wide text-ink-soft tabular-nums">
        {(turn ? turn.to : idx) + 1} / {M}
      </span>
      <ToolButton label="Tavola successiva" onClick={() => step('next')}>
        <path d="M7 4l6 6-6 6" />
      </ToolButton>
    </div>
  )
}

function ToolButton({
  label,
  onClick,
  children,
  pressed,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  pressed?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-sm transition-colors duration-200 ${
        pressed ? 'text-brick' : 'text-ink-soft hover:text-brick'
      }`}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  )
}
