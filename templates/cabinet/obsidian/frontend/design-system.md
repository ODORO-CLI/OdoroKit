---
tags: [frontend, design-system, stable]
updated: 2026-09-15
---

# Design System — the utility generator

Styling uses **the utility generator**, configured entirely in CSS. There is **no
the generator's config**. ADR: [[decisions-log]] ADR-0004.

## Where config lives

`src/app/globals.css` is the single config file. Extra CSS layers can be split
into `src/style/index.css` and imported.

The import is scoped: `@import "the utility generator" source("../")` limits class
detection to `src/`. Without it the utility generator auto-scans the whole repo, so class
*patterns* written in documentation — `duration-[var(--duration-*)]` in the vault
and in `.claude/` — are parsed as real candidates and emit CSS build warnings.
Documentation is not a source of utilities.

## Token naming convention

> [!important] This convention is **strict and portable by design**
> It is intended to be identical in every project built from this starter, so an
> agent or developer moving between them can predict a token's name without
> reading the file. Deviating in one project defeats the point. ADR: [[decisions-log]] ADR-0015.

Tokens are organised in **three tiers**. Each tier may only reference the tier
below it, and **no tier may be skipped** — semantic tokens are what make a
re-theme or a rebrand a one-line change instead of a find-and-replace.

| Tier | Grammar | Lives in | Example | Usable in markup? |
|------|---------|----------|---------|-------------------|
| **1 — Primitive** | `--raw-<category>-<name>[-<shade>]` | `:root` | `--raw-color-neutral-950` | ❌ never |
| **2 — Semantic** | `--<role>[-<variant>][-<state>]` | `:root` | `--background`, `--action-primary-hover` | ❌ only via its Tier-2 binding |
| **3 — Component** | `--<tw-namespace>-<component>[-<property>]` | `@theme inline` | `--radius-button` | ✅ `rounded-button` |

Plus the **theme binding**, which is what actually creates the utilities:

```css
@theme inline {
  --color-background: var(--background);   /* --<tw-namespace>-<role>: var(--<role>) */
}
```

### The rules

1. **Only Tier 1 contains literals.** A hex, px, or ms value anywhere else is a bug.
2. **Tier 2 names describe purpose, never appearance.** `--action-primary`, not
   `--blue`. `--surface-raised`, not `--grey-light`. If renaming the colour would
   force renaming the token, the name is wrong.
3. **Tier 2 is the themeable layer.** Dark mode and any runtime theming override
   Tier 2 tokens — never Tier 1, never a `@theme` entry.
4. **Every `@theme inline` entry is exactly `--<namespace>-<role>: var(--<role>)`.**
   No literals, no `calc()`, no skipping to `var(--raw-*)`.
5. **kebab-case, singular, unabbreviated.** `--raw-color-neutral-950`, not
   `--raw-clr-neutrals-950`. State goes last: `--action-primary-hover`.
6. **Tier 3 is rare.** Per ADR-0012 a repeated pattern is a React component, not a
   token set. Reach for a component token only when the same value must be shared
   across components that cannot import each other.

### Why Tier 2 is separate from `@theme`

`@theme inline` **inlines** each `var()` into the generated utility. That is what
makes overriding the Tier 2 token in a `prefers-color-scheme` block cascade into
every `bg-background` on the page. Binding a literal — or a `var(--raw-*)` —
directly in `@theme` freezes the value at build time and silently breaks theming.
The indirection is load-bearing, not ceremony.

### Namespaces that generate utilities

A token only becomes a utility if its prefix is a utility generator namespace. Verified
against the utility generator v4.3.3 (the installed version):

| Namespace | Generated utilities |
|-----------|--------------------|
| `--color-*` | `bg-*`, `text-*`, `border-*`, … |
| `--spacing-*` | `p-*`, `m-*`, `gap-*`, … |
| `--radius-*` | `rounded-*` |
| `--leading-*` | `leading-*` |
| `--tracking-*` | `tracking-*` |
| `--text-*` | `text-*` (size) |
| `--font-*` | `font-*` |
| `--ease-*` | `ease-*` |
| `--shadow-*` / `--blur-*` / `--animate-*` | `shadow-*` / `blur-*` / `animate-*` |
| `--breakpoint-*` / `--container-*` | `sm:` … / `max-w-*`, `w-*` |
| `--aspect-*` | `aspect-*` (first used here for `aspect-showreel`) |

