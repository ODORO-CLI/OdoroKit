#!/usr/bin/env node
/**
 * Turns every showcase into a project that runs on its own.
 *
 * ## What a showcase is, before this script
 *
 * A showcase lives in the documentation: one file under
 * `playground/src/docs/vitrines/`, leaning on a shared kit and on registry
 * pieces copied into `playground/src/odoro/`. It is a page of a site that is
 * not the visitor's. Looking at it answers "what does this look like"; it
 * answers nothing about "how do I get it".
 *
 * ## What it is afterwards
 *
 * A folder that installs and starts: `npm install`, `npm run dev`. Nothing in
 * it points back here — the kit, the registry pieces and the photographs it
 * uses travel with it, and the packages it needs are the published ones.
 *
 * ## The three outputs, and who reads them
 *
 * - `<slug>.zip` — the project, downloadable. Read by a person.
 * - `<slug>.json` — the same files as text, minus the photographs. Read by the
 *   code panel of the site, which never downloads the archive to show a file.
 * - `exports.generated.ts` — weights and counts only. Read at build time, so
 *   the panel can announce the size of the archive before fetching anything.
 *
 * ## The delivered projects
 *
 * `templates/` holds five complete projects, each with its own toolchain. They
 * are not showcases and have no module graph to follow: what makes them run is
 * the folder, whole. They get an archive of that folder — everything but what
 * a build produces — and nothing else. Their code is read on GitHub, where a
 * two-hundred-and-seventy-file Next application is easier to read than in a
 * panel.
 *
 * ## How the file list is found
 *
 * By following the imports, not by listing a directory. A showcase that stops
 * using a registry piece stops shipping it the next time this runs, with
 * nothing to remember to remove. Only relative specifiers and the `@/` alias
 * are followed: `@odoro-cli/*`, `react` and the rest are dependencies, and
 * they are declared as such.
 *
 * Usage:
 *
 *     node scripts/build-vitrine-exports.mjs [--only <slug>]
 *
 * @module
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, posix, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createZip } from './lib/zip.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PLAYGROUND = join(ROOT, 'playground')
const SOURCE = join(PLAYGROUND, 'src')
const SHOWCASES = join(SOURCE, 'docs', 'vitrines')
const PHOTOS = join(PLAYGROUND, 'public', 'vitrines', 'photos')
const OUT = join(PLAYGROUND, 'public', 'exports', 'vitrines')
const PROJECTS = join(ROOT, 'templates')
const OUT_PROJECTS = join(PLAYGROUND, 'public', 'exports', 'projets')
const CATALOGUE = join(SOURCE, 'docs', 'exports.generated.ts')

/** The repository the "view on GitHub" links point into. */
const REPOSITORY = 'https://github.com/ODORO-CLI/OdoroKit'

/**
 * Versions the exported project asks for.
 *
 * Read from the workspace rather than written here: a template that installs
 * a version the engine no longer understands is worse than no template.
 */
function familyVersions() {
  const read = (name) =>
    JSON.parse(readFileSync(join(ROOT, 'packages', name, 'package.json'), 'utf8')).version
  return {
    odoro: `^${read('odoro')}`,
    '@odoro-cli/libs': `^${read('odoro-libs')}`,
    '@odoro-cli/icons': `^${read('odoro-icons')}`,
    '@odoro-cli/engine': `^${read('odoro-engine')}`,
  }
}

/* ============================ Resolving imports ========================= */

/** Suffixes tried, in order, for a specifier that names no file. */
const SUFFIXES = ['', '.ts', '.tsx', '/index.ts', '/index.tsx']

/**
 * The file a specifier names, or `null` when it names a package.
 *
 * TypeScript source is written with the extension of the **output** — `.js`
 * for `.ts`, `.jsx` for `.tsx` — which is correct and resolves to nothing on
 * disk. The mapping back is the first thing this has to undo.
 */
function resolveImport(specifier, fromFile) {
  let target
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    target = resolve(dirname(fromFile), specifier)
  } else if (specifier.startsWith('@/')) {
    target = join(SOURCE, specifier.slice(2))
  } else {
    return null
  }

  const undone = target.replace(/\.jsx$/, '.tsx').replace(/\.js$/, '.ts')
  for (const candidate of [undone, target]) {
    for (const suffix of SUFFIXES) {
      const path = candidate + suffix
      if (existsSync(path) && statSync(path).isFile()) return path
    }
  }
  return null
}

