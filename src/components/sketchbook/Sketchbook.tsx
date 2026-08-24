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
const MAG = 2.1
const ZOOM_MIN = 0.9
const ZOOM_MAX = 1.6
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
  const [zoom, setZoom] = useState(1)
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

  /* ----------------------------------------------------------- loupe */
  const loupeRef = useRef<HTMLDivElement>(null)
  const zoomWrapRef = useRef<HTMLDivElement>(null)
  const zoomInnerRef = useRef<HTMLDivElement>(null)
  const posRef = useRef<{ x: number; y: number } | null>(null)
  const grabRef = useRef<{ cx: number; cy: number; x0: number; y0: number } | null>(null)
  const [loupeOn, setLoupeOn] = useState(true)

  const loupeSize = () => {
    const w = bookRef.current?.clientWidth ?? 600
    return Math.round(Math.max(130, Math.min(230, w * 0.24)))
  }

  const placeLoupe = useCallback(() => {
    const book = bookRef.current
    const lo = loupeRef.current
    const wrap = zoomWrapRef.current
    const inner = zoomInnerRef.current
    const p = posRef.current
    if (!book || !lo || !wrap || !inner || !p) return
    const bw = book.clientWidth
    const bh = book.clientHeight
    if (!bw) return
    const R = loupeSize() / 2
    lo.style.setProperty('--lr', R * 2 + 'px')
    lo.style.transform = `translate3d(${(p.x - R).toFixed(1)}px,${(p.y - R).toFixed(1)}px,0)`
    /* the magnified copy has to match the book it mirrors */
    inner.style.width = bw + 'px'

    /* how far inside the paper the glass is, so it fades as it wanders off */
    const cx = bw / 2
    const cy = bh / 2
    const z = zoom
    const x0 = cx + (0 - cx) * z
    const x1 = cx + (bw - cx) * z
    const y0 = cy + (0 - cy) * z
    const y1 = cy + (bh - cy) * z
    const nx = Math.max(x0, Math.min(p.x, x1))
    const ny = Math.max(y0, Math.min(p.y, y1))
    const inside =
      p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1
        ? Math.min(p.x - x0, x1 - p.x, p.y - y0, y1 - p.y)
        : -Math.hypot(p.x - nx, p.y - ny)
    const k = Math.max(0, Math.min(1, (inside + R * 0.3) / (R * 0.55)))
    const vis = loupeOn && !turnRef.current ? k : 0
    wrap.style.opacity = vis.toFixed(3)
    if (vis <= 0.002) return
    const r = (R - R * 0.075).toFixed(1)
    const mask = `radial-gradient(circle ${r}px at ${p.x.toFixed(1)}px ${p.y.toFixed(1)}px,#000 calc(100% - 1px),transparent 100%)`
    wrap.style.webkitMaskImage = mask
    wrap.style.maskImage = mask
    /* magnify about the point under the glass, so it stays put */
    const px = cx + (p.x - cx) / z
    const py = cy + (p.y - cy) / z
    const s = MAG * z
    inner.style.transform = `translate(${(p.x - px * s).toFixed(1)}px,${(p.y - py * s).toFixed(1)}px) scale(${s.toFixed(4)})`
  }, [zoom, loupeOn])

  /* park the glass on the lower right once the book has a size */
  useLayoutEffect(() => {
    const book = bookRef.current
    if (!book || posRef.current) return
    const set = () => {
      const b = bookRef.current
      if (!b || !b.clientWidth) return
      /* parked over the drawing, so the glass has something to show */
      posRef.current = { x: b.clientWidth * 0.3, y: b.clientHeight * 0.56 }
      placeLoupe()
    }
    set()
    const ro = new ResizeObserver(set)
    ro.observe(book)
    return () => ro.disconnect()
  }, [placeLoupe])

  useEffect(() => {
    placeLoupe()
  }, [placeLoupe, idx, turn, zoom])

  /* the leaf sweeps the glass aside rather than turning underneath it */
  const shoveLoupe = (dir: Dir) => {
    const book = bookRef.current
    const p = posRef.current
    if (!book || !p || grabRef.current) return
    p.x = book.clientWidth * (dir === 'next' ? 0.16 : 0.84)
    p.y = book.clientHeight * 0.8
    placeLoupe()
  }

  const onLoupeDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !posRef.current) return
    e.preventDefault()
    e.stopPropagation()
    setHintGone(true)
    grabRef.current = { cx: e.clientX, cy: e.clientY, x0: posRef.current.x, y0: posRef.current.y }
    loupeRef.current?.classList.add('held')
    loupeRef.current?.setPointerCapture(e.pointerId)
  }
  const onLoupeMove = (e: React.PointerEvent) => {
    const g = grabRef.current
    const p = posRef.current
    const book = bookRef.current
    if (!g || !p || !book) return
    p.x = Math.max(-40, Math.min(book.clientWidth + 40, g.x0 + (e.clientX - g.cx)))
    p.y = Math.max(-40, Math.min(book.clientHeight + 40, g.y0 + (e.clientY - g.cy)))
    placeLoupe()
  }
  const onLoupeUp = () => {
    grabRef.current = null
    loupeRef.current?.classList.remove('held')
  }

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
    if (target.closest('.sb-loupe') || target.closest('button')) return
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
    shoveLoupe(dir)
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
        <Controls
          idx={idx}
          turn={turn}
          zoom={zoom}
          setZoom={setZoom}
          step={step}
          loupeOn={false}
          setLoupeOn={setLoupeOn}
          showGlass={false}
          showZoom={false}
        />
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
        className="relative touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDragStart={(e) => e.preventDefault()}
      >
        <div ref={hostRef} className="sb-3d relative mx-auto w-full max-w-4xl">
          <div className="sb-cast ambient" />
          <div className="sb-cast contact" />

          <div className="sb-tilt" style={{ ['--zoom' as string]: zoom }}>
            <div
              ref={bookRef}
              className="sb-book bg-paper-lift shadow-[0_1px_0_rgba(46,26,24,0.18)]"
            >
              <div className="sb-half left">
                {staticLeft}
                <div className="sb-gutter left" />
              </div>
              <div className="sb-half right">
                {staticRight}
                <div className="sb-gutter right" />
              </div>

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

          {/* the magnified copy of the resting spread, seen through the glass */}
          <div ref={zoomWrapRef} className="sb-zoomwrap" style={{ opacity: 0 }}>
            {/* width is set from placeLoupe, which runs after layout */}
            <div ref={zoomInnerRef} className="sb-zoominner">
              <div className="sb-book bg-paper-lift">
                <div className="sb-half left">{flat.left}</div>
                <div className="sb-half right">{flat.right}</div>
              </div>
            </div>
          </div>

          {loupeOn && (
            <div
              ref={loupeRef}
              className="sb-loupe"
              onPointerDown={onLoupeDown}
              onPointerMove={onLoupeMove}
              onPointerUp={onLoupeUp}
              onPointerCancel={onLoupeUp}
              role="img"
              aria-label="Lente d’ingrandimento, trascinabile sulla pagina"
            >
              <div className="rim" />
              <div className="shine" />
            </div>
          )}
        </div>
      </div>

      <Controls
        idx={idx}
        turn={turn}
        zoom={zoom}
        setZoom={setZoom}
        step={step}
        loupeOn={loupeOn}
        setLoupeOn={setLoupeOn}
        showGlass
        showZoom
      />

      <p
        className={`mt-4 text-center text-label text-ink-soft transition-opacity duration-300 ${
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

/** Pager, glass toggle and zoom — shared by the spread and the stacked card. */
function Controls({
  idx,
  turn,
  zoom,
  setZoom,
  step,
  loupeOn,
  setLoupeOn,
  showGlass,
  showZoom,
}: {
  idx: number
  turn: Turn | null
  zoom: number
  setZoom: React.Dispatch<React.SetStateAction<number>>
  step: (d: Dir) => void
  loupeOn: boolean
  setLoupeOn: React.Dispatch<React.SetStateAction<boolean>>
  showGlass: boolean
  /** The stacked card has no magnification, so it hides the zoom pair. */
  showZoom: boolean
}) {
  return (
    <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-1">
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

      <div className="flex items-center gap-1">
        {showGlass && (
          <ToolButton
            label={loupeOn ? 'Nascondi la lente' : 'Mostra la lente'}
            onClick={() => setLoupeOn((v) => !v)}
            pressed={loupeOn}
          >
            <circle cx="9" cy="9" r="5.2" />
            <path d="M12.8 12.8L17 17" />
          </ToolButton>
        )}
        {showZoom && (
          <>
            <ToolButton
              label="Riduci"
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - 0.1).toFixed(2)))}
            >
              <path d="M5 10h10" />
            </ToolButton>
            <span className="min-w-[3.5rem] text-center text-label text-ink-soft tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <ToolButton
              label="Ingrandisci"
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + 0.1).toFixed(2)))}
            >
              <path d="M10 5v10M5 10h10" />
            </ToolButton>
          </>
        )}
      </div>
    </div>
  )
}

/** The editorial index; jumping is the keyboard-and-screen-reader route through
 *  the book, so it carries the same nine plates in the same order. */
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