> [!warning] There is **no `--duration-*` namespace** in the utility generator
> `--duration-fast` in `@theme` generates nothing and is not even emitted — a
> `duration-fast` class silently does nothing. Durations therefore stay **Tier 2
> only** and are consumed as `duration-[var(--duration-fast)]`. (Guides that list
> `--duration-*` alongside `--ease-*` are wrong for v4; `--ease-*` *is* real.)

If a value's prefix is not in that table, it is not a utility — either pick the
right namespace or use it via `var()` in an arbitrary value.

> [!important] The token rule
> **Never** hardcode hex values, pixel spacing, or named colours in `className` or
> inline styles. If a value doesn't exist as a token, **add it to `globals.css`
> first** — as a Tier 1 primitive plus the Tier 2 semantic token that names its
> purpose — with a comment noting where it came from (e.g. a Figma frame).

## CSS layers

Every custom style goes inside a layer — never outside one:

```css
@layer base {        /* element resets & defaults: h1, p, a … */ }
@layer components {  /* pseudo-elements & 3rd-party overrides only — see below */ }
@layer utilities {   /* single-purpose helpers: .scrollbar-none … */ }
```

## Where a style goes (ADR-0012)

`globals.css` is **not** a place to park component styles — it holds tokens and
base resets and stays a few hundred lines forever. Follow this order; the first
match wins:

| Situation | Goes where |
|-----------|-----------|
| One-off styling | the utility generator utilities in `className` — nothing in CSS |
| Repeated pattern with markup / structure / props | a **React component** in `components/ui/` |
| Repeated *pure-utility* combo, no structure | a utility generator `@utility` |
| Pseudo-elements, 3rd-party DOM overrides, complex selectors | `@layer components` — the genuine exceptions |
| A new colour / spacing / radius value | a **token** in `:root` + `@theme` |

> [!important] The default answer to "this looks repeated" is a **React
> component**, not a CSS class. An eyebrow label with a `::before` dot is an
> `<Eyebrow>` component — not a `.label-eyebrow` global class. `@layer
> components` is for what utilities and components genuinely *cannot* express.

There are **no CSS Modules** in this project — utilities + components cover
every case (motion is spring-based, so there are no keyframes to co-locate).

## Current theme state: Cabinet Odoro

The theme was filled for the Keld Studio rebuild ([[changelog]] 2026-09-14) and
re-tinted for Cabinet Odoro ([[changelog]] 2026-09-15): the GetLayers Style
*Wanderlust* under the *Noir Vermillion* palette — one warm cream ink on a warm
near-black, one sand section, one burgundy accent that is rationed to marks
and to the reviews' muted ink. The choices are recorded in `getlayers.json`.
Every Tier 1 line carries a comment saying where it is used.

**Single theme, on purpose.** The site is a dark cinematic scene with one sand
section. The starter's `prefers-color-scheme` override was removed. If a second
theme is ever needed, override Tier 2 in `:root`, never `@theme`.

### Colour

| Tier 1 primitive | Tier 2 role (`bg-*` / `text-*`) | Used for |
|---|---|---|
| `--raw-color-neutral-950` `#0a0908` | `--background`, `--surface-glass` | page ground; dock and contact-button glass |
| `--raw-color-black` | `--background-media` | true black under moving media |
| `--raw-color-cream-100` `#f7eedf` | `--foreground` | the single ink on dark |
| `--raw-color-burgundy-600` `#8e1617` | `--accent`, `--foreground-inverse-muted` | the ✦ marks, the reviews' pager and muted ink |
| `--raw-color-sand-300` `#e8c99a` | `--accent-glow`, `--surface-inverse` | brass glow; the client-stories section |
| `--raw-color-sand-400` `#d9b785` | `--surface-inverse-sunken` | portrait placeholder |
| `--raw-color-ink-900` `#1a1410` | `--foreground-inverse` | copy on sand |
| `--raw-color-neutral-900` `#171412` | `--surface-glass-raised` | glass hover, Expertises panel tint |
| `--raw-color-burgundy-950` `#23080a` | `--surface-footer`, `--surface-warp` | footer ground under the photograph; the star's final colour |

