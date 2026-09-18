---
tags: [meta, decision]
updated: 2026-09-15
---

# Decisions Log (ADRs)

Why this project's conventions are what they are. Each entry records a decision,
the reasoning behind it, and what it constrains when you build.

These are **inherited from the starter** — they explain the rules in `AGENTS.md`
and across the vault, and notes link to them by number. Add your project's own
decisions on top, continuing the numbering. Amending an inherited decision is
fine; write a new ADR that says so rather than editing the old one.

Template: [[templates/adr-note]].

---

## ADR-0026 — The hero footage is generated, then scrubbed as frames — never played

**Status:** Accepted · 2026-09-15 · Cabinet Odoro re-skin ([[changelog]])

**Decision.** The hero's library dolly is a 10 s clip generated with Seedance
2.5 (Higgsfield). It is not played in the hero: it is decoded offline to the
two WebP tiers of ADR-0025 and scrubbed by the scroll spring, so the footage
moves only when the reader scrolls — the "video that animates on scroll" of
the brief. The same clip, re-encoded to H.264, plays normally as the showreel
further down. Any replacement clip is prompted as **one continuous shot at
constant camera speed, no cuts, no speed ramp, no people** so that scroll
distance maps linearly onto camera travel.

**Why.**
- *`<video>.currentTime` scrubbing judders.* Seeking lands on the nearest
  keyframe unless the file is all-intra, seek latency differs per browser,
  and Safari throttles rapid seeks — the House frame pipeline already solves
  this with decoded frames drawn on a 2D canvas.
- *The pipeline exists.* ADR-0025's loader, tiers, poster and bot gate are
  reused unchanged; only `FRAME_TIERS` counts and the media changed.
- *Constant speed is what makes the scrub read.* A dolly that eases or cuts
  would make equal scroll steps move the camera by unequal amounts.
- *One asset, two roles.* Reusing the master as the showreel keeps the page
  to one piece of footage and one generation cost (90 credits at 1080p).

**Constrains.** Regenerate at 1920×1080, 24 fps; keep `FRAME_TIERS.count` in
sync with what the encode writes (`ls | wc -l`); re-run the encode commands in
the changelog into both tier folders. Frame 0 doubles as the footer plate and
the last frame as the details plate — a new clip changes both.

## ADR-0025 — The frame sequence ships as two WebP tiers and skips crawlers on the client

**Status:** Accepted · 2026-09-14 · Keld Studio rebuild ([[changelog]])

