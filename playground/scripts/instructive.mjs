/**
 * Publie le pack de design comme documentation lisible par un modele.
 *
 * ## Ce que ce script fait, et ne fait pas
 *
 * Il **lit** `ODORO-Design-Pack/` et n en modifie jamais rien : c est la source
 * de verite des directives, et sa valeur tient a ce qu elle reste intacte. Il
 * ecrit uniquement sous `playground/public/instructive/`, qui est un artefact
 * regenerable et ignore par git.
 *
 * Il produit deux choses :
 *
 * 1. **Une copie servable** de chaque fichier, a son chemin d origine, sous
 *    `/instructive/llm/…`. Un modele peut ainsi ouvrir exactement le fichier
 *    dont il a besoin, sans avaler le reste.
 * 2. **Un document d entree**, `/instructive/llm.md`, qui explique ce qu est le
 *    pack, dans quel ordre le lire, et donne l adresse et le poids de chaque
 *    fichier.
 *
 * ## Pourquoi pas un seul fichier qui contiendrait tout
 *
 * Parce que le pack l interdit lui-meme. Son README ecrit noir sur blanc :
 * « Ne charge jamais `reference/ODORO-Documentation-Complete.md` d un bloc
 * (≈ 450 000 tokens) ; ouvre-le seulement par recherche ciblee. » Ce seul
 * fichier pese 1,8 Mo, soit les deux tiers du pack. Un bundle unique serait
 * donc un document que personne ne peut lire — contraire a la consigne, et
 * inutilisable en pratique.
 *
 * Le document d entree porte donc l index et les consignes ; le corps reste
 * fragmente, et chaque fragment a son adresse.
 *
 * @module
 */

import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { bride } from './brider.mjs'

const ICI = dirname(fileURLToPath(import.meta.url))
const RACINE = resolve(ICI, '..', '..')
const PACK = join(RACINE, 'ODORO-Design-Pack')
const SORTIE = join(RACINE, 'playground', 'public', 'instructive')
const ARBRE = join(SORTIE, 'llm')

/** Adresse publique de la racine du pack. */
const BASE = '/instructive/llm'

/**
 * Ce que chaque dossier apporte, en une ligne.
 *
 * Ecrit ici plutot que devine : un modele qui arrive sur l index doit savoir
 * quoi ouvrir avant d ouvrir quoi que ce soit.
 */
const ROLES = {
  'prompts': 'Le texte injecte dans les appels au modele. La doctrine, puis un fichier par etape.',
  'schemas': 'Les JSON Schema des sorties attendues, pour les sorties structurees.',
  'data': 'La bibliotheque : compositions, styles, palettes, typographies, jetons.',
  'runtime': 'Le code embarque dans chaque site produit : moteur d animation et jetons.',
  'eval': 'Le controle automatique d une page produite.',
  'examples': 'La reference de ce qui est attendu : un plan valide et la page qui en sort.',
  'reference': "Les textes sources de la doctrine. Jamais injectes tels quels.",
}

/** Les fichiers qu on ne lit pas comme du texte. */
const BINAIRES = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.ico', '.woff', '.woff2'])

/** L extension d un chemin, point compris et en minuscules. */
function extension(chemin) {
  const point = chemin.lastIndexOf('.')
  const barre = Math.max(chemin.lastIndexOf('/'), chemin.lastIndexOf('\\'))
  return point > barre ? chemin.slice(point).toLowerCase() : ''
}

/** Tous les fichiers d un dossier, en chemins relatifs et en ordre stable. */
async function parcourir(racine, prefixe = '') {
  const entrees = await readdir(join(racine, prefixe), { withFileTypes: true })
  const fichiers = []
  for (const entree of entrees.sort((a, b) => a.name.localeCompare(b.name))) {
    const chemin = prefixe === '' ? entree.name : `${prefixe}/${entree.name}`
    if (entree.isDirectory()) fichiers.push(...(await parcourir(racine, chemin)))
    else fichiers.push(chemin)
  }
  return fichiers
}

/**
 * Une estimation du cout en tokens d un fichier.
 *
 * Quatre octets par token est l ordre de grandeur admis pour du texte latin.
 * On ne cherche pas la precision : on cherche a dire « celui-ci tient dans une
 * fenetre, celui-la non ».
 */
function tokens(octets) {
  const n = Math.round(octets / 4)
  if (n >= 1000) return `~${String(Math.round(n / 1000))} k`
  return `~${String(n)}`
}

/** Un poids lisible. */
function poids(octets) {
  if (octets >= 1024 * 1024) return `${(octets / (1024 * 1024)).toFixed(1)} Mo`
  if (octets >= 1024) return `${String(Math.round(octets / 1024))} Ko`
  return `${String(octets)} o`
}

/** Le titre d un fichier Markdown, ou son nom a defaut. */
async function titre(fichier, chemin) {
  if (extension(chemin) !== '.md') return ''
  const texte = await readFile(fichier, 'utf8')
  const ligne = texte.split('\n').find((l) => l.startsWith('# '))
  return ligne === undefined ? '' : ligne.slice(2).trim()
}

const fichiers = await parcourir(PACK)

// L arbre est reconstruit a chaque passage : un fichier retire du pack ne doit
// pas survivre dans ce qui est servi.
await rm(SORTIE, { recursive: true, force: true })
await mkdir(ARBRE, { recursive: true })

// Les classes que la librairie produit vraiment. Le bridage s y mesure : une
// classe traduite qui n existerait pas ne peindrait rien, et ne leverait rien.
const CLASSES = new Set(
  [
    ...(await readFile(
      join(RACINE, 'packages', 'odoro-libs', 'src', 'styles', 'generated', 'classNames.ts'),
      'utf8',
    )).matchAll(/'([^']+)'/g),
  ].map((m) => m[1]),
)

