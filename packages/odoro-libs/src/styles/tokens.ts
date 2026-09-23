/**
 * Odoro design tokens — the single source of truth of the visual system.
 *
 * The numeric foundation of the design system lives in
 * `src/styles/generated/baseTokens.ts`: 288 colors in OKLCH, 18 text sizes,
 * radii, shadows, blurs, containers, perspectives and curves. It is a frozen,
 * versioned artifact that this module dresses up.
 *
 * What this file adds on top:
 *
 * 1. an Odoro **brand hue**, across the usual 11 shades;
 * 2. an **enumerated spacing scale**, expressed in `calc()` over a single
 *    base step;
 * 3. **duration**, **opacity** and **layer** (`z-index`) scales, and the
 *    **entrance/exit curves** used by the animation engine.
 *
 * There is **no** semantic layer. A color is named by its place in the
 * palette — `zinc-900`, `brand-600` — never by the role it plays. The theme
 * is then spelled out explicitly, on every class: `o-bg-white
 * dark:o-bg-zinc-900`. It is more verbose, and that is the accepted price of
 * a system where you see the color you write.
 *
 * The only exception is a small group of **theme variables**
 * (`--o-theme-*`): five values that switch with `data-theme`, for whatever
 * must follow the theme without going through a class — a WebGL background
 * reading its colors in JavaScript, a curtain, a loader.
 *
 * Nothing else in the library holds a raw value: CSS variables, atomic
 * utilities and UI components all derive from these.
 *
 * Convention of the generated variables: `--o-<group>-<key>`.
 *
 * @module
 */

export {
  baseAspect,
  baseBlur,
  baseBreakpoint,
  basePalette,
  baseContainer,
  baseDropShadow,
  baseEase,
  baseFontFamily,
  baseFontSize,
  baseFontSizeLeading,
  baseFontWeight,
  baseInsetShadow,
  baseLeading,
  basePerspective,
  baseRadius,
  baseShadow,
  baseSpacingUnit,
  baseTracking,
} from './generated/baseTokens.js'

import {
  baseAspect,
  baseBlur,
  baseBreakpoint,
  basePalette,
  baseContainer,
  baseDropShadow,
  baseEase,
  baseFontFamily,
  baseFontSize,
  baseFontSizeLeading,
  baseFontWeight,
  baseInsetShadow,
  baseLeading,
  basePerspective,
  baseRadius,
  baseShadow,
  baseSpacingUnit,
  baseTracking,
} from './generated/baseTokens.js'

/**
 * Odoro brand hue: the light blue of the logo (`#0ea5e9`, `brand-500`), spread
 * over the same 11 shades as the rest of the palette so it stays
 * interchangeable with any other hue.
 *
 * ## Which shade for what
 *
 * A light blue does not carry text on a white ground: `brand-500` reaches
 * 3.0:1, enough for a border, a fill or a large heading, and short of AA for a
 * paragraph. Text on light therefore takes `brand-600`; text on dark takes
 * `brand-400`. The scale is written so that both exist — lightening the anchor
 * without keeping the dark end is what makes a light brand unreadable.
 *
 * ## Why the brand is a scale of its own, and not an alias
 *
 * The values are copied from the blue scale of the base palette rather than
 * referenced. An alias would tie the brand to a family: recoloring it would
 * then mean switching family everywhere `brand` is used — that is, in the
 * documentation, the showcases and the templates.
 *
 * Here a single table changes, and everything reading `--o-palette-brand-*`
 * follows.
 */
export const brand = {
  'brand-50': 'oklch(97.7% 0.013 236.62)',
  'brand-100': 'oklch(95.1% 0.026 236.824)',
  'brand-200': 'oklch(90.1% 0.058 230.902)',
  'brand-300': 'oklch(82.8% 0.111 230.318)',
  'brand-400': 'oklch(74.6% 0.16 232.661)',
  'brand-500': 'oklch(68.5% 0.169 237.323)',
  'brand-600': 'oklch(58.8% 0.158 241.966)',
  'brand-700': 'oklch(50% 0.134 242.749)',
  'brand-800': 'oklch(44.3% 0.11 240.79)',
  'brand-900': 'oklch(39.1% 0.09 240.876)',
  'brand-950': 'oklch(29.3% 0.066 243.157)',
} as const

/**
 * The complete raw palette: the foundation, plus the brand hue.
 *
 * It is not meant to be used directly inside the components of the library —
 * those go through the semantic layer — but it stays fully available on the
 * application side.
 */
export const palette = {
  ...basePalette,
  ...brand,
  transparent: 'transparent',
  current: 'currentColor',
} as const

/**
 * Theme variables: what switches when the page goes dark.
 *
 * This is not a semantic layer — five roles, not a nomenclature — but what a
 * WebGL background, a curtain or a loader must read to follow the visitor's
 * theme instead of imposing their own. A component that sets its colors by
 * class has no need for them: `o-bg-zinc-50 dark:o-bg-zinc-950` says the same
 * thing. The one that reads them in JavaScript, or writes them into a
 * variable, has only this path.
 *
 * The light theme lives in `:root`; the dark one is placed under `data-theme`
 * and under the system preference, by the generator.
 */
