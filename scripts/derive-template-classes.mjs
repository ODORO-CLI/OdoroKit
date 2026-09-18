#!/usr/bin/env node
/**
 * Derives the class table and the stylesheet of a ported template.
 *
 * ## Why a deriver, and not a table written by hand
 *
 * The first templates were done by hand: eighty names, then a hundred and
 * twenty. The next one has two hundred and one, and seventy of them are
 * absolute positions from a design file — `lg:left-113.75`, `lg:top-341.5`,
 * `lg:w-417.25` — at a quarter of a rem's precision. Writing those out is not
 * judgement, it is arithmetic, and a hand doing arithmetic two hundred times
 * gets one of them wrong without anybody ever noticing which.
 *
 * So the regular part is derived, and what is left is named. The output is
 * **a proposal**: the table and the rules are printed, read, and then kept.
 * Nothing is written to the template by this script.
 *
 * ## What it can read
 *
 * The template's own `@theme` block is a machine-readable mapping — it says
 * that `bg-surface-glass` means `var(--surface-glass)` and that `rounded-card`
 * means `var(--corner-card)`. The breakpoints are in there too, and they are
 * not always the usual ones: one template redefines `lg:` as 1280 px, so a
 * rule written against our own 1024 would apply two hundred and fifty-six
 * pixels too early.
 *
 * The spacing scale is the other engine's: a number means that many quarters
 * of a rem, decimals included.
 *
 * ## What it refuses to guess
 *
 * Anything it cannot derive is listed at the end, untouched. That list is the
 * work that actually needs a person.
 *
 * Usage:
 *
 *     node scripts/derive-template-classes.mjs templates/socle <prefixe>
 *
 * @module
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const [target, prefix = 'xx'] = process.argv.slice(2)
if (target === undefined) {
  console.error('Usage: node scripts/derive-template-classes.mjs <dossier> <prefixe>')
  process.exit(1)
}

const folder = resolve(ROOT, target)

/* ============================ Le thème du gabarit ======================== */

/** The stylesheet of the template, wherever it sits. */
function findStylesheet() {
  for (const candidate of ['src/styles.css', 'src/index.css', 'src/app/globals.css']) {
    try {
      return readFileSync(join(folder, candidate), 'utf8')
    } catch {
      continue
    }
  }
  throw new Error('Aucune feuille trouvee dans le gabarit.')
}

const css = findStylesheet()

/** The `@theme` bindings: `--color-foo` to the variable it points at. */
const THEME = new Map()
{
  // `@theme` est aussi cite dans un commentaire, plus haut : viser la premiere
  // occurrence du mot faisait compter les accolades a partir du `:root` qui
  // suivait, et le thème lu etait l etage des roles au lieu des liaisons.
  const ouverture = /@theme(?:\s+inline)?\s*\{/.exec(css)
  const start = ouverture === null ? -1 : ouverture.index
  if (start >= 0) {
    const open = start + ouverture[0].length - 1
    let depth = 1
    let index = open + 1
    while (depth > 0 && index < css.length) {
      if (css[index] === '{') depth += 1
      else if (css[index] === '}') depth -= 1
      index += 1
    }
    for (const match of css
      .slice(open + 1, index - 1)
      .matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      THEME.set(match[1], match[2].trim())
    }
  }
}

/** The breakpoints the template declares, in pixels. */
const BREAKPOINTS = new Map([
  ['sm', 640],
  ['md', 768],
  ['lg', 1024],
  ['xl', 1280],
  ['2xl', 1536],
])
for (const [key, value] of THEME) {
  const name = /^--breakpoint-(.+)$/.exec(key)
  if (name === null) continue
  const rem = /^([\d.]+)rem$/.exec(value)
  const px = /^([\d.]+)px$/.exec(value)
  if (rem !== null) BREAKPOINTS.set(name[1], Number(rem[1]) * 16)
  else if (px !== null) BREAKPOINTS.set(name[1], Number(px[1]))
}

/**
 * Les variantes que le gabarit declare par `@custom-variant`.
 *
 * `@custom-variant max-h-717 (@media (max-height: 717px))` n a pas d equivalent
 * chez nous : c est une regle que ce gabarit s est donnee, et elle voyage avec
 * lui.
 */
const VARIANTES = new Map()
for (const match of css.matchAll(
  /@custom-variant\s+([\w-]+)\s*\(([^)]*\([^)]*\)[^)]*|[^)]*)\)\s*;/g,
)) {
  const corps = match[2].trim()
  const media = /@media\s*(.+)$/.exec(corps)
  if (media !== null) VARIANTES.set(match[1], media[1].trim())
}

