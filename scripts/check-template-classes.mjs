#!/usr/bin/env node
/**
 * Checks that a ported template has no class left behind.
 *
 * ## The failure this exists to catch
 *
 * `port-template-classes.mjs` follows `className=`. Twice now that was not
 * enough, and twice the check reported success:
 *
 * 1. The class lists built by an expression —
 *    `className={[ "…", side === "left" && "…" ].join(" ")}`. Fifteen names
 *    went through untouched, a grid lost its columns, five hundred and fifty
 *    pixels appeared, and nothing said a word.
 * 2. The class lists held in a **variable** —
 *    `const cls = "group relative inline-flex h-12 …"`, used later as
 *    `className={cls}`. The submit button lost its height and grew by eighteen
 *    pixels.
 *
 * Both share one shape: a pass cannot fail on what it does not look at. So
 * this walks **every string** of the template, not the attributes, and asks a
 * different question — is there a name here that our stylesheet knows under
 * `o-`, sitting without its prefix? If there is, it is either a class that was
 * missed, or a word that merely looks like one; either way a human should see
 * it.
 *
 * ## Why it can be answered, and why it errs towards noise
 *
 * A bare `grid` in a string may be a class or the value of `display`. The
 * check cannot tell, and does not try: it reports, and the reader decides. A
 * check that stays silent unless it is certain is the check that let both of
 * the above through.
 *
 * Usage:
 *
 *     node scripts/check-template-classes.mjs templates/orfevre
 *
 * @module
 */

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const target = process.argv[2]
if (target === undefined) {
  console.error('Usage: node scripts/check-template-classes.mjs <template folder>')
  process.exit(1)
}

const folder = resolve(ROOT, target)
const name = folder.split(/[\\/]/).pop() ?? ''

/** The classes our generator produces. */
const KNOWN = new Set(
  [
    ...readFileSync(
      join(ROOT, 'packages', 'odoro-libs', 'src', 'styles', 'generated', 'classNames.ts'),
      'utf8',
    ).matchAll(/'([^']+)'/g),
  ].map((match) => match[1]),
)

/** What the template declares as its own, which must stay unprefixed. */
let table = { RENAMED: {}, UNCHANGED: new Set(), IGNORED: new Set(), RESPELLED: {} }
try {
  table = await import(`./lib/${name}-classes.mjs`)
} catch {
  // Un gabarit sans table — `manoir` n emploie aucun utilitaire — est un cas
  // legitime : tout y est a lui.
}

/** Sources of the template. */
function sources(directory, found = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['node_modules', '.next', 'public', 'dist'].includes(entry.name)) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) sources(path, found)
    else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) found.push(path)
  }
  return found
}

/** A token that could be a class name of the other engine. */
const SHAPE = /^!?[a-z][a-z0-9:/[\]().,%_-]*$/

const found = new Map()

for (const file of sources(folder)) {
  const where = file.slice(folder.length + 1)
  const code = readFileSync(file, 'utf8')

  for (const match of code.matchAll(/(["'`])([^"'`\n]{2,800})\1/g)) {
    const text = match[2]
    const tokens = text.split(/\s+/).filter((piece) => piece !== '')
    if (tokens.length === 0) continue
    if (!tokens.every((piece) => SHAPE.test(piece))) continue

    for (const token of tokens) {
      const bare = token.replace(/^!/, '')
      // Deja traduit, ou revendique par le gabarit : rien a signaler.
      if (bare.startsWith('o-')) continue
      if (table.UNCHANGED?.has(token) === true) continue
      if (table.IGNORED?.has(token) === true) continue
      if (table.RENAMED !== undefined && Object.values(table.RENAMED).includes(token))
        continue

      const cut = bare.lastIndexOf(':')
      const variant = cut < 0 ? '' : bare.slice(0, cut + 1)
      const stem = cut < 0 ? bare : bare.slice(cut + 1)
      if (!KNOWN.has(`${variant}o-${stem}`)) continue

      const places = found.get(token) ?? new Set()
      places.add(`${where}: ${text.slice(0, 72)}`)
      found.set(token, places)
    }
  }
}

if (found.size === 0) {
  console.log(`${name} : aucune classe restee sans prefixe.`)
} else {
  console.error(
    `\n${name} : ${String(found.size)} nom(s) que la feuille connait sous \`o-\`, ` +
      `ecrits sans leur prefixe :\n`,
  )
  for (const [token, places] of [...found].sort()) {
    console.error(`  · ${token}`)
    for (const place of [...places].slice(0, 2)) console.error(`      ${place}`)
  }
  console.error(
    '\nSoit une classe oubliee par le passage, soit un mot qui y ressemble.\n' +
      'Une classe oubliee ne casse rien : elle ne peint rien.\n',
  )
  process.exitCode = 1
}
