/**
 * Design tokens d'Odoro — source de verite unique du systeme visuel.
 *
 * La fondation numerique du design system vit dans
 * `src/styles/generated/baseTokens.ts` : 288 couleurs en OKLCH, 18 tailles de
 * texte, rayons, ombres, flous, conteneurs, perspectives et courbes. C'est un
 * artefact fige, versionne, que ce module habille.
 *
 * Ce que ce fichier ajoute par-dessus :
 *
 * 1. une **teinte de marque** Odoro, sur les 11 nuances habituelles ;
 * 2. une **couche semantique** clair/sombre (`bg`, `surface`, `fg`, `primary`,
 *    `danger`...), absente de la fondation brute ;
 * 3. une **echelle d'espacement enumeree**, exprimee en `calc()` sur un pas de
 *    base unique ;
 * 4. des echelles de **duree**, d'**opacite** et de **plan** (`z-index`), et
 *    des **courbes d'entree/sortie** utilisees par le moteur d'animation.
 *
 * Rien d'autre dans la librairie ne contient de valeur brute : variables CSS,
 * utilitaires atomiques et composants UI en derivent tous.
 *
 * Convention des variables generees : `--o-<groupe>-<cle>`.
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
 * Teinte de marque d'Odoro, declinee sur les memes 11 nuances que le reste de
 * la palette pour rester interchangeable avec n'importe quelle autre teinte.
 */
export const brand = {
  'brand-50': 'oklch(97.0% 0.014 275)',
  'brand-100': 'oklch(93.6% 0.032 275)',
  'brand-200': 'oklch(87.4% 0.060 275)',
  'brand-300': 'oklch(79.0% 0.101 275)',
  'brand-400': 'oklch(69.2% 0.152 275)',
  'brand-500': 'oklch(59.8% 0.198 275)',
  'brand-600': 'oklch(52.4% 0.212 275)',
  'brand-700': 'oklch(44.6% 0.190 275)',
  'brand-800': 'oklch(37.4% 0.156 275)',
  'brand-900': 'oklch(31.6% 0.124 275)',
  'brand-950': 'oklch(22.0% 0.088 275)',
} as const

/**
 * Palette brute complete : la fondation, plus la teinte de marque.
 *
 * Elle n'est pas destinee a etre utilisee directement dans les composants de
 * la librairie — ceux-ci passent par la couche semantique — mais reste
 * entierement disponible cote application.
 */
export const palette = {
  ...basePalette,
  ...brand,
  transparent: 'transparent',
  current: 'currentColor',
} as const

/** Nom d'une couleur de la palette brute. */
export type PaletteToken = keyof typeof palette

/**
 * Pas de l'echelle d'espacement. Chaque valeur vaut `pas x --o-spacing`,
 * exception faite de `0` et `px`.
 */
const SPACING_STEPS = [
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36,
  40, 44, 48, 52, 56, 60, 64, 72, 80, 96,
] as const

/**
 * Echelle d'espacement enumeree. Les valeurs sont exprimees en `calc()` sur
 * `--o-spacing` : changer le pas de base redimensionne tout le systeme d'un
 * seul reglage.
 */
export const space: Readonly<Record<string, string>> = Object.freeze({
  0: '0',
  px: '1px',
  ...Object.fromEntries(
    SPACING_STEPS.map((step) => [String(step), `calc(var(--o-spacing) * ${step})`]),
  ),
})

/** Pas d'espacement de base : toute l'echelle en est un multiple. */
export const spacingBase = baseSpacingUnit

/**
 * Couleurs semantiques en theme clair.
 *
 * Ce sont ces noms — et eux seuls — que les composants d'`odoro-libs/ui`
 * manipulent : une application peut retheme integralement la librairie en
 * surchargeant ces seules variables.
 */
export const colorLight = {
  bg: palette.white,
  'bg-subtle': palette['zinc-50'],
  surface: palette.white,
  'surface-raised': palette.white,
  'surface-sunken': palette['zinc-100'],
  'surface-hover': palette['zinc-50'],
  overlay: 'oklch(0% 0 0 / 0.45)',
  border: palette['zinc-200'],
  'border-subtle': palette['zinc-100'],
  'border-strong': palette['zinc-300'],
  fg: palette['zinc-900'],
  'fg-muted': palette['zinc-500'],
  'fg-subtle': palette['zinc-400'],
  'fg-inverted': palette.white,
  link: palette['brand-600'],
  'link-hover': palette['brand-700'],
  primary: palette['brand-600'],
  'primary-hover': palette['brand-700'],
  'primary-active': palette['brand-800'],
  'primary-soft': palette['brand-50'],
  'primary-border': palette['brand-200'],
  'on-primary': palette.white,
  accent: palette['fuchsia-600'],
  'accent-soft': palette['fuchsia-50'],
  'on-accent': palette.white,
  success: palette['emerald-600'],
  'success-soft': palette['emerald-50'],
  'success-border': palette['emerald-200'],
  'on-success': palette.white,
  warning: palette['amber-600'],
  'warning-soft': palette['amber-50'],
  'warning-border': palette['amber-200'],
  'on-warning': palette['amber-950'],
  danger: palette['red-600'],
  'danger-hover': palette['red-700'],
  'danger-soft': palette['red-50'],
  'danger-border': palette['red-200'],
  'on-danger': palette.white,
  info: palette['sky-600'],
  'info-soft': palette['sky-50'],
  'info-border': palette['sky-200'],
  'on-info': palette.white,
  ring: palette['brand-500'],
  selection: palette['brand-100'],
  // Translucide : le surlignage doit laisser lire le texte qu'il recouvre,
  // quel que soit le fond sur lequel il est pose.
  highlight: 'oklch(90.5% 0.182 98.111 / 0.55)',
} as const