/** Every `from '...'` and `import('...')` of a source file. */
function specifiersOf(code) {
  const found = new Set()
  for (const match of code.matchAll(/from\s+'([^']+)'/g)) found.add(match[1])
  for (const match of code.matchAll(/import\('([^']+)'\)/g)) found.add(match[1])
  return [...found]
}

/**
 * Walks the imports from one file and returns every local file reached.
 *
 * @param entry Absolute path of the starting file.
 * @returns The absolute paths, the starting file included.
 */
function moduleGraph(entry) {
  const seen = new Set()
  const queue = [entry]

  while (queue.length > 0) {
    const file = queue.pop()
    if (seen.has(file)) continue
    seen.add(file)

    const code = readFileSync(file, 'utf8')
    for (const specifier of specifiersOf(code)) {
      const resolved = resolveImport(specifier, file)
      if (resolved !== null && !seen.has(resolved)) queue.push(resolved)
    }
  }

  return [...seen]
}

/* ============================ The photographs =========================== */

/** The seeds `media.ts` knows how to serve. */
const AVAILABLE_PHOTOS = new Set(
  existsSync(PHOTOS)
    ? readdirSync(PHOTOS)
        .filter((name) => name.endsWith('.jpg'))
        .map((name) => name.slice(0, -4))
    : [],
)

/**
 * The seeds `media.ts` answers with a monogram rather than a file.
 *
 * They are the faces. Two of them happen to also name a file on disk, which is
 * enough for a purely textual scan to ship a photograph the page never asks
 * for.
 */
const MONOGRAMS = (() => {
  const code = readFileSync(join(SHOWCASES, 'media.ts'), 'utf8')
  const block = /VISAGES: ReadonlySet<string> = new Set\(\[([\s\S]*?)\]\)/.exec(code)
  if (block === null) return new Set()
  return new Set([...block[1].matchAll(/'([^']+)'/g)].map((match) => match[1]))
})()

/**
 * The photographs a set of files can ask for.
 *
 * Fifty-eight of the seven hundred and eighty calls pass a variable rather
 * than a literal — a table of products, a loop over a list. Reading the first
 * argument would miss those and ship a page with holes in it.
 *
 * So every string literal of the file is compared to the names that exist. A
 * seed is a literal somewhere, even when the call site only sees a variable.
 * The approximation errs on the side of including one photograph too many,
 * which costs a few kilobytes; the other direction costs a broken page.
 *
 * `media.ts` is the one file left out of the scan. It is a **catalogue**: it
 * names every seed of every showcase, and reading it would have each export
 * carry the photographs of the ninety-nine others.
 */
function photographsOf(files) {
  const used = new Set()
  for (const file of files) {
    if (file === join(SHOWCASES, 'media.ts')) continue
    const code = readFileSync(file, 'utf8')
    for (const match of code.matchAll(/'([a-z0-9-]{3,})'/g)) {
      if (AVAILABLE_PHOTOS.has(match[1]) && !MONOGRAMS.has(match[1])) used.add(match[1])
    }
  }
  return [...used].sort()
}

/* ============================ The showcases ============================= */

/** What the index says about each showcase. */
function readShowcases() {
  const code = readFileSync(join(SHOWCASES, 'index.ts'), 'utf8')
  const blocks = [
    ...code.matchAll(
      /slug: '([^']+)',[\s\S]*?titre: '([^']*)',\s*\n\s*metier: '([^']*)',[\s\S]*?charger: \(\) => import\('\.\/([^']+)\.jsx'\)/g,
    ),
  ]

  return blocks.map(([, slug, title, trade, module]) => ({
    slug,
    title,
    trade,
    entry: join(SHOWCASES, `${module}.tsx`),
  }))
}

/* ============================ The scaffold ============================== */

/** Escapes a string for a single-quoted TypeScript literal. */
function quote(text) {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

/**
 * The palette tokens a showcase starts from.
 *
 * They are written in the index, as three token names. The exported project
 * has to resolve them the same way the site does, which is why they are read
 * here and handed to the generated `App.tsx`.
 */
function paletteOf(slug) {
  const code = readFileSync(join(SHOWCASES, 'index.ts'), 'utf8')
  const block = new RegExp(`slug: '${slug}',[\\s\\S]*?palette: \\[([^\\]]+)\\]`).exec(
    code,
  )
  if (block === null)
    return ['--o-palette-zinc-500', '--o-palette-zinc-900', '--o-palette-zinc-100']
  return [...block[1].matchAll(/'([^']+)'/g)].map((match) => match[1])
}

/** `src/App.tsx` of the exported project. */
function appSource(showcase, palette) {
  const tokens = palette.map(quote).join(', ')
  return `/**
 * Le montage de la vitrine.
 *
 * ## Pourquoi la palette est resolue ici
 *
 * Une vitrine n ecrit jamais sa couleur en dur : elle lit les variables
 * \`--o-vitrine-*\`. Celles-ci sont calculees a partir de trois couleurs en
 * hexadecimal — et la vitrine annonce les siennes sous forme de jetons du
 * systeme, ecrits en \`oklch\`. Il faut donc le document pour les resoudre, et
 * un effet plutot qu une valeur initiale.
 *
 * Remplacer les trois valeurs de \`TEINTES\` par des couleurs \`#rrggbb\`
 * repeint la page entiere, sans toucher a une seule ligne de la vitrine.
 *
 * @module
 */

import { useEffect, useState, type ReactElement } from 'react'

import Vitrine from '@/vitrine/${showcase.slug}.jsx'
import { couleursDeJetons, variablesDePalette, type Couleurs } from '@/vitrine/palettes.js'

/** Les trois teintes de depart : accent, couleur seconde, couleur tierce. */
const TEINTES: readonly string[] = [${tokens}]

export function App(): ReactElement {
  const [couleurs, setCouleurs] = useState<Couleurs>(['#888888', '#888888', '#888888'])

  useEffect(() => {
    setCouleurs(couleursDeJetons(TEINTES))
  }, [])

  return (
    <div style={variablesDePalette(couleurs)}>
      <Vitrine />
    </div>
  )
}
`
}

/** `src/main.tsx` of the exported project. */
const MAIN_SOURCE = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { OdoroEngine } from '@odoro-cli/engine'

import { App } from '@/App'
import { poserChrome } from '@/vitrine/chrome.js'

import '@odoro-cli/libs/styles.css'
import '@/styles.css'

// Rien au-dessus de la page : elle occupe l ecran entier.
//
// Dans la documentation d ou vient cette vitrine, deux barres tiennent le haut
// de l ecran et la page leur reserve leur place. Ici il n y en a pas, et sans
// cette ligne une bande vide resterait au-dessus du premier ecran.
//
// A poser avant le rendu : les pleines hauteurs sont calculees pendant celui-ci.
poserChrome(0)

const racine = document.getElementById('root')
if (racine === null) {
  throw new Error('Element racine "#root" absent de index.html.')
}

// Le moteur enveloppe la page : les fonds et les effets s abonnent a une
// boucle reelle, et l arbitre limite le nombre de surfaces graphiques vivantes
// — deux, au-dela le navigateur en detruit une sans prevenir.
createRoot(racine).render(
  <StrictMode>
    <OdoroEngine quality="auto" reducedMotion="respect" maxSurfaces={2}>
      <App />
    </OdoroEngine>
  </StrictMode>,
)
`

/** `src/styles.css` of the exported project. */
const STYLES_SOURCE = `/* Les styles du projet.

   Tout le reste vient des jetons d Odoro : redefinir une variable ici reteinte
   l ensemble, les composants de la librairie compris. La vitrine, elle, lit
   les variables --o-vitrine-*, posees par src/App.tsx. */

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
}
`

/** `tsconfig.json` of the exported project. */
const TSCONFIG_SOURCE = `${JSON.stringify(
  {
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2023', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      moduleResolution: 'bundler',
      moduleDetection: 'force',
      jsx: 'react-jsx',
      resolveJsonModule: true,
      isolatedModules: true,
      verbatimModuleSyntax: true,
      noEmit: true,
      strict: true,
      noUncheckedIndexedAccess: true,
      noFallthroughCasesInSwitch: true,
      skipLibCheck: true,
      paths: { '@/*': ['./src/*'] },
    },
    include: ['src', 'odoro.config.ts'],
  },
  null,
  2,
)}\n`

/** `odoro.config.ts` of the exported project. */
const CONFIG_SOURCE = `import { defineConfig } from 'odoro'

