---
tags: [meta, changelog]
updated: 2026-09-14
---

# Changelog

Chronological log of notable changes to **this project**. Newest first.
Human-curated — not a mirror of `git log`.

Log a change here when it would surprise someone returning in six months: a new
dependency, a new route or section, a convention bent, a bug whose cause is worth
remembering. Routine commits do not need an entry.

For *why* the conventions are what they are, see [[decisions-log]].

---

## 2026-09-14 — ODORO landing: the whole page

**Brief.** A landing template for ODORO, a Parisian jewellery house — gold and
silver, champagne light, a woman wearing the pieces, a moment where the pieces
themselves move. No payments: the page sells a reservation, not a cart. Built
with the GetLayers library end to end (ADR-0024).

**Design system.** `globals.css` now carries the committed Style: GetLayers
`wanderlust-style` re-tinted with `halcyon-palette` and re-typed with
`cormorant` — night `#03060f` ground, one cream ink at four alphas, silver
`#98958d` as the muted ink and the one inverted band, gold `#ffe49a` rationed
to a lamp, a button and `::selection`. Cormorant (display, headline-only) and
Inter Tight (everything else) via `next/font/google`. One dark theme, no
`prefers-color-scheme` override. Adaptive grid re-based to 1440
(`grid.config.ts`, `AdaptiveGrid coef={1}`). See [[design-system]].

**Hero.** Ported from the GetLayers template *Wanderlust* as a preserved-motion
section (ADR-0025): the preloader (`components/common/preloader/`), the
footage-and-viewfinder hero (`views/home/hero/`), the site-chrome store, the
reveal-text engine and `SegmentedText`. Renamed for the brand
(`explore → cta`, `destinations → collections`); the clip runs at 1.75× with a
9s fallback; a scroll-linked exit parallax was added on the picture plate
(`EXIT_PARALLAX`). See [[hero]].

**Sections.** Manifesto, Collection, Film, Atelier, Editions, Reserve, Footer —
each built to a named GetLayers composition and documented in [[sections]].
New shared pieces: `ui/eyebrow.tsx`, `ui/action-link.tsx`,
`lib/motion/reveals.ts`, `hooks/use-prefers-reduced-motion.ts`, `types/media.ts`.
New utilities in `globals.css`: `text-trim`, `min-h-viewport`, `h-viewport`,
`pull-viewport`.

**Media.** All imagery generated for the brand through Higgsfield: eight stills
with nano banana 2 at 2K (hero frame, levitation frame, three product shots, three
editorial portraits), two clips with Seedance 2.5 at 1080p / high bitrate from
those frames as start images (jobs `1d8f787e…` hero, `1b2abf5b…` film). Clips
shipped as H.264 re-encodes of the HEVC masters (ADR-0026); the hero's closing
still is the clip's own last frame. `open-graph.png` cut from the hero frame.

**Content.** All copy is French and lives in `src/data/mocks/home.ts`;
`siteConfig` is ODORO; OG locale `fr_FR`; `<html lang="fr">`.

**Fixes after the first visual pass.** The starter's English cookie banner is
no longer mounted (nothing to consent to on a template; re-enable and translate
when tracking is added). The manifesto's measure is six columns so it never sits
under the fixed nav. The film plate is over-scanned (`OVERSCAN` 1.12) so the
scroll drift never bares cinema black at the section's edges, and its veil runs
0.5 → 0.82. The preloader's hard cap now actually lifts the card on a stalled
clip (ADR-0025 amendment). The spacing step `block` was renamed `stack`: it
made Tailwind emit `inline-block { inline-size: 4.5rem }` and broke every
letter-by-letter reveal (ADR-0029).

**Tooling.** `verify.sh`: the `duration-fast` rule no longer matches inside
`var(--duration-fast)` (it flagged the correct form), and the ADR-0014 timing
check accepts the shared `${hoverTiming}` constant. `node_modules` and `.next` live in
`.nosync` folders behind symlinks because the project sits in the
iCloud-synced Desktop (ADR-0028).

**Repository.** Prepared for GitHub on 2026-09-15: package renamed
`odoro-landing-template`, README rewritten for the template, `.gitignore`
covers the `.next` symlink and the `captures/` QA screenshots, PWA manifest
named for the brand. The starter's Unlicense file is untouched — choosing a
licence for the template is the owner's call.

**State.** `getlayers.json` at the root records the Style, tokens, palette,
font and the placed compositions — read it before adding a section.

## 2026-09-08

Baseline — built from `next16-claude-starter` v0.1.0.

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
