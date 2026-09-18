---
tags: [meta, changelog]
updated: 2026-09-15
---

# Changelog

Chronological log of notable changes to **this project**. Newest first.
Human-curated — not a mirror of `git log`.

Log a change here when it would surprise someone returning in six months: a new
dependency, a new route or section, a convention bent, a bug whose cause is worth
remembering. Routine commits do not need an entry.

For *why* the conventions are what they are, see [[decisions-log]].

---

## Baseline — built from `next16-claude-starter` v0.1.0

What the starter ships, so the first project entry has something to diff against:

| Area | What is there |
|------|---------------|
| Framework | Next.js 16 App Router · React 19 · TypeScript · Yarn · Node ≥ 20.19 |
| Styling | Tailwind v4, CSS-only config, three-tier design tokens ([[design-system]]) |
| Motion | Vendored spring engine + `spring-text-engine`, shared rAF ticker, reduced-motion ([[animation-system]]) |
| Layout | Adaptive scaling grid — root font-size tracks the viewport ([[design-system]]) |
| Scroll | Lenis smooth scroll + Zustand scroll store ([[smooth-scroll]]) |
| Server | `app/api` route handlers, zod-validated env, `{ data }`/`{ error }` envelope ([[api-architecture]]) |
| SEO | Metadata generator, `robots.ts`, `sitemap.ts`, JSON-LD ([[seo-metadata]]) |
| Agent harness | 8 commands, 7 path-scoped rules, 11 skills, 4 subagents, `verify.sh` ([[agent-harness]]) |
| Not included | CMS, database, auth, payments, i18n, tests — added per project ([[backend/README]]) |

The home view (`src/views/home.tsx`, route `/`) ships empty on purpose — start
there ([[new-page]]).

<!-- Log this project's changes below, newest first, under a `## YYYY-MM-DD` heading. -->

## 2026-09-15 — prepared for GitHub

**One lockfile.** `yarn.lock` deleted; `package-lock.json` is the only one and
`npm ci` the install. Vercel picks its package manager from the lockfile it
finds, and only the npm tree was verified — two lockfiles is two possible
sites. Reasoning: [[decisions-log]] ADR-0027, which settles the question
ADR-0026 left open.

**Package identity.** `package.json` `name` is now `odoro` (was
`next16-claude-starter`) and `license` is `UNLICENSED` — the repo is private
and the brand copy is not public domain. `LICENSE.md` stays as the upstream
starter's dedication, covering the boilerplate it contributed; the README says
which is which.

**README rewritten** for someone cloning the repo: stack, `npm ci` quick start,
the section-by-section map with file paths, where to change copy vs tokens vs
scene CONFIG, the deploy step and the `NEXT_PUBLIC_SITE_URL` requirement, and
an explicit note that everything under `public/assets/` is AI-generated
placeholder media to be replaced before launch. It also carries the iCloud
warning below, because it costs a newcomer an hour otherwise.

**Environment trap, recorded.** A checkout inside an iCloud-synced folder
(`~/Desktop` with Desktop & Documents sync) proxies every file open through the
file provider. Measured on this machine: reading 132 files with Node took
2 m 25 s there against 0.07 s outside it, and `next dev` / `tsc` / `eslint` hung
for over ten minutes. Not a sandbox effect — identical with the sandbox off.
All verification for this project therefore runs in a copy outside the sync
root. Keep the repo out of `~/Desktop`.

**Tree tidied.** `tsconfig.tsbuildinfo` and the `.DS_Store` files removed (both
already ignored), so the first commit carries nothing generated.

## 2026-09-15

