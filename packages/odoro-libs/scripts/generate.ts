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
  textShadow,
  zIndex,
} from '../src/styles/tokens.js'

/**
 * Variants supportes.
 *
 * Les variants `sm` a `2xl` sont mobile-first (`min-width`) ; les variants
 * `max-*` couvrent l'ecriture inverse — cibler mobile ou tablette sans avoir a
 * annuler la regle sur les paliers superieurs.
 */
export type VariantName =
  | 'hover'
  | 'focus'
  | 'active'
  | 'disabled'
  | 'dark'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | 'max-sm'
  | 'max-md'
  | 'max-lg'

/**
 * Variant compose : le theme sombre croise avec un etat.
 *
 * ## Pourquoi la composition existe
 *
 * Tant qu'une couche semantique portait les couleurs, `hover:o-bg-surface-hover`
 * suffisait : la variable changeait seule avec le theme. En palette brute,
 * chaque classe designe une couleur precise, et il faut donc pouvoir dire
 * « survole, en sombre » d'un seul tenant. Sans cela, aucun composant
 * interactif ne peut avoir deux themes.
 *
 * La composition est volontairement bornee au theme croise avec un etat. Elle
 * n'est pas generale : ouvrir toutes les combinaisons multiplierait la feuille
 * par le produit des variants, pour couvrir des cas que personne n'ecrit.
 */
export type ComposedVariant = `dark:${'hover' | 'focus' | 'active'}`

/** Un variant, simple ou compose. */
export type AnyVariant = VariantName | ComposedVariant

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
  readonly variants: readonly AnyVariant[]
  /** Suffixe de classe (sans le prefixe `o-`) vers declarations CSS. */
  readonly rules: Readonly<Record<string, string>>
  /**
   * Suffixe ajoute au selecteur, pour les familles qui stylent les enfants
   * plutot que l'element lui-meme (`o-space-x-*`, `o-divide-*`).
   */
  readonly selectorSuffix?: string
}

/**
 * Variants de mise en page. L'ordre est significatif : dans une feuille a
 * specificite constante, c'est la derniere regle applicable qui l'emporte —
 * les paliers montants d'abord (mobile-first), puis les plafonds du plus large
 * au plus etroit.
 */
const RESPONSIVE: readonly VariantName[] = [
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  'max-lg',
  'max-md',
  'max-sm',
]
/** Variants d'etat, pour les proprietes visuelles. */
const STATEFUL: readonly VariantName[] = ['hover', 'focus']
/**
 * Teintes presentes dans la feuille de base.
 *
 * ## Pourquoi un sous-ensemble
 *
 * La couche semantique retiree, toute couleur passe desormais par la palette.
 * Si la palette entiere basculait dans la feuille de base, celle-ci
 * absorberait les 288 nuances et le decoupage en deux paliers n'aurait plus
 * d'objet : il n'y aurait plus qu'une seule feuille, lourde pour tout le
 * monde.
 *
 * Les teintes retenues sont celles qui portent le travail courant : une
 * echelle neutre, la marque, et les quatre intentions qu'une interface exprime
 * sans y penser — reussite, attention, erreur, information. Le reste vit dans
 * la feuille complete.
 */
const CORE_HUES: readonly string[] = [
  'zinc',
  'brand',
  'red',
  'amber',
  'emerald',
  'sky',
  'fuchsia',
]

/** Indique si une cle de palette appartient a la feuille de base. */
function isCoreHue(key: string): boolean {
  // Les cles sans nuance numerique — `white`, `black`, `transparent` — sont
  // dans les deux feuilles : elles n'appartiennent a aucune teinte.
  const hue = key.replace(/-\d+$/, '')
  return hue === key || CORE_HUES.includes(hue)
}

/** Palette de la feuille de base. */
const corePalette: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(Object.entries(palette).filter(([key]) => isCoreHue(key))),
)

/** Nuances reservees a la feuille complete. */
const extendedPalette: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(Object.entries(palette).filter(([key]) => !isCoreHue(key))),
)

/**
 * Variants des familles de couleur.
 *
 * Le theme croise avec chaque etat : en palette brute, un bouton qui s'eclaire
 * au survol doit pouvoir s'eclairer differemment selon le theme, et aucune
 * variable ne le fait plus a sa place.
 */
const COLOURED: readonly AnyVariant[] = [
  'hover',
  'focus',
  'active',
  'disabled',
  'dark',
  'dark:hover',
  'dark:focus',
  'dark:active',
]

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

/** Sous-ensemble de l'echelle d'espacement pour les proprietes de position. */
const INSET_KEYS = [
  '0',
  'px',
  '0.5',
  '1',
  '1.5',
  '2',
  '3',
  '4',
  '6',
  '8',
  '10',
  '12',
  '16',
  '20',
  '24',
] as const

/** Fractions usuelles, en pourcentage. */
const FRACTIONS = {
  '1/2': '50%',
  '1/3': '33.333333%',
  '2/3': '66.666667%',
  '1/4': '25%',
  '3/4': '75%',
  '1/5': '20%',
  '2/5': '40%',
  '3/5': '60%',
  '4/5': '80%',
  '1/6': '16.666667%',
  '5/6': '83.333333%',
} as const

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

/**
 * Arrets de degrade a la maniere de Tailwind : `from` et `to` posent des
 * variables, `via` reecrit la liste d'arrets pour s'y inserer. Les classes de
 * direction consomment `--o-gradient-stops` et fonctionnent avec n'importe
 * quelle combinaison des trois.
 */
function gradientStops(
  group: string,
  scale: Readonly<Record<string, string>>,
): Record<string, string> {
  return fromScale(group, scale, (token, key) => ({
    [`from-${key}`]: `--o-gradient-from:${token};--o-gradient-stops:var(--o-gradient-from),var(--o-gradient-to,transparent)`,
    [`via-${key}`]: `--o-gradient-stops:var(--o-gradient-from,transparent),${token},var(--o-gradient-to,transparent)`,
    [`to-${key}`]: `--o-gradient-to:${token}`,
  }))
}

