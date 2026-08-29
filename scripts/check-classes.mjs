/**
 * Verifie qu'aucune classe employee dans le playground ne manque a la feuille.
 *
 * ## Pourquoi ce controle existe
 *
 * Une classe qui n'existe pas ne provoque aucune erreur : elle ne fait rien.
 * Un bouton perd son fond, un interrupteur devient invisible, une pastille
 * disparait — et rien, ni dans la console, ni dans la compilation, ni dans les
 * tests unitaires, ne le signale. C'est le mode de defaillance le plus
 * silencieux d'un systeme de style statique, et le retrait de la couche
 * semantique en a multiplie les occasions.
 *
 * Le controle parcourt les pages, releve toute classe commencant par `o-` ou
 * portant un variant, et la compare a la liste que le generateur a produite.
 *
 * Usage :
 *
 *   node scripts/check-classes.mjs [url]
 *
 * Le serveur de developpement du playground doit tourner a cette adresse.
 */

import { readFileSync } from 'node:fs'

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

/** Classes que le generateur produit, lues dans l'artefact. */
const known = new Set(
  [
    ...readFileSync(
      'packages/odoro-libs/src/styles/generated/classNames.ts',
      'utf8',
    ).matchAll(/'([^']+)'/g),
  ].map((match) => match[1]),
)

if (known.size < 1000) {
  console.error('Liste de classes introuvable ou trop courte.')
  process.exit(1)
}

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage()

/** Pages parcourues : la navigation les donne toutes. */
await page.goto(`${base}/`, { waitUntil: 'networkidle' })
const paths = await page.evaluate(() =>
  [...document.querySelectorAll('nav[aria-label="Documentation"] a')].map(
    (a) => new URL(a.href).pathname,
  ),
)

/** Classe inconnue vers les pages ou elle apparait. */
const missing = new Map()
let inspected = 0

for (const path of paths) {
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(250)

  const used = await page.evaluate(() => {
    const found = new Set()
    for (const element of document.querySelectorAll('[class]')) {
      for (const name of element.classList) found.add(name)
    }
    return [...found]
  })

  for (const name of used) {
    // Seules les classes du systeme sont concernees : une classe applicative
    // n'a aucune raison d'etre dans la feuille.
    const isOurs = name.startsWith('o-') || /^[a-z0-9-]+:o-/.test(name)
    if (!isOurs || known.has(name)) continue

    const pages = missing.get(name) ?? new Set()
    pages.add(path)
    missing.set(name, pages)
  }

  inspected += 1
}

await browser.close()

console.log(
  `${String(inspected)} pages parcourues, ${String(known.size)} classes connues.`,
)

if (missing.size === 0) {
  console.log('\nAucune classe manquante.\n')
} else {
  console.error(`\n${String(missing.size)} classe(s) employee(s) mais absente(s) :\n`)
  for (const [name, pages] of [...missing].sort()) {
    const where = [...pages].slice(0, 3).join(', ')
    const more = pages.size > 3 ? ` (+${String(pages.size - 3)})` : ''
    console.error(`  · ${name}  —  ${where}${more}`)
  }
  console.error('')
  process.exitCode = 1
}