export default defineConfig({
  alias: {
    '@': 'src',
  },
  server: {
    port: 5173,
  },
})
`

/** `index.html` of the exported project. */
function htmlSource(showcase) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${showcase.trade} — ${showcase.title}" />
    <title>${showcase.title}</title>
    <script>
      // Applique le theme memorise avant la premiere peinture : sans cela, un
      // visiteur en theme force verrait un eclair de l autre theme.
      try {
        var theme = localStorage.getItem('odoro-theme')
        if (theme === 'light' || theme === 'dark')
          document.documentElement.dataset.theme = theme
      } catch (error) {}
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
}

/** `README.md` of the exported project. */
function readmeSource(showcase, pieces, photographs) {
  const registry = pieces.map((path) => `  - \`${path}\``).join('\n')

  return `# ${showcase.title}

${showcase.trade}. Vitrine exportee depuis la documentation d Odoro.

## Demarrer

\`\`\`sh
npm install
npm run dev
\`\`\`

La page s ouvre sur le port 5173. \`npm run build\` produit \`dist/\`, que
n importe quel hebergement statique sert sans configuration.

## Ce que contient le dossier

\`\`\`
index.html          Le document et le point d entree.
odoro.config.ts     La configuration du moteur : alias, port, compilation.
src/
  main.tsx          Le montage React et les feuilles de style.
  App.tsx           La palette de la vitrine, resolue puis posee.
  styles.css        Les styles du projet.
  vitrine/          La page et sa trousse : marche, scene, communs, palettes.
  odoro/            Les pieces du registre employees${photographs.length > 0 ? '.' : '.'}
public/
  vitrines/photos/  Les ${String(photographs.length)} photographies de la page.
\`\`\`

## Les pieces du registre

Elles sont recopiees dans \`src/odoro/\` : le code vous appartient, modifiez-le.
Les memes s installent dans un projet neuf avec \`odoro add\`.

${registry === '' ? '  _Aucune._' : registry}

## Reteinter

\`TEINTES\`, en tete de \`src/App.tsx\`, porte les trois couleurs de depart. Les
remplacer par trois valeurs hexadecimales repeint la page entiere — la vitrine
n ecrit sa couleur nulle part en dur.

## Les photographies

Elles viennent de Wikimedia Commons, libres de droits, usage commercial et
modification admis. Les mentions d attribution vivent dans
\`public/vitrines/credits.json\`. Les visages sont des monogrammes construits a
l execution : les personnes citees sont inventees, et preter le visage d une
personne reelle a quelqu un qui n existe pas n est pas une question de licence.

## Licence

Voir \`LICENSE\`.
`
}

