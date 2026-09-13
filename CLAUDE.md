# Hilos y Papel — website

Marketing site for **Hilos y Papel**, the handmade-bookbinding brand of Chiara
Castracane: hand-sewn notebooks (_quaderni fatti a mano_) plus a hand-bound
thesis service (_Rilegatura Tesi_).

**The brand name is always spelled "Hilos y Papel"** — in code, filenames,
metadata and copy. Never "Hylos".

**Site language is Italian.** All user-facing copy is Italian. Use typographic
apostrophes (`’`, U+2019) rather than straight quotes — `dell’Argentina`, not
`dell'Argentina`.

## Tech stack

| Concern       | Choice                                  |
| ------------- | --------------------------------------- |
| Build         | Vite                                    |
| UI            | React 19 + TypeScript                   |
| Styling       | Tailwind CSS v4 via `@tailwindcss/vite` |
| Routing       | react-router-dom                        |
| Animation     | framer-motion                           |
| Lint / format | ESLint (flat config) + Prettier         |
| Packages      | npm                                     |

**Runtime dependencies are deliberately limited to React, Tailwind,
react-router-dom and framer-motion.** Do not add a UI kit, an icon package, an
extra animation library, or MDX. Icons and motifs are hand-written inline SVG.

Tailwind v4 is configured **CSS-first**: there is no `tailwind.config.js`.
Design tokens live in the `@theme` block in `src/index.css`.

## Commands

```bash
npm run dev           # dev server on :5173
npm run build         # tsc -b && vite build
npm run preview       # serve the production build
npm run lint          # eslint .
npm run lint:fix      # eslint . --fix
npm run format        # prettier --write
npm run format:check  # prettier --check
```

## Folder structure

```
src/
├── assets/
│   ├── images/        # photography cropped + graded from the brochure (webp)
│   └── quaderni/      # the catalogue: one folder per notebook, see LEGGIMI.md there
├── components/
│   ├── hero/          # home hero: AnimatedHeadline, Hero
│   ├── layout/        # Header, Footer, PageTransition
│   ├── motifs/        # ThreadDivider, CopticSeam — the thread motif
│   ├── sketchbook/    # /chi-sono: Sketchbook, SketchPage, PlateCard, plates
│   ├── BrandMark.tsx  # round photo + lockup, shared by header and footer
│   ├── socials.ts     # the footer's contact links (glyphs in SocialLinks.tsx)
│   └── Wordmark.tsx
├── content/           # extracted brochure data, no JSX
│   ├── brand.ts       # voice, story, hero copy, contact, nav
│   ├── products.ts    # configurator options, examples, thesis service
│   ├── quaderni.ts    # loads the catalogue from the notebook folders
│   └── sketchbook.ts  # the /chi-sono plates
├── lib/               # motion variants, hooks (reduced motion, media query), handwriting
├── pages/             # Home, Quaderni, Quaderno, ChiSono, Placeholder + stubs
├── App.tsx            # routes wrapped in AnimatePresence
└── index.css          # @theme tokens, fluid root, .chrome, sketchbook leaf + paper
```

`@/*` is aliased to `src/*` in both `vite.config.ts` and `tsconfig.app.json` —
keep the two in sync.

## Routes

`/`, `/quaderni`, `/quaderni/:slug` and `/chi-sono` are built. `/tipologie`,
`/carte` and `/componi-il-tuo` render `Placeholder` via `pages/stubs.tsx` and
are waiting to be built from the data already sitting in `content/products.ts`.

### The catalogue on `/quaderni`

The catalogue is the folder `src/assets/quaderni/`, one sub-folder per
notebook, read by `content/quaderni.ts` through `import.meta.glob` — no script,
no generated file; the owner asked for exactly that. A folder holds
`quaderno.json` (the details), `cover1.*` (the grid photo), `cover2.*` (the one
that fades in on hover, optional) and `images/` (the notebook page's gallery,
in file-name order, named `01-<slug>`, `02-<slug>`…). The folder name is the
URL. The owner's guide, in Italian,
is `src/assets/quaderni/LEGGIMI.md`. The camera originals in
`references/images/quaderni/` are only the archive today's photos came from;
nothing reads them.

