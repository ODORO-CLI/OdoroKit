/**
 * Derivation des design tokens en CSS et en noms de classes.
 *
 * Module pur : il ne touche pas au disque, ce qui permet a la suite de tests
 * de verifier que les fichiers generes sont bien a jour.
 *
 * Ce n'est pas un moteur JIT : aucun scan du code applicatif, aucune etape a
 * l'execution. Les feuilles produites sont statiques et importables telles
 * quelles.
 *
 * Deux paliers sont emis, parce que la palette complete ne peut pas etre
 * imposee a tous les projets sans un scan :
 * - `odoro.css` — variables, preflight et utilitaires structurels, colores par
 *   la seule couche semantique ;
 * - `odoro.full.css` — le meme, plus les utilitaires de couleur sur les 290
 *   nuances de la palette brute.
 *
 * Ajouter une famille d'utilitaires se fait en ajoutant une entree a
 * `FAMILIES` — jamais en ecrivant du CSS a la main.
 *
 * @module
 */

import {
  aspect,
  blur,
  borderWidth,
  breakpoint,
  colorDark,
  colorLight,
  container,
  dropShadow,
  duration,
  easing,
  fontFamily,
  fontSize,
  fontSizeLeading,
  fontWeight,
  insetShadow,
  letterSpacing,
  lineHeight,
  opacity,
  palette,
  perspective,
  radius,
  shadow,
  space,
  spacingBase,
  zIndex,
} from '../src/styles/tokens.js'

/** Variants supportes. */
export type VariantName = 'hover' | 'focus' | 'active' | 'md' | 'lg' | 'dark'

/**
 * Palier de diffusion d'une famille.
 *
 * - `core` : present dans les deux feuilles ;
 * - `extended` : reserve a `odoro.full.css`.
 */
export type Tier = 'core' | 'extended'

/** Une famille d'utilitaires : des regles, et les variants qui s'y appliquent. */
export interface Family {
  /** Titre de section dans le CSS produit. */
  readonly title: string
  /** Palier de diffusion. */
  readonly tier: Tier
  /** Variants generes pour cette famille. */
  readonly variants: readonly VariantName[]
  /** Suffixe de classe (sans le prefixe `o-`) vers declarations CSS. */
  readonly rules: Readonly<Record<string, string>>
}

/** Variants de mise en page : deux paliers suffisent. */
const RESPONSIVE: readonly VariantName[] = ['md', 'lg']
/** Variants d'etat, pour les proprietes visuelles. */
const STATEFUL: readonly VariantName[] = ['hover', 'focus']
/** Variants d'etat plus theme, pour les couleurs. */
const THEMED: readonly VariantName[] = ['hover', 'focus', 'active', 'dark']

/**
 * Normalise une cle de token en identifiant CSS valide : un nom de propriete
 * personnalisee ne peut pas contenir de point (`0.5` -> `0_5`).
 */
function cssKey(key: string): string {
  return key.replace(/\./g, '_')
}

/** Reference une variable CSS de token. */
function v(group: string, key: string): string {
  return `var(--o-${group}-${cssKey(key)})`
}

/**
 * Construit un jeu de regles a partir d'une echelle de tokens.
 *
 * @throws {Error} Si une cle demandee n'existe pas dans l'echelle : une faute
 *   de frappe ne doit pas produire silencieusement une variable inexistante.
 */
function fromScale(
  group: string,
  scale: Readonly<Record<string, string>>,
  build: (token: string, key: string) => Readonly<Record<string, string>>,
  keys: readonly string[] = Object.keys(scale),
): Record<string, string> {
  const rules: Record<string, string> = {}
  for (const key of keys) {
    if (!(key in scale)) throw new Error(`[build-css] Token inconnu : ${group}.${key}`)
    Object.assign(rules, build(v(group, key), key))
  }
  return rules
}

/** Fusionne plusieurs jeux de regles en verifiant l'absence de collision. */
function merge(
  ...parts: readonly Readonly<Record<string, string>>[]
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const part of parts) {
    for (const [key, value] of Object.entries(part)) {
      if (key in result) throw new Error(`[build-css] Regle en double : o-${key}`)
      result[key] = value
    }
  }
  return result
}

