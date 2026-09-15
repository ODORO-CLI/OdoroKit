/**
 * Prebundling of the dependencies.
 *
 * Two reasons make it indispensable, and not optional:
 *
 * 1. many packages are still distributed only as CommonJS modules, which the
 *    browser cannot load;
 * 2. a dependency split into hundreds of small files would trigger as many
 *    requests on the first load.
 *
 * The trap lies elsewhere: if `react` and `react-dom/client` were bundled
 * separately, each would carry its own copy of React. Two instances of React in
 * the same page break hooks and contexts, with baffling symptoms. Every
 * specifier is therefore **bundled in a single pass**, with splitting: the
 * common code ends up in a shared chunk, and the instance stays unique.
 *
 * @module
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { type Plugin, build } from 'esbuild'

import type { ResolvedConfig } from '../config.js'
import { sourcePlugin } from '../shared/source.js'
import { readSuffix } from '../shared/suffixes.js'
import { inspectDependency, renderInteropProxy } from './interop.js'
import {
  ASSET_EXTENSIONS,
  STYLE_EXTENSIONS,
  applyAlias,
  depFileName,
  hasExtension,
  isBareSpecifier,
} from './transform.js'

export { depFileName }

/** Name of the file describing the state of the cache. */
const MANIFEST = 'manifest.json'

/** Recorded state of the dependency cache. */
interface DepsManifest {
  /** Hash of the bundled set. */
  hash: string
  /** Specifiers available. */
  specifiers: string[]
}

/** Result of the prebundling. */
export interface OptimizedDeps {
  /** Directory holding the bundled modules. */
  readonly directory: string
  /** Specifiers available. */
  readonly specifiers: readonly string[]
  /** `true` when a build actually took place. */
  readonly rebuilt: boolean
}

/** Plugin that records the bare specifiers without following them. */
function collectBareImports(config: ResolvedConfig, found: Set<string>): Plugin {
  return {
    name: 'odoro-scan-deps',
    setup(builder) {
      builder.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === 'entry-point') return null

        const aliased = applyAlias(args.path, config)

        // A suffixed import designates the file as something other than a
        // module: `?raw` wants its text, `?url` its address, `?worker` a
        // worker. The scan has nothing to look for there, and trying to load
        // them made it fail as soon as a `.md` was imported — so before the
        // server even opened, on an error that spoke of a missing loader.
        if (readSuffix(aliased) !== undefined) {
          return { path: aliased, external: true }
        }

        // Stylesheets and assets are not JavaScript modules: following them
        // would make the scan fail, and they have no business in the dependency
        // cache anyway.
        if (
          hasExtension(aliased, STYLE_EXTENSIONS) ||
          hasExtension(aliased, ASSET_EXTENSIONS)
        ) {
          return { path: aliased, external: true }
        }

        if (!isBareSpecifier(aliased)) return null
        found.add(aliased)
        return { path: aliased, external: true }
      })
    },
  }
}

/**
 * Walks the project code looking for the dependencies actually imported,
 * transitively.
 *
 * Relying on the `dependencies` field of the manifest would not be enough: an
 * application imports `react-dom/client`, never plain `react-dom`.
 *
 * @param entries Entry points of the project, as absolute paths.
 *
 * @example
 * const specifiers = await scanDependencies(config, ['/project/src/main.tsx'])
 */
export async function scanDependencies(
  config: ResolvedConfig,
  entries: readonly string[],
): Promise<string[]> {
  const found = new Set<string>()
  const existing = entries.filter((entry) => existsSync(entry))
  if (existing.length === 0) return []

  await build({
    entryPoints: [...existing],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    logLevel: 'silent',
    absWorkingDir: config.root,
    jsx: 'automatic',
    // The server compiles with the development JSX: without this setting, the
    // scan would look for `react/jsx-runtime` where the browser will ask for
    // `react/jsx-dev-runtime`, and the dependency would be missing.
    jsxDev: true,
    // The same pass as the build one: a module reached by a pattern is a module
    // of the project, and its dependencies must be prebundled like the others.
    // Without that, a page loaded only through `import.meta.glob` would ask at
    // runtime for a dependency the cache does not hold.
    plugins: [
      collectBareImports(config, found),
      sourcePlugin({ root: config.root, plugins: config.plugins, dev: true }),
    ],
  })

  return [...found].sort()
}

