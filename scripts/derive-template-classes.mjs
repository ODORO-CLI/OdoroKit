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
/**
 * Les variantes que l autre moteur livre d office et dont nous n avons pas
 * l equivalent. Elles ne dependent d aucun gabarit : ce sont des requetes de
 * media fixes.
 */
const VARIANTES_LIVREES = new Map([
  ['motion-reduce', '(prefers-reduced-motion: reduce)'],
  ['motion-safe', '(prefers-reduced-motion: no-preference)'],
  ['pointer-coarse', '(pointer: coarse)'],
  ['pointer-fine', '(pointer: fine)'],
  ['any-pointer-coarse', '(any-pointer: coarse)'],
  ['any-pointer-fine', '(any-pointer: fine)'],
  ['portrait', '(orientation: portrait)'],
  ['landscape', '(orientation: landscape)'],
  ['print', 'print'],
  ['forced-colors', '(forced-colors: active)'],
  ['dark', '(prefers-color-scheme: dark)'],
  ['contrast-more', '(prefers-contrast: more)'],
  ['contrast-less', '(prefers-contrast: less)'],
  ['supports-hover', '(hover: hover)'],
])

const VARIANTES = new Map()
/*
 * La parenthese se compte, elle ne se decrit pas.
 *
 * L expression reguliere d avant admettait un seul niveau imbrique. Elle lisait
 * `@custom-variant max-h-717 (@media (max-height: 717px));` sans peine, et
 * echouait en silence sur
 *
 *     @custom-variant lg (@media (min-width: 1024px) and (min-aspect-ratio: 1/1));
 *
 * qui en a deux cote a cote. Un echec ici ne se voit pas : la variante tombe
 * simplement dans la branche suivante, celle des ruptures, et `lg:` reprend la
 * largeur seule — la condition de format disparait sans que rien ne le dise.
 */
