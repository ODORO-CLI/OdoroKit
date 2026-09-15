/**
 * Import by pattern: `import.meta.glob`.
 *
 * ## What it is for
 *
 * A router that follows the file tree, a blog whose every post is a file, a
 * catalogue of demos: in each of these cases the list of modules is **the
 * contents of a directory**, and writing it by hand amounts to keeping an index
 * that goes out of sync on the first addition.
 *
 * The pattern is resolved at build time, not at runtime: what comes out of it
 * is a table of ordinary static imports, which splitting can handle and which
 * pruning can follow.
 *
 * @module
 */

import { existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

/** Options recognised on a pattern. */
interface Options {
  /** Loads right away, rather than returning import functions. */
  readonly eager: boolean
  /** Exposes a single export of each module. */
  readonly named: string | undefined
}

/** A call spotted in the source code. */
interface Pattern {
  /** Position of the first character of the call. */
  readonly start: number
  /** Position just after the closing parenthesis. */
  readonly end: number
  /** Patterns to keep. */
  readonly included: readonly string[]
  /** Patterns to exclude, written with a leading `!`. */
  readonly excluded: readonly string[]
  readonly options: Options
}

/** The directories that are never walked. */
const IGNORED = new Set(['node_modules', '.git', 'dist', '.odoro'])

/** The characters a regular expression takes for instructions. */
const SPECIALS = /[.*+?^${}()|[\]\\]/g

/**
 * Converts a pattern into a regular expression.
 *
 * `**` crosses directories, `*` stops at the separator, `?` is worth one
 * character, and `{a,b}` offers a choice. Everything else is taken literally —
 * a dot is a dot, not "any character".
 *
 * @example
 * toRegex('./pages/*.tsx').test('./pages/index.tsx') // true
 */
export function toRegex(pattern: string): RegExp {
  let source = ''

  for (let index = 0; index < pattern.length; index += 1) {
    const letter = pattern[index]
    if (letter === undefined) continue

    if (letter === '*') {
      if (pattern[index + 1] === '*') {
        // `**/` swallows its separator too, otherwise `a/**/b` would not match
        // `a/b` — the case where there is no intermediate directory.
        if (pattern[index + 2] === '/') {
          source += '(?:.*/)?'
          index += 2
          continue
        }
        source += '.*'
        index += 1
        continue
      }
      source += '[^/]*'
      continue
    }

    if (letter === '?') {
      source += '[^/]'
      continue
    }

    if (letter === '{') {
      const closing = pattern.indexOf('}', index)
      if (closing !== -1) {
        const choices = pattern
          .slice(index + 1, closing)
          .split(',')
          .map((part) => part.replace(SPECIALS, '\\$&'))
        source += `(?:${choices.join('|')})`
        index = closing
        continue
      }
    }

    source += letter.replace(SPECIALS, '\\$&')
  }

  return new RegExp(`^${source}$`)
}

/**
 * Reads a parenthesised group, respecting string literals.
 *
 * Counting parentheses without accounting for strings is enough to get a
 * pattern containing one wrong.
 *
 * @returns The index of the closing parenthesis, or -1.
 */
function groupEnd(code: string, opening: number): number {
  let depth = 0
  let quote: string | undefined

  for (let index = opening; index < code.length; index += 1) {
    const letter = code[index]

    if (quote !== undefined) {
      if (letter === '\\') index += 1
      else if (letter === quote) quote = undefined
      continue
    }

    if (letter === '"' || letter === "'" || letter === '`') {
      quote = letter
      continue
    }
    if (letter === '(') depth += 1
    else if (letter === ')') {
      depth -= 1
      if (depth === 0) return index
    }
  }

  return -1
}

/** Extracts the string literals of an argument fragment. */
function stringsIn(fragment: string): string[] {
  const rendered: string[] = []
  for (const found of fragment.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)) {
    const value = found[2]
    if (value !== undefined) rendered.push(value)
  }
  return rendered
}

