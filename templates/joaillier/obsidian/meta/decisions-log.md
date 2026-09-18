---
tags: [meta, decision]
updated: 2026-09-14
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

## ADR-0029 — Spacing tokens never reuse a display keyword

**Status:** Accepted · 2026-09-14 · amends ADR-0015

**Decision.** No `--spacing-*` token may be named after a Tailwind display or
sizing keyword. Tailwind v4 derives `inline-<name>` (`inline-size`) and
`block-<name>` from the spacing namespace, so a step named `block` emitted an
`inline-block` utility that *also* set `inline-size: 4.5rem`. Every element
carrying the ordinary `inline-block` class — the hero's per-letter reveal spans,
the nav links, the rule links — became a 78px box, and the display lines
rendered as letters spread on a fixed pitch and overlapping the next word. The
ladder step is `stack` (`--raw-spacing-stack`, `--gap-stack`, `--spacing-stack`
→ `mt-stack`, `py-stack`, `gap-y-stack`).

**Constraint.** Before adding a token, check that `<namespace>-<name>` does not
collide with a built-in utility (`block`, `flex`, `grid`, `hidden`, `table`,
`size`, `auto`, `full`, `px`, `screen`, `min`, `max`, `fit` are the usual
traps). Found by a CDP probe of computed styles, not by lint — nothing in the
toolchain warns about it.

## ADR-0028 — `node_modules` lives in a `.nosync` folder behind a symlink

**Status:** Accepted · 2026-09-14