for (const debut of [...css.matchAll(/@custom-variant\s+([\w-]+)\s*\(/g)]) {
  let i = debut.index + debut[0].length
  let profondeur = 1
  while (profondeur > 0 && i < css.length) {
    if (css[i] === '(') profondeur += 1
    else if (css[i] === ')') profondeur -= 1
    i += 1
  }
  if (profondeur !== 0) continue
  const corps = css.slice(debut.index + debut[0].length, i - 1).trim()
  const media = /^@media\s*(.+)$/s.exec(corps)
  if (media !== null) VARIANTES.set(debut[1], media[1].trim())
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
  ['tracking', '--tracking-', 'letter-spacing'],
  ['shadow', '--shadow-', 'box-shadow'],
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
  'self-auto': ['align-self: auto'],
  'object-contain': ['object-fit: contain'],
  'cursor-wait': ['cursor: wait'],
  'cursor-not-allowed': ['cursor: not-allowed'],
  'opacity-70': ['opacity: 0.7'],
  'opacity-90': ['opacity: 0.9'],
  'opacity-50': ['opacity: 0.5'],
  'w-fit': ['width: fit-content'],
  'h-fit': ['height: fit-content'],
  'w-min': ['width: min-content'],
  'w-max': ['width: max-content'],
  'items-stretch': ['align-items: stretch'],
  'items-start': ['align-items: flex-start'],
  'items-end': ['align-items: flex-end'],
  'items-center': ['align-items: center'],
  'items-baseline': ['align-items: baseline'],
  'transform-3d': ['transform-style: preserve-3d'],
  'order-first': ['order: -9999'],
  'order-last': ['order: 9999'],
  'order-none': ['order: 0'],
  'transform-flat': ['transform-style: flat'],
  'max-w-none': ['max-width: none'],
  'max-h-none': ['max-height: none'],
  'min-w-0': ['min-width: 0'],
  'min-h-0': ['min-height: 0'],
  'w-auto': ['width: auto'],
  'h-auto': ['height: auto'],
  'w-full': ['width: 100%'],
  'h-full': ['height: 100%'],
  'max-w-full': ['max-width: 100%'],
  'max-h-full': ['max-height: 100%'],
  outline: ['outline-style: solid'],
  'outline-hidden': ['outline: 2px solid transparent', 'outline-offset: 2px'],
  'flex-1': ['flex: 1 1 0%'],
  'flex-auto': ['flex: 1 1 auto'],
  'flex-initial': ['flex: 0 1 auto'],
  'flex-none': ['flex: none'],
  'flex-wrap': ['flex-wrap: wrap'],
  'flex-nowrap': ['flex-wrap: nowrap'],
  'flex-wrap-reverse': ['flex-wrap: wrap-reverse'],
  'border-l': ['border-left-width: 1px'],
  'border-r': ['border-right-width: 1px'],
  'cursor-grab': ['cursor: grab'],
  'cursor-grabbing': ['cursor: grabbing'],
  'cursor-pointer': ['cursor: pointer'],
  'cursor-default': ['cursor: default'],
  'object-cover': ['object-fit: cover'],
  'object-fill': ['object-fit: fill'],
  'object-none': ['object-fit: none'],
  'min-h-lvh': ['min-height: 100lvh'],
  'min-h-dvh': ['min-height: 100dvh'],
  'min-h-svh': ['min-height: 100svh'],
  'min-h-screen': ['min-height: 100vh'],
  'h-lvh': ['height: 100lvh'],
  'h-dvh': ['height: 100dvh'],
  'h-svh': ['height: 100svh'],
  'h-screen': ['height: 100vh'],
  'transition-none': ['transition-property: none'],
  'self-start': ['align-self: flex-start'],
  'self-end': ['align-self: flex-end'],
  'self-center': ['align-self: center'],
  'outline-none': ['outline: 2px solid transparent', 'outline-offset: 2px'],
  'opacity-0': ['opacity: 0'],
  'opacity-100': ['opacity: 1'],
  'pointer-events-auto': ['pointer-events: auto'],
  'pointer-events-none': ['pointer-events: none'],
  'border-b': ['border-bottom-width: 1px'],
  'border-t': ['border-top-width: 1px'],
  '-scale-y-100': ['scale: 1 -1'],
  '-scale-x-100': ['scale: -1 1'],
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

/**
 * Rend a `calc()` les espaces que la grammaire exige.
 *
 * `calc(100svh-5rem)` n est pas du CSS valide : sans espaces autour du `-`, la
 * declaration entiere est jetee. L autre moteur les inserait pour l auteur, ce
 * qui explique que la source ne les porte pas. Chez nous, le hero de `parfum`
 * y perdait 263 px de hauteur minimale, et rien ne le disait.
 *
 * `*` et `/` n en ont pas besoin, et un `-` deja precede d un espace non plus.
 * Le `e` d une notation scientifique est mis a part : `1e-5` n est pas une
 * soustraction.
 */
const FONCTIONS_MATH = /(calc|min|max|clamp|round|mod|rem)\(/

function espacerCalc(valeur) {
  /*
   * `min()`, `max()` et `clamp()` ont la meme grammaire que `calc()` : l espace
   * autour d un `+` ou d un `-` y est obligatoire. Ne regarder que `calc(`
   * laissait passer `min(100vw-3rem,78vw,…)`, ou la premiere borne est
   * invalide — et une borne invalide invalide la fonction, donc la
   * declaration. La carte du hero de `joaillier` prenait 336 px au lieu de 210.
   */
  
  if (!FONCTIONS_MATH.test(valeur)) return valeur

  /*
   * Le nom d une variable n est pas une soustraction.
   *
   * `max(var(--raw-text-size-112), 12px)` porte un `-` entre une lettre et un
   * chiffre, exactement comme `100svh-5rem`. On met donc les `var(--…)` de
   * cote le temps d espacer, et on les remet ensuite — ce qui est entre
   * parentheses n a jamais ete un operateur.
   */
  const gardes = []
  const masque = valeur.replace(/var\(\s*--[\w-]+\s*(?:,[^()]*)?\)/g, (v) => {
    gardes.push(v)
    return `@@${String(gardes.length - 1)}@@`
  })

  const espace = (
    masque
      /*
       * Le `+` est sans ambiguite : aucun identifiant CSS n en porte.
       */
      .replace(/(?<=[\w%)\]])\+(?=[\w.(])/g, ' + ')
      /*
       * Le `-`, lui, vit aussi a l interieur des noms : `safe-area-inset-top`
       * n est pas une suite de soustractions. Il n est un operateur que s il
       * introduit un nombre, ou s il suit une valeur close — une parenthese,
       * un pourcentage. Le `e` d un `1e-5` est mis a part.
       */
      .replace(/(?<![\d][eE])(?<=[\w%)\]])-(?=[\d.])/g, ' - ')
      .replace(/(?<=[%)\]])-(?=[a-z(])/g, ' - ')
  )

  const fini = espace.replace(/@@(\d+)@@/g, (_, i) => gardes[Number(i)])
  console.error('TRACE dans espacerCalc:', JSON.stringify(valeur), '->', JSON.stringify(masque), '->', JSON.stringify(espace), '->', JSON.stringify(fini))
  return fini
}