The accent is never a fill: the star's screen-filling finale is `--surface-warp`
(deep oxblood), a role of its own, precisely so the burgundy stays rare.

The source wrote its glass as `rgba()` of the two near-blacks. The alpha now
lives in the utility (`bg-surface-glass/85`), so each colour is one token.

### Durations and easing

`--duration-fast` 200 ms (icon hovers), `--duration-normal` 350 ms (buttons, dock,
links), `--duration-slow` 600 ms (showreel grayscale → colour). They are Tier 2
only and consumed as `duration-[var(--duration-*)]`. The easings are
`ease-entrance` (from the starter) and `ease-glide`, `cubic-bezier(0.25, 1, 0.5, 1)`,
which is the source's easeOutQuart hover curve for buttons, the dock and the
showreel.

### Type scale

The chain is `--raw-font-size-*` → `--font-size-*` → `--text-*`. The source's
`clamp()` sizes were evaluated at 1440 and written as rem on the 1440 grid base
(px / 16), so they scale with the [[components/common|adaptive grid]]. `-tablet`
is the 1024 base and `-phone` the 360 one. Sizes are applied mobile-first:
`text-display-phone sm:text-display-tablet lg:text-display`.

| Utility | At its base | For |
|---|---|---|
| `text-display` · `-tablet` · `-phone` | 190px · 14vw on 1024 · 60px | hero words, stats, preloader count |
| `text-display-panel` | 120px | the Expertises title — ten serif letters on one line in the half panel |
| `text-stat-phone` | 36px | phone stats, which sit above the dock |
| `text-headline` · `-phone` | 40 · 26px | quote, footer CTA, zoom title |
| `text-title` · `-phone` | 32 · 20px | panel labels, details title, preloader label |
| `text-lead` | 18px | author name, footer links |
| `text-body` · `-phone` | 16 · 14px | descriptions, stat labels |
| `text-caption` | 13px | tracked-out caps labels |
| `text-badge` | 11px | PLAY cursor badge |
| `text-quote-mark` · `-phone` | 160 · 80px | the testimonial's quote mark |
| `text-wordmark` · `-phone` | 30vw · 34vw | footer "Odoro". Viewport units on purpose: one word fills the width |

**Leading** (Tier 2 `--line-height-*`): `leading-display` 1.1 (the starter's clip
floor), `leading-hero` 0.9, `leading-wordmark` 0.75, `leading-heading` 1.15,
`leading-copy` 1.5.
**Tracking** (Tier 2 `--letter-spacing-*`): `tracking-display` −0.02em, `-title`
−0.01em, `-copy` −0.01em, `-caps` 0.22em, `-caps-wide` 0.25em. Display and
title were loosened from −0.04 / −0.02em when Cormorant replaced the grotesk.

> [!warning] `leading-hero` and `leading-wordmark` are below the 1.1 floor
> They exist for text that is never clipped: display words and the wordmark.
> Never pair them with TextEngine `overflow` ([[text-engine]]). `verify.sh`
> only catches `leading-none` + `overflow`, so it will not flag this.

### Scene geometry

These are viewport-relative, as in the source. Tier 2 names are `--size-*` /
`--ratio-*`.

| Token → utility | Value | For |
|---|---|---|
| `--container-showreel` → `w-showreel` / `max-w-showreel` | 65vw | the showreel frame before it zooms |
| `--aspect-showreel` → `aspect-showreel` | 65 / 37 | its ratio |
| `--container-overlay-lead` / `-aside` | 48vw / 22vw | zoom-title and address columns |
| `--container-star` → `w-star` | 156.25rem (2500px) | the star is laid out huge and scaled **down**, so its screen-filling end state rasterises crisp rather than upsampled |
| `--spacing-footer-reveal` → `h-footer-reveal` | 85vh | the fixed footer's height **and** the spacer that uncovers it: one token so they cannot drift |
| `--spacing-wordmark-drop` | `calc(9vw - 12.5rem)` | seats the wordmark on the footer's bottom edge |

