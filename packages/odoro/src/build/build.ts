/**
 * Compilation de production.
 *
 * Le document HTML est le point de depart : ses balises de script en modules
 * designent les entrees, et il est reecrit a la fin pour pointer vers les
 * fichiers empreintes.
 *
 * @module
 */

import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { basename, join, relative, resolve, sep } from 'node:path'

import { type BuildResult, build as esbuild } from 'esbuild'

import type { ResolvedConfig } from '../config.js'
import * as log from '../shared/logger.js'
import { applyAlias, isBareSpecifier } from '../dev/transform.js'
import { extractEntries } from '../dev/server.js'
import { elaguer } from './elaguer.js'

/** Normalise un chemin en separateurs d'URL. */
function toPosix(path: string): string {
  return path.split(sep).join('/')
}

/** Un fichier produit par la compilation. */
export interface BuiltFile {
  /** Chemin relatif au dossier de sortie. */
  readonly path: string
  /** Taille en octets. */
  readonly bytes: number
}

/** Resultat d'une compilation de production. */
export interface BuildOutput {
  /** Dossier de sortie. */
  readonly outDir: string
  /** Fichiers produits, du plus gros au plus petit. */
  readonly files: readonly BuiltFile[]
  /** Duree totale, en millisecondes. */
  readonly elapsed: number
}

/** Construit les valeurs exposees au client via `import.meta.env`. */
function buildEnv(config: ResolvedConfig): Record<string, string | boolean> {
  const env: Record<string, string | boolean> = {
    MODE: 'production',
    DEV: false,
    PROD: true,
    BASE_URL: config.base,
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(config.envPrefix) && value !== undefined) env[key] = value
  }

  return env
}

/**
 * Retrouve, dans le rapport de compilation, les fichiers produits pour une
 * entree donnee.
 *
 * Le rattachement de la feuille de style passe par le champ `cssBundle` du
 * rapport, et non par une correspondance de noms : les empreintes du script et
 * de la feuille sont calculees separement et ne coincident pas.
 */
function outputsForEntry(
  result: BuildResult<{ metafile: true }>,
  entry: string,
  outDir: string,
  root: string,
): { script: string | undefined; styles: string[] } {
  // Les chemins du rapport sont relatifs au dossier de travail du
  // compilateur — la racine du projet — et non au dossier courant.
  const toRelative = (file: string): string =>
    toPosix(relative(outDir, resolve(root, file)))

  for (const [file, meta] of Object.entries(result.metafile.outputs)) {
    if (meta.entryPoint === undefined) continue
    if (resolve(root, meta.entryPoint) !== resolve(entry)) continue
    if (!file.endsWith('.js')) continue

    return {
      script: toRelative(file),
      styles: meta.cssBundle === undefined ? [] : [toRelative(meta.cssBundle)],
    }
  }

  return { script: undefined, styles: [] }
}

/**
 * Elague les feuilles produites, en lisant le code produit.
 *
 * ## Pourquoi apres le regroupement, et non avant
 *
 * Une classe utilitaire ne vient pas seulement de la source de l'application :
 * les composants de bibliotheque portent les leurs, dans leur JavaScript deja
 * compile. Lire la source seule retirerait tout ce dont ils ont besoin, et
 * l'interface arriverait sans style — sans qu'aucune erreur ne soit levee,
 * puisque du CSS absent ne casse rien, il ne peint rien.
 *
 * A cet instant, en revanche, on tient exactement ce qui part : les scripts
 * produits et le document. Ce qui n'y figure sous aucune forme n'est
 * atteignable par personne.
 */
async function elaguerFeuilles(
  result: BuildResult<{ metafile: true }>,
  config: ResolvedConfig,
  html: string,
): Promise<void> {
  const produits = Object.keys(result.metafile.outputs).map((f) => resolve(config.root, f))

  const feuilles = produits.filter((f) => f.endsWith('.css'))
  if (feuilles.length === 0) return

  // Tout ce qui part, document compris : une classe peut n'exister que dans
  // l'index.
  const sources = [html]
  for (const fichier of produits) {
    if (fichier.endsWith('.js')) sources.push(await readFile(fichier, 'utf8'))
  }

  for (const feuille of feuilles) {
    const avant = await readFile(feuille, 'utf8')
    const rapport = elaguer(avant, sources, { sauvegarde: config.build.safelist })

    await writeFile(feuille, rapport.css, 'utf8')

    log.info(
      `  ${log.colors.dim('elagage')} ${basename(feuille)}  ` +
        `${log.size(rapport.octetsAvant)} → ${log.size(rapport.octetsApres)}  ` +
        `${log.colors.dim(`${String(rapport.gardees)} classes gardees`)}`,
    )
  }
}

