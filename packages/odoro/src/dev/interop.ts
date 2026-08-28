/**
 * Interoperabilite entre modules CommonJS et modules natifs.
 *
 * Le probleme, en une phrase : un paquet CommonJS compile en module ESM ne
 * ressort qu'avec un export `default`. Le compilateur sait parfaitement lire
 * `exports.useState = ...` **a l'interieur** d'un bundle, mais il ne peut pas
 * deviner statiquement la liste des noms a declarer a la frontiere du module.
 * Le navigateur, lui, exige que `import { useState } from '/@deps/react.js'`
 * corresponde a un export declare — sans quoi il refuse de lier le module,
 * avant meme de l'executer.
 *
 * La parade consiste a enumerer les exports du paquet **dans Node**, au moment
 * de la pre-compilation, puis a generer un module intermediaire qui les
 * re-exporte nommement. C'est le seul moment ou cette liste est connaissable
 * de facon fiable : a l'execution, il est trop tard.
 *
 * @module
 */

import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

/** Ce qu'il faut savoir d'une dependance pour la servir correctement. */
export interface DepFormat {
  /** Specificateur d'origine. */
  readonly specifier: string
  /**
   * `true` si le paquet est en CommonJS et exige donc un module intermediaire
   * declarant ses exports nommes.
   */
  readonly needsInterop: boolean
  /** Exports nommes detectes, hors `default`. */
  readonly namedExports: readonly string[]
}

/** Identifiants JavaScript valides, seuls re-exportables nommement. */
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/

/** Mots reserves, qui ne peuvent pas devenir des noms de liaison. */
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
 * Determine le format d'un fichier selon les regles de Node : l'extension
 * d'abord, puis le champ `type` du `package.json` le plus proche.
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
 * Analyse une dependance et determine si elle demande un module intermediaire.
 *
 * L'analyse charge le paquet dans Node pour lire ses exports. C'est le seul
 * moyen fiable — l'analyse statique d'un fichier CommonJS minifie echoue sur
 * les formes indirectes — mais cela reste faillible : un paquet concu pour le
 * seul navigateur peut echouer au chargement. L'echec est donc absorbe, et la
 * dependance traitee comme un module natif.
 *
 * @param specifier Specificateur du paquet, par exemple `react-dom/client`.
 * @param root Racine du projet, d'ou la resolution est effectuee.
 *
 * @example
 * inspectDependency('react', '/projet')
 * // { needsInterop: true, namedExports: ['useState', 'useEffect', ...] }
 */
export function inspectDependency(specifier: string, root: string): DepFormat {
  const plain: DepFormat = { specifier, needsInterop: false, namedExports: [] }

  const require = createRequire(join(root, 'index.js'))

  let resolved: string
  try {
    resolved = require.resolve(specifier)
  } catch {
    // Un paquet exclusivement ESM n'est pas resoluble par `require` : c'est
    // precisement le cas ou aucun intermediaire n'est necessaire.
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
 * Produit le module intermediaire d'une dependance CommonJS.
 *
 * La destructuration en position d'export est du JavaScript standard : elle
 * declare autant de liaisons exportees que de noms, ce qui satisfait le
 * navigateur, tout en ne lisant l'objet qu'une seule fois.
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