/** Cles de l'echelle d'espacement, dans l'ordre de declaration. */
const SPACE_KEYS = Object.keys(space)

/** Axes d'espacement : suffixe de classe -> proprietes CSS. */
const PADDING_AXES = {
  p: ['padding'],
  px: ['padding-inline'],
  py: ['padding-block'],
  pt: ['padding-block-start'],
  pr: ['padding-inline-end'],
  pb: ['padding-block-end'],
  pl: ['padding-inline-start'],
} as const

const MARGIN_AXES = {
  m: ['margin'],
  mx: ['margin-inline'],
  my: ['margin-block'],
  mt: ['margin-block-start'],
  mr: ['margin-inline-end'],
  mb: ['margin-block-end'],
  ml: ['margin-inline-start'],
} as const

/** Construit les utilitaires d'un jeu d'axes sur toute l'echelle d'espacement. */
function spacingRules(
  axes: Readonly<Record<string, readonly string[]>>,
): Record<string, string> {
  const rules: Record<string, string> = {}
  for (const [prefix, properties] of Object.entries(axes)) {
    for (const key of SPACE_KEYS) {
      rules[`${prefix}-${key}`] = properties
        .map((property) => `${property}:${v('space', key)}`)
        .join(';')
    }
    rules[`${prefix}-auto`] = properties.map((property) => `${property}:auto`).join(';')
  }
  return rules
}

