---
tags: [architecture, stable]
updated: 2026-09-14
---

# Folder Structure

Where everything lives and what belongs where. The repo has two top-level concerns:
the **app** (`src/`) and this **vault** (`obsidian/`).

## Repo root

```
next16-claude-starter/
├── src/                     ← application code (see below)
├── public/                  ← static assets (see "public/" section below)
├── obsidian/                ← this Obsidian vault — ALL project documentation
├── .claude/                 ← agent execution layer — see [[agent-harness]]
│   ├── settings.json        ← hooks + permissions
│   ├── scripts/verify.sh    ← mechanical hard-rule checks
│   ├── rules/               ← path-scoped context (auto-loads per file read)
│   ├── skills/              ← procedures loaded on demand
│   ├── agents/              ← subagent definitions
│   └── commands/            ← slash commands
├── app config files         ← next.config.ts, tsconfig, eslint, postcss
├── .nvmrc                   ← pinned Node for local dev (see [[tech-stack]] → Runtime)
├── README.md                ← project README → points into the vault
├── AGENTS.md                ← agent guide — breaking-change warning, hard rules, vault pointer
├── CLAUDE.md                ← Claude Code entry → @AGENTS.md
└── .cursorrules             ← Cursor entry → @AGENTS.md
```

All documentation lives in the vault. The root `AGENTS.md` / `CLAUDE.md` /
`.cursorrules` are thin shims that carry the hard rules and point into it —
see [[ai-agent-guide]]. `.claude/` holds the execution layer: hooks and
permissions in `settings.json`, plus the commands, rules, skills, agents and the
`verify.sh` check script — see [[agent-harness]].

## `src/` — application code

```
src/
├── env.ts                  # zod-validated env (public + server-only split)
│
├── app/                    # the framework routes — keep lean, routing only
│   ├── layout.tsx          # Root layout — provider tree lives here
│   ├── page.tsx            # Route → delegates to a view
│   ├── api/<resource>/route.ts  # API endpoints — see [[api-architecture]]
│   ├── loading.tsx         # Suspense fallback (enables streaming)
│   ├── error.tsx           # Route-segment error boundary
│   ├── not-found.tsx       # 404 page
│   ├── robots.ts           # → /robots.txt
│   ├── sitemap.ts          # → /sitemap.xml
│   ├── globals.css         # the utility generator config + design tokens
│   └── favicon.ico
│
├── views/                  # Page-level components — one per route
│   ├── home.tsx            # HomeView — Server Component, composes the leaves below
│   └── home/               # the home page's client sections (feature leaves)
│       ├── preloader/      # preloader · odometer
│       ├── scene/          # house-scene (pinned 1400vh track) · sequence-canvas · hero-block
│       │                   #   echo-panel · details-panel · stat-counter · zoom-overlays
│       │                   #   showreel · track-marker
│       ├── reviews/        # reviews · testimonial
│       ├── footer/         # site-footer (reveal footer) · wordmark
│       └── dock/           # dock · dock-sentinel
│
├── data/mocks/home.ts      # Keld Studio copy, typed HomeContent — passed down as props
│
├── layouts/                # Reusable layout wrappers
│   └── scroll-layout.tsx   # Lenis smooth-scroll wrapper
│
├── components/
│   ├── ui/                 # Design-system primitives — arrow-link · grid-lines · reveal-lines · icons
│   ├── common/             # Shared infrastructure (Cookie, grid, ReducedMotion, Skeletons)
│   └── animation/springs/  # ⚠️ Animation engine — #do-not-modify
│
├── hooks/                  # Custom hooks, grouped by domain
│   ├── animation/          # ⚠️ Animation hooks — #do-not-modify
│   ├── scene/              # useSceneStore — the home page's shared Zustand store
│   ├── smooth-scroll/      # useScroll Zustand store
│   └── use-window-size.ts · use-adaptive-grid.ts
│
├── lib/                    # Third-party client init / global config
│   ├── animation/ticker.ts # Shared app-wide requestAnimationFrame loop
│   ├── api/                # API route-handler helpers (handle, ApiError)
│   ├── api-client.ts       # Typed same-origin /api fetch wrapper (client)
│   ├── scene/frames.ts     # Frame-sequence tiers, paths, ordered loader (client-only)
│   ├── site.ts             # Site-wide SEO config (single source of truth)
│   └── springs/            # config.ts (global animation config) · presets.ts (spring configs, letter reveals)
│
├── utils/                  # Pure utility functions (no side effects)
│   ├── animation/coords.ts
│   ├── seo/generate-page-metadata.ts · seo/structured-data.ts
│   ├── timeline/           # range.ts · scene.ts · footer.ts — scroll-timeline selectors
│   ├── is-bot.ts · is-bot-agent.ts · lvh.ts · math.ts · scroll-to.ts
│
├── types/                  # Shared TypeScript types
│   └── springs.ts
│
└── style/                  # Extra CSS layers imported into globals.css
    └── index.css
```