/** Spots the calls to `import.meta.glob` and reads their arguments. */
function patternsIn(code: string): Pattern[] {
  const patterns: Pattern[] = []

  for (const found of code.matchAll(/import\.meta\.glob\s*\(/g)) {
    const start = found.index
    const opening = start + found[0].length - 1
    const end = groupEnd(code, opening)
    if (end === -1) continue

    const arguments_ = code.slice(opening + 1, end)

    // The second argument, if there is one, is an object: the comma preceding
    // it separates the two. Looking for the first comma would be wrong, an
    // array of patterns contains some.
    const brace = arguments_.indexOf('{')
    const cut = brace === -1 ? -1 : arguments_.slice(0, brace).lastIndexOf(',')

    const first = cut === -1 ? arguments_ : arguments_.slice(0, cut)
    const second = cut === -1 ? '' : arguments_.slice(cut + 1)

    const all = stringsIn(first)
    if (all.length === 0) continue

    patterns.push({
      start,
      end: end + 1,
      included: all.filter((pattern) => !pattern.startsWith('!')),
      excluded: all
        .filter((pattern) => pattern.startsWith('!'))
        .map((pattern) => pattern.slice(1)),
      options: {
        eager: /["']?eager["']?\s*:\s*true/.test(second),
        named: /["']?import["']?\s*:\s*["']([^"']+)["']/.exec(second)?.[1],
      },
    })
  }

  return patterns
}

/** The part of the pattern that contains no special character. */
function fixedRootOf(pattern: string): string {
  const fixed: string[] = []
  for (const segment of pattern.split('/')) {
    if (/[*?{}[\]]/.test(segment)) break
    fixed.push(segment)
  }
  return fixed.join('/') || '.'
}

/** Walks a directory and returns the paths of the files it holds. */
function filesUnder(directory: string): string[] {
  if (!existsSync(directory) || !statSync(directory).isDirectory()) return []

  const rendered: string[] = []
  const stack = [directory]

  while (stack.length > 0) {
    const current = stack.pop()
    if (current === undefined) continue

    for (const entry of readdirSync(current)) {
      if (IGNORED.has(entry) || entry.startsWith('.')) continue
      const path = join(current, entry)
      if (statSync(path).isDirectory()) stack.push(path)
      else rendered.push(path)
    }
  }

  return rendered
}

/** Puts a path in URL separators. */
function toUrlPath(path: string): string {
  return path.split('\\').join('/')
}

/**
 * Resolves a pattern into paths relative to the file that writes it.
 *
 * The returned paths keep the shape of the pattern — `./pages/a.tsx` — because
 * they are what becomes the **keys** of the table, and code writing
 * `modules['./pages/a.tsx']` must hit the mark.
 */
function resolvePattern(pattern: Pattern, file: string, projectRoot: string): string[] {
  const sourceDirectory = dirname(file)
  const found = new Set<string>()

  for (const included of pattern.included) {
    const absolute = included.startsWith('/')
    const base = absolute
      ? join(projectRoot, fixedRootOf(included.slice(1)))
      : resolve(sourceDirectory, fixedRootOf(included))

    const regex = toRegex(included)

    for (const path of filesUnder(base)) {
      const relativePath = absolute
        ? `/${toUrlPath(relative(projectRoot, path))}`
        : toUrlPath(relative(sourceDirectory, path)).replace(/^(?!\.\.\/)/, './')

      if (!regex.test(relativePath)) continue
      if (pattern.excluded.some((excluded) => toRegex(excluded).test(relativePath)))
        continue
      // A pattern never picks itself up: `./*.ts` written in a file of the
      // directory would produce an immediate circular import.
      if (path === resolve(file)) continue

      found.add(relativePath)
    }
  }

  // Stable sort: two builds of the same source must produce the same bundle,
  // otherwise the hashes change without anything having changed.
  return [...found].sort()
}

/** What the transformation produced. */
export interface Resolution {
  /** Transformed code. */
  readonly code: string
  /** Files reached, as absolute paths. */
  readonly files: readonly string[]
}

/** Tells whether some code uses import by pattern. */
export function hasGlob(code: string): boolean {
  return code.includes('import.meta.glob')
}

/**
 * Replaces the calls to `import.meta.glob` by tables of static imports.
 *
 * @param code Source of the module.
 * @param file Absolute path of the module.
 * @param projectRoot Project root, for patterns starting with `/`.
 * @returns The transformed code, or `undefined` if nothing changed.
 *
 * @example
 * transformGlob("const p = import.meta.glob('./pages/*.tsx')", file, root)
 * // const p = {"./pages/index.tsx": () => import("./pages/index.tsx")}
 */
export function transformGlob(
  code: string,
  file: string,
  projectRoot: string,
): Resolution | undefined {
  if (!hasGlob(code)) return undefined

  const patterns = patternsIn(code)
  if (patterns.length === 0) return undefined

  const prelude: string[] = []
  const files: string[] = []
  let rendered = ''
  let cursor = 0
  let counter = 0

  for (const pattern of patterns) {
    const entries: string[] = []

    for (const path of resolvePattern(pattern, file, projectRoot)) {
      files.push(resolve(dirname(file), path))
      const key = JSON.stringify(path)
      const target = JSON.stringify(path)

      if (pattern.options.eager) {
        const alias = `__odoro_glob_${String(counter)}`
        counter += 1
        prelude.push(`import * as ${alias} from ${target}`)
        entries.push(
          `${key}: ${
            pattern.options.named === undefined
              ? alias
              : `${alias}[${JSON.stringify(pattern.options.named)}]`
          }`,
        )
        continue
      }

      const importation = `import(${target})`
      entries.push(
        `${key}: ${
          pattern.options.named === undefined
            ? `() => ${importation}`
            : `() => ${importation}.then((m) => m[${JSON.stringify(pattern.options.named)}])`
        }`,
      )
    }

    rendered += code.slice(cursor, pattern.start)
    rendered += entries.length === 0 ? '{}' : `{${entries.join(', ')}}`
    cursor = pattern.end
  }

  rendered += code.slice(cursor)

  // The static imports are put at the top: they are hoisted anyway, and placing
  // them at the call site would be a syntax error as soon as the call sits
  // inside a function.
  return {
    code: prelude.length === 0 ? rendered : `${prelude.join('\n')}\n${rendered}`,
    files,
  }
}