const FAMILIES: readonly Family[] = [
  {
    title: 'Affichage',
    tier: 'core',
    variants: RESPONSIVE,
    rules: {
      block: 'display:block',
      inline: 'display:inline',
      'inline-block': 'display:inline-block',
      flex: 'display:flex',
      'inline-flex': 'display:inline-flex',
      grid: 'display:grid',
      'inline-grid': 'display:inline-grid',
      contents: 'display:contents',
      hidden: 'display:none',
    },
  },
  {
    title: 'Flexbox',
    tier: 'core',
    variants: RESPONSIVE,
    rules: {
      'flex-row': 'flex-direction:row',
      'flex-row-reverse': 'flex-direction:row-reverse',
      'flex-col': 'flex-direction:column',
      'flex-col-reverse': 'flex-direction:column-reverse',
      'flex-wrap': 'flex-wrap:wrap',
      'flex-nowrap': 'flex-wrap:nowrap',
      'items-start': 'align-items:flex-start',
      'items-center': 'align-items:center',
      'items-end': 'align-items:flex-end',
      'items-stretch': 'align-items:stretch',
      'items-baseline': 'align-items:baseline',
      'self-start': 'align-self:flex-start',
      'self-center': 'align-self:center',
      'self-end': 'align-self:flex-end',
      'self-stretch': 'align-self:stretch',
      'justify-start': 'justify-content:flex-start',
      'justify-center': 'justify-content:center',
      'justify-end': 'justify-content:flex-end',
      'justify-between': 'justify-content:space-between',
      'justify-around': 'justify-content:space-around',
      'justify-evenly': 'justify-content:space-evenly',
      'flex-1': 'flex:1 1 0%',
      'flex-auto': 'flex:1 1 auto',
      'flex-initial': 'flex:0 1 auto',
      'flex-none': 'flex:none',
      grow: 'flex-grow:1',
      'grow-0': 'flex-grow:0',
      shrink: 'flex-shrink:1',
      'shrink-0': 'flex-shrink:0',
    },
  },
  {
    title: 'Grille',
    tier: 'core',
    variants: RESPONSIVE,
    rules: {
      ...Object.fromEntries(
        [1, 2, 3, 4, 5, 6, 12].map((n) => [
          `grid-cols-${n}`,
          `grid-template-columns:repeat(${n},minmax(0,1fr))`,
        ]),
      ),
      ...Object.fromEntries(
        [1, 2, 3, 4].map((n) => [
          `grid-rows-${n}`,
          `grid-template-rows:repeat(${n},minmax(0,1fr))`,
        ]),
      ),
      ...Object.fromEntries(
        [1, 2, 3, 4, 5, 6].map((n) => [
          `col-span-${n}`,
          `grid-column:span ${n} / span ${n}`,
        ]),
      ),
      'col-span-full': 'grid-column:1 / -1',
      'row-span-2': 'grid-row:span 2 / span 2',
      'place-items-center': 'place-items:center',
      'place-content-center': 'place-content:center',
      'grid-flow-col': 'grid-auto-flow:column',
      'grid-flow-row': 'grid-auto-flow:row',
    },
  },
  {
    title: 'Gouttieres',
    tier: 'core',
    variants: RESPONSIVE,
    rules: fromScale('space', space, (token, key) => ({
      [`gap-${key}`]: `gap:${token}`,
      [`gap-x-${key}`]: `column-gap:${token}`,
      [`gap-y-${key}`]: `row-gap:${token}`,
    })),
  },
  {
    title: 'Marges internes',
    tier: 'core',
    variants: RESPONSIVE,
    rules: spacingRules(PADDING_AXES),
  },
  {
    title: 'Marges externes',
    tier: 'core',
    variants: RESPONSIVE,
    rules: spacingRules(MARGIN_AXES),
  },
  {
    title: 'Taille de texte',
    tier: 'core',
    variants: RESPONSIVE,
    rules: fromScale('text', fontSize, (token, key) => ({
      // Chaque taille embarque sa hauteur de ligne par defaut ;
      // `o-leading-*` reste disponible pour la surcharger.
      [`text-${key}`]:
        key in fontSizeLeading
          ? `font-size:${token};line-height:${v('text', `${key}--leading`)}`
          : `font-size:${token}`,
    })),
  },
  {
    title: 'Typographie',
    tier: 'core',
    variants: RESPONSIVE,
    rules: merge(
      fromScale('weight', fontWeight, (token, key) => ({
        [`font-${key}`]: `font-weight:${token}`,
      })),
      fromScale('leading', lineHeight, (token, key) => ({
        [`leading-${key}`]: `line-height:${token}`,
      })),
      fromScale('tracking', letterSpacing, (token, key) => ({
        [`tracking-${key}`]: `letter-spacing:${token}`,
      })),
      fromScale('font', fontFamily, (token, key) => ({
        [`font-${key}`]: `font-family:${token}`,
      })),
      {
        'text-left': 'text-align:left',
        'text-center': 'text-align:center',
        'text-right': 'text-align:right',
        'text-justify': 'text-align:justify',
        uppercase: 'text-transform:uppercase',
        lowercase: 'text-transform:lowercase',
        capitalize: 'text-transform:capitalize',
        'normal-case': 'text-transform:none',
        italic: 'font-style:italic',
        'not-italic': 'font-style:normal',
        underline: 'text-decoration-line:underline',
        'line-through': 'text-decoration-line:line-through',
        'no-underline': 'text-decoration-line:none',
        truncate: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap',
        'whitespace-nowrap': 'white-space:nowrap',
        'whitespace-pre-line': 'white-space:pre-line',
        'break-words': 'overflow-wrap:break-word',
        'tabular-nums': 'font-variant-numeric:tabular-nums',
      },
    ),
  },
  {
    title: 'Couleurs semantiques',
    tier: 'core',
    variants: THEMED,
    rules: fromScale('color', colorLight, (token, key) => ({
      [`text-${key}`]: `color:${token}`,
      [`bg-${key}`]: `background-color:${token}`,
      [`border-${key}`]: `border-color:${token}`,
      [`ring-${key}`]: `outline-color:${token}`,
      [`decoration-${key}`]: `text-decoration-color:${token}`,
    })),
  },
  {
    title: 'Bordures',
    tier: 'core',
    variants: STATEFUL,
    rules: merge(
      fromScale('border', borderWidth, (token, key) => ({
        [`border-w-${key}`]: `border-width:${token};border-style:solid`,
      })),
      {
        'border-t': 'border-block-start-width:1px;border-block-start-style:solid',
        'border-r': 'border-inline-end-width:1px;border-inline-end-style:solid',
        'border-b': 'border-block-end-width:1px;border-block-end-style:solid',
        'border-l': 'border-inline-start-width:1px;border-inline-start-style:solid',
        'border-solid': 'border-style:solid',
        'border-dashed': 'border-style:dashed',
        'border-none': 'border-style:none',
      },
    ),
  },
  {
    title: 'Rayons',
    tier: 'core',
    variants: [],
    rules: merge(
      fromScale('radius', radius, (token, key) => ({
        [`rounded-${key}`]: `border-radius:${token}`,
        [`rounded-t-${key}`]: `border-start-start-radius:${token};border-start-end-radius:${token}`,
        [`rounded-b-${key}`]: `border-end-start-radius:${token};border-end-end-radius:${token}`,
      })),
      { 'rounded-none': 'border-radius:0', 'rounded-full': 'border-radius:9999px' },
    ),
  },
  {
    title: 'Ombres',
    tier: 'core',
    variants: STATEFUL,
    rules: merge(
      fromScale('shadow', shadow, (token, key) => ({
        [`shadow-${key}`]: `box-shadow:${token}`,
      })),
      fromScale('inset-shadow', insetShadow, (token, key) => ({
        [`inset-shadow-${key}`]: `box-shadow:${token}`,
      })),
      fromScale('drop-shadow', dropShadow, (token, key) => ({
        [`drop-shadow-${key}`]: `filter:drop-shadow(${token})`,
      })),
      { 'shadow-none': 'box-shadow:none' },
    ),
  },
  {
    title: 'Flou',
    tier: 'core',
    variants: [],
    rules: merge(
      fromScale('blur', blur, (token, key) => ({
        [`blur-${key}`]: `filter:blur(${token})`,
      })),
      {
        'blur-none': 'filter:none',
        'backdrop-blur': `backdrop-filter:blur(${v('blur', 'md')})`,
      },
    ),
  },
  {
    title: 'Positionnement',
    tier: 'core',
    variants: RESPONSIVE,
    rules: {
      static: 'position:static',
      relative: 'position:relative',
      absolute: 'position:absolute',
      fixed: 'position:fixed',
      sticky: 'position:sticky',
      'inset-0': 'inset:0',
      'inset-x-0': 'inset-inline:0',
      'inset-y-0': 'inset-block:0',
      'top-0': 'top:0',
      'right-0': 'right:0',
      'bottom-0': 'bottom:0',
      'left-0': 'left:0',
      'top-auto': 'top:auto',
      'bottom-auto': 'bottom:auto',
    },
  },
  {
    title: 'Dimensions',
    tier: 'core',
    variants: RESPONSIVE,
    rules: merge(
      fromScale('container', container, (token, key) => ({
        [`max-w-${key}`]: `max-width:${token}`,
      })),
      fromScale('space', space, (token, key) => ({
        [`w-${key}`]: `width:${token}`,
        [`h-${key}`]: `height:${token}`,
        [`size-${key}`]: `width:${token};height:${token}`,
      })),
      {
        'w-full': 'width:100%',
        'w-auto': 'width:auto',
        'w-screen': 'width:100vw',
        'w-fit': 'width:fit-content',
        'h-full': 'height:100%',
        'h-auto': 'height:auto',
        'h-screen': 'height:100dvh',
        'h-fit': 'height:fit-content',
        'min-w-0': 'min-width:0',
        'min-w-full': 'min-width:100%',
        'min-h-0': 'min-height:0',
        'min-h-screen': 'min-height:100dvh',
        'max-w-full': 'max-width:100%',
        'max-w-none': 'max-width:none',
        'max-w-prose': 'max-width:65ch',
        'max-h-full': 'max-height:100%',
      },
    ),
  },
  {
    title: 'Debordement et plans',
    tier: 'core',
    variants: [],
    rules: merge(
      fromScale('z', zIndex, (token, key) => ({ [`z-${key}`]: `z-index:${token}` })),
      {
        'overflow-auto': 'overflow:auto',
        'overflow-hidden': 'overflow:hidden',
        'overflow-visible': 'overflow:visible',
        'overflow-scroll': 'overflow:scroll',
        'overflow-x-auto': 'overflow-x:auto',
        'overflow-y-auto': 'overflow-y:auto',
        'overflow-x-hidden': 'overflow-x:hidden',
        'overflow-y-hidden': 'overflow-y:hidden',
      },
    ),
  },
  {
    title: 'Opacite',
    tier: 'core',
    variants: STATEFUL,
    rules: fromScale('opacity', opacity, (token, key) => ({
      [`opacity-${key}`]: `opacity:${token}`,
    })),
  },
  {
    title: 'Media et proportions',
    tier: 'core',
    variants: [],
    rules: merge(
      fromScale('aspect', aspect, (token, key) => ({
        [`aspect-${key}`]: `aspect-ratio:${token}`,
      })),
      fromScale('perspective', perspective, (token, key) => ({
        [`perspective-${key}`]: `perspective:${token}`,
      })),
      {
        'aspect-square': 'aspect-ratio:1 / 1',
        'aspect-auto': 'aspect-ratio:auto',
        'object-cover': 'object-fit:cover',
        'object-contain': 'object-fit:contain',
        'object-fill': 'object-fit:fill',
        'object-center': 'object-position:center',
      },
    ),
  },
  {
    title: 'Interaction',
    tier: 'core',
    variants: [],
    rules: merge(
      fromScale('duration', duration, (token, key) => ({
        [`duration-${key}`]: `transition-duration:${token}`,
      })),
      fromScale('ease', easing, (token, key) => ({
        [`ease-${key}`]: `transition-timing-function:${token}`,
      })),
      {
        'cursor-pointer': 'cursor:pointer',
        'cursor-default': 'cursor:default',
        'cursor-not-allowed': 'cursor:not-allowed',
        'cursor-wait': 'cursor:wait',
        'select-none': 'user-select:none',
        'select-text': 'user-select:text',
        'select-all': 'user-select:all',
        'pointer-events-none': 'pointer-events:none',
        'pointer-events-auto': 'pointer-events:auto',
        'appearance-none': 'appearance:none',
        'outline-none': 'outline:none',
        transition: `transition-property:color,background-color,border-color,text-decoration-color,outline-color,box-shadow,filter,transform,opacity;transition-duration:${v('duration', 'base')};transition-timing-function:${v('ease', 'standard')}`,
        'transition-none': 'transition-property:none',
        'transition-transform': `transition-property:transform;transition-duration:${v('duration', 'base')};transition-timing-function:${v('ease', 'standard')}`,
        ring: `outline:2px solid ${v('color', 'ring')};outline-offset:2px`,
        'ring-none': 'outline:none',
        'sr-only':
          'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0',
        'not-sr-only':
          'position:static;width:auto;height:auto;padding:0;margin:0;overflow:visible;clip-path:none;white-space:normal',
      },
    ),
  },
  {
    title: 'Animations nommees',
    tier: 'core',
    variants: [],
    rules: {
      'animate-spin': `animation:o-spin 1s ${v('ease', 'linear')} infinite`,
      'animate-pulse': `animation:o-pulse 2s ${v('ease', 'in-out')} infinite`,
      'animate-fade-in': `animation:o-fade-in ${v('duration', 'base')} ${v('ease', 'entrance')} both`,
      'animate-none': 'animation:none',
    },
  },
  {
    title: 'Palette complete — couleur de texte',
    tier: 'extended',
    variants: THEMED,
    rules: fromScale('palette', palette, (token, key) => ({
      [`text-${key}`]: `color:${token}`,
    })),
  },
  {
    title: 'Palette complete — couleur de fond',
    tier: 'extended',
    variants: THEMED,
    rules: fromScale('palette', palette, (token, key) => ({
      [`bg-${key}`]: `background-color:${token}`,
    })),
  },
  {
    title: 'Palette complete — couleur de bordure',
    tier: 'extended',
    variants: THEMED,
    rules: fromScale('palette', palette, (token, key) => ({
      [`border-${key}`]: `border-color:${token}`,
    })),
  },
]