/**
 * Bundles a set of specifiers in a single pass.
 *
 * @param config Resolved configuration of the project.
 * @param specifiers Specifiers to bundle.
 * @param force Rebuilds even when the cache looks valid.
 *
 * @example
 * const deps = await optimizeDeps(config, ['react', 'react-dom/client'])
 */
export async function optimizeDeps(
  config: ResolvedConfig,
  specifiers: readonly string[],
  force = false,
): Promise<OptimizedDeps> {
  try {
    return await buildDeps(config, specifiers, force)
  } catch (cause) {
    // Two servers started on the same project bundle the same cache: one erases
    // the directory while the other writes into it, and the read fails on a
    // file that existed a millisecond earlier.
    //
    // The case has become common since the server slides to a free port instead
    // of stopping: `npm run dev` twice in a row now starts two servers.
    //
    // A second attempt is enough: the one that won the race has finished, its
    // manifest is written, and the fast path picks it up without rebuilding
    // anything.
    if (!isRaceError(cause)) throw cause

    await new Promise((next) => setTimeout(next, RACE_DELAY))
    return buildDeps(config, specifiers, force)
  }
}

/** The time left to the other process to finish what it started. */
const RACE_DELAY = 400

/**
 * Does the failure come from another process working in the same place?
 *
 * These codes say that a file has disappeared or that it is held elsewhere.
 * Everything else — a package not found, a build error — is a real project
 * error: retrying would only repeat it later.
 */
function isRaceError(cause: unknown): boolean {
  const code = (cause as NodeJS.ErrnoException | null)?.code
  return code === 'ENOENT' || code === 'EPERM' || code === 'EBUSY'
}

/** Bundles the dependency cache. See `optimizeDeps` for the retry. */
async function buildDeps(
  config: ResolvedConfig,
  specifiers: readonly string[],
  force: boolean,
): Promise<OptimizedDeps> {
  const directory = join(config.root, 'node_modules', '.odoro', 'deps')
  const sorted = [...specifiers].sort()

  const hash = createHash('sha256')
    .update(JSON.stringify(sorted))
    .update(await lockfileFingerprint(config.root))
    .update(entriesFingerprint(config.root, sorted))
    // The engine version is part of the key: a fix in the prebundling itself
    // must expire the cache, otherwise a project keeps serving files produced
    // by the previous version.
    .update(engineVersion())
    .digest('hex')
    .slice(0, 16)

  const manifestPath = join(directory, MANIFEST)

  if (!force && existsSync(manifestPath)) {
    const previous = JSON.parse(await readFile(manifestPath, 'utf8')) as DepsManifest
    if (previous.hash === hash) {
      return { directory, specifiers: previous.specifiers, rebuilt: false }
    }
  }

  await rm(directory, { recursive: true, force: true })
  await mkdir(directory, { recursive: true })

  if (sorted.length > 0) {
    // CommonJS packages go through an intermediate module declaring their named
    // exports; native modules are bundled directly.
    const proxies = join(directory, 'proxies')
    await mkdir(proxies, { recursive: true })

    const entryPoints: { in: string; out: string }[] = []

    for (const specifier of sorted) {
      const out = depFileName(specifier).replace(/\.js$/, '')
      const info = inspectDependency(specifier, config.root)

      if (!info.needsInterop) {
        entryPoints.push({ in: specifier, out })
        continue
      }

      const proxy = join(proxies, `${out}.js`)
      await writeFile(proxy, renderInteropProxy(info), 'utf8')
      entryPoints.push({ in: proxy, out })
    }

    await build({
      // The output names are imposed: a specifier with a subpath would
      // otherwise produce a directory tree, and two different packages could
      // fight over the same file name.
      entryPoints,
      bundle: true,
      format: 'esm',
      platform: 'browser',
      target: 'es2022',
      splitting: true,
      outdir: directory,
      absWorkingDir: config.root,
      logLevel: 'silent',
      define: { 'process.env.NODE_ENV': JSON.stringify('development') },
      loader: { '.woff': 'file', '.woff2': 'file', '.svg': 'dataurl' },
    })

    await rm(proxies, { recursive: true, force: true })
  }

  const manifest: DepsManifest = { hash, specifiers: sorted }
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')

  return { directory, specifiers: sorted, rebuilt: true }
}

/** Version of the engine, read only once from its own manifest. */
let cachedVersion: string | undefined