const inconnues = new Set()
let brides = 0

for (const chemin of fichiers) {
  const source = join(PACK, chemin)
  const cible = join(ARBRE, chemin)
  await mkdir(dirname(cible), { recursive: true })
  if (BINAIRES.has(extension(chemin))) {
    await writeFile(cible, await readFile(source))
    continue
  }
  const avant = await readFile(source, 'utf8')
  const apres = bride(chemin, avant, CLASSES, inconnues)
  if (apres !== avant) brides += 1
  await writeFile(cible, apres, 'utf8')
}

/** Les fichiers groupes par dossier de premier niveau. */
const groupes = new Map()
for (const chemin of fichiers) {
  const barre = chemin.indexOf('/')
  const groupe = barre === -1 ? '.' : chemin.slice(0, barre)
  if (!groupes.has(groupe)) groupes.set(groupe, [])
  groupes.get(groupe).push(chemin)
}

const lignes = []
const ordre = ['.', 'prompts', 'schemas', 'data', 'runtime', 'eval', 'examples', 'reference']
let totalTexte = 0

for (const groupe of ordre) {
  const membres = groupes.get(groupe)
  if (membres === undefined) continue
  if (groupe !== '.') {
    lignes.push('', `### ${groupe}/`, '', ROLES[groupe] ?? '', '')
  } else {
    lignes.push('', '### A la racine', '')
  }
  lignes.push('| Fichier | Adresse | Poids | Tokens |', '| --- | --- | --- | --- |')
  for (const chemin of membres) {
    const infos = await stat(join(PACK, chemin))
    const binaire = BINAIRES.has(extension(chemin))
    if (!binaire) totalTexte += infos.size
    const nom = await titre(join(PACK, chemin), chemin)
    const etiquette = nom === '' ? `\`${chemin}\`` : `\`${chemin}\`<br>${nom}`
    lignes.push(
      `| ${etiquette} | [${BASE}/${chemin}](${BASE}/${chemin}) | ${poids(infos.size)} | ${binaire ? 'image' : tokens(infos.size)} |`,
    )
  }
}

const readme = await readFile(join(PACK, 'README.md'), 'utf8')
const lourds = []
for (const chemin of fichiers) {
  const infos = await stat(join(PACK, chemin))
  if (!BINAIRES.has(extension(chemin)) && infos.size > 300_000) {
    lourds.push(`- \`${chemin}\` — ${poids(infos.size)}, ${tokens(infos.size)} tokens`)
  }
}

const document = `# ODORO — directives de conception, pour un modele

Ce document est le point d entree du **ODORO Design Pack** : la methode, les
donnees et les consignes qui permettent de construire un site avec notre pile.
Il est servi tel quel, sans mise en page, pour etre lu par un modele.

Tout le pack est accessible sous \`${BASE}/\`, chaque fichier a son chemin
d origine. Rien n est reecrit : ce que vous lisez ici est le contenu du dossier
\`ODORO-Design-Pack/\` du depot, a l octet pres.

## Comment lire ce pack

1. **Commencez par la doctrine** : [\`${BASE}/prompts/00-system-core.md\`](${BASE}/prompts/00-system-core.md).
   C est le socle commun a tous les appels.
2. **Puis l etape qui vous concerne** : le planificateur, le constructeur de
   section ou le relecteur, dans \`prompts/\`.
3. **Ouvrez les donnees a la demande** : \`data/\` porte les compositions, les
   styles, les palettes et les typographies. L index des compositions
   ([\`compositions.index.json\`](${BASE}/data/compositions.index.json)) suffit
   pour planifier ; la version complete ne sert qu au moment de construire.
4. **Verifiez contre l exemple** : [\`${BASE}/examples/odoro-architecture.html\`](${BASE}/examples/odoro-architecture.html)
   est une page qui respecte le contrat, et son plan est a cote.

## Ce qu il ne faut pas charger d un bloc

Le pack contient des fichiers trop volumineux pour une fenetre de contexte. Ne
les lisez que par recherche ciblee :

${lourds.join('\n')}

Le README du pack est explicite sur le plus gros : « Ne charge jamais
\`reference/ODORO-Documentation-Complete.md\` d un bloc ; ouvre-le seulement par
recherche ciblee. »

## Inventaire complet

${fichiers.length} fichiers, ${poids(totalTexte)} de texte hors images.
${lignes.join('\n')}

---

# Le README du pack, en entier

Ce qui suit est le contenu de [\`${BASE}/README.md\`](${BASE}/README.md), repris
ici pour qu un modele qui ne lit que cette page ait deja la methode complete.

${readme}
`

await writeFile(join(SORTIE, 'llm.md'), document, 'utf8')
// La meme chose sous l arbre, pour qui demande le dossier plutot que le fichier.
await writeFile(join(ARBRE, 'index.md'), document, 'utf8')

const copies = await parcourir(ARBRE)
console.log(
  `[instructive] ${String(copies.length)} fichiers publies sous ${relative(RACINE, ARBRE)}`,
)
console.log(`[instructive] ${String(brides)} fichiers brides sur la pile ODORO`)
if (inconnues.size > 0) {
  console.warn(
    `[instructive] ${String(inconnues.size)} traductions sans cible, laissees telles quelles :`,
  )
  for (const t of [...inconnues].sort().slice(0, 25)) console.warn(`    ${t}`)
}
console.log(`[instructive] document d entree : ${relative(RACINE, join(SORTIE, 'llm.md'))}`)
