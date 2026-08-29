/**
 * Importation des jeux d'icones.
 *
 * ## Ce que fait ce script, et ce qu'il ne fait pas
 *
 * Il lit des jeux d'icones tiers installes en dependance de developpement, les
 * normalise sur un contrat unique, et ecrit un module par jeu. Il ne dessine
 * rien : les traces viennent des jeux d'origine, dont les licences sont
 * reportees dans `CREDITS.md` a la racine.
 *
 * Il tourne a la main, pas a chaque build. Les modules qu'il produit sont
 * versionnes : un projet qui installe `@odoro/icons` ne doit pas avoir a
 * installer quinze mille fichiers SVG pour en afficher trois.
 *
 * ## Pourquoi une representation et pas du markup
 *
 * La solution evidente serait de conserver l'interieur du SVG tel quel et de
 * l'injecter. Cela demanderait `dangerouslySetInnerHTML` pour chaque icone —
 * sur une donnee generee, le risque est theorique, mais l'echappatoire est
 * ouverte pour toujours et rien n'empeche ensuite d'y faire passer autre
 * chose.
 *
 * Chaque icone est donc reduite a une liste de `[balise, attributs]`, que le
 * composant transforme en elements React. La donnee ne peut plus contenir de
 * markup, seulement des noeuds decrits.
 *
 * ## La normalisation
 *
 * Les quatre jeux ne partagent ni grille, ni epaisseur, ni convention de
 * remplissage : 24 unites au trait, 16 pleines, 512 pleines, 960 au contour.
 * On ne les ramene pas a une grille commune — redessiner un trace pour le
 * faire tenir dans une autre grille, c'est le deformer.
 *
 * Chaque icone conserve donc sa boite d'origine, et declare son mode :
 * `trait` ou `plein`. Le composant s'y adapte, et la taille demandee vaut pour
 * toutes. Ce qui reste different — l'epaisseur apparente, le style du dessin —
 * est la raison pour laquelle on choisit **un** jeu et qu'on s'y tient.
 *
 * ## Les noms
 *
 * Aucun nom de jeu d'origine n'apparait dans l'arborescence ni dans le code :
 * les modules portent le caractere du dessin, pas sa provenance. Celle-ci est
 * dans `CREDITS.md`, ou elle a sa place.
 *
 * Usage :
 *
 *   pnpm --filter @odoro/icons icons:import
 *
 * @module
 */

import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Ou vivent les modules produits. */
const OUT = join('src', 'jeux')

/** Un noeud de dessin : une balise et ses attributs. */
type Node = readonly [string, Readonly<Record<string, string>>]

/** Une icone normalisee. */
interface Icon {
  /** Nom en minuscules, separe par des tirets. */
  readonly name: string
  /** Boite du dessin, telle que le jeu d'origine la definit. */
  readonly box: string
  /** Noeuds du trace. */
  readonly nodes: readonly Node[]
}

/** Ce qu'un jeu declare. */
interface Pack {
  /** Nom du module produit, et de l'export du paquet. */
  readonly module: string
  /** Intitule affiche dans la documentation. */
  readonly title: string
  /** Une phrase sur le caractere du dessin. */
  readonly summary: string
  /** Mode de rendu : trace au trait, ou glyphe plein. */
  readonly mode: 'trait' | 'plein'
  /** Epaisseur du trait, dans les unites de la boite. */
  readonly stroke?: number
  /** Dossiers a lire, dans l'ordre. */
  readonly sources: readonly { readonly dir: string; readonly skip?: RegExp }[]
  /** Attribution, reprise dans `CREDITS.md`. */
  readonly credit: string
  /** Avertissement pose en tete du module produit. */
  readonly warning?: readonly string[]
}