function engineVersion(): string {
  if (cachedVersion !== undefined) return cachedVersion

  let directory = dirname(fileURLToPath(import.meta.url))
  for (let depth = 0; depth < 6; depth += 1) {
    const manifest = join(directory, 'package.json')
    if (existsSync(manifest)) {
      try {
        const parsed = JSON.parse(readFileSync(manifest, 'utf8')) as {
          name?: string
          version?: string
        }
        if (parsed.name === 'odoro') {
          cachedVersion = parsed.version ?? 'unknown'
          return cachedVersion
        }
      } catch {
        break
      }
    }
    const parent = dirname(directory)
    if (parent === directory) break
    directory = parent
  }

  cachedVersion = 'unknown'
  return cachedVersion
}

/**
 * Fingerprint of the entry files of the dependencies.
 *
 * ## Why the lockfile is not enough
 *
 * A lockfile changes when a **version** changes. A dependency linked from the
 * same repository — the case of any monorepo that develops its own library —
 * keeps the same version from one end of the work to the other, while its
 * `dist/` is rebuilt ten times a day.
 *
 * Without this fingerprint, the server keeps serving the previous prebundle,
 * and the browser asks for an export that did not exist yet. The error says
 * nothing about its cause — it speaks of a module that "does not provide" an
 * export the source code does in fact export.
 *
 * The modification date and the size are enough: reading the content of every
 * entry on each start would cost more than the prebundling itself.
 *
 * A specifier that does not resolve is ignored: this is not where a missing
 * dependency is reported, and failing while computing a cache key would stop
 * the server from starting for an unrelated reason.
 */
function entriesFingerprint(root: string, specifiers: readonly string[]): string {
  const resolver = createRequire(pathToFileURL(join(root, 'package.json')))
  const parts: string[] = []

  for (const name of packageNames(specifiers)) {
    parts.push(`${name}:${packageFingerprint(name, resolver)}`)
  }

  return parts.join('|')
}

/** Reduces specifiers to the list of packages they designate. */
function packageNames(specifiers: readonly string[]): string[] {
  const names = new Set<string>()

  for (const specifier of specifiers) {
    const segments = specifier.split('/')
    names.add(
      specifier.startsWith('@') && segments.length > 1
        ? `${segments[0] ?? ''}/${segments[1] ?? ''}`
        : (segments[0] ?? specifier),
    )
  }

  return [...names].sort()
}

/**
 * Fingerprint of the files a package publishes.
 *
 * ## Why not resolve the specifier directly
 *
 * `require.resolve` applies the `require` condition. A pure ESM package
 * declares none, the resolution fails, and the fingerprint becomes constant:
 * the cache never invalidates again. That was the case of every package of the
 * repository, that is, exactly those that are rebuilt ten times a day.
 *
 * The manifest, for its part, is always reachable — `./package.json` appears in
 * the export map of any correct package, and the resolver otherwise falls back
 * on the file path. From there, the targets declared in `exports` give the
 * files actually served.
 */
function packageFingerprint(name: string, resolver: NodeJS.Require): string {
  let manifestPath: string
  try {
    manifestPath = resolver.resolve(`${name}/package.json`)
  } catch {
    return 'not-found'
  }

  let manifest: { exports?: unknown; main?: unknown; module?: unknown }
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as typeof manifest
  } catch {
    return 'unreadable'
  }

  const directory = dirname(manifestPath)
  const targets = new Set<string>()

  /** Records every string that looks like a file path. */
  const collect = (node: unknown): void => {
    if (typeof node === 'string') {
      if (node.startsWith('./')) targets.add(node)
      return
    }
    if (typeof node === 'object' && node !== null) {
      for (const value of Object.values(node)) collect(value)
    }
  }

  collect(manifest.exports)
  collect(manifest.main)
  collect(manifest.module)

  const parts: string[] = [String(statSafe(manifestPath))]
  for (const target of [...targets].sort()) {
    parts.push(`${target}:${String(statSafe(join(directory, target)))}`)
  }

  return parts.join(',')
}

/** Date and size of a file, or zero when it does not exist. */
function statSafe(path: string): string {
  try {
    const stats = statSync(path)
    return `${String(stats.mtimeMs)}-${String(stats.size)}`
  } catch {
    return '0'
  }
}

/**
 * Fingerprint of the lockfile, when there is one: an updated dependency must
 * invalidate the cache even when the list of specifiers has not moved.
 */
async function lockfileFingerprint(root: string): Promise<string> {
  for (const name of ['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'bun.lock']) {
    const file = join(root, name)
    if (!existsSync(file)) continue
    return createHash('sha256')
      .update(await readFile(file))
      .digest('hex')
  }
  return 'no-lockfile'
}