export const theme = {
  /** Page background. */
  bg: 'var(--o-palette-zinc-50)',
  /** Background of a surface laid on the page. */
  surface: 'var(--o-palette-white)',
  /** Ink: the running text. */
  fg: 'var(--o-palette-zinc-900)',
  /** Muted ink: captions, secondary strokes. */
  muted: 'var(--o-palette-zinc-500)',
  /** Line: borders and separators. */
  line: 'var(--o-palette-zinc-200)',
} as const

/** The same roles, in dark theme. */
export const themeDark: Readonly<Record<keyof typeof theme, string>> = {
  bg: 'var(--o-palette-zinc-950)',
  surface: 'var(--o-palette-zinc-900)',
  fg: 'var(--o-palette-zinc-50)',
  muted: 'var(--o-palette-zinc-400)',
  line: 'var(--o-palette-zinc-800)',
}

/** Name of a theme variable. */
export type ThemeToken = keyof typeof theme

/** Name of a color in the raw palette. */
export type PaletteToken = keyof typeof palette

/**
 * Steps of the spacing scale. Each value is `step x --o-spacing`, with the
 * exception of `0` and `px`.
 */
const SPACING_STEPS = [
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36,
  40, 44, 48, 52, 56, 60, 64, 72, 80, 96,
] as const

/**
 * Enumerated spacing scale. The values are expressed in `calc()` over
 * `--o-spacing`: changing the base step resizes the whole system with a
 * single setting.
 */
export const space: Readonly<Record<string, string>> = Object.freeze({
  0: '0',
  px: '1px',
  ...Object.fromEntries(
    SPACING_STEPS.map((step) => [String(step), `calc(var(--o-spacing) * ${step})`]),
  ),
})

/** Base spacing step: the whole scale is a multiple of it. */
export const spacingBase = baseSpacingUnit

/** Font families. */
export const fontFamily = baseFontFamily

/**
 * Typographic scale.
 *
 * The foundation files its text shadows under the `shadow-*` keys of the same
 * scale; they are pulled out here — a text size and a drop shadow are not the
 * same quantity, and mixing them would produce absurd classes.
 */
export const fontSize: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    Object.entries(baseFontSize).filter(([key]) => !key.startsWith('shadow-')),
  ),
)

/** Text shadows, pulled out of the foundation (see {@link fontSize}). */
export const textShadow: Readonly<Record<string, string>> = Object.freeze({
  ...Object.fromEntries(
    Object.entries(baseFontSize)
      .filter(([key]) => key.startsWith('shadow-'))
      .map(([key, value]) => [key.replace(/^shadow-/, ''), value]),
  ),
  none: 'none',
})
/** Default line height paired with each text size. */
export const fontSizeLeading = baseFontSizeLeading
/** Weights. */
export const fontWeight = baseFontWeight
/** Named line heights. */
export const lineHeight = baseLeading
/** Letter spacings. */
export const letterSpacing = baseTracking
/** Border radii. */
export const radius = baseRadius
/** Drop shadows. */
export const shadow = baseShadow
/** Inset shadows. */
export const insetShadow = baseInsetShadow
/** Filter shadows. */
export const dropShadow = baseDropShadow
/** Blurs. */
export const blur = baseBlur
/** Breakpoints. */
export const breakpoint = baseBreakpoint
/** Container widths. */
export const container = baseContainer
/** Perspective distances. */
export const perspective = basePerspective
/** Aspect ratios. */
export const aspect = baseAspect

/** Border widths. */
export const borderWidth = {
  0: '0',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px',
} as const

/**
 * Animation durations. The foundation exposes only a default transition
 * duration; the Odoro animation engine needs a named scale.
 */
export const duration = {
  instant: '0ms',
  fastest: '75ms',
  faster: '120ms',
  fast: '150ms',
  base: '200ms',
  slow: '320ms',
  slower: '480ms',
  slowest: '700ms',
} as const

/**
 * Bezier curves: the curves of the foundation, completed by the ones Odoro
 * adds — a decelerating entrance, an accelerating exit and a curve with a
 * slight overshoot.
 *
 * The animation engine implements no physical springs in this version — see
 * `docs/motion.md` for the reasoning.
 */
export const easing = {
  ...baseEase,
  linear: 'linear',
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  entrance: 'cubic-bezier(0, 0, 0, 1)',
  exit: 'cubic-bezier(0.3, 0, 1, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1.2)',
} as const

/** Opacity scale, in steps of 5 %. */
export const opacity: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    Array.from({ length: 21 }, (_, index) => [String(index * 5), String(index * 0.05)]),
  ),
)

/** Stacking layers. */
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  sticky: '100',
  dropdown: '900',
  overlay: '1000',
  modal: '1010',
  toast: '1100',
} as const

/**
 * The whole token set, grouped by CSS variable prefix.
 *
 * @example
 * tokens.color.primary // semantic color   -> --o-color-primary
 * tokens.palette['sky-500'] // raw color   -> --o-palette-sky-500
 */
export const tokens = {
  spacing: spacingBase,
  space,
  palette,
  theme,
  font: fontFamily,
  text: fontSize,
  weight: fontWeight,
  leading: lineHeight,
  tracking: letterSpacing,
  radius,
  shadow,
  'inset-shadow': insetShadow,
  'drop-shadow': dropShadow,
  'text-shadow': textShadow,
  blur,
  container,
  perspective,
  aspect,
  border: borderWidth,
  duration,
  ease: easing,
  opacity,
  z: zIndex,
} as const

/** Type of the whole token set. */
export type Tokens = typeof tokens

/** Name of a spacing step. */
export type SpaceToken = keyof typeof space