### Base layer and grid bands

`@layer base` now holds the adaptive-grid `html { font-size }` bands, at
**1440 / 1024 / 640** (640 lays out on a 360 base), plus the `body` rule
(background, foreground, `overflow-x: clip`, antialiasing). There is no 1920
band: the design is authored at 1440, and above that `AdaptiveGrid` scales up.
Keep the bands in sync with `grid.config.ts` ([[components/common]]).
`@layer components` and `@layer utilities` are still empty.

> [!note] Literals inside `@theme inline` `#todo`
> `--leading-display: 1.1`, `--ease-entrance` and the new `--ease-glide` are
> bound as literals in `@theme inline`, which contradicts rule 4 above.
> `verify.sh`'s `@theme` literal check does not flag them. The inherited two
> predate this project. Nobody has decided whether leading and easing get Tier
> 1 + Tier 2 tokens or rule 4 gets a stated exception.

## Motion: springs first, CSS for trivial state

Hard rule #1 stands — **all real motion is spring-based** ([[animation-system]]).
There is one narrow exception, added because wiring a spring for a colour fade on
hover costs a client component and a hook for no benefit. ADR: [[decisions-log]] ADR-0014.

**CSS transitions are allowed only for simple, discrete state changes:**

| Allowed (CSS) | Not allowed (use a spring) |
|---------------|---------------------------|
| `hover:` / `focus-visible:` / `active:` colour, `opacity`, `border-color`, underline | anything scroll-driven |
| Small decorative nudges (an arrow shifting a few px on hover) | enter/reveal animations → `<Inview>` |
| | text animation → [[text-engine]] |
| | layout/size changes, orchestrated or staggered sequences |
| | anything that must be interruptible or physical |

Conditions — all three, or it is a spring:

1. **Token-backed timing.** Duration and easing come from tokens — never raw
   values: `transition-colors duration-[var(--duration-fast)] ease-entrance`.
2. **`transition-*` only.** `@keyframes` remain **banned** outright — an
   animation long enough to need keyframes is long enough to deserve a spring.
3. **Utilities only.** The transition lives in `className`, not in a CSS file.

```tsx
<a className="text-foreground/70 transition-colors duration-[var(--duration-fast)]
              ease-entrance hover:text-foreground">
  Contact
</a>
```

If you are reaching past this list, you want `<Hover>` — see
[[components/animation-springs]].

## Typography

Two faces, both the framework's font loader (latin, `display: swap`), loaded in
`src/app/layout.tsx` and exposed on `<body>`:

- **Cormorant** (400 / 500 / 600 + italic) → `--font-cormorant` → `--font-display`
  → `font-display`. Display only: hero words, the Expertises title, stats, the
  odometer, the quote (italic), the footer CTA, the zoom title, the wordmark.
  A high-contrast serif falls apart below ~28px — never body.
- **Inter Tight** (variable) → `--font-inter-tight` → `--font-sans`. Labels,
  navigation, captions and copy; uppercase is applied in CSS, never in the copy.

Instrument Sans (the Keld Studio face) is gone. One type system per site: do
not add a third family.

## Styling rules

- Use utilities in JSX `className`; keep class strings short and readable.
- Extract a repeated pattern to a **React component** — not a `@layer
  components` class. See *Where a style goes* above (ADR-0012).
- Mobile-first responsive: `sm:` / `md:` / `lg:` / `xl:` prefixes.
- Dark mode: `dark:` prefix or Tier 2 overrides in a `prefers-color-scheme` block.
  This project has neither: it is single-theme (see *Current theme state*).
- No inline `style` except for dynamic values (e.g. spring-animated values).
- Motion is spring-based; CSS `transition-*` only for the narrow hover/focus case
  above — never `@keyframes`.

## Related

[[component-conventions]] · [[animation-system]] · [[new-page]]
