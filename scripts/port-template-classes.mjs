#!/usr/bin/env node
/**
 * Rewrites the class strings of a ported template, once.
 *
 * ## What this is for, and what it is not for
 *
 * A template arriving from elsewhere brings finished markup written against
 * another utility engine. The instruction is to change the engine and nothing
 * else. This pass does exactly that: it walks every class string of the copied
 * sources and rewrites each name from the template's table.
 *
 * It is a **one-shot migration**, not a build step. It runs on the pristine
 * copy, once. Run twice, it reports every name it produced the first time as
 * unknown — which is correct, and is how you notice.
 *
 * ## Why it reads the expressions and not only the plain strings
 *
 * The first version matched `className="…"` and nothing else. It announced
 * three hundred and sixty-three rewrites and zero unknown names, and it was
 * wrong: four of the template's class lists are expressions —
 *
 *     className={[ "…", side === "left" && "…" ].filter(Boolean).join(" ")}
 *     className={`will-change-transform ${center ? "max-w-[34rem]" : "…"}`}
 *
 * — and it never looked at them. Fifteen classes went through untouched, a
 * column lost its width, and the check reported success because a pass that
 * does not look at something cannot fail on it.
 *
 * So `className=` is followed to its closing brace, and every string and
 * template chunk inside is rewritten. What sits in `${…}` is code, and is left
 * alone.
 *
 * ## Et les listes tenues en variable
 *
 * `const cls = "group relative inline-flex h-12 …"`, employee plus loin par
 * `className={cls}`, n est pas dans un attribut : suivre `className=` ne la
 * voit pas davantage. Un bouton y a perdu sa hauteur, et dix-huit pixels sont
 * apparus.
 *
 * Toute chaine du fichier est donc examinee. Une chaine est tenue pour une
 * liste de classes quand elle porte au moins trois mots, que chacun a la forme
 * d un nom de classe, et qu au moins un se traduit. Le seuil de trois mots est
 * ce qui distingue `"grid"` — la valeur d un `display` — d une liste. Ce qui
 * passe au travers reste attrape par `check-template-classes.mjs`, qui, lui,
 * ne traduit rien et signale tout.
 *
 * ## Why it refuses rather than guesses
 *
 * A class our generator does not produce raises no error at run time: it does
 * nothing. A button loses its background, a section loses its padding, and
 * neither the console nor the compilation says a word. So any name that is
 * neither in our stylesheet, nor renamed, nor declared as the template's own
 * makes this exit non-zero and name the file it sits in.
 *
 * Usage:
 *
 *     node scripts/port-template-classes.mjs templates/altitude
 *
 * @module
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const target = process.argv[2]
if (target === undefined) {
  console.error('Usage: node scripts/port-template-classes.mjs <template folder>')
  process.exit(1)
}

/** `--dry` inspecte sans rien ecrire : c est ainsi qu on remplit la table. */
const dry = process.argv.includes('--dry')

const folder = resolve(ROOT, target)
const name = folder.split(/[\\/]/).pop() ?? ''

const { RENAMED, UNCHANGED, RESPELLED, IGNORED } = await import(
  `./lib/${name}-classes.mjs`
)

/*
 * `IGNORED` et `FAUX_AMIS` ne servent pas la meme chose, et les confondre coute
 * cher. `IGNORED` nomme les valeurs qu une expression de `className` compare —
 * `side === "left"` — et que cette passe rencontre donc au milieu de vraies
 * listes. `FAUX_AMIS`, lui, ne concerne que le controle : des mots croises
 * ailleurs dans le fichier, qui ressemblent a des classes sans en etre.
 *
 * Les avoir melanges a laisse passer `hidden` : mis en exception pour taire le
 * `overflow: hidden` d un module, il a aussi epargne la vraie classe `hidden`
 * du bandeau, qui montrait alors sa navigation de bureau sur un telephone.
 */

/** The classes our generator actually produces. */
const KNOWN = new Set(
  [
    ...readFileSync(
      join(ROOT, 'packages', 'odoro-libs', 'src', 'styles', 'generated', 'classNames.ts'),
      'utf8',
    ).matchAll(/'([^']+)'/g),
  ].map((match) => match[1]),
)

/** Every `.tsx` of the template. */
function sources(directory, found = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['node_modules', '.next', 'public', 'dist'].includes(entry.name)) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) sources(path, found)
    else if (entry.name.endsWith('.tsx')) found.push(path)
  }
  return found
}

/** Les noms que la table produit : ils sont deja a leur place. */
const PRODUITS = new Set(Object.values(RENAMED))

const unknown = new Map()
let rewritten = 0

/**
 * The name a class takes in our system.
 *
 * @returns The new name, or `null` when nothing in the table covers it.
 */
function translate(original) {
  // Un nom que cette passe vient elle-meme de produire : la seconde passe
  // repasse sur le resultat de la premiere, et signalerait sinon son propre
  // travail comme introuvable.
  const dejaFait = original.slice(original.lastIndexOf(':') + 1)
  if (dejaFait.startsWith('o-')) return original
  if (PRODUITS.has(dejaFait)) return original
  // Une valeur que l expression compare, pas une classe. Voir IGNORED.
  if (IGNORED?.has(original) === true) return original
  if (UNCHANGED.has(original)) return original
  if (original in RENAMED) return RENAMED[original]
  if (original in RESPELLED) return RESPELLED[original]

  // A variant — `md:`, `hover:`, `focus-visible:` — prefixes the name our
  // stylesheet holds; the prefix itself travels unchanged.
  const cut = original.lastIndexOf(':')
  const variant = cut < 0 ? '' : original.slice(0, cut + 1)
  const bare = (cut < 0 ? original : original.slice(cut + 1)).replace(/^!/, '')

  if (KNOWN.has(`${variant}o-${bare}`)) return `${variant}o-${bare}`
  return null
}

