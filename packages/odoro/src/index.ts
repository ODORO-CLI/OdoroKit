/**
 * Programmatic API of the Odoro engine.
 *
 * The same engine is usable from a script, which serves integration tests in
 * particular: start a server, build a project and check the result without
 * going through a subprocess.
 *
 * @example
 * import { buildProject, loadConfig, startDevServer } from 'odoro'
 *
 * const config = await loadConfig(process.cwd())
 * const server = await startDevServer(config)
 *
 * @module
 */

export {
  defineConfig,
  loadConfig,
  type BuildConfig,
  type HttpsConfig,
  type OdoroConfig,
  type PrerenderConfig,
  type ResolvedBuild,
  type ResolvedConfig,
  type ResolvedPrerender,
  type ServerConfig,
} from './config.js'

export type {
  HtmlContext,
  ServerContext,
  TransformContext,
  Middleware,
  OdoroPlugin,
} from './plugins.js'

export { loadEnv, clientEnv, type LoadedEnv } from './shared/env.js'
export { hasGlob, transformGlob } from './shared/glob.js'
export {
  buildManifest,
  chunksFor,
  type ManifestEntry,
  type Manifest,
} from './build/manifest.js'
export { prerender, type RouteRender, type PrerenderOutput } from './build/prerender.js'

export { startDevServer, type DevServer } from './dev/server.js'
export {
  buildProject,
  reportBuild,
  type BuildOutput,
  type BuiltFile,
} from './build/build.js'
export { startPreviewServer, type PreviewServer } from './build/preview.js'
export { ModuleGraph, detectSelfAccepting, type ModuleNode } from './dev/graph.js'
export {
  scanDependencies,
  optimizeDeps,
  depFileName,
  type OptimizedDeps,
} from './dev/deps.js'
