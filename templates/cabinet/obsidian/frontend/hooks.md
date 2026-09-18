---
tags: [frontend, stable]
updated: 2026-09-14
---

# Catalog — Hooks

Custom hooks in `src/hooks/`, grouped by domain.

## `hooks/animation/` — `#do-not-modify`

The hooks powering the [[animation-system]]. Consume them through the spring
components — don't call them directly unless extending the engine.

| Hook | File | Role |
|------|------|------|
| `useInViewRef` | `use-in-view-ref.ts` | IntersectionObserver ref for viewport detection |
| `useDynamicInView` | `use-dynamic-in-view.ts` | in-view detection with dynamic targets |
| `useLoopInView` | `use-loop-in-view.ts` | in-view tied to a render loop |
| `useProgressTrigger` | `use-progress-trigger.ts` | scroll → 0–1 progress (powers `<SpringTrigger>` / `<ProgressTrigger>`); returns `progress` as a `RefObject<number>` — read `.current` |
| `useSpringTrigger` | `use-spring-trigger.ts` | scroll-driven spring logic |
| `useLoop` | `use-render-loop.ts` | subscribes a callback to the shared rAF ticker (`src/lib/animation/ticker.ts`) |
| `useResizeLoop` | `user-resize-loop.ts` | runs a callback when window width changes (via `useLoop`) |

## `hooks/smooth-scroll/`

| Hook | File | Role |
|------|------|------|
| `useScroll` | `use-scroll.ts` | Zustand store for Lenis + scroll state — see [[smooth-scroll]] |

## `hooks/scene/`

| Hook | File | Role |
|------|------|------|
| `useSceneStore` | `use-scene-store.ts` | Zustand store — the few facts the home page's separate client leaves have to agree on |

The home view is a Server Component composing sibling client leaves, so there is
no client parent to lift shared state into; this store is that channel.

| Field | Written by | Read by | Meaning |
|-------|-----------|---------|---------|
| `framesProgress` (0–1) | `SequenceCanvas`, per settled frame — `1` at once for a bot | `Preloader` | share of the frame sequence decoded; the curtain lifts on clock **and** frames ([[decisions-log]] ADR-0025) |
| `introReady` | `Preloader` | `HouseScene` → grid fade-in, hero block one's entrance | the curtain has lifted far enough for the hero to play |
| `dockHidden` | `DockSentinel` | `Dock` | the footer is being uncovered, so the dock steps aside |

Each field has a matching `set*` action. **Nothing per-frame lives here** —
scroll-driven values stay on the scene spring (`p`, [[decisions-log]] ADR-0024).
Subscribe to one field with a selector (`useSceneStore((s) => s.introReady)`),
never the whole store, or every flip re-renders every reader.

## `hooks/` (root)

| Hook | File | Role |
|------|------|------|
| `useWindowWidth` / `useWindowHeight` / `useWindowSize` | `use-window-size.ts` | SSR-safe window dimensions — all three share **one** debounced (300 ms) `resize` listener via a `useSyncExternalStore` store |
| `useAdaptiveGrid` | `use-adaptive-grid.ts` | Scales the root `<html>` font-size up while the viewport exceeds `baseWidth` — powers `<AdaptiveGrid>`, see [[components/common]] |

> [!note] Shared render loop
> Loop-based hooks (`useLoop`, `useResizeLoop`, `useLoopInView`, the trigger
> hooks) all subscribe to the single app-wide ticker in `src/lib/animation/ticker.ts`
> rather than each starting their own `requestAnimationFrame`. See
> [[animation-system]]. The ticker is **not** `#do-not-modify`.

## Adding a hook

Place it under `hooks/<domain>/`. Data-fetching logic belongs in hooks, not in
presentational components. Use [[templates/hook-note]] to document it here.

## Related

[[animation-system]] · [[smooth-scroll]] · [[utils]]