**Decision.** `node_modules` is a symlink to `node_modules.nosync/`, and the
real folder is git-ignored. The project directory sits inside the iCloud-synced
Desktop, and iCloud evicts files it decides are cold: a build passed at 20:54
and failed at 21:13 with `_semver.default.satisfies is not a function` because
`next/dist/compiled/semver/index.js` still reported 24,836 bytes to `stat` but
read as empty. Anything ending in `.nosync` is skipped by iCloud, so the
dependency tree is never evicted and never uploaded. Node and Yarn follow the
symlink transparently. Two configs had to learn the real name: `tsconfig.json`
excludes `node_modules.nosync` (TypeScript otherwise type-checks every `.ts`
inside it — the build failed on `@babel/core/src`) and `eslint.config.mjs`
ignores it. `.next` is a symlink to `.next.nosync/` for the same reason — the
sync daemon held build files open and `rm -rf .next` failed mid-rebuild. Both
real folders are excluded in `tsconfig.json` and ignored in `eslint.config.mjs`
— ESLint otherwise lints the emitted Turbopack chunks and fails on them.
Turbopack resolves the symlink to its real path and, because that path is not
literally named `node_modules`, traces Next's own optional requires
(`@opentelemetry/api`, sharp's native binary) as project code and prints ~114
"Module not found" warnings per build. They are cosmetic — the build succeeds
and the page runs; they disappear the day the project leaves iCloud.

**Constraint.** If the project moves out of iCloud, both symlinks can go. Until
then, never `rm -rf node_modules` while a sync is in flight — rename it away
first (`mv node_modules /tmp/…`) and delete the copy.

## ADR-0027 — Two text-reveal engines on one page

**Status:** Accepted · 2026-09-14

**Decision.** The hero keeps Wanderlust's `RevealTitle` / `RevealWords`
(`src/components/ui/reveal-text.tsx`, plain `@react-spring/web`) and every
section below the fold uses the starter's `spring-text-engine`. The hero's
motion layer is `preserve` under the GetLayers contract and its lines are cued
by the assembly rather than by the viewport — porting them to `TextEngine`
would mean rewriting the one thing the template says not to rewrite. The two
engines share the same three properties (rise, unblur, fade) and the same
curve family via `src/lib/motion/reveals.ts`, so nothing reads as two systems.

**Constraint.** New sections use `TextEngine` (hard rule #3). `RevealTitle` is
for display lines that belong to a sequence with its own clock.

## ADR-0026 — Clips ship as H.264 1080p; HEVC masters are kept aside

**Status:** Accepted · 2026-09-14

**Decision.** Seedance 2.5 delivers HEVC. Firefox and Chrome-on-Linux do not
decode it, so both clips were re-encoded to H.264 High 4.1, CRF 19,
`yuv420p`, `+faststart`, no audio — 3.0 MB and 4.0 MB for ten seconds at
1920×1080 — and the HEVC originals were kept outside the repo as masters. The
hero's closing still (`hero-still.jpg`) was extracted from the master, not the
re-encode, so the dissolve at the end of the clip trades up in detail.

**Constraint.** Re-generate a clip → re-encode it the same way and re-extract
the still. Never ship the HEVC file, never hotlink the generator's CDN.

## ADR-0025 — The hero is Wanderlust's, ported as a preserved-motion section

**Status:** Accepted · 2026-09-14 · relies on ADR-0002

**Decision.** The hero, the preloader, the site-chrome store, the reveal-text
engine and `SegmentedText` are the GetLayers template *Wanderlust*'s own files,
copied from its Next tree rather than rebuilt: its composition and motion
layers are `preserve`, its skin is `mutable`. Only the skin moved — token
names re-pointed to the ODORO palette, content keys renamed for the brand
(`explore → cta`, `destinations → collections`, `ariaLabel` added), the clip
rate set to 1.75× against a 10s clip with a 9s fallback, the thumbnail crops
re-solved for the new photograph. One addition: a scroll-linked exit parallax
on the picture plate (`EXIT_PARALLAX`, 28% of the stage over the section's
exit), wrapped around the media layers only so the viewfinder's
`backdrop-filter` keeps an untransformed ancestor chain. The starter's
`scroll-layout.tsx` and `grid.config.ts` were replaced by the template's
versions (Lenis `lerp`, `scrollRestoration = "manual"`, 1440 base).

**Amendment (same day).** One bug fixed in the ported preloader: `use-media-ready`
reports `ready` on its own 8s timeout with `progress` still short of 1, and the
count was keyed on `progress` alone — so on a stalled clip `counted` never
flipped and the card never lifted. The reveal-choreography rule is that the hard
cap is a hard cap; `reading = ready ? 1 : progress` now drives the count.

**Constraint.** `hero.geometry.ts`, `hero-overlay.tsx` and
`use-pointer-follow.ts` are tuned, not designed here — change numbers in
`hero.tuning.ts` and `hero.geometry.ts`, don't restructure the sequence.

## ADR-0024 — One GetLayers Style, committed once, in `getlayers.json`

**Status:** Accepted · 2026-09-14 · relies on ADR-0015

**Decision.** The page is compositions + one Style + assets. The Style is
GetLayers `wanderlust-style` (tokens, radius, motion, the italic leading
capital), re-tinted with `halcyon-palette` (`#03060f` night · `#f4ecda` cream ·
`#98958d` silver · `#ffe49a` gold) and re-typed with `cormorant` for display.
The library has no light champagne Style and none was invented: the champagne
of the brief lives inside the footage and the photographs, and on the page
colour is light, not paint. Every token in `globals.css` Tier 1 comes from
that palette; every section's layout comes from a named composition recorded
in `getlayers.json → placed`.

**Constraint.** One palette per surface, one type system per site, one
inverted band, one accent rationed to a lamp, a button and a selection. To
restructure a section, recompose it (swap the skeleton, keep the Style and
content) — don't hand-lay a generic stack. Read `getlayers.json` before adding
a section; write it after.

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

**When building.** Full rules in [[design-system]]. Two Tailwind v4 facts,
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
| One-off styling | Tailwind utilities in `className` |
| Repeated pattern with markup/structure/props | a **React component** in `components/ui/` |
| Repeated pure-utility combo, no structure | a Tailwind v4 `@utility` |
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

**Decision.** External calls go through Next.js Route Handlers at
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

## ADR-0005 — Use standard `next/link` for navigation

**Status:** Accepted · 2026-05-21

**Decision.** Standard Next.js navigation — `<Link>` from `next/link`,
`useRouter` from `next/navigation`. The custom `<AnimLink>` / `useAnimRouter()`
convention referenced in early drafts is dropped; it was never built.

**Why.** Two conflicting conventions existed in the docs and only one had code.

**When building.** No animated route-transition layer exists. If one is needed,
revisit with a new ADR rather than reviving the old names. See [[routing]].

---

## ADR-0004 — Tailwind v4 with CSS-based config

**Status:** Accepted (starter baseline) · amended by ADR-0012 and ADR-0015

**Decision.** All theme configuration lives in `globals.css` under `:root` and
`@theme inline`. There is no `tailwind.config.js`. Raw values in class names are
banned.

**Why.** Tailwind v4 removes the JS config file in favour of CSS-native config.

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