/* ============================ Les motifs ================================= */

/** Properties a numeric spacing utility sets. */
const SPACING = {
  p: ['padding'],
  pt: ['padding-top'],
  pb: ['padding-bottom'],
  pl: ['padding-left'],
  pr: ['padding-right'],
  px: ['padding-inline'],
  py: ['padding-block'],
  m: ['margin'],
  mt: ['margin-top'],
  mb: ['margin-bottom'],
  ml: ['margin-left'],
  mr: ['margin-right'],
  mx: ['margin-inline'],
  my: ['margin-block'],
  gap: ['gap'],
  'gap-x': ['column-gap'],
  'gap-y': ['row-gap'],
  w: ['width'],
  h: ['height'],
  size: ['width', 'height'],
  'min-w': ['min-width'],
  'min-h': ['min-height'],
  'max-w': ['max-width'],
  'max-h': ['max-height'],
  top: ['top'],
  bottom: ['bottom'],
  left: ['left'],
  right: ['right'],
  'inset-x': ['left', 'right'],
  'inset-y': ['top', 'bottom'],
  inset: ['inset'],
}

/** Which property a token family drives. */
const TOKEN_FAMILY = [
  ['bg', '--color-', 'background-color'],
  ['text', '--color-', 'color'],
  ['text', '--text-', 'font-size'],
  ['border', '--color-', 'border-color'],
  ['rounded', '--radius-', 'border-radius'],
  ['leading', '--leading-', 'line-height'],
  ['font', '--font-', 'font-family'],
  ['backdrop-blur', '--blur-', null],
  ['duration', '--duration-', 'transition-duration'],
  ['ease', '--ease-', 'transition-timing-function'],
]

/**
 * L echelle typographique par defaut de l autre moteur.
 *
 * Un gabarit qui ne redefinit pas `--text-sm` emploie quand meme `text-sm`, et
 * la valeur vient alors de l echelle livree. La voici, telle quelle : sans
 * elle, `max-hero-md:text-sm` n avait aucune declaration a produire.
 */
const ECHELLE = {
  xs: ['0.75rem', '1rem'],
  sm: ['0.875rem', '1.25rem'],
  base: ['1rem', '1.5rem'],
  lg: ['1.125rem', '1.75rem'],
  xl: ['1.25rem', '1.75rem'],
  '2xl': ['1.5rem', '2rem'],
  '3xl': ['1.875rem', '2.25rem'],
  '4xl': ['2.25rem', '2.5rem'],
  '5xl': ['3rem', '1'],
  '6xl': ['3.75rem', '1'],
  '7xl': ['4.5rem', '1'],
  '8xl': ['6rem', '1'],
  '9xl': ['8rem', '1'],
}

/** A quarter of a rem per step, as the other engine counts. */
function spacingValue(raw) {
  if (raw === 'px') return '1px'
  if (raw === 'full') return '100%'
  if (raw === 'auto') return 'auto'
  if (/^\d+\/\d+$/.test(raw)) {
    const [a, b] = raw.split('/').map(Number)
    return `${String(Math.round((a / b) * 1000000) / 10000)}%`
  }
  if (!/^\d+(\.\d+)?$/.test(raw)) return null
  const rem = Number(raw) / 4
  return `${String(Number(rem.toFixed(6)))}rem`
}

/**
 * Les utilitaires sans valeur, dont seule la variante change quelque chose.
 *
 * `tablet:flex-row` n existe pas chez nous parce que `tablet:` n existe pas :
 * c est une rupture que le gabarit s est donnee. La declaration, elle, est la
 * meme dans les deux mondes.
 */
