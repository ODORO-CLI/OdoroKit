---
tags: [frontend, stable]
updated: 2026-09-15
---

# Catalog — Common Components

Files in `src/components/common/` — shared infrastructure that may depend on
providers. Conventions: [[component-conventions]].

## Cookie — `Cookie/`

Self-contained cookie consent system — a bottom-right **banner** plus a full
category **preferences modal**. No third-party library (the old
`react-cookie-consent` dependency was removed). Lives in `src/components/common/Cookie/`.

| File | Role |
|------|------|
| `Cookie.tsx` | Mount component — hydrates the store, renders banner + modal |
| `LazyCookie.tsx` | the framework's dynamic import `ssr:false` wrapper — keeps cookie JS out of first-load |
| `CookieBanner.tsx` | Bottom-right consent banner |
| `CookiePreferencesModal.tsx` | Category preferences dialog with per-category toggles |
| `CookieButton.tsx` | Local button primitive — `primary` / `secondary` variants |
| `cookieStore.ts` | Zustand store + `localStorage` persistence |
| `index.ts` | Barrel exports — `Cookie`, `LazyCookie`, `useCookieStore`, `CookieConsent` |

**Mounting** — the root layout renders `<LazyCookie />` inside `ScrollLayout`:
```tsx
import { LazyCookie } from "@/components/common/Cookie";
```

> [!note] Not mounted in ODORO (2026-09-15)
> The page sets no analytics or marketing cookies, so the banner is not
> rendered — and its copy is English on a French page. Re-add the import and
> the `<LazyCookie />` line in `src/app/layout.tsx` (and translate the copy)
> when a tracker is added. See [[changelog]].

**State** — `useCookieStore` (Zustand). `consent` is `null` until the user decides;
the banner shows only after hydration confirms `consent === null`. Persisted to
`localStorage` under key `cookie-consent-v1`. Three categories: `necessary`
(always on), `analytics`, `marketing`.

**Styling & motion** — ported to the project stack: The utility generator with the
`background` / `foreground` design tokens (dark-mode adaptive, no hardcoded hex),
and `@react-spring/web` for all motion — `useTransition` drives the banner and
modal mount/unmount, `useSpring` drives the toggle knob. No CSS transitions.
The modal locks scroll through the Lenis [[smooth-scroll|scroll store]]
(`useScroll.stop()`), not `body` overflow.

> [!note] `#todo`
> The privacy-policy link points to `/privacy-policy` — that route does not exist
> yet. Placeholder consent copy should be reviewed before launch.

## Grid — adaptive scaling (`grid/`)

The **adaptive scaling grid** keeps a rem-based layout proportional across every
viewport by scaling the root (`<html>`) font-size. Design in `rem` once, and the
whole UI scales as one unit. Lives in `src/components/common/grid/`.

| File | Role |
|------|------|
| `grid.config.ts` | Breakpoints + `FONT_BASE` — the single source of truth for the grid |
| `adaptive-grid.tsx` | `<AdaptiveGrid>` client component — drives the scale-up, renders `null` |
| `index.ts` | Barrel exports — `AdaptiveGrid`, `GRID_BREAKPOINTS`, … |

**How it works** — two halves cover the whole viewport range:

- **Scale down** (viewport ≤ 1920px) — `vw`-based `html { font-size }` media
  queries in `globals.css`. At each breakpoint's design base width the root
  font-size resolves to 16px; between breakpoints it tracks the viewport.
- **Scale up** (viewport > 1920px) — the `<AdaptiveGrid>` component sets an
  inline `html` font-size at runtime via [[hooks|`useAdaptiveGrid`]], so the
  design keeps growing (damped by `coef`) on large displays.

The `globals.css` media queries and `grid.config.ts` describe the same
breakpoints — **keep them in sync** (formula: `font-size = 16 * 100 / baseWidth vw`).

**Mounting** — the root layout renders `<AdaptiveGrid />` inside `ScrollLayout`:
```tsx
import { AdaptiveGrid } from "@/components/common/grid";
```
Mount it once. Props: `baseWidth` (defaults to the largest breakpoint) and
`coef` (0–1 scale-up damping, default `0.6666`).

