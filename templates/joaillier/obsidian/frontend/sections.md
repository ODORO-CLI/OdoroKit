---
tags: [frontend, section, stable]
updated: 2026-09-14
---

# Sections — the ODORO home page

Every section below the hero lives in `src/views/home/<section>/` as a client
leaf with its own `<section>.types.ts`, taking all copy and media through props
from `src/data/mocks/home.ts`. The hero has its own note: [[hero]].

Each section was built to a **GetLayers composition** — an abstract layout
skeleton chosen from the library (`getlayers_compositions`) and then skinned
with the committed Style. The composition id is recorded here and in
`getlayers.json → placed`, so a section can be *recomposed* (swapped for
another skeleton of the same role) without touching its content. ADR-0024.

## Page rhythm

| # | Section | Composition | Density | Ground |
|---|---------|-------------|---------|--------|
| 0 | Preloader | `loader` (Wanderlust) | — | cinema black |
| 1 | [[hero\|Hero]] | `wanderlust-hero` — the viewfinder opening on footage | balanced | footage |
| 2 | Manifesto | `artist-statement` | sparse | night |
| 3 | Collection | `vexon-showcase` | balanced | night |
| 4 | Film | `negantropy-entropy` → `-choice` → `-persist` | sparse | footage |
| 5 | Atelier | `artist-cta` — **the one inverted band** | sparse | silver |
| 6 | Editions | `lumora-portfolio` | balanced | night |
| 7 | Reserve | `altitude-cta` | sparse | night |
| 8 | Footer | — | — | night |

`sparse → balanced → sparse` is the rhythm; three dense blocks in a row would
read as a spreadsheet. Motion energy stays within one step of the brief
(`lively` / `subtle`): the single `intense` moment is the hero's assembly and it
lands nowhere else.

## The reveal vocabulary — `src/lib/motion/reveals.ts`

Four arrivals, shared by every section so the page agrees with itself:

| Export | For | Mechanic |
|--------|-----|----------|
| `LINE_REVEAL` | headings | `TextEngine` line by line — rise 36px, unblur 12px, fade; 120ms stagger over 1000ms |
| `WORD_REVEAL` | the manifesto passage | `TextEngine` word by word — 38ms stagger over 900ms |
| `RISE` | paragraphs, cards, buttons | `<Inview mode="once">` — 24px rise on a 90/26 spring |
| `SETTLE` | photographs | `<Inview>` — from `scale(1.06)`, 70/28 |

**Nothing clips.** A blurred reveal under `overflow: hidden` has its halo
sheared at the line box, which is the whole effect gone — so no `overflow`, and
therefore no leading floor to respect: the display faces keep their tight
absolute leading. Opacity lands early on the curve (`easeOutCubic`) so type is
solid while still travelling, which is what reads as expensive.

> [!note] Two text engines on one page, on purpose
> The hero's display lines use `RevealTitle` from `ui/reveal-text.tsx` — the
> Wanderlust engine, ported with the section because its motion layer is
> `preserve` and it is cued by the assembly, not by the viewport. Every section
> below the fold uses the starter's `spring-text-engine`, which is the house
> rule. They share the same three properties (rise, unblur, fade) and the same
> curve family, so the eye does not see two systems. ADR-0027.

Below the fold nothing is gated on the loader: every reveal is plain
viewport-entry, `once`. Don't gate what nobody can see.

## Manifesto — `manifesto/`

`artist-statement`. An eyebrow, one passage promoted to `text-statement`
(44px) in the display face across a measure narrower than its neighbours
(columns 3–10 of 12), and an italic signature in silver. No heading — the
paragraph does a headline's job, and scale is the only typographic move. A
pause beat between the assembly and the cards; it works because nothing
competes.

## Collection — `collection/` (+ `collection-card.tsx`)

`vexon-showcase`. Heading row split 4|8 — the `/ LA COLLECTION` label alone on
the left, the statement and paragraph on the right — over an even row of three
4:5 cards. Each card: four corner brackets (`foreground-accent-muted`, full
cream on hover), an `[01]` index tag, the photograph filling the box, a
bottom scrim (`scrim-panel` → transparent) and a title-over-caption footer with
the price and the `Réserver →` link opposite. Pointing at a card scales the
photograph 1.04 on a spring (`<Hover trigger={cardRef}>`) — a real transform,
so not a CSS transition (ADR-0014). Cards arrive 130ms apart.

## Film — `film/` (+ `film-chapter.tsx`)