const SIMPLES = {
  'flex-row': ['flex-direction: row'],
  'flex-col': ['flex-direction: column'],
  'items-center': ['align-items: center'],
  'items-start': ['align-items: flex-start'],
  'items-end': ['align-items: flex-end'],
  'justify-center': ['justify-content: center'],
  'justify-start': ['justify-content: flex-start'],
  'justify-end': ['justify-content: flex-end'],
  'justify-between': ['justify-content: space-between'],
  'grid-cols-2': ['grid-template-columns: repeat(2, minmax(0, 1fr))'],
  'grid-cols-3': ['grid-template-columns: repeat(3, minmax(0, 1fr))'],
  'grid-cols-4': ['grid-template-columns: repeat(4, minmax(0, 1fr))'],
  'aspect-auto': ['aspect-ratio: auto'],
  antialiased: [
    '-webkit-font-smoothing: antialiased',
    '-moz-osx-font-smoothing: grayscale',
  ],
  'bg-clip-text': ['background-clip: text', '-webkit-background-clip: text'],
  'overflow-x-clip': ['overflow-x: clip'],
  'leading-none': ['line-height: 1'],
  fixed: ['position: fixed'],
  'cursor-grabbing': ['cursor: grabbing'],
  'outline-2': ['outline-width: 2px', 'outline-style: solid'],
  'outline-offset-2': ['outline-offset: 2px'],
  shadow: ['box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'],
  'h-lvh': ['height: 100lvh'],
  'h-svh': ['height: 100svh'],
  'h-dvh': ['height: 100dvh'],
  'backface-hidden': ['backface-visibility: hidden'],
  'transform-gpu': ['transform: translateZ(0)'],
  'w-lvw': ['width: 100lvw'],
  'w-dvw': ['width: 100dvw'],
  'ring-1': [
    '--tw-ring: 1px',
    'box-shadow: 0 0 0 1px var(--xx-ring-color, currentColor)',
  ],
  rounded: ['border-radius: 0.25rem'],
  inline: ['display: inline'],
  'max-h-none': ['max-height: none'],
  'min-h-screen': ['min-height: 100vh'],
  'overflow-visible': ['overflow: visible'],
  'col-start-auto': ['grid-column-start: auto'],
  'row-start-auto': ['grid-row-start: auto'],
  'text-left': ['text-align: left'],
  'text-center': ['text-align: center'],
  'text-right': ['text-align: right'],
  'border-t-0': ['border-top-width: 0'],
  absolute: ['position: absolute'],
  relative: ['position: relative'],
  static: ['position: static'],
  sticky: ['position: sticky'],
  block: ['display: block'],
  flex: ['display: flex'],
  grid: ['display: grid'],
  contents: ['display: contents'],
  hidden: ['display: none'],
  'inline-block': ['display: inline-block'],
  'max-w-none': ['max-width: none'],
  'whitespace-nowrap': ['white-space: nowrap'],
  'bottom-auto': ['bottom: auto'],
  'top-auto': ['top: auto'],
  'left-auto': ['left: auto'],
  'right-auto': ['right: auto'],
  'inset-x-auto': ['left: auto', 'right: auto'],
  'grid-rows-3': ['grid-template-rows: repeat(3, minmax(0, 1fr))'],
  'grid-rows-2': ['grid-template-rows: repeat(2, minmax(0, 1fr))'],
  'grid-cols-1': ['grid-template-columns: repeat(1, minmax(0, 1fr))'],
  'mt-0': ['margin-top: 0'],
  'auto-rows-auto': ['grid-auto-rows: auto'],
}

