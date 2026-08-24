/**
 * Plate sketches for the "Chi sono" sketchbook.
 *
 * Drawn as line art in the brand ink, with thread picked out in the bordeaux of
 * the real bindings. Every plate shows a step or a material the brochure
 * actually describes — folding, piercing, the exposed Coptic chain, the fantasy
 * papers — rather than decorative filler.
 *
 * All share the same 400x320 stage so a plate can be swapped without relayout.
 */

const INK = 'var(--color-ink)'
const THREAD = 'var(--color-thread-maroon)'
const BRICK = 'var(--color-brick)'

type SketchProps = { className?: string }

const stage = {
  viewBox: '0 0 400 320',
  fill: 'none' as const,
  xmlns: 'http://www.w3.org/2000/svg',
}

/** Shared line style — a steady technical hand rather than a wobbly doodle. */
const line = {
  stroke: INK,
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}
const hair = { ...line, strokeWidth: 1, opacity: 0.55 }
const thread = {
  stroke: THREAD,
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/* I — the thread that leaves the spool and becomes a street */
export function PlateArgentina({ className }: SketchProps) {
  return (
    <svg {...stage} className={className} aria-hidden="true">
      {/* spool */}
      <ellipse cx={70} cy={232} rx={30} ry={9} {...line} />
      <path d="M40 232v-42M100 232v-42" {...line} />
      <ellipse cx={70} cy={190} rx={30} ry={9} {...line} />
      <path d="M48 226c8-6 36-6 44 0M48 214c8-6 36-6 44 0M48 202c8-6 36-6 44 0" {...hair} />
      {/* the thread unwinding into a road */}
      <path
        d="M70 190c2-26 22-38 48-40 30-2 44 14 42 32-2 20-26 26-40 16-12-9-6-26 10-28 26-3 44 12 58 30"
        {...thread}
      />
      <path d="M188 200c16 18 40 22 66 14" {...thread} strokeDasharray="1 9" />
      {/* facades along the street */}
      <path d="M236 168h34v58h-34z" {...line} />
      <path d="M270 150h30v76h-30z" {...line} />
      <path d="M300 176h36v50h-36z" {...line} />
      <path d="M243 180h8v10h-8zM257 180h8v10h-8zM278 164h8v11h-8zM310 190h9v11h-9z" {...hair} />
      <path d="M236 168l17-16 17 16M300 176l18-15 18 15" {...line} />
      <path d="M220 226h124" {...line} strokeWidth={1.2} opacity={0.7} />
    </svg>
  )
}

/* II — the needle taking its first pass through a folded signature */
export function PlateSedici({ className }: SketchProps) {
  return (
    <svg {...stage} className={className} aria-hidden="true">
      {/* an open signature seen from the fold */}
      <path d="M200 96c-38 14-74 26-112 34v98c38-8 74-20 112-34z" {...line} />
      <path d="M200 96c38 14 74 26 112 34v98c-38-8-74-20-112-34z" {...line} />
      <path d="M200 96v98" {...line} strokeWidth={2} />
      <path
        d="M196 108c-30 11-60 21-92 28M196 128c-30 11-60 21-92 28M204 108c30 11 60 21 92 28M204 128c30 11 60 21 92 28"
        {...hair}
      />
      {/* thread through the fold */}
      <path d="M200 120c-14 6-14 18 0 24s14 18 0 24" {...thread} />
      <circle cx={200} cy={120} r={2.6} fill={THREAD} />
      <circle cx={200} cy={168} r={2.6} fill={THREAD} />
      {/* the needle */}
      <path d="M244 78l-40 40" {...line} strokeWidth={2.4} />
      <path d="M244 78l14-14" {...line} strokeWidth={3.2} />
      <ellipse cx={261} cy={61} rx={4.5} ry={3} {...line} transform="rotate(-45 261 61)" />
      <path d="M258 64c14-6 26-2 32 8" {...thread} strokeWidth={1.8} />
    </svg>
  )
}

/* III — the three times the brochure names: conceiving, choosing, making */
export function PlateTempo({ className }: SketchProps) {
  return (
    <svg {...stage} className={className} aria-hidden="true">
      {/* flat sheet */}
      <path d="M24 118h96v84H24z" {...line} />
      <path d="M38 138h68M38 154h68M38 170h48" {...hair} />
      {/* folded */}
      <path d="M152 118h96v84h-96z" {...line} opacity={0.25} />
      <path d="M152 118h96l-48 32z" {...line} />
      <path d="M152 118v84l48-52z" {...line} />
      <path d="M248 118v84l-48-52z" {...line} />
      <path d="M200 150v52" {...line} strokeWidth={2} />
      {/* sewn */}
      <path d="M280 118h96v84h-96z" {...line} />
      <path d="M328 118v84" {...line} strokeWidth={2} />
      <path d="M292 130h72M292 146h72M292 162h72M292 178h72" {...hair} />
      <path
        d="M328 128c-10 5-10 13 0 18s10 13 0 18 10 13 0 18"
        {...thread}
        transform="translate(0 2)"
      />
      {[128, 146, 164, 182].map((y) => (
        <circle key={y} cx={328} cy={y} r={2.4} fill={THREAD} />
      ))}
      {/* the arc of time passing over the three stages */}
      <path d="M52 96c60-32 236-32 296 0" {...hair} strokeDasharray="2 8" />
      <path d="M340 90l8 6-8 7" {...hair} />
      <text
        x={200}
        y={246}
        textAnchor="middle"
        fill={INK}
        opacity={0.6}
        style={{ font: 'italic 15px var(--font-display)' }}
      >
        ideazione · scelta · realizzazione
      </text>
    </svg>
  )
}

/* IV — the bone folder running a crease home */
export function PlatePiega({ className }: SketchProps) {
  return (
    <svg {...stage} className={className} aria-hidden="true">
      {/* sheet, half of it lifted off the table */}
      <path d="M56 214h150l84-46H140z" {...line} />
      <path d="M206 214l84-46" {...line} strokeWidth={2} />
      <path d="M206 214c34-22 42-56 30-90-18 4-40 18-52 34" {...line} />
      <path d="M184 158c22-6 44-2 58 10" {...hair} />
      <path d="M192 138c18-6 36-4 50 6" {...hair} />
      {/* bone folder */}
      <path d="M262 92c22-10 44-4 52 12 6 12-2 22-14 20-14-2-20-16-38-32z" {...line} />
      <path d="M270 100c16-4 30 0 36 10" {...hair} />
      {/* the crease it is making */}
      <path d="M206 214l52-58" {...thread} strokeWidth={1.8} strokeDasharray="10 7" />
    </svg>
  )
}

/* V — piercing the sewing stations along the fold */
export function PlateForatura({ className }: SketchProps) {
  return (
    <svg {...stage} className={className} aria-hidden="true">
      {/* the fold seen edge-on */}
      <path d="M60 210c60-24 220-24 280 0" {...line} />
      <path d="M60 210c60-18 220-18 280 0" {...hair} />
      <path d="M60 210v18c60-24 220-24 280 0v-18" {...line} />
      {/* stations */}
      {[104, 152, 200, 248, 296].map((x, i) => (
        <g key={x}>
          <ellipse
            cx={x}
            cy={200 + (i === 2 ? -2 : Math.abs(i - 2) * 2)}
            rx={3.4}
            ry={2.4}
            fill={INK}
          />
          <path d={`M${x} ${182 + Math.abs(i - 2) * 2}v${12}`} {...hair} strokeDasharray="2 4" />
        </g>
      ))}
      {/* awl */}
      <path d="M200 176V96" {...line} strokeWidth={2.2} />
      <path d="M188 96c0-16 24-16 24 0z" {...line} />
      <path d="M186 96h28l-4 34h-20z" {...line} />
      <path d="M192 108h16M192 118h16" {...hair} />
      {/* spacing guide */}
      <path d="M104 244h192" {...hair} />
      {[104, 152, 200, 248, 296].map((x) => (
        <path key={x} d={`M${x} 239v10`} {...hair} />
      ))}
    </svg>
  )
}

/* VI — the exposed Coptic chain, the binding the brochure photographs */
export function PlateCopta({ className }: SketchProps) {
  const rows = [96, 124, 152, 180, 208]
  const L = 148
  const R = 252
  return (
    <svg {...stage} className={className} aria-hidden="true">
      {/* the stack of signature edges */}
      {rows.map((y) => (
        <g key={y}>
          <path d={`M92 ${y}h216`} {...line} strokeWidth={1.3} />
          <path d={`M92 ${y + 8}h216`} {...hair} />
        </g>
      ))}
      {/* boards top and bottom */}
      <path d="M92 78h216v10H92z" {...line} />
      <path d="M92 226h216v10H92z" {...line} />
      {/* the chain: each pair of signatures linked by a crossing */}
      {rows.slice(0, -1).map((y, i) => {
        const n = rows[i + 1]
        return (
          <g key={y}>
            <path d={`M${L} ${y}L${R} ${n}`} {...thread} />
            <path d={`M${R} ${y}L${L} ${n}`} {...thread} />
          </g>
        )
      })}
      {/* thread surfacing at each station */}
      {rows.map((y) => (
        <g key={`k${y}`}>
          <circle cx={L} cy={y} r={3.4} fill={THREAD} />
          <circle cx={R} cy={y} r={3.4} fill={THREAD} />
        </g>
      ))}
      {/* the tails into the boards */}
      <path d={`M${L} 96V84M${R} 96V84M${L} 208v12M${R} 208v12`} {...thread} strokeWidth={1.8} />
    </svg>
  )
}

/* VII — fantasy papers, laid up the way the patchwork covers are */
export function PlateCarte({ className }: SketchProps) {
  const sheets = [
    { x: 60, y: 92, w: 104, h: 74, r: -4 },
    { x: 148, y: 74, w: 112, h: 80, r: 3 },
    { x: 232, y: 104, w: 100, h: 76, r: -2 },
    { x: 104, y: 156, w: 116, h: 78, r: 2 },
    { x: 204, y: 168, w: 106, h: 72, r: -3 },
  ]
  return (
    <svg {...stage} className={className} aria-hidden="true">
      {sheets.map((s, i) => (
        <g key={i} transform={`rotate(${s.r} ${s.x + s.w / 2} ${s.y + s.h / 2})`}>
          <rect x={s.x} y={s.y} width={s.w} height={s.h} {...line} />
          {/* deckle edge on one side */}
          <path
            d={`M${s.x} ${s.y}q4 6 0 12t0 12 0 12 0 12 0 12 0 12`}
            {...hair}
            strokeWidth={1.2}
          />
          {/* a different hand-worked motif on each sheet */}
          {i === 0 &&
            [0, 1, 2].map((k) => (
              <path key={k} d={`M${s.x + 14} ${s.y + 18 + k * 20}h${s.w - 28}`} {...hair} />
            ))}
          {i === 1 && (
            <>
              <path
                d={`M${s.x + 18} ${s.y + 40}h${s.w - 36}M${s.x + s.w / 2} ${s.y + 16}v${s.h - 32}`}
                stroke={BRICK}
                strokeWidth={1.6}
                opacity={0.75}
              />
            </>
          )}
          {i === 2 &&
            [0, 1, 2, 3].map((k) => (
              <circle
                key={k}
                cx={s.x + 22 + (k % 2) * 46}
                cy={s.y + 24 + Math.floor(k / 2) * 32}
                r={9}
                {...hair}
              />
            ))}
          {i === 3 &&
            [0, 1, 2, 3, 4].map((k) => (
              <path
                key={k}
                d={`M${s.x + 12 + k * 20} ${s.y + 14}l14 ${s.h - 28}`}
                {...hair}
                strokeWidth={1.2}
              />
            ))}
          {i === 4 &&
            [0, 1, 2].map((k) => (
              <path
                key={k}
                d={`M${s.x + 16} ${s.y + 20 + k * 18}q18 -10 36 0t36 0`}
                stroke={THREAD}
                strokeWidth={1.4}
                fill="none"
                opacity={0.7}
              />
            ))}
        </g>
      ))}
    </svg>
  )
}

/* VIII — the two ways to a cover: patterned, or drawn for one person */
export function PlateCopertina({ className }: SketchProps) {
  return (
    <svg {...stage} className={className} aria-hidden="true">
      {/* Fantasia — squares of worked paper */}
      <rect x={44} y={84} width={140} height={160} {...line} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}${c}`}
            x={58 + c * 40}
            y={98 + r * 48}
            width={32}
            height={38}
            {...hair}
            fill={c % 2 === r % 2 ? BRICK : 'none'}
            fillOpacity={c % 2 === r % 2 ? 0.16 : 0}
          />
        ))
      )}
      <path d="M52 84v160" {...thread} strokeWidth={1.6} strokeDasharray="9 6" />
      <text
        x={114}
        y={266}
        textAnchor="middle"
        fill={INK}
        opacity={0.6}
        style={{ font: '600 12px var(--font-sans)', letterSpacing: '0.12em' }}
      >
        FANTASIA
      </text>

      {/* Personalizzato — an illustration made for one person */}
      <rect x={216} y={84} width={140} height={160} {...line} />
      <path d="M224 84v160" {...thread} strokeWidth={1.6} strokeDasharray="9 6" />
      {/* a drawn subject, sketched not stamped */}
      <path d="M250 190c8-28 22-46 36-46s28 18 36 46" {...line} />
      <circle cx={286} cy={128} r={16} {...line} />
      <path d="M270 132c8-6 24-6 32 0" {...hair} />
      <path d="M256 208h60" {...hair} />
      <text
        x={286}
        y={230}
        textAnchor="middle"
        fill={INK}
        opacity={0.55}
        style={{ font: 'italic 14px var(--font-wordmark)' }}
      >
        il tuo nome
      </text>
      <text
        x={286}
        y={266}
        textAnchor="middle"
        fill={INK}
        opacity={0.6}
        style={{ font: '600 12px var(--font-sans)', letterSpacing: '0.12em' }}
      >
        PERSONALIZZATO
      </text>
    </svg>
  )
}

/* IX — a bound thesis, standing, spine to the viewer */
export function PlateTesi({ className }: SketchProps) {
  const stations = [110, 138, 166, 194, 222]
  return (
    <svg {...stage} className={className} aria-hidden="true">
      {/* the block, seen at a slight angle */}
      <path d="M150 78h104v180H150z" {...line} />
      <path d="M150 78l-38 22v180l38-22z" {...line} />
      <path d="M254 78l24 14v180l-24-14z" {...line} />
      {/* leaves */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M112 ${112 + i * 24}l38-22`} {...hair} />
      ))}
      {/* the sewn spine */}
      {stations.map((y) => (
        <g key={y}>
          <circle cx={150} cy={y} r={3} fill={THREAD} />
          <circle cx={254} cy={y} r={3} fill={THREAD} />
        </g>
      ))}
      {stations.slice(0, -1).map((y, i) => (
        <g key={y}>
          <path d={`M150 ${y}L254 ${stations[i + 1]}`} {...thread} strokeWidth={1.9} />
          <path d={`M254 ${y}L150 ${stations[i + 1]}`} {...thread} strokeWidth={1.9} />
        </g>
      ))}
      {/* title panel */}
      <path d="M172 96h60v22h-60z" {...hair} />
      <path d="M180 130h44M180 142h44" {...hair} strokeWidth={1.2} />
    </svg>
  )
}