/**
 * La couleur que designe un jeton, avec ou sans son alpha.
 *
 * `background`, `foreground/85`, `white`, `black`. Retourne `null` quand le
 * gabarit ne connait pas le nom — ce qui laisse la suite essayer autre chose.
 */
function couleurDeJeton(mot) {
  const coupe = mot.lastIndexOf('/')
  const nom = coupe < 0 ? mot : mot.slice(0, coupe)
  const part = coupe < 0 ? null : mot.slice(coupe + 1)

  const base =
    nom === 'white' ? '#fff'
      : nom === 'black' ? '#000'
        : THEME.has(`--color-${nom}`) ? THEME.get(`--color-${nom}`) : null
  if (base === null) return null
  if (part === null) return base

  const pourcent = part.startsWith('[')
    ? String(Number(part.slice(1, -1)) * 100)
    : part
  if (!/^[\d.]+$/.test(pourcent)) return null
  return `color-mix(in srgb, ${base} ${pourcent}%, transparent)`
}

/** The declarations a bare class name produces, or `null`. */
function declarationsFor(name) {
  // La table peut nommer le negatif en toutes lettres. `-scale-y-100` retourne
  // l element ; `scale-y-100` ne veut rien dire tout seul, et lui retirer son
  // signe avant de chercher revenait a ne jamais le trouver.
  if (SIMPLES[name] !== undefined) return SIMPLES[name]

  const negative = name.startsWith('-')
  // Le `!` de tete forcait la priorite dans l autre moteur ; ici la
  // specificite doublee du selecteur fait le meme travail.
  const bare = (negative ? name.slice(1) : name).replace(/^!/, '')

  // `scale-x-0`, `scale-y-110` : un pourcentage ecrit en centiemes, sur un axe.
  const echelle = /^scale-(x|y)-(\d+)$/.exec(bare)
  if (echelle !== null) {
    const valeur = (negative ? -1 : 1) * Number(echelle[2]) / 100
    return echelle[1] === 'x'
      ? [`scale: ${String(valeur)} 1`]
      : [`scale: 1 ${String(valeur)}`]
  }

  const uniforme = /^scale-(\d+)$/.exec(bare)
  if (uniforme !== null) {
    const valeur = (negative ? -1 : 1) * Number(uniforme[1]) / 100
    return [`scale: ${String(valeur)}`]
  }

  /*
   * Les degrades.
   *
   * `bg-linear-to-b from-background/85 via-30% to-55%` : quatre classes qui ne
   * se voient pas, et qui se parlent par des variables. `from-*` ne sait pas
   * s il y a un `via-*` ; c est `--PREFIXE-via-stops` qui le lui dit, en
   * restant indefinie quand il n y en a pas.
   */
  const direction = /^bg-(linear|radial|conic)-to-(t|b|l|r|tl|tr|bl|br)$/.exec(bare)
  if (direction !== null) {
    const VERS = {
      t: 'to top', b: 'to bottom', l: 'to left', r: 'to right',
      tl: 'to top left', tr: 'to top right',
      bl: 'to bottom left', br: 'to bottom right',
    }
    return [
      `background-image: ${direction[1]}-gradient(${VERS[direction[2]]}, var(--${prefix}-stops))`,
    ]
  }

  const arret = /^(from|via|to)-(.+)$/.exec(bare)
  if (arret !== null) {
    const [, role, valeur] = arret

    // Une position, ecrite en pourcentage : `via-30%`, `to-55%`.
    const position = /^(\d+)%$/.exec(valeur)
    if (position !== null) {
      return [`--${prefix}-${role}-pos: ${position[1]}%`]
    }

    // Une couleur du gabarit, avec ou sans son alpha.
    const couleur = couleurDeJeton(valeur)
    if (couleur !== null) {
      /*
       * L extremite qu on ne nomme pas s efface : c est la meme couleur a zero
       * pour cent, et non un `transparent` nu, qui laisserait un liseré gris
       * en s interpolant. Chaque regle ecrit ce repli en fonction de
       * **l autre** extremite, jamais de la sienne — un `var()` qui se cite
       * lui-meme dans son propre repli forme un cycle, et la declaration
       * entiere est jetee.
       */
      const efface = (autre) => `color-mix(in oklab, var(--${prefix}-${autre}) 0%, transparent)`

      if (role === 'via') {
        return [
          `--${prefix}-via: ${couleur}`,
          `--${prefix}-via-stops: ` +
            `var(--${prefix}-from, ${efface('via')}) var(--${prefix}-from-pos, 0%), ` +
            `var(--${prefix}-via) var(--${prefix}-via-pos, 50%), ` +
            `var(--${prefix}-to, ${efface('via')}) var(--${prefix}-to-pos, 100%)`,
          `--${prefix}-stops: var(--${prefix}-via-stops)`,
        ]
      }

      const bout = role === 'from' ? 'to' : 'from'
      const liste =
        role === 'from'
          ? `var(--${prefix}-from) var(--${prefix}-from-pos, 0%), ` +
            `var(--${prefix}-to, ${efface('from')}) var(--${prefix}-to-pos, 100%)`
          : `var(--${prefix}-from, ${efface('to')}) var(--${prefix}-from-pos, 0%), ` +
            `var(--${prefix}-to) var(--${prefix}-to-pos, 100%)`
      void bout

      return [
        `--${prefix}-${role}: ${couleur}`,
        `--${prefix}-stops: var(--${prefix}-via-stops, ${liste})`,
      ]
    }
  }

  const rang = /^order-(\d+)$/.exec(bare)
  if (rang !== null) return [`order: ${negative ? '-' : ''}${rang[1]}`]

  /*
   * La couleur d une ombre.
   *
   * L autre moteur la range dans une variable que ses propres ombres lisent.
   * On garde le mecanisme et on change le nom : l arborescence ne doit pas
   * porter la marque d un autre moteur, et les valeurs arbitraires qui la
   * citent sont reecrites de meme.
   */
  const ombreCouleur = /^shadow-(.+)$/.exec(bare)
  if (ombreCouleur !== null && !THEME.has(`--shadow-${ombreCouleur[1]}`)) {
    const teinte = couleurDeJeton(ombreCouleur[1])
    if (teinte !== null) return [`--${prefix}-shadow-color: ${teinte}`]
  }

  /*
   * Un rayon sur un seul cote, ou un seul coin : `rounded-b-media`,
   * `rounded-tl-card`. Le jeton est le meme ; ce qui change est le nombre de
   * coins qu il touche.
   */
  const COINS = {
    t: ['top-left', 'top-right'],
    b: ['bottom-left', 'bottom-right'],
    l: ['top-left', 'bottom-left'],
    r: ['top-right', 'bottom-right'],
    tl: ['top-left'], tr: ['top-right'],
    bl: ['bottom-left'], br: ['bottom-right'],
  }
  const coin = /^rounded-(t|b|l|r|tl|tr|bl|br)-([\w-]+)$/.exec(bare)
  if (coin !== null) {
    const jeton = THEME.get(`--radius-${coin[2]}`)
    if (jeton !== undefined) {
      return COINS[coin[1]].map((c) => `border-${c}-radius: ${jeton}`)
    }
  }

  const travee = /^(col|row)-span-(\d+)$/.exec(bare)
  if (travee !== null) {
    const axe = travee[1] === 'col' ? 'grid-column' : 'grid-row'
    return [`${axe}: span ${travee[2]} / span ${travee[2]}`]
  }

  const depart = /^(col|row)-(start|end)-(\d+)$/.exec(bare)
  if (depart !== null) {
    return [`grid-${depart[1] === 'col' ? 'column' : 'row'}-${depart[2]}: ${depart[3]}`]
  }

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
    const literal = espacerCalc(
      value.replace(/_/g, ' ').replace(/^image:/, '').replace(/--tw-/g, `--${prefix}-`),
    )
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

  /*
   * Les tailles que le gabarit nomme.
   *
   * `--spacing-footer-reveal: 85vh` fait exister `h-footer-reveal`,
   * `mt-footer-reveal`, `translate-y-footer-reveal` — toute la famille des
   * mesures. `--container-showreel` fait de meme pour les largeurs, et
   * `--aspect-showreel` pour les rapports. Ce sont des jetons comme les
   * couleurs, a ceci pres qu ils portent un nom au lieu d un nombre.
   */
  for (const [racine, props] of Object.entries(SPACING)) {
    if (!bare.startsWith(racine + '-')) continue
    const reste = bare.slice(racine.length + 1)
    const jeton =
      THEME.get(`--spacing-${reste}`) ??
      (racine.startsWith('w') || racine.startsWith('max-w') || racine.startsWith('min-w')
        ? THEME.get(`--container-${reste}`)
        : undefined)
    if (jeton === undefined) continue
    const valeur = `${negative ? '-' : ''}var(--spacing-${reste})`
    const nomJeton = THEME.has(`--spacing-${reste}`)
      ? `--spacing-${reste}`
      : `--container-${reste}`
    const ecrit = `${negative ? 'calc(-1 * var(' + nomJeton + '))' : `var(${nomJeton})`}`
    void valeur
    return props.map((p) => `${p}: ${ecrit}`)
  }

  const rapportNomme = /^aspect-([\w-]+)$/.exec(bare)
  if (rapportNomme !== null && THEME.has(`--aspect-${rapportNomme[1]}`)) {
    return [`aspect-ratio: var(--aspect-${rapportNomme[1]})`]
  }

  const remplissage = /^(fill|stroke)-([\w-]+)$/.exec(bare)
  if (remplissage !== null && THEME.has(`--color-${remplissage[2]}`)) {
    return [`${remplissage[1]}: var(--color-${remplissage[2]})`]
  }

  /*
   * `transition-[color,border-color,translate]` : la liste des proprietes est
   * ecrite dans le nom. L autre moteur y joint la duree et la courbe par
   * defaut — sans quoi la transition ne dure rien et ne se voit pas.
   */
  const transition = /^transition-\[([^\]]+)\]$/.exec(bare)
  if (transition !== null) {
    return [
      `transition-property: ${transition[1].split(',').map((p) => p.trim()).join(', ')}`,
      'transition-timing-function: var(--default-transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1))',
      'transition-duration: var(--default-transition-duration, 150ms)',
    ]
  }

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
    // Une mesure que le gabarit nomme : `translate-y-wordmark-drop`.
    if (THEME.has(`--spacing-${move[2]}`)) {
      const ecrit = negative
        ? `calc(-1 * var(--spacing-${move[2]}))`
        : `var(--spacing-${move[2]})`
      return [`--${prefix}-t${move[1]}: ${ecrit}`, 'TRANSLATE']
    }
  }

  // `-translate-1/2` deplace des deux cotes a la fois, en fraction de la boite.
  const moitie = /^translate-(\d+)\/(\d+)$/.exec(bare)
  if (moitie !== null) {
    const part = `${negative ? '-' : ''}${String((Number(moitie[1]) / Number(moitie[2])) * 100)}%`
    return [`--${prefix}-tx: ${part}`, `--${prefix}-ty: ${part}`, 'TRANSLATE']
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

  // `[--tap-x:0.75rem]` ou `[-webkit-appearance:none]` : une declaration
  // ecrite telle quelle. Le souligne y tient lieu d espace.
  const declaree = /^\[([^:\]]+):([^\]]+)\]$/.exec(bare)
  if (declaree !== null) {
    return [`${declaree[1]}: ${declaree[2].replace(/_/g, ' ')}`]
  }

  // Les durees et les delais de l echelle livree, comptes en millisecondes.
  const duree = /^(duration|delay)-(\d+)$/.exec(bare)
  if (duree !== null) {
    const prop = duree[1] === 'duration' ? 'transition-duration' : 'transition-delay'
    return [`${prop}: ${duree[2]}ms`]
  }

  // Un rapport d image ecrit sans crochets : `aspect-4/5`.
  const rapport = /^aspect-(\d+)\/(\d+)$/.exec(bare)
  if (rapport !== null) return [`aspect-ratio: ${rapport[1]} / ${rapport[2]}`]

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

