---
tags: [frontend, component, stable]
updated: 2026-09-14
---

# Catalog — UI Components

Files in `src/components/ui/`: design-system primitives with no provider
dependencies, taking all content through props. The folder was created by the
Keld Studio rebuild ([[changelog]] 2026-09-14). Conventions:
[[component-conventions]].

| File | Exports | Type |
|------|---------|------|
| `arrow-link.tsx` | `ArrowLink` | no directive — renders in either tree |
| `grid-lines.tsx` | `GridLines` | no directive |
| `reveal-lines.tsx` | `RevealLines` | Client (`"use client"` — it renders TextEngine) |
| `icons.tsx` | 8 line icons, `LogoMark` | no directive |

Each file opens with `// 📖 Docs: obsidian/frontend/components/ui.md`.

## ArrowLink — `arrow-link.tsx`

The tracked-caps link with the corner arrow: "Get a quote" over the scene,
"Contact" in the footer.

```ts
interface ArrowLinkProps {
  href: string;
  label: string;
  variant?: "plain" | "glass";
  className?: string;
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | — | an in-page `#hash` or an absolute `https?://` URL (see below) |
| `label` | `string` | — | visible text — `text-caption tracking-caps uppercase` |
| `variant` | `"plain" \| "glass"` | `"plain"` | `plain` floats on the scene and fades + drops a nudge on hover; `glass` is the frosted footer button — `bg-surface-glass/75`, `backdrop-blur-xl`, hairline border, lifts on hover |
| `className` | `string` | `""` | positioning from the caller (`absolute right-10 top-10`) |

- **Motion** is the narrow CSS-transition case ([[decisions-log]] ADR-0014):
  opacity / translate / background / border, `duration-[var(--duration-normal)]
  ease-glide`; the arrow shifts `0.5` on `group-hover`. Visible
  `focus-visible` outline.
