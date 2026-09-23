#!/usr/bin/env node
/**
 * Publishes the documentation and the delivered projects for machines.
 *
 * ## Why a separate set of files, when the site already has the content
 *
 * The site is an application: its prose lives in components, its navigation in
 * a router, its code samples behind a tab that has to be clicked. A model
 * reading it gets the markup of a shell and very little of what the shell
 * frames. What it needs is the opposite — no chrome, one address, plain text.
 *
 * ## Why `.txt` and not `.md`
 *
 * The server hands `.md` back as `application/octet-stream`. A browser
 * downloads it instead of showing it, and a fetcher that checks the type
 * refuses it outright. `.txt` is served as `text/plain` without touching a
 * single line of server configuration — which is the whole reason the
 * convention settled on that extension.
 *
 * The content is still Markdown. Only the extension gives way.
 *
 * ## What gets written
 *
 * - `llms.txt` — the index. What this is, and where everything lives.
 * - `llms-full.txt` — the whole prose documentation, in one file.
 * - `llms/templates/<name>.txt` — one delivered project, file by file, with
 *   its source. Twelve of them, from a few hundred kilobytes to a few
 *   megabytes.
 *
 * ## Why the projects are not in one file
 *
 * Together they weigh several megabytes of source. A single file would be
 * refused by most of what would read it, and a model that wants `nocturne`
 * has no use for the eleven others. One file per project, and an index that
 * says what each one holds.
 *
 * Usage:
 *
 *     node scripts/build-llms.mjs
 *
 * @module
 */

import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = join(ROOT, 'docs')
const EXPORTS = join(ROOT, 'playground', 'public', 'exports', 'projets')
const OUT = join(ROOT, 'playground', 'public')
const SITE = 'https://odoro.dev'

/** The order the prose reads in, rather than the order the disk returns. */
const ORDRE = [
  ['engine.md', 'Moteur', 'La chaine de construction : create, dev, build, preview, configuration, greffons.'],
  ['styles.md', 'Styles', 'Le generateur d utilitaires depuis les jetons, et ce qu il ne produit pas.'],
  ['ui.md', 'Interface', 'Les vingt-neuf primitives, leur contrat et leur accessibilite.'],
  ['router.md', 'Routeur', 'Correspondance de chemins, navigation, transitions de vue.'],
  ['motion.md', 'Mouvement', 'Le moteur : une horloge, une politique de mouvement, un arbitrage de surfaces.'],
  ['registre.md', 'Registre', 'Les pieces animees, et la commande qui les copie chez soi.'],
  ['prompt-generation.md', 'Generation', 'Ce qu on donne a un modele pour qu il produise une page qui tienne.'],
]

/** A weight, as one announces it. */
function poids(octets) {
  if (octets < 1024) return `${String(octets)} o`
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} ko`
  return `${(octets / 1024 / 1024).toFixed(1)} Mo`
}

/* ======================== La documentation, en un fichier ================ */

rmSync(join(OUT, 'llms'), { recursive: true, force: true })

const chapitres = []
for (const [fichier, titre, resume] of ORDRE) {
  const chemin = join(DOCS, fichier)
  let texte
  try {
    texte = readFileSync(chemin, 'utf8')
  } catch {
    console.warn(`  absent, ignore : docs/${fichier}`)
    continue
  }

  // Le titre de premier niveau du fichier devient un titre de second : le
  // document complet n en a qu un, sinon rien ne dit ou il commence.
  const corps = texte.replace(/^# /m, '## ').trimEnd()
  chapitres.push({ titre, resume, corps, fichier })
}

const complet = [
  '# Odoro — documentation complete',
  '',
  '> Une chaine d outils front-end maison : un moteur de construction, une',
  '> bibliotheque de vingt-neuf primitives, un registre de pieces animees, et',
  '> douze projets livres dont le code entier est publie.',
  '',
  `> Genere le ${new Date().toISOString().slice(0, 10)} depuis le depot.`,
  '> La prose est en francais ; le code et les identifiants sont en anglais.',
  '',
  '---',
  '',
  ...chapitres.flatMap((c) => [c.corps, '', '---', '']),
].join('\n')

writeFileSync(join(OUT, 'llms-full.txt'), complet, 'utf8')

/*
 * Et un fichier par chapitre.
 *
 * Un index dont toutes les entrees menent au meme fichier n indexe rien : il
 * demande de tout telecharger pour lire un paragraphe. Chaque chapitre a donc
 * son adresse, et le fichier complet reste pour qui veut tout.
 */
const dossierDocs = join(OUT, 'llms', 'docs')
mkdirSync(dossierDocs, { recursive: true })
for (const chapitre of chapitres) {
  const nom = chapitre.fichier.replace(/\.md$/, '')
  writeFileSync(join(dossierDocs, `${nom}.txt`), `${chapitre.corps}\n`, 'utf8')
  chapitre.adresse = `${SITE}/llms/docs/${nom}.txt`
}
console.log(`  llms-full.txt          ${poids(Buffer.byteLength(complet))}  ${String(chapitres.length)} chapitres`)

/* ======================== Les projets, un par fichier ==================== */

const dossierProjets = join(OUT, 'llms', 'templates')
mkdirSync(dossierProjets, { recursive: true })

const projets = []
for (const entree of readdirSync(EXPORTS).filter((n) => n.endsWith('.json')).sort()) {
  const nom = entree.replace(/\.json$/, '')
  const contenu = JSON.parse(readFileSync(join(EXPORTS, entree), 'utf8'))
  const fichiers = contenu.files ?? []

  const lisibles = fichiers.filter((f) => f.code !== undefined)
  const muets = fichiers.filter((f) => f.code === undefined)

  const lignes = [
    `# ${nom} — code source complet`,
    '',
    `> ${String(fichiers.length)} fichiers, dont ${String(lisibles.length)} qui se lisent.`,
    '> Les autres — images, videos, polices — sont listes avec leur poids : un',
    '> projet se comprend a sa forme autant qu a ses lignes.',
    '',
    '## Arborescence',
    '',
    '```',
    ...fichiers.map((f) =>
      f.code === undefined ? `${f.path}  (${poids(f.bytes ?? 0)})` : f.path,
    ),
    '```',
    '',
  ]

  for (const fichier of lisibles) {
    const extension = fichier.path.includes('.')
      ? fichier.path.slice(fichier.path.lastIndexOf('.') + 1)
      : 'txt'
    lignes.push(`## ${fichier.path}`, '', '```' + extension, fichier.code, '```', '')
  }

  if (muets.length > 0) {
    lignes.push(
      '## Ce qui ne se lit pas',
      '',
      ...muets.map((f) => `- \`${f.path}\` — ${poids(f.bytes ?? 0)}`),
      '',
    )
  }

  const texte = lignes.join('\n')
  writeFileSync(join(dossierProjets, `${nom}.txt`), texte, 'utf8')
  projets.push({
    nom,
    fichiers: fichiers.length,
    lisibles: lisibles.length,
    taille: Buffer.byteLength(texte),
  })
}

