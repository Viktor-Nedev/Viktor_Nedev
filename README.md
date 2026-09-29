# Viktor Nedev — Portfolio

Personal portfolio and booking site. Bilingual (Bulgarian / English), with a
frosted-glass design, a playable ski mini-game, and a self-contained meeting
scheduler.

**Live:** https://viktor-nedev.github.io/Viktor_Nedev/

## Stack

- **React 19 + TypeScript**, built with **Vite**
- **Tailwind CSS v4** (CSS-first config — the design tokens live in `src/index.css`)
- **Canvas 2D** for the Downhill mini-game - no game engine
- **Simple Icons** (CC0) for the skill logos
- **GSAP ScrollTrigger** for scroll-linked animation, **Motion** for state transitions
- **Lenis** for smooth scrolling

## Getting started

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | Types only |
| `npm run assets:certs` | Regenerate certificate images from source files |
| `npm run assets:cv` | Republish the CV and its preview |
| `npm run assets:media` | Encode footage and artwork from `assets-src/media` |

## How it fits together

```
src/
├─ game/         Downhill: pure engine, renderer, input
├─ components/
│  ├─ chrome/    loader, cursor, nav, language toggle, scroll progress
│  ├─ sections/  the page, top to bottom
│  └─ ui/        reveal, tilt, magnetic, counter, lightbox
├─ booking/      calendar maths, mailto and .ics composition
├─ i18n/         typed BG/EN dictionaries
├─ data/         projects, games, skills, resume, generated certificates
└─ lib/          shared helpers
```

### Things worth knowing before changing anything

**Asset paths must go through `asset()`** (`src/lib/asset.ts`). GitHub Pages
serves the site from `/Viktor_Nedev/` while Vercel and the dev server use `/`.
Vite rewrites paths inside imported modules, but not strings built at runtime —
a raw `/certificates/x.webp` works locally and 404s only in production.

**English is the source of truth for copy.** `src/i18n/en.ts` is declared
`as const`, and `bg.ts` is typed against its shape, so a missing or misspelled
Bulgarian key fails the build rather than rendering `undefined`.

**The display font needs Cyrillic.** Half the site is Bulgarian. A face without
Cyrillic glyphs is substituted silently, mid-heading, and the two languages end
up in different typefaces. Verify by rendering, not by trusting a subset list.

**Keep per-frame work out of React state.** The mini-game runs its simulation
and drawing in a rAF loop against refs; React only hears about discrete events
(the HUD at most ten times a second, and the end of a run). The engine in
`src/game/engine.ts` is pure and fixed-timestep, so it plays the same at any
refresh rate.

**The game only claims keys during a run.** Outside one, arrow keys and Space
belong to the page. Keep it that way.

**Scroll-linked animation is GSAP's; everything else is Motion.** Never put
both on one element - they fight over `transform` and `opacity`. The Services
card deal measures with `offsetLeft`/`offsetTop`, not `getBoundingClientRect`,
because on a ScrollTrigger refresh the cards are already transformed.

**Generated files are committed.** `src/data/certificates.generated.ts` and
`media.generated.ts` are produced by the scripts above and checked in, so the
build needs no network access or ffmpeg.

## Deployment

Pushing to `main` builds and publishes via GitHub Actions
(`.github/workflows/deploy.yml`), which sets `VITE_BASE=/Viktor_Nedev/`.

The repository's **Settings → Pages → Source** must be set to **GitHub Actions**.
Left on "Deploy from branch", the workflow succeeds and the site silently never
updates.

The same build also runs on Vercel with no configuration, since `base` defaults
to `/`.

## Updating the CV

Replace `assets-src/Viktor_Nedev_CV.pdf`, then regenerate the public copy and
its preview image:

```bash
npm run assets:cv
```

That writes `public/cv/Viktor-Nedev-CV.pdf` (what visitors download) and
`public/cv/cv-preview.webp` (the page-one thumbnail shown on the site). If the
preview's blur placeholder changes, the script prints the new `lqip` string for
`src/data/site.ts`.