- **External hrefs** (`/^https?:\/\//`) get `target="_blank" rel="noopener"`.
- **A plain `<a>`, not the framework's link component.** Every current href is an in-page `#hash`,
  which Lenis `anchors` scrolls ([[smooth-scroll]]). Passing an internal *route*
  here would do a full-page load; route links go through `<Link>` (hard rule #8).

Consumers: `HouseScene` (quote CTA, `plain`), `SiteFooter` (Contact, `glass`).

## GridLines — `grid-lines.tsx`

The five hairlines that rule the scene and the footer. They are drawn as the
borders of a four-column grid, each column `border-l` and the last one
`border-r` as well, rather than as five free-floating lines.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | appended to the root — z-index, inset overrides (`max-md:inset-x-6`) |

- The root is `absolute inset-x-8 inset-y-0 grid grid-cols-4`, so the parent must
  be positioned. `aria-hidden`, `pointer-events-none`, `border-foreground/30`.
- **Why a grid.** Content laid out on the same `inset-x-8 grid grid-cols-4`
  lands on a line by construction. The footer's CTA sits on line one
  (`md:col-span-2 md:pl-5`) and its nav on line four (`md:col-start-4 md:pl-5`)
  this way. If you change the inset here, change it in every layout that shares it.
- It has no motion of its own. The scene wraps it: it fades in on `introReady`
  (`GRID_INTRO`) and out across the sequence phase (`gridOpacity`). The footer
  shows it static.

## RevealLines — `reveal-lines.tsx`

A letter-by-letter rise for multi-line copy, using one `TextEngine` per forced
line with the stagger carried across lines. It is a Client Component.

```ts
interface RevealLinesProps {
  tag: "p" | "h2" | "h3";
  lines: readonly string[];
  active: boolean;
  timing: RevealTiming;          // "label" | "cta" | "quote"
  clip?: boolean;
  rootMargin?: string;
  id?: string;
  className?: string;
  engineClassName?: string;
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tag` | `"p" \| "h2" \| "h3"` | — | the semantic element; it receives `id` and `className` |
| `lines` | `readonly string[]` | — | the forced line breaks, one engine each. Each line is also its React key, so two identical lines in one block collide |
| `active` | `boolean` | — | plays while `true` and resets instantly when it drops |
| `timing` | `RevealTiming` | — | a `REVEAL_TIMING` key (`lib/springs/presets.ts`, see [[utils]]) giving per-letter stagger / duration, easeOutExpo: `label` 35 / 1500 ms, `cta` 12 / 800, `quote` 7 / 1600 |
| `clip` | `boolean` | `true` | rises from under the line's clip (labels, headings) or floats up freely (the quote) |
| `rootMargin` | `string` | — | shifts the engine's in-view test, e.g. `"0px 0px -15% 0px"` waits until 85% down |
| `id` | `string` | — | on the outer tag, for `aria-labelledby` |
| `className` | `string` | `""` | on the outer tag: type, colour, **positioning** |
| `engineClassName` | `string` | `""` | on **each** engine container: **alignment only** (`justify-*`) |

**How it works**
- `mode="always"` with `enabled={active}` makes the reveal flag-driven. In the
  scene the flags come from `sceneFlags` on the timeline
  ([[decisions-log]] ADR-0024). This is the sanctioned way to drive TextEngine
  from state; `mode="manual"` is banned (hard rule #3).
- Each line's `delayIn` is the sum of the earlier lines' `length × stagger`, so
  line two starts where line one's last letter left off. The source indexed its
  letters continuously.
- Every engine gets `seo={false}`, and the tag holds one `sr-only` copy of
  `lines.join(" ")`. Screen readers and crawlers get the sentence once; the
  split letters are `aria-hidden`.
- Letters use `RISE_BLUR` (`y` 105% → 0%, blur 12px → 0), with `leading-display`
  (1.1) on every engine.

**Traps.** All three come from [[text-engine#Alignment & line-height]]:
- **Alignment goes on `engineClassName`.** The engine container is a flex row,
  so `text-center` on the tag centres nothing on its own. The footer CTA pairs
  them: `engineClassName="justify-center text-center md:justify-start md:text-left"`.
- **Positioning goes on `className`, never on `engineClassName`.** TextEngine
  writes `position: relative` inline, which beats an `absolute` class and turns
  offsets into nudges (text-engine §3). `className` lands on the outer tag, which
  is not an engine, so positioning is safe there.
- **A clip needs a wrap layer.** TextEngine renders, and therefore clips, a wrap
  layer only when its `*In` target is non-empty. With `clip`, the component
  passes `CLIP_LAYER` (a no-op `{ opacity: 1 }`) as `wrapWordIn` / `wrapWordOut`.
  Without it the letters would have nothing to rise from under (text-engine §4).
  It also adds `-mb-3.5 pb-4 mask-b-from-45%` to each word wrap. That is the
  source's soft floor: a little room under the clip, faded out, so descenders
  are not shaved.

```tsx
// Flag-driven label inside the pinned scene
<RevealLines tag="p" lines={content.eyebrow} active={leadActive} timing="label" className={LABEL_TYPE} />

// Free-floating quote that plays on scroll-in, once 85% down the viewport
<RevealLines
  tag="p"
  lines={[item.quote]}
  active
  clip={false}
  timing="quote"
  rootMargin="0px 0px -15% 0px"
  className="text-headline-phone uppercase leading-heading tracking-title sm:text-headline"
/>
```

Consumers: `EchoPanel` (eyebrow + footer labels), `ZoomOverlays` (zoom title
`h3`), `SiteFooter` (CTA `h2`), `Testimonial` (quote).

## Icons — `icons.tsx`

The site's line icons, taken from the source's inline SVGs. Each takes
`IconProps { className?: string }` and draws in `currentColor` on a 24×24
viewBox. Each is `aria-hidden` and `focusable={false}`, because every one sits
beside visible text or inside a control that carries its own accessible name.
Size them with `size-*`.

| Export | Stroke | Used by |
|--------|--------|---------|
| `CornerArrowIcon` | 1.8 | `ArrowLink` |
| `PlusCircleIcon` · `GlobeIcon` · `PlayCircleIcon` | 1.8 | `EchoPanel` icon row |
| `ArrowLeftIcon` · `ArrowRightIcon` | 1.5 | `Reviews` pager |
| `MenuIcon` · `CloseIcon` | 1.5 | `Dock` menu toggle |
| `LogoMark` | 1.8 | `Dock` — the hexagon: an isometric cube with one solid face |

The four-point star is not here. `DetailsPanel` draws it inline as two paths —
a white one, and a sage copy over it whose opacity is the scrubbed
`p.to(starTint)` — because a static icon cannot take a spring value. A
`StarShape` export that could not take one was removed on 2026-09-14.

## Adding a primitive

A primitive belongs here when a pattern with markup repeats across sections and
needs no provider ([[design-system]] → *Where a style goes*). Page-specific
pieces stay next to their view (`src/views/home/…`). Add the `📖 Docs` header
comment and an entry in this note. Use [[templates/component-note]] if an entry
outgrows a section here.

## Related

[[component-conventions]] · [[components/common]] · [[components/animation-springs]] · [[text-engine]] · [[design-system]] · [[utils]]
