---
tags: [frontend, scroll, stable]
updated: 2026-09-14
---

# Smooth Scroll — Lenis

Smooth scrolling is provided by **Lenis** (`^1.3.19`), integrated through
`ScrollLayout` and a Zustand store.

## Components & files

| File | Role |
|------|------|
| `src/layouts/scroll-layout.tsx` | `ScrollLayout` wrapper + `ScrollController` |
| `src/hooks/smooth-scroll/use-scroll.ts` | `useScroll` Zustand store |
| `src/utils/scroll-to.ts` | `scrollTo()` programmatic scroll helper |

## ScrollLayout

Wraps the whole app (mounted in `app/layout.tsx`). It splits into:

- A **server-safe shell** — renders `{children}` so content is SSR-friendly.
- `<ScrollController>` — a client-only, render-nothing component that owns Lenis.

`ScrollController` on mount:
1. Resets scroll to top.
2. Creates `new Lenis({ smoothWheel: true, anchors: true })`, stores it on
   `window.lenis` and in the [[data-flow|scroll store]].
3. Starts a `requestAnimationFrame` loop calling `lenis.raf(time)`.
4. Watches `isEnableScroll` — starts/stops Lenis and locks/unlocks native scroll
   (`html { overflow: hidden }`) accordingly.
5. Watches `pathname` for `#hash` → smooth-scrolls to the target after 300 ms.

`scrollSpeed` is an exported mutable `{ current: 1 }` — adjust to change global speed.

### In-page anchors: `anchors: true`

Lenis intercepts clicks on in-page `#hash` links and scrolls to the target
itself. A plain `<a href="#expertises">` glides instead of jumping natively, with no
per-link click handler and no `scrollTo` call. It was added for Keld Studio,
whose footer nav, dock menu and CTAs are all hash links ([[changelog]]
2026-09-14). This is separate from step 5, which covers a hash that arrives with
navigation.

Anchors inside the pinned scene are zero-size markers that `TrackAnchor` places
at a phase's end (`SCENE_ANCHOR` / `ANCHOR_AT`, see [[utils]]), so `#expertises`
lands where the Expertises panel has fully risen and `#cabinet` where the
details plate is fully unmasked (renamed from `#echo` / `#details` on
2026-09-15).

## The scroll store

```ts
import { useScroll } from "@/hooks/smooth-scroll/use-scroll";
import { useShallow } from "zustand/react/shallow";

const lenis = useScroll((s) => s.lenis);
const [start, stop] = useScroll(useShallow((s) => [s.start, s.stop]));
```

| Field | Type | Purpose |
|-------|------|---------|
| `lenis` | `Lenis \| null` | the live instance |
| `setLenis` | fn | setter (used by `ScrollController`) |
| `isEnableScroll` | `boolean` | is scrolling allowed |
| `start()` / `stop()` | fn | toggle scroll (e.g. lock when a modal opens) |

## Programmatic scrolling

```ts
import { scrollTo } from "@/utils/scroll-to";

scrollTo("#section-id", true);  // smooth scroll to an element id
scrollTo(0);                    // back to top
```

`scrollTo` temporarily disables scroll state during the animation when needed.

## Related

[[data-flow]] · [[system-overview]] · [[hooks]]
