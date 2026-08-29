/**
 * Verifie que tout ce qui est publie figure dans la documentation.
 *
 * ## Pourquoi ce controle existe
 *
 * Un composant absent du site n'a pratiquement pas d'existence : personne ne
 * peut le decouvrir, et le seul moyen d'apprendre qu'il est la est de lire le
 * registre a la main. L'oubli ne casse rien, ne fait echouer aucun test, et se
 * remarque des mois plus tard — ou jamais.
 *
 * Trois inventaires sont compares a ce que le playground rend reellement :
 * les entrees du registre, les composants d'interface, et les pages declarees
 * dans la navigation.
 *
 * Usage :
 *
 *   node scripts/check-catalogue.mjs [url]
 *
 * Le serveur de developpement du playground doit tourner a cette adresse.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

/** Entrees du registre, lues dans l'arborescence source. */
function registryEntries() {
  const root = 'packages/odoro-bits/registry'
  const entries = []

  for (const category of readdirSync(root, { withFileTypes: true })) {
    if (!category.isDirectory()) continue
    for (const name of readdirSync(join(root, category.name), { withFileTypes: true })) {
      if (!name.isDirectory()) continue
      const meta = JSON.parse(
        readFileSync(join(root, category.name, name.name, 'meta.json'), 'utf8'),
      )
      entries.push({
        id: `${category.name}/${name.name}`,
        title: meta.title,
        // Le nom du composant installe : c'est lui qu'une page importe.
        component: (meta.files[0]?.target ?? '')
          .split('/')
          .pop()
          .replace(/\.tsx?$/, ''),
        category: category.name,
      })
    }
  }
  return entries
}

/** Composants exportes par la librairie d'interface. */
function uiComponents() {
  const source = readFileSync('packages/odoro-libs/src/ui/index.ts', 'utf8')
  return [...source.matchAll(/^\s*(?:export \{\s*)?([A-Z][A-Za-z]+),?$/gm)]
    .map((match) => match[1])
    .filter((name) => !name.endsWith('Props') && !name.endsWith('Option'))
    .concat(
      [...source.matchAll(/export \{ ([A-Z][A-Za-z]+)[,\s}]/g)].map((match) => match[1]),
    )
    .filter((name, index, all) => all.indexOf(name) === index)
    .sort()
}

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage()

await page.goto(`${base}/`, { waitUntil: 'networkidle' })
const paths = await page.evaluate(() =>
  [...document.querySelectorAll('nav[aria-label="Documentation"] a')].map(
    (a) => new URL(a.href).pathname,
  ),
)

/** Tout le texte rendu par la documentation, page par page. */
let corpus = ''
for (const path of paths) {
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(150)
  corpus += await page.evaluate(() => document.body.innerText)
}
await browser.close()

const lower = corpus.toLowerCase()
const missing = { registre: [], ui: [] }

for (const entry of registryEntries()) {
  // Une entree est consideree presente si son identifiant, son titre ou le nom
  // du composant installe apparait quelque part dans la documentation.
  const found =
    lower.includes(entry.id.toLowerCase()) ||
    lower.includes(String(entry.title).toLowerCase()) ||
    lower.includes(String(entry.component).toLowerCase())

  if (!found) missing.registre.push(`${entry.id} (${String(entry.title)})`)
}

for (const name of uiComponents()) {
  if (!lower.includes(name.toLowerCase())) missing.ui.push(name)
}

const total = registryEntries().length + uiComponents().length
console.log(
  `${String(paths.length)} pages parcourues, ${String(total)} elements inventories.`,
)

const gaps = missing.registre.length + missing.ui.length
if (gaps === 0) {
  console.log('\nTout ce qui est publie figure dans la documentation.\n')
} else {
  console.error(`\n${String(gaps)} element(s) absent(s) de la documentation :\n`)
  for (const id of missing.registre) console.error(`  · registre — ${id}`)
  for (const name of missing.ui) console.error(`  · interface — ${name}`)
  console.error('')
  process.exitCode = 1
}
