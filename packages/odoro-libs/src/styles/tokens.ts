/**
 * Design tokens d'Odoro — source de verite unique du systeme visuel.
 *
 * Rien d'autre dans la librairie ne doit contenir de valeur brute : les
 * variables CSS, les utilitaires atomiques et les composants UI sont tous
 * derives de ce fichier par `scripts/build-css.ts`.
 *
 * Convention de nommage des variables generees : `--o-<groupe>-<cle>`.
 *
 * @module
 */

/**
 * Echelle d'espacement, en `rem`. Les cles sont des multiples de 4 px a
 * 16 px de base, avec deux demi-pas pour les ajustements fins.
 */
export const space = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const

/**
 * Palette brute. Elle n'est pas destinee a etre utilisee directement dans les
 * composants : les utilitaires s'appuient sur les couleurs semantiques.
 */
export const palette = {
  'neutral-0': '#ffffff',
  'neutral-50': '#f7f7f8',
  'neutral-100': '#eeeef1',
  'neutral-200': '#d9dae0',
  'neutral-300': '#b9bbc6',
  'neutral-400': '#8b8e9e',
  'neutral-500': '#6b6e7f',
  'neutral-600': '#535565',
  'neutral-700': '#414252',
  'neutral-800': '#2a2b38',
  'neutral-900': '#1a1b25',
  'neutral-950': '#101018',
  'brand-100': '#e5e7ff',
  'brand-300': '#a9aeff',
  'brand-500': '#5b62f4',
  'brand-600': '#4a4fdb',
  'brand-700': '#3a3eb0',
  'success-100': '#d9f6e6',
  'success-500': '#18a058',
  'success-700': '#11703e',
  'warning-100': '#fdf0d5',
  'warning-500': '#d98e04',
  'warning-700': '#9a6503',
  'danger-100': '#fde3e3',
  'danger-500': '#d93a3a',
  'danger-700': '#a12626',
} as const

/**
 * Couleurs semantiques en theme clair. Ce sont ces noms — et eux seuls — que
 * les utilitaires et les composants manipulent.
 */
export const colorLight = {
  bg: palette['neutral-0'],
  surface: palette['neutral-50'],
  'surface-raised': palette['neutral-0'],
  border: palette['neutral-200'],
  'border-strong': palette['neutral-300'],
  fg: palette['neutral-900'],
  'fg-muted': palette['neutral-500'],
  'fg-inverted': palette['neutral-0'],
  primary: palette['brand-500'],
  'primary-hover': palette['brand-600'],
  'primary-soft': palette['brand-100'],
  success: palette['success-500'],
  'success-soft': palette['success-100'],
  warning: palette['warning-500'],
  'warning-soft': palette['warning-100'],
  danger: palette['danger-500'],
  'danger-soft': palette['danger-100'],
  ring: palette['brand-500'],
} as const

/**
 * Couleurs semantiques en theme sombre. Les cles sont exactement celles de
 * {@link colorLight} : le type l'impose, ce qui interdit d'oublier une
 * couleur lors d'un ajout.
 */
export const colorDark: Record<keyof typeof colorLight, string> = {
  bg: palette['neutral-950'],
  surface: palette['neutral-900'],
  'surface-raised': palette['neutral-800'],
  border: palette['neutral-800'],
  'border-strong': palette['neutral-700'],
  fg: palette['neutral-50'],
  'fg-muted': palette['neutral-400'],
  'fg-inverted': palette['neutral-950'],
  primary: palette['brand-300'],
  'primary-hover': palette['brand-100'],
  'primary-soft': palette['brand-700'],
  success: palette['success-500'],
  'success-soft': palette['success-700'],
  warning: palette['warning-500'],
  'warning-soft': palette['warning-700'],
  danger: palette['danger-500'],
  'danger-soft': palette['danger-700'],
  ring: palette['brand-300'],
} as const

/** Familles de police. */
export const fontFamily = {
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
} as const

/** Echelle typographique. */
export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
} as const

/** Graisses. */
export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

/** Hauteurs de ligne. */
export const lineHeight = {
  none: '1',
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
} as const

/** Interlettrage. */
export const letterSpacing = {
  tight: '-0.015em',
  normal: '0',
  wide: '0.05em',
} as const

/** Rayons de bordure. */
export const radius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const

/** Ombres portees. */
export const shadow = {
  none: 'none',
  sm: '0 1px 2px rgb(16 16 24 / 0.06)',
  md: '0 2px 8px rgb(16 16 24 / 0.08), 0 1px 2px rgb(16 16 24 / 0.06)',
  lg: '0 8px 24px rgb(16 16 24 / 0.12), 0 2px 6px rgb(16 16 24 / 0.08)',
} as const

/** Epaisseurs de bordure. */
export const borderWidth = {
  0: '0',
  1: '1px',
  2: '2px',
} as const

/**
 * Points de rupture. Seuls `md` et `lg` sont exposes en variants : deux
 * paliers couvrent l'essentiel des besoins sans faire exploser le CSS.
 */
export const breakpoint = {
  md: '48rem',
  lg: '64rem',
} as const

/** Durees d'animation. */
export const duration = {
  instant: '0ms',
  fast: '120ms',
  base: '200ms',
  slow: '320ms',
  slower: '480ms',
} as const

/**
 * Courbes de Bezier. Volontairement limitees : le moteur d'animation
 * n'implemente pas de ressorts physiques dans cette version (voir
 * `src/motion/README` dans la documentation).
 */
export const easing = {
  linear: 'linear',
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  entrance: 'cubic-bezier(0, 0, 0, 1)',
  exit: 'cubic-bezier(0.3, 0, 1, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1.2)',
} as const

/** Plans de superposition. */
export const zIndex = {
  base: '0',
  raised: '10',
  sticky: '100',
  overlay: '1000',
  toast: '1100',
} as const

/**
 * Ensemble des tokens, regroupes par prefixe de variable CSS.
 *
 * @example
 * tokens.space[4] // '1rem' -> --o-space-4
 */
export const tokens = {
  space,
  color: colorLight,
  font: fontFamily,
  text: fontSize,
  weight: fontWeight,
  leading: lineHeight,
  tracking: letterSpacing,
  radius,
  shadow,
  border: borderWidth,
  duration,
  ease: easing,
  z: zIndex,
} as const

/** Type de l'ensemble des tokens. */
export type Tokens = typeof tokens

/** Nom d'une couleur semantique. */
export type ColorToken = keyof typeof colorLight

/** Nom d'un pas d'espacement. */
export type SpaceToken = keyof typeof space