/**
 * Un nom de classe sur lequel le navigateur ne butera pas.
 *
 * La version d avant nommait les caracteres a remplacer, un par un. Tout ce
 * qu elle n avait pas prevu passait — `!`, `+`, `*`, `@`, `&`, `>` — et un seul
 * suffit : `.hl-!rounded-24px` n est pas un selecteur valide, donc la regle
 * entiere est jetee. Sans erreur, sans avertissement. Le coin arrondi du menu
 * de `helion` manquait ainsi depuis son portage, et la hauteur d une section de
 * `parfum` perdait 1280 px.
 *
 * On ne nomme donc plus ce qui est interdit : on nomme ce qui est permis, et
 * tout le reste devient un tiret.
 */
const PRIS = new Map()

/** Le `:` qui separe la variante est celui qui se trouve **hors** des crochets. */
function coupure(nom) {
  let cut = -1
  let profondeur = 0
  for (let i = 0; i < nom.length; i += 1) {
    if (nom[i] === '[') profondeur += 1
    else if (nom[i] === ']') profondeur -= 1
    else if (nom[i] === ':' && profondeur === 0) cut = i
  }
  return cut
}

/** Les `:` de premier niveau — ceux qui sont hors crochets — separent les variantes. */
function decouper(chaine) {
  const parts = []
  let profondeur = 0
  let debut = 0
  for (let i = 0; i < chaine.length; i += 1) {
    if (chaine[i] === '[') profondeur += 1
    else if (chaine[i] === ']') profondeur -= 1
    else if (chaine[i] === ':' && profondeur === 0) {
      parts.push(chaine.slice(debut, i))
      debut = i + 1
    }
  }
  parts.push(chaine.slice(debut))
  return parts.filter((p) => p !== '')
}