/** Echappe les caracteres non valides dans un selecteur de classe CSS. */
function escapeSelector(className: string): string {
  return className.replace(/[:.]/g, '\\$&')
}

/** Enveloppe des regles dans le contexte d'un variant. */
function wrapVariant(variant: VariantName, selector: string, body: string): string {
  switch (variant) {
    case 'hover':
      return `${selector}:hover{${body}}`
    case 'focus':
      return `${selector}:focus-visible{${body}}`
    case 'active':
      return `${selector}:active{${body}}`
    case 'md':
      return `@media (min-width:${breakpoint.md}){${selector}{${body}}}`
    case 'lg':
      return `@media (min-width:${breakpoint.lg}){${selector}{${body}}}`
    case 'dark':
      // Deux ecritures : le choix explicite du developpeur l'emporte sur la
      // preference systeme, dans les deux sens.
      return [
        `:root[data-theme="dark"] ${selector}{${body}}`,
        `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) ${selector}{${body}}}`,
      ].join('\n')
  }
}

/** Bloc de variables CSS pour un ensemble de tokens. */
function declareVars(group: string, scale: Readonly<Record<string, string>>): string[] {
  return Object.entries(scale).map(
    ([key, value]) => `  --o-${group}-${cssKey(key)}: ${value};`,
  )
}

