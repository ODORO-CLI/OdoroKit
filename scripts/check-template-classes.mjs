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
 * ## La seconde question : une classe du gabarit prefixee a tort
 *
 * L erreur symetrique existe, et elle est plus sournoise. `glass`,
 * `cursor-pointer`, `animate-fade-in` sont declarees dans la feuille du
 * gabarit — ce sont les siennes. Notre systeme connait par hasard les memes
 * noms sous `o-`, et la passe les a donc prefixees : le balisage porte
 * `o-glass`, qui existe et ne ressemble pas a ce que la feuille dessinait.
 *
 * Rien ne casse. La surface de verre prend simplement l apparence d une autre.
 * Le controle lit donc les selecteurs de la feuille du gabarit et verifie
 * qu aucun n a ete traduit.
 *
 * ## La troisieme question : le meme nom, une autre valeur
 *
 * La plus sournoise des trois. Le gabarit declare `--ease-entrance:
 * cubic-bezier(0.2, 0, 0, 1)` dans son theme ; notre systeme connait, par
 * hasard, un `o-ease-entrance` qui vaut `cubic-bezier(0, 0, 0, 1)`. La passe a
 * donc prefixe la classe — elle existe chez nous — et la courbe a change sans
 * qu un seul nom bouge.
 *
 * Rien dans le balisage ne le montre : `o-ease-entrance` a l air juste. Le
 * controle lit donc le bloc `@theme` du gabarit et exige que tout jeton dont
 * notre systeme connait l utilitaire homonyme soit revendique par la table.
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
let table = {
  RENAMED: {},
  UNCHANGED: new Set(),
  IGNORED: new Set(),
  FAUX_AMIS: new Set(),
  RESPELLED: {},
}
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

/** A token that could be a class name of the other engine.
 *
 * Le tiret de tete compte. Sans lui, `-inset-y-[10%]` etait refuse, et comme
 * la regle exige que **tous** les mots d une chaine aient cette forme, la
 * liste entiere passait a la trappe — sans rien signaler. Une carte de trois
 * dispositions n en a vu qu une traduite, la photographie du hero a perdu son
 * bloc englobant, et la page s est affichee blanche.
 */
const SHAPE = /^-?!?[a-z][a-z0-9:/[\]().,%_-]*$/

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
      if (table.FAUX_AMIS?.has(token) === true) continue
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

/* ---- Seconde question : les classes que le gabarit declare lui-meme. ---- */

/** Les feuilles du gabarit. */
function stylesheets(directory, out = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['node_modules', '.next', 'dist'].includes(entry.name)) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) stylesheets(path, out)
    else if (entry.name.endsWith('.css')) out.push(path)
  }
  return out
}

const propres = new Set()
for (const file of stylesheets(folder)) {
  for (const match of readFileSync(file, 'utf8').matchAll(/\.([a-zA-Z][\w-]*)/g)) {
    propres.add(match[1])
  }
}

const revendiquees = new Set([
  ...(table.UNCHANGED ?? []),
  ...Object.values(table.RENAMED ?? {}),
])

/** Une classe de la feuille que la passe prefixerait, et qui n est pas declaree. */
const usurpees = [...propres].filter(
  (nom) => !revendiquees.has(nom) && KNOWN.has(`o-${nom}`),
)

if (usurpees.length > 0) {
  console.error(
    `\n${name} : ${String(usurpees.length)} classe(s) declaree(s) par la feuille ` +
      `du gabarit que la passe prendrait pour les notres :\n`,
  )
  for (const nom of usurpees.sort()) console.error(`  · ${nom}`)
  console.error(
    '\nLes ajouter a UNCHANGED. Sans cela le balisage porte `o-' +
      (usurpees[0] ?? 'x') +
      '`, qui existe et ne dessine pas la meme chose.\n',
  )
  process.exitCode = 1
}

/* ---- Troisieme question : les jetons homonymes. ---- */

/** Les familles d utilitaires qu un jeton de theme engendre. */
const FAMILLES = {
  '--color-': ['bg', 'text', 'border'],
  '--text-': ['text'],
  '--radius-': ['rounded'],
  '--leading-': ['leading'],
  '--font-': ['font'],
  '--blur-': ['backdrop-blur'],
  '--ease-': ['ease'],
  '--duration-': ['duration'],
}

const homonymes = []
{
  const feuille = stylesheets(folder)
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n')
  const ouverture = /@theme(?:\s+inline)?\s*\{/.exec(feuille)
  if (ouverture !== null) {
    const open = ouverture.index + ouverture[0].length - 1
    let depth = 1
    let index = open + 1
    while (depth > 0 && index < feuille.length) {
      if (feuille[index] === '{') depth += 1
      else if (feuille[index] === '}') depth -= 1
      index += 1
    }
    for (const match of feuille.slice(open + 1, index - 1).matchAll(/(--[\w-]+)\s*:/g)) {
      for (const [espace, roots] of Object.entries(FAMILLES)) {
        if (!match[1].startsWith(espace)) continue
        const jeton = match[1].slice(espace.length)
        for (const root of roots) {
          const nom = `${root}-${jeton}`
          if (!KNOWN.has(`o-${nom}`)) continue
          if (revendiquees.has(nom)) continue
          if (table.RENAMED?.[nom] !== undefined) continue
          homonymes.push(nom)
        }
      }
    }
  }
}

if (homonymes.length > 0) {
  console.error(
    `\n${name} : ${String(homonymes.length)} jeton(s) du gabarit dont notre systeme ` +
      `connait l homonyme :\n`,
  )
  for (const nom of [...new Set(homonymes)].sort()) console.error(`  · ${nom}`)
  console.error(
    '\nLa passe les prefixe, et la valeur devient la notre au lieu de la leur.\n' +
      'Les mettre dans RENAMED, avec la declaration du gabarit.\n',
  )
  process.exitCode = 1
}

if (found.size === 0 && usurpees.length === 0 && homonymes.length === 0) {
  console.log(`${name} : aucune classe egaree, dans un sens ni dans l autre.`)
} else if (found.size > 0) {
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
