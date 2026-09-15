/**
 * Derivation of the design tokens into CSS and class names.
 *
 * Pure module: it never touches the disk, which lets the test suite check
 * that the generated files are indeed up to date.
 *
 * This is not a JIT engine: no scan of the application code, no step at
 * runtime. The produced stylesheets are static and importable as they are.
 *
 * Two tiers are emitted, because the complete palette cannot be imposed on
 * every project without a scan:
 * - `odoro.css` — variables, preflight and structural utilities, colored by
 *   the semantic layer alone;
 * - `odoro.full.css` — the same, plus the color utilities over the 290 shades
 *   of the raw palette.
 *
 * Adding a utility family is done by adding an entry to `FAMILIES` — never by
 * writing CSS by hand.
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
  theme,
  themeDark,
} from './tokens.js'

/**
 * Supported variants.
 *
 * The `sm` to `2xl` variants are mobile-first (`min-width`); the `max-*`
 * variants cover the reverse spelling — targeting mobile or tablet without
 * having to undo the rule on the wider tiers.
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
 * Composed variant: the dark theme crossed with a state.
 *
 * ## Why composition exists
 *
 * As long as a semantic layer carried the colors, `hover:o-bg-surface-hover`
 * was enough: the variable changed on its own with the theme. In raw palette,
 * every class names one precise color, and one must therefore be able to say
 * "hovered, in dark" in a single breath. Without that, no interactive
 * component can have two themes.
 *
 * Composition is deliberately bounded to the theme crossed with a state. It
 * is not general: opening every combination would multiply the stylesheet by
 * the product of the variants, to cover cases nobody writes.
 */
export type ComposedVariant = `dark:${'hover' | 'focus' | 'active'}`

/** A variant, plain or composed. */
export type AnyVariant = VariantName | ComposedVariant

/**
 * Shipping tier of a family.
 *
 * - `core`: present in both stylesheets;
 * - `extended`: reserved for `odoro.full.css`.
 */
export type Tier = 'core' | 'extended'

/** A utility family: some rules, and the variants that apply to them. */
export interface Family {
  /** Section title in the produced CSS. */
  readonly title: string
  /** Shipping tier. */
  readonly tier: Tier
  /** Variants generated for this family. */
  readonly variants: readonly AnyVariant[]
  /** Class suffix (without the `o-` prefix) to CSS declarations. */
  readonly rules: Readonly<Record<string, string>>
  /**
   * Suffix appended to the selector, for the families that style the children
   * rather than the element itself (`o-space-x-*`, `o-divide-*`).
   */
  readonly selectorSuffix?: string
}

/**
 * Layout variants. The order matters: in a stylesheet of constant
 * specificity, it is the last applicable rule that wins — the rising tiers
 * first (mobile-first), then the ceilings from the widest to the narrowest.
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
/** State variants, for the visual properties. */
const STATEFUL: readonly VariantName[] = ['hover', 'focus']
/**
 * Hues present in the base stylesheet.
 *
 * ## Why a subset
 *
 * With the semantic layer gone, every color now goes through the palette. If
 * the whole palette moved into the base stylesheet, that one would absorb the
 * 288 shades and the split into two tiers would lose its point: there would
 * be a single stylesheet again, heavy for everybody.
 *
 * The hues kept are the ones that carry the everyday work: a neutral scale,
 * the brand, and the four intents an interface expresses without thinking
 * about it — success, attention, error, information. The rest lives in the
 * complete stylesheet.
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

/** Tells whether a palette key belongs to the base stylesheet. */
function isCoreHue(key: string): boolean {
  // The keys without a numeric shade — `white`, `black`, `transparent` — are
  // in both stylesheets: they belong to no hue at all.
  const hue = key.replace(/-\d+$/, '')
  return hue === key || CORE_HUES.includes(hue)
}

/** Palette of the base stylesheet. */
const corePalette: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(Object.entries(palette).filter(([key]) => isCoreHue(key))),
)

/** Shades reserved for the complete stylesheet. */
const extendedPalette: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(Object.entries(palette).filter(([key]) => !isCoreHue(key))),
)

