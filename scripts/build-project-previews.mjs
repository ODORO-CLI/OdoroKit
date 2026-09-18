#!/usr/bin/env node
/**
 * Prepares the delivered projects so the site can show them live.
 *
 * ## Why a copy, and not the build itself
 *
 * A delivered project is a whole application. It is built for its own origin,
 * so every asset it names starts at the root: `/assets/car-01.jpg`,
 * `/favicon.ico`, `/video/nuit.mp4`. Served under `/projets/nocturne/`, every
 * one of those misses.
 *
 * Nothing in the template is touched to fix that. A copy of its `dist/` is
 * made, and in the copy the root-absolute names are made relative — plus a
 * `<base>` so that a relative name resolves against the project's folder
 * rather than the page that frames it.
 *
 * ## Why the rewrite names what it rewrites
 *
 * `"/assets/` looks safe to replace everywhere. It is not: a minified bundle
 * holds strings that are not addresses, and one of them could start that way.
 * So the entries of the project's own `public/` are listed, plus `assets/`
 * which the build emits, and **only those names** are rewritten — at the start
 * of a string, in an attribute, or in a `url()`.
 *
 * ## Why module specifiers come first
 *
 * A specifier is not an address like the others: it resolves against the
 * **file** that writes it, not against the document, and a bare name like
 * `assets/chunk-X.js` is not a valid specifier — the browser refuses the
 * module and the page stays blank. `parfum`, which splits its bundle, stopped
 * there. They are therefore rewritten first, relative to the file.
 *
 * ## A template that has no build
 *
 * `sections` is a library of standalone HTML documents: no bundler, no `dist/`,
 * an `index.html` at its root and nothing to compile. It was therefore skipped,
 * and its page framed a document that did not exist — the documentation's own
 * 404, shown inside the documentation. Such a template is copied as it stands,
 * minus what never gets served.
 *
 * ## What is not copied
 *
 * The source maps. They are the heaviest thing in a build and nobody reads
 * them from a preview.
 *
 * Usage:
 *
 *     node scripts/build-project-previews.mjs
 *
 * @module
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(ROOT, 'templates')
const OUT = join(ROOT, 'playground', 'public', 'projets')

/** The file types whose text names an address. */
const TEXTE = new Set(['.html', '.css', '.js', '.mjs', '.json', '.webmanifest'])

/**
 * Un specificateur de module.
 *
 * Trois formes, et il les faut toutes : `from "/x"`, `import("/x")` — et
 * `import "/x"` sans parenthese, l import pour son seul effet de bord. La
 * derniere manquait, et `parfum` s arretait encore sur une ligne.
 *
 * L ordre de l alternance compte : la forme a parenthese doit passer avant la
 * forme nue, sinon la seconde la mange.
 */
