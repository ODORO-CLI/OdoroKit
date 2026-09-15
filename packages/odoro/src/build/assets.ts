/**
 * Suffixed imports, on the build side: `?worker`, `?raw`, `?url`.
 *
 * @module
 */

import { readFile } from 'node:fs/promises'
import { basename, join, relative, resolve, sep } from 'node:path'

import { type Plugin, build as esbuild } from 'esbuild'

import type { ResolvedConfig } from '../config.js'
import { esbuildPluginsFrom } from '../plugins.js'
import { sourcePlugin } from '../shared/source.js'
import { readSuffix, urlModule, textModule, workerModule } from '../shared/suffixes.js'
import { aliasPlugin } from './alias-plugin.js'

/** What changes between the client build and the prerender. */
export interface AssetOptions {
  /**
   * Receives the paths of the files written **outside** the main build — those
   * of the workers. Without it, they would appear in no summary: the report of
   * the main build does not know them, and a hundred-kilobyte bundle would land
   * in the output directory without anything announcing it.
   */
  readonly outputs: Set<string>
  /**
   * True during the prerender.
   *
   * It builds nothing new: everything has already been produced for the client,
   * and doing it again would drop a second copy of each asset, under another
   * hash.
   */
  readonly ssr?: boolean
  /**
   * The public addresses already assigned, from the source file to its URL.
   *
   * ## Why they must be the same
   *
   * An image written in the prerendered HTML and the same image loaded by the
   * script must point to the same place. Letting the prerender recompute the
   * address would produce two hashes for a single file: one exists, the other
   * does not, and the prerendered page would show a broken image until
   * hydration replaced it — that is, precisely in front of the people the
   * prerender is for.
   */
  readonly urls?: ReadonlyMap<string, string>
}

/** What a `?worker` import returns during the prerender. */
const WORKER_UNAVAILABLE = `export default class OdoroWorker {
  constructor() {
    throw new Error(
      '[odoro] A worker does not run during prerendering. ' +
        'Construct it from an effect, not at module load.',
    )
  }
}
`

/** The namespaces the suffixed imports land in. */
const NAMESPACES = {
  worker: 'odoro-worker',
  raw: 'odoro-raw',
  url: 'odoro-url',
} as const

/**
 * Builds a worker as a separate bundle.
 *
 * ## Why a separate build
 *
 * A worker shares nothing with the page: no memory, no global context, no
 * loaded modules. Including it in the splitting of the page would produce
 * chunks both sides would import — and the worker would reload the interface
 * code for nothing.
 *
 * @returns The path of the produced file, relative to the produced files
 *   directory.
 */
async function buildWorker(
  file: string,
  config: ResolvedConfig,
  outputs: Set<string>,
): Promise<string> {
  const assetsDir = join(config.outDir, 'assets')

  const result = await esbuild({
    entryPoints: [file],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: config.build.target,
    minify: config.build.minify,
    sourcemap: config.build.sourcemap,
    metafile: true,
    outdir: assetsDir,
    absWorkingDir: config.root,
    entryNames: '[name]-[hash]',
    chunkNames: 'chunk-[hash]',
    assetNames: '[name]-[hash]',
    logLevel: 'silent',
    define: {
      'import.meta.env': JSON.stringify(config.envClient),
      'process.env.NODE_ENV': JSON.stringify('production'),
      ...config.define,
    },
    plugins: [
      aliasPlugin(config),
      sourcePlugin({ root: config.root, plugins: config.plugins, dev: false }),
      ...esbuildPluginsFrom(config.plugins),
    ],
  })

  let entry: string | undefined

  for (const [output, meta] of Object.entries(result.metafile.outputs)) {
    outputs.add(resolve(config.root, output))
    if (meta.entryPoint === undefined || !output.endsWith('.js')) continue
    if (resolve(config.root, meta.entryPoint) !== resolve(file)) continue
    entry = relative(assetsDir, resolve(config.root, output)).split(sep).join('/')
  }

  if (entry !== undefined) return entry

  throw new Error(`[odoro] The build of worker "${basename(file)}" produced nothing.`)
}

/**
 * The plugin that handles the suffixed imports.
 *
 * @example
 * // in the project source
 * import Compute from './compute.ts?worker'
 * import charter from './CHARTER.md?raw'
 * import logo from './logo.svg?url'
 */
export function assetsPlugin(config: ResolvedConfig, options: AssetOptions): Plugin {
  // The same worker imported twice is built only once: without that, two
  // differently hashed files would carry the same code, and the browser would
  // download both.
  const built = new Map<string, Promise<string>>()

  return {
    name: 'odoro-assets',
    setup(builder) {
      builder.onResolve({ filter: /\?(worker|raw|url)$/ }, async (args) => {
        const read = readSuffix(args.path)
        if (read === undefined) return null

        const resolved = await builder.resolve(read.path, {
          kind: 'import-statement',
          resolveDir: args.resolveDir,
          importer: args.importer,
        })
        if (resolved.errors.length > 0) return { errors: resolved.errors }

        return { path: resolved.path, namespace: NAMESPACES[read.suffix] }
      })

      builder.onLoad({ filter: /.*/, namespace: NAMESPACES.raw }, async (args) => ({
        contents: textModule(await readFile(args.path, 'utf8')),
        loader: 'js',
      }))

      // `?url` goes through the file loader of the bundler: it is the one that
      // drops the asset, gives it its hash and returns its public address — the
      // same mechanism as for a directly imported image.
      //
      // During the prerender, nothing is dropped: the address is read back from
      // those the client build has already assigned.
      builder.onLoad({ filter: /.*/, namespace: NAMESPACES.url }, async (args) => {
        if (options.ssr === true) {
          return {
            contents: urlModule(options.urls?.get(resolve(args.path)) ?? ''),
            loader: 'js',
          }
        }
        return { contents: await readFile(args.path), loader: 'file' }
      })

      builder.onLoad({ filter: /.*/, namespace: NAMESPACES.worker }, async (args) => {
        // A worker does not exist outside the browser. The module must still
        // load — the component that imports it is the one being prerendered —
        // so the class is indeed there, and it is its construction that
        // refuses. Returning `undefined` would break the `extends` as soon as
        // the module was read, on an error that would not say why.
        if (options.ssr === true) {
          return { contents: WORKER_UNAVAILABLE, loader: 'js' }
        }

        let building = built.get(args.path)
        if (building === undefined) {
          building = buildWorker(args.path, config, options.outputs)
          built.set(args.path, building)
        }
        return {
          contents: workerModule(`${config.base}assets/${await building}`),
          loader: 'js',
        }
      })
    },
  }
}
