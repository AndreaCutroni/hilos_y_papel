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
│   ├── hero/          # home hero: AnimatedHeadline, PageTurnReveal, Hero
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

`/` is the only designed page. `/quaderni`, `/tipologie`, `/carte`,
`/componi-il-tuo` and `/chi-sono` render `Placeholder` via `pages/stubs.tsx`
and are waiting to be built from the data already sitting in
`content/products.ts`.

`assets/images/chiara.webp` and `assets/images/notebook-blue.webp` are not
imported yet — they are staged for `/chi-sono` and `/quaderni` respectively, so
leave them in place rather than pruning them as unused.

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
  "Hilos" and "Papel" are **bold upright (700)**; the "y" and "Chiara
  Castracane" are **italic (400)**. Both live in `components/Wordmark.tsx`
  (`Wordmark` and `FounderName`) — set them there, not ad hoc.
- **Fraunces** (`--font-display`) for headlines.
- **Nunito** (`--font-sans`) for UI, nav, labels and body.

All three come from Google Fonts, loaded in `index.html`. Use the `--text-*`
scale (`text-h1`, `text-body-lg`, `text-label`…) rather than arbitrary sizes.
Spacing follows an 8px rhythm.

## Conventions

- **Motion**: 200–400ms, ease-out, 8–16px translate distances. The hero page
  turn is the one deliberate exception at 850ms, because a turning page needs
  weight to read as paper rather than as a slide.
- **Reduced motion**: every animation needs a reduced or near-instant variant.
  Use `useReducedMotion()` from `@/lib/useReducedMotion` and branch, plus the
  global `prefers-reduced-motion` block in `index.css`.
- **`.paper-grain`** sets **no `position`** — it relies on the element already
  being positioned (`relative`/`sticky`/`absolute`). If you add it to a static
  element, add `relative` too, or the grain layer will not show. Pair with
  `.paper-grain-dark` on dark surfaces so the grain lightens instead of darkens.
- **Drawing a stitch on**: reveal it with an animated clip wipe, not framer's
  `pathLength`. `pathLength` drives `strokeDasharray` internally and flattens a
  running stitch into a solid rule.
- **Craft elements must be meaningful.** The thread motif and the page turn
  reference how the notebooks are actually made — visible Coptic stitching and
  real pages. Do not add motion or ornament that means nothing.

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
