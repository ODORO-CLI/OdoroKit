/**
 * Configuration of the Odoro engine.
 *
 * The `odoro.config.ts` file is compiled on the fly then imported: it can
 * therefore be written in TypeScript and use the full power of the language,
 * with no prior build step.
 *
 * @module
 */

import { mkdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { build } from 'esbuild'

import { guessAliasPaths } from './add/aliases.js'
import type { OdoroPlugin } from './plugins.js'
import { loadEnv, clientEnv } from './shared/env.js'

/** Certificate of an HTTPS development server. */
export interface HttpsConfig {
  /** Path to the certificate, relative to the project root. */
  cert: string
  /** Path to the private key, relative to the project root. */
  key: string
}

/** Development server settings. */
export interface ServerConfig {
  /** Port to listen on. @defaultValue 5180 */
  port?: number
  /** Interface to listen on. @defaultValue 'localhost' */
  host?: string
  /**
   * Request forwarding, from path prefix to target origin.
   *
   * @example
   * { '/api': 'http://localhost:3001' }
   */
  proxy?: Record<string, string>
  /**
   * Serves over HTTPS, with the given certificate.
   *
   * Required as soon as an interface demands a secure origin: camera,
   * microphone, clipboard, service worker.
   */
  https?: HttpsConfig
  /**
   * Fails if the requested port is taken, instead of sliding to the next one.
   *
   * @defaultValue false
   */
  strictPort?: boolean
  /** Opens the browser on startup. @defaultValue false */
  open?: boolean
}

/** Prerendering settings. */
export interface PrerenderConfig {
  /**
   * The routes rendered at build time.
   *
   * When empty, the ones the server entry exports under the name `routes` are
   * taken.
   */
  routes?: readonly string[]
  /**
   * Server entry, relative to the root.
   *
   * @defaultValue 'src/entry-server.tsx'
   */
  entry?: string
}

/** Production build settings. */
export interface BuildConfig {
  /** Output directory, relative to the root. @defaultValue 'dist' */
  outDir?: string
  /** Minifies the produced code. @defaultValue true */
  minify?: boolean
  /** Emits source maps. @defaultValue true */
  sourcemap?: boolean
  /** Build target. @defaultValue 'es2022' */
  target?: string
  /**
   * Removes from the stylesheet the utility classes nothing uses.
   *
   * The library ships a pre-generated stylesheet holding them all; a given
   * application uses a fraction of it. Pruning reads the **produced** code —
   * so the library components as much as the application source — and keeps
   * only what is reachable.
   *
   * A class assembled at runtime (`o-text-${color}`) exists nowhere in its
   * final form and will disappear: declaring it in `safelist` is the only way
   * to keep it.
   *
   * @defaultValue true
   */
  prune?: boolean
  /**
   * The classes kept no matter what, despite pruning.
   *
   * A string keeps one class; a regular expression keeps every class it
   * matches.
   *
   * @example
   * { safelist: [/^o-text-/, 'o-animate-spin'] }
   */
  safelist?: readonly (string | RegExp)[]
  /**
   * Writes `manifest.json` next to the produced files.
   *
   * It gives, for each entry, the hashed file, its stylesheets and its chunks.
   * That is what a server reads to place the tags itself, when the project
   * document does not carry them.
   *
   * @defaultValue true
   */
  manifest?: boolean
  /**
   * Declares the shared chunks as `modulepreload` in the document.
   *
   * Without it, the browser only discovers a chunk after reading the module
   * that imports it: as many round trips as there are levels of depth, on the
   * critical path.
   *
   * @defaultValue true
   */
  preload?: boolean
  /**
   * Renders the routes to HTML at build time.
   *
   * `true` takes the defaults; an array gives the routes; the object form
   * allows naming another entry point.
   *
   * @defaultValue false
   *
   * @example
   * { prerender: ['/', '/about'] }
   */
  prerender?: boolean | readonly string[] | PrerenderConfig
}

/** Configuration of an Odoro project. */
export interface OdoroConfig {
  /** Project root. @defaultValue the current directory */
  root?: string
  /** Prefix of public URLs. @defaultValue '/' */
  base?: string
  /** Directory of files copied as is. @defaultValue 'public' */
  publicDir?: string
  /** Development server settings. */
  server?: ServerConfig
  /** Production build settings. */
  build?: BuildConfig
  /**
   * Import path aliases, from prefix to a path relative to the root.
   *
   * @example
   * { '@': 'src' }
   */
  alias?: Record<string, string>
  /** Textual replacements applied at build time. */
  define?: Record<string, string>
  /**
   * Prefix of the environment variables exposed to the client through
   * `import.meta.env`.
   *
   * @defaultValue 'ODORO_'
   */
  envPrefix?: string
  /**
   * Directory where the `.env` files are looked up.
   *
   * @defaultValue the project root
   */
  envDir?: string
  /**
   * Build mode: it chooses the `.env` files read and feeds
   * `import.meta.env.MODE`.
   *
   * @defaultValue 'development' for `dev`, 'production' for `build`
   */
  mode?: string
  /** Plugins applied to the build and to the server. */
  plugins?: readonly OdoroPlugin[]
}

/** Prerendering, once resolved. */
export interface ResolvedPrerender {
  /** Routes to render; when empty, those of the server entry. */
  readonly routes: readonly string[]
  /** Absolute path of the server entry. */
  readonly entry: string
}

/** Production build, once resolved. */
export interface ResolvedBuild {
  readonly outDir: string
  readonly minify: boolean
  readonly sourcemap: boolean
  readonly target: string
  readonly prune: boolean
  readonly safelist: readonly (string | RegExp)[]
  readonly manifest: boolean
  readonly preload: boolean
  /** `undefined` when prerendering is not requested. */
  readonly prerender: ResolvedPrerender | undefined
}

/** Configuration once the default values are applied. */
export interface ResolvedConfig {
  readonly root: string
  readonly base: string
  readonly publicDir: string
  readonly outDir: string
  readonly server: Required<Omit<ServerConfig, 'proxy' | 'https'>> & {
    proxy: Record<string, string>
    https: HttpsConfig | undefined
  }
  readonly build: ResolvedBuild
  readonly alias: Record<string, string>
  readonly define: Record<string, string>
  readonly envPrefix: string
  readonly envDir: string
  /** Mode retained. */
  readonly mode: string
  /** Every variable read, prefixed or not. Never leaves the machine. */
  readonly env: Readonly<Record<string, string>>
  /** What the client code reads in `import.meta.env`. */
  readonly envClient: Readonly<Record<string, string | boolean>>
  /** Plugins declared by the project. */
  readonly plugins: readonly OdoroPlugin[]
  /** Path of the configuration file actually loaded, if there is one. */
  readonly configFile: string | undefined
}

/**
 * Identity on the configuration, present only for typing and completion in
 * `odoro.config.ts`.
 *
 * @example
 * import { defineConfig } from 'odoro'
 *
 * export default defineConfig({
 *   server: { port: 3000, proxy: { '/api': 'http://localhost:3001' } },
 * })
 */
export function defineConfig(config: OdoroConfig): OdoroConfig {
  return config
}

/** Recognised configuration file names, in order of priority. */
const CONFIG_FILES = ['odoro.config.ts', 'odoro.config.js', 'odoro.config.mjs'] as const

/**
 * Compiles then imports a configuration file.
 *
 * Going through an intermediate file is necessary: `import()` cannot load
 * TypeScript. That file is written **inside the project**, and not in a system
 * temporary directory: the dependencies of the configuration stay external, and
 * Node could not resolve them from anywhere else.
 */
async function importConfigFile(file: string, root: string): Promise<OdoroConfig> {
  const directory = join(root, 'node_modules', '.odoro')
  const output = join(directory, `config.${Date.now().toString(36)}.mjs`)
  await mkdir(directory, { recursive: true })

  try {
    const result = await build({
      entryPoints: [file],
      bundle: true,
      format: 'esm',
      platform: 'node',
      target: 'node20',
      write: false,
      // Only the project code is inlined; its dependencies stay external,
      // otherwise the whole node_modules would have to be resolved to read
      // three lines.
      packages: 'external',
      // `packages: 'external'` is not enough: a `baseUrl` in the
      // `tsconfig.json` makes bare imports be looked up from the project root,
      // where `odoro.json` — the registry file — is found before the package.
      // The import then stops being a package import, the rule above no longer
      // applies, and the build fails on a `defineConfig` missing from a
      // configuration file.
      //
      // Naming it explicitly puts it out of reach of that resolution. The list
      // matters for projects already created: they still carry a `baseUrl`, and
      // their tsconfig cannot be rewritten.
      external: ['odoro'],
    })

    const code = result.outputFiles[0]?.text
    if (code === undefined) {
      throw new Error(`[odoro] Configuration "${file}" produced no code.`)
    }

    await writeFile(output, code, 'utf8')
    const module = (await import(pathToFileURL(output).href)) as { default?: OdoroConfig }

    if (module.default === undefined) {
      throw new Error(`[odoro] Configuration "${file}" must have a default export.`)
    }
    return module.default
  } finally {
    await rm(output, { force: true })
  }
}

/**
 * Resolves the prerendering setting.
 *
 * The entry point must exist: asking for it without writing it is a project
 * error, and the build will say so rather than produce a site without HTML
 * while letting you believe prerendering happened.
 */
function resolvePrerender(
  requested: BuildConfig['prerender'],
  root: string,
): ResolvedPrerender | undefined {
  if (requested === undefined || requested === false) return undefined

  const raw =
    requested === true
      ? {}
      : Array.isArray(requested)
        ? { routes: requested as readonly string[] }
        : (requested as PrerenderConfig)

  return {
    routes: raw.routes ?? [],
    entry: resolve(root, raw.entry ?? 'src/entry-server.tsx'),
  }
}

/**
 * Loads the configuration of a project and applies the default values.
 *
 * @param root Project root.
 * @param overrides Settings coming from the command line, which take priority.
 * @param defaultMode Mode retained when neither the command line nor the
 *   configuration file names one.
 *
 * @example
 * const config = await loadConfig(process.cwd(), { server: { port: 4000 } })
 */
export async function loadConfig(
  root: string,
  overrides: OdoroConfig = {},
  defaultMode = 'production',
): Promise<ResolvedConfig> {
  const absoluteRoot = resolve(root)

  let file: string | undefined
  let loaded: OdoroConfig = {}

  for (const candidate of CONFIG_FILES) {
    const path = join(absoluteRoot, candidate)
    if (existsSync(path)) {
      file = path
      loaded = await importConfigFile(path, absoluteRoot)
      break
    }
  }

  const merged: OdoroConfig = {
    ...loaded,
    ...overrides,
    server: { ...loaded.server, ...overrides.server },
    build: { ...loaded.build, ...overrides.build },
    alias: { ...loaded.alias, ...overrides.alias },
    define: { ...loaded.define, ...overrides.define },
  }

  const base = merged.base ?? '/'
  // `publicDir` and `outDir` are relative to the **project root**, not to the
  // directory the command is run from: a project whose client lives in a
  // subdirectory stays configurable in a single line.
  const projectRoot =
    merged.root === undefined ? absoluteRoot : resolve(absoluteRoot, merged.root)

  const mode = merged.mode ?? defaultMode
  const envPrefix = merged.envPrefix ?? 'ODORO_'
  const envDir =
    merged.envDir === undefined ? projectRoot : resolve(projectRoot, merged.envDir)

  const environment = await loadEnv(envDir, mode, envPrefix)

  // The values read join the process environment, without ever overwriting what
  // is already there. That is what lets the code **of the machine** — a
  // development script, a plugin, the database command — read the same `.env`
  // as the client, without reading it again itself.
  //
  // Only the prefixed part goes to the browser; this one stays here.
  for (const [key, value] of Object.entries(environment.all)) {
    process.env[key] ??= value
  }

  const https = merged.server?.https

  return {
    root: projectRoot,
    base: base.endsWith('/') ? base : `${base}/`,
    publicDir: resolve(projectRoot, merged.publicDir ?? 'public'),
    outDir: resolve(projectRoot, merged.build?.outDir ?? 'dist'),
    server: {
      port: merged.server?.port ?? 5180,
      host: merged.server?.host ?? 'localhost',
      proxy: merged.server?.proxy ?? {},
      https: https === undefined ? undefined : { ...https },
      strictPort: merged.server?.strictPort ?? false,
      open: merged.server?.open ?? false,
    },
    build: {
      outDir: merged.build?.outDir ?? 'dist',
      minify: merged.build?.minify ?? true,
      sourcemap: merged.build?.sourcemap ?? true,
      target: merged.build?.target ?? 'es2022',
      // On by default: a stylesheet holding every possible class is a
      // generation accident, not an intention.
      prune: merged.build?.prune ?? true,
      safelist: merged.build?.safelist ?? [],
      // On by default: the manifest only costs a file of a few lines, and
      // preloading removes a cascade of requests nobody sees on a local machine
      // and everybody suffers elsewhere.
      manifest: merged.build?.manifest ?? true,
      preload: merged.build?.preload ?? true,
      prerender: resolvePrerender(merged.build?.prerender, projectRoot),
    },
    // The aliases declared in `tsconfig.json` are picked up automatically.
    // Without that, a project following `odoro init` — which infers its prefix
    // from the tsconfig — would have to redeclare the same alias here for the
    // server to resolve it. Two places for the same truth, and an error that
    // only shows up on the first import.
    //
    // The configuration wins: it is what you write to fix a case the inference
    // does not catch.
    alias: { ...(await guessAliasPaths(projectRoot)), ...merged.alias },
    define: merged.define ?? {},
    envPrefix,
    envDir,
    mode,
    env: environment.all,
    envClient: clientEnv(
      environment.client,
      mode,
      base.endsWith('/') ? base : `${base}/`,
    ),
    plugins: merged.plugins ?? [],
    configFile: file,
  }
}
