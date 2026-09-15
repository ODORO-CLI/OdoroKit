/**
 * Inference of the import prefix of a project.
 *
 * ## The problem
 *
 * A component copied into `src/components/odoro/` must be able to import its
 * neighbour. Writing `../hooks/usePoster.js` would work, but breaks as soon as
 * the user moves the directory — which they will, since the code belongs to
 * them. The alias prefix survives the move as long as the `tsconfig.json`
 * follows.
 *
 * It still has to be known. The `@/` convention is widespread but not
 * universal: `~/`, `#/`, `src/` exist too, and a project may have no alias at
 * all. It is therefore **read** from the `tsconfig.json` rather than assumed.
 *
 * ## Why this is not a real tsconfig parser
 *
 * Chained `extends`, project `references`, `bundler` resolution: all of that
 * exists, and none of it changes the answer to the only question asked here —
 * which prefix designates the sources directory. The case where the inference
 * fails is provided for: the CLI asks, and records the answer in `odoro.json`.
 * Once recorded, it is never asked again.
 *
 * @module
 */

import { readFile } from 'node:fs/promises'
import { join, posix } from 'node:path'

/** An alias inferred from a `tsconfig.json`. */
export interface AliasGuess {
  /** Import prefix, without a trailing slash. For example `@`. */
  readonly prefix: string
  /** Target directory, relative to the root. For example `src`. */
  readonly directory: string
}

/**
 * Removes the comments and the trailing commas of a JSON with comments.
 *
 * `tsconfig.json` files almost always hold them — it is even the format
 * TypeScript documents. `JSON.parse` refuses them.
 *
 * The scan follows the state of the string rather than a regular expression: a
 * slash inside a string literal (`"https://…"`) must not open a comment.
 */
export function stripJsonComments(source: string): string {
  let output = ''
  let inString = false
  let inLine = false
  let inBlock = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index] ?? ''
    const next = source[index + 1] ?? ''

    if (inLine) {
      if (char === '\n') {
        inLine = false
        output += char
      }
      continue
    }

    if (inBlock) {
      if (char === '*' && next === '/') {
        inBlock = false
        index += 1
      }
      continue
    }

    if (inString) {
      output += char
      // An escaped character cannot close the string.
      if (char === '\\') {
        output += next
        index += 1
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      output += char
      continue
    }
    if (char === '/' && next === '/') {
      inLine = true
      index += 1
      continue
    }
    if (char === '/' && next === '*') {
      inBlock = true
      index += 1
      continue
    }

    output += char
  }

  // A comma followed by a closing brace: legal in JSONC, refused by JSON.
  return output.replace(/,(\s*[}\]])/g, '$1')
}

/** Minimal shape of what interests us in a `tsconfig.json`. */
interface TsConfigShape {
  compilerOptions?: {
    baseUrl?: string
    paths?: Record<string, string[]>
  }
}

/**
 * Normalises a `paths` target into a directory relative to the root.
 *
 * `./src/*` and `src/*` designate the same directory; `baseUrl` can move the
 * anchor. The output is always in forward slashes: it will end up in an
 * `odoro.json` that two different systems must read the same way.
 */
function toDirectory(target: string, baseUrl: string | undefined): string {
  const withoutStar = target.replace(/\/?\*+$/, '')
  const cleaned = withoutStar.replace(/^\.\//, '')
  const base = (baseUrl ?? '.').replace(/^\.\/?/, '')
  const joined = base === '' ? cleaned : posix.join(base, cleaned)
  return joined === '' ? '.' : joined
}

/**
 * Infers the import prefix of a project from its `tsconfig.json`.
 *
 * The candidate kept is the one whose target is the shallowest: a project
 * declaring both `@/*` towards `src/*` and `@ui/*` towards
 * `src/components/ui/*` wants the first as its general prefix.
 *
 * @param root Project root.
 * @returns The inferred alias, or `null` when the project declares none.
 *
 * @example
 * await guessAlias('.') // { prefix: '@', directory: 'src' }
 */
export async function guessAlias(root: string): Promise<AliasGuess | null> {
  let raw: string
  try {
    raw = await readFile(join(root, 'tsconfig.json'), 'utf8')
  } catch {
    return null
  }

  let parsed: TsConfigShape
  try {
    parsed = JSON.parse(stripJsonComments(raw)) as TsConfigShape
  } catch {
    return null
  }

  const paths = parsed.compilerOptions?.paths
  if (paths === undefined) return null

  const candidates: AliasGuess[] = []
  for (const [pattern, targets] of Object.entries(paths)) {
    // Only wildcard patterns designate a directory; `"react": [...]` is a
    // package redirection, not a sources alias.
    if (!pattern.endsWith('/*')) continue
    const target = targets[0]
    if (target === undefined) continue

    candidates.push({
      prefix: pattern.slice(0, -2),
      directory: toDirectory(target, parsed.compilerOptions?.baseUrl),
    })
  }

  candidates.sort((a, b) => a.directory.split('/').length - b.directory.split('/').length)
  return candidates[0] ?? null
}

/**
 * Builds the default locations of a project.
 *
 * @param guess Inferred alias, or `null` for a project without an alias.
 *
 * @example
 * defaultAliases({ prefix: '@', directory: 'src' })
 * // { import: '@/odoro', directory: 'src/odoro' }
 */
export function defaultAliases(guess: AliasGuess | null): {
  import: string
  directory: string
} {
  if (guess === null) {
    // Without an alias, the prefix stays the path itself — it names the
    // destination — but the imports between components will be written
    // relative: a bare path does not resolve. See `isAlias` in `rewrite.ts`.
    return { import: 'src/odoro', directory: 'src/odoro' }
  }
  return {
    import: `${guess.prefix}/odoro`,
    directory: posix.join(guess.directory, 'odoro'),
  }
}

/**
 * Reads every wildcard alias of a `tsconfig.json`, in the shape the engine
 * configuration expects.
 *
 * `guessAlias` looks for **the** prefix of the sources, to write into it. This
 * one returns them **all**, to resolve them. A project declaring both `@/*` and
 * `@ui/*` needs both at import time, while it has a single write destination.
 *
 * @param root Project root.
 * @returns Prefix without a trailing slash towards a relative directory. Empty
 * when the project declares nothing, or when its `tsconfig.json` is unreadable:
 * an alias is a convenience, not a condition to start.
 *
 * @example
 * await guessAliasPaths('.') // { '@': 'src' }
 */
export async function guessAliasPaths(root: string): Promise<Record<string, string>> {
  let raw: string
  try {
    raw = await readFile(join(root, 'tsconfig.json'), 'utf8')
  } catch {
    return {}
  }

  let parsed: TsConfigShape
  try {
    parsed = JSON.parse(stripJsonComments(raw)) as TsConfigShape
  } catch {
    return {}
  }

  const aliases: Record<string, string> = {}
  for (const [pattern, targets] of Object.entries(parsed.compilerOptions?.paths ?? {})) {
    if (!pattern.endsWith('/*')) continue
    const target = targets[0]
    if (target === undefined) continue
    aliases[pattern.slice(0, -2)] = toDirectory(target, parsed.compilerOptions?.baseUrl)
  }
  return aliases
}