> [!note]
> This replaced a `styled-components`-based scaling system that was dropped into
> `common/` — see [[decisions-log]] ADR-0008. `styled-components` is **not** a
> project dependency; the scale-down CSS lives in `globals.css` per [[design-system]].

## ReducedMotion — `reduced-motion.tsx`

`<ReducedMotion>` — a client leaf that calls react-spring's `useReducedMotion()`.
It watches the `prefers-reduced-motion` media query and toggles react-spring's
global `skipAnimation`, so every spring — and `spring-text-engine` — jumps to its
end state instead of animating. Renders `null`; mounted once in the root layout.
See [[animation-system]] and [[seo-metadata]].

## Skeleton loaders

Three skeleton components for `loading` states of async-data components — every
async component must mirror its final layout with one of these
(see [[component-conventions]]).

| Component | File | For |
|-----------|------|-----|
| `<SkeletonImage>` | `skeleton-image.tsx` | image placeholders |
| `<SkeletonLoader>` | `skeleton-loader.tsx` | generic block placeholders |
| `<SkeletonVideo>` | `skeleton-video.tsx` | video placeholders |

> [!note]
> `components/ui/` (design-system primitives) does not exist yet — create it when
> the first primitive is added. See [[folder-structure]].

## Related

[[component-conventions]] · [[components/animation-springs]]

---

## ODORO — the page's sections (added 2026-09-15)

Every section below is built to a GetLayers composition under the committed
Style; `getlayers.json` at the repo root is the record. Content comes from
`src/data/mocks/home.ts` through props — nothing is hardcoded in a component.
Reasoning: [[decisions-log]] ADR-0024 / ADR-0025.

### Preloader — `preloader/preloader.tsx`

The opening curtain on the accent: the wordmark resolving letter by letter
(`<StageReveal>`), a small label, and a counter that creeps to `hold` (0.92)
and parks there until the film reports a drawn frame, then runs to 100 and the
plate slides up. Floor `minShow`, cap `maxWait`, release at `releaseAt` of the
exit so the hero rises through the trailing edge. Config:
`src/lib/preloader/preloader.config.ts`. Handover store:
`src/hooks/preloader/use-preloader.ts` (`filmReady` ↔ `released`). Locks the
Lenis scroll while up and puts the page at its top as it leaves.

### Reveal — `reveal/stage-reveal.tsx`, `reveal/stage-rise.ts`

`<StageReveal>` splits a string into letters or words and gives each an
opacity that is a `calc()` over `--stage-reveal`, in a scrambled but
deterministic order. `stageRise(at, span)` returns the inline style that
brings a whole block up (opacity + a `--stage-rise` lift) from the same
property. Neither animates anything; a `<Spring>` / `<Inview>` with
`from={{ "--stage-reveal": 0 }}` on the layer above does. Config:
`src/lib/reveal/reveal.config.ts`. Use them for type over **pinned** layers;
scrolling copy uses [[text-engine]].

### Magnetic — `magnetic/magnetic.tsx`

Wrap a pill's **label**; the pill around it is what is felt. Listeners on the
parent, transform on the child, bare `SpringValue`s writing the DOM. Bound only
on `(hover: hover) and (pointer: fine)`. Config: `src/lib/magnetic/magnetic.config.ts`.

### Chrome — `chrome/site-chrome.tsx`, `chrome/stage-nav.tsx`

`<SiteChrome>` renders the fixed `<header>` (brand, links, cart) and the
floating pill bar, and drives both from one ticker subscription: header up on
the first screen, pill up from there except while one of the `quietIds`
sections owns the foot of the screen — the lookbook (its dock lives there),
the closing screen (its own pill) and the accent footer — as measured by
`chromeConfig.pill.quietFromTop` / `quietUntilBottom`. Plates open out of a disc
(`clip-path`), labels resolve behind them. `<StageNav>` is the pill itself —
links scroll with `scrollTo`, a disc + menu on portrait windows. Config:
`src/lib/chrome/chrome.config.ts`. Takes `released` for the crawler path.

### Hero — `hero/hero-film.tsx`, `hero/hero-stage.tsx`, `hero/chapter.tsx`