/** `.gitignore` of the exported project. */
const GITIGNORE_SOURCE = `node_modules/
dist/
.env
.env.*
!.env.example
*.log
.DS_Store
`

/* ============================ Building one ============================== */

/**
 * Builds the export of one showcase.
 *
 * @returns The textual files, the photographs, and the archive.
 */
function buildExport(showcase) {
  const graph = moduleGraph(showcase.entry)

  const kit = []
  const pieces = []
  for (const file of graph) {
    const path = relative(SOURCE, file).split('\\').join('/')
    if (path.startsWith('docs/vitrines/')) kit.push({ file, path })
    else if (path.startsWith('odoro/')) pieces.push({ file, path })
    else {
      throw new Error(
        `${showcase.slug}: ${path} is reached by the imports but belongs to neither the kit nor the registry. The export would not know where to put it.`,
      )
    }
  }

  const photographs = photographsOf(graph)
  const palette = paletteOf(showcase.slug)

  /** The textual files, at their place in the exported project. */
  const files = []
  const add = (path, code) => files.push({ path, code })

  for (const { file, path } of kit) {
    add(`src/vitrine/${path.slice('docs/vitrines/'.length)}`, readFileSync(file, 'utf8'))
  }
  for (const { file, path } of pieces) {
    add(`src/${path}`, readFileSync(file, 'utf8'))
  }

  add('src/main.tsx', MAIN_SOURCE)
  add('src/App.tsx', appSource(showcase, palette))
  add('src/styles.css', STYLES_SOURCE)
  add('src/odoro-env.d.ts', '/// <reference types="odoro/client" />\n')
  add('index.html', htmlSource(showcase))
  add('odoro.config.ts', CONFIG_SOURCE)
  add('tsconfig.json', TSCONFIG_SOURCE)
  add('.gitignore', GITIGNORE_SOURCE)
  add(
    'README.md',
    readmeSource(
      showcase,
      pieces.map(({ path }) => path.slice('odoro/'.length).replace(/\.tsx?$/, '')),
      photographs,
    ),
  )
  add('LICENSE', readFileSync(join(ROOT, 'LICENSE'), 'utf8'))

  const versions = familyVersions()
  add(
    'package.json',
    `${JSON.stringify(
      {
        name: `vitrine-${showcase.slug}`,
        private: true,
        version: '1.0.0',
        type: 'module',
        description: `${showcase.title} — ${showcase.trade}`,
        scripts: {
          dev: 'odoro dev',
          build: 'odoro build',
          preview: 'odoro preview',
          typecheck: 'tsc --noEmit',
        },
        dependencies: {
          '@odoro-cli/engine': versions['@odoro-cli/engine'],
          '@odoro-cli/icons': versions['@odoro-cli/icons'],
          '@odoro-cli/libs': versions['@odoro-cli/libs'],
          react: '^19.2.0',
          'react-dom': '^19.2.0',
        },
        devDependencies: {
          '@types/react': '^19.2.2',
          '@types/react-dom': '^19.2.1',
          odoro: versions.odoro,
          typescript: '^5.9.3',
        },
      },
      null,
      2,
    )}\n`,
  )

  files.sort((a, b) => a.path.localeCompare(b.path))

  /** The archive carries the same files, plus what is not text. */
  const entries = files.map(({ path, code }) => ({
    path: `${showcase.slug}/${path}`,
    data: code,
  }))
  for (const seed of photographs) {
    entries.push({
      path: `${showcase.slug}/public/vitrines/photos/${seed}.jpg`,
      data: readFileSync(join(PHOTOS, `${seed}.jpg`)),
    })
  }
  const credits = join(PLAYGROUND, 'public', 'vitrines', 'credits.json')
  if (photographs.length > 0 && existsSync(credits)) {
    entries.push({
      path: `${showcase.slug}/public/vitrines/credits.json`,
      data: readFileSync(credits),
    })
  }
  entries.sort((a, b) => a.path.localeCompare(b.path))

  return { files, photographs, zip: createZip(entries), pieces }
}

