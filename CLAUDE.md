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
├── assets/images/     # product photography (webp), cropped + graded from the brochure
├── components/
│   ├── hero/          # home hero: AnimatedHeadline, Hero
│   ├── layout/        # Header, Footer, PageTransition
│   ├── motifs/        # ThreadDivider, CopticSeam — the thread motif
│   └── Wordmark.tsx
├── content/           # extracted brochure data, no JSX
│   ├── brand.ts       # voice, story, hero copy, contact, nav
│   └── products.ts    # configurator options, examples, thesis service
├── lib/               # motion variants + reduced-motion hook
├── pages/             # Home + Placeholder + stubs for the five unbuilt routes
├── App.tsx            # routes wrapped in AnimatePresence
└── index.css          # @theme tokens, base layer, paper-grain utility
```

`@/*` is aliased to `src/*` in both `vite.config.ts` and `tsconfig.app.json` —
keep the two in sync.

## Routes

`/` and `/chi-sono` are built. `/quaderni`, `/tipologie`, `/carte` and
`/componi-il-tuo` render `Placeholder` via `pages/stubs.tsx` and are waiting to
be built from the data already sitting in `content/products.ts`.

`assets/images/notebook-blue.webp` is not imported yet — it is staged for
`/quaderni`, so leave it in place rather than pruning it as unused.

### The sketchbook on `/chi-sono`

Nine plates, each a spread: the drawing on the verso, the note on the recto.
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
`.sb-fold` shades the gutter and `.sb-seam` runs the stitching down it.

The turning leaf is a chain of **nested** strips (`components/sketchbook` +
the `@layer components` block in `index.css`). Each strip is a child of the one
before it so rotations compound, which is what traces the curve. Two details are
easy to get wrong and both show up as hard vertical seams:

- The sheen (`.gl`) must be a **flat tint per strip**, never a gradient — a
  gradient restarts at every strip boundary and bands the whole leaf.
- The trough shading (`.sh`) runs `--a1 → --a2` on front faces and
  `--a2 → --a1` on back faces, because a back face is mirrored.

The arc is driven per frame by writing `--tt`, `--td` and `--shade` straight to
the DOM from `Sketchbook.tsx`; React does not re-render while a page is in
flight. Under `prefers-reduced-motion` the leaf snaps rather than springs.

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
sand any further will break AA.** Re-run the audit whenever a colour changes.
The accent is reserved for details — hover/focus, small highlights, button fills
— never large background fills; brick as the header and footer surface is the
one intended large use.

Typography:

- **Amiri** (`--font-wordmark`) for the wordmark and the founder's name only.
  It is **italic throughout**: "Hilos" and "Papel" bold (700), the "y" and
  "Chiara Castracane" regular (400). Set it in `components/Wordmark.tsx`, never
  ad hoc.
  `BrandLockup` stacks the wordmark over the founder's name, plus the line of
  business when `tagline` is set — the header omits it, the footer shows it.
  Every line is sized so they render to **the same width**; those ratios are
  tuned to these exact strings, so **re-measure in the browser if the wording or
  a typeface changes**. Scale the block with `font-size`; the lines are in `em`.
- **Caveat** (`--font-hand`) for the hero line that writes itself on, and
  nothing else.
- **Fraunces** (`--font-display`) for headlines.
- **Nunito** (`--font-sans`) for UI, nav, labels and body.

All three come from Google Fonts, loaded in `index.html`. Use the `--text-*`
scale (`text-h1`, `text-body-lg`, `text-label`…) rather than arbitrary sizes.
Spacing follows an 8px rhythm.

## Conventions

- **Motion**: 200–400ms, ease-out, 8–16px translate distances — no exceptions.
  The hero once opened with an 850ms page-turn reveal; it was removed at the
  owner's request, so nothing on the site runs long any more. Do not reintroduce
  a load animation over the hero photograph.
- **Reduced motion**: every animation needs a reduced or near-instant variant.
  Use `useReducedMotion()` from `@/lib/useReducedMotion` and branch, plus the
  global `prefers-reduced-motion` block in `index.css`.
- **`.paper-grain`** sets **no `position`** — it relies on the element already
  being positioned (`relative`/`sticky`/`absolute`). If you add it to a static
  element, add `relative` too, or the grain layer will not show. Pair with
  `.paper-grain-dark` on dark surfaces, which swaps in the finer grain tuned for
  brick.
- **The paper fibre texture is colour-neutral on purpose**: it leaves the sand
  background at exactly `#DCC7AF` (measured drift 0.35/255). That depends on
  three things in `index.css` — `color-interpolation-filters: sRGB`, forcing the
  filter's alpha to 1, and centring the noise on mid-grey for `soft-light`. The
  block comment there spells out why each matters. **If you retune the texture,
  re-measure the composited background colour** rather than assuming it held.
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
