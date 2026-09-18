---
tags: [frontend, stable]
updated: 2026-09-14
---

# Catalog — Utilities

Pure helper functions in `src/utils/` (no side effects, unless noted).

## `is-bot.ts`

`isBot(): Promise<boolean>` — **server-only**. Reads the `user-agent` header,
returns `true` for crawlers/audit tools. Used to skip heavy animation for bots.
See [[seo-metadata]].

## `is-bot-agent.ts`

`isBotAgent(userAgent: string): boolean` is the **client-side** twin of
`isBot()`. It takes the string instead of reading `headers()`, so the route that
uses it stays statically prerendered. `SequenceCanvas` calls it with
`navigator.userAgent` to skip the frame-sequence download for crawlers and audit
tools ([[decisions-log]] ADR-0025). The list is the same as `isBot()`'s but
declared separately, as two regex literals, so change both together.

## `scroll-to.ts`

`scrollTo(id?, immediate?)` — programmatic scroll to an element id (string) or a
numeric position. Integrates with the Lenis [[smooth-scroll|scroll store]];
temporarily disables scroll state during the animation. Has `//if lenis` guards so
the Lenis dependency can be stripped if smooth scroll is removed.

## `math.ts`

| Export | Purpose |
|--------|---------|
| `SpringValues` | `Record<string, string \| number>` — the shape `from`/`to` take on every spring component |
| `transformRange(value, min, max, newMin, newMax)` | remap a value between ranges (clamped) |
| `lerp(start, end, t)` | linear interpolation |
| `debounce(fn, delay)` | debounce helper — **currently unused**; `useWindowSize` has its own inline timer |
| `interpolate(from, to, progress)` | interpolate a whole `SpringValues` bag, preserving CSS units and transform functions (`"10px"`, `"45deg"`, `"translate(10px)"`) |

`interpolate` is the scrub engine's workhorse — [[hooks|useSpringTrigger]] calls it
every frame in `mode="scrub"`. It is the one util inside the animation hot path, so
changes here are felt everywhere.

> [!note] Typed in the 2026-08-18 pass
> These signatures used `any` (a hard rule #7 violation, caught by
> `.claude/scripts/verify.sh` on its first run). `interpolate` now takes and
> returns `SpringValues`, which is exactly what its only caller already declared;
> `extractNumber` takes `unknown` and narrows by `typeof`; `debounce`'s generic
> constraint uses `(...args: never[]) => void`, the strict-safe idiom for
> "any function". No runtime behaviour changed.

## `lvh.ts`

CSS-string builders for viewport-height units with fallbacks
(`vh` → `lvh` → `calc(var(--vh) …)`): `heightLvh`, `minHeightLvh`, `marginTopLvh`,
`marginBottomLvh`. Solves mobile-browser viewport-height inconsistencies.

## `animation/coords.ts`

Element-coordinate helpers — `getElementCoords`, `getScrollCoordsFromElement` —
used internally by the scroll/animation system. Marked `@ts-nocheck`. `#do-not-modify`

## `seo/generate-page-metadata.ts`

`generateMetadata(props?)` — shared page-`Metadata` builder. `generateViewport()`
— the `Viewport` export (carries `themeColor`). See [[seo-metadata]].

## `seo/structured-data.ts`

`getSiteStructuredData()` — builds the `Organization` + `WebSite` JSON-LD graph
rendered by the root layout. See [[seo-metadata]].

## `timeline/`: scroll-timeline selectors

Pure functions of a 0–1 progress, consumed as memoised `p.to(selector)` on one
react-spring value that one `ProgressTrigger` scrubs ([[decisions-log]]
ADR-0024). They are ported from the source site's `animate()` loop.

### `timeline/range.ts`

| Export | Purpose |
|--------|---------|
| `Range` | `readonly [start, end]`, a window on the 0–1 axis |
| `clamp01(v)` | clamp to 0–1 |
| `span(p, range)` | local 0–1 progress of `p` through `range`: 0 before it, 1 after |
| `easeInOutSine(t)` | `(1 − cos πt) / 2`, the source's easing for scrubbed phases |
| `easeOutSine(t)` | `sin(πt / 2)`, the footer wordmark's settle |

### `timeline/scene.ts`

The 1400vh Keld Studio track.

| Export | Purpose |
|--------|---------|
| `TRACK_VH` / `TRAVEL_VH` | track height (1400) and the distance it travels while pinned (1300), in viewports |
| `PHASE` | phase windows as fractions of travel: sequence 0–0.4, hero exits/entrances 0.08–0.31, echo 0.4–0.53, details 0.53–0.66, star 0.66–0.74, showreel reveal 0.74–0.79, zoom 0.79–1. Unchanged from the source |
| `SCENE_ANCHOR` / `ANCHOR_AT` | in-page anchor ids (`top`, `echo`, `details`) and the phase end each one lands on; `TrackAnchor` places them |
| `trackOffset(fraction)` | a `vh` length down the track |
| `triggerBox(range)` | geometry for a TextEngine `progress` trigger: starts at the phase and is one viewport taller, read `top top` → `bottom bottom`, so progress reaches 1 while the box is still in view |
| layer selectors | `heroVisibility`, `exitOpacity` / `exitTransform` / `exitFilter`, `heroDescriptionOpacity`, `heroThreeOpacity`, `sequenceFrame`, `gridOpacity` / `gridVisibility`, `canvasOpacity`, `echoTransform`, `interiorScale`, `detailsClip`, `starTransform`, `starTint`, `showreelClip` / `showreelTransform`, `overlayOpacity` / `overlayVisibility`, `overlayLeadTransform` / `overlayAsideTransform` |
| `SceneFlags` · `sceneFlags(p)` · `sameFlags(a, b)` | state that is switched rather than scrubbed (`canvas`, `echoLead`, `echoFoot`, `details`, `showreel`, `zoom`). Recomputed every frame, committed to React state only when a flag flips |