/** The declarations a bare class name produces, or `null`. */
function declarationsFor(name) {
  const negative = name.startsWith('-')
  // Le `!` de tete forcait la priorite dans l autre moteur ; ici la
  // specificite doublee du selecteur fait le meme travail.
  const bare = (negative ? name.slice(1) : name).replace(/^!/, '')

  const profondeur = /^z-(\d+)$/.exec(bare)
  if (profondeur !== null) return [`z-index: ${negative ? '-' : ''}${profondeur[1]}`]

  // Une valeur arbitraire : ce qui est entre crochets est litteral.
  // La capture refuse un `]` en son sein : gloutonne, elle avalait la paire
  // `text-[0.75rem]/[1.5]` en une seule valeur et produisait
  // `font-size: 0.75rem]/[1.5` — une declaration malformee qui, en CSS,
  // n invalide pas seulement sa regle mais tronque tout ce qui la suit.
  const arbitrary = /^([a-z-]+)-\[([^\]]+)\]$/.exec(bare)
  if (arbitrary !== null) {
    const [, root, value] = arbitrary
    const literal = value.replace(/_/g, ' ').replace(/^image:/, '')
    const props = SPACING[root]
    if (props !== undefined)
      return props.map((p) => `${p}: ${negative ? '-' : ''}${literal}`)
    if (root === 'aspect') return [`aspect-ratio: ${literal.replace('/', ' / ')}`]
    if (root === 'text') return [`font-size: ${literal}`]
    if (root === 'leading') return [`line-height: ${literal}`]
    if (root === 'tracking') return [`letter-spacing: ${literal}`]
    if (root === 'z') return [`z-index: ${literal}`]
    if (root === 'rounded') return [`border-radius: ${literal}`]
    if (root === 'duration') return [`transition-duration: ${literal}`]
    if (root === 'ease') return [`transition-timing-function: ${literal}`]
    if (root === 'bg') return [`background-image: ${literal}`]
    if (root === 'shadow') return [`box-shadow: ${literal}`]
    if (root === 'scale') return [`scale: ${literal}`]
    if (root === 'translate-x')
      return [`--${prefix}-tx: ${negative ? '-' : ''}${literal}`, 'TRANSLATE']
    if (root === 'translate-y')
      return [`--${prefix}-ty: ${negative ? '-' : ''}${literal}`, 'TRANSLATE']
    if (root === 'grid-cols') {
      return [`grid-template-columns: ${literal.replace(/,(?=\S)/g, ', ')}`]
    }
    if (root === 'grid-rows') return [`grid-template-rows: ${literal}`]
    // Pas de reponse ici : la suite en a peut-etre une. Couper court a
    // empeche `backdrop-blur-[30px]` d atteindre son propre motif.
  }

  // Un utilitaire sans valeur.
  if (SIMPLES[bare] !== undefined) return SIMPLES[bare]

  // Les transformations chiffrees.
  const rotate = /^rotate-(\d+)$/.exec(bare)
  if (rotate !== null) return [`rotate: ${negative ? '-' : ''}${rotate[1]}deg`]
  const skew = /^skew-([xy])-(\d+)$/.exec(bare)
  if (skew !== null) {
    return [
      `transform: skew${skew[1].toUpperCase()}(${negative ? '-' : ''}${skew[2]}deg)`,
    ]
  }
  const scale = /^scale-(\d+)$/.exec(bare)
  if (scale !== null) return [`scale: ${String(Number(scale[1]) / 100)}`]
  const move = /^translate-([xy])-(.+)$/.exec(bare)
  if (move !== null) {
    const valeur = spacingValue(move[2])
    if (valeur !== null) {
      return [`--${prefix}-t${move[1]}: ${negative ? '-' : ''}${valeur}`, 'TRANSLATE']
    }
  }

  // Le contour se compte en pixels, pas en quarts de rem.
  const decalage = /^outline-offset-(\d+)$/.exec(bare)
  if (decalage !== null) return [`outline-offset: ${negative ? '-' : ''}${decalage[1]}px`]
  const epaisseur = /^outline-(\d+)$/.exec(bare)
  if (epaisseur !== null) {
    return [`outline-width: ${epaisseur[1]}px`, 'outline-style: solid']
  }

  // Une couleur de contour, qui n est pas une couleur de fond.
  const outline = /^outline-([\w-]+)$/.exec(bare)
  if (outline !== null && THEME.has(`--color-${outline[1]}`)) {
    return [`outline-color: ${THEME.get(`--color-${outline[1]}`)}`]
  }

  // Une opacite posee sur une couleur.
  const alpha = /^(bg|text|border)-([\w-]+)\/(\d+)$/.exec(bare)
  if (alpha !== null) {
    const [, root, token, part] = alpha
    const prop =
      root === 'bg' ? 'background-color' : root === 'text' ? 'color' : 'border-color'
    const base =
      token === 'white' || token === 'black'
        ? token === 'white'
          ? '#fff'
          : '#000'
        : THEME.has(`--color-${token}`)
          ? THEME.get(`--color-${token}`)
          : null
    if (base === null) return null
    return [`${prop}: color-mix(in srgb, ${base} ${part}%, transparent)`]
  }

  // Le flou et la saturation d arriere-plan, ecrits en valeur.
  const filtre = /^backdrop-(blur|saturate|brightness)-\[(.+)\]$/.exec(bare)
  if (filtre !== null) {
    const fn =
      filtre[1] === 'blur' ? 'blur' : filtre[1] === 'saturate' ? 'saturate' : 'brightness'
    return [
      `backdrop-filter: ${fn}(${filtre[2]})`,
      `-webkit-backdrop-filter: ${fn}(${filtre[2]})`,
    ]
  }
  const flou = /^blur-\[(.+)\]$/.exec(bare)
  if (flou !== null) return [`filter: blur(${flou[1]})`]
  const teinte = /^accent-\[(.+)\]$/.exec(bare)
  if (teinte !== null) return [`accent-color: ${teinte[1]}`]

  // `text-base/[1.7]` ou `text-[0.6875rem]/none` : une taille et son interligne.
  const paire = /^text-(\[[^\]]+\]|[\w.-]+)\/(\[[^\]]+\]|[\w.-]+)$/.exec(bare)
  if (paire !== null) {
    const taille = paire[1].startsWith('[')
      ? paire[1].slice(1, -1)
      : (THEME.get(`--text-${paire[1]}`) ?? ECHELLE[paire[1]]?.[0])
    const inter =
      paire[2] === 'none'
        ? '1'
        : paire[2].startsWith('[')
          ? paire[2].slice(1, -1)
          : THEME.get(`--leading-${paire[2]}`)
    if (taille !== undefined && inter !== undefined) {
      return [`font-size: ${taille}`, `line-height: ${inter}`]
    }
  }

  // Une couleur arbitraire, avec ou sans opacite.
  const brute = /^(bg|text|border|ring)-\[([^\]]+)\](?:\/(\d+|\[[\d.]+\]))?$/.exec(bare)
  if (brute !== null) {
    const [, root, couleur, part] = brute
    const prop =
      root === 'bg' ? 'background-color' : root === 'text' ? 'color' : 'border-color'
    const valeur = couleur.replace(/^color:/, '')
    if (part === undefined) return [`${prop}: ${valeur}`]
    const pourcent = part.startsWith('[') ? String(Number(part.slice(1, -1)) * 100) : part
    return [`${prop}: color-mix(in srgb, ${valeur} ${pourcent}%, transparent)`]
  }

  // Une opacite ecrite entre crochets sur un jeton : `bg-foreground/[0.06]`.
  const fraction = /^(bg|text|border)-([\w-]+)\/\[([\d.]+)\]$/.exec(bare)
  if (fraction !== null) {
    const [, root, jeton, part] = fraction
    const prop =
      root === 'bg' ? 'background-color' : root === 'text' ? 'color' : 'border-color'
    const base = THEME.get(`--color-${jeton}`)
    if (base !== undefined) {
      return [
        `${prop}: color-mix(in srgb, ${base} ${String(Number(part) * 100)}%, transparent)`,
      ]
    }
  }

  // Une ombre nommee par le theme.
  const ombre = /^shadow-([\w-]+)$/.exec(bare)
  if (ombre !== null && THEME.has(`--shadow-${ombre[1]}`)) {
    return [`box-shadow: ${THEME.get(`--shadow-${ombre[1]}`)}`]
  }

  // Un jeton du thème.
  for (const [root, namespace, prop] of TOKEN_FAMILY) {
    if (!bare.startsWith(`${root}-`)) continue
    const token = bare.slice(root.length + 1)
    const key = `${namespace}${token}`
    if (!THEME.has(key)) continue
    const value = THEME.get(key)
    if (prop === null)
      return [
        `backdrop-filter: blur(${value})`,
        `-webkit-backdrop-filter: blur(${value})`,
      ]
    return [`${prop}: ${value}`]
  }

  // Une taille de l echelle livree, que le theme ne redefinit pas.
  const nommee = /^text-([\w-]+)$/.exec(bare)
  if (nommee !== null && ECHELLE[nommee[1]] !== undefined) {
    const [taille, inter] = ECHELLE[nommee[1]]
    return [`font-size: ${taille}`, `line-height: ${inter}`]
  }

  // Une mesure de l'echelle.
  for (const [root, props] of Object.entries(SPACING).sort(
    (a, b) => b[0].length - a[0].length,
  )) {
    if (!bare.startsWith(`${root}-`)) continue
    const value = spacingValue(bare.slice(root.length + 1))
    if (value === null) continue
    return props.map((p) => `${p}: ${negative ? '-' : ''}${value}`)
  }

  return null
}