const varianteDe = (nom) => (coupure(nom) < 0 ? '' : nom.slice(0, coupure(nom)))
const sansVariante = (nom) => (coupure(nom) < 0 ? nom : nom.slice(coupure(nom) + 1))

function nomDeRegle(original) {
  const base =
    `${prefix}-` +
    original
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/-+$/g, '')

  /*
   * Deux originaux differents peuvent desormais se rejoindre : `a*b` et `a+b`
   * donnent tous deux `a-b`. Ce serait une regle qui en ecrase une autre — et
   * le meme silence. Le premier arrive garde le nom ; les suivants le suffixent.
   */
  const vu = PRIS.get(base)
  if (vu === undefined) {
    PRIS.set(base, original)
    return base
  }
  if (vu === original) return base

  // `z-100` et `z-[100]` se rejoignent et posent le meme `z-index: 100`. Deux
  // noms pour une seule regle ne sert personne : ils la partagent.
  const memeRegle =
    JSON.stringify(declarationsFor(sansVariante(vu)))
    === JSON.stringify(declarationsFor(sansVariante(original)))
    && varianteDe(vu) === varianteDe(original)
  if (memeRegle) return base

  let rang = 2
  while (PRIS.has(`${base}-${String(rang)}`)) {
    if (PRIS.get(`${base}-${String(rang)}`) === original) return `${base}-${String(rang)}`
    rang += 1
  }
  PRIS.set(`${base}-${String(rang)}`, original)
  return `${base}-${String(rang)}`
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
  /*
   * Le `!` de tete rend sa priorite.
   *
   * On le tenait pour superflu : chaque selecteur repete sa classe, ce qui
   * double sa specificite, et cela suffit face a une regle ordinaire. Cela ne
   * suffit pas face a une autre regle derivee, qui a la meme — et c est alors
   * l ordre qui tranche.
   *
   * `helion` pose sur son menu deroulant, dans la meme chaine, la constante
   * `PILL` — qui apporte `rounded-[32px]` — et `!rounded-[24px]`. Les deux regles sortaient a egalite, la
   * seconde plus bas dans la feuille, et le menu gardait 32 px de rayon. C est
   * exactement ce que le `!` etait la pour empecher.
   */
  const force = /^-?!/.test(bare)
  const marque = (d) => (force ? `${d} !important` : d)

  const declaration = translate
    ? `${corps.map(marque).join('; ')}; translate: var(--${prefix}-tx, 0) var(--${prefix}-ty, 0)`
    : corps.map(marque).join('; ')

  /*
   * Une variante peut en cacher plusieurs.
   *
   * `sm:[&>li:last-child]:col-span-2` en porte deux : une rupture et un
   * selecteur. Les traiter comme un seul mot revenait a n en reconnaitre
   * aucune — la regle sortait sans requete et sans descendant, posee sur la
   * liste au lieu de son dernier element, et la grille de `parfum` gagnait une
   * rangee a partir de 640 px.
   *
   * On les separe donc, sur les `:` de premier niveau, et chacune agit : les
   * unes sur le selecteur, les autres sur la requete. L ordre du selecteur suit
   * celui de l ecriture, de la plus exterieure a la plus interieure.
   */
  let selecteur = `.${nom}.${nom}`
  let requete = null

  const morceaux = variant === '' ? [] : decouper(variant)

  for (const part of morceaux) {
    /* ---- Ce qui agit sur le selecteur. ---- */
    if (part === 'hover' || part === 'focus' || part === 'active') {
      selecteur += `:${part}`
    } else if (part === 'focus-visible') selecteur += ':focus-visible'
    else if (part === 'focus-within') selecteur += ':focus-within'
    else if (part === 'disabled') selecteur += ':disabled'
    else if (part === 'checked') selecteur += ':checked'
    else if (part === 'indeterminate') selecteur += ':indeterminate'
    else if (part === 'required') selecteur += ':required'
    else if (part === 'invalid') selecteur += ':invalid'
    else if (part === 'visited') selecteur += ':visited'
    else if (part === 'target') selecteur += ':target'
    else if (part === 'empty') selecteur += ':empty'
    else if (part === 'only') selecteur += ':only-child'
    else if (part === 'first') selecteur += ':first-child'
    else if (part === 'last') selecteur += ':last-child'
    else if (part === 'odd') selecteur += ':nth-child(odd)'
    else if (part === 'even') selecteur += ':nth-child(even)'
    else if (part === 'placeholder') selecteur += '::placeholder'
    else if (part === 'before') selecteur += '::before'
    else if (part === 'after') selecteur += '::after'
    /*
     * Les variantes qui lisent un attribut de donnee.
     *
     *   `data-[on=true]:bg-accent`   ->  `[data-on="true"]`
     *   `data-drag:cursor-grabbing`  ->  `[data-drag]`
     *   `in-data-front:shadow-…`     ->  `[data-front] &` — un ancetre, pas
     *                                     l element lui-meme.
     */
    else if (part.startsWith('data-[') && part.endsWith(']')) {
      const corps = part.slice('data-['.length, -1)
      const egal = corps.indexOf('=')
      selecteur +=
        egal < 0
          ? `[data-${corps}]`
          : `[data-${corps.slice(0, egal)}="${corps.slice(egal + 1).replace(/^["']|["']$/g, '')}"]`
    } else if (part.startsWith('in-data-')) {
      selecteur = `[data-${part.slice('in-data-'.length)}] ${selecteur}`
    } else if (part.startsWith('group-data-')) {
      selecteur = `.group[data-${part.slice('group-data-'.length)}] ${selecteur}`
    } else if (/^data-[\w-]+$/.test(part)) {
      selecteur += `[${part}]`
    } else if (part.startsWith('group-')) {
      const etat = part.slice('group-'.length)
      selecteur = `.group:${etat} ${selecteur}`
    } else if (part.startsWith('[&') && part.endsWith(']')) {
      // L esperluette tient la place de ce qui precede ; le souligne, celle
      // de l espace.
      selecteur = part.slice(1, -1).replace(/&/g, selecteur).replace(/_/g, ' ')
    } else {
      /* ---- Ce qui agit sur la requete. ---- */
      let ajout = null
      if (VARIANTES.has(part)) {
        ajout = VARIANTES.get(part)
      } else if (BREAKPOINTS.has(part)) {
        ajout = `(min-width: ${String(BREAKPOINTS.get(part))}px)`
      } else if (part.startsWith('max-') && BREAKPOINTS.has(part.slice(4))) {
        // L autre moteur coupe juste en dessous de la rupture, pas dessus. Et
        // il tire `max-lg` de la rupture meme quand `lg` a ete redeclare : la
        // declaration ne remplace que la variante qu elle nomme.
        ajout = `(max-width: ${String(BREAKPOINTS.get(part.slice(4)) - 0.02)}px)`
      } else if (VARIANTES_LIVREES.has(part)) {
        ajout = VARIANTES_LIVREES.get(part)
      } else if (part.startsWith('[@media') && part.endsWith(']')) {
        ajout = part.slice('[@media'.length, -1).replace(/_/g, ' ')
      }
      if (ajout === null) {
        // Une variante que personne ne reconnait. La rendre plutot que
        // produire une regle qui ne dit pas ce qu on croit.
        rendus.push(original)
        table.pop()
        selecteur = null
        break
      }
      requete = requete === null ? ajout : `${requete} and ${ajout}`
    }
  }

  if (selecteur === null) continue

  const cle = requete === null ? '' : requete
  const liste = regles.get(cle) ?? []
  liste.push(`${selecteur} { ${declaration}; }`)
  regles.set(cle, liste)
}