/** Preflight minimal : le strict necessaire pour que les tokens s'appliquent. */
const PREFLIGHT = `*,*::before,*::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:${v('color', 'border')}}
html{-webkit-text-size-adjust:100%;tab-size:4}
body{margin:0;font-family:${v('font', 'sans')};font-size:${v('text', 'base')};line-height:${v('leading', 'normal')};color:${v('color', 'fg')};background-color:${v('color', 'bg')};-webkit-font-smoothing:antialiased}
h1,h2,h3,h4,h5,h6,p,figure,blockquote,dl,dd,pre{margin:0}
h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}
ol,ul,menu{list-style:none;margin:0;padding:0}
img,picture,video,canvas,svg{display:block;max-width:100%}
button,input,select,textarea{font:inherit;color:inherit;margin:0;background:transparent}
button,[role="button"]{cursor:pointer}
table{border-collapse:collapse}
code,kbd,samp,pre{font-family:${v('font', 'mono')};font-size:1em}
:where(a){color:${v('color', 'link')}}
:where(a:hover){color:${v('color', 'link-hover')}}
::selection{background-color:${v('color', 'selection')}}
:where(:focus-visible){outline:2px solid ${v('color', 'ring')};outline-offset:2px}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important;scroll-behavior:auto !important}}`

/**
 * Images-cles nommees. Elles sont emises une fois, en tete de feuille : une
 * `@keyframes` ne peut pas etre generee par famille sans etre dupliquee.
 */
