/**
 * Pre-compilation des dependances.
 *
 * Deux raisons la rendent indispensable, et non optionnelle :
 *
 * 1. beaucoup de paquets ne sont encore distribues qu'en modules CommonJS, que
 *    le navigateur ne sait pas charger ;
 * 2. une dependance eclatee en centaines de petits fichiers declencherait
 *    autant de requetes au premier chargement.
 *
 * Le piege, lui, est ailleurs : si `react` et `react-dom/client` etaient
 * compiles separement, chacun embarquerait sa copie de React. Deux instances
 * de React dans une meme page cassent les hooks et les contextes, avec des
 * symptomes deroutants. Tous les specificateurs sont donc **compiles en une
 * seule passe**, avec decoupage : le code commun se retrouve dans un fragment
 * partage, et l'instance reste unique.
 *
 * @module
 */

import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { type Plugin, build } from 'esbuild'

import type { ResolvedConfig } from '../config.js'
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

/** Nom du fichier decrivant l'etat du cache. */
const MANIFEST = 'manifest.json'

/** Etat enregistre du cache de dependances. */
interface DepsManifest {
  /** Empreinte de l'ensemble compile. */
  hash: string
  /** Specificateurs disponibles. */
  specifiers: string[]
}

/** Resultat de la pre-compilation. */
export interface OptimizedDeps {
  /** Dossier contenant les modules compiles. */
  readonly directory: string
  /** Specificateurs disponibles. */
  readonly specifiers: readonly string[]
  /** `true` si une compilation a reellement eu lieu. */
  readonly rebuilt: boolean
}

/** Plugin qui enregistre les specificateurs nus sans les suivre. */
function collectBareImports(config: ResolvedConfig, found: Set<string>): Plugin {
  return {
    name: 'odoro-scan-deps',
    setup(builder) {
      builder.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === 'entry-point') return null

        const aliased = applyAlias(args.path, config)

        // Les feuilles de style et les ressources ne sont pas des modules
        // JavaScript : les suivre ferait echouer le parcours, et elles n'ont
        // de toute facon rien a faire dans le cache de dependances.
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
 * Parcourt le code du projet a la recherche des dependances reellement
 * importees, transitivement.
 *
 * Se fonder sur le champ `dependencies` du manifeste ne suffirait pas : une
 * application importe `react-dom/client`, jamais `react-dom` tout court.
 *
 * @param entries Points d'entree du projet, en chemins absolus.
 *
 * @example
 * const specifiers = await scanDependencies(config, ['/projet/src/main.tsx'])
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
    // Le serveur compile en JSX de developpement : sans ce reglage, le
    // parcours chercherait `react/jsx-runtime` la ou le navigateur demandera
    // `react/jsx-dev-runtime`, et la dependance manquerait a l'appel.
    jsxDev: true,
    plugins: [collectBareImports(config, found)],
  })

  return [...found].sort()
}

/**
 * Compile un ensemble de specificateurs en une seule passe.
 *
 * @param config Configuration resolue du projet.
 * @param specifiers Specificateurs a compiler.
 * @param force Recompile meme si le cache semble valide.
 *
 * @example
 * const deps = await optimizeDeps(config, ['react', 'react-dom/client'])
 */
export async function optimizeDeps(
  config: ResolvedConfig,
  specifiers: readonly string[],
  force = false,
): Promise<OptimizedDeps> {
  const directory = join(config.root, 'node_modules', '.odoro', 'deps')
  const sorted = [...specifiers].sort()

  const hash = createHash('sha256')
    .update(JSON.stringify(sorted))
    .update(await lockfileFingerprint(config.root))
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
    // Les paquets CommonJS passent par un module intermediaire qui declare
    // leurs exports nommes ; les modules natifs sont compiles directement.
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
      // Les noms de sortie sont imposes : un specificateur a sous-chemin
      // produirait sinon une arborescence, et deux paquets differents
      // pourraient se disputer le meme nom de fichier.
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

/**
 * Empreinte du fichier de verrouillage, quand il existe : une dependance mise
 * a jour doit invalider le cache meme si la liste des specificateurs n'a pas
 * bouge.
 */
async function lockfileFingerprint(root: string): Promise<string> {
  for (const name of ['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'bun.lock']) {
    const file = join(root, name)
    if (!existsSync(file)) continue
    return createHash('sha256')
      .update(await readFile(file))
      .digest('hex')
  }
  return 'sans-verrou'
}
