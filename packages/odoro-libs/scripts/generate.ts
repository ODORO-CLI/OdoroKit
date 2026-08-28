/**
 * Derivation des design tokens en CSS et en noms de classes.
 *
 * Module pur : il ne touche pas au disque, ce qui permet a la suite de tests
 * de verifier que les fichiers generes sont bien a jour.
 *
 * Ce n'est pas un moteur JIT : aucun scan du code applicatif, aucune etape a
 * l'execution. Le fichier CSS produit est statique et importable tel quel.
 *
 * Ajouter une famille d'utilitaires se fait en ajoutant une entree a
 * `FAMILIES` — jamais en ecrivant du CSS a la main.
 *
 * @module
 */

import {
  borderWidth,
  breakpoint,
  colorDark,
  colorLight,
  duration,
  easing,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  radius,
  shadow,
  space,
  zIndex,
} from '../src/styles/tokens.js'

/** Variants supportes. */
type VariantName = 'hover' | 'focus' | 'md' | 'lg' | 'dark'

/** Une famille d'utilitaires : des regles, et les variants qui s'y appliquent. */
interface Family {
  /** Titre de section dans le CSS produit. */
  readonly title: string
  /** Variants generes pour cette famille. */
  readonly variants: readonly VariantName[]
  /** Suffixe de classe (sans le prefixe `o-`) vers declarations CSS. */
  readonly rules: Readonly<Record<string, string>>
}

/** Variants de mise en page : deux paliers suffisent. */
const RESPONSIVE: readonly VariantName[] = ['md', 'lg']
/** Variants d'etat, reserves aux proprietes visuelles. */
const STATEFUL: readonly VariantName[] = ['hover', 'focus']
/** Variants d'etat plus theme, pour les couleurs. */
const THEMED: readonly VariantName[] = ['hover', 'focus', 'dark']

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

/** Construit un jeu de regles a partir d'une echelle de tokens. */
function fromScale(
  scale: Readonly<Record<string, string>>,
  keys: readonly string[],
  build: (token: string, key: string) => Readonly<Record<string, string>>,
  group: string,
): Record<string, string> {
  const rules: Record<string, string> = {}
  for (const key of keys) {
    if (!(key in scale)) throw new Error(`[build-css] Token inconnu : ${group}.${key}`)
    Object.assign(rules, build(v(group, key), key))
  }
  return rules
}

/** Sous-ensemble d'espacements expose en utilitaires. */
const SPACE_KEYS = ['0', '1', '2', '3', '4', '6', '8'] as const
/** Couleurs exposees en texte. */
const TEXT_COLORS = [
  'fg',
  'fg-muted',
  'fg-inverted',
  'primary',
  'success',
  'warning',
  'danger',
] as const
/** Couleurs exposees en fond. */
const BG_COLORS = [
  'bg',
  'surface',
  'surface-raised',
  'primary',
  'primary-soft',
  'success-soft',
  'warning-soft',
  'danger-soft',
] as const
/** Couleurs exposees en bordure. */
const BORDER_COLORS = ['border', 'border-strong', 'primary', 'danger'] as const