/** Declinaison d'un surlignage : fond colore, coins doux, retours a la ligne. */
function highlightRule(background: string): string {
  return [
    `background-color:${background}`,
    'border-radius:0.25em',
    'padding-inline:0.25em',
    'box-decoration-break:clone',
    '-webkit-box-decoration-break:clone',
  ].join(';')
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
    title: 'Visibilite',
    tier: 'core',
    variants: RESPONSIVE,
    rules: {
      visible: 'visibility:visible',
      invisible: 'visibility:hidden',
      collapse: 'visibility:collapse',
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
      'flex-wrap-reverse': 'flex-wrap:wrap-reverse',
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
      'self-baseline': 'align-self:baseline',
      'justify-start': 'justify-content:flex-start',
      'justify-center': 'justify-content:center',
      'justify-end': 'justify-content:flex-end',
      'justify-between': 'justify-content:space-between',
      'justify-around': 'justify-content:space-around',
      'justify-evenly': 'justify-content:space-evenly',
      'justify-items-start': 'justify-items:start',
      'justify-items-center': 'justify-items:center',
      'justify-items-end': 'justify-items:end',
      'justify-items-stretch': 'justify-items:stretch',
      'justify-self-start': 'justify-self:start',
      'justify-self-center': 'justify-self:center',
      'justify-self-end': 'justify-self:end',
      'justify-self-stretch': 'justify-self:stretch',
      'content-start': 'align-content:flex-start',
      'content-center': 'align-content:center',
      'content-end': 'align-content:flex-end',
      'content-between': 'align-content:space-between',
      'content-around': 'align-content:space-around',
      'content-stretch': 'align-content:stretch',
      'flex-1': 'flex:1 1 0%',
      'flex-auto': 'flex:1 1 auto',
      'flex-initial': 'flex:0 1 auto',
      'flex-none': 'flex:none',
      grow: 'flex-grow:1',
      'grow-0': 'flex-grow:0',
      shrink: 'flex-shrink:1',
      'shrink-0': 'flex-shrink:0',
      ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [`order-${n}`, `order:${n}`])),
      'order-first': 'order:-9999',
      'order-last': 'order:9999',
      'order-none': 'order:0',
    },
  },
  {
    title: 'Grille',
    tier: 'core',
    variants: RESPONSIVE,
    rules: {
      ...Object.fromEntries(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => [
          `grid-cols-${n}`,
          `grid-template-columns:repeat(${n},minmax(0,1fr))`,
        ]),
      ),
      'grid-cols-none': 'grid-template-columns:none',
      // Grilles fluides : autant de colonnes que la place le permet, chaque
      // colonne au moins aussi large que le conteneur nomme.
      ...Object.fromEntries(
        ['3xs', '2xs', 'xs', 'sm', 'md'].map((key) => [
          `grid-cols-fill-${key}`,
          `grid-template-columns:repeat(auto-fill,minmax(${v('container', key)},1fr))`,
        ]),
      ),
      ...Object.fromEntries(
        ['3xs', '2xs', 'xs', 'sm', 'md'].map((key) => [
          `grid-cols-fit-${key}`,
          `grid-template-columns:repeat(auto-fit,minmax(${v('container', key)},1fr))`,
        ]),
      ),
      ...Object.fromEntries(
        [1, 2, 3, 4, 5, 6].map((n) => [
          `grid-rows-${n}`,
          `grid-template-rows:repeat(${n},minmax(0,1fr))`,
        ]),
      ),
      ...Object.fromEntries(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => [
          `col-span-${n}`,
          `grid-column:span ${n} / span ${n}`,
        ]),
      ),
      'col-span-full': 'grid-column:1 / -1',
      'col-auto': 'grid-column:auto',
      ...Object.fromEntries(
        [1, 2, 3, 4, 5, 6, 7].map((n) => [`col-start-${n}`, `grid-column-start:${n}`]),
      ),
      ...Object.fromEntries(
        [1, 2, 3, 4].map((n) => [`row-span-${n}`, `grid-row:span ${n} / span ${n}`]),
      ),
      'row-span-full': 'grid-row:1 / -1',
      // Le pendant de `col-start-*` : superposer deux elements dans la meme
      // cellule demande de nommer la ligne autant que la colonne.
      ...Object.fromEntries(
        [1, 2, 3, 4, 5, 6, 7].map((n) => [`row-start-${n}`, `grid-row-start:${n}`]),
      ),
      'row-auto': 'grid-row:auto',
      'place-items-center': 'place-items:center',
      'place-content-center': 'place-content:center',
      'place-self-center': 'place-self:center',
      'grid-flow-col': 'grid-auto-flow:column',
      'grid-flow-row': 'grid-auto-flow:row',
      'grid-flow-dense': 'grid-auto-flow:dense',
      'auto-rows-auto': 'grid-auto-rows:auto',
      'auto-rows-fr': 'grid-auto-rows:minmax(0,1fr)',
      'auto-cols-auto': 'grid-auto-columns:auto',
      'auto-cols-fr': 'grid-auto-columns:minmax(0,1fr)',
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
    title: 'Espacement des enfants',
    tier: 'core',
    variants: ['sm', 'md', 'lg'],
    // Chaque enfant, sauf le premier, recoit une marge de depart : l'ecart est
    // porte par le parent, sans marge orpheline en tete ni en queue.
    selectorSuffix: '>:not([hidden])~:not([hidden])',
    rules: merge(
      fromScale('space', space, (token, key) => ({
        [`space-x-${key}`]: `margin-inline-start:${token}`,
        [`space-y-${key}`]: `margin-block-start:${token}`,
      })),
      {
        // La couleur vient du preflight (`--o-color-border`) ; seule
        // l'epaisseur est posee ici.
        'divide-x': 'border-inline-start-width:1px',
        'divide-y': 'border-block-start-width:1px',
        'divide-none': 'border-inline-start-width:0;border-block-start-width:0',
      },
    ),
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
      fromScale(
        'space',
        space,
        (token, key) => ({
          [`indent-${key}`]: `text-indent:${token}`,
        }),
        ['1', '2', '4', '6', '8'],
      ),
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
        truncate: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap',
        'text-ellipsis': 'text-overflow:ellipsis',
        'text-clip': 'text-overflow:clip',
        'whitespace-normal': 'white-space:normal',
        'whitespace-nowrap': 'white-space:nowrap',
        'whitespace-pre': 'white-space:pre',
        'whitespace-pre-line': 'white-space:pre-line',
        'whitespace-pre-wrap': 'white-space:pre-wrap',
        'break-normal': 'overflow-wrap:normal;word-break:normal',
        'break-words': 'overflow-wrap:break-word',
        'break-all': 'word-break:break-all',
        'hyphens-auto': 'hyphens:auto',
        'hyphens-none': 'hyphens:none',
        // `balance` equilibre les lignes d'un titre ; `pretty` evite les mots
        // orphelins en fin de paragraphe.
        'text-balance': 'text-wrap:balance',
        'text-pretty': 'text-wrap:pretty',
        'text-wrap': 'text-wrap:wrap',
        'text-nowrap': 'text-wrap:nowrap',
        'tabular-nums': 'font-variant-numeric:tabular-nums',
        'normal-nums': 'font-variant-numeric:normal',
        'lining-nums': 'font-variant-numeric:lining-nums',
        'oldstyle-nums': 'font-variant-numeric:oldstyle-nums',
        'slashed-zero': 'font-variant-numeric:slashed-zero',
        ordinal: 'font-variant-numeric:ordinal',
        'diagonal-fractions': 'font-variant-numeric:diagonal-fractions',
        'small-caps': 'font-variant-caps:small-caps',
        'normal-caps': 'font-variant-caps:normal',
        'align-baseline': 'vertical-align:baseline',
        'align-top': 'vertical-align:top',
        'align-middle': 'vertical-align:middle',
        'align-bottom': 'vertical-align:bottom',
        'align-text-top': 'vertical-align:text-top',
        'align-text-bottom': 'vertical-align:text-bottom',
        'align-sub': 'vertical-align:sub',
        'align-super': 'vertical-align:super',
        'list-none': 'list-style-type:none',
        'list-disc': 'list-style-type:disc',
        'list-decimal': 'list-style-type:decimal',
        'list-inside': 'list-style-position:inside',
        'list-outside': 'list-style-position:outside',
        ...Object.fromEntries(
          [1, 2, 3, 4, 5, 6].map((n) => [
            `line-clamp-${n}`,
            `display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${n};overflow:hidden`,
          ]),
        ),
        'line-clamp-none': 'display:block;-webkit-line-clamp:none',
        // Texte en degrade : a combiner avec `o-bg-gradient-*` et `o-from-*`.
        'text-gradient':
          'background-clip:text;-webkit-background-clip:text;color:transparent',
      },
    ),
  },
  {
    title: 'Ombres de texte',
    tier: 'core',
    variants: [],
    rules: fromScale('text-shadow', textShadow, (token, key) => ({
      [`text-shadow-${key}`]: `text-shadow:${token}`,
    })),
  },
  {
    title: 'Decoration de texte',
    tier: 'core',
    variants: STATEFUL,
    rules: {
      underline: 'text-decoration-line:underline',
      overline: 'text-decoration-line:overline',
      'line-through': 'text-decoration-line:line-through',
      'no-underline': 'text-decoration-line:none',
      'decoration-solid': 'text-decoration-style:solid',
      'decoration-double': 'text-decoration-style:double',
      'decoration-dotted': 'text-decoration-style:dotted',
      'decoration-dashed': 'text-decoration-style:dashed',
      'decoration-wavy': 'text-decoration-style:wavy',
      'decoration-auto': 'text-decoration-thickness:auto',
      'decoration-from-font': 'text-decoration-thickness:from-font',
      'decoration-1': 'text-decoration-thickness:1px',
      'decoration-2': 'text-decoration-thickness:2px',
      'decoration-4': 'text-decoration-thickness:4px',
      'underline-offset-auto': 'text-underline-offset:auto',
      'underline-offset-1': 'text-underline-offset:1px',
      'underline-offset-2': 'text-underline-offset:2px',
      'underline-offset-4': 'text-underline-offset:4px',
      'underline-offset-8': 'text-underline-offset:8px',
    },
  },
  {
    title: 'Surlignage',
    tier: 'core',
    variants: [],
    // Translucides : un surlignage doit laisser lire le texte qu'il recouvre,
    // quel que soit le fond sur lequel il est pose. C'est aussi ce qui lui
    // permet de traverser les deux themes sans variant dedie.
    rules: {
      highlight: highlightRule('oklch(90.5% 0.182 98.111 / 0.55)'),
      'highlight-brand': highlightRule('oklch(62% 0.19 259 / 0.35)'),
      'highlight-fuchsia': highlightRule('oklch(66% 0.26 322 / 0.32)'),
      'highlight-emerald': highlightRule('oklch(70% 0.17 162 / 0.35)'),
      'highlight-amber': highlightRule('oklch(83% 0.19 84 / 0.45)'),
      'highlight-red': highlightRule('oklch(64% 0.21 25 / 0.32)'),
      'highlight-sky': highlightRule('oklch(69% 0.15 237 / 0.35)'),
    },
  },
  {
    title: 'Palette essentielle',
    tier: 'core',
    variants: COLOURED,
    rules: fromScale('palette', corePalette, (token, key) => ({
      [`text-${key}`]: `color:${token}`,
      [`bg-${key}`]: `background-color:${token}`,
      [`border-${key}`]: `border-color:${token}`,
      [`ring-${key}`]: `outline-color:${token}`,
      [`decoration-${key}`]: `text-decoration-color:${token}`,
      [`accent-${key}`]: `accent-color:${token}`,
      [`caret-${key}`]: `caret-color:${token}`,
    })),
  },
  {
    title: 'Barres de defilement',
    tier: 'core',
    // Le theme se dit sur la classe, comme partout ailleurs : aucune variable
    // ne bascule plus toute seule.
    variants: ['dark'],
    /*
     * Deux ecritures pour un seul resultat.
     *
     * `scrollbar-width` et `scrollbar-color` sont la propriete standard, et
     * c'est celle qu'il faut ecrire. Elle ne permet cependant ni d'arrondir le
     * curseur, ni de regler son epaisseur finement, et une partie des
     * navigateurs ne la connait pas encore.
     *
     * Le pseudo-element `::-webkit-scrollbar` couvre ces cas. Les deux
     * coexistent sans se contredire : un navigateur applique celle qu'il
     * comprend, et la standard l'emporte la ou les deux existent.
     */
    rules: {
      scrollbar: [
        'scrollbar-width:thin',
        'scrollbar-color:var(--o-scrollbar-thumb) var(--o-scrollbar-track)',
        '--o-scrollbar-thumb:' + palette['zinc-300'],
        '--o-scrollbar-track:transparent',
      ].join(';'),
      'scrollbar-dark': [
        '--o-scrollbar-thumb:' + palette['zinc-700'],
        '--o-scrollbar-track:transparent',
      ].join(';'),
      'scrollbar-stable': 'scrollbar-gutter:stable',
    },
  },
  {
    title: 'Barres de defilement — pseudo-elements',
    tier: 'core',
    variants: [],
    selectorSuffix: '::-webkit-scrollbar',
    rules: {
      scrollbar: 'width:8px;height:8px',
      'scrollbar-none': 'display:none',
    },
  },
  {
    title: 'Barres de defilement — rail',
    tier: 'core',
    variants: [],
    selectorSuffix: '::-webkit-scrollbar-track',
    rules: { scrollbar: 'background:var(--o-scrollbar-track)' },
  },
  {
    title: 'Barres de defilement — curseur',
    tier: 'core',
    variants: [],
    selectorSuffix: '::-webkit-scrollbar-thumb',
    rules: {
      scrollbar: [
        'background:var(--o-scrollbar-thumb)',
        'border-radius:9999px',
        // Une bordure transparente amincit le curseur sans reduire la zone
        // qu'on peut attraper au pointeur.
        'border:2px solid transparent',
        'background-clip:content-box',
      ].join(';'),
    },
  },
  {
    title: 'Voiles',
    tier: 'core',
    variants: [],
    /*
     * Noir et blanc translucides.
     *
     * Ils remplacent ce que la couche semantique appelait un `overlay` : une
     * surcouche modale, un verre depoli, un degrade qui eteint une image sous
     * un texte. La couleur et son alpha sont dans le nom — rien n'y designe un
     * role, et la meme classe sert dans les deux themes.
     */
    rules: Object.fromEntries(
      [10, 20, 30, 40, 45, 50, 60, 65, 70, 80, 90].flatMap((alpha) => [
        [
          `bg-black-${String(alpha)}`,
          `background-color:oklch(0% 0 0 / ${String(alpha / 100)})`,
        ],
        [
          `bg-white-${String(alpha)}`,
          `background-color:oklch(100% 0 0 / ${String(alpha / 100)})`,
        ],
        [
          `border-black-${String(alpha)}`,
          `border-color:oklch(0% 0 0 / ${String(alpha / 100)})`,
        ],
        [
          `border-white-${String(alpha)}`,
          `border-color:oklch(100% 0 0 / ${String(alpha / 100)})`,
        ],
      ]),
    ),
  },
  {
    title: 'Degrades',
    tier: 'core',
    // Le theme s'ecrit desormais sur la classe : un jalon de degrade en a
    // besoin autant qu'un fond.
    variants: ['dark'],
    rules: merge(
      {
        'bg-none': 'background-image:none',
        'bg-gradient-to-t':
          'background-image:linear-gradient(to top,var(--o-gradient-stops))',
        'bg-gradient-to-tr':
          'background-image:linear-gradient(to top right,var(--o-gradient-stops))',
        'bg-gradient-to-r':
          'background-image:linear-gradient(to right,var(--o-gradient-stops))',
        'bg-gradient-to-br':
          'background-image:linear-gradient(to bottom right,var(--o-gradient-stops))',
        'bg-gradient-to-b':
          'background-image:linear-gradient(to bottom,var(--o-gradient-stops))',
        'bg-gradient-to-bl':
          'background-image:linear-gradient(to bottom left,var(--o-gradient-stops))',
        'bg-gradient-to-l':
          'background-image:linear-gradient(to left,var(--o-gradient-stops))',
        'bg-gradient-to-tl':
          'background-image:linear-gradient(to top left,var(--o-gradient-stops))',
        'bg-gradient-radial':
          'background-image:radial-gradient(ellipse at center,var(--o-gradient-stops))',
        'bg-gradient-conic':
          'background-image:conic-gradient(from 180deg at 50% 50%,var(--o-gradient-stops))',
      },
      gradientStops('palette', corePalette),
    ),
  },
  {
    title: 'Bordures',
    tier: 'core',
    variants: [...STATEFUL, ...RESPONSIVE],
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
        'border-dotted': 'border-style:dotted',
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
        [`rounded-l-${key}`]: `border-start-start-radius:${token};border-end-start-radius:${token}`,
        [`rounded-r-${key}`]: `border-start-end-radius:${token};border-end-end-radius:${token}`,
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
    title: 'Surfaces',
    tier: 'core',
    // Le verre depoli existe en deux teintes plutot qu'en une seule qui
    // suivrait le theme : sans couche semantique, aucune variable ne bascule
    // toute seule. C'est a l'appelant de dire laquelle il veut, comme pour
    // n'importe quelle couleur.
    variants: ['dark'],
    rules: {
      glass: [
        `background-color:color-mix(in oklab,${v('palette', 'white')} 72%,transparent)`,
        `backdrop-filter:blur(${v('blur', 'md')})`,
        `-webkit-backdrop-filter:blur(${v('blur', 'md')})`,
      ].join(';'),
      'glass-strong': [
        `background-color:color-mix(in oklab,${v('palette', 'white')} 88%,transparent)`,
        `backdrop-filter:blur(${v('blur', 'lg')})`,
        `-webkit-backdrop-filter:blur(${v('blur', 'lg')})`,
      ].join(';'),
      'glass-dark': [
        `background-color:color-mix(in oklab,${v('palette', 'zinc-900')} 72%,transparent)`,
        `backdrop-filter:blur(${v('blur', 'md')})`,
        `-webkit-backdrop-filter:blur(${v('blur', 'md')})`,
      ].join(';'),
      'glass-dark-strong': [
        `background-color:color-mix(in oklab,${v('palette', 'zinc-900')} 88%,transparent)`,
        `backdrop-filter:blur(${v('blur', 'lg')})`,
        `-webkit-backdrop-filter:blur(${v('blur', 'lg')})`,
      ].join(';'),
    },
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
    title: 'Filtres',
    tier: 'core',
    variants: STATEFUL,
    rules: {
      grayscale: 'filter:grayscale(100%)',
      'grayscale-0': 'filter:grayscale(0)',
      sepia: 'filter:sepia(100%)',
      'sepia-0': 'filter:sepia(0)',
      invert: 'filter:invert(100%)',
      'invert-0': 'filter:invert(0)',
      ...Object.fromEntries(
        [50, 75, 90, 95, 100, 105, 110, 125, 150].map((n) => [
          `brightness-${n}`,
          `filter:brightness(${n / 100})`,
        ]),
      ),
      ...Object.fromEntries(
        [50, 75, 100, 125, 150].map((n) => [
          `contrast-${n}`,
          `filter:contrast(${n / 100})`,
        ]),
      ),
      ...Object.fromEntries(
        [0, 50, 100, 150, 200].map((n) => [
          `saturate-${n}`,
          `filter:saturate(${n / 100})`,
        ]),
      ),
      ...Object.fromEntries(
        [15, 30, 60, 90, 180].map((n) => [
          `hue-rotate-${n}`,
          `filter:hue-rotate(${n}deg)`,
        ]),
      ),
      ...Object.fromEntries(
        Object.keys(blur).map((key) => [
          `backdrop-blur-${key}`,
          `backdrop-filter:blur(${v('blur', key)})`,
        ]),
      ),
      'backdrop-blur-none': 'backdrop-filter:none',
      'backdrop-saturate-150': 'backdrop-filter:saturate(1.5)',
      'backdrop-brightness-90': 'backdrop-filter:brightness(0.9)',
      'backdrop-brightness-110': 'backdrop-filter:brightness(1.1)',
    },
  },
  {
    title: 'Transformations',
    tier: 'core',
    variants: STATEFUL,
    // `translate`, `rotate` et `scale` sont des proprietes individuelles : un
    // survol peut changer l'echelle sans annuler la rotation posee par une
    // autre classe.
    rules: {
      ...Object.fromEntries(
        [0, 50, 75, 90, 95, 100, 105, 110, 125, 150].map((n) => [
          `scale-${n}`,
          `scale:${n / 100}`,
        ]),
      ),
      ...Object.fromEntries(
        [0, 1, 2, 3, 6, 12, 45, 90, 180].map((n) => [`rotate-${n}`, `rotate:${n}deg`]),
      ),
      ...Object.fromEntries(
        ['0', 'px', '0.5', '1', '1.5', '2', '3', '4', '6', '8'].map((key) => [
          `translate-x-${key}`,
          `translate:${v('space', key)} 0`,
        ]),
      ),
      ...Object.fromEntries(
        ['0', 'px', '0.5', '1', '1.5', '2', '3', '4', '6', '8'].map((key) => [
          `translate-y-${key}`,
          `translate:0 ${v('space', key)}`,
        ]),
      ),
      // Elevation au survol : `hover:o-lift-sm` avec `o-transition-transform`.
      'lift-sm': 'translate:0 -0.125rem',
      'lift-md': 'translate:0 -0.25rem',
      'lift-lg': 'translate:0 -0.5rem',
      'lift-none': 'translate:0 0',
      // Centrage absolu : `o-absolute o-top-1/2 o-left-1/2 o-translate-center`.
      'translate-center': 'translate:-50% -50%',
      'translate-center-x': 'translate:-50% 0',
      'translate-center-y': 'translate:0 -50%',
      ...Object.fromEntries(
        [1, 2, 3, 6, 12].map((n) => [`skew-x-${n}`, `transform:skewX(${n}deg)`]),
      ),
      ...Object.fromEntries(
        [1, 2, 3, 6, 12].map((n) => [`skew-y-${n}`, `transform:skewY(${n}deg)`]),
      ),
      'origin-center': 'transform-origin:center',
      'origin-top': 'transform-origin:top',
      'origin-bottom': 'transform-origin:bottom',
      'origin-left': 'transform-origin:left',
      'origin-right': 'transform-origin:right',
      'origin-top-left': 'transform-origin:top left',
      'origin-top-right': 'transform-origin:top right',
      'origin-bottom-left': 'transform-origin:bottom left',
      'origin-bottom-right': 'transform-origin:bottom right',
    },
  },
  {
    title: 'Positionnement',
    tier: 'core',
    variants: RESPONSIVE,
    rules: merge(
      {
        static: 'position:static',
        relative: 'position:relative',
        absolute: 'position:absolute',
        fixed: 'position:fixed',
        sticky: 'position:sticky',
        'inset-0': 'inset:0',
        'inset-x-0': 'inset-inline:0',
        'inset-y-0': 'inset-block:0',
        'top-auto': 'top:auto',
        'right-auto': 'right:auto',
        'bottom-auto': 'bottom:auto',
        'left-auto': 'left:auto',
        'top-1/2': 'top:50%',
        'left-1/2': 'left:50%',
        'top-full': 'top:100%',
        'right-full': 'right:100%',
        'bottom-full': 'bottom:100%',
        'left-full': 'left:100%',
      },
      fromScale(
        'space',
        space,
        (token, key) => ({
          [`top-${key}`]: `top:${token}`,
          [`right-${key}`]: `right:${token}`,
          [`bottom-${key}`]: `bottom:${token}`,
          [`left-${key}`]: `left:${token}`,
        }),
        INSET_KEYS,
      ),
    ),
  },
  {
    title: 'Dimensions',
    tier: 'core',
    variants: RESPONSIVE,
    rules: merge(
      fromScale('container', container, (token, key) => ({
        [`max-w-${key}`]: `max-width:${token}`,
      })),
      fromScale('breakpoint', breakpoint, (token, key) => ({
        [`max-w-screen-${key}`]: `max-width:${token}`,
      })),
      fromScale('space', space, (token, key) => ({
        [`w-${key}`]: `width:${token}`,
        [`h-${key}`]: `height:${token}`,
        // Une hauteur minimale sur l'echelle d'espacement : reserver la place
        // d'un contenu qui n'est pas encore la est un besoin courant, et le
        // seul recours etait sinon un style en ligne.
        [`min-h-${key}`]: `min-height:${token}`,
        [`min-w-${key}`]: `min-width:${token}`,
        [`size-${key}`]: `width:${token};height:${token}`,
      })),
      Object.fromEntries(
        Object.entries(FRACTIONS).map(([key, value]) => [`w-${key}`, `width:${value}`]),
      ),
      Object.fromEntries(
        (['1/2', '1/3', '2/3', '1/4', '3/4'] as const).map((key) => [
          `h-${key}`,
          `height:${FRACTIONS[key]}`,
        ]),
      ),
      {
        'w-full': 'width:100%',
        'w-auto': 'width:auto',
        'w-screen': 'width:100vw',
        'w-fit': 'width:fit-content',
        'w-min': 'width:min-content',
        'w-max': 'width:max-content',
        'h-full': 'height:100%',
        'h-auto': 'height:auto',
        'h-screen': 'height:100dvh',
        'h-svh': 'height:100svh',
        'h-fit': 'height:fit-content',
        'min-w-full': 'min-width:100%',
        'min-w-fit': 'min-width:fit-content',
        'min-w-max': 'min-width:max-content',
        'min-h-full': 'min-height:100%',
        'min-h-fit': 'min-height:fit-content',
        'min-h-screen': 'min-height:100dvh',
        'min-h-svh': 'min-height:100svh',
        'max-w-full': 'max-width:100%',
        'max-w-none': 'max-width:none',
        'max-w-fit': 'max-width:fit-content',
        'max-w-prose': 'max-width:65ch',
        'max-h-full': 'max-height:100%',
        'max-h-screen': 'max-height:100dvh',
        'size-full': 'width:100%;height:100%',
        'size-fit': 'width:fit-content;height:fit-content',
      },
    ),
  },
  {
    title: 'Debordement et plans',
    tier: 'core',
    variants: [],
    rules: merge(
      fromScale('z', zIndex, (token, key) => ({ [`z-${key}`]: `z-index:${token}` })),
      fromScale(
        'space',
        space,
        (token, key) => ({
          [`scroll-mt-${key}`]: `scroll-margin-block-start:${token}`,
        }),
        ['8', '12', '16', '20', '24', '32'],
      ),
      {
        'overflow-auto': 'overflow:auto',
        'overflow-hidden': 'overflow:hidden',
        'overflow-clip': 'overflow:clip',
        'overflow-visible': 'overflow:visible',
        'overflow-scroll': 'overflow:scroll',
        'overflow-x-auto': 'overflow-x:auto',
        'overflow-y-auto': 'overflow-y:auto',
        'overflow-x-hidden': 'overflow-x:hidden',
        'overflow-y-hidden': 'overflow-y:hidden',
        'overscroll-auto': 'overscroll-behavior:auto',
        'overscroll-contain': 'overscroll-behavior:contain',
        'overscroll-none': 'overscroll-behavior:none',
        'scroll-smooth': 'scroll-behavior:smooth',
        'scroll-auto': 'scroll-behavior:auto',
        'snap-x': 'scroll-snap-type:x var(--o-snap-strictness,mandatory)',
        'snap-y': 'scroll-snap-type:y var(--o-snap-strictness,mandatory)',
        'snap-both': 'scroll-snap-type:both var(--o-snap-strictness,mandatory)',
        'snap-mandatory': '--o-snap-strictness:mandatory',
        'snap-proximity': '--o-snap-strictness:proximity',
        'snap-none': 'scroll-snap-type:none',
        'snap-start': 'scroll-snap-align:start',
        'snap-center': 'scroll-snap-align:center',
        'snap-end': 'scroll-snap-align:end',
        'snap-align-none': 'scroll-snap-align:none',
        'snap-stop': 'scroll-snap-stop:always',
        'scrollbar-none': 'scrollbar-width:none',
        'scrollbar-thin': 'scrollbar-width:thin',
        isolate: 'isolation:isolate',
        'isolation-auto': 'isolation:auto',
      },
    ),
  },
  {
    title: 'Opacite',
    tier: 'core',
    variants: [...STATEFUL, 'disabled'],
    rules: fromScale('opacity', opacity, (token, key) => ({
      [`opacity-${key}`]: `opacity:${token}`,
    })),
  },
  {
    title: 'Modes de fusion',
    tier: 'core',
    variants: [],
    rules: {
      'mix-blend-normal': 'mix-blend-mode:normal',
      'mix-blend-multiply': 'mix-blend-mode:multiply',
      'mix-blend-screen': 'mix-blend-mode:screen',
      'mix-blend-overlay': 'mix-blend-mode:overlay',
      'mix-blend-darken': 'mix-blend-mode:darken',
      'mix-blend-lighten': 'mix-blend-mode:lighten',
      'mix-blend-difference': 'mix-blend-mode:difference',
      'mix-blend-color-dodge': 'mix-blend-mode:color-dodge',
    },
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
        'aspect-portrait': 'aspect-ratio:3 / 4',
        'aspect-golden': 'aspect-ratio:1.618 / 1',
        'aspect-auto': 'aspect-ratio:auto',
        'object-cover': 'object-fit:cover',
        'object-contain': 'object-fit:contain',
        'object-fill': 'object-fit:fill',
        'object-none': 'object-fit:none',
        'object-center': 'object-position:center',
        'object-top': 'object-position:top',
        'object-bottom': 'object-position:bottom',
      },
    ),
  },
  {
    title: 'Interaction',
    tier: 'core',
    // Le curseur change quand un controle est desactive, et l'anneau se pose
    // au focus : ces deux etats appartiennent au DOM, pas au composant.
    variants: ['disabled', 'focus'],
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
        'cursor-progress': 'cursor:progress',
        'cursor-text': 'cursor:text',
        'cursor-move': 'cursor:move',
        'cursor-ew-resize': 'cursor:ew-resize',
        'cursor-ns-resize': 'cursor:ns-resize',
        'cursor-col-resize': 'cursor:col-resize',
        'cursor-row-resize': 'cursor:row-resize',
        'cursor-grab': 'cursor:grab',
        'cursor-grabbing': 'cursor:grabbing',
        'cursor-help': 'cursor:help',
        'cursor-crosshair': 'cursor:crosshair',
        'cursor-zoom-in': 'cursor:zoom-in',
        'cursor-zoom-out': 'cursor:zoom-out',
        'cursor-copy': 'cursor:copy',
        'cursor-none': 'cursor:none',
        'select-none': 'user-select:none',
        'select-text': 'user-select:text',
        'select-all': 'user-select:all',
        'pointer-events-none': 'pointer-events:none',
        'pointer-events-auto': 'pointer-events:auto',
        'appearance-none': 'appearance:none',
        'outline-none': 'outline:none',
        'touch-auto': 'touch-action:auto',
        'touch-none': 'touch-action:none',
        'touch-pan-x': 'touch-action:pan-x',
        'touch-pan-y': 'touch-action:pan-y',
        'touch-manipulation': 'touch-action:manipulation',
        'resize-none': 'resize:none',
        'resize-y': 'resize:vertical',
        'resize-x': 'resize:horizontal',
        resize: 'resize:both',
        'will-change-auto': 'will-change:auto',
        'will-change-transform': 'will-change:transform',
        'will-change-opacity': 'will-change:opacity',
        'will-change-scroll': 'will-change:scroll-position',
        // Couleur d'accentuation des controles natifs (cases, radios, range).
        transition: `transition-property:color,background-color,border-color,text-decoration-color,outline-color,box-shadow,filter,transform,translate,rotate,scale,opacity;transition-duration:${v('duration', 'base')};transition-timing-function:${v('ease', 'standard')}`,
        'transition-none': 'transition-property:none',
        'transition-all': `transition-property:all;transition-duration:${v('duration', 'base')};transition-timing-function:${v('ease', 'standard')}`,
        'transition-colors': `transition-property:color,background-color,border-color,text-decoration-color,outline-color;transition-duration:${v('duration', 'base')};transition-timing-function:${v('ease', 'standard')}`,
        'transition-opacity': `transition-property:opacity;transition-duration:${v('duration', 'base')};transition-timing-function:${v('ease', 'standard')}`,
        'transition-shadow': `transition-property:box-shadow;transition-duration:${v('duration', 'base')};transition-timing-function:${v('ease', 'standard')}`,
        'transition-transform': `transition-property:transform,translate,rotate,scale;transition-duration:${v('duration', 'base')};transition-timing-function:${v('ease', 'standard')}`,
        ...Object.fromEntries(
          [75, 100, 150, 200, 300, 500].map((n) => [
            `delay-${n}`,
            `transition-delay:${n}ms`,
          ]),
        ),
        ring: `outline:2px solid ${v('palette', 'brand-500')};outline-offset:2px`,
        'ring-none': 'outline:none',
        'sr-only':
          'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0',
        'not-sr-only':
          'position:static;width:auto;height:auto;padding:0;margin:0;overflow:visible;clip-path:none;white-space:normal',
      },
    ),
  },
  {
    title: 'Transitions de page',
    tier: 'core',
    variants: [],
    rules: {
      // `view-transition-name` doit etre unique dans le document : un seul
      // element par page peut porter cette classe, sinon le navigateur
      // abandonne la transition entiere.
      'view-transition-page': 'view-transition-name:o-page',
      'view-transition-none': 'view-transition-name:none',
    },
  },
  {
    title: 'Animations nommees',
    tier: 'core',
    variants: [],
    rules: {
      // Rotations et pulsations continues.
      'animate-spin': `animation:o-spin 1s ${v('ease', 'linear')} infinite`,
      'animate-spin-slow': `animation:o-spin 3s ${v('ease', 'linear')} infinite`,
      'animate-spin-reverse': `animation:o-spin 1s ${v('ease', 'linear')} infinite reverse`,
      'animate-pulse': `animation:o-pulse 2s ${v('ease', 'in-out')} infinite`,
      'animate-ping': 'animation:o-ping 1s cubic-bezier(0,0,0.2,1) infinite',
      'animate-bounce': 'animation:o-bounce 1s infinite',
      'animate-float': `animation:o-float 3s ${v('ease', 'in-out')} infinite`,
      'animate-heartbeat': `animation:o-heartbeat 1.2s ${v('ease', 'in-out')} infinite`,
      'animate-wiggle': `animation:o-wiggle 1s ${v('ease', 'in-out')} infinite`,
      'animate-caret-blink': `animation:o-caret-blink 1.25s ${v('ease', 'out')} infinite`,
      // Entrees.
      'animate-fade-in': `animation:o-fade-in ${v('duration', 'base')} ${v('ease', 'entrance')} both`,
      'animate-fade-in-up': `animation:o-fade-in-up ${v('duration', 'slow')} ${v('ease', 'entrance')} both`,
      'animate-fade-in-down': `animation:o-fade-in-down ${v('duration', 'slow')} ${v('ease', 'entrance')} both`,
      'animate-fade-in-left': `animation:o-fade-in-left ${v('duration', 'slow')} ${v('ease', 'entrance')} both`,
      'animate-fade-in-right': `animation:o-fade-in-right ${v('duration', 'slow')} ${v('ease', 'entrance')} both`,
      'animate-scale-in': `animation:o-scale-in ${v('duration', 'base')} ${v('ease', 'entrance')} both`,
      'animate-zoom-in': `animation:o-zoom-in ${v('duration', 'slow')} ${v('ease', 'entrance')} both`,
      'animate-blur-in': `animation:o-blur-in ${v('duration', 'slow')} ${v('ease', 'entrance')} both`,
      'animate-pop': `animation:o-pop ${v('duration', 'slow')} ${v('ease', 'emphasized')} both`,
      'animate-slide-in-up': `animation:o-slide-in-up ${v('duration', 'slow')} ${v('ease', 'entrance')} both`,
      'animate-slide-in-down': `animation:o-slide-in-down ${v('duration', 'slow')} ${v('ease', 'entrance')} both`,
      'animate-slide-in-left': `animation:o-slide-in-left ${v('duration', 'slow')} ${v('ease', 'entrance')} both`,
      'animate-slide-in-right': `animation:o-slide-in-right ${v('duration', 'slow')} ${v('ease', 'entrance')} both`,
      'animate-flip-in-x': `animation:o-flip-in-x ${v('duration', 'slower')} ${v('ease', 'entrance')} both`,
      'animate-flip-in-y': `animation:o-flip-in-y ${v('duration', 'slower')} ${v('ease', 'entrance')} both`,
      // Sorties.
      'animate-fade-out': `animation:o-fade-out ${v('duration', 'fast')} ${v('ease', 'exit')} both`,
      'animate-fade-out-up': `animation:o-fade-out-up ${v('duration', 'fast')} ${v('ease', 'exit')} both`,
      'animate-fade-out-down': `animation:o-fade-out-down ${v('duration', 'fast')} ${v('ease', 'exit')} both`,
      'animate-scale-out': `animation:o-scale-out ${v('duration', 'fast')} ${v('ease', 'exit')} both`,
      'animate-zoom-out': `animation:o-zoom-out ${v('duration', 'fast')} ${v('ease', 'exit')} both`,
      'animate-blur-out': `animation:o-blur-out ${v('duration', 'fast')} ${v('ease', 'exit')} both`,
      'animate-slide-out-up': `animation:o-slide-out-up ${v('duration', 'slow')} ${v('ease', 'exit')} both`,
      'animate-slide-out-down': `animation:o-slide-out-down ${v('duration', 'slow')} ${v('ease', 'exit')} both`,
      'animate-slide-out-left': `animation:o-slide-out-left ${v('duration', 'slow')} ${v('ease', 'exit')} both`,
      'animate-slide-out-right': `animation:o-slide-out-right ${v('duration', 'slow')} ${v('ease', 'exit')} both`,
      // Attention : un coup, pour ponctuer un evenement.
      'animate-shake': `animation:o-shake 600ms ${v('ease', 'standard')} both`,
      'animate-tada': `animation:o-tada 800ms ${v('ease', 'standard')} both`,
      'animate-wobble': `animation:o-wobble 800ms ${v('ease', 'standard')} both`,
      'animate-jello': `animation:o-jello 800ms ${v('ease', 'standard')} both`,
      'animate-rubber-band': `animation:o-rubber-band 800ms ${v('ease', 'standard')} both`,
      'animate-flash': `animation:o-flash 1s ${v('ease', 'standard')} both`,
      'animate-swing': `transform-origin:top center;animation:o-swing 800ms ${v('ease', 'in-out')} both`,
      // Textures animees.
      'animate-shimmer': [
        `background-image:linear-gradient(90deg,${v('palette', 'zinc-100')} 25%,${v('palette', 'zinc-50')} 37%,${v('palette', 'zinc-100')} 63%)`,
        'background-size:400% 100%',
        `animation:o-shimmer 1.4s ${v('ease', 'linear')} infinite`,
      ].join(';'),
      'animate-gradient': `background-size:200% 200%;animation:o-gradient-x 4s ${v('ease', 'in-out')} infinite`,
      'animate-indeterminate': `animation:o-indeterminate 1.5s ${v('ease', 'in-out')} infinite`,
      'animate-none': 'animation:none',
      // Reglages : delai, duree, repetition, sens, remplissage, etat.
      ...Object.fromEntries(
        [75, 100, 150, 200, 300, 500, 700, 1000].map((n) => [
          `animate-delay-${n}`,
          `animation-delay:${n}ms`,
        ]),
      ),
      ...Object.fromEntries(
        Object.keys(duration).map((key) => [
          `animate-duration-${key}`,
          `animation-duration:${v('duration', key)}`,
        ]),
      ),
      ...Object.fromEntries(
        Object.keys(easing).map((key) => [
          `animate-ease-${key}`,
          `animation-timing-function:${v('ease', key)}`,
        ]),
      ),
      'animate-infinite': 'animation-iteration-count:infinite',
      'animate-once': 'animation-iteration-count:1',
      'animate-twice': 'animation-iteration-count:2',
      'animate-reverse': 'animation-direction:reverse',
      'animate-alternate': 'animation-direction:alternate',
      'animate-fill-none': 'animation-fill-mode:none',
      'animate-fill-forwards': 'animation-fill-mode:forwards',
      'animate-fill-backwards': 'animation-fill-mode:backwards',
      'animate-fill-both': 'animation-fill-mode:both',
      'animate-paused': 'animation-play-state:paused',
      'animate-running': 'animation-play-state:running',
    },
  },
  {
    title: 'Palette complete — couleur de texte',
    tier: 'extended',
    variants: COLOURED,
    rules: fromScale('palette', extendedPalette, (token, key) => ({
      [`text-${key}`]: `color:${token}`,
    })),
  },
  {
    title: 'Palette complete — couleur de fond',
    tier: 'extended',
    variants: COLOURED,
    rules: fromScale('palette', extendedPalette, (token, key) => ({
      [`bg-${key}`]: `background-color:${token}`,
    })),
  },
  {
    title: 'Palette complete — couleur de bordure',
    tier: 'extended',
    variants: COLOURED,
    rules: fromScale('palette', extendedPalette, (token, key) => ({
      [`border-${key}`]: `border-color:${token}`,
    })),
  },
  {
    title: 'Palette complete — arrets de degrade',
    tier: 'extended',
    variants: ['dark'],
    rules: gradientStops('palette', extendedPalette),
  },
]