**ODORO landing page built on route `/`.** A one-page clothing-brand template
composed from GetLayers layout skeletons under one committed Style
(`ai-creator-style`: porcelain ground, black ink, one electric-blue accent,
Melodrama Light / Instrument Serif / Mulish) — the record of every choice is
`getlayers.json` at the repo root. In page order: an accent **curtain** with the
wordmark resolving letter by letter and an honest counter gated on the film's
first frame (`preloader/`); a **pinned 1080p film** generated on Higgsfield
Seedance 2.5 with scroll parallax and two corner-loaded **chapters** travelling
over it (`hero/`); a **manifesto** (`manifesto/`); a six-plate **collection**
(`collection/`); the GetLayers **`carousel-spotlight`** lookbook ring ported
with its engine intact (`lookbook/`); a closing screen over the GetLayers
**`onyx-cubes`** scene — plain three.js + cannon-es, lazy, tinted through its
CONFIG from the page's tokens (`scene/`, `src/lib/scene/`); and a footer on the
accent plane (`footer/`). A single **chrome** component owns the header and the
floating pill and reads the scroll once per frame on the shared ticker
(`chrome/`). Reasoning in [[decisions-log]] ADR-0024 → ADR-0026; catalog in
[[components/common]].

**New dependencies** — `three`, `cannon-es`, `@types/three` for the closing
scene. See [[tech-stack]].

**Package manager in this checkout is npm.** Yarn is not installed on the
machine that built this (Volta shim without a Yarn), so `npm install` produced
`package-lock.json` beside the starter's `yarn.lock`. Scripts are unchanged
(`npm run dev` / `build` / `lint`). ADR-0026.

**Fonts.** Melodrama Light is committed at `src/assets/fonts/` and loaded with
`next/font/local`; Instrument Serif (with italic) and Mulish through
`next/font/google`. `--font-sans` is now Mulish; Onest is gone.

**Tokens.** `globals.css` carries the Style: porcelain / black / electric
primitives, `--foreground-muted`, `--surface-raised`, `--line`, `--accent`,
`--accent-foreground`, `--glow`, a `--duration-slow`, the px-floored
`--frame-*` type and control scale, `--radius-card`, and a `stacked:` custom
variant (`max-width: 1179px and max-aspect-ratio: 1/1`). There is deliberately
no `prefers-color-scheme` override — the Style is light-only (the film and the
scene are graded for porcelain).

**`verify.sh` fix.** Its "duration-fast used as a utility" check matched the
very form it recommends — `\bduration-(fast|normal)\b` also matches
`--duration-fast` inside `duration-[var(--duration-fast)]`. The check now
excludes that spelling. Nothing else in the harness changed.

**Cookie banner not mounted.** `<LazyCookie />` is no longer rendered by the
root layout: the page sets no analytics or marketing cookies, and the banner's
copy is English on a French page. The component stays in the repo; mount it
again (and translate it) when a tracker arrives. See [[components/common]].

**Media.** `public/assets/hero/` (film as H.264 + WebM + poster JPG),
`public/assets/collection/` (6 product plates), `public/assets/lookbook/`
(7 looks) — the images are Higgsfield Soul 2.0 renders, 1200px JPG. The film's
HEVC master is not in the repo.

## 2026-09-08

**`optimize-3d-scene` skill — resize no longer switched off on touch.** §13 of
the skill (and `patterns.md` §5 / §14) told agents to attach *no* `resize`
listener on the mobile tier, to dodge the iOS URL bar. That also removed the
only path that could react to a breakpoint drag, a rotation or DevTools
emulation being turned off, so a scene loaded as a phone kept its phone
framebuffer, frame budget, parked pointer and hidden desktop passes on a desktop
viewport and rendered skewed. The skill now listens on every tier, ignores
height-only changes on a coarse pointer, and re-reads the tier on a width
change or a pointer-media-query flip, with a `retune()` that re-applies DPR,
budget, visibility, draw range and pointer binding without compiling a program.
§2 and §11 of `SKILL.md` and the [[optimize-3d-scene]] workflow note were
updated to match; §14 gained a tier-switch round-trip check. Reasoning in
[[decisions-log]] ADR-0023. Measured on the project that surfaced it: phone
390×844 / 3 draws ↔ desktop 2160×1350 / 4 draws, program count unchanged.