const KEYFRAMES = `@keyframes o-spin{to{transform:rotate(360deg)}}
@keyframes o-pulse{50%{opacity:0.5}}
@keyframes o-fade-in{from{opacity:0}}`

/** Bloc des variables de tokens, commun aux deux feuilles. */
function variableBlock(): string[] {
  return [
    '/* Variables de tokens — theme clair par defaut. */',
    ':root {',
    `  --o-spacing: ${spacingBase};`,
    ...declareVars('space', space),
    ...declareVars('palette', palette),
    ...declareVars('color', colorLight),
    ...declareVars('font', fontFamily),
    ...declareVars('text', fontSize),
    ...Object.entries(fontSizeLeading).map(
      ([key, value]) => `  --o-text-${cssKey(key)}--leading: ${value};`,
    ),
    ...declareVars('weight', fontWeight),
    ...declareVars('leading', lineHeight),
    ...declareVars('tracking', letterSpacing),
    ...declareVars('radius', radius),
    ...declareVars('shadow', shadow),
    ...declareVars('inset-shadow', insetShadow),
    ...declareVars('drop-shadow', dropShadow),
    ...declareVars('blur', blur),
    ...declareVars('breakpoint', breakpoint),
    ...declareVars('container', container),
    ...declareVars('perspective', perspective),
    ...declareVars('aspect', aspect),
    ...declareVars('border', borderWidth),
    ...declareVars('duration', duration),
    ...declareVars('ease', easing),
    ...declareVars('opacity', opacity),
    ...declareVars('z', zIndex),
    '  color-scheme: light dark;',
    '}',
    '',
    '/* Theme sombre : preference systeme, sauf choix explicite contraire. */',
    '@media (prefers-color-scheme: dark) {',
    '  :root:not([data-theme="light"]) {',
    ...declareVars('color', colorDark).map((line) => `  ${line}`),
    '  }',
    '}',
    '',
    '/* Theme sombre force. */',
    ':root[data-theme="dark"] {',
    ...declareVars('color', colorDark),
    '}',
    '',
    '/* Preflight. */',
    PREFLIGHT,
    '',
    '/* Images-cles. */',
    KEYFRAMES,
    '',
  ]
}