const PACKS: readonly Pack[] = [
  {
    module: 'filaire',
    title: 'Filaire',
    summary:
      'Trace au trait de deux unites sur une grille de vingt-quatre. Le plus regulier des quatre : toutes les icones partagent la meme epaisseur et les memes terminaisons arrondies.',
    mode: 'trait',
    stroke: 2,
    sources: [{ dir: 'lucide-static/icons' }],
    credit: 'ISC',
  },
  {
    module: 'compact',
    title: 'Compact',
    summary:
      'Glyphes pleins sur une grille de seize. Dessines pour de petites tailles : ils restent lisibles a seize pixels, la ou un trace au trait se brouille.',
    mode: 'plein',
    sources: [{ dir: 'bootstrap-icons/icons' }],
    credit: 'MIT',
  },
  {
    module: 'classique',
    title: 'Classique',
    summary:
      'Glyphes pleins sur une grille de cinq cent douze. Le dessin le plus dense des quatre, et le plus reconnaissable — c est le vocabulaire graphique du web depuis quinze ans.',
    mode: 'plein',
    // La variante ajouree du meme jeu porte exactement les memes noms : elle
    // serait entierement ecartee par la regle du premier arrive. Un second
    // jeu, sous un autre nom, serait la seule facon de l'offrir.
    sources: [{ dir: '@fortawesome/fontawesome-free/svgs/solid' }],
    credit: 'CC BY 4.0',
  },
  {
    module: 'etendu',
    title: 'Etendu',
    summary:
      'Contour fin sur une grille de neuf cent soixante. De loin le plus vaste : il couvre des domaines que les autres ignorent, au prix d une couverture inegale en qualite.',
    mode: 'plein',
    sources: [{ dir: '@material-symbols/svg-400/outlined', skip: /-fill\.svg$/ }],
    credit: 'Apache-2.0',
  },
  {
    module: 'marques',
    title: 'Marques',
    summary:
      'Logos de services et de plateformes. Contrairement aux autres jeux, ceux-ci sont des marques deposees : leur licence ne dit rien de leur usage, ce sont les regles de chaque proprietaire qui s appliquent.',
    mode: 'plein',
    sources: [{ dir: '@fortawesome/fontawesome-free/svgs/brands' }],
    credit: 'marques deposees de leurs proprietaires respectifs',
    warning: [
      'Ces traces sont des **marques deposees**. La licence du jeu dont ils',
      'proviennent ne dit rien de leur emploi : ce sont les regles de chaque',
      'proprietaire qui font foi.',
      '',
      'Designer un service par son logo — un bouton « se connecter avec », un',
      "lien vers un profil — est l'usage nominatif ordinaire. Suggerer une",
      "affiliation qui n'existe pas ne le devient pas parce que le fichier",
      'etait libre. Et modifier un logo — couleur, proportions, recadrage — est',
      'generalement interdit par les chartes de marque, alors que le composant',
      'le permet techniquement.',
      '',
      'Voir `CREDITS.md` a la racine.',
    ],
  },
]

/**
 * Attributs conserves.
 *
 * Tout le reste est jete : les classes des jeux d'origine, qui ne veulent rien
 * dire ici ; les couleurs, qui doivent venir du texte ; les dimensions, qui
 * sont decidees a l'usage.
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

/** Balises acceptees. Une icone qui en emploie d'autres est ecartee. */
const TAGS = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'])

/** Lit les noeuds d'un fichier SVG. */
function parse(svg: string): { box: string; nodes: Node[] } | undefined {
  const box = /viewBox="([^"]+)"/.exec(svg)?.[1]
  if (box === undefined) return undefined

  // L'interieur seulement : l'element racine porte des dimensions et des
  // couleurs qui sont decidees au rendu, pas ici.
  const inner = svg.slice(
    svg.indexOf('>', svg.indexOf('<svg')) + 1,
    svg.lastIndexOf('</svg>'),
  )

  const nodes: Node[] = []
  for (const match of inner.matchAll(/<([a-z]+)\s([^>]*?)\/?>/g)) {
    const tag = match[1] ?? ''
    if (!TAGS.has(tag)) return undefined

    const attributes: Record<string, string> = {}
    // Le chiffre compte : `x1`, `y1`, `x2`, `y2` portent la moitie des
    // traces au trait, et les ignorer vide l'icone au lieu de l'abimer.
    for (const attribute of (match[2] ?? '').matchAll(/([a-z][a-z0-9-]*)="([^"]*)"/g)) {
      const key = attribute[1] ?? ''
      if (KEPT.has(key)) attributes[key] = attribute[2] ?? ''
    }

    if (Object.keys(attributes).length > 0) nodes.push([tag, attributes])
  }

  return nodes.length === 0 ? undefined : { box, nodes }
}

