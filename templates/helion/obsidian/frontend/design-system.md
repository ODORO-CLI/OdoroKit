---
tags: [frontend, design-system, stable]
updated: 2026-09-11
---

# Design System — the utility generator

Styling uses **the utility generator**, configured entirely in CSS. There is **no
the generator's config**. ADR: [[decisions-log]] ADR-0004.

## Where config lives

`src/app/globals.css` is the single config file:

```css
@import "the utility generator";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-onest);
}
```

Extra CSS layers can be split into `src/style/index.css` and imported.

## Design tokens

All colours, spacing, font sizes, radii, and shadows are **tokens** declared under
`:root` (raw values) and `@theme inline` (the utility generator bindings).

Once a token is in `@theme`, it becomes a utility automatically:

| Token | Generated utilities |
|-------|--------------------|
| `--color-brand` | `bg-brand`, `text-brand`, `border-brand` |
| `--radius-card` | `rounded-card` |
| `--spacing-section` | `pt-section`, `mt-section`, … |

> [!important] The token rule
> **Never** hardcode hex values, pixel spacing, or named colours in `className` or
> inline styles. If a value doesn't exist as a token, **add it to `globals.css`
> first** — with a comment noting where it came from (e.g. a Figma frame).

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

## Current theme state

The theme is **ODORO's warm family** — the Helion template re-tinted onto the
GetLayers palette `negantropy-palette` and the brand orange ([[decisions-log]] ADR-0045):

| Group | Tokens |
|-------|--------|
| Surfaces | `background` (`#050608`, a warm near-black), `foreground` (`#f5ede0`, a warm cream — the ink), `surface-deep`, `surface-panel`, scrollbar pair |
| Accent ramp | `accent-900` (`#0b0705`) … `accent-200` (`#ffedd5`) — the **brand orange** family, darkest → lightest, with `accent-500` (`#f97316`) the signature. The dark end is the near-black rust the WebGL scenes sit *inside*; the light end stays a legible pale peach for eyebrows and CTAs. |
| Signal | `signal-glow` (`#ffcf7a`), `signal-ring` (`#ffe6c2`) — the **heat**, a white-gold inside the family, never a second hue. It carries the CTA glow and, in the scene, only the galaxy's rarest specks, the plume's white-hot spine and the maelstrom's lensing crescent. |
| Brand pair | `brand-orange` (`#f97316`), `brand-peach` (`#ffd1a6`) — the two stops of `--gradient-hero-icon`; the emblem, the index numerals and the timeline ticks are drawn from them. |
| Elevation | `shadow-cta`, `shadow-cta-hover`, `shadow-loader-rail`, logo/footer gradients — all recomputed on the orange channels |
| Type scale | `text-hero` (168px), `text-hero-lg` (140px) |

> [!warning] The orange is measured, not official
> `#f97316` was read off the supplied PNGs. When the official hex (or source file)
> lands, change `--brand-orange`, `--accent-500`, `paletteHex.accent500`, the SVG
> fills under `public/assets/` and `app/icon.svg`, and regenerate the rasters.

### The brand mark

A ring whose top-left quadrant is a square corner — authored as **geometry** in
`src/lib/brand/odoro-mark.ts` (`markRing`, `markPath`, inner ratio `0.7`), never as
a raster. `<LogoMark>` (SVG, `currentColor`), `<HeroIcon>` and the particle mark in
`three/objects/logo-mark.ts` all draw from it, so they cannot drift apart. The mark
**holds still** everywhere — its orientation is its identity — and a thin orbit
spins around it instead. The wordmark is « odoro », lowercase, in the same orange as
the mark: one object, not a logo followed by a title.

Dark mode is not a concern — the site is dark by construction, so the starter's
`prefers-color-scheme` override was removed.

### Breakpoints (not the generator's defaults)

The original's media queries are preserved as `--breakpoint-*` tokens and used
through the generator's `max-*` variants: `hero-lg` 1180, `hero-md` 855, `hero-sm` 656,
`hero-xs` 480, `menu` 912, `pad-sm` 991. The generator's own `md` (768px) is used where
the original broke at 768. Two `@custom-variant`s — `max-h-828`, `max-h-717` —
cover the Sitemap, which reflows on viewport **height**.

> [!warning] No adaptive grid
> The root font-size is a fixed `16px` and `<AdaptiveGrid>` is not mounted. The
> original was laid out in fixed px with `vw` title overrides; scaling the rem
> base on top of it breaks mobile. See [[decisions-log]] ADR-0015.

### Utilities

`page-gutter` — the **only** source of the left/right page inset (`2.5rem`,
`1.5rem` ≤1180px, `1.25rem` ≤656px). The header and every section use it, so the
header wordmark lines up with the hero wordmark. Never hand-roll a `px-*` gutter
on a section; change it here. ([[decisions-log]] ADR-0020 — `container-shell` was
removed because it capped width as well as padding, and the two disagreed.)

`@layer components` holds only `.scene-overlay`, which lives inside the `<Scene>`
wrapper so it dissolves with the canvas ([[decisions-log]] ADR-0018).

**It is the page's contrast, and it is the only one.** No section carries a plate,
panel or backdrop behind its copy — every section is transparent, and the darkness
its text sits on comes from here. On desktop the scrim darkens the two *edges* of
the frame (where every section's copy lives) and leaves the middle untouched
(where every scene's subject lives); on a phone there are no edges to hide copy in,
so it becomes a flat wash. If copy is hard to read over a scene, change this — do
not add a background to the section. See [[decisions-log]] ADR-0034.

> [!warning] Gradient tokens need the `image:` hint
> `bg-[var(--gradient-footer)]` **silently renders nothing.** the utility generator cannot see
> what a bare custom property holds, so it guesses `background-color` — which is not
> a valid target for a gradient, and the declaration is simply dropped. Always write
> `bg-[image:var(--gradient-…)]`.
>
> This is a quiet failure with no error and no warning, and every gradient token in
> the project was written the wrong way: the **footer's entire background wash had
> never rendered once**, and neither had its hairline rule or the burger's hover
> halo. It took a brand mark coming out as an empty ring to notice. If you add a
> gradient token, check the compiled CSS says `background-image`.

> [!note] Colours in shaders
> The WebGL scene cannot read CSS custom properties. `src/lib/scene/palette.ts`
> mirrors the token hex values as GPU vectors — change a colour token and update
> it there too.

## Typography

Fonts: **Gilroy** (headings + body) and **Lato** (buttons, the hero wordmark),
self-hosted via the framework's local font loader from `public/fonts` — see `src/lib/fonts.ts`.
Bound to `--font-gilroy` → `--font-sans`, and `--font-lato` → `font-lato`.

## Styling rules

- Use utilities in JSX `className`; keep class strings short and readable.
- Extract a repeated pattern to a **React component** — not a `@layer
  components` class. See *Where a style goes* above (ADR-0012).
- Mobile-first responsive: `sm:` / `md:` / `lg:` / `xl:` prefixes.
- Dark mode: `dark:` prefix or token overrides in a `prefers-color-scheme` block.
- No inline `style` except for dynamic values (e.g. spring-animated values).

## Related

[[component-conventions]] · [[animation-system]] · [[new-page]]
