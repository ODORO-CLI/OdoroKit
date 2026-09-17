/**
 * Production build.
 *
 * The HTML document is the starting point: its module script tags designate the
 * entries, and it is rewritten at the end to point at the hashed files.
 *
 * @module
 */

import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { basename, join, relative, resolve, sep } from 'node:path'
import { gzipSync } from 'node:zlib'

import { type BuildResult, build as esbuild } from 'esbuild'

import type { ResolvedConfig } from '../config.js'
import * as log from '../shared/logger.js'
import { esbuildPluginsFrom, transformHtmlWith } from '../plugins.js'
import { sourcePlugin } from '../shared/source.js'
import { extractEntries } from '../dev/server.js'
import { prune, wordsIn } from './prune.js'
import { cssProviderFor } from './css-provider.js'
import { aliasPlugin } from './alias-plugin.js'
import { assetUrls, buildManifest, chunksFor } from './manifest.js'
import { prerender } from './prerender.js'
import { assetsPlugin } from './assets.js'
import { ASSET_EXTENSIONS } from '../dev/transform.js'

/** Normalises a path to URL separators. */
function toPosix(path: string): string {
  return path.split(sep).join('/')
}

/** A file produced by the build. */
export interface BuiltFile {
  /** Path relative to the output directory. */
  readonly path: string
  /** Size in bytes. */
  readonly bytes: number
  /**
   * Size once compressed, for text files.
   *
   * That is the one that counts: no server ships uncompressed JavaScript.
   * Announcing the raw bytes makes every bundle look three times heavier than
   * it arrives, and makes any trade-off on weight wrong.
   */
  readonly gzip?: number
}

/** Result of a production build. */
export interface BuildOutput {
  /** Output directory. */
  readonly outDir: string
  /** Files produced, from largest to smallest. */
  readonly files: readonly BuiltFile[]
  /** Total duration, in milliseconds. */
  readonly elapsed: number
}

/** The extensions whose compressed size is announced. */
const COMPRESSIBLE = ['.js', '.mjs', '.css', '.html', '.json', '.svg', '.txt', '.md']

/**
 * Finds, in the build report, the files produced for a given entry.
 *
 * The stylesheet is attached through the `cssBundle` field of the report, and
 * not through a name match: the hashes of the script and of the stylesheet are
 * computed separately and do not coincide.
 */
function outputsForEntry(
  result: BuildResult<{ metafile: true }>,
  entry: string,
  outDir: string,
  root: string,
): { script: string | undefined; key: string | undefined; styles: string[] } {
  // The paths of the report are relative to the working directory of the
  // bundler — the project root — and not to the current directory.
  const toRelative = (file: string): string =>
    toPosix(relative(outDir, resolve(root, file)))

  for (const [file, meta] of Object.entries(result.metafile.outputs)) {
    if (meta.entryPoint === undefined) continue
    if (resolve(root, meta.entryPoint) !== resolve(entry)) continue
    if (!file.endsWith('.js')) continue

    return {
      script: toRelative(file),
      // The key of the report, as it is: it is what the chunks are followed by,
      // and converting it would make it impossible to find.
      key: file,
      styles: meta.cssBundle === undefined ? [] : [toRelative(meta.cssBundle)],
    }
  }

  return { script: undefined, key: undefined, styles: [] }
}

/**
 * Trims the stylesheet to the real needs of the application.
 *
 * ## Two paths, and why the first is better
 *
 * **Generating**, when the project provides a generator: exactly the rules in
 * use are produced. Nothing useless is ever created.
 *
 * **Pruning**, otherwise: we start from the shipped stylesheet and remove what
 * nothing reaches. That is the right answer as long as the stylesheet arrives
 * pre-generated, but it is a detour — produce everything to throw away almost
 * all of it.
 *
 * ## What is never touched, in both cases
 *
 * The CSS of the application. The produced bundle holds the library stylesheet
 * **and** the styles written by the project; replacing them wholesale would
 * erase them. Generation therefore removes only the prefixed utilities, then
 * adds back the ones in use — the variables, the reset and the semantic classes
 * of the application pass through untouched.
 *
 * ## Why after bundling
 *
 * A utility class does not come only from the application source: the library
 * components carry their own, in their already compiled JavaScript. Reading the
 * source alone would remove everything they need, and the interface would
 * arrive unstyled — without any error being raised, since missing CSS breaks
 * nothing, it just paints nothing.
 */