/* ============================ La sortie ================================== */

const noms = process.argv.slice(4)
const entree =
  noms.length > 0 ? noms : readFileSync(0, 'utf8').split(/\s+/).filter(Boolean)

const table = []
const regles = new Map()
const rendus = []

/** A safe class name for a template rule. */
function nomDeRegle(original) {
  return (
    `${prefix}-` +
    original
      .replace(/[[\]().,%/#]/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-')
      .replace(/:/g, '-')
      .toLowerCase()
  )
}

for (const original of entree) {
  // Le `:` qui separe la variante est celui qui se trouve **hors** des
  // crochets : `bg-[image:var(--x)]` en porte un a l interieur, et couper
  // dessus donnait une variante `bg-[image` et une classe tronquee.
  let cut = -1
  let profondeur = 0
  for (let i = 0; i < original.length; i += 1) {
    if (original[i] === '[') profondeur += 1
    else if (original[i] === ']') profondeur -= 1
    else if (original[i] === ':' && profondeur === 0) cut = i
  }
  const variant = cut < 0 ? '' : original.slice(0, cut)
  const bare = cut < 0 ? original : original.slice(cut + 1)

  const decls = declarationsFor(bare)
  if (decls === null) {
    rendus.push(original)
    continue
  }

  const nom = nomDeRegle(original)
  table.push(`  ${JSON.stringify(original)}: ${JSON.stringify(nom)},`)

  const corps = decls.filter((d) => d !== 'TRANSLATE')
  const translate = decls.includes('TRANSLATE')
  const declaration = translate
    ? `${corps.join('; ')}; translate: var(--${prefix}-tx, 0) var(--${prefix}-ty, 0)`
    : corps.join('; ')

  let selecteur = `.${nom}.${nom}`
  if (variant === 'hover' || variant === 'focus' || variant === 'active') {
    selecteur += `:${variant}`
  } else if (variant === 'focus-visible') selecteur += ':focus-visible'
  else if (variant === 'placeholder') selecteur += '::placeholder'
  else if (variant === 'group-hover') selecteur = `.group:hover .${nom}`

  if (variant === 'first') selecteur += ':first-child'
  if (variant === 'last') selecteur += ':last-child'

  /*
   * La requete de media : soit une rupture connue, soit une rupture `max-*`,
   * soit une variante que le gabarit s est declaree.
   */
  let requete = null
  if (BREAKPOINTS.has(variant)) {
    requete = `(min-width: ${String(BREAKPOINTS.get(variant))}px)`
  } else if (variant.startsWith('max-') && BREAKPOINTS.has(variant.slice(4))) {
    // Tailwind coupe juste en dessous de la rupture, pas dessus.
    requete = `(max-width: ${String(BREAKPOINTS.get(variant.slice(4)) - 0.02)}px)`
  } else if (VARIANTES.has(variant)) {
    requete = VARIANTES.get(variant)
  }

  const cle = requete === null ? '' : requete
  const liste = regles.get(cle) ?? []
  liste.push(`${selecteur} { ${declaration}; }`)
  regles.set(cle, liste)
}

console.log('/* ---- table ---- */')
console.log(table.join('\n'))
console.log('\n/* ---- feuille ---- */')
for (const [requete, liste] of regles) {
  if (requete === '') {
    console.log(liste.join('\n'))
  } else {
    console.log(`\n@media ${requete} {`)
    console.log(liste.map((r) => `  ${r}`).join('\n'))
    console.log('}')
  }
}

console.error(`\n/* ---- ${String(rendus.length)} nom(s) a nommer a la main ---- */`)
console.error(rendus.join(' '))