/**
 * Echappe les caracteres non valides dans un selecteur de classe CSS.
 *
 * Un identifiant CSS ne peut pas commencer par un chiffre : le premier
 * caractere d'un variant comme `2xl:` est echappe en notation unicode.
 */
function escapeSelector(className: string): string {
  const escaped = className.replace(/[:./]/g, '\\$&')
  return /^\d/.test(escaped) ? `\\3${escaped[0]} ${escaped.slice(1)}` : escaped
}

/** Pseudo-classe correspondant a un variant d'etat. */
const STATE_PSEUDO: Readonly<Record<string, string>> = {
  hover: ':hover',
  focus: ':focus-visible',
  active: ':active',
  // Un controle desactive doit pouvoir se distinguer sans qu'on ait a lui
  // poser une classe conditionnelle : c'est un etat du DOM, pas du composant.
  disabled: ':disabled',
}

/**
 * Enveloppe des regles dans le contexte d'un variant, simple ou compose.
 *
 * Le theme sombre produit deux ecritures : le choix explicite du developpeur
 * l'emporte sur la preference systeme, dans les deux sens. Un variant compose
 * — `dark:hover` — ajoute la pseudo-classe au selecteur avant de l'inscrire
 * dans les deux contextes de theme.
 */
function wrapVariant(variant: AnyVariant, selector: string, body: string): string {
  const segments = variant.split(':')
  const dark = segments.includes('dark')

  let scoped = selector
  for (const segment of segments) {
    const pseudo = STATE_PSEUDO[segment]
    if (pseudo !== undefined) scoped += pseudo
  }

  if (dark) {
    return [
      `:root[data-theme="dark"] ${scoped}{${body}}`,
      `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) ${scoped}{${body}}}`,
    ].join('\n')
  }

  if (scoped !== selector) return `${scoped}{${body}}`

  switch (variant) {
    case 'sm':
    case 'md':
    case 'lg':
    case 'xl':
    case '2xl':
      return `@media (min-width:${breakpoint[variant]}){${selector}{${body}}}`
    case 'max-sm':
      return `@media (width < ${breakpoint.sm}){${selector}{${body}}}`
    case 'max-md':
      return `@media (width < ${breakpoint.md}){${selector}{${body}}}`
    case 'max-lg':
      return `@media (width < ${breakpoint.lg}){${selector}{${body}}}`
    default:
      return `${selector}{${body}}`
  }
}

