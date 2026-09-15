/**
 * Import of the icon packs.
 *
 * ## What this script does, and what it does not
 *
 * It reads third-party icon packs installed as development dependencies,
 * normalises them on a single contract, and writes one module per pack. It
 * draws nothing: the shapes come from the original packs, whose licences are
 * carried over into `CREDITS.md` at the root.
 *
 * It runs by hand, not on every build. The modules it produces are versioned:
 * a project installing `@odoro-cli/icons` must not have to install fifteen
 * thousand SVG files in order to display three.
 *
 * ## Why a representation and not markup
 *
 * The obvious solution would be to keep the inside of the SVG as is and inject
 * it. That would require `dangerouslySetInnerHTML` for every icon — on
 * generated data the risk is theoretical, but the loophole is open forever and
 * nothing then stops anything else from going through it.
 *
 * Each icon is therefore reduced to a list of `[tag, attributes]`, which the
 * component turns into React elements. The data can no longer hold markup,
 * only described nodes.
 *
 * ## The normalisation
 *
 * The four packs share neither grid, nor weight, nor fill convention: 24 units
 * stroked, 16 solid, 512 solid, 960 outlined. They are not brought back to a
 * common grid — redrawing a shape to make it fit another grid is deforming it.
 *
 * Each icon therefore keeps its original box, and declares its mode: `outline`
 * or `solid`. The component adapts to it, and the requested size holds for
 * them all. What stays different — the apparent weight, the drawing style — is
 * the reason one picks **one** pack and sticks to it.
 *
 * ## The names
 *
 * No name of an original pack appears in the tree nor in the code: the modules
 * carry the character of the drawing, not its provenance. That belongs in
 * `CREDITS.md`, where it has its place.
 *
 * Usage:
 *
 *   pnpm --filter @odoro-cli/icons icons:import
 *
 * @module
 */

import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Where the produced modules live. */
const OUT = join('src', 'packs')

/** A node of the drawing: a tag and its attributes. */
type Node = readonly [string, Readonly<Record<string, string>>]

/** A normalised icon. */
interface Icon {
  /** Lowercase name, separated by dashes. */
  readonly name: string
  /** Box of the drawing, as the original pack defines it. */
  readonly box: string
  /** Nodes of the drawing. */
  readonly nodes: readonly Node[]
}

/** What a pack declares. */
interface Pack {
  /** Name of the produced module, and of the export of the package. */
  readonly module: string
  /** Title displayed in the documentation. */
  readonly title: string
  /** One sentence on the character of the drawing. */
  readonly summary: string
  /** Render mode: stroked drawing, or solid glyph. */
  readonly mode: 'outline' | 'solid'
  /** Stroke weight, in the units of the box. */
  readonly stroke?: number
  /** Directories to read, in order. */
  readonly sources: readonly { readonly dir: string; readonly skip?: RegExp }[]
  /** Attribution, carried over into `CREDITS.md`. */
  readonly credit: string
  /** Warning set at the head of the produced module. */
  readonly warning?: readonly string[]
}

const PACKS: readonly Pack[] = [
  {
    module: 'outline',
    title: 'Outline',
    summary:
      'Two-unit stroke on a twenty-four grid. The most regular of the four: every icon shares the same weight and the same rounded caps.',
    mode: 'outline',
    stroke: 2,
    sources: [{ dir: 'lucide-static/icons' }],
    credit: 'ISC',
  },
  {
    module: 'compact',
    title: 'Compact',
    summary:
      'Solid glyphs on a sixteen grid. Drawn for small sizes: they stay legible at sixteen pixels, where a stroked drawing blurs.',
    mode: 'solid',
    sources: [{ dir: 'bootstrap-icons/icons' }],
    credit: 'MIT',
  },
  {
    module: 'classic',
    title: 'Classic',
    summary:
      'Solid glyphs on a five hundred and twelve grid. The densest drawing of the four, and the most recognisable — it is the graphic vocabulary of the web of the last fifteen years.',
    mode: 'solid',
    // The pierced variant of the same pack carries exactly the same names: it
    // would be pushed aside entirely by the first-come rule. A second pack,
    // under another name, would be the only way to offer it.
    sources: [{ dir: '@fortawesome/fontawesome-free/svgs/solid' }],
    credit: 'CC BY 4.0',
  },
  {
    module: 'extended',
    title: 'Extended',
    summary:
      'Thin outline on a nine hundred and sixty grid. By far the widest: it covers domains that the others ignore, at the cost of coverage that is uneven in quality.',
    mode: 'solid',
    sources: [{ dir: '@material-symbols/svg-400/outlined', skip: /-fill\.svg$/ }],
    credit: 'Apache-2.0',
  },
  {
    module: 'brands',
    title: 'Brands',
    summary:
      'Logos of services and platforms. Unlike the other packs, these are registered trademarks: their licence says nothing about their use, the rules of each owner are what apply.',
    mode: 'solid',
    sources: [{ dir: '@fortawesome/fontawesome-free/svgs/brands' }],
    credit: 'registered trademarks of their respective owners',
    warning: [
      'These drawings are **registered trademarks**. The licence of the pack they',
      'come from says nothing about their use: the rules of each owner are what',
      'hold.',
      '',
      'Designating a service by its logo — a "sign in with" button, a link to a',
      'profile — is ordinary nominative use. Suggesting an affiliation that does',
      'not exist does not become one because the file was free. And altering a',
      'logo — color, proportions, cropping — is generally forbidden by brand',
      'guidelines, while the component technically allows it.',
      '',
      'See `CREDITS.md` at the root.',
    ],
  },
]