async function trimStylesheets(
  result: BuildResult<{ metafile: true }>,
  config: ResolvedConfig,
  html: string,
): Promise<void> {
  const outputs = Object.keys(result.metafile.outputs).map((f) => resolve(config.root, f))

  const stylesheets = outputs.filter((f) => f.endsWith('.css'))
  if (stylesheets.length === 0) return

  // Everything that ships, document included: a class may exist only in the
  // index.
  const sources = [html]
  for (const file of outputs) {
    if (file.endsWith('.js')) sources.push(await readFile(file, 'utf8'))
  }

  const provider = await cssProviderFor(config.root)

  const used = new Set<string>()
  if (provider !== undefined) {
    for (const source of sources) for (const word of wordsIn(source)) used.add(word)
    for (const kept of config.build.safelist) {
      if (typeof kept === 'string') used.add(kept)
    }
  }

  for (const stylesheet of stylesheets) {
    const before = await readFile(stylesheet, 'utf8')

    if (provider === undefined) {
      const report = prune(before, sources, { safelist: config.build.safelist })
      await writeFile(stylesheet, report.css, 'utf8')

      log.info(
        `  ${log.colors.dim('pruning')} ${basename(stylesheet)}  ` +
          `${log.size(report.bytesBefore)} → ${log.size(report.bytesAfter)}  ` +
          `${log.colors.dim(`${String(report.kept)} classes kept`)}`,
      )
      continue
    }

    // A pruning run with an empty set removes **every** prefixed utility and
    // keeps only the rest: base, reset, and the CSS of the application.
    const base = prune(before, [], {}).css
    const utilities = provider.renderUtilitiesFor(used)
    const after = `${base}\n${utilities}`

    await writeFile(stylesheet, after, 'utf8')

    log.info(
      `  ${log.colors.dim('generating')} ${basename(stylesheet)}  ` +
        `${log.size(Buffer.byteLength(before))} → ${log.size(Buffer.byteLength(after))}`,
    )
  }
}

/**
 * Builds a project for production.
 *
 * @param config Resolved configuration of the project.
 *
 * @example
 * const output = await buildProject(await loadConfig(process.cwd()))
 */
