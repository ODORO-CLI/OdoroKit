/**
 * Checks that no class used in the playground is missing from the stylesheet.
 *
 * ## Why this check exists
 *
 * A class that does not exist raises no error: it does nothing. A button loses
 * its background, a switch becomes invisible, a dot disappears — and nothing,
 * neither in the console, nor in the compilation, nor in the unit tests,
 * reports it. It is the most silent failure mode of a static style system, and
 * removing the semantic layer multiplied the occasions for it.
 *
 * The check walks the pages, collects every class starting with `o-` or
 * carrying a variant, and compares it to the list the generator produced.
 *
 * Usage:
 *
 *   node scripts/check-classes.mjs [url]
 *
 * The playground development server must be running at that address.
 */

import { readFileSync } from 'node:fs'

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

/** Classes the generator produces, read from the artefact. */
const known = new Set(
  [
    ...readFileSync(
      'packages/odoro-libs/src/styles/generated/classNames.ts',
      'utf8',
    ).matchAll(/'([^']+)'/g),
  ].map((match) => match[1]),
)

if (known.size < 1000) {
  console.error('Class list not found or too short.')
  process.exit(1)
}

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage()

/**
 * Pages walked: the navigation gives them all.
 *
 * The entry point is a documentation page, not the root. The root is the
 * landing page, and it carries no documentation navigation — the walk started
 * there, found nothing, and announced "no missing class" after visiting zero
 * pages. A check that inspects nothing passes every time.
 */
await page.goto(`${base}/docs/installation`, { waitUntil: 'networkidle' })
const paths = await page.evaluate(() =>
  [...document.querySelectorAll('nav[aria-label="Documentation"] a')].map(
    (a) => new URL(a.href).pathname,
  ),
)

/** Unknown class to the pages where it appears. */
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
    // Only the system classes are concerned: an application class has no
    // reason to be in the stylesheet.
    const isOurs = name.startsWith('o-') || /^[a-z0-9-]+:o-/.test(name)
    if (!isOurs || known.has(name)) continue

    const pages = missing.get(name) ?? new Set()
    pages.add(path)
    missing.set(name, pages)
  }

  inspected += 1
}

await browser.close()

console.log(`${String(inspected)} pages walked, ${String(known.size)} known classes.`)

// A walk that covered nothing is a failure, not a success. Said otherwise, this
// check has to be able to fail: reporting "no missing class" after visiting zero
// pages is exactly how a guard stops guarding without anyone noticing.
if (inspected === 0) {
  console.error('\nNo page walked: the documentation navigation was not found.\n')
  process.exitCode = 1
} else if (missing.size === 0) {
  console.log('\nNo missing class.\n')
} else {
  console.error(`\n${String(missing.size)} class(es) used but absent:\n`)
  for (const [name, pages] of [...missing].sort()) {
    const where = [...pages].slice(0, 3).join(', ')
    const more = pages.size > 3 ? ` (+${String(pages.size - 3)})` : ''
    console.error(`  · ${name}  —  ${where}${more}`)
  }
  console.error('')
  process.exitCode = 1
}
