/**
 * Checks that everything published appears in the documentation.
 *
 * ## Why this check exists
 *
 * A component absent from the site has practically no existence: nobody can
 * discover it, and the only way to learn it is there is to read the registry
 * by hand. The omission breaks nothing, fails no test, and gets noticed
 * months later — or never.
 *
 * Three inventories are compared against what the playground actually
 * renders: the registry entries, the interface components, and the pages
 * declared in the navigation.
 *
 * Usage:
 *
 *   node scripts/check-catalogue.mjs [url]
 *
 * The playground development server must be running at that address.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

/** Registry entries, read from the source tree. */
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
        // The name of the installed component: it is the one a page imports.
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

/** Components exported by the interface library. */
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

// The documentation starts at `/docs`, not at the root: the root now carries
// the showcase, which deliberately has no side column. Starting from `/` would
// find no link, and the check would declare everything absent — which is what
// it did, the first time.
await page.goto(`${base}/docs`, { waitUntil: 'networkidle' })
const paths = await page.evaluate(() =>
  [...document.querySelectorAll('nav[aria-label="Documentation"] a')].map(
    (a) => new URL(a.href).pathname,
  ),
)

/** All the text rendered by the documentation, page by page. */
let corpus = ''
for (const path of paths) {
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(150)
  corpus += await page.evaluate(() => document.body.innerText)
}
await browser.close()

const lower = corpus.toLowerCase()
const missing = { registry: [], ui: [] }

for (const entry of registryEntries()) {
  // An entry is considered present if its identifier, its title or the name of
  // the installed component appears somewhere in the documentation.
  const found =
    lower.includes(entry.id.toLowerCase()) ||
    lower.includes(String(entry.title).toLowerCase()) ||
    lower.includes(String(entry.component).toLowerCase())

  if (!found) missing.registry.push(`${entry.id} (${String(entry.title)})`)
}

for (const name of uiComponents()) {
  if (!lower.includes(name.toLowerCase())) missing.ui.push(name)
}

const total = registryEntries().length + uiComponents().length
console.log(
  `${String(paths.length)} pages walked, ${String(total)} elements inventoried.`,
)

const gaps = missing.registry.length + missing.ui.length
if (gaps === 0) {
  console.log('\nEverything published appears in the documentation.\n')
} else {
  console.error(`\n${String(gaps)} element(s) absent from the documentation:\n`)
  for (const id of missing.registry) console.error(`  · registry — ${id}`)
  for (const name of missing.ui) console.error(`  · interface — ${name}`)
  console.error('')
  process.exitCode = 1
}