for (const p of projets) {
  console.log(
    `  llms/templates/${p.nom.padEnd(10)} ${poids(p.taille).padStart(7)}  ` +
      `${String(p.fichiers)} fichiers, ${String(p.lisibles)} lus`,
  )
}

/* ======================== L index ======================================== */

const index = [
  '# Odoro',
  '',
  '> Une chaine d outils front-end maison : un moteur de construction sans',
  '> configuration, une bibliotheque de vingt-neuf primitives, un registre de',
  '> pieces animees qu on copie chez soi, et douze projets livres complets.',
  '> Tout est en TypeScript, sans dependance externe au rendu.',
  '',
  '> La prose est en francais. Le code, les identifiants et les messages de',
  '> commande sont en anglais.',
  '',
  '## Documentation',
  '',
  ...chapitres.map((c) => `- [${c.titre}](${c.adresse}): ${c.resume}`),
  '',
  '## Tout en un',
  '',
  `- [Documentation complete](${SITE}/llms-full.txt): les ${String(chapitres.length)} chapitres ci-dessus dans un seul fichier, ${poids(Buffer.byteLength(complet))}.`,
  '',
  '## Projets livres, code source complet',
  '',
  '> Chaque projet se clone et tourne. Le fichier donne son arborescence entiere',
  '> puis le contenu de chaque fichier qui se lit.',
  '',
  ...projets.map(
    (p) =>
      `- [${p.nom}](${SITE}/llms/templates/${p.nom}.txt): ${String(p.fichiers)} fichiers dont ${String(p.lisibles)} lus, ${poids(p.taille)}.`,
  ),
  '',
  '## Ailleurs',
  '',
  `- [Le registre, en JSON](${SITE}/registre/index.json): les pieces animees, leur source et leurs dependances.`,
  `- [Le depot](https://github.com/ODORO-CLI/OdoroKit): tout ce qui precede, a sa source.`,
  '',
].join('\n')

writeFileSync(join(OUT, 'llms.txt'), index, 'utf8')

const total =
  projets.reduce((somme, p) => somme + p.taille, 0) +
  Buffer.byteLength(complet) +
  Buffer.byteLength(index)

console.log(`  llms.txt               ${poids(Buffer.byteLength(index))}`)

// L index, le document complet, un fichier par chapitre, un par projet.
const combien = 2 + chapitres.length + projets.length
console.log(`\n${String(combien)} fichiers publies pour les machines — ${poids(total)}.`)

// Une verification qui vaut mieux qu une confiance : le dossier existe-t-il
// vraiment, et pese-t-il ce qu on vient d annoncer ?
const mesure = statSync(join(OUT, 'llms.txt'))
if (mesure.size === 0) {
  console.error('llms.txt est vide.')
  process.exit(1)
}
