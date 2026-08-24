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

Defined in the `@theme` block of `src/index.css`. The palette is **derived from
the brochure** (sampled pixel values) and pushed to a bolder, higher-contrast
treatment — do not invent unrelated colours.

| Token                    | Value     | Role                                  |
| ------------------------ | --------- | ------------------------------------- |
| `--color-paper`          | `#F3EADD` | page background                       |
| `--color-paper-deep`     | `#E9DCC7` | alternating section surface           |
| `--color-wine`           | `#3D1214` | header, footer, dark surfaces         |
| `--color-ink`            | `#2A1614` | body text                             |
| `--color-ink-soft`       | `#63382F` | secondary text                        |
| `--color-accent`         | `#A83820` | accent on light surfaces              |
| `--color-accent-on-dark` | `#D97B57` | accent on `--color-wine`              |
| `--color-thread-maroon`  | `#9D2B42` | thread motif (from the real bindings) |
| `--color-thread-gold`    | `#D9A441` | thread motif                          |
| `--color-thread-navy`    | `#26406B` | thread motif                          |

Verified contrast (WCAG AA needs 4.5:1 for body text):

- ink on paper **14.4:1**, ink on paper-deep **12.7:1**
- ink-soft on paper **8.3:1**, on paper-deep **7.3:1**
- accent on paper **5.4:1**, on paper-deep **4.8:1**
- paper on wine **13.6:1**, accent-on-dark on wine **5.3:1**

**Re-check contrast whenever a colour changes.** The accent is reserved for
details — hover/focus, small highlights, the wordmark's swash `y`, button fills
— never large background fills.

Typography: **Fraunces** (`--font-display`) for headlines and the wordmark,
**Nunito** (`--font-sans`) for UI, nav, labels and body. Both from Google Fonts,
loaded in `index.html`. Use the `--text-*` scale (`text-h1`, `text-body-lg`,
`text-label`…) rather than arbitrary sizes. Spacing follows an 8px rhythm.

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
