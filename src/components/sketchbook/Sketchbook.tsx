import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { plates, sketchbookHint } from '@/content/sketchbook'
import { SketchPage } from './SketchPage'
import { PlateCard } from './PlateCard'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useMediaQuery } from '@/lib/useMediaQuery'

/* Strips in the turning leaf. Enough to read as a curve, few enough that the
   page markup inside them stays cheap to mount at the start of a turn. */
const N = 12
/** Peak curl of the arc, in radians. */
const BETA = 0.6
const M = plates.length

type Dir = 'next' | 'prev'
type Turn = { dir: Dir; from: number; to: number; t: number }

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
  const stripsRef = useRef<(HTMLDivElement | null)[]>([])

  /* The turn is animated by writing CSS variables straight to the DOM. Keeping
     `t` in a ref rather than state means a drag never re-renders React. */
  const tRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const springRef = useRef<{ v: number; target: number; done?: () => void } | null>(null)
  /* Mirrors `turn` so the pointer handlers and the rAF loop can read it without
     re-subscribing. Written in an effect, never during render. */
  const turnRef = useRef<Turn | null>(null)
  useEffect(() => {
    turnRef.current = turn
  }, [turn])

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
  }, [measure])

  /* ------------------------------------------------------ the leaf arc */
  const applyTurn = useCallback((t: number) => {
    const host = hostRef.current
    if (!host) return
    const th = Math.PI * t
    const beta = BETA * Math.sin(Math.PI * t) // flat at both ends, bowed between
    const D = 180 / Math.PI
    const tt = th + beta
    const td = (2 * beta) / N
    host.style.setProperty('--tt', (tt * D).toFixed(2) + 'deg')
    host.style.setProperty('--td', (td * D).toFixed(3) + 'deg')
    host.style.setProperty('--shade', Math.sin(Math.PI * t).toFixed(3))
    /* light across the curve: how squarely each strip faces the viewer */
    for (let i = 0; i < stripsRef.current.length; i++) {
      const s = stripsRef.current[i]
      if (!s) continue
      const l1 = Math.abs(Math.cos(tt - i * td))
      const l2 = Math.abs(Math.cos(tt - (i + 1) * td))
      s.style.setProperty('--lit', l1.toFixed(3))
      s.style.setProperty('--a1', ((1 - l1) * 0.55).toFixed(3))
      s.style.setProperty('--a2', ((1 - l2) * 0.55).toFixed(3))
    }
  }, [])

  const stopRaf = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  const settle = useCallback(
    (target: number, done?: () => void) => {
      if (reduced) {
        tRef.current = target
        applyTurn(target)
        done?.()
        return
      }
      springRef.current = { v: 0, target, done }
      if (rafRef.current !== null) return
      let last = performance.now()
      const tick = (now: number) => {
        rafRef.current = null
        const dt = Math.min(0.032, (now - last) / 1000 || 0.016)
        last = now
        const s = springRef.current
        if (!s) return
        const x = tRef.current - s.target
        s.v += (-190 * x - 27 * s.v) * dt
        tRef.current += s.v * dt
        if (Math.abs(tRef.current - s.target) < 0.002 && Math.abs(s.v) < 0.02) {
          tRef.current = s.target
          applyTurn(s.target)
          springRef.current = null
          s.done?.()
          return
        }
        applyTurn(tRef.current)
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [applyTurn, reduced]
  )

  useEffect(() => stopRaf, [])

  /* ------------------------------------------------------ turn control */
  const startTurn = useCallback(
    (dir: Dir, t = 0) => {
      springRef.current = null
      stopRaf()
      const from = turnRef.current ? turnRef.current.to : idx
      const to = dir === 'next' ? (from + 1) % M : (from - 1 + M) % M
      stripsRef.current = []
      tRef.current = t
      setTurn({ dir, from, to, t })
      return { from, to }
    },
    [idx]
  )

  const commit = useCallback(() => {
    const cur = turnRef.current
    if (!cur) return
    settle(1, () => {
      setIdx(cur.to)
      setTurn(null)
      tRef.current = 0
      hostRef.current?.style.setProperty('--shade', '0')
    })
  }, [settle])

  const cancel = useCallback(() => {
    if (!turnRef.current) return
    settle(0, () => {
      setTurn(null)
      tRef.current = 0
      hostRef.current?.style.setProperty('--shade', '0')
    })
  }, [settle])

  const step = useCallback(
    (dir: Dir) => {
      setHintGone(true)
      if (turnRef.current) {
        setIdx(turnRef.current.to)
        setTurn(null)
      }
      startTurn(dir, 0)
      requestAnimationFrame(() => commit())
    },
    [startTurn, commit]
  )

  const goTo = useCallback(
    (i: number) => {
      setHintGone(true)
      if (i === idx) return
      const fwd = (i - idx + M) % M
      const back = (idx - i + M) % M
      if (Math.min(fwd, back) === 1) {
        step(fwd === 1 ? 'next' : 'prev')
        return
      }
      if (turnRef.current) setTurn(null)
      setIdx(i)
    },
    [idx, step]
  )

  /* apply the arc as soon as the strips for a new turn are in the DOM */
  useLayoutEffect(() => {
    if (turn) applyTurn(tRef.current)
  }, [turn, applyTurn])

  /* ------------------------------------------------------------- drag */
  const dragRef = useRef<{
    dir: Dir
    x0: number
    w: number
    moved: number
    vel: number
    tp: number
  } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest('button')) return
    const book = bookRef.current
    if (!book) return
    const r = book.getBoundingClientRect()
    if (e.clientY < r.top || e.clientY > r.bottom) return
    e.preventDefault()
    setHintGone(true)
    stageRef.current?.setPointerCapture(e.pointerId)
    const dir: Dir = (e.clientX - r.left) / r.width > 0.5 ? 'next' : 'prev'
    startTurn(dir, 0)
    dragRef.current = { dir, x0: e.clientX, w: r.width, moved: 0, vel: 0, tp: performance.now() }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.x0
    d.moved = Math.max(d.moved, Math.abs(dx))
    const raw = (d.dir === 'next' ? -dx : dx) / (d.w * 0.62)
    const t = Math.max(0, Math.min(1, raw))
    const now = performance.now()
    d.vel = (t - tRef.current) / Math.max(0.001, (now - d.tp) / 1000)
    d.tp = now
    tRef.current = t
    applyTurn(t)
  }

  const endDrag = () => {
    const d = dragRef.current
    if (!d) return
    dragRef.current = null
    if (!turnRef.current) return
    if (d.moved < 6) {
      commit()
      return
    }
    if (tRef.current > 0.42 || d.vel > 1.1) commit()
    else cancel()
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
          <div className="sb-cast ambient" />
          <div className="sb-cast contact" />
          <div className="sb-cast edge" />

          <div className="sb-tilt">
            <div ref={bookRef} className="sb-book sb-paper">
              {/* the fold, and the sewing running down it */}
              <div className="sb-fold" aria-hidden="true" />
              <div className="sb-seam" aria-hidden="true" />
              <div className="sb-half left">{staticLeft}</div>
              <div className="sb-half right">{staticRight}</div>

              {turn && (
                <div className={`sb-curl ${turn.dir}`} style={{ ['--n' as string]: N }}>
                  <Strip
                    i={0}
                    dir={turn.dir}
                    front={leafFront}
                    back={leafBack}
                    register={(i, el) => {
                      stripsRef.current[i] = el
                    }}
                  />
                </div>
              )}
            </div>
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

/** One link in the strip chain — each strip hosts the next, so rotations compound. */
function Strip({
  i,
  dir,
  front,
  back,
  register,
}: {
  i: number
  dir: Dir
  front: React.ReactNode
  back: React.ReactNode
  register: (i: number, el: HTMLDivElement | null) => void
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
    <div className="sb-strip" ref={(el) => register(i, el)}>
      <div className="sb-face front">
        <div className="sb-slice" style={{ transform: `translateX(${frontShift})` }}>
          {front}
        </div>
        <div className="sh" />
        <div className="gl" />
      </div>
      <div className="sb-face back">
        <div className="sb-slice" style={{ transform: `translateX(${backShift})` }}>
          {back}
        </div>
        <div className="sh" />
        <div className="gl" />
      </div>
      <Strip i={i + 1} dir={dir} front={front} back={back} register={register} />
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
                <span className="font-display text-label tracking-widest opacity-70">{p.mark}</span>
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