`<HeroFilm>` is a `<ProgressTrigger tag="section">` several viewports tall
with a `sticky` film inside it: the `<video>` (WebM + MP4 sources, poster)
reports `loadeddata` to the preloader, plays on release with a scale-in
entrance, zooms/drifts with the scroll and gathers a porcelain scrim
(`src/lib/film/film.config.ts`). Pauses off-screen; honours reduced motion
(poster only). Its children are the overlays, wrapped in a `<Spring>` that
writes `--stage-reveal`. `overflow-x-clip`, never `hidden`, or the sticky
child stops sticking.

`<HeroStage>` is the first screen (`loopstack-hero`): eyebrow, one serif line,
the accent pill, meta row, and the `<h1>` wordmark at 27vw bleeding past the
gutters. `<Chapter>` is one `negantropy` chapter at `top: screen × 100lvh`:
heading anchored bottom on one side (letter reveal), index + rule + body on
the other (word reveal), both `spring-text-engine` in `mode="once"`; stacks on
portrait windows.

### Manifesto — `manifesto/manifesto.tsx`

`artist-statement`: eyebrow with a lead rule, one passage at display size on
a narrowed measure (word reveal), an italic signature rising behind it.

### Collection — `collection/collection.tsx`, `collection/product-card.tsx`

`vexon-showcase`: a 4|8 heading row (label · statement with a line reveal ·
paragraph) over a 3-column grid (2 on portrait, 1 on phones). `<ProductCard>`
is an `<Inview tag="li">` plate: The framework's image component 4:5 that leans toward the pointer
through `<Hover trigger>`, an index in the corner, an "add" pill on hover
(CSS opacity, token-timed), and a ruled footer with name, detail and price.
The link is the plate; there is no cart — this is a template.

### Lookbook — `lookbook/spotlight-carousel.tsx`

GetLayers section `carousel-spotlight`, ported. **Engine preserved**: a
preserve-3d ring driven by one `--rot`, cards placed by
`rotateY(a) translateZ(-r)`, drag / inertia / snap-to-card / keyboard /
prev-next / dot / tap-to-focus, front-card sync to the dock through refs, all
on the shared ticker. **Skin ours**: tokens, faces, the seven looks
(the framework's image component in the cards), the masthead (line reveal). Config:
`src/lib/lookbook/spotlight.config.ts`. Reduced motion snaps instantly.

### Scene — `scene/onyx-cubes-canvas.tsx`, `scene/lazy-onyx-cubes.tsx`, `src/lib/scene/onyx-cubes.ts`

GetLayers scene `onyx-cubes`. `OnyxCubesScene` is a class over a canvas:
three.js renderer (transparent), a dark PMREM rig with bright panels for the
black-chrome look, a cannon-es world with weightless bodies on a centre spring,
cursor bow-wave and grab-and-fling. `frame()` / `resize()` / `setFraming(x, y,
distance)` / `dispose()`. The camera always looks at the world origin, so an
off-origin centre is an off-centre swarm on screen: beside the copy on a wide
window (`centerX`), above it on a portrait one (`centerYStacked`, with the
camera further back at `camDistStacked` because a narrow window narrows the
horizontal field of view). Uses `THREE.Timer` and `PCFShadowMap` (three r186).
The canvas component reads `--foreground` and `--accent` from the
page at mount and passes them as the palette — the Style's tint through CONFIG
— runs the loop on the ticker only while on screen and the tab is visible,
draws one frame under reduced motion, and bails without WebGL. `<LazyOnyxCubes>`
mounts it (and requests the chunk) only when the host is a viewport away.
Config: `src/lib/scene/onyx-cubes.config.ts`. Performance work goes through
the `optimize-3d-scene` skill ([[optimize-3d-scene]]).

### Closing — `closing/closing-stage.tsx`

`ai-studio-cta` over the scene: a left stack (two-line heading, second line
dimmed, letter reveal; body; accent pill; note) resolving from `--stage-reveal`
written by an `<Inview mode="once">`; the page's own porcelain wash is the
scene's ground. Copy is `pointer-events-none` so the cubes take the cursor;
the pill takes it back. Section id `atelier` is what sends the pill bar away.

### Footer — `footer/site-footer.tsx`

`artist-footer` on the accent plane: a 5|2|2|3 row (brand + italic tagline +
mail · three link columns), the wordmark at 18.5vw in 10% ink, a hairline legal
bar. Rises once on entry.