/**
 * Variants of the color families.
 *
 * The theme crossed with every state: in raw palette, a button that lightens
 * on hover must be able to lighten differently depending on the theme, and no
 * variable does it in its stead any more.
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
 * Normalizes a token key into a valid CSS identifier: a custom property name
 * cannot contain a dot (`0.5` -> `0_5`).
 */
function cssKey(key: string): string {
  return key.replace(/\./g, '_')
}

/** References a CSS token variable. */
function v(group: string, key: string): string {
  return `var(--o-${group}-${cssKey(key)})`
}

/**
 * Builds a set of rules from a token scale.
 *
 * @throws {Error} If a requested key does not exist in the scale: a typo must
 *   not silently produce a variable that does not exist.
 */
function fromScale(
  group: string,
  scale: Readonly<Record<string, string>>,
  build: (token: string, key: string) => Readonly<Record<string, string>>,
  keys: readonly string[] = Object.keys(scale),
): Record<string, string> {
  const rules: Record<string, string> = {}
  for (const key of keys) {
    if (!(key in scale)) throw new Error(`[build-css] Unknown token: ${group}.${key}`)
    Object.assign(rules, build(v(group, key), key))
  }
  return rules
}

/** Merges several rule sets, checking that nothing collides. */
function merge(
  ...parts: readonly Readonly<Record<string, string>>[]
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const part of parts) {
    for (const [key, value] of Object.entries(part)) {
      if (key in result) throw new Error(`[build-css] Duplicate rule: o-${key}`)
      result[key] = value
    }
  }
  return result
}

/** Keys of the spacing scale, in declaration order. */
const SPACE_KEYS = Object.keys(space)

/** Subset of the spacing scale for the position properties. */
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

/** Common fractions, as percentages. */
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

/** Spacing axes: class suffix -> CSS properties. */
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

/** Builds the utilities of a set of axes over the whole spacing scale. */
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
 * Gradient stops the Tailwind way: `from` and `to` set variables, `via`
 * rewrites the stop list to insert itself into it. The direction classes
 * consume `--o-gradient-stops` and work with any combination of the three.
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