/* ============================ The delivered projects ==================== */

/**
 * What never enters the archive of a delivered project.
 *
 * Dependencies and build outputs rebuild themselves from what is next to them.
 * Shipping them would multiply the weight of the archive by twenty for files
 * the first `npm install` throws away.
 */
const NOT_SHIPPED = new Set(['node_modules', '.next', 'dist', '.turbo', '.git', 'out'])

/** Every file of a folder, minus what rebuilds itself. */
function filesOf(folder, prefix = '') {
  const found = []
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    if (NOT_SHIPPED.has(entry.name)) continue
    const path = prefix === '' ? entry.name : `${prefix}/${entry.name}`
    if (entry.isDirectory()) found.push(...filesOf(join(folder, entry.name), path))
    else if (entry.isFile()) found.push(path)
  }
  return found
}

/** Builds the archives of the delivered projects. */
function buildProjects() {
  const rows = {}
  if (!existsSync(PROJECTS)) return rows

  const names = readdirSync(PROJECTS, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() && existsSync(join(PROJECTS, entry.name, 'template.json')),
    )
    .map((entry) => entry.name)
    .sort()

  if (existsSync(OUT_PROJECTS)) rmSync(OUT_PROJECTS, { recursive: true })
  mkdirSync(OUT_PROJECTS, { recursive: true })

  for (const name of names) {
    const folder = join(PROJECTS, name)
    const paths = filesOf(folder).sort()
    const zip = createZip(
      paths.map((path) => ({
        path: `${name}/${path}`,
        data: readFileSync(join(folder, path)),
      })),
    )
    writeFileSync(join(OUT_PROJECTS, `${name}.zip`), zip)
    rows[name] = { zip: zip.length, files: paths.length }

    console.log(
      `  ${name.padEnd(22)} ${String(paths.length).padStart(3)} fichiers` +
        `${' '.repeat(28)}${(zip.length / 1024).toFixed(0).padStart(6)} ko`,
    )
  }

  return rows
}

/* ============================ Running =================================== */

const only = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1]
  : null

const showcases = readShowcases().filter((s) => only === null || s.slug === only)

if (showcases.length === 0) {
  console.error(
    only === null ? 'No showcase found in the index.' : `No showcase named "${only}".`,
  )
  process.exit(1)
}

// Rebuilt from nothing: a showcase that was renamed would otherwise leave its
// archive behind, downloadable and wrong.
if (only === null && existsSync(OUT)) rmSync(OUT, { recursive: true })
mkdirSync(OUT, { recursive: true })