/** Rewrites one whitespace-separated class list. */
function rewriteList(list, where) {
  return list
    .split(/(\s+)/)
    .map((piece) => {
      if (piece.trim() === '') return piece
      const next = translate(piece)
      if (next === null) {
        const files = unknown.get(piece) ?? new Set()
        files.add(where)
        unknown.set(piece, files)
        return piece
      }
      if (next !== piece) rewritten += 1
      return next
    })
    .join('')
}

/**
 * The index just past the expression that starts at `start` (a `{`).
 *
 * Braces nest, and a string or a template literal inside them may contain a
 * brace of its own: counting them without reading the quotes finds the wrong
 * end, and the rewrite then runs over the rest of the file.
 */
function endOfExpression(code, start) {
  let depth = 0
  let index = start
  while (index < code.length) {
    const c = code[index]
    if (c === '"' || c === "'" || c === '`') {
      const quote = c
      index += 1
      while (index < code.length) {
        if (code[index] === '\\') index += 2
        else if (code[index] === quote) break
        else index += 1
      }
    } else if (c === '{') depth += 1
    else if (c === '}') {
      depth -= 1
      if (depth === 0) return index + 1
    }
    index += 1
  }
  return code.length
}

/** Rewrites every string and template chunk of an expression. */
function rewriteExpression(code, where) {
  let out = ''
  let index = 0
  while (index < code.length) {
    const c = code[index]

    if (c === '"' || c === "'") {
      const end = code.indexOf(c, index + 1)
      if (end < 0) {
        out += code.slice(index)
        break
      }
      out += c + rewriteList(code.slice(index + 1, end), where) + c
      index = end + 1
      continue
    }

    if (c === '`') {
      let cursor = index + 1
      out += '`'
      while (cursor < code.length && code[cursor] !== '`') {
        // `${…}` is code, not a class list: it travels untouched.
        if (code[cursor] === '$' && code[cursor + 1] === '{') {
          const end = endOfExpression(code, cursor + 1)
          out += `\${${rewriteExpression(code.slice(cursor + 2, end - 1), where)}}`
          cursor = end
          continue
        }
        let run = cursor
        while (
          run < code.length &&
          code[run] !== '`' &&
          !(code[run] === '$' && code[run + 1] === '{')
        ) {
          run += 1
        }
        out += rewriteList(code.slice(cursor, run), where)
        cursor = run
      }
      out += '`'
      index = cursor + 1
      continue
    }

    out += c
    index += 1
  }
  return out
}

/** La forme d un mot qui pourrait etre un nom de classe. */
const SHAPE = /^!?[a-z][a-z0-9:/[\]().,%_-]*$/

/**
 * Une chaine hors attribut est-elle une liste de classes ?
 *
 * Trois mots au moins, tous de la forme voulue, et au moins un que la table ou
 * la feuille sait traduire. En dessous de trois, l ambiguite l emporte :
 * `"grid"` est aussi bien une classe que la valeur d un `display`, et se
 * tromper la corromprait du code.
 */
function looksLikeClassList(text) {
  const tokens = text.split(/\s+/).filter((piece) => piece !== '')
  if (tokens.length < 3) return false
  if (!tokens.every((piece) => SHAPE.test(piece))) return false
  return tokens.some((piece) => translate(piece) !== null)
}

let touched = 0

for (const file of sources(folder)) {
  const before = readFileSync(file, 'utf8')
  const where = file.slice(folder.length + 1)

  let after = ''
  let index = 0
  const MARK = 'className='

  while (index < before.length) {
    const found = before.indexOf(MARK, index)
    if (found < 0) {
      after += before.slice(index)
      break
    }

    after += before.slice(index, found + MARK.length)
    const start = found + MARK.length
    const opener = before[start]

    if (opener === '"' || opener === "'") {
      const end = before.indexOf(opener, start + 1)
      after += opener + rewriteList(before.slice(start + 1, end), where) + opener
      index = end + 1
    } else if (opener === '{') {
      const end = endOfExpression(before, start)
      after += `{${rewriteExpression(before.slice(start + 1, end - 1), where)}}`
      index = end
    } else {
      index = start
    }
  }

  // Seconde passe : les listes qui ne sont pas dans un attribut. Elle vient
  // apres, sur le resultat de la premiere, pour ne pas repasser sur ce qui
  // vient d etre traduit — `o-flex` n a plus la forme d un nom a traduire.
  after = after.replace(/(["'`])([^"'`\n]{8,800})\1/g, (whole, quote, text) => {
    if (!looksLikeClassList(text)) return whole
    return quote + rewriteList(text, where) + quote
  })

  if (after !== before) {
    if (!dry) writeFileSync(file, after, 'utf8')
    touched += 1
  }
}

console.log(
  `${String(rewritten)} classe(s) ${dry ? 'a reecrire' : 'reecrite(s)'} dans ` +
    `${String(touched)} fichier(s)${dry ? ' — rien n a ete ecrit' : ''}.`,
)

if (unknown.size > 0) {
  console.error(`\n${String(unknown.size)} classe(s) sans reponse dans la table :\n`)
  for (const [piece, where] of [...unknown].sort()) {
    console.error(`  · ${piece}  —  ${[...where].join(', ')}`)
  }
  console.error(
    '\nUne classe absente ne casse rien : elle ne peint rien. Completer la table.\n',
  )
  process.exitCode = 1
}