console.log('/* ---- table ---- */')
console.log(table.join('\n'))
console.log('\n/* ---- feuille ---- */')
/*
 * L ordre des blocs decide, parce que la specificite ne decide plus.
 *
 * Chaque regle repete sa classe, donc toutes ont la meme specificite : a egalite
 * c est la derniere ecrite qui peint. Les blocs sortaient jusqu ici dans l ordre
 * ou les classes s etaient presentees — un ordre sans rapport avec les ruptures.
 * Chez `parfum`, `sm:aspect-4/3` se trouvait ecrit apres `lg:aspect-auto`, et la
 * scene de la FAQ gardait son rapport 4/3 sur un grand ecran : 1080 px au lieu
 * de 800.
 *
 * On les remet donc dans l ordre de l autre moteur : le sans-requete d abord,
 * puis les `min-width` croissantes, puis les `max-width` decroissantes, puis le
 * reste — une requete de preference ou de pointeur ne concurrence pas une
 * largeur, et vient en dernier.
 */
/**
 * Une variante que le gabarit s est donnee a un nom qui n est pas une rupture
 * connue : `stacked`, `max-h-717`. L autre moteur les ajoute **apres** les
 * siennes, quelle que soit la largeur qu elles decrivent — `stacked:grid-cols-2`
 * bat donc `max-sm:grid-cols-1` sur un telephone, et c est voulu.
 *
 * Une variante qui **redeclare** un nom connu, comme le `lg` de `parfum`, garde
 * la place de ce nom : elle le remplace, elle ne s ajoute pas.
 */
const PROPRES = new Set(
  [...VARIANTES.keys()].filter((nom) => !BREAKPOINTS.has(nom)),
)

const requetesPropres = new Set(
  [...PROPRES].map((nom) => VARIANTES.get(nom)),
)

function rang(requete) {
  if (requete === '') return [0, 0]
  if (requetesPropres.has(requete)) return [4, 0]
  const min = /min-width:\s*([\d.]+)px/.exec(requete)
  if (min !== null) return [1, Number(min[1])]
  const max = /max-width:\s*([\d.]+)px/.exec(requete)
  if (max !== null) return [2, -Number(max[1])]
  return [3, 0]
}

const ordonnees = [...regles.entries()].sort((a, b) => {
  const [ga, va] = rang(a[0])
  const [gb, vb] = rang(b[0])
  return ga !== gb ? ga - gb : va - vb
})

for (const [requete, liste] of ordonnees) {
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