- **The site resizes nothing** — an image library would be a new dependency.
  Photos go in at web size: covers about 1000px square, gallery photos about
  1600px on the long side. In dev, `/quaderni` asks the dev server for every
  photo's size and flags anything over `PESO_MASSIMO` (1 MB).
- **`python scripts/converti-foto.py [slug]` is an optional helper** (Pillow,
  outside npm). It converts `cover1`, `cover2` and `images/*` laid out in
  `references/images/quaderni/<slug>/` into WebP at those sizes, in the
  matching `src/assets/quaderni/<slug>/`. Loose files there — the camera
  originals — are left alone, a WebP newer than its source is skipped, and
  nothing in `src` is ever deleted. The site never depends on it.
- **A sheet's values are the owner's** — never guess `tipologia`, `formato` or
  `personalizzato` from a photo, and never write a `descrizione` for them.
- **A broken folder stays off the site.** A bad `quaderno.json`, or no photo at
  all, keeps the notebook out; `problemiQuaderni` says why, and also flags what
  is only odd (photos outside `images/`, a missing `cover1`, a folder name that
  is not URL-safe). `/quaderni` shows that list in dev only.
- **Personalizzato is always rigido** — the brochure prints illustrated covers
  on board. The grid explains that empty filter combination rather than just
  showing nothing, and the dev list flags a sheet that says otherwise.
- **A5 orizzontale** exists in the catalogue but not in the brochure's format
  list. "Componine uno simile" opens `/componi-il-tuo` with `genere`,
  `tipologia` and `formato` in the query string; the configurator will have to
  read them and cope with `a5-orizzontale`.
- Filters live in the query string, so a filtered grid can be shared and
  survives the back button. Grid covers are cropped square; the gallery on
  `/quaderni/:slug` contains each photo and never crops it. `cover2` is only
  rendered where a real hover exists.

### The sketchbook on `/chi-sono`

Seven plates, each a spread: the drawing on the verso, the note on the recto.
The heading above the book spells out the count ("Sette tavole sul mestiere"),
so change it whenever a plate is added or removed.
Content lives in `content/sketchbook.ts` and is transcribed from the brochure;
the drawings in `components/sketchbook/plates.tsx` are original line art of
steps the brochure actually describes. Keep both true to the brochure — no
invented process detail, no clip art.

Two presentations, chosen by `useMediaQuery('(min-width: 768px)')`:

- **≥768px** — the dragged spread with the curling leaf, arrows beside the
  pages, and a counter beneath.
- **<768px** — `PlateCard`, the plate stacked in one column with a quiet
  crossfade. A two-page spread cannot hold this much type at phone width.

**The paper texture lives here and nowhere else.** `.sb-paper` / `.sb-face`
carry the fibre; it is colour-neutral by construction (sRGB filter
interpolation, alpha forced opaque, noise centred on mid-grey for `soft-light`),
so the sheet stays exactly `--color-paper-lift`. Re-measure if you retune it.
The binding: **each page carries its own fall into the fold** — lit crest,
slope and crease (`.sb-page-fold`, added by `SketchPage`) — so the shading turns
with the paper. Never lay it over the spine: the leaf covers it the moment a
turn starts and uncovers it as the leaf lands, which reads as the binding
blinking. The Coptic thread (`.sb-sewing`, stations in `STATIONS`) does stay at
the spine, lifted 1.5px in z so the leaf's root never hides it. `.sb-block`
shows the stacked page edges along the foot. The corners are rounded by
`--sb-r`, and the turning leaf's free edge is rounded to match.

The turning leaf is a chain of **nested** strips (`components/sketchbook` +
the `@layer components` block in `index.css`). Each strip is a child of the one
before it so rotations compound, which is what traces the curve. Its shape and
light live in `leaf.ts`, apart from React:

- **The free edge leads**, with most of the bend near the spine, like a page
  pulled by its edge; the bend peaks with the leaf upright. A drag inverts that
  shape so the edge follows the hand, and a release hands the hand's speed to
  the spring, so nothing stops and restarts.
- **Light is a gradient per face between the values at the strip's two edges**,
  which neighbours share, so the leaf shades as one sheet. Never a flat tint per
  strip (it bands) and never the same gradient in every strip (it saws). A back
  face is mirrored, so its stops run the other way.
- **Every per-frame value is written onto the element that uses it**: each
  strip's rotation, each face's light, the shadows' fade and slide. Never an
  inherited custom property — that restyles every copy of the page inside the
  leaf on every frame, which is what made the turn stutter (in a headless trace,
  one turn went from 130 ms of style recalc and 1.2 s of raster to 19 ms and
  0.24 s).
- The shadow the leaf throws past its free edge (`.sb-band`) and the dimming
  at the spine (`.sb-occl`) are painted once, then only faded and slid.
- Faces overlap by 1.1px on their **right** side in both directions. Measured:
  on the left, a backward turn shows a light line at every hinge.
- `EYE` in `leaf.ts` must match the perspective on `.sb-3d` (1.95 book widths,
  3.9 pages), or the shadow band drifts off the leaf's edge.
- **Nothing on `.sb-book` may flatten 3D** — no `isolation`, `overflow`,
  `opacity`, `filter`, `clip-path` or blend mode. Any one of them silently makes
  the book flat: the leaf loses its perspective and is painted over the binding
  by z-index instead of sorted by depth, so the thread vanishes mid-turn. The
  paper and its texture sit on `.sb-sheet`, a child, for exactly this reason.

A turn from the arrows is a 0.64s eased glide; a released drag settles on a
critically damped spring. It is the one motion on the site allowed past 400ms,
because it follows the hand. Under `prefers-reduced-motion` there is no leaf at
all: the plate simply changes.

## Design tokens

Defined in the `@theme` block of `src/index.css`. The palette is built on **two
brand colours — `#853939` (brick) and `#DCC7AF` (sand)**. Every other tone is a
tint or shade of those two; do not introduce an unrelated hue.

| Token                   | Value     | Role                                  |
| ----------------------- | --------- | ------------------------------------- |
| `--color-paper`         | `#DCC7AF` | page background (sand)                |
| `--color-paper-lift`    | `#E9DCCA` | lighter alternating section surface   |
| `--color-brick`         | `#853939` | header, footer, buttons               |
| `--color-brick-deep`    | `#5E2727` | button hover                          |
| `--color-ink`           | `#2E1A18` | body text                             |
| `--color-ink-soft`      | `#63382F` | secondary text                        |
| `--color-accent`        | `#853939` | accent on light surfaces (= brick)    |
| `--color-on-brick`      | `#F5EDE1` | text and accents on the brick surface |
| `--color-thread-maroon` | `#7A2033` | thread motif (from the real bindings) |

Verified contrast (WCAG AA needs 4.5:1 for body text, 3:1 for large):

- ink on paper **10.5:1**, on paper-lift **12.2:1**
- ink-soft on paper **6.0:1**, on paper-lift **7.3:1**
- accent/brick on paper **4.9:1**, on paper-lift **5.9:1**
- on-brick on brick **6.9:1**, paper (sand) on brick **4.9:1**

The tightest pairing on the site is brick-on-sand at 4.86:1, which clears the
4.5 bar but leaves little headroom — **darkening the brick or lightening the
sand any further will break AA.** Re-run the audit whenever a colour changes, and make sure it folds in
element `opacity`, not just colour alpha: an `opacity-80` line fades exactly as
much as an `/80` colour, and an audit that reads only `color` passes it — that
is how a 3.7:1 tagline once shipped. **Subdue text with a passing token
(`ink-soft`) or with size, never with `opacity-*`.**
The accent is reserved for details — hover/focus, small highlights, button fills
— never large background fills; brick as the header and footer surface is the
one intended large use.

