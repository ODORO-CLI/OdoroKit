---
tags: [frontend, stable]
updated: 2026-09-14
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


## Preloader — `preloader/`

Ported from GetLayers *Wanderlust* with the hero (ADR-0025). Holds the page on
a brand card until the hero clip has **frames** — `use-media-ready.ts` polls
the rendered `<video>` for `readyState >= HAVE_FUTURE_DATA`, not for a `load`
event — then lifts the card a full viewport upward (no fade: a curtain that
goes transparent on its way out is two exits at once).

| Constant | Value | Why |
|----------|-------|-----|
| `MIN_SHOW_MS` | 2200 | anti-flash floor — a warm cache must not flash the card |
| `COUNT_MS` | 1200 | the count is a duration, not a spring, so its landing is known |
| `HOLD_MS` | 340 | the beat "100" stays legible before the lift |
| `LIFT_MS` | 780 | `easeInCubic` — leaves gently, accelerates away |
| timeout | 8000 | never hold the page longer, whatever the network does |

The gate flips at the **start** of the lift (`startScroll()` is called with
`exitApi.start`), so the hero's clip begins under the departing card. Shown
once per document (`window.__preloaderShown`). Mounted first in
`views/home/home.tsx` with `assets={["hero-video.mp4"]}`.

## Site chrome — `site-chrome/`

One Zustand boolean, `footerInView`, shared between the two ends of the page:
the footer's `useFooterWatch(ref)` (an `IntersectionObserver`, margin −72px)
sets it, and the hero overlay's `chromeGate` spring fades the fixed wordmark,
nav and CTA out over the footer, which prints the same wordmark larger. A store
rather than a prop because neither block owns the other.

## Reveal text — `ui/reveal-text.tsx` · `ui/segmented-text.tsx`

`RevealTitle` (letter by letter, `rtl` or `ltr`, cued by `open` or by its own
viewport entry), `RevealWords` (word by word), `SweepTitle` / `SweepWords`
(scroll-scrubbed, a pure function of a `SpringValue`). All rise, unblur and
fade on one `cubic-bezier(0.16, 1, 0.3, 1)` duration so a line lands as one
movement. `SegmentedText` renders a `TitleSegment[]`, alternating the italic
and roman cuts; `toWords` re-cuts a segment list along its spaces without
losing which characters belong to which cut. Used by the hero and the
preloader; sections use `spring-text-engine` (ADR-0027).

## Eyebrow · ActionLink — `ui/eyebrow.tsx` · `ui/action-link.tsx`

The two ODORO primitives every section shares — see
[[sections#Shared UI — `src/components/ui/`]]. `ActionLink` also exports
`focusRing` and `hoverTiming`, the single focus treatment and the token-backed
transition timing (ADR-0014) every control on the page uses.