/**
 * Transforme un nom de fichier en identifiant exportable.
 *
 * ## Pourquoi la regle est injective
 *
 * La transformation evidente — retirer les tirets et capitaliser — perd
 * l'information des separateurs : `arrow-down-01` et `arrow-down-0-1`
 * donnent tous deux `ArrowDown01`, et le module ne compile plus. Le jeu
 * filaire contient quatre paires de ce genre.
 *
 * ## Les noms qui ne peuvent pas etre pris
 *
 * `infinity` donnerait `Infinity`, qui masque le global du meme nom — dans le
 * module produit, et surtout chez qui l'importe : un fichier qui affiche cette
 * icone perdrait la valeur numerique. Ces quelques noms recoivent donc le
 * suffixe `Icon`, qui se lit et ne masque rien.
 *
 * ## La regle
 *
 * Chaque segment est donc marque : une majuscule s'il commence par une lettre,
 * un tiret bas s'il commence par un chiffre. Les frontieres restent lisibles
 * dans le resultat, deux noms distincts donnent deux identifiants distincts,
 * et le resultat ne depend que du nom — pas de l'ordre de lecture, ni de ce
 * que le jeu contient par ailleurs.
 */
function identifier(name: string): string {
  const pascal = name
    .split(/[-_.]/)
    .filter((part) => part.length > 0)
    .map((part) =>
      // Un identifiant ne peut pas commencer par un chiffre, et une bonne part
      // du jeu etendu s'appelle `10k`, `360`, `4k`.
      /^\d/.test(part) ? `_${part}` : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join('')

  return RESERVED.has(pascal) ? `${pascal}Icon` : pascal
}

/**
 * Identifiants qui masqueraient un global.
 *
 * `Infinity` est le seul que les jeux produisent aujourd'hui ; les autres sont
 * la parce que le jour ou une icone s'appellera `nan`, personne ne pensera a
 * revenir ici.
 */
const RESERVED = new Set(['Infinity', 'NaN', 'Undefined', 'Eval', 'Arguments'])

/** Attributs en source TypeScript, au plus court. */
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

/** Lit un jeu, dans l'ordre de ses sources. */
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
      // Les sources sont lues dans l'ordre : la premiere qui porte un nom le
      // garde, ce qui rend l'ordre de la table significatif.
      if (seen.has(name)) continue

      const parsed = parse(await readFile(join(dir, file), 'utf8'))
      if (parsed === undefined) continue

      seen.add(name)
      icons.push({ name, box: parsed.box, nodes: parsed.nodes })
    }
  }

  return icons
}

/** Ecrit le module d'un jeu. */
async function emit(pack: Pack, icons: readonly Icon[]): Promise<void> {
  const lines: string[] = [
    '/* Genere par scripts/import-icons.ts. Ne pas editer a la main. */',
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
    `/** ${pack.title} — ${String(icons.length)} icones. ${pack.summary} */`,
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

  // Le nom en tirets ne se deduit pas de l'identifiant : `ArrowDown_0_1` et
  // `ArrowDown_01` remonteraient au meme. Il est donc porte explicitement,
  // dans un seul objet — que l'elagage retire entierement quand personne ne
  // l'importe.
  lines.push(
    "/** Nom d'origine de chaque icone, indexe par son identifiant. */",
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

/** Ce que le catalogue retient d'un jeu : ses noms, jamais ses traces. */
interface CataloguePack {
  readonly title: string
  readonly summary: string
  readonly mode: 'trait' | 'plein'
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

  console.log(`${pack.module.padEnd(10)} ${String(icons.length).padStart(5)} icones`)
}

// Le catalogue sert la recherche de la documentation : elle a besoin des noms,
// jamais des traces.
await writeFile(
  join('src', 'catalogue.json'),
  `${JSON.stringify(catalogue, null, 2)}\n`,
  'utf8',
)

const total = Object.values(catalogue).reduce((sum, pack) => sum + pack.names.length, 0)
console.log(`\n${String(total)} icones dans ${String(PACKS.length)} jeux.`)