/** Bloc de variables CSS pour un ensemble de tokens. */
function declareVars(group: string, scale: Readonly<Record<string, string>>): string[] {
  return Object.entries(scale).map(
    ([key, value]) => `  --o-${group}-${cssKey(key)}: ${value};`,
  )
}

/** Preflight minimal : le strict necessaire pour que les tokens s'appliquent. */
const PREFLIGHT = `*,*::before,*::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:${v('palette', 'zinc-200')}}
html{-webkit-text-size-adjust:100%;tab-size:4}
body{margin:0;font-family:${v('font', 'sans')};font-size:${v('text', 'base')};line-height:${v('leading', 'normal')};color:${v('palette', 'zinc-900')};background-color:${v('palette', 'zinc-50')};-webkit-font-smoothing:antialiased}
h1,h2,h3,h4,h5,h6,p,figure,blockquote,dl,dd,pre{margin:0}
h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}
ol,ul,menu{list-style:none;margin:0;padding:0}
img,picture,video,canvas,svg{display:block;max-width:100%}
button,input,select,textarea{font:inherit;color:inherit;margin:0;background:transparent}
button,[role="button"]{cursor:pointer}
table{border-collapse:collapse}
code,kbd,samp,pre{font-family:${v('font', 'mono')};font-size:1em}
mark{background-color:oklch(90.5% 0.182 98.111 / 0.55);color:inherit;border-radius:0.125em;padding-inline:0.125em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
:where(a){color:${v('palette', 'brand-600')}}
:where(a:hover){color:${v('palette', 'brand-700')}}
::selection{background-color:${v('palette', 'brand-100')}}
:where(:focus-visible){outline:2px solid ${v('palette', 'brand-500')};outline-offset:2px}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important;scroll-behavior:auto !important}}`