/** One flavor of highlight: colored background, soft corners, line breaks. */
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
    title: 'Display',
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
    title: 'Visibility',
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
    title: 'Grid',
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
      // Fluid grids: as many columns as the room allows, each column at
      // least as wide as the named container.
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
      // The counterpart of `col-start-*`: stacking two elements in the same
      // cell requires naming the row as much as the column.
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
    title: 'Gutters',
    tier: 'core',
    variants: RESPONSIVE,
    rules: fromScale('space', space, (token, key) => ({
      [`gap-${key}`]: `gap:${token}`,
      [`gap-x-${key}`]: `column-gap:${token}`,
      [`gap-y-${key}`]: `row-gap:${token}`,
    })),
  },
  {
    title: 'Padding',
    tier: 'core',
    variants: RESPONSIVE,
    rules: spacingRules(PADDING_AXES),
  },
  {
    title: 'Margins',
    tier: 'core',
    variants: RESPONSIVE,
    rules: spacingRules(MARGIN_AXES),
  },
  {
    title: 'Child spacing',
    tier: 'core',
    variants: ['sm', 'md', 'lg'],
    // Every child but the first gets a start margin: the gap is carried by
    // the parent, with no orphan margin at the head or at the tail.
    selectorSuffix: '>:not([hidden])~:not([hidden])',
    rules: merge(
      fromScale('space', space, (token, key) => ({
        [`space-x-${key}`]: `margin-inline-start:${token}`,
        [`space-y-${key}`]: `margin-block-start:${token}`,
      })),
      {
        // The color comes from the preflight (`--o-color-border`); only the
        // width is set here.
        'divide-x': 'border-inline-start-width:1px',
        'divide-y': 'border-block-start-width:1px',
        'divide-none': 'border-inline-start-width:0;border-block-start-width:0',
      },
    ),
  },
  {
    title: 'Text size',
    tier: 'core',
    variants: RESPONSIVE,
    rules: fromScale('text', fontSize, (token, key) => ({
      // Every size carries its default line height along;
      // `o-leading-*` stays available to override it.
      [`text-${key}`]:
        key in fontSizeLeading
          ? `font-size:${token};line-height:${v('text', `${key}--leading`)}`
          : `font-size:${token}`,
    })),
  },
  {
    title: 'Typography',
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
        // `balance` evens out the lines of a heading; `pretty` avoids orphan
        // words at the end of a paragraph.
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
        // Gradient text: to be combined with `o-bg-gradient-*` and `o-from-*`.
        'text-gradient':
          'background-clip:text;-webkit-background-clip:text;color:transparent',
      },
    ),
  },
  {
    title: 'Text shadows',
    tier: 'core',
    variants: [],
    rules: fromScale('text-shadow', textShadow, (token, key) => ({
      [`text-shadow-${key}`]: `text-shadow:${token}`,
    })),
  },
  {
    title: 'Text decoration',
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
    title: 'Highlight',
    tier: 'core',
    variants: [],
    // Translucent: a highlight must let the text it covers stay readable,
    // whatever the background it is laid on. That is also what lets it cross
    // both themes without a dedicated variant.
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
    title: 'Essential palette',
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
    title: 'Scrollbars',
    tier: 'core',
    // The theme is spelled on the class, as everywhere else: no variable
    // switches on its own any more.
    variants: ['dark'],
    /*
     * Two spellings for a single result.
     *
     * `scrollbar-width` and `scrollbar-color` are the standard property, and
     * that is the one to write. It allows neither rounding the thumb nor
     * tuning its width finely, though, and some browsers do not know it yet.
     *
     * The `::-webkit-scrollbar` pseudo-element covers those cases. The two
     * coexist without contradicting each other: a browser applies the one it
     * understands, and the standard one wins where both exist.
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
    title: 'Scrollbars — pseudo-elements',
    tier: 'core',
    variants: [],
    selectorSuffix: '::-webkit-scrollbar',
    rules: {
      scrollbar: 'width:8px;height:8px',
      'scrollbar-none': 'display:none',
    },
  },
  {
    title: 'Scrollbars — track',
    tier: 'core',
    variants: [],
    selectorSuffix: '::-webkit-scrollbar-track',
    rules: { scrollbar: 'background:var(--o-scrollbar-track)' },
  },
  {
    title: 'Scrollbars — thumb',
    tier: 'core',
    variants: [],
    selectorSuffix: '::-webkit-scrollbar-thumb',
    rules: {
      scrollbar: [
        'background:var(--o-scrollbar-thumb)',
        'border-radius:9999px',
        // A transparent border thins the thumb down without shrinking the
        // area one can grab with the pointer.
        'border:2px solid transparent',
        'background-clip:content-box',
      ].join(';'),
    },
  },
  {
    title: 'Veils',
    tier: 'core',
    /*
     * Hover is the only state that matters here: a veil serves as a clickable
     * surface over an image or a video, where no color of the palette would
     * hold — it would mask what it covers.
     */
    variants: ['hover'],
    /*
     * Translucent black and white.
     *
     * They replace what the semantic layer called an `overlay`: a modal
     * overlay, a frosted glass, a gradient dimming an image under a text. The
     * color and its alpha are in the name — nothing in it names a role, and
     * the same class serves in both themes.
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
    title: 'Gradients',
    tier: 'core',
    // The theme is written on the class from now on: a gradient stop needs
    // it as much as a background does.
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
    title: 'Borders',
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
    title: 'Radii',
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
    title: 'Shadows',
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
    // The frosted glass comes in two tints rather than a single one that
    // would follow the theme: with no semantic layer, no variable switches on
    // its own. It is up to the caller to say which one it wants, as for any
    // other color.
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
    title: 'Blur',
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
    title: 'Filters',
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
    title: 'Transforms',
    tier: 'core',
    variants: STATEFUL,
    // `translate`, `rotate` and `scale` are individual properties: a hover
    // can change the scale without undoing the rotation set by another
    // class.
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
      // Lift on hover: `hover:o-lift-sm` with `o-transition-transform`.
      'lift-sm': 'translate:0 -0.125rem',
      'lift-md': 'translate:0 -0.25rem',
      'lift-lg': 'translate:0 -0.5rem',
      'lift-none': 'translate:0 0',
      // Absolute centering: `o-absolute o-top-1/2 o-left-1/2 o-translate-center`.
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
    title: 'Positioning',
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
        // A minimum height on the spacing scale: reserving the room of a
        // content that is not there yet is a common need, and the only way
        // out was otherwise an inline style.
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
    title: 'Overflow and layers',
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
    title: 'Opacity',
    tier: 'core',
    variants: [...STATEFUL, 'disabled'],
    rules: fromScale('opacity', opacity, (token, key) => ({
      [`opacity-${key}`]: `opacity:${token}`,
    })),
  },
  {
    title: 'Blend modes',
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
    title: 'Media and ratios',
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
    // The cursor changes when a control is disabled, and the ring lands on
    // focus: both states belong to the DOM, not to the component.
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
        // Accent color of the native controls (checkboxes, radios, range).
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
    title: 'Page transitions',
    tier: 'core',
    variants: [],
    rules: {
      // `view-transition-name` must be unique in the document: a single
      // element per page can carry this class, otherwise the browser gives up
      // on the whole transition.
      'view-transition-page': 'view-transition-name:o-page',
      'view-transition-none': 'view-transition-name:none',
    },
  },
  {
    title: 'Named animations',
    tier: 'core',
    variants: [],
    rules: {
      // Continuous rotations and pulses.
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
      // Entrances.
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
      // Exits.
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
      // Attention: one shot, to punctuate an event.
      'animate-shake': `animation:o-shake 600ms ${v('ease', 'standard')} both`,
      'animate-tada': `animation:o-tada 800ms ${v('ease', 'standard')} both`,
      'animate-wobble': `animation:o-wobble 800ms ${v('ease', 'standard')} both`,
      'animate-jello': `animation:o-jello 800ms ${v('ease', 'standard')} both`,
      'animate-rubber-band': `animation:o-rubber-band 800ms ${v('ease', 'standard')} both`,
      'animate-flash': `animation:o-flash 1s ${v('ease', 'standard')} both`,
      'animate-swing': `transform-origin:top center;animation:o-swing 800ms ${v('ease', 'in-out')} both`,
      // Animated textures.
      'animate-shimmer': [
        `background-image:linear-gradient(90deg,${v('palette', 'zinc-100')} 25%,${v('palette', 'zinc-50')} 37%,${v('palette', 'zinc-100')} 63%)`,
        'background-size:400% 100%',
        `animation:o-shimmer 1.4s ${v('ease', 'linear')} infinite`,
      ].join(';'),
      'animate-gradient': `background-size:200% 200%;animation:o-gradient-x 4s ${v('ease', 'in-out')} infinite`,
      'animate-indeterminate': `animation:o-indeterminate 1.5s ${v('ease', 'in-out')} infinite`,
      'animate-none': 'animation:none',
      // Settings: delay, duration, repetition, direction, fill, state.
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
    title: 'Complete palette — text color',
    tier: 'extended',
    variants: COLOURED,
    rules: fromScale('palette', extendedPalette, (token, key) => ({
      [`text-${key}`]: `color:${token}`,
    })),
  },
  {
    title: 'Complete palette — background color',
    tier: 'extended',
    variants: COLOURED,
    rules: fromScale('palette', extendedPalette, (token, key) => ({
      [`bg-${key}`]: `background-color:${token}`,
    })),
  },
  {
    title: 'Complete palette — border color',
    tier: 'extended',
    variants: COLOURED,
    rules: fromScale('palette', extendedPalette, (token, key) => ({
      [`border-${key}`]: `border-color:${token}`,
    })),
  },
  {
    title: 'Complete palette — gradient stops',
    tier: 'extended',
    variants: ['dark'],
    rules: gradientStops('palette', extendedPalette),
  },
]

/**
 * Escapes the characters that are not valid in a CSS class selector.
 *
 * A CSS identifier cannot start with a digit: the first character of a
 * variant such as `2xl:` is escaped in unicode notation.
 */
function escapeSelector(className: string): string {
  const escaped = className.replace(/[:./]/g, '\\$&')
  return /^\d/.test(escaped) ? `\\3${escaped[0]} ${escaped.slice(1)}` : escaped
}

/** Pseudo-class matching a state variant. */
const STATE_PSEUDO: Readonly<Record<string, string>> = {
  hover: ':hover',
  focus: ':focus-visible',
  active: ':active',
  // A disabled control must be able to stand out without having to be given
  // a conditional class: it is a state of the DOM, not of the component.
  disabled: ':disabled',
}

/**
 * Wraps some rules in the context of a variant, plain or composed.
 *
 * The dark theme produces two spellings: the explicit choice of the developer
 * wins over the system preference, in both directions. A composed variant —
 * `dark:hover` — appends the pseudo-class to the selector before writing it
 * into both theme contexts.
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

/** Block of CSS variables for a set of tokens. */
function declareVars(group: string, scale: Readonly<Record<string, string>>): string[] {
  return Object.entries(scale).map(
    ([key, value]) => `  --o-${group}-${cssKey(key)}: ${value};`,
  )
}

/** Minimal preflight: the bare minimum for the tokens to apply. */
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
 * Named keyframes. They are emitted once, at the head of the stylesheet: a
 * `@keyframes` cannot be generated per family without being duplicated.
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
 * Default page transitions.
 *
 * Without these rules, the browser applies its 90 ms fade: technically
 * present, visually nil. The router does trigger the transition — what was
 * missing was its appearance.
 *
 * The root settles for a fade, never for a move. An application that names a
 * region (`o-view-transition-page`) takes that region out of the root:
 * everything else — header, navigation, footer — stays in the root group, and
 * seeing it slide when it has not changed would be a flaw. The move is
 * therefore reserved for the named region.
 */
const VIEW_TRANSITIONS = `::view-transition-old(root){animation:o-vt-out ${v('duration', 'faster')} ${v('ease', 'exit')} both}
::view-transition-new(root){animation:o-vt-in ${v('duration', 'fast')} ${v('ease', 'entrance')} both}
::view-transition-old(o-page){animation:o-vt-page-out ${v('duration', 'fast')} ${v('ease', 'exit')} both}
::view-transition-new(o-page){animation:o-vt-page-in ${v('duration', 'base')} ${v('ease', 'entrance')} both}
@media (prefers-reduced-motion:reduce){::view-transition-old(root),::view-transition-new(root),::view-transition-old(o-page),::view-transition-new(o-page){animation:none}}`

/**
 * Default values of the document in dark theme.
 *
 * ## Why this block exists
 *
 * The page background, the text color, the link color: none of that can go
 * through a class, since there is no element to dress. A semantic layer
 * settled the question on its own — the variable changed, the document
 * followed.
 *
 * Without it, these values are written twice: once in light in the preflight,
 * once here. That is the price of the raw palette, and it is paid exactly
 * once, in this one place, rather than in every component.
 *
 * The theme variables (`--o-theme-*`) take their dark values here as well: it
 * is through them that a WebGL background or a curtain, which cannot carry a
 * `dark:` class, follow the switch.
 */
function darkPreflight(): string {
  /** The theme variables, in their dark values. */
  const themeVars = Object.entries(themeDark)
    .map(([key, value]) => `--o-theme-${cssKey(key)}:${value}`)
    .join(';')

  const rules: readonly string[] = [
    `*,*::before,*::after{border-color:${v('palette', 'zinc-800')}}`,
    `body{color:${v('palette', 'zinc-50')};background-color:${v('palette', 'zinc-950')}}`,
    `:where(a){color:${v('palette', 'brand-300')}}`,
    `:where(a:hover){color:${v('palette', 'brand-200')}}`,
    `::selection{background-color:${v('palette', 'brand-900')}}`,
    `mark{background-color:oklch(82.8% 0.189 84.429 / 0.35)}`,
  ]

  /** Prefixes every rule with a theme scope. */
  const scope = (prefix: string): string =>
    rules.map((rule) => `${prefix} ${rule}`).join('\n')

  return [
    // The root declares `color-scheme: light dark`, which leaves the system
    // to decide. That is right as long as the visitor has chosen nothing —
    // but as soon as they choose the light theme, it must be said: otherwise
    // `light-dark()`, the native controls and the scrollbars keep following a
    // system set to night, and the page renders dark surfaces on a white
    // background.
    ':root[data-theme="light"]{color-scheme:light}',
    `:root[data-theme="dark"]{color-scheme:dark;${themeVars}}`,
    scope(':root[data-theme="dark"]'),
    '@media (prefers-color-scheme:dark){',
    `:root:not([data-theme="light"]){color-scheme:dark;${themeVars}}`,
    scope(':root:not([data-theme="light"])'),
    '}',
  ].join('\n')
}

/** Block of the token variables, shared by both stylesheets. */
function variableBlock(): string[] {
  return [
    '/* Token variables — light theme by default. */',
    ':root {',
    `  --o-spacing: ${spacingBase};`,
    ...declareVars('space', space),
    ...declareVars('palette', palette),
    ...declareVars('theme', theme),
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
    '/* Preflight — dark theme. */',
    darkPreflight(),
    '',
    '/* Keyframes. */',
    KEYFRAMES,
    '',
    '/* Page transitions. */',
    VIEW_TRANSITIONS,
    '',
  ]
}

/** Result of the generation. */
export interface GeneratedStyles {
  /** Complete stylesheet, without the banner. */
  css: string
  /** Every class name produced for this tier, variants included. */
  classNames: string[]
}

/**
 * Generates a stylesheet and the list of the matching class names.
 *
 * @param tier `core` for the base stylesheet, `full` to add the complete
 *   palette utilities to it.
 * @param only Produce these classes only. Absent, the whole tier.
 *
 *   This is what allows producing on demand what an application uses, rather
 *   than producing everything and then throwing nearly all of it away. The
 *   base block — variables, preflight, keyframes — is never filtered: it
 *   holds no utility class, and its absence would break everything.
 *
 * @throws {Error} If two families produce the same class name.
 *
 * @example
 * generate('full', new Set(['o-flex', 'sm:o-grid']))
 */
export function generate(
  tier: 'core' | 'full' = 'core',
  only?: ReadonlySet<string>,
  options: { readonly withoutBase?: boolean } = {},
): GeneratedStyles {
  const classNames: string[] = []
  /*
   * Produced selectors, for duplicate detection.
   *
   * It is the selector that must be unique, not the class name: one class
   * legitimately dresses several pseudo-elements — the track and the thumb of
   * a scrollbar, for instance. Comparing the names alone would reject those
   * families, even though they overlap in nothing.
   */
  const selectors: string[] = []
  // The base block is omitted only to complete a stylesheet that already
  // carries it — that is the case of the engine, which adds the utilities to
  // a bundle where the variables and the preflight arrived through the import
  // of the application. Omitting it elsewhere would produce a stylesheet
  // whose every rule references variables that do not exist: everything would
  // be there, and nothing would paint.
  const sections: string[] = options.withoutBase === true ? [] : [...variableBlock()]

  for (const family of FAMILIES) {
    if (tier === 'core' && family.tier === 'extended') continue

    const suffix = family.selectorSuffix ?? ''

    // `selectors` and `classNames` receive **everything**, filtered or not:
    // the duplicate check bears on the integrity of the token system, not on
    // the content of this particular generation. Filtering it would let a
    // real duplicate through simply because today's application does not use
    // the two conflicting classes.
    const keep = (name: string): boolean => only === undefined || only.has(name)

    const rules: string[] = []

    for (const [ruleSuffix, body] of Object.entries(family.rules)) {
      const className = `o-${ruleSuffix}`
      classNames.push(className)
      selectors.push(`${className}${suffix}`)
      if (keep(className)) {
        rules.push(`.${escapeSelector(className)}${suffix}{${body}}`)
      }
    }

    const blocks: string[] = []

    for (const variant of family.variants) {
      const lines: string[] = []
      for (const [ruleSuffix, body] of Object.entries(family.rules)) {
        const className = `${variant}:o-${ruleSuffix}`
        classNames.push(className)
        selectors.push(`${className}${suffix}`)
        if (keep(className)) {
          lines.push(wrapVariant(variant, `.${escapeSelector(className)}${suffix}`, body))
        }
      }
      // A variant of which nothing survives writes neither title nor rule:
      // otherwise a stylesheet produced on demand would be a string of empty
      // comments.
      if (lines.length > 0) {
        blocks.push(`/* ${family.title} — variant ${variant}. */`, ...lines)
      }
    }

    if (rules.length > 0 || blocks.length > 0) {
      sections.push(`/* ${family.title}. */`, ...rules, ...blocks, '')
    }
  }

  const duplicates = selectors.filter(
    (selector, index) => selectors.indexOf(selector) !== index,
  )
  if (duplicates.length > 0) {
    throw new Error(`[build-css] Duplicate selectors: ${duplicates.join(', ')}`)
  }

  return { css: sections.join('\n'), classNames: [...new Set(classNames)] }
}

/** Banner stamped at the head of the generated files. */
export const BANNER = `/* Generated by scripts/build-css.ts from src/styles/tokens.ts.
   Do not edit by hand: every change will be overwritten. */`

/**
 * Renders the base alone: variables, preflight, keyframes, transitions.
 *
 * This is what the package ships from now on. The utilities are not in it:
 * they are produced at build time, for the sole classes actually used.
 *
 * This base is not optional and does not get pruned. Every generated utility
 * references its variables; without them, every rule would be there and none
 * would paint — a failure far worse than a missing class, because it is total
 * and silent.
 */
export function renderBase(): string {
  return `${BANNER}\n${variableBlock().join('\n')}`
}

/** Renders the complete content of a stylesheet. */
export function renderCss(tier: 'core' | 'full'): string {
  return `${BANNER}\n${generate(tier).css}`
}

/**
 * Renders a stylesheet trimmed to the classes actually used.
 *
 * ## What this replaces
 *
 * Producing everything and then throwing ninety-six percent of it away.
 * Pruning was the right answer as long as the stylesheet arrived
 * pre-generated; here there is nothing left to prune, since nothing useless
 * is produced.
 *
 * ## The complete tier, for free
 *
 * The generation bears on `full`, and not on `core`. That was unthinkable
 * with a pre-generated stylesheet — imposing the 290 shades on every project
 * would make everyone pay for what only a few need. On demand, the question
 * no longer arises: a project that names `o-text-violet-500` gets it, and a
 * project that does not name it does not pay for it.
 *
 * @param classes The classes spotted in the shipped code.
 *
 * @example
 * renderCssFor(new Set(['o-flex', 'o-text-violet-500']))
 */
export function renderCssFor(classes: ReadonlySet<string>): string {
  return `${BANNER}\n${generate('full', classes).css}`
}

/**
 * Renders the requested utilities alone, without the base block.
 *
 * To complete a stylesheet that already carries the variables and the
 * preflight: the engine adds them to the produced CSS bundle, where they
 * arrived through the import of the application.
 *
 * @example
 * renderUtilitiesFor(new Set(['o-flex']))
 */
export function renderUtilitiesFor(classes: ReadonlySet<string>): string {
  return generate('full', classes, { withoutBase: true }).css
}

/** Renders the complete content of `src/styles/generated/classNames.ts`. */
export function renderClassNamesModule(): string {
  const core = generate('core').classNames
  const full = generate('full').classNames
  const coreSet = new Set(core)
  const extended = full.filter((name) => !coreSet.has(name))

  const list = (names: readonly string[]): string =>
    names.map((name) => `  '${name}',`).join('\n')

  return `${BANNER}

/** Classes present in \`@odoro-cli/libs/styles.css\`. */
export const ODORO_CORE_CLASS_NAMES = [
${list(core)}
] as const

/**
 * Extra classes present only in
 * \`@odoro-cli/libs/styles.full.css\`: color utilities over the raw palette.
 */
export const ODORO_EXTENDED_CLASS_NAMES = [
${list(extended)}
] as const

/** Union of the classes of the base stylesheet. */
export type OdoroCoreClassName = (typeof ODORO_CORE_CLASS_NAMES)[number]

/**
 * Union of every valid utility class.
 *
 * It covers **only** the shipped stylesheet. The classes of the complete
 * stylesheet are deliberately absent from it: that one is no longer
 * published, and a type autocompleting classes without a rule would offer
 * emptiness — the worst of both worlds, since the editor would lend its
 * credit to a class that paints nothing.
 */
export type OdoroClassName = OdoroCoreClassName

/**
 * Every utility class, all tiers taken together.
 *
 * \`readonly string[]\` and not \`readonly OdoroClassName[]\`: the array also holds
 * the classes of the complete tier, which are no longer in the published type
 * now that this stylesheet is no longer shipped. The annotation avoids, along
 * the way, materializing a tuple of several tens of thousands of elements,
 * which TypeScript refuses to represent.
 *
 * Internal: serves only the generator and the test suite.
 */
export const ODORO_CLASS_NAMES: readonly string[] = [
  ...ODORO_CORE_CLASS_NAMES,
  ...ODORO_EXTENDED_CLASS_NAMES,
]
`
}