export async function buildProject(config: ResolvedConfig): Promise<BuildOutput> {
  const started = Date.now()

  const indexFile = join(config.root, 'index.html')
  if (!existsSync(indexFile)) {
    throw new Error(`[odoro] No "index.html" at the project root (${config.root}).`)
  }

  const html = await readFile(indexFile, 'utf8')
  const entries = extractEntries(html, config.root)
  if (entries.length === 0) {
    throw new Error(
      '[odoro] No entry point: "index.html" must hold a <script type="module" src="...">.',
    )
  }

  await rm(config.outDir, { recursive: true, force: true })
  await mkdir(config.outDir, { recursive: true })

  // The files dropped by the side builds — those of the workers — do not appear
  // in the report of the main build.
  const sideOutputs = new Set<string>()

  const result = await esbuild({
    entryPoints: [...entries],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: config.build.target,
    splitting: true,
    minify: config.build.minify,
    sourcemap: config.build.sourcemap,
    metafile: true,
    outdir: join(config.outDir, 'assets'),
    absWorkingDir: config.root,
    publicPath: `${config.base}assets`,
    // The hashes make the files immutable: they can be cached indefinitely, and
    // a deployment only invalidates what has changed.
    entryNames: '[name]-[hash]',
    chunkNames: 'chunk-[hash]',
    assetNames: '[name]-[hash]',
    jsx: 'automatic',
    logLevel: 'silent',
    define: {
      'import.meta.env': JSON.stringify(config.envClient),
      'process.env.NODE_ENV': JSON.stringify('production'),
      ...config.define,
    },
    /*
     * La meme liste que celle du serveur de developpement, et non une copie.
     *
     * Les deux ont diverge : le `.ttf` manquait aux deux, et rien ne l aurait
     * dit tant qu un gabarit n en embarquerait pas. Une seule liste ne peut
     * plus se desaccorder d elle-meme.
     */
    loader: Object.fromEntries(ASSET_EXTENSIONS.map((suffixe) => [suffixe, 'file'])),
    plugins: [
      // The order is that of resolution: the suffixes first, because they
      // change the target; the aliases next; the pass over the sources last, it
      // resolves nothing.
      assetsPlugin(config, { outputs: sideOutputs }),
      aliasPlugin(config),
      sourcePlugin({ root: config.root, plugins: config.plugins, dev: false }),
      ...esbuildPluginsFrom(config.plugins),
    ],
  })

  if (config.build.prune) await trimStylesheets(result, config, html)

  const assetsDir = join(config.outDir, 'assets')
  const context = { root: config.root, assetsDir, entries }

  // Rewriting the document: every tag points at the hashed file.
  let output = html
  for (const entry of entries) {
    const { script, key, styles } = outputsForEntry(result, entry, assetsDir, config.root)
    if (script === undefined || key === undefined) continue

    const original = new RegExp(
      `<script[^>]*type=["']module["'][^>]*src=["'][^"']*${basename(entry)}["'][^>]*></script>`,
      'i',
    )

    // The preload comes before the script: the browser reads the document top
    // to bottom, and a declaration placed after the tag it serves advances
    // nothing.
    const chunks = config.build.preload ? chunksFor(result, key, context) : []

    const tags = [
      ...styles.map(
        (style) => `<link rel="stylesheet" href="${config.base}assets/${style}">`,
      ),
      ...chunks.map(
        (chunk) =>
          `<link rel="modulepreload" crossorigin href="${config.base}assets/${chunk}">`,
      ),
      `<script type="module" crossorigin src="${config.base}assets/${script}"></script>`,
    ].join('\n    ')

    output = output.replace(original, tags)
  }

  // The document serves twice: written as it is at the root, and filled once
  // per route during the prerender. Plugins see it only once per page —
  // applying them here **and** there placed the same tag twice.
  await writeFile(
    join(config.outDir, 'index.html'),
    await transformHtmlWith(config.plugins, output, { dev: false, route: '/' }),
    'utf8',
  )

  if (config.build.manifest) {
    await writeFile(
      join(config.outDir, 'manifest.json'),
      `${JSON.stringify(buildManifest(result, context), undefined, 2)}\n`,
      'utf8',
    )
  }

  if (existsSync(config.publicDir)) {
    await cp(config.publicDir, config.outDir, { recursive: true })
  }

  // The prerender comes last: it starts from the **already rewritten**
  // document, the one the visitor will receive, and merely fills its container.
  // Doing it earlier would produce pages pointing at files without a hash.
  if (config.build.prerender !== undefined) {
    await prerender(config, output, {
      outputs: sideOutputs,
      ssr: true,
      urls: assetUrls(result, context, config.base),
    })
  }

  // The sizes are read from disk, and not from the bundler report: that one
  // describes what esbuild wrote, before pruning touched it. A summary
  // announcing 1.7 MB while shipping 65 kB is worse than none — it makes you
  // believe nothing worked.
  const all = new Set<string>([
    ...Object.keys(result.metafile.outputs).map((file) => resolve(config.root, file)),
    ...sideOutputs,
  ])

  const files: BuiltFile[] = (
    await Promise.all(
      [...all].map(async (path) => {
        const relativePath = toPosix(relative(config.outDir, path))
        const bytes = (await stat(path)).size

        if (!COMPRESSIBLE.some((extension) => relativePath.endsWith(extension))) {
          return { path: relativePath, bytes }
        }

        return {
          path: relativePath,
          bytes,
          gzip: gzipSync(await readFile(path), { level: 9 }).byteLength,
        }
      }),
    )
  ).sort((a, b) => b.bytes - a.bytes)

  return { outDir: config.outDir, files, elapsed: Date.now() - started }
}

/** Prints the summary of a build. */
export function reportBuild(output: BuildOutput, root: string): void {
  const directory = toPosix(relative(root, output.outDir)) || '.'
  let total = 0
  let compressed = 0

  for (const file of output.files) {
    // A source map is never requested by the page: only a development tool
    // downloads it, and only when it is opened. Counting it in the total
    // announced 1.7 MB for a site that ships 90 kB — a wrong figure, and wrong
    // in the direction that makes you give up useful things.
    if (file.path.endsWith('.map')) continue

    total += file.bytes
    compressed += file.gzip ?? file.bytes

    const weight =
      file.gzip === undefined
        ? log.size(file.bytes)
        : `${log.size(file.bytes)} ${log.colors.dim('|')} ${log.size(file.gzip)} gzip`

    log.info(
      `  ${log.colors.dim(`${directory}/`)}${file.path}  ${log.colors.dim(weight)}`,
    )
  }

  log.success(
    `built in ${log.duration(output.elapsed)} — ${log.size(total)} shipped, ` +
      `${log.size(compressed)} over the wire` +
      log.colors.dim(' (source maps excluded)'),
  )
}