- A new scene layer is a **selector here**, not a new trigger.
- Create `p.to()` inside `useMemo`. An inline one is a new instance every render
  and reattaches with a one-frame flash.
- A filter selector returns `none` at zero, not `blur(0)`: `blur(0)` still
  allocates a filter surface.
- `heroVisibility` hides a block only once it has **fully left**. There is no
  start gate: letters run on the raw scroll while `p` trails it, and a start
  gate on `p` made them pop in half-revealed ([[decisions-log]] ADR-0024).
- `starTint` is a **number** (0 → 1 across the warp), not a colour string. The
  star is a white path under a sage copy whose opacity it drives, so both colours
  stay token classes. Never scrub a string holding `var()`: react-spring's
  string interpolator resolves and truncates it (the old `starFill`
  `color-mix()` broke hydration that way).

### `timeline/footer.ts`

`f` is the footer spring. It runs 0 → 1 while the reveal spacer crosses the
bottom of the viewport.

| Export | Purpose |
|--------|---------|
| `FOOTER_CTA_AT` | `0.2`: the CTA reveal flips once a fifth of the footer is uncovered |
| `wordmarkShift(f, indexInWord)` | the wordmark's two-voice rise, returned as a `translate3d`. Even letters (1-based, within their word) start early, staggered by 0.02, and travel 5.625rem. Odd letters start together at 0.12 and travel 8.75rem. The interleave reads as a ripple |

## `lib/`: page config and loaders

`src/lib/` holds client initialisation and global config rather than pure
helpers, so it has no catalog of its own. The rest of it is documented where
it is used: `springs/config.ts` and `animation/ticker.ts` in
[[animation-system]], `site.ts` in [[seo-metadata]], `api/` in
[[api-architecture]]. The Keld Studio modules are listed here, which is the home
[[optimize-3d-scene]] names for scene libs.

### `lib/scene/frames.ts`

**Client-only, with side effects**: it reads `window` and makes network requests.

| Export | Purpose |
|--------|---------|
| `FRAME_TIERS` | desktop 210 × 1920×1080; mobile 105 × 1280×720 (every other frame) |
| `pickFrameTier()` | mobile below 1024px wide or on a coarse pointer. Read **once at mount**: switching tiers would re-download the set, and a 2D canvas has nothing to retune |
| `framePath(tier, i)` | `/assets/scene/sequence/<tier>/NNN.webp` |
| `FRAME_POSTER` | desktop frame 0, the framework's image component poster under the canvas and the bot / no-JS fallback |
| `loadFrames(tier, onFrame, signal)` | fetch + `img.decode()` in index order, six in flight. A failed frame is reported as `null` and the canvas falls back to its nearest neighbour. Stops when `signal` aborts |

The tiering and memory reasoning are in [[decisions-log]] ADR-0025. The encode
commands are in [[changelog]] 2026-09-14.

### `lib/springs/presets.ts`

Every timing the source wrote as a CSS transition or a hand-rolled rAF lerp,
re-expressed as react-spring config. Sections import from here instead of
inlining a config.

| Group | Exports |
|-------|---------|
| Letter reveals (TextEngine) | `SLIDE_BLUR` (x −40 → 0 + blur: hero words, ECHO®) · `RISE_BLUR` (y 105% → 0% + blur: labels, headings, quote) · `CLIP_LAYER` (the no-op wrap layer that makes `overflow` clip, see [[text-engine]]) · `REVEAL_TIMING` + `RevealTiming` (`label` / `cta` / `quote` stagger + easeOutExpo) · `HERO_INTRO` (block one: letters spread over 750 ms, each 750 ms easeOutQuart) · `SCROLL_LETTER` (tension 170 / friction 26: `type="toggle"` scroll entrances, see [[text-engine]]) |
| Scroll followers | `TIMELINE_FOLLOW` 90/26, the scene, replacing the source's 5%-per-frame lerp · `FOOTER_FOLLOW` 140/30 (was 8%) · `BADGE_FOLLOW` 300/40, the PLAY badge (was 12%) |
| One-shots | `COUNT_UP` 2200 ms · `PRELOADER_COUNT` 2800 · `PRELOADER_WIPE` 1200 · `PRELOADER_FADE` 800 · `PRELOADER_RULE` 800 · `GRID_INTRO` 800 · `DOCK_TOGGLE` 350 · `PORTRAIT_HOVER` 600 |

The followers are springs, not lerps, because a lerp per frame depends on frame
rate and a spring does not (ADR-0024).

> [!warning] Keep in/out value types matched
> `x` numeric, `y` percentage strings, `filter` strings. Mixing them throws
> "Cannot animate between _AnimatedString and _AnimatedValue".

## Adding a util

Keep utilities **pure** and side-effect-free (server-only ones like `isBot` are the
exception — note it clearly). Group by domain under `utils/<domain>/`.
Scroll-timeline selectors go in `utils/timeline/<scene>.ts` (ADR-0024).

## Related

[[hooks]] · [[seo-metadata]] · [[smooth-scroll]] · [[components/ui]] · [[decisions-log]]
