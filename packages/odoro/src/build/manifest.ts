/**
 * The build manifest, and the preloading it enables.
 *
 * ## Two needs, a single reading
 *
 * The bundler report knows everything: which file comes from which source,
 * which stylesheet goes with which script, which chunk is shared by which
 * modules. It is written in a format of its own, and it disappears at the end
 * of the build.
 *
 * Two things depend on it. A server that places the tags itself — because the
 * document is rendered elsewhere, by a template engine or by the back end —
 * needs to know what to point at; that is `manifest.json`. And the browser
 * gains from knowing the chunks **before** having read the module that imports
 * them; that is preloading.
 *
 * @module
 */

import { relative, resolve, sep } from 'node:path'

import type { BuildResult } from 'esbuild'

/** Normalises a path to URL separators. */
function toUrlPath(path: string): string {
  return path.split(sep).join('/')
}

/** What the manifest says about a produced file. */
export interface ManifestEntry {
  /** Path of the produced file, relative to the output directory. */
  readonly file: string
  /** Source it comes from, relative to the root. Absent for a chunk. */
  readonly src?: string
  /** True when it is an entry of the document. */
  readonly isEntry?: boolean
  /** Stylesheets to place alongside it. */
  readonly css?: readonly string[]
  /** Chunks it imports statically, by their key in the manifest. */
  readonly imports?: readonly string[]
  /** Chunks it imports on demand. */
  readonly dynamicImports?: readonly string[]
}

/** The whole manifest. */
export type Manifest = Readonly<Record<string, ManifestEntry>>

/** What is needed to read the report. */
interface Context {
  /** Project root — the paths of the report are relative to it. */
  readonly root: string
  /** Directory where the produced files are written. */
  readonly assetsDir: string
  /**
   * The entries of the document, as absolute paths.
   *
   * ## Why they have to be given
   *
   * The report assigns an `entryPoint` to every module that **opens a chunk** —
   * so to every module imported on demand, which splitting isolates by
   * construction. Taking those for document entries would make a server place
   * one `<script>` tag per lazy page: everything would be loaded up front, and
   * splitting would have served no purpose.
   *
   * Only the document knows which ones are its own.
   */
  readonly entries?: readonly string[]
}

/** Turns a report path into a path relative to the produced files directory. */
function outputPath(file: string, context: Context): string {
  return toUrlPath(relative(context.assetsDir, resolve(context.root, file)))
}

/**
 * Builds the manifest from the build report.
 *
 * The keys are the **sources** for the entries — that is the name a server
 * looks them up under, `src/main.tsx` and not `main-A1B2.js`, which it cannot
 * guess — and the produced file for the chunks, which have no single source.
 *
 * @example
 * const manifest = buildManifest(result, { root, assetsDir })
 * manifest['src/main.tsx'].file // 'main-A1B2.js'
 */
export function buildManifest(
  result: BuildResult<{ metafile: true }>,
  context: Context,
): Manifest {
  const outputs = result.metafile.outputs

  // From the produced file to its manifest key: the import lists of the report
  // name files, the manifest names keys.
  const keys = new Map<string, string>()
  for (const [file, meta] of Object.entries(outputs)) {
    if (!file.endsWith('.js')) continue
    keys.set(
      file,
      meta.entryPoint === undefined
        ? outputPath(file, context)
        : toUrlPath(relative(context.root, resolve(context.root, meta.entryPoint))),
    )
  }

  const entries = new Set((context.entries ?? []).map((entry) => resolve(entry)))
  const manifest: Record<string, ManifestEntry> = {}

  for (const [file, meta] of Object.entries(outputs)) {
    if (!file.endsWith('.js')) continue

    const key = keys.get(file)
    if (key === undefined) continue

    const statics: string[] = []
    const dynamics: string[] = []

    for (const imported of meta.imports) {
      const target = keys.get(imported.path)
      if (target === undefined || target === key) continue
      if (imported.kind === 'dynamic-import') dynamics.push(target)
      else if (imported.kind === 'import-statement') statics.push(target)
    }

    const stylesheets =
      meta.cssBundle === undefined ? [] : [outputPath(meta.cssBundle, context)]

    const source =
      meta.entryPoint === undefined ? undefined : resolve(context.root, meta.entryPoint)

    manifest[key] = {
      file: outputPath(file, context),
      ...(source === undefined
        ? {}
        : { src: key, ...(entries.has(source) ? { isEntry: true as const } : {}) }),
      ...(stylesheets.length > 0 ? { css: stylesheets } : {}),
      ...(statics.length > 0 ? { imports: [...new Set(statics)].sort() } : {}),
      ...(dynamics.length > 0 ? { dynamicImports: [...new Set(dynamics)].sort() } : {}),
    }
  }

  return manifest
}

/**
 * The chunks to preload for a given entry.
 *
 * ## Why the transitive ones count
 *
 * The browser discovers a chunk by reading the module that imports it. A chunk
 * imported by a chunk therefore only appears on the third round trip — one per
 * level of depth, each on the critical path, and splitting multiplies them by
 * construction.
 *
 * Declaring them all up front puts them in flight at the same time.
 *
 * ## What is not in there
 *
 * The imports on demand. Those are the ones deliberately deferred — a page the
 * visitor may never open. Preloading them would cancel the splitting while
 * keeping its cost.
 *
 * @param entry The produced file for the entry, as the report names it.
 * @returns The files to preload, relative to the produced files directory.
 */
export function chunksFor(
  result: BuildResult<{ metafile: true }>,
  entry: string,
  context: Context,
): string[] {
  const outputs = result.metafile.outputs
  const seen = new Set<string>([entry])
  const stack = [entry]
  const rendered: string[] = []

  while (stack.length > 0) {
    const current = stack.pop()
    if (current === undefined) continue

    for (const imported of outputs[current]?.imports ?? []) {
      if (imported.kind !== 'import-statement') continue
      if (!imported.path.endsWith('.js') || seen.has(imported.path)) continue
      seen.add(imported.path)
      stack.push(imported.path)
      rendered.push(outputPath(imported.path, context))
    }
  }

  return rendered.sort()
}

/**
 * The public addresses assigned to the assets copied as they are.
 *
 * These are the images, fonts and videos a module imported: the bundler copies
 * them under a hash, and only its report says which. The prerender needs them
 * to write the same addresses as the client.
 *
 * @param base Public prefix of the site.
 * @returns From the absolute path of the source to its public address.
 */
export function assetUrls(
  result: BuildResult<{ metafile: true }>,
  context: Context,
  base: string,
): Map<string, string> {
  const rendered = new Map<string, string>()

  for (const [file, meta] of Object.entries(result.metafile.outputs)) {
    if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.map')) {
      continue
    }
    // A copied asset has a single source. Several inputs would signal a bundle,
    // not a copy: there would be no way to know whom to assign the address to.
    const sources = Object.keys(meta.inputs)
    if (sources.length !== 1) continue
    const source = sources[0]
    if (source === undefined) continue

    rendered.set(
      resolve(context.root, source),
      `${base}assets/${outputPath(file, context)}`,
    )
  }

  return rendered
}
