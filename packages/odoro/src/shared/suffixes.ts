/**
 * Import suffixes: `?worker`, `?raw`, `?url`.
 *
 * ## Why a suffix rather than an inference
 *
 * A file can be wanted in three ways: executed, read, or merely located.
 * Nothing in its extension says which — the same `.ts` is a module here and a
 * worker there, the same `.md` is a text here and an address there.
 *
 * The suffix says it at the place where the question arises, that is, at the
 * import. That is also what makes it readable on a second pass: `?raw`
 * announces a string, where a folder convention would have required going to
 * check elsewhere.
 *
 * @module
 */

/** The recognised suffixes. */
export const SUFFIXES = ['worker', 'raw', 'url'] as const

/** A recognised suffix. */
export type Suffix = (typeof SUFFIXES)[number]

/** Matches a suffix at the end of a specifier. */
const MARKER = /\?(worker|raw|url)$/

/**
 * Reads the suffix of an import specifier.
 *
 * @returns The suffix and the specifier without it, or `undefined`.
 *
 * @example
 * readSuffix('./compute.ts?worker') // { suffix: 'worker', path: './compute.ts' }
 * readSuffix('./compute.ts')        // undefined
 */
export function readSuffix(
  specifier: string,
): { suffix: Suffix; path: string } | undefined {
  const found = MARKER.exec(specifier)
  const suffix = found?.[1]
  if (suffix === undefined) return undefined
  return {
    suffix: suffix as Suffix,
    path: specifier.slice(0, specifier.length - suffix.length - 1),
  }
}

/**
 * The module a `?worker` import returns.
 *
 * ## Why a class and not an instance
 *
 * A worker is expensive and cannot be shared: returning the instance would
 * force the whole page to use the same one, and the first caller would decide
 * for the others. The class lets everyone open one, and close it.
 *
 * ## Why `type: 'module'`
 *
 * The file is served as a module — in development by the server, in production
 * by the split bundle. A classic worker cannot read an `import`, and would fail
 * on the first line.
 *
 * @example
 * workerModule('/assets/compute-A1B2.js')
 */
export function workerModule(url: string): string {
  return `const source = ${JSON.stringify(url)}

export default class OdoroWorker extends Worker {
  constructor(options) {
    super(source, { type: 'module', ...options })
  }
}
`
}

/** The module a `?raw` import returns. */
export function textModule(content: string): string {
  return `export default ${JSON.stringify(content)}\n`
}

/** The module a `?url` import returns. */
export function urlModule(url: string): string {
  return `export default ${JSON.stringify(url)}\n`
}