/**
 * Images-cles nommees. Elles sont emises une fois, en tete de feuille : une
 * `@keyframes` ne peut pas etre generee par famille sans etre dupliquee.
 */
const KEYFRAMES = `@keyframes o-spin{to{transform:rotate(360deg)}}
@keyframes o-pulse{50%{opacity:0.5}}
@keyframes o-ping{75%,100%{transform:scale(2);opacity:0}}
@keyframes o-bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:none;animation-timing-function:cubic-bezier(0,0,0.2,1)}}
@keyframes o-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-0.375rem)}}
@keyframes o-heartbeat{0%,28%,70%,100%{transform:scale(1)}14%,42%{transform:scale(1.12)}}
@keyframes o-wiggle{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
@keyframes o-caret-blink{0%,70%,100%{opacity:1}20%,50%{opacity:0}}
@keyframes o-fade-in{from{opacity:0}}
@keyframes o-fade-in-up{from{opacity:0;transform:translateY(1rem)}}
@keyframes o-fade-in-down{from{opacity:0;transform:translateY(-1rem)}}
@keyframes o-fade-in-left{from{opacity:0;transform:translateX(-1rem)}}
@keyframes o-fade-in-right{from{opacity:0;transform:translateX(1rem)}}
@keyframes o-scale-in{from{opacity:0;transform:scale(0.95)}}
@keyframes o-zoom-in{from{opacity:0;transform:scale(0.5)}}
@keyframes o-blur-in{from{opacity:0;filter:blur(8px)}}
@keyframes o-pop{0%{opacity:0;transform:scale(0.8)}60%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
@keyframes o-slide-in-up{from{transform:translateY(100%)}}
@keyframes o-slide-in-down{from{transform:translateY(-100%)}}
@keyframes o-slide-in-left{from{transform:translateX(-100%)}}
@keyframes o-slide-in-right{from{transform:translateX(100%)}}
@keyframes o-flip-in-x{from{opacity:0;transform:perspective(800px) rotateX(-90deg)}}
@keyframes o-flip-in-y{from{opacity:0;transform:perspective(800px) rotateY(-90deg)}}
@keyframes o-fade-out{to{opacity:0}}
@keyframes o-fade-out-up{to{opacity:0;transform:translateY(-1rem)}}
@keyframes o-fade-out-down{to{opacity:0;transform:translateY(1rem)}}
@keyframes o-scale-out{to{opacity:0;transform:scale(0.95)}}
@keyframes o-zoom-out{to{opacity:0;transform:scale(0.5)}}
@keyframes o-blur-out{to{opacity:0;filter:blur(8px)}}
@keyframes o-slide-out-up{to{transform:translateY(-100%)}}
@keyframes o-slide-out-down{to{transform:translateY(100%)}}
@keyframes o-slide-out-left{to{transform:translateX(-100%)}}
@keyframes o-slide-out-right{to{transform:translateX(100%)}}
@keyframes o-shake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-0.375rem)}20%,40%,60%,80%{transform:translateX(0.375rem)}}
@keyframes o-tada{0%,100%{transform:scale(1)}10%,20%{transform:scale(0.92) rotate(-3deg)}30%,50%,70%,90%{transform:scale(1.08) rotate(3deg)}40%,60%,80%{transform:scale(1.08) rotate(-3deg)}}
@keyframes o-wobble{0%,100%{transform:none}15%{transform:translateX(-1.25rem) rotate(-5deg)}30%{transform:translateX(1rem) rotate(3deg)}45%{transform:translateX(-0.75rem) rotate(-3deg)}60%{transform:translateX(0.5rem) rotate(2deg)}75%{transform:translateX(-0.25rem) rotate(-1deg)}}
@keyframes o-jello{0%,100%{transform:none}22%{transform:skewX(-12deg) skewY(-12deg)}33%{transform:skewX(6deg) skewY(6deg)}44%{transform:skewX(-3deg) skewY(-3deg)}55%{transform:skewX(1.5deg) skewY(1.5deg)}66%{transform:skewX(-0.75deg) skewY(-0.75deg)}}
@keyframes o-rubber-band{0%,100%{transform:scale(1,1)}30%{transform:scale(1.25,0.75)}40%{transform:scale(0.75,1.25)}50%{transform:scale(1.15,0.85)}65%{transform:scale(0.95,1.05)}75%{transform:scale(1.05,0.95)}}
@keyframes o-flash{0%,50%,100%{opacity:1}25%,75%{opacity:0}}
@keyframes o-swing{20%{transform:rotate(15deg)}40%{transform:rotate(-10deg)}60%{transform:rotate(5deg)}80%{transform:rotate(-5deg)}100%{transform:rotate(0deg)}}
@keyframes o-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
@keyframes o-gradient-x{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes o-indeterminate{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
@keyframes o-vt-out{to{opacity:0}}
@keyframes o-vt-in{from{opacity:0}}
@keyframes o-vt-page-out{to{opacity:0;transform:translateY(-0.5rem)}}
@keyframes o-vt-page-in{from{opacity:0;transform:translateY(0.75rem)}}`