const summary = {}
let totalZip = 0
let totalCode = 0

for (const showcase of showcases) {
  const { files, photographs, zip, pieces } = buildExport(showcase)

  const payload = `${JSON.stringify({
    slug: showcase.slug,
    title: showcase.title,
    trade: showcase.trade,
    source: `${REPOSITORY}/blob/main/playground/src/docs/vitrines/${showcase.slug}.tsx`,
    photographs: photographs.length,
    files,
  })}\n`

  writeFileSync(join(OUT, `${showcase.slug}.zip`), zip)
  writeFileSync(join(OUT, `${showcase.slug}.json`), payload)

  summary[showcase.slug] = {
    zip: zip.length,
    files: files.length,
    pieces: pieces.length,
    photographs: photographs.length,
  }
  totalZip += zip.length
  totalCode += payload.length

  console.log(
    `  ${showcase.slug.padEnd(22)} ${String(files.length).padStart(3)} fichiers  ` +
      `${String(pieces.length).padStart(2)} pieces  ${String(photographs.length).padStart(2)} photos  ` +
      `${(zip.length / 1024).toFixed(0).padStart(6)} ko`,
  )
}

// The delivered projects, and the catalogue, only on a full run: a `--only`
// pass would drop the ninety-nine others from it.
const projects = only === null ? buildProjects() : {}

if (only === null) {
  const rows = Object.entries(summary)
    .map(
      ([slug, row]) =>
        `  ${quote(slug)}: { zip: ${String(row.zip)}, files: ${String(row.files)}, ` +
        `pieces: ${String(row.pieces)}, photographies: ${String(row.photographs)} },`,
    )
    .join('\n')

  const projectRows = Object.entries(projects)
    .map(
      ([name, row]) =>
        `  ${quote(name)}: { zip: ${String(row.zip)}, files: ${String(row.files)} },`,
    )
    .join('\n')

  writeFileSync(
    CATALOGUE,
    `/* Genere par scripts/build-vitrine-exports.mjs. Ne pas editer a la main. */

/**
 * Le depot public, ecrit une seule fois.
 *
 * Les liens « voir sur GitHub » et l archive sortent de la meme generation :
 * une adresse recopiee a la main dans le site finirait par pointer ailleurs que
 * ce que l archive contient.
 */
export const DEPOT = ${quote(REPOSITORY)}

/** Ce que pese l export d une vitrine, et ce qu il contient. */
export interface ExportVitrine {
  /** Poids de l archive, en octets. */
  readonly zip: number
  /** Nombre de fichiers texte. */
  readonly files: number
  /** Nombre de pieces du registre recopiees. */
  readonly pieces: number
  /** Nombre de photographies embarquees. */
  readonly photographies: number
}

/**
 * Les exports, par segment d URL.
 *
 * Les poids sont releves a la generation : le panneau annonce la taille de
 * l archive sans rien telecharger.
 */
export const EXPORTS: Readonly<Record<string, ExportVitrine>> = {
${rows}
}

/** Ce que pese l archive d un projet livre. */
export interface ExportProjet {
  /** Poids de l archive, en octets. */
  readonly zip: number
  /** Nombre de fichiers, hors dependances et sorties de compilation. */
  readonly files: number
}

/**
 * Les projets livres, par nom de dossier.
 *
 * Ce sont les cinq projets complets de \`templates/\`, chacun avec sa
 * propre chaine. L archive porte le dossier entier moins ce qu une compilation
 * reconstruit : leur code se lit sur le depot, ou une application de deux cent
 * soixante-dix fichiers se parcourt mieux que dans un panneau.
 */
export const EXPORTS_PROJETS: Readonly<Record<string, ExportProjet>> = {
${projectRows}
}
`,
    'utf8',
  )
}

const totalProjects = Object.values(projects).reduce((somme, row) => somme + row.zip, 0)

console.log(
  `\n${String(showcases.length)} vitrine(s) — archives ${(totalZip / 1048576).toFixed(1)} Mo, ` +
    `code ${(totalCode / 1048576).toFixed(1)} Mo.`,
)
if (only === null) {
  console.log(
    `${String(Object.keys(projects).length)} projet(s) livre(s) — archives ` +
      `${(totalProjects / 1048576).toFixed(1)} Mo.`,
  )
}
console.log(`Ecrits dans ${posix.join('playground', 'public', 'exports')}.\n`)