const SPECIFICATEUR =
  /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(["'])\/([^"']+)\2/g

/**
 * The top-level names a project serves from its own root.
 *
 * `assets/` is emitted by the build; the rest is whatever the project put in
 * `public/`. Listing them makes the rewrite exact: nothing else is touched.
 */
function racines(template) {
  const noms = new Set(['assets'])
  const pub = join(template, 'public')
  if (existsSync(pub)) {
    for (const entree of readdirSync(pub)) noms.add(entree)
  }
  const dist = join(template, 'dist')
  if (existsSync(dist)) {
    for (const entree of readdirSync(dist)) {
      if (entree !== 'index.html') noms.add(entree)
    }
  }
  // Du plus long au plus court : `assets` ne doit pas manger `assets-source`.
  return [...noms].sort((a, b) => b.length - a.length)
}

/** Rewrites a bundle's module specifiers, relative to the file that holds them. */
function relativiserLesImports(texte, depuis) {
  return texte.replace(SPECIFICATEUR, (_, mot, guillemet, cible) => {
    let relatif = relative(depuis, cible).split(sep).join('/')
    if (!relatif.startsWith('.')) relatif = `./${relatif}`
    return `${mot}${guillemet}${relatif}${guillemet}`
  })
}

/**
 * Rewrites a stylesheet's `url()`, relative to the stylesheet.
 *
 * Un `url()` ne se resout pas contre le document mais contre la feuille qui
 * l ecrit. `url(/assets/3270.otf)`, rendu simplement relatif depuis une feuille
 * qui vit deja dans `assets/`, donnait `assets/assets/3270.otf` — cinq
 * gabarits perdaient leurs polices, et aucune erreur ne le disait : une police
 * absente se remplace en silence.
 */
function relativiserLesUrl(texte, depuis) {
  return texte.replace(
    /url\(\s*(["']?)\/([^"')]+)\1\s*\)/g,
    (_, guillemet, cible) => {
      let relatif = relative(depuis, cible).split(sep).join('/')
      if (relatif === '') relatif = '.'
      return `url(${guillemet}${relatif}${guillemet})`
    },
  )
}

/** Rewrites the root-absolute names of one file. */
function relativiser(texte, noms) {
  let sortie = texte
  for (const nom of noms) {
    const echappe = nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Au debut d une chaine, d un attribut, ou d un `url()`.
    sortie = sortie.replace(
      new RegExp(`(["'\`(])/(${echappe})(?=[/"'\`)?#])`, 'g'),
      (_, ouverture, cible) => `${ouverture}${cible}`,
    )
  }
  return sortie
}

/** Walks a folder and rewrites every text file in place. */
function parcourir(dossier, noms, racine) {
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, entree.name)
    if (entree.isDirectory()) {
      parcourir(chemin, noms, racine)
      continue
    }
    const type = extname(entree.name)
    if (!TEXTE.has(type)) continue

    const avant = readFileSync(chemin, 'utf8')
    const depuis = relative(racine, dirname(chemin)).split(sep).join('/')
    const etape =
      type === '.js' || type === '.mjs'
        ? relativiserLesImports(avant, depuis)
        : type === '.css'
          ? relativiserLesUrl(avant, depuis)
          : avant
    const apres = relativiser(etape, noms)
    if (apres !== avant) writeFileSync(chemin, apres, 'utf8')
  }
}

/**
 * Poses the `<base>` so a relative name resolves against the project folder.
 *
 * Without it the address `/projets/nocturne` — no trailing slash — would make
 * `assets/car-01.jpg` resolve to `/projets/assets/car-01.jpg`. The iframe is
 * given the slash, but a link shared by hand would not have it.
 */
function poserLaBase(fichier, nom) {
  const avant = readFileSync(fichier, 'utf8')
  if (avant.includes('<base ')) return
  writeFileSync(
    fichier,
    avant.replace(/<head>/, `<head>\n    <base href="/projets/${nom}/" />`),
    'utf8',
  )
}

/**
 * What never gets served, whatever the template.
 *
 * A template with no build is copied whole, and what a repository carries for
 * the person who clones it — its dependencies, its history, its card in the
 * catalogue — has no place behind an address.
 */
const HORS_COPIE = new Set([
  'node_modules',
  '.git',
  'dist',
  'preview.jpg',
  'template.json',
])

/**
 * The folder that holds what a template serves.
 *
 * A built template serves its `dist/`. A template that has nothing to build —
 * standalone HTML — serves itself.
 */
function servi(template) {
  return existsSync(join(template, 'dist', 'index.html'))
    ? join(template, 'dist')
    : template
}

/** The size of a folder, in bytes. */
function poids(dossier) {
  let total = 0
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, entree.name)
    total += entree.isDirectory() ? poids(chemin) : statSync(chemin).size
  }
  return total
}

/* ============================ Le travail ================================= */

const projets = readdirSync(SOURCE, { withFileTypes: true })
  .filter(
    (e) =>
      e.isDirectory() &&
      (existsSync(join(SOURCE, e.name, 'dist', 'index.html')) ||
        existsSync(join(SOURCE, e.name, 'index.html'))),
  )
  .map((e) => e.name)

if (projets.length === 0) {
  console.error('Aucun projet construit. Lancer `npm run build` dans templates/*.')
  process.exit(1)
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

let total = 0
for (const nom of projets) {
  const template = join(SOURCE, nom)
  const cible = join(OUT, nom)

  const source = servi(template)
  cpSync(source, cible, {
    recursive: true,
    filter: (chemin) => {
      if (chemin.endsWith('.map')) return false
      const nom = relative(source, chemin).split(sep)[0]
      return nom === undefined || !HORS_COPIE.has(nom)
    },
  })

  parcourir(cible, racines(template), cible)
  poserLaBase(join(cible, 'index.html'), nom)

  const taille = poids(cible)
  total += taille
  console.log(`  ${nom.padEnd(11)} ${(taille / 1024 / 1024).toFixed(1).padStart(6)} Mo`)
}

console.log(
  `\n${String(projets.length)} projet(s) prets a etre montres — ` +
    `${(total / 1024 / 1024).toFixed(1)} Mo.`,
)