/**
 * Transitions de page par defaut.
 *
 * Sans ces regles, le navigateur applique son fondu de 90 ms : techniquement
 * present, visuellement nul. Le routeur declenche bien la transition — c'est
 * son apparence qui manquait.
 *
 * La racine se contente d'un fondu, jamais d'un deplacement. Une application
 * qui nomme une zone (`o-view-transition-page`) sort cette zone de la racine :
 * tout le reste — en-tete, navigation, pied de page — reste dans le groupe
 * racine, et le voir glisser alors qu'il n'a pas change serait un defaut.
 * Le deplacement est donc reserve a la zone nommee.
 */
const VIEW_TRANSITIONS = `::view-transition-old(root){animation:o-vt-out ${v('duration', 'faster')} ${v('ease', 'exit')} both}
::view-transition-new(root){animation:o-vt-in ${v('duration', 'fast')} ${v('ease', 'entrance')} both}
::view-transition-old(o-page){animation:o-vt-page-out ${v('duration', 'fast')} ${v('ease', 'exit')} both}
::view-transition-new(o-page){animation:o-vt-page-in ${v('duration', 'base')} ${v('ease', 'entrance')} both}
@media (prefers-reduced-motion:reduce){::view-transition-old(root),::view-transition-new(root),::view-transition-old(o-page),::view-transition-new(o-page){animation:none}}`