/** Resultat de la generation. */
export interface GeneratedStyles {
  /** Feuille de style complete, sans banniere. */
  css: string
  /** Tous les noms de classes produits pour ce palier, variants compris. */
  classNames: string[]
}

/**
 * Genere une feuille de style et la liste des noms de classes correspondants.
 *
 * @param tier `core` pour la feuille de base, `full` pour y ajouter les
 *   utilitaires de palette complete.
 * @throws {Error} Si deux familles produisent le meme nom de classe.
 *
 * @example
 * const { css, classNames } = generate('core')
 */
export function generate(tier: 'core' | 'full' = 'core'): GeneratedStyles {
  const classNames: string[] = []
  const sections: string[] = [...variableBlock()]

  for (const family of FAMILIES) {
    if (tier === 'core' && family.tier === 'extended') continue

    sections.push(`/* ${family.title}. */`)

    for (const [suffix, body] of Object.entries(family.rules)) {
      const className = `o-${suffix}`
      classNames.push(className)
      sections.push(`.${escapeSelector(className)}{${body}}`)
    }

    for (const variant of family.variants) {
      const lines: string[] = []
      for (const [suffix, body] of Object.entries(family.rules)) {
        const className = `${variant}:o-${suffix}`
        classNames.push(className)
        lines.push(wrapVariant(variant, `.${escapeSelector(className)}`, body))
      }
      sections.push(`/* ${family.title} — variant ${variant}. */`, ...lines)
    }

    sections.push('')
  }

  const duplicates = classNames.filter(
    (name, index) => classNames.indexOf(name) !== index,
  )
  if (duplicates.length > 0) {
    throw new Error(`[build-css] Noms de classes en double : ${duplicates.join(', ')}`)
  }

  return { css: sections.join('\n'), classNames }
}

/** Banniere apposee en tete des fichiers generes. */
export const BANNER = `/* Genere par scripts/build-css.ts a partir de src/styles/tokens.ts.
   Ne pas editer a la main : toute modification sera ecrasee. */`

/** Rend le contenu complet d'une feuille de style. */
export function renderCss(tier: 'core' | 'full'): string {
  return `${BANNER}\n${generate(tier).css}`
}

/** Rend le contenu complet de `src/styles/generated/classNames.ts`. */
export function renderClassNamesModule(): string {
  const core = generate('core').classNames
  const full = generate('full').classNames
  const extended = full.filter((name) => !core.includes(name))

  const list = (names: readonly string[]): string =>
    names.map((name) => `  '${name}',`).join('\n')

  return `${BANNER}

/** Classes presentes dans \`odoro-libs/styles.css\`. */
export const ODORO_CORE_CLASS_NAMES = [
${list(core)}
] as const

/**
 * Classes supplementaires presentes uniquement dans
 * \`odoro-libs/styles.full.css\` : utilitaires de couleur sur la palette brute.
 */
export const ODORO_EXTENDED_CLASS_NAMES = [
${list(extended)}
] as const

/** Toutes les classes utilitaires, tous paliers confondus. */
export const ODORO_CLASS_NAMES = [
  ...ODORO_CORE_CLASS_NAMES,
  ...ODORO_EXTENDED_CLASS_NAMES,
] as const

/** Union des classes de la feuille de base. */
export type OdoroCoreClassName = (typeof ODORO_CORE_CLASS_NAMES)[number]

/** Union des classes reservees a la feuille complete. */
export type OdoroExtendedClassName = (typeof ODORO_EXTENDED_CLASS_NAMES)[number]

/**
 * Union de toutes les classes utilitaires valides.
 *
 * Une classe de type {@link OdoroExtendedClassName} n'a d'effet que si
 * l'application importe \`odoro-libs/styles.full.css\`.
 */
export type OdoroClassName = OdoroCoreClassName | OdoroExtendedClassName
`
}