**Decision.** The hero's fly-through is a frame sequence drawn to a 2D canvas,
shipped as two re-encoded tiers — desktop 210 × 1920×1080 WebP (14 MB), mobile
105 × 1280×720 WebP taking every other frame (3.3 MB) — chosen once at mount
(`innerWidth < 1024` or a coarse pointer). Frames load in order, six at a time,
and count as loaded only after `img.decode()`. The canvas draws on the shared
ticker, and only when the wanted frame index changes, the canvas is still
visible and the tab is in front. Frame zero is the poster underneath
(the framework's image component, `priority`). The preloader lifts on *clock and frames settled*.
A client-side user-agent check (`isBotAgent`) skips the download for crawlers
and audit tools.

**Why.**
- *The source was unshippable:* 210 × 6 MB PNGs, 1.3 GB, drawn at 2560×1440.
- *Memory binds before bandwidth on a phone.* A decoded frame costs
  `w × h × 4` whatever it cost on the wire — 8.3 MB at 1080p. Holding 210
  `ImageBitmap`s would pin 1.7 GB, so the frames stay `HTMLImageElement`s and
  the browser's decode cache manages residency; the mobile tier halves both
  the pixel count and the frame count.
- *No retune on resize.* Switching tier mid-session means re-downloading the
  set, and a 2D canvas has no DPR or framebuffer to re-tune — so unlike the
  WebGL rule in ADR-0023, the tier is read once.
- *The route stays static.* The server `isBot()` reads `headers()`, which opts
  the route out of prerendering (`○` → `ƒ`). The download decision can wait for
  the browser, so the check moved there. Crawlers see the poster — frame zero —
  and the same DOM text as everyone else; only the decorative motion differs.
- Not a WebGL scene, so the `optimize-3d-scene` skill does not formally apply;
  its §1 (no scene for bots), §3 (gate the loader on ready, not on a duration)
  and §4 (draw only when visible) were applied anyway.

**Constrains.** Headless Chrome's UA counts as a bot: any QA script must send a
normal UA or it measures the poster path. New frames are encoded with the
commands in the changelog entry, into both tier folders, at matching counts.

---

## ADR-0024 — Scroll scenes run on one trigger and one spring; letters stay on TextEngine

**Status:** Accepted · 2026-09-14 · refines ADR-0002 for pinned scroll scenes

**Decision.** A pinned scroll scene — the 1400vh Keld Studio track, the reveal
footer — is driven by **one** `ProgressTrigger` on the element that is on
screen for the scene's whole duration, feeding **one** react-spring value. Every
layer reads a memoised `p.to(selector)`, where the selectors are pure functions
in `src/utils/timeline/`. Anything switched rather than scrubbed is a flag,
recomputed per frame but committed to React state only when it flips. Letter
animation stays on TextEngine: `progress` mode with `type="toggle"` against a
phase "trigger box", or `always` mode gated by `enabled`. One exception: the footer wordmark's
letters are `animated.span`s reading the footer spring, because its even/odd
two-window rhythm cannot be expressed with TextEngine's single stagger.

**Why.**
- *Per-phase triggers freeze out of view.* `SpringTrigger`'s `TriggerPos` has
  no offsets, so phases would need marker elements; and `useLoopInView` stops
  updating a trigger once it leaves the viewport. With thirteen phases sharing
  one sticky stage, a fast scroll or an anchor jump past a marker would leave
  its layer half-played *and still on screen*. The track is in view for the
  whole scene, so one trigger on it is always current.
- *Cost.* One scroll read and zero React renders per frame, however many layers.
- *Feel.* The source lerped 5% per frame on top of Lenis. An overdamped spring
  (`TIMELINE_FOLLOW`) gives the same trail without the frame-rate dependence.
- *Precedent.* `ai-studio`'s `ShowreelStage` is the same shape.
- *Rule 1 holds.* Every value is a react-spring `SpringValue`; there is no rAF
  writing styles and no CSS keyframes. The hero blocks' *exits* became
  block-level (slide + blur) rather than per-letter in reverse: a TextEngine's
  progress is monotonic, so one engine cannot enter on one window and exit on
  another.
- TextEngine triggers use `triggerBox()`: the box starts at the phase and is one
  viewport taller than it, read `top top` → `bottom bottom`, so progress reaches
  1 while the box is still in view.

**Constrains.** A new scene layer is a selector in `utils/timeline/scene.ts`,
not a new `SpringTrigger`. Create `p.to()` inside `useMemo` — an inline one is
a new instance each render and reattaches with a one-frame flash. Switch state
through `sceneFlags`. Never position a `TextEngine` by class — it writes
`position: relative` inline; wrap it ([[text-engine]]).

*Added 2026-09-14, from the first bug reports:*
- **Two clocks, never a hard switch between them.** TextEngine letters run off
  the raw scroll; `p` trails it by the spring's damping. Gating a block's
  *start* with `visibility` on `p` switched it on only once the raw scroll was
  already part-way into its entrance, and the letters popped in half-revealed.
  A block now hides only after it has fully left; before its entrance its
  letters are simply out.
- **`toggle`, not `interpolate`, for scroll entrances** — `interpolate` has
  letter 0 fully in at progress 0 ([[text-engine]]).
- **No `var()` inside a string a spring animates.** react-spring's string
  interpolator resolves `var(--token)` and truncated
  `color-mix(… var() …)` — an invalid fill *and* a hydration mismatch. Animate a
  number (opacity, a scale) and keep colours as token classes; the star's white
  → sage blend is two stacked paths with a scrubbed opacity.

---

## ADR-0023 — 3D scenes resize on every tier; the iOS URL bar is filtered, not the listener

**Status:** Accepted · 2026-09-08 · amends the `optimize-3d-scene` skill (ADR-0016)

**Decision.** A WebGL scene keeps its rAF-coalesced `resize` /
`orientationchange` listener on **every** device tier, plus a listener on the
`(hover: none) and (pointer: coarse)` media query. On a coarse pointer it
ignores a change that moves `innerHeight` only. Any width change or media-query
flip re-reads the device tier; if the tier changed, `retune(tier)` re-applies
DPR (renderer and composer), frame budget, per-tier visibility, draw ranges,
pointer binding and freeze state before the surface is resized.

**Why.** The skill's earlier rule — no resize listener at all on touch — was
written to stop the iOS URL bar from rebuilding the framebuffer mid-scroll,
which reads as a whole-scene flash. It over-corrected. The listener was also the
only path that could notice a viewport that genuinely changed: a window dragged
across a breakpoint, a rotation, or DevTools device emulation switched off. A
scene loaded as a phone then held its 390-wide buffer, 30 fps budget, parked
pointer and hidden desktop-only passes on a 2160-wide viewport and drew skewed
until reload. The URL bar only ever changes `innerHeight`, so filtering
height-only events on a coarse pointer keeps the flicker fix and loses nothing.

**Constraints on retune.** It may touch uniforms, sizes, visibility, draw
ranges and listeners only — never a define, light count or
`material.transparent`, so no shader program compiles after the loader (skill
§3.2). Particle counts vary through `geometry.setDrawRange` on a buffer sized
for the largest tier, never through a rebuild.

**When building.** Follow `patterns.md` §1, §5 and §14 in the skill; do not
port the listener-less resize block from `mycelia/src/lib/scene/canvas3d.ts`.
Verify with the tier-switch round-trip in skill §14: emulation on → off → on
must move the buffer and draw count both ways with a stable program count.
See [[optimize-3d-scene]].

---

## ADR-0022 — Track latest within majors; hold TypeScript 7 and ESLint 10

**Status:** Accepted · 2026-08-18

**Decision.** Dependencies track the newest release **within their current
major**. Three majors are deliberately held back.

**Why.** Stale pins hand every new project a migration debt on day one; a broken
toolchain is worse. Each hold was tested, not assumed:

- **TypeScript 5, not 7** — `eslint-config-next` depends on `typescript-eslint@8`,
  whose peer range is `typescript >=4.8.4 <6.1.0`. TS 7 breaks `yarn lint`.
- **ESLint 9, not 10** — ESLint 10 removed `context.getFilename()`;
  `eslint-plugin-react` still calls it, so linting dies on startup.
- **`@types/node` tracks the Node major in use**, not the newest published.

**When building.** The blockers live in someone else's dependency graph, so they
lift without work here — **re-test periodically** rather than treating them as
permanent. [[tech-stack]] carries the table and the reasons. Node ≥ 20.19 is a
hard floor (`engines` + `.nvmrc`): the ESLint toolchain fails to install below it.

---

## ADR-0021 — SEO is a practice with a workflow, not just a metadata helper

**Status:** Accepted · 2026-08-18

**Decision.** SEO and AEO get skills, an audit agent and a documented order of
work ([[seo-aeo]]), not just the metadata utilities.

**Why.** The mechanism existed; the practice did not. Nothing checked whether a
new route reached `sitemap.ts`, whether titles were unique, or whether the site
was legible to answer engines — the fastest-moving part of search and the one
most likely to be skipped.

**When building.** Audit in order: indexability → metadata → content structure →
structured data → performance → AEO. A perfectly optimised page that cannot be
crawled is worth nothing. **AI-crawler policy is the user's decision** — "be
cited by AI" and "don't train on my content" need different bots allowed. Never
cloak, and never emit schema describing content that is not on the page.

---

## ADR-0020 — Payload + Supabase are the CMS and database, added per project

**Status:** Accepted · 2026-08-18

**Decision.** Payload (Postgres adapter) on Supabase are the documented defaults.
**Neither ships in the starter** — the `payload-cms` / `supabase-db` skills
install them when a project needs them.

**Why.** Payload runs *inside* the Next app — admin as a route group, content via
an in-process Local API, types generated from the schema — which matches how this
starter already works (Server Components reading data, passing props down) and
keeps deployment one Vercel project. Supabase covers database, media bucket and
optional auth in one service. Most projects from this starter are marketing sites
that never need either, so an unused install would be a large dependency surface
and a migration story maintained for nothing.

**When building.** [[cms-payload]] and [[database-supabase]] carry the
conventions. Two constraints break installs if ignored: `@payloadcms/next` pins a
minimum Next version (verify before installing), and Supabase's connection
strings are not interchangeable — runtime on the transaction pooler (6543, no
prepared statements), migrations on the direct connection (5432).

---

## ADR-0019 — Hard rules get a mechanical check, not just prose

**Status:** Accepted · 2026-08-18

**Decision.** `.claude/scripts/verify.sh` checks every hard rule that is
objectively decidable from source and exits non-zero on any FAIL. Judgement calls
stay with the `qa-verify` skill.

**Why.** Rules that are never checked decay into suggestions, and silently — a
stray `@keyframes` or hardcoded hex surfaces at review, if at all. `yarn lint`
knows nothing about springs, token tiers or route delegation.

**When building.** Run it after any code change ([[qa-verification]]). It greps
rather than parsing TypeScript, so it is biased toward false positives: a
dismissed warning costs seconds, an unchecked rule costs a review cycle. WARNs
never fail a build, so justify them rather than ignoring them.

---

## ADR-0018 — Split the docs into knowledge (vault) and execution (`.claude/`)

**Status:** Accepted · 2026-08-18

**Decision.** The vault stays the single source of truth for *why* and *what*;
`.claude/` holds *how it runs* — path-scoped rules, skills, agents, commands and
the verify script ([[agent-harness]]). Every skill, agent and command is
registered in the vault.

**Why.** Documentation that cannot be executed gets skipped; execution files
without recorded reasoning drift and duplicate. Keeping each mechanism to one job
avoids both.

**When building.** `.claude/` files stay short and point into the vault rather
than restating it — restated rules drift out of sync. **Path-scoped rules fire
when Claude *reads* a matching file, not when it writes one, and are not
re-injected after `/compact`.** They reinforce; they never guarantee. Anything
that must hold unconditionally belongs in `verify.sh` or a hook.

---

## ADR-0017 — A skill states its preconditions and its own internal conflicts

**Status:** Accepted · 2026-07-24

**Decision.** Every skill must state the environment its measurements assume, and
name explicitly where one of its steps undermines another.

**Why.** `optimize-3d-scene` was run on a real scene and the fix *order* held up
— what cost hours was everything left implicit: a first step that could not be
executed on the stack in front of it, measurements silently invalidated by the
dev server, and two individually correct steps that contradicted each other.

**When building.** When writing or editing a skill: a step names its
preconditions, and a step names where it fights another step. Numbers taken in
the wrong environment are worse than no numbers, because they read as evidence.

---

## ADR-0016 — Skills are registered in the vault, not just dropped in `.claude/`

**Status:** Accepted · 2026-07-24

**Decision.** A skill is only "installed" once it lives in `.claude/skills/<name>/`,
has a vault note under `workflows/`, is linked from [[README]] and
[[ai-agent-guide]], and — if invocation should be non-optional — has a routing
rule in `AGENTS.md`.

**Why.** A skill folder is discoverable to Claude Code at runtime but invisible in
the vault, leaving the invocation decision to model judgement. Where the skill
exists *because the order of operations matters*, that is exactly the wrong thing
to leave to chance.

**When building.** Registration is also when a skill gets checked against reality
— stale paths and references to files that do not exist surface here.

---

## ADR-0015 — Strict three-tier design-token naming convention

**Status:** Accepted · 2026-07-17 · amends ADR-0004

**Decision.** Tokens follow three tiers with an explicit grammar: primitive
`--raw-<category>-<name>[-<shade>]` → semantic `--<role>[-<variant>][-<state>]` →
`@theme inline` binding. Only Tier 1 holds literals; Tier 2 names purpose, never
appearance, and is the themeable layer. No tier may be skipped.

**Why.** ADR-0004 made tokens the styling currency but never said what a token
should be *called*, so every project would invent its own — defeating the point of
a shared starter. The names are predictable across projects by design.

**When building.** Full rules in [[design-system]]. Two the utility generator facts,
verified by compiling a probe stylesheet, that guides commonly get wrong:

1. Naming primitives `--color-*` would **generate a utility for every raw value**
   and let markup bypass the semantic tier — hence the `--raw-*` prefix, kept out
   of `@theme`.
2. **There is no `--duration-*` namespace.** `duration-fast` compiles to nothing.
   Durations stay Tier 2 and are used as `duration-[var(--duration-fast)]`.
   (`--ease-*` *is* real.)

`@theme inline` is load-bearing: `inline` inlines the `var()` into each utility so
Tier 2 overrides cascade. Binding a literal there freezes the value and silently
breaks theming.

---

## ADR-0014 — Narrow CSS-transition exception for trivial state changes

**Status:** Accepted · 2026-07-17 · amends ADR-0002

**Decision.** All real motion stays spring-based, with one exception: CSS
`transition-*` for simple discrete state changes — `hover:` / `focus-visible:` /
`active:` colour, opacity, border, underline, and small decorative nudges.

**Why.** The outright ban cost most where it helped least: a nav link fading its
colour on hover needed a client component and a spring config to animate one
property nobody will interrupt. The rule pushed toward boilerplate or quiet
rule-breaking.

**When building.** Three conditions, all required, or it is a spring:
token-backed timing (`duration-[var(--duration-fast)] ease-entrance`),
`transition-*` only (`@keyframes` stay banned outright), and utilities only —
never a CSS file. Everything scroll-driven, revealing, staggered, orchestrated,
layout-affecting or interruptible remains a spring; text stays [[text-engine]].
The list is enumerated rather than a judgement call ("simple animations") so it
cannot erode into general CSS animation. Past the list, use `<Hover>`.

---

## ADR-0013 — `<Inview>` self-observe fix; spring components honour resize

**Status:** Accepted · 2026-06-07

**Decision.** Second authorised edit to the protected engine: `<Inview>` now
calls its callback ref so it observes itself when no `trigger` is passed, and
`<Inview>` / `<Spring>` / `<Hover>` pass the React-tracked `width` into
`isMobileDisabled(value, width)`.

**Why.** `<Inview>` only animated when given an external `trigger` — the common
case silently did nothing, because a callback ref was being assigned as
`.current` instead of called. Separately the `width` dependency was tracked but
never used, so resize re-evaluation of mobile gating did nothing.

**When building.** The springs folder stays `#do-not-modify` by default — these
were explicitly signed-off bug fixes, not an opening.

---

## ADR-0012 — Styling lives in utilities and components, not `globals.css`

**Status:** Accepted · 2026-05-22 · amends ADR-0004

**Decision.** A strict placement order, first match wins:

| Situation | Goes where |
|-----------|-----------|
| One-off styling | the utility generator utilities in `className` |
| Repeated pattern with markup/structure/props | a **React component** in `components/ui/` |
| Repeated pure-utility combo, no structure | a utility generator `@utility` |
| Pseudo-elements, 3rd-party overrides, complex selectors | `@layer components` |
| A new colour/spacing/radius value | a token (per ADR-0015) |

**Why.** With tokens in `globals.css` and guidance to extract repeated patterns
into `@layer components`, the path of least resistance made that file a dumping
ground — hundreds of component-specific classes never deleted when their
component was. Splitting the file would only spread the same bloat; the fix is a
placement rule.

**When building.** The default answer to "this looks repeated" is a **React
component**, not a CSS class — an eyebrow label with a `::before` dot is an
`<Eyebrow>`, not a `.label-eyebrow`. `globals.css` holds imports, tokens, base
resets and the narrow `@layer components` exceptions; if it grows past that,
something was misplaced. **CSS Modules were considered and rejected** — a second
styling mechanism is not worth the mental model when motion is spring-based (no
keyframes to co-locate) and utilities plus components cover everything else.

---

## ADR-0011 — API layer: `app/api` route handlers, secrets server-side

**Status:** Accepted · 2026-05-22

**Decision.** External calls go through the framework Route Handlers at
`src/app/api/<resource>/route.ts`. The handler owns the work — business logic,
upstream calls, filtering, secret env vars. No mandatory passthrough service
layer; extract shared code only when genuinely reused.

**Why.** `route.ts` is never bundled to the browser, so it is the natural place
for secrets, and a single convention keeps every endpoint the same shape.

**When building.** Every endpoint validates input with `zod` and returns the
`{ data }` / `{ error }` envelope via the shared `handle()` wrapper. Secret env
vars are unprefixed and read through `getServerEnv()`; `NEXT_PUBLIC_` is only for
browser-safe values. Client Components fetch same-origin via `apiFetch`;
render-time data is read in Server Components. Full note: [[api-architecture]].
Server Actions were considered for mutations and deferred — revisit with a new
ADR if forms need progressive enhancement.

---

## ADR-0010 — SEO & performance hardening

**Status:** Accepted · 2026-05-21

**Decision.** `src/lib/site.ts` (`siteConfig`) is the single source of truth for
SEO. `metadataBase` is always set; `themeColor` lives on the `viewport` export.
Added `robots.ts`, `sitemap.ts`, JSON-LD, `loading.tsx` / `error.tsx` /
`not-found.tsx`, and `<ReducedMotion>`.

**Why.** Relative OG/canonical URLs never resolved to absolute, so social
previews broke in production; an animation-heavy starter ignored
`prefers-reduced-motion`; and the home view was a top-level `"use client"`,
breaking the server-first rule it should model.

**When building.** Set `NEXT_PUBLIC_SITE_URL` in every deployed environment or
canonical and OG URLs resolve to localhost. `<ReducedMotion>` toggles
react-spring's global `skipAnimation` from one app-root mount, covering every
spring and the text engine at once. **`isBot()` is discouraged** — it opts the
route out of static rendering and edges toward cloaking; reduced motion is the
preferred lever, since springs only animate opacity/transform and content is in
the DOM for crawlers regardless ([[seo-metadata]]).

---

## ADR-0009 — Shared animation ticker; authorised engine performance refactor

**Status:** Accepted · 2026-05-21 · amends ADR-0002

**Decision.** One-time authorised refactor of the protected engine, plus a shared
loop primitive: `src/lib/animation/ticker.ts` — a single app-wide,
reference-counted rAF loop that starts on the first subscriber and stops on the
last. It is **not** `#do-not-modify`; it is the supported extension point.

**Why.** Cost scaled with the number of animated components: a private rAF loop
per `useLoop` instance that never stopped, a debounced `resize` listener per
spring component, and an `IntersectionObserver` re-created on every render.

**When building.** A page with N animated components now runs **one** rAF loop
and **one** resize listener. Subscribe new per-frame work to the ticker rather
than starting a loop. Hard rule #2 was amended here: the engine stays protected
by default and changes need explicit sign-off — this ADR is not a precedent for
editing it.

---

## ADR-0008 — Adaptive scaling grid via root font-size

**Status:** Accepted · 2026-05-21

**Decision.** Keep a rem-based design proportional across viewports by scaling
`html { font-size }`: `vw`-based media queries in `globals.css` for scaling down,
and a `<AdaptiveGrid>` client component for scaling up beyond the largest
breakpoint.

**Why.** The behaviour arrived as a `styled-components` implementation, which is
not a project dependency and conflicts with the CSS-only config rule. Only the
behaviour was kept; the implementation was rebuilt on the project stack.

**When building.** Breakpoints live in `grid.config.ts` **and** are mirrored in
the `globals.css` media queries — duplicated by design, since ADR-0004 forbids
generating CSS config from JS. **Keep the two in sync**; the formula is written
in both files. Design px map cleanly to rem at the design base width.

---

## ADR-0007 — Automate the vault workflow with Claude Code hooks

**Status:** Accepted · 2026-05-21

**Decision.** Encode the "read the vault first, update the docs after" workflow as
hooks in `.claude/settings.json`: `SessionStart` injects a pointer to the vault,
`UserPromptSubmit` reminds the agent to consult the relevant guide,
and `Stop` blocks **once per turn** to confirm docs were updated.

**Why.** Documentation drifts the moment it depends on someone remembering.

**When building.** The `Stop` hook uses a `${TMPDIR}` marker keyed by session id
so it blocks at most once per turn — no infinite loop. Hooks are reviewable and
disableable via `/hooks`, and take effect at the next session start.

---

## ADR-0006 — The vault is the single source of truth

**Status:** Accepted · 2026-05-21 · amends ADR-0001

**Decision.** The vault is the **only** documentation source. The repo root keeps
thin shims: `AGENTS.md` carries the breaking-change warning and hard rules and
points into the vault; `CLAUDE.md` and `.cursorrules` `@`-import it.

**Why.** Dense spec files at the root duplicated the vault's content as terse
specs, and the two would drift.

**When building.** Put documentation in the vault and link to it. Keep the root
shims consistent with it — they are the first thing every agent reads.

---

## ADR-0005 — Use standard the framework's link component for navigation

**Status:** Accepted · 2026-05-21

**Decision.** Standard the framework navigation — `<Link>` from the framework's link component,
`useRouter` from the framework's navigation module. The custom `<AnimLink>` / `useAnimRouter()`
convention referenced in early drafts is dropped; it was never built.

**Why.** Two conflicting conventions existed in the docs and only one had code.

**When building.** No animated route-transition layer exists. If one is needed,
revisit with a new ADR rather than reviving the old names. See [[routing]].

---

## ADR-0004 — the utility generator with CSS-based config

**Status:** Accepted (starter baseline) · amended by ADR-0012 and ADR-0015

**Decision.** All theme configuration lives in `globals.css` under `:root` and
`@theme inline`. There is no the generator's config. Raw values in class names are
banned.

**Why.** the utility generator removes the JS config file in favour of CSS-native config.

**When building.** Design tokens are the only styling currency: a value that does
not exist as a token gets added to `globals.css` first — following the three-tier
grammar (ADR-0015) — and component-specific *classes* do not go there at all
(ADR-0012). See [[design-system]].

---

## ADR-0003 — Routes delegate to Views

**Status:** Accepted (starter baseline)

**Decision.** `app/**/page.tsx` only imports and renders a component from
`src/views/`. All layout and UI logic lives in the view.

**Why.** Mixing routing concerns with page UI makes `app/` files heavy and hard
to test.

**When building.** Every route is a ~3-line file; views are the real page
components. `verify.sh` FAILs on a route importing anything else. See [[routing]].

---

## ADR-0002 — All motion is spring-based (`@react-spring/web`)

**Status:** Accepted (starter baseline) · amended by ADR-0014 and ADR-0009

**Decision.** Every animation uses `@react-spring/web` through the component
layer in `src/components/animation/springs/`. CSS keyframes and `framer-motion`
are **banned**. Text animation goes through `spring-text-engine`.

**Why.** Marketing sites need rich, interruptible, physically natural motion. CSS
transitions and keyframes are rigid; competing libraries add weight.

**When building.** The springs folder and `src/hooks/animation/` are
`#do-not-modify` — consume them, wrap them, never edit them without sign-off.
ADR-0014 narrows the CSS ban to allow `transition-*` for trivial hover/focus
state only. See [[animation-system]] and [[text-engine]].

---

## ADR-0001 — Adopt an Obsidian vault as the project brain

**Status:** Accepted (starter baseline) · amended by ADR-0006

**Decision.** `obsidian/` is a linked, navigable vault documenting how the
project is built and why.

**Why.** Project knowledge scattered across root markdown files gave new
contributors and AI agents no structured map of the system.

**When building.** Docs are maintained alongside code — see [[meta/README]] for
the maintenance rules, and [[agent-harness]] for how the vault and `.claude/`
divide the work.
