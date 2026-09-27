# Viktor Nedev — Portfolio

Personal portfolio and booking site. Bilingual (Bulgarian / English), with a
real-time WebGL hero and a self-contained meeting scheduler.

**Live:** https://viktor-nedev.github.io/Viktor_Nedev/

## Stack

- **React 19 + TypeScript**, built with **Vite**
- **Tailwind CSS v4** (CSS-first config — the design tokens live in `src/index.css`)
- **Three.js / React Three Fiber** for the hero scene
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
| `npm run assets:repos` | Refresh the GitHub repo list |

## How it fits together

```
src/
├─ three/        one persistent WebGL canvas, driven by scroll
├─ components/
│  ├─ chrome/    loader, cursor, nav, language toggle, scroll progress
│  ├─ sections/  the page, top to bottom
│  └─ ui/        reveal, tilt, magnetic, counter, lightbox
├─ booking/      calendar maths, mailto and .ics composition
├─ i18n/         typed BG/EN dictionaries
├─ data/         projects, games, skills, generated certificates and repos
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

**Never call `setState` inside `useFrame`.** Scroll and pointer data reach the
3D scenes through refs (`src/three/SceneDirector.tsx`) precisely so the React
tree is not re-rendered every frame.

**Generated files are committed.** `src/data/certificates.generated.ts` and
`repos.generated.ts` are produced by the scripts above and checked in, so the
build needs no network access and visitors never hit the GitHub API.

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