/**
 * Valeurs par defaut du document en theme sombre.
 *
 * ## Pourquoi ce bloc existe
 *
 * Le fond de la page, la couleur du texte, celle des liens : rien de tout cela
 * ne peut passer par une classe, puisqu'il n'y a pas d'element a habiller. Une
 * couche semantique reglait la question toute seule — la variable changeait,
 * le document suivait.
 *
 * Sans elle, ces valeurs sont ecrites deux fois : une fois en clair dans le
 * preflight, une fois ici. C'est le prix de la palette brute, et il se paie
 * exactement une fois, a cet endroit, plutot qu'a chaque composant.
 */
function darkPreflight(): string {
  const rules: readonly string[] = [
    `*,*::before,*::after{border-color:${v('palette', 'zinc-800')}}`,
    `body{color:${v('palette', 'zinc-50')};background-color:${v('palette', 'zinc-950')}}`,
    `:where(a){color:${v('palette', 'brand-300')}}`,
    `:where(a:hover){color:${v('palette', 'brand-200')}}`,
    `::selection{background-color:${v('palette', 'brand-900')}}`,
    `mark{background-color:oklch(82.8% 0.189 84.429 / 0.35)}`,
  ]

  /** Prefixe chaque regle par une portee de theme. */
  const scope = (prefix: string): string =>
    rules.map((rule) => `${prefix} ${rule}`).join('\n')

  return [
    ':root[data-theme="dark"]{color-scheme:dark}',
    scope(':root[data-theme="dark"]'),
    '@media (prefers-color-scheme:dark){',
    ':root:not([data-theme="light"]){color-scheme:dark}',
    scope(':root:not([data-theme="light"])'),
    '}',
  ].join('\n')
}