/**
 * Compile un projet pour la production.
 *
 * @param config Configuration resolue du projet.
 *
 * @example
 * const output = await buildProject(await loadConfig(process.cwd()))
 */
export async function buildProject(config: ResolvedConfig): Promise<BuildOutput> {
  const started = Date.now()

  const indexFile = join(config.root, 'index.html')
  if (!existsSync(indexFile)) {
    throw new Error(`[odoro] Aucun "index.html" a la racine du projet (${config.root}).`)
  }

  const html = await readFile(indexFile, 'utf8')
  const entries = extractEntries(html, config.root)
  if (entries.length === 0) {
    throw new Error(
      '[odoro] Aucun point d\'entree : "index.html" doit contenir un <script type="module" src="...">.',
    )
  }

  await rm(config.outDir, { recursive: true, force: true })
  await mkdir(config.outDir, { recursive: true })

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
    // Les empreintes rendent les fichiers immuables : ils peuvent etre mis en
    // cache indefiniment, et un deploiement n'invalide que ce qui a change.
    entryNames: '[name]-[hash]',
    chunkNames: 'chunk-[hash]',
    assetNames: '[name]-[hash]',
    jsx: 'automatic',
    logLevel: 'silent',
    define: {
      'import.meta.env': JSON.stringify(buildEnv(config)),
      'process.env.NODE_ENV': JSON.stringify('production'),
      ...config.define,
    },
    loader: {
      '.svg': 'file',
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.gif': 'file',
      '.webp': 'file',
      '.avif': 'file',
      '.ico': 'file',
      '.woff': 'file',
      '.woff2': 'file',
      '.mp4': 'file',
      '.webm': 'file',
    },
    plugins: [
      {
        name: 'odoro-alias',
        setup(builder) {
          builder.onResolve({ filter: /.*/ }, (args) => {
            if (args.kind === 'entry-point') return null
            const aliased = applyAlias(args.path, config)
            if (aliased === args.path || isBareSpecifier(aliased)) return null
            return builder.resolve(aliased, {
              kind: 'import-statement',
              resolveDir: args.resolveDir,
              importer: args.importer,
              pluginData: { aliased: true },
            })
          })
        },
      },
    ],
  })

  if (config.build.elaguer) await elaguerFeuilles(result, config, html)

  // Reecriture du document : chaque balise pointe vers le fichier empreinte.
  let output = html
  for (const entry of entries) {
    const { script, styles } = outputsForEntry(
      result,
      entry,
      join(config.outDir, 'assets'),
      config.root,
    )
    if (script === undefined) continue

    const original = new RegExp(
      `<script[^>]*type=["']module["'][^>]*src=["'][^"']*${basename(entry)}["'][^>]*></script>`,
      'i',
    )
    const tags = [
      ...styles.map(
        (style) => `<link rel="stylesheet" href="${config.base}assets/${style}">`,
      ),
      `<script type="module" crossorigin src="${config.base}assets/${script}"></script>`,
    ].join('\n    ')

    output = output.replace(original, tags)
  }

  await writeFile(join(config.outDir, 'index.html'), output, 'utf8')

  if (existsSync(config.publicDir)) {
    await cp(config.publicDir, config.outDir, { recursive: true })
  }

  // Les tailles se lisent sur le disque, et non dans le rapport du
  // compilateur : celui-ci decrit ce qu esbuild a ecrit, avant que l elagage
  // n y touche. Un recapitulatif qui annonce 1,7 Mo en livrant 65 Ko est pire
  // qu absent — il fait croire que rien n a marche.
  const files: BuiltFile[] = (
    await Promise.all(
      Object.keys(result.metafile.outputs).map(async (file) => {
        const chemin = resolve(config.root, file)
        return {
          path: toPosix(relative(config.outDir, chemin)),
          bytes: (await stat(chemin)).size,
        }
      }),
    )
  ).sort((a, b) => b.bytes - a.bytes)

  return { outDir: config.outDir, files, elapsed: Date.now() - started }
}

/** Affiche le recapitulatif d'une compilation. */
export function reportBuild(output: BuildOutput, root: string): void {
  const directory = toPosix(relative(root, output.outDir)) || '.'
  let total = 0

  for (const file of output.files) {
    total += file.bytes
    if (file.path.endsWith('.map')) continue
    log.info(
      `  ${log.colors.dim(`${directory}/`)}${file.path}  ${log.colors.dim(log.size(file.bytes))}`,
    )
  }

  log.success(`compile en ${log.duration(output.elapsed)} — ${log.size(total)} au total`)
}
