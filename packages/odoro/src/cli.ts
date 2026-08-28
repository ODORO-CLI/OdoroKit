/**
 * Entree en ligne de commande du moteur Odoro.
 *
 * L'analyse des arguments est ecrite a la main : elle tient en quarante
 * lignes, et le binaire est telecharge a chaque `npm create odoro`, donc son
 * poids compte.
 *
 * @module
 */

import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import colors from 'picocolors'

import { loadConfig, type OdoroConfig } from './config.js'
import * as log from './shared/logger.js'

/** Arguments analyses. */
export interface ParsedArgs {
  /** Sous-commande demandee. */
  command: string
  /** Arguments positionnels restants. */
  positional: string[]
  /** Options nommees. */
  flags: Record<string, string | boolean>
}

/**
 * Analyse une ligne de commande.
 *
 * Reconnait `--option`, `--option=valeur`, `--option valeur`, `--no-option`
 * et les alias courts `-h` et `-v`.
 *
 * @example
 * parseArgs(['create', 'site', '--template=react-ts', '--no-git'])
 * // { command: 'create', positional: ['site'], flags: { template: 'react-ts', git: false } }
 */
export function parseArgs(argv: readonly string[]): ParsedArgs {
  const positional: string[] = []
  const flags: Record<string, string | boolean> = {}

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (token === undefined) continue

    if (!token.startsWith('-')) {
      positional.push(token)
      continue
    }

    if (token === '-h') {
      flags['help'] = true
      continue
    }
    if (token === '-v') {
      flags['version'] = true
      continue
    }

    const name = token.replace(/^--?/, '')

    if (name.includes('=')) {
      const [key, ...rest] = name.split('=')
      if (key !== undefined) flags[key] = rest.join('=')
      continue
    }

    if (name.startsWith('no-')) {
      flags[name.slice(3)] = false
      continue
    }

    const next = argv[index + 1]
    if (next !== undefined && !next.startsWith('-')) {
      flags[name] = next
      index += 1
    } else {
      flags[name] = true
    }
  }

  const command = positional.shift() ?? ''
  return { command, positional, flags }
}

/** Texte d'aide. */
const HELP = `
${colors.bold(colors.magenta('odoro'))} — moteur de developpement et echafaudage

${colors.bold('Utilisation')}
  odoro <commande> [options]

${colors.bold('Commandes')}
  create [nom]     Cree un projet a partir d'un template
  dev              Demarre le serveur de developpement
  build            Compile le projet pour la production
  preview          Sert le resultat de la compilation

${colors.bold('Options de create')}
  --template <nom>   Template a utiliser
  --pm <nom>         Gestionnaire de paquets (pnpm, npm, yarn, bun)
  --no-git           N'initialise pas de depot git
  --no-install       N'installe pas les dependances
  --overwrite        Vide le dossier cible avant de creer
  --merge            Ecrit par-dessus le contenu existant
  --yes              Accepte toutes les valeurs par defaut

${colors.bold('Options de dev et preview')}
  --port <numero>    Port d'ecoute
  --host <adresse>   Interface d'ecoute

${colors.bold('Options de build')}
  --outdir <chemin>  Dossier de sortie
  --no-minify        Ne minifie pas
  --no-sourcemap     N'emet pas de cartes de source

${colors.bold('Options generales')}
  --root <chemin>    Racine du projet
  -h, --help         Affiche cette aide
  -v, --version      Affiche la version
`

/** Lit une option numerique. */
function numberFlag(flags: ParsedArgs['flags'], name: string): number | undefined {
  const value = flags[name]
  if (typeof value !== 'string') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Construit les surcharges de configuration issues de la ligne de commande. */
function overridesFrom(flags: ParsedArgs['flags']): OdoroConfig {
  const server: NonNullable<OdoroConfig['server']> = {}
  const port = numberFlag(flags, 'port')
  if (port !== undefined) server.port = port
  if (typeof flags['host'] === 'string') server.host = flags['host']

  const build: NonNullable<OdoroConfig['build']> = {}
  if (typeof flags['outdir'] === 'string') build.outDir = flags['outdir']
  if (flags['minify'] === false) build.minify = false
  if (flags['sourcemap'] === false) build.sourcemap = false

  return { server, build }
}

/** Racine du projet demandee. */
function rootFrom(flags: ParsedArgs['flags'], positional: readonly string[]): string {
  if (typeof flags['root'] === 'string') return flags['root']
  return positional[0] ?? process.cwd()
}

/**
 * Point d'entree du binaire.
 *
 * @returns Le code de sortie du processus.
 *
 * @example
 * const code = await run(['dev', '--port', '3000'])
 */
export async function run(argv: readonly string[]): Promise<number> {
  const { command, positional, flags } = parseArgs(argv)

  if (flags['version'] === true) {
    const manifest = (await import('../package.json', { with: { type: 'json' } })) as {
      default: { version: string }
    }
    console.log(manifest.default.version)
    return 0
  }

  if (command === '' || command === 'help' || flags['help'] === true) {
    console.log(HELP)
    return 0
  }

  switch (command) {
    case 'create':
    case 'new': {
      const { createCommand } = await import('./commands/create.js')
      const options: Parameters<typeof createCommand>[0] = {}
      if (positional[0] !== undefined) options.name = positional[0]
      if (typeof flags['template'] === 'string') options.template = flags['template']
      if (typeof flags['pm'] === 'string') options.pm = flags['pm']
      if (typeof flags['git'] === 'boolean') options.git = flags['git']
      if (typeof flags['install'] === 'boolean') options.install = flags['install']
      if (flags['yes'] === true) options.yes = true
      if (flags['overwrite'] === true) options.overwrite = 'ecraser'
      if (flags['merge'] === true) options.overwrite = 'fusionner'
      return createCommand(options)
    }

    case 'dev': {
      const { startDevServer } = await import('./dev/server.js')
      const config = await loadConfig(rootFrom(flags, positional), overridesFrom(flags))
      await startDevServer(config)
      // Le serveur reste actif jusqu'a interruption : on ne rend pas la main.
      return new Promise<number>(() => undefined)
    }

    case 'build': {
      const { buildProject, reportBuild } = await import('./build/build.js')
      const config = await loadConfig(rootFrom(flags, positional), overridesFrom(flags))
      const output = await buildProject(config)
      // Les chemins sont affiches depuis le dossier ou la commande a ete
      // lancee, pas depuis la racine du projet : c'est ce que l'utilisateur voit.
      reportBuild(output, process.cwd())
      return 0
    }

    case 'preview': {
      const { startPreviewServer } = await import('./build/preview.js')
      const config = await loadConfig(rootFrom(flags, positional), overridesFrom(flags))
      const port = numberFlag(flags, 'port')
      await startPreviewServer(config, port)
      return new Promise<number>(() => undefined)
    }

    default:
      log.error(`Commande inconnue : "${command}". Essayez "odoro help".`)
      return 1
  }
}

/**
 * Indique si ce module est le point d'entree du processus.
 *
 * Le fichier est aussi importe — par les tests, et par le paquet
 * `create-odoro` qui delegue ici : l'execution automatique ne doit avoir lieu
 * que lorsqu'il est reellement lance en ligne de commande.
 */
function isEntryPoint(): boolean {
  const entry = process.argv[1]
  if (entry === undefined) return false
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (isEntryPoint()) {
  run(process.argv.slice(2))
    .then((code) => {
      if (code !== 0) process.exitCode = code
    })
    .catch((cause: unknown) => {
      log.error('echec de la commande', cause)
      process.exitCode = 1
    })
}