/** Bloc des variables de tokens, commun aux deux feuilles. */
function variableBlock(): string[] {
  return [
    '/* Variables de tokens — theme clair par defaut. */',
    ':root {',
    `  --o-spacing: ${spacingBase};`,
    ...declareVars('space', space),
    ...declareVars('palette', palette),
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
    ...declareVars('text-shadow', textShadow),
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
    '/* Preflight. */',
    PREFLIGHT,
    '',
    '/* Preflight — theme sombre. */',
    darkPreflight(),
    '',
    '/* Images-cles. */',
    KEYFRAMES,
    '',
    '/* Transitions de page. */',
    VIEW_TRANSITIONS,
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
  /*
   * Selecteurs produits, pour la detection de doublons.
   *
   * C'est le selecteur qui doit etre unique, pas le nom de classe : une meme
   * classe habille legitimement plusieurs pseudo-elements — le rail et le
   * curseur d'une barre de defilement, par exemple. Ne comparer que les noms
   * refuserait ces familles, alors qu'elles ne se recouvrent en rien.
   */
  const selectors: string[] = []
  const sections: string[] = [...variableBlock()]

  for (const family of FAMILIES) {
    if (tier === 'core' && family.tier === 'extended') continue

    const suffix = family.selectorSuffix ?? ''
    sections.push(`/* ${family.title}. */`)

    for (const [ruleSuffix, body] of Object.entries(family.rules)) {
      const className = `o-${ruleSuffix}`
      classNames.push(className)
      selectors.push(`${className}${suffix}`)
      sections.push(`.${escapeSelector(className)}${suffix}{${body}}`)
    }

    for (const variant of family.variants) {
      const lines: string[] = []
      for (const [ruleSuffix, body] of Object.entries(family.rules)) {
        const className = `${variant}:o-${ruleSuffix}`
        classNames.push(className)
        selectors.push(`${className}${suffix}`)
        lines.push(wrapVariant(variant, `.${escapeSelector(className)}${suffix}`, body))
      }
      sections.push(`/* ${family.title} — variant ${variant}. */`, ...lines)
    }

    sections.push('')
  }

  const duplicates = selectors.filter(
    (selector, index) => selectors.indexOf(selector) !== index,
  )
  if (duplicates.length > 0) {
    throw new Error(`[build-css] Selecteurs en double : ${duplicates.join(', ')}`)
  }

  return { css: sections.join('\n'), classNames: [...new Set(classNames)] }
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
  const coreSet = new Set(core)
  const extended = full.filter((name) => !coreSet.has(name))

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

/**
 * Toutes les classes utilitaires, tous paliers confondus. L'annotation evite
 * de materialiser un tuple de plusieurs dizaines de milliers d'elements, que
 * TypeScript refuse de representer.
 */
export const ODORO_CLASS_NAMES: readonly OdoroClassName[] = [
  ...ODORO_CORE_CLASS_NAMES,
  ...ODORO_EXTENDED_CLASS_NAMES,
]
`
}