Three scroll chapters over one persistent clip. The stage is `sticky top-0
h-viewport` for the height of the track; the chapters container is pulled up by
one viewport (`pull-viewport` utility) so chapter I is on the picture from the
first frame.

| Value | What it drives |
|-------|----------------|
| `useProgressTrigger` `top bottom → bottom top` on the track | one 0→1 for the whole passage, written to a `SpringValue` off the ticker |
| `DRIFT` 0.1 | the plate travels a tenth of its height across the track — depth |
| `SWELL` 0.12 | the plate is largest at the middle of the track |
| `VEIL` 0.45 → 0.8 | `scrim-scene` deepens as the reader goes further in |
| `GRAIN_OPACITY` 0.22 | the hero's emulsion, **held still** — one stepping loop per page |

The clip loops muted and plays only while the track is within 25% of the
viewport (an `IntersectionObserver`, not a scroll handler). Under reduced
motion it never starts — the poster is the picture — and `drift` parks at 0.5.

Chapters `left` / `right` are the corner-loaded pair (`negantropy-entropy` /
`-choice`): heading anchored to the bottom of a 7-column block, the bracketed
`( I ) — L'OR` meta and a short body starting high in the opposite 4 columns.
`center` (`negantropy-persist`) breaks the rhythm so the closing beat reads as
arrival and gives the pill CTA the whole axis. Heading lines are one
`TextEngine` each, the second continuing the first's delay (140ms).

## Atelier — `atelier/`

`artist-cta`. A full-viewport tonal inversion: the ground is `surface-band`
(the palette's silver `#98958d`) and the type is `foreground-ink` (night) — the
ONE lighter surface on the page. Copy column capped at 34rem in the left six
columns; the portrait plate starts at column 8 so a whole column stays empty
between them. The layout is deliberately plain: the arrest is the ground
change. The button is the `pill-ink` variant of `ActionLink`.

## Editions — `editions/`

`lumora-portfolio`. A centred outlined eyebrow chip and a centred heading over
a two-up grid of 3:4 cards. Each card is a frame: hairline border,
`surface-card` fill, a meta row (`N°01 — PROFIL`) pinned to the top edge with
the wordmark's italic `O` ghosted at 20% opposite it, and the title at the foot
over a `scrim-panel` gradient.

## Reserve — `reserve/`

`altitude-cta`. Under a two-line display heading, one rounded translucent
capsule (`surface-glass` + `backdrop-blur`) holds two unlabelled fields and the
gold action pill inset flush against its own right edge — a pill inside a pill,
which is what makes it read as one object. Labels exist for assistive tech
(`sr-only`) and are not drawn. Below `md` it opens into a stacked card.

The `<Inview tag="form">` carries `onSubmit` straight through to the animated
form. It posts `{ name, email, message }` to the starter's `/api/contact`
(`apiFetch`), which logs server-side until `CONTACT_ENDPOINT` is set. Four
states: `idle` / `sending` / `sent` (the capsule is replaced by a `role="status"`
line) / `error` (`role="alert"` under it).

## Footer — `footer/site-footer.tsx`

The bookend: the wordmark at 12vw in the display face, three link columns in a
7-column nav, the tagline and social links in the right four columns, a
hairline and the legal line. `useFooterWatch(panelRef)` tells the chrome store
the footer is on screen so the hero's fixed wordmark and nav stand down — the
footer prints the same wordmark larger ([[hero#The wordmark and the nav are the site's header]]).

## Shared UI — `src/components/ui/`

| Component | Role |
|-----------|------|
| `Eyebrow` | small-caps label with a lead rule; `tone="ink"` for the silver band |
| `ActionLink` | `rule` (label over a wiping hairline, the hero's link language) · `pill` (the gold action) · `pill-ink` (inverted for the band). Exports `focusRing` and `hoverTiming` so every control shares one focus treatment and token-backed timing |
| `SegmentedText` / `RevealTitle` / `RevealWords` | Wanderlust's display-line primitives, used by the hero and the preloader |

## Assets

`public/assets/<section>/` — one folder per section, all generated for ODORO
(nano banana 2 stills at 2K, Seedance 2.5 clips at 1080p; see the changelog).
Both clips are **H.264** re-encodes of HEVC masters (ADR-0026); the hero's
`hero-still.jpg` is the clip's own last frame, extracted with ffmpeg, so the
closing dissolve changes detail and nothing else.

## Related

[[hero]] · [[animation-system]] · [[text-engine]] · [[design-system]] · [[decisions-log]]
