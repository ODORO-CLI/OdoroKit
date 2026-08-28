/**
 * Configuration du moteur Odoro.
 *
 * Le fichier `odoro.config.ts` est compile a la volee puis importe : il peut
 * donc etre ecrit en TypeScript et utiliser toute la puissance du langage,
 * sans etape de build prealable.
 *
 * @module
 */

import { mkdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { build } from 'esbuild'

/** Reglages du serveur de developpement. */
export interface ServerConfig {
  /** Port d'ecoute. @defaultValue 5180 */
  port?: number
  /** Interface d'ecoute. @defaultValue 'localhost' */
  host?: string
  /**
   * Redirections de requetes, du prefixe de chemin vers l'origine cible.
   *
   * @example
   * { '/api': 'http://localhost:3001' }
   */
  proxy?: Record<string, string>
}

/** Reglages de la compilation de production. */
export interface BuildConfig {
  /** Dossier de sortie, relatif a la racine. @defaultValue 'dist' */
  outDir?: string
  /** Minifie le code produit. @defaultValue true */
  minify?: boolean
  /** Emet des cartes de source. @defaultValue true */
  sourcemap?: boolean
  /** Cible de compilation. @defaultValue 'es2022' */
  target?: string
}

/** Configuration d'un projet Odoro. */
export interface OdoroConfig {
  /** Racine du projet. @defaultValue le dossier courant */
  root?: string
  /** Prefixe des URL publiques. @defaultValue '/' */
  base?: string
  /** Dossier des fichiers copies tels quels. @defaultValue 'public' */
  publicDir?: string
  /** Reglages du serveur de developpement. */
  server?: ServerConfig
  /** Reglages de la compilation de production. */
  build?: BuildConfig
  /**
   * Alias de chemins d'import, du prefixe vers un chemin relatif a la racine.
   *
   * @example
   * { '@': 'src' }
   */
  alias?: Record<string, string>
  /** Remplacements textuels appliques a la compilation. */
  define?: Record<string, string>
  /**
   * Prefixe des variables d'environnement exposees au client via
   * `import.meta.env`.
   *
   * @defaultValue 'ODORO_'
   */
  envPrefix?: string
}

/** Configuration une fois les valeurs par defaut appliquees. */
export interface ResolvedConfig {
  readonly root: string
  readonly base: string
  readonly publicDir: string
  readonly outDir: string
  readonly server: Required<Omit<ServerConfig, 'proxy'>> & {
    proxy: Record<string, string>
  }
  readonly build: Required<BuildConfig>
  readonly alias: Record<string, string>
  readonly define: Record<string, string>
  readonly envPrefix: string
  /** Chemin du fichier de configuration effectivement charge, s'il existe. */
  readonly configFile: string | undefined
}

/**
 * Identite sur la configuration, presente uniquement pour le typage et
 * l'autocompletion dans `odoro.config.ts`.
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

/** Noms de fichiers de configuration reconnus, par ordre de priorite. */
const CONFIG_FILES = ['odoro.config.ts', 'odoro.config.js', 'odoro.config.mjs'] as const

/**
 * Compile puis importe un fichier de configuration.
 *
 * Le passage par un fichier intermediaire est necessaire : `import()` ne sait
 * pas charger du TypeScript. Ce fichier est depose **dans le projet**, et non
 * dans un dossier temporaire du systeme : les dependances de la configuration
 * restent externes, et Node ne saurait les resoudre depuis ailleurs.
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
      // Seul le code du projet est inline ; ses dependances restent externes,
      // sans quoi il faudrait resoudre tout node_modules pour lire trois lignes.
      packages: 'external',
    })

    const code = result.outputFiles[0]?.text
    if (code === undefined) {
      throw new Error(`[odoro] La configuration "${file}" n'a produit aucun code.`)
    }

    await writeFile(output, code, 'utf8')
    const module = (await import(pathToFileURL(output).href)) as { default?: OdoroConfig }

    if (module.default === undefined) {
      throw new Error(
        `[odoro] La configuration "${file}" doit avoir un export par defaut.`,
      )
    }
    return module.default
  } finally {
    await rm(output, { force: true })
  }
}

/**
 * Charge la configuration d'un projet et applique les valeurs par defaut.
 *
 * @param root Racine du projet.
 * @param overrides Reglages issus de la ligne de commande, prioritaires.
 *
 * @example
 * const config = await loadConfig(process.cwd(), { server: { port: 4000 } })
 */
export async function loadConfig(
  root: string,
  overrides: OdoroConfig = {},
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
  // `publicDir` et `outDir` sont relatifs a la **racine du projet**, pas au
  // dossier depuis lequel la commande est lancee : un projet dont le client
  // vit dans un sous-dossier reste configurable d'une seule ligne.
  const projectRoot =
    merged.root === undefined ? absoluteRoot : resolve(absoluteRoot, merged.root)

  return {
    root: projectRoot,
    base: base.endsWith('/') ? base : `${base}/`,
    publicDir: resolve(projectRoot, merged.publicDir ?? 'public'),
    outDir: resolve(projectRoot, merged.build?.outDir ?? 'dist'),
    server: {
      port: merged.server?.port ?? 5180,
      host: merged.server?.host ?? 'localhost',
      proxy: merged.server?.proxy ?? {},
    },
    build: {
      outDir: merged.build?.outDir ?? 'dist',
      minify: merged.build?.minify ?? true,
      sourcemap: merged.build?.sourcemap ?? true,
      target: merged.build?.target ?? 'es2022',
    },
    alias: merged.alias ?? {},
    define: merged.define ?? {},
    envPrefix: merged.envPrefix ?? 'ODORO_',
    configFile: file,
  }
}
