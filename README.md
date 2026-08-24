# Hilos y Papel

Website for **Hilos y Papel** — handmade, hand-sewn notebooks by Chiara
Castracane, plus a hand-bound thesis service. The site is in Italian.

Built with Vite, React and TypeScript, styled with Tailwind CSS v4, routed with
react-router-dom and animated with framer-motion.

## Getting started

Requires Node 20.19+ (or 22.12+) and npm.

```bash
npm install
```

```bash
npm run dev
```

The dev server runs at http://localhost:5173.

## Scripts

| Script                 | What it does                       |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Start the dev server on port 5173  |
| `npm run build`        | Type-check and build to `dist/`    |
| `npm run preview`      | Serve the production build locally |
| `npm run lint`         | Run ESLint                         |
| `npm run lint:fix`     | Run ESLint and apply fixes         |
| `npm run format`       | Format with Prettier               |
| `npm run format:check` | Check formatting without writing   |

## Project structure

```
src/
├── assets/images/   Product photography (webp)
├── components/
│   ├── hero/        Home hero — animated headline, photography
│   ├── sketchbook/  The /chi-sono sketchbook — plates, page turn, loupe
│   ├── layout/      Header, Footer, page transitions
│   ├── motifs/      Thread motifs drawn as inline SVG
│   └── Wordmark.tsx
├── content/         Brand copy and product data
├── lib/             Shared motion variants, reduced-motion hook
├── pages/           Home plus placeholders for the unbuilt routes
├── App.tsx          Route definitions
└── index.css        Design tokens (@theme), base styles, paper texture
references/          Brand brochure — source of truth for voice and identity
```

`@/` is aliased to `src/`.

## Routes

| Path              | Status      |
| ----------------- | ----------- |
| `/`               | Built       |
| `/chi-sono`       | Built       |
| `/quaderni`       | Placeholder |
| `/tipologie`      | Placeholder |
| `/carte`          | Placeholder |
| `/componi-il-tuo` | Placeholder |

The data behind the placeholder pages — the notebook configurator options,
worked examples with pricing, and the thesis-binding specification — is already
transcribed in `src/content/products.ts`.

## Design notes

The palette is built on two brand colours, `#853939` (brick) and `#DCC7AF`
(sand), with every other tone derived from them as a tint or shade. Body text
and the accent colour both meet WCAG AA (4.5:1) against their backgrounds; the
ratios are listed in `CLAUDE.md`.

Typefaces, all from Google Fonts: Amiri for the wordmark — bold upright for
"Hilos" and "Papel", italic for the "y" and for Chiara Castracane's name —
Fraunces for headlines, and Nunito for UI and body text.

Motion is deliberately quiet — short, ease-out, small distances — and every
animation has a reduced variant honouring `prefers-reduced-motion`. The thread
motifs reference how the notebooks are genuinely made: the seam traces the
exposed Coptic stitching visible in the product photography.
