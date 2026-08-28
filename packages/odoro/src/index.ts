/**
 * API programmatique du moteur Odoro.
 *
 * Le meme moteur est utilisable depuis un script, ce qui sert notamment aux
 * tests d'integration : demarrer un serveur, compiler un projet et verifier le
 * resultat sans passer par un sous-processus.
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
  type OdoroConfig,
  type ResolvedConfig,
  type ServerConfig,
} from './config.js'

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
