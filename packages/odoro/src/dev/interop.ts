/**
 * Interoperability between CommonJS modules and native modules.
 *
 * The problem, in one sentence: a CommonJS package compiled into an ESM module
 * only comes out with a `default` export. The bundler knows perfectly well how
 * to read `exports.useState = ...` **inside** a bundle, but it cannot
 * statically guess the list of names to declare at the module boundary. The
 * browser, for its part, requires `import { useState } from '/@deps/react.js'`
 * to match a declared export — otherwise it refuses to link the module, before
 * even running it.
 *
 * The workaround is to enumerate the exports of the package **in Node**, at
 * prebundling time, then generate an intermediate module that re-exports them
 * by name. That is the only moment when this list is reliably knowable: at
 * runtime, it is too late.
 *
 * @module
 */

import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

/** What has to be known about a dependency to serve it correctly. */
export interface DepFormat {
  /** Original specifier. */
  readonly specifier: string
  /**
   * `true` when the package is CommonJS and therefore requires an intermediate
   * module declaring its named exports.
   */
  readonly needsInterop: boolean
  /** Named exports detected, `default` excluded. */
  readonly namedExports: readonly string[]
}

/** Valid JavaScript identifiers, the only ones re-exportable by name. */
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/

/** Reserved words, which cannot become binding names. */
const RESERVED = new Set([
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'new',
  'null',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
  'let',
  'static',
  'await',
])

/**
 * Determines the format of a file according to the Node rules: the extension
 * first, then the `type` field of the nearest `package.json`.
 */
function isCommonJsFile(file: string): boolean {
  if (file.endsWith('.mjs')) return false
  if (file.endsWith('.cjs')) return true

  let directory = dirname(file)
  for (let depth = 0; depth < 20; depth += 1) {
    const manifest = join(directory, 'package.json')
    if (existsSync(manifest)) {
      try {
        const parsed = JSON.parse(readFileSync(manifest, 'utf8')) as { type?: string }
        return parsed.type !== 'module'
      } catch {
        return true
      }
    }
    const parent = dirname(directory)
    if (parent === directory) break
    directory = parent
  }

  return true
}

/**
 * Inspects a dependency and determines whether it needs an intermediate module.
 *
 * The inspection loads the package in Node to read its exports. That is the
 * only reliable way — static analysis of a minified CommonJS file fails on the
 * indirect forms — but it stays fallible: a package designed for the browser
 * alone can fail to load. The failure is therefore absorbed, and the dependency
 * treated as a native module.
 *
 * @param specifier Specifier of the package, for example `react-dom/client`.
 * @param root Project root, from which resolution is performed.
 *
 * @example
 * inspectDependency('react', '/project')
 * // { needsInterop: true, namedExports: ['useState', 'useEffect', ...] }
 */
export function inspectDependency(specifier: string, root: string): DepFormat {
  const plain: DepFormat = { specifier, needsInterop: false, namedExports: [] }

  const require = createRequire(join(root, 'index.js'))

  let resolved: string
  try {
    resolved = require.resolve(specifier)
  } catch {
    // A pure ESM package is not resolvable by `require`: that is precisely the
    // case where no intermediate is needed.
    return plain
  }

  if (!isCommonJsFile(resolved)) return plain

  let loaded: unknown
  try {
    loaded = require(specifier)
  } catch {
    return plain
  }

  if (typeof loaded !== 'object' && typeof loaded !== 'function') return plain
  if (loaded === null) return plain

  const namedExports = Object.keys(loaded as Record<string, unknown>).filter(
    (key) => key !== 'default' && IDENTIFIER.test(key) && !RESERVED.has(key),
  )

  return { specifier, needsInterop: true, namedExports }
}

/**
 * Produces the intermediate module of a CommonJS dependency.
 *
 * Destructuring in export position is standard JavaScript: it declares as many
 * exported bindings as there are names, which satisfies the browser, while
 * reading the object only once.
 *
 * @example
 * renderInteropProxy({ specifier: 'react', needsInterop: true, namedExports: ['useState'] })
 * // import cjs from "react"
 * // export default cjs
 * // export const { useState } = cjs
 */
export function renderInteropProxy(info: DepFormat): string {
  const lines = [
    `import cjs from ${JSON.stringify(info.specifier)}`,
    'export default cjs',
  ]

  if (info.namedExports.length > 0) {
    lines.push(`export const { ${info.namedExports.join(', ')} } = cjs`)
  }

  return `${lines.join('\n')}\n`
}