The home page sets the pattern for every page. The view file stays a Server
Component that only assembles sections. Each section is a client leaf folder
under `views/<page>/`, its content comes from `data/mocks/<page>.ts` through
props, and shared scroll math lives in `utils/timeline/`. Catalogs:
[[components/ui]] · [[hooks]] · [[utils]]. The full story is in [[changelog]]
2026-09-14.

## `public/` — static assets

```
public/
├── favicon.ico, *-icon-*.png, manifest.json, browserconfig.xml, open-graph.png
│                            # site-level meta / PWA / SEO assets — stay at the root
└── assets/                  # site content assets (images, video, …)
    ├── scene/               # sequence/desktop/000–209.webp · sequence/mobile/000–104.webp
    │                        #   interior-echo.webp · interior-details.webp
    │                        #   showreel.mp4 · showreel-poster.webp
    ├── testimonials/        # founder.webp
    └── footer/              # footer-bg.webp
```

The frame-sequence tiers are re-encoded, not copied from the source. Their
counts must match `FRAME_TIERS` in `lib/scene/frames.ts` ([[decisions-log]]
ADR-0025).

> [!important] Asset convention
> Content assets used **on the site** (images, videos, …) live under
> `public/assets/`, and **each section gets its own folder** — e.g.
> `public/assets/hero/`, `public/assets/footer/`. Reference them by absolute
> path (`/assets/hero/bg.webp`). Meta/PWA/SEO assets (favicons, icons,
> `manifest.json`, `open-graph.png`) stay at the `public/` root.

## Placement rules — where do I put a new file?

| I am adding… | It goes in… |
|--------------|-------------|
| A route | `app/<route>/page.tsx` — 3 lines, delegates to a view |
| An API endpoint | `app/api/<resource>/route.ts` — see [[api-architecture]] |
| A page's UI | `views/<page-name>.tsx` — see [[new-page]] |
| A page's section (client leaf) | `views/<page-name>/<section>/` — next to its view; `verify.sh`'s `"use client"` WARN checks only `views/*.tsx` |
| Scroll-timeline math (phases, `p.to` selectors) | `utils/timeline/<scene>.ts` — ADR-0024 |
| Spring configs / letter-reveal presets | `lib/springs/presets.ts` |
| A reusable design primitive | `components/ui/` |
| Shared infra (provider-dependent) | `components/common/` |
| A feature-specific component | next to the feature, **not** in `components/` |
| A custom hook | `hooks/<domain>/` |
| A pure helper | `utils/<domain>/` |
| A shared type | `types/` |
| Mock/placeholder data | `src/data/mocks/<page-name>.ts` (create folder as needed) |
| A third-party client init | `lib/` |
| A site content asset (image, video) | `public/assets/<section>/` — one folder per section |
| A favicon / icon / OG / manifest asset | `public/` root |

## Do-not-modify zones

`components/animation/springs/` and `hooks/animation/` are the animation engine.
Treat them as a vendored library — consume them, never edit them. See [[animation-system]].

## Related

[[system-overview]] · [[component-conventions]] · [[routing]] · [[agent-harness]]