/**
 * Attributes kept.
 *
 * Everything else is thrown away: the classes of the original packs, which
 * mean nothing here; the colors, which must come from the text; the
 * dimensions, which are decided at the point of use.
 */
const KEPT = new Set([
  'd',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'width',
  'height',
  'points',
  'transform',
  'fill-rule',
  'clip-rule',
])

/** Accepted tags. An icon using others is pushed aside. */
const TAGS = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'])

/** Reads the nodes of an SVG file. */
function parse(svg: string): { box: string; nodes: Node[] } | undefined {
  const box = /viewBox="([^"]+)"/.exec(svg)?.[1]
  if (box === undefined) return undefined

  // The inside only: the root element carries dimensions and colors that are
  // decided at render time, not here.
  const inner = svg.slice(
    svg.indexOf('>', svg.indexOf('<svg')) + 1,
    svg.lastIndexOf('</svg>'),
  )

  const nodes: Node[] = []
  for (const match of inner.matchAll(/<([a-z]+)\s([^>]*?)\/?>/g)) {
    const tag = match[1] ?? ''
    if (!TAGS.has(tag)) return undefined

    const attributes: Record<string, string> = {}
    // The digit counts: `x1`, `y1`, `x2`, `y2` carry half of the stroked
    // drawings, and ignoring them empties the icon instead of damaging it.
    for (const attribute of (match[2] ?? '').matchAll(/([a-z][a-z0-9-]*)="([^"]*)"/g)) {
      const key = attribute[1] ?? ''
      if (KEPT.has(key)) attributes[key] = attribute[2] ?? ''
    }

    if (Object.keys(attributes).length > 0) nodes.push([tag, attributes])
  }

  return nodes.length === 0 ? undefined : { box, nodes }
}

/**
 * Turns a file name into an exportable identifier.
 *
 * ## Why the rule is injective
 *
 * The obvious transformation — drop the dashes and capitalise — loses the
 * information of the separators: `arrow-down-01` and `arrow-down-0-1` both
 * give `ArrowDown01`, and the module no longer compiles. The outline pack
 * holds four pairs of that kind.
 *
 * ## The names that cannot be taken
 *
 * `infinity` would give `Infinity`, which shadows the global of the same name
 * — in the produced module, and above all in whoever imports it: a file
 * displaying that icon would lose the numeric value. Those few names therefore
 * receive the `Icon` suffix, which reads and shadows nothing.
 *
 * ## The rule
 *
 * Each segment is therefore marked: a capital if it starts with a letter, an
 * underscore if it starts with a digit. The boundaries stay legible in the
 * result, two distinct names give two distinct identifiers, and the result
 * depends only on the name — not on the reading order, nor on what the pack
 * holds elsewhere.
 */