Typography:

- **Amiri** (`--font-wordmark`) for the wordmark and the founder's name only.
  It is **italic throughout**: "Hilos" and "Papel" bold (700), the "y" and
  "Chiara Castracane" regular (400). Set it in `components/Wordmark.tsx`, never
  ad hoc.
  `BrandLockup` stacks the wordmark over the founder's name, the two lines
  sized to render at **the same width** — tuned to these exact strings, so
  **re-measure in the browser if the wording or a typeface changes**. Scale it
  with `font-size`; the lines are in `em`.
  `BrandMark` (`components/BrandMark.tsx`) sets the round photograph beside the
  lockup and is the **only** way the mark appears: the header and the footer
  both render it, so they cannot drift apart. The footer's line of business
  sits under it, outside the component, so the photograph stays centred on the
  two lines exactly as it is in the header.
- **Caveat** (`--font-hand`) for the hero line that writes itself on, and
  nothing else.
- **Fraunces** (`--font-display`) for headlines.
- **Nunito** (`--font-sans`) for UI, nav, labels and body.

All four come from Google Fonts, loaded in `index.html`. Use the `--text-*`
scale (`text-h1`, `text-body-lg`, `text-label`…) rather than arbitrary sizes.
Spacing follows an 8px rhythm.

## Conventions

- **Motion**: 200–400ms, ease-out, 8–16px translate distances. The one
  exception is the sketchbook's page turn on `/chi-sono`, which follows the
  hand. The hero once opened with an 850ms page-turn reveal; it was removed at
  the owner's request. Do not reintroduce a load animation over the hero
  photograph.
- **Sizing scales with wide screens — except the chrome.** The root
  `font-size` in `index.css` grows from 16px at 1440px to a 24px cap, so
  everything built in `rem` scales together above that width instead of sitting
  in a fixed strip. Size anything that should grow with the layout — type,
  spacing, image caps, icons — in `rem`/`em` or Tailwind's spacing scale, never
  in `px`. `px` is right only for hairlines, radii, shadows and texture tiles.
- **Header and footer do not grow.** The owner wants the bars to keep their
  height on a wide screen and only their distance from the edges to change.
  Their rows carry `.chrome`, which resets them to the reader's default size
  (`medium`) and re-points `--spacing`, `--text-label` and `--text-micro` at it,
  so the Tailwind scale inside them keeps its 16px values. Keep `.chrome` on the
  row _inside_ the `max-w-6xl` column, never on the column itself: the column's
  side padding must keep growing with the page's, or the brand and nav fall out
  of line with the content. Build anything new in the bars from those tokens or
  in `em`, as `BrandMark` does — a raw `rem` there will grow.
- **Reduced motion**: every animation needs a reduced or near-instant variant.
  Use `useReducedMotion()` from `@/lib/useReducedMotion` and branch, plus the
  global `prefers-reduced-motion` block in `index.css`.
- **Drawing a stitch on**: reveal it with an animated clip wipe, not framer's
  `pathLength`. `pathLength` drives `strokeDasharray` internally and flattens a
  running stitch into a solid rule.
- **Craft elements must be meaningful.** The thread motif references how the
  notebooks are actually made — the visible Coptic stitching in the product
  photography. Do not add motion or ornament that means nothing.

## Aesthetic guardrails

Bold, precise, modern-craft — closer to a letterpress broadside than a craft
stall. Explicitly avoid: soft-pastel cottagecore, purple/blue gradients,
glassmorphism, cards nested in cards, rounded-square icon tiles above headings,
gray text on coloured backgrounds, stock "hands crafting" photography, and
needle-and-thread clip art. Real product photography already exists in
`src/assets/images/` — use it.

## Source material

`references/` holds the brand brochure PDF. It is the source of truth for
voice, product structure, palette and photography. Copy in `src/content/` is
transcribed from it — keep edits to punctuation and line breaks, and do not
rewrite the founder's own wording.