/**
 * Couleurs semantiques en theme sombre. Les cles sont exactement celles de
 * {@link colorLight} : le type l'impose, ce qui interdit d'oublier une couleur
 * lors d'un ajout.
 */
export const colorDark: Readonly<Record<keyof typeof colorLight, string>> = {
  bg: palette['zinc-950'],
  'bg-subtle': palette['zinc-900'],
  surface: palette['zinc-900'],
  'surface-raised': palette['zinc-800'],
  'surface-sunken': palette['zinc-950'],
  'surface-hover': palette['zinc-800'],
  overlay: 'oklch(0% 0 0 / 0.65)',
  border: palette['zinc-800'],
  'border-subtle': palette['zinc-900'],
  'border-strong': palette['zinc-700'],
  fg: palette['zinc-50'],
  'fg-muted': palette['zinc-400'],
  'fg-subtle': palette['zinc-500'],
  'fg-inverted': palette['zinc-950'],
  link: palette['brand-300'],
  'link-hover': palette['brand-200'],
  primary: palette['brand-400'],
  'primary-hover': palette['brand-300'],
  'primary-active': palette['brand-200'],
  'primary-soft': palette['brand-950'],
  'primary-border': palette['brand-800'],
  'on-primary': palette['zinc-950'],
  accent: palette['fuchsia-400'],
  'accent-soft': palette['fuchsia-950'],
  'on-accent': palette['zinc-950'],
  success: palette['emerald-400'],
  'success-soft': palette['emerald-950'],
  'success-border': palette['emerald-800'],
  'on-success': palette['zinc-950'],
  warning: palette['amber-400'],
  'warning-soft': palette['amber-950'],
  'warning-border': palette['amber-800'],
  'on-warning': palette['amber-950'],
  danger: palette['red-400'],
  'danger-hover': palette['red-300'],
  'danger-soft': palette['red-950'],
  'danger-border': palette['red-800'],
  'on-danger': palette['zinc-950'],
  info: palette['sky-400'],
  'info-soft': palette['sky-950'],
  'info-border': palette['sky-800'],
  'on-info': palette['zinc-950'],
  ring: palette['brand-400'],
  selection: palette['brand-900'],
  highlight: 'oklch(82.8% 0.189 84.429 / 0.35)',
} as const

/** Familles de police. */
export const fontFamily = baseFontFamily

/**
 * Echelle typographique.
 *
 * La fondation range ses ombres de texte sous les cles `shadow-*` de la meme
 * echelle ; on les en extrait ici — une taille de texte et une ombre portee ne
 * sont pas la meme grandeur, et les meler produirait des classes absurdes.
 */
export const fontSize: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    Object.entries(baseFontSize).filter(([key]) => !key.startsWith('shadow-')),
  ),
)

/** Ombres de texte, extraites de la fondation (voir {@link fontSize}). */
export const textShadow: Readonly<Record<string, string>> = Object.freeze({
  ...Object.fromEntries(
    Object.entries(baseFontSize)
      .filter(([key]) => key.startsWith('shadow-'))
      .map(([key, value]) => [key.replace(/^shadow-/, ''), value]),
  ),
  none: 'none',
})
/** Hauteur de ligne par defaut associee a chaque taille de texte. */
export const fontSizeLeading = baseFontSizeLeading
/** Graisses. */
export const fontWeight = baseFontWeight
/** Hauteurs de ligne nommees. */
export const lineHeight = baseLeading
/** Interlettrages. */
export const letterSpacing = baseTracking
/** Rayons de bordure. */
export const radius = baseRadius
/** Ombres portees. */
export const shadow = baseShadow
/** Ombres internes. */
export const insetShadow = baseInsetShadow
/** Ombres de filtre. */
export const dropShadow = baseDropShadow
/** Flous. */
export const blur = baseBlur
/** Points de rupture. */
export const breakpoint = baseBreakpoint
/** Largeurs de conteneur. */
export const container = baseContainer
/** Distances de perspective. */
export const perspective = basePerspective
/** Rapports de forme. */
export const aspect = baseAspect

/** Epaisseurs de bordure. */
export const borderWidth = {
  0: '0',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px',
} as const

/**
 * Durees d'animation. La fondation n'expose qu'une duree de transition par
 * defaut ; le moteur d'animation d'Odoro a besoin d'une echelle nommee.
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
 * Courbes de Bezier : les courbes de la fondation, completees par celles
 * qu'Odoro ajoute — une entree decelerante, une sortie accelerante et une
 * courbe a depassement leger.
 *
 * Le moteur d'animation n'implemente pas de ressorts physiques dans cette
 * version — voir `docs/motion.md` pour le raisonnement.
 */
export const easing = {
  ...baseEase,
  linear: 'linear',
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  entrance: 'cubic-bezier(0, 0, 0, 1)',
  exit: 'cubic-bezier(0.3, 0, 1, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1.2)',
} as const

/** Echelle d'opacite, par pas de 5 %. */
export const opacity: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    Array.from({ length: 21 }, (_, index) => [String(index * 5), String(index * 0.05)]),
  ),
)

/** Plans de superposition. */
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
 * Ensemble des tokens, regroupes par prefixe de variable CSS.
 *
 * @example
 * tokens.color.primary // couleur semantique -> --o-color-primary
 * tokens.palette['sky-500'] // couleur brute  -> --o-palette-sky-500
 */
export const tokens = {
  spacing: spacingBase,
  space,
  palette,
  color: colorLight,
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

/** Type de l'ensemble des tokens. */
export type Tokens = typeof tokens

/** Nom d'une couleur semantique. */
export type ColorToken = keyof typeof colorLight

/** Nom d'un pas d'espacement. */
export type SpaceToken = keyof typeof space