function identifier(name: string): string {
  const pascal = name
    .split(/[-_.]/)
    .filter((part) => part.length > 0)
    .map((part) =>
      // An identifier cannot start with a digit, and a good part of the
      // extended pack is called `10k`, `360`, `4k`.
      /^\d/.test(part) ? `_${part}` : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join('')

  return RESERVED.has(pascal) ? `${pascal}Icon` : pascal
}

/**
 * Identifiers that would shadow a global.
 *
 * `Infinity` is the only one the packs produce today; the others are there
 * because the day an icon is called `nan`, nobody will think of coming back
 * here.
 */
const RESERVED = new Set(['Infinity', 'NaN', 'Undefined', 'Eval', 'Arguments'])

/** Attributes as TypeScript source, as short as possible. */
function serialise(nodes: readonly Node[]): string {
  return nodes
    .map(([tag, attributes]) => {
      const pairs = Object.entries(attributes)
        .map(([key, value]) => `${JSON.stringify(key)}:${JSON.stringify(value)}`)
        .join(',')
      return `[${JSON.stringify(tag)},{${pairs}}]`
    })
    .join(',')
}

/** Reads a pack, in the order of its sources. */
async function collect(pack: Pack): Promise<Icon[]> {
  const icons: Icon[] = []
  const seen = new Set<string>()

  for (const source of pack.sources) {
    const dir = join('node_modules', source.dir)
    const files = (await readdir(dir)).filter(
      (file) => file.endsWith('.svg') && !(source.skip?.test(file) ?? false),
    )

    for (const file of files.sort()) {
      const name = file.slice(0, -4)
      // The sources are read in order: the first one carrying a name keeps it,
      // which makes the order of the table significant.
      if (seen.has(name)) continue

      const parsed = parse(await readFile(join(dir, file), 'utf8'))
      if (parsed === undefined) continue

      seen.add(name)
      icons.push({ name, box: parsed.box, nodes: parsed.nodes })
    }
  }

  return icons
}

/** Writes the module of a pack. */
async function emit(pack: Pack, icons: readonly Icon[]): Promise<void> {
  const lines: string[] = [
    '/* Generated by scripts/import-icons.ts. Do not edit by hand. */',
    '',
    ...(pack.warning === undefined
      ? []
      : [
          '/**',
          ...pack.warning.map((line) => (line === '' ? ' *' : ` * ${line}`)),
          ' */',
          '',
        ]),
    "import type { IconData } from '../types.js'",
    '',
    `/** ${pack.title} — ${String(icons.length)} icons. ${pack.summary} */`,
    `export const INFO = {`,
    `  module: ${JSON.stringify(pack.module)},`,
    `  title: ${JSON.stringify(pack.title)},`,
    `  summary: ${JSON.stringify(pack.summary)},`,
    `  mode: ${JSON.stringify(pack.mode)},`,
    ...(pack.stroke === undefined ? [] : [`  stroke: ${String(pack.stroke)},`]),
    `  count: ${String(icons.length)},`,
    `} as const`,
    '',
  ]

  // The dashed name is not deduced from the identifier: `ArrowDown_0_1` and
  // `ArrowDown_01` would come back to the same one. It is therefore carried
  // explicitly, in a single object — which pruning removes entirely when
  // nobody imports it.
  lines.push(
    '/** Original name of each icon, indexed by its identifier. */',
    'export const NAMES: Readonly<Record<string, string>> = {',
    ...icons.map((icon) => `  ${identifier(icon.name)}: ${JSON.stringify(icon.name)},`),
    '}',
    '',
  )

  for (const icon of icons) {
    const parts = [
      `box:${JSON.stringify(icon.box)}`,
      `mode:${JSON.stringify(pack.mode)}`,
      ...(pack.stroke === undefined ? [] : [`stroke:${String(pack.stroke)}`]),
      `nodes:[${serialise(icon.nodes)}]`,
    ]
    lines.push(
      `/** \`${icon.name}\` */`,
      `export const ${identifier(icon.name)}: IconData = {${parts.join(',')}}`,
    )
  }

  await writeFile(join(OUT, `${pack.module}.ts`), `${lines.join('\n')}\n`, 'utf8')
}

await mkdir(OUT, { recursive: true })

/** What the catalogue keeps of a pack: its names, never its drawings. */
interface CataloguePack {
  readonly title: string
  readonly summary: string
  readonly mode: 'outline' | 'solid'
  readonly stroke?: number
  readonly credit: string
  readonly names: readonly string[]
}

const catalogue: Record<string, CataloguePack> = {}

for (const pack of PACKS) {
  const icons = await collect(pack)
  await emit(pack, icons)

  catalogue[pack.module] = {
    title: pack.title,
    summary: pack.summary,
    mode: pack.mode,
    ...(pack.stroke === undefined ? {} : { stroke: pack.stroke }),
    credit: pack.credit,
    names: icons.map((icon) => icon.name),
  }

  console.log(`${pack.module.padEnd(10)} ${String(icons.length).padStart(5)} icons`)
}

// The catalogue serves documentation search: it needs the names, never the
// drawings.
await writeFile(
  join('src', 'catalogue.json'),
  `${JSON.stringify(catalogue, null, 2)}\n`,
  'utf8',
)

const total = Object.values(catalogue).reduce((sum, pack) => sum + pack.names.length, 0)
console.log(`\n${String(total)} icons in ${String(PACKS.length)} packs.`)