const FAMILIES: readonly Family[] = [
  {
    title: 'Affichage',
    variants: RESPONSIVE,
    rules: {
      block: 'display:block',
      inline: 'display:inline',
      'inline-block': 'display:inline-block',
      flex: 'display:flex',
      'inline-flex': 'display:inline-flex',
      grid: 'display:grid',
      hidden: 'display:none',
    },
  },
  {
    title: 'Flexbox',
    variants: RESPONSIVE,
    rules: {
      'flex-row': 'flex-direction:row',
      'flex-col': 'flex-direction:column',
      'flex-wrap': 'flex-wrap:wrap',
      'flex-nowrap': 'flex-wrap:nowrap',
      'items-start': 'align-items:flex-start',
      'items-center': 'align-items:center',
      'items-end': 'align-items:flex-end',
      'items-stretch': 'align-items:stretch',
      'justify-start': 'justify-content:flex-start',
      'justify-center': 'justify-content:center',
      'justify-end': 'justify-content:flex-end',
      'justify-between': 'justify-content:space-between',
      'justify-around': 'justify-content:space-around',
      'flex-1': 'flex:1 1 0%',
      'flex-auto': 'flex:1 1 auto',
      'flex-none': 'flex:none',
      'shrink-0': 'flex-shrink:0',
    },
  },
  {
    title: 'Grille',
    variants: RESPONSIVE,
    rules: {
      'grid-cols-1': 'grid-template-columns:repeat(1,minmax(0,1fr))',
      'grid-cols-2': 'grid-template-columns:repeat(2,minmax(0,1fr))',
      'grid-cols-3': 'grid-template-columns:repeat(3,minmax(0,1fr))',
      'grid-cols-4': 'grid-template-columns:repeat(4,minmax(0,1fr))',
      'col-span-2': 'grid-column:span 2 / span 2',
      'col-span-full': 'grid-column:1 / -1',
    },
  },
  {
    title: 'Espacement interne (gap)',
    variants: RESPONSIVE,
    rules: fromScale(
      space,
      SPACE_KEYS,
      (token, key) => ({ [`gap-${key}`]: `gap:${token}` }),
      'space',
    ),
  },
  {
    title: 'Marges internes (padding)',
    variants: RESPONSIVE,
    rules: fromScale(
      space,
      SPACE_KEYS,
      (token, key) => ({
        [`p-${key}`]: `padding:${token}`,
        [`px-${key}`]: `padding-inline:${token}`,
        [`py-${key}`]: `padding-block:${token}`,
      }),
      'space',
    ),
  },
  {
    title: 'Marges externes (margin)',
    variants: RESPONSIVE,
    rules: {
      ...fromScale(
        space,
        SPACE_KEYS,
        (token, key) => ({
          [`mt-${key}`]: `margin-block-start:${token}`,
          [`mb-${key}`]: `margin-block-end:${token}`,
        }),
        'space',
      ),
      'mx-auto': 'margin-inline:auto',
    },
  },
  {
    title: 'Typographie',
    variants: RESPONSIVE,
    rules: {
      ...fromScale(
        fontSize,
        Object.keys(fontSize),
        (token, key) => ({ [`text-${key}`]: `font-size:${token}` }),
        'text',
      ),
      'text-left': 'text-align:left',
      'text-center': 'text-align:center',
      'text-right': 'text-align:right',
      truncate: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap',
    },
  },
  {
    title: 'Graisse et rythme vertical',
    variants: [],
    rules: {
      ...fromScale(
        fontWeight,
        Object.keys(fontWeight),
        (token, key) => ({ [`font-${key}`]: `font-weight:${token}` }),
        'weight',
      ),
      ...fromScale(
        lineHeight,
        Object.keys(lineHeight),
        (token, key) => ({ [`leading-${key}`]: `line-height:${token}` }),
        'leading',
      ),
      ...fromScale(
        letterSpacing,
        Object.keys(letterSpacing),
        (token, key) => ({ [`tracking-${key}`]: `letter-spacing:${token}` }),
        'tracking',
      ),
      'font-sans': `font-family:${v('font', 'sans')}`,
      'font-mono': `font-family:${v('font', 'mono')}`,
    },
  },
  {
    title: 'Couleur de texte',
    variants: THEMED,
    rules: fromScale(
      colorLight,
      TEXT_COLORS,
      (token, key) => ({ [`text-${key}`]: `color:${token}` }),
      'color',
    ),
  },
  {
    title: 'Couleur de fond',
    variants: THEMED,
    rules: fromScale(
      colorLight,
      BG_COLORS,
      (token, key) => ({ [`bg-${key}`]: `background-color:${token}` }),
      'color',
    ),
  },
  {
    title: 'Bordures',
    variants: THEMED,
    rules: {
      ...fromScale(
        colorLight,
        BORDER_COLORS,
        (token, key) => ({ [`border-${key}`]: `border-color:${token}` }),
        'color',
      ),
      ...fromScale(
        borderWidth,
        Object.keys(borderWidth),
        (token, key) => ({
          [`border-${key}`]: `border-width:${token};border-style:solid`,
        }),
        'border',
      ),
    },
  },
  {
    title: 'Rayons',
    variants: [],
    rules: fromScale(
      radius,
      Object.keys(radius),
      (token, key) => ({ [`rounded-${key}`]: `border-radius:${token}` }),
      'radius',
    ),
  },
  {
    title: 'Ombres',
    variants: STATEFUL,
    rules: fromScale(
      shadow,
      Object.keys(shadow),
      (token, key) => ({ [`shadow-${key}`]: `box-shadow:${token}` }),
      'shadow',
    ),
  },
  {
    title: 'Positionnement',
    variants: RESPONSIVE,
    rules: {
      relative: 'position:relative',
      absolute: 'position:absolute',
      fixed: 'position:fixed',
      sticky: 'position:sticky',
      'inset-0': 'inset:0',
      'top-0': 'top:0',
      'right-0': 'right:0',
      'bottom-0': 'bottom:0',
      'left-0': 'left:0',
    },
  },
  {
    title: 'Dimensions',
    variants: RESPONSIVE,
    rules: {
      'w-full': 'width:100%',
      'w-auto': 'width:auto',
      'h-full': 'height:100%',
      'min-w-0': 'min-width:0',
      'max-w-prose': 'max-width:65ch',
    },
  },
  {
    title: 'Debordement et plans',
    variants: [],
    rules: {
      'overflow-hidden': 'overflow:hidden',
      'overflow-auto': 'overflow:auto',
      ...fromScale(
        zIndex,
        Object.keys(zIndex),
        (token, key) => ({ [`z-${key}`]: `z-index:${token}` }),
        'z',
      ),
    },
  },
  {
    title: 'Interaction',
    variants: [],
    rules: {
      'cursor-pointer': 'cursor:pointer',
      'select-none': 'user-select:none',
      transition: `transition-property:color,background-color,border-color,box-shadow,transform,opacity;transition-duration:${v('duration', 'base')};transition-timing-function:${v('ease', 'standard')}`,
      ring: `outline:2px solid ${v('color', 'ring')};outline-offset:2px`,
      'sr-only':
        'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0',
    },
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
const PREFLIGHT = `*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:${v('font', 'sans')};font-size:${v('text', 'base')};line-height:${v('leading', 'normal')};color:${v('color', 'fg')};background-color:${v('color', 'bg')}}
h1,h2,h3,h4,p,figure,blockquote,dl,dd{margin:0}
img,picture,video,canvas,svg{display:block;max-width:100%}
button,input,select,textarea{font:inherit;color:inherit}
:where(a){color:${v('color', 'primary')}}
:where(:focus-visible){outline:2px solid ${v('color', 'ring')};outline-offset:2px}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important;scroll-behavior:auto !important}}`

/** Resultat de la generation. */
export interface GeneratedStyles {
  /** Feuille de style complete, sans banniere. */
  css: string
  /** Tous les noms de classes produits, variants compris. */
  classNames: string[]
}

/**
 * Genere le CSS complet et la liste des noms de classes.
 *
 * @throws {Error} Si deux familles produisent le meme nom de classe.
 *
 * @example
 * const { css, classNames } = generate()
 */
export function generate(): GeneratedStyles {
  const classNames: string[] = []
  const sections: string[] = []

  sections.push(
    '/* Variables de tokens — theme clair par defaut. */',
    ':root {',
    ...declareVars('space', space),
    ...declareVars('color', colorLight),
    ...declareVars('font', fontFamily),
    ...declareVars('text', fontSize),
    ...declareVars('weight', fontWeight),
    ...declareVars('leading', lineHeight),
    ...declareVars('tracking', letterSpacing),
    ...declareVars('radius', radius),
    ...declareVars('shadow', shadow),
    ...declareVars('border', borderWidth),
    ...declareVars('duration', duration),
    ...declareVars('ease', easing),
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
  )

  for (const family of FAMILIES) {
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

/** Rend le contenu complet de `src/styles/generated/odoro.css`. */
export function renderCss(): string {
  return `${BANNER}\n${generate().css}`
}

/** Rend le contenu complet de `src/styles/generated/classNames.ts`. */
export function renderClassNamesModule(): string {
  const names = generate()
    .classNames.map((name) => `  '${name}',`)
    .join('\n')
  return `${BANNER}

/** Tous les noms de classes utilitaires produits, variants compris. */
export const ODORO_CLASS_NAMES = [
${names}
] as const

/** Union des noms de classes utilitaires valides. */
export type OdoroClassName = (typeof ODORO_CLASS_NAMES)[number]
`
}
