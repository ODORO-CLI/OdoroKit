/**
 * Command line entry of the Odoro engine.
 *
 * The argument parsing is written by hand: it fits in forty lines, and the
 * binary is downloaded on every `npm create odoro`, so its weight counts.
 *
 * @module
 */

import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import colors from 'picocolors'

import { loadConfig, type OdoroConfig } from './config.js'
import * as log from './shared/logger.js'

/** Parsed arguments. */
export interface ParsedArgs {
  /** Subcommand requested. */
  command: string
  /** Remaining positional arguments. */
  positional: string[]
  /** Named options. */
  flags: Record<string, string | boolean>
}

/**
 * Parses a command line.
 *
 * Recognises `--option`, `--option=value`, `--option value`, `--no-option` and
 * the short aliases `-h` and `-v`.
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

/** Help text. */
const HELP = `
${colors.bold(colors.magenta('odoro'))} — development engine and scaffolder

${colors.bold('Usage')}
  odoro <command> [options]

${colors.bold('Commands')}
  create [name]    Create a project from a template
  dev              Start the development server
  build            Build the project for production
  preview          Serve the result of the build

${colors.bold('Component registry')}
  init             Prepare the project to receive components
  add <name...>    Copy a component and its dependencies
  list             Show the catalogue
  diff             Compare what is installed to what the registry serves
  doctor           Check that the project is in working order

${colors.bold('Database')}
  db:login         Record a platform token
  db:status        List the databases of the project
  db:create        Provision a database and write .env
  db:branch        Create a per-branch preview
  ${colors.dim('These commands need @odoro-cli/cloud-sdk, installed separately:')}
  ${colors.dim('it does not ship with this binary, which is downloaded on')}
  ${colors.dim('every project creation.')}

${colors.bold('Registry options')}
  --registry <src>   URL or local directory, instead of the project one
  --yes              Waits for no confirmation

${colors.bold('create options')}
  --template <name>  Template to use
  --modules <list>   libs,router,icons,engine,registre — or "none"
  --pm <name>        Package manager (pnpm, npm, yarn, bun)
  --no-git           Does not initialise a git repository
  --no-install       Does not install the dependencies
  --overwrite        Empties the target directory before creating
  --merge            Writes over the existing content
  --yes              Accepts every default value

${colors.bold('Database options')}
  --env <name>       Target environment (production, staging, preview-42)
  --region <name>    Where the database lives; asked when absent
  --from <env>       Environment to branch from
  --name <name>      Name of the branch
  --api <url>        Root of the API, instead of the default one

${colors.bold('dev and preview options')}
  --port <number>    Port to listen on
  --host <address>   Interface to listen on
  --strict-port      Fails if the port is taken, instead of sliding
  --open             Opens the browser on startup

${colors.bold('build options')}
  --outdir <path>    Output directory
  --no-minify        Does not minify
  --no-sourcemap     Does not emit source maps
  --no-manifest      Does not write manifest.json
  --no-preload       Does not declare the chunks as modulepreload
  --prerender [r,r]  Renders the routes to HTML (default: those of the entry)

${colors.bold('General options')}
  --root <path>      Project root
  --mode <name>      Mode: chooses the .env files read and fills import.meta.env.MODE
  -h, --help         Show this help
  -v, --version      Show the version
`

/** Reads a numeric option. */
function numberFlag(flags: ParsedArgs['flags'], name: string): number | undefined {
  const value = flags[name]
  if (typeof value !== 'string') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Builds the configuration overrides coming from the command line. */
function overridesFrom(flags: ParsedArgs['flags']): OdoroConfig {
  const server: NonNullable<OdoroConfig['server']> = {}
  const port = numberFlag(flags, 'port')
  if (port !== undefined) server.port = port
  if (typeof flags['host'] === 'string') server.host = flags['host']
  if (flags['strict-port'] === true) server.strictPort = true
  if (flags['open'] === true) server.open = true

  const build: NonNullable<OdoroConfig['build']> = {}
  if (typeof flags['outdir'] === 'string') build.outDir = flags['outdir']
  if (flags['minify'] === false) build.minify = false
  if (flags['sourcemap'] === false) build.sourcemap = false
  if (flags['manifest'] === false) build.manifest = false
  if (flags['preload'] === false) build.preload = false

  // `--prerender` alone takes the routes of the entry point; followed by a
  // list, it takes that one. Telling them apart here avoids having two options
  // for the same intention.
  const prerender = flags['prerender']
  if (prerender === true) build.prerender = true
  else if (typeof prerender === 'string') {
    build.prerender = prerender
      .split(',')
      .map((route) => route.trim())
      .filter((route) => route !== '')
  }

  const overrides: OdoroConfig = { server, build }
  if (typeof flags['mode'] === 'string') overrides.mode = flags['mode']

  return overrides
}

/** Project root requested. */
function rootFrom(flags: ParsedArgs['flags'], positional: readonly string[]): string {
  if (typeof flags['root'] === 'string') return flags['root']
  return positional[0] ?? process.cwd()
}

/**
 * Entry point of the binary.
 *
 * @returns The exit code of the process.
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
      if (typeof flags['modules'] === 'string') options.modules = flags['modules']
      if (typeof flags['git'] === 'boolean') options.git = flags['git']
      if (typeof flags['install'] === 'boolean') options.install = flags['install']
      if (flags['yes'] === true) options.yes = true
      if (flags['overwrite'] === true) options.overwrite = 'ecraser'
      if (flags['merge'] === true) options.overwrite = 'fusionner'
      return createCommand(options)
    }

    case 'dev': {
      const { startDevServer } = await import('./dev/server.js')
      const config = await loadConfig(
        rootFrom(flags, positional),
        overridesFrom(flags),
        'development',
      )
      await startDevServer(config)
      // The server stays up until it is interrupted: we never hand back control.
      return new Promise<number>(() => undefined)
    }

    case 'build': {
      const { buildProject, reportBuild } = await import('./build/build.js')
      const config = await loadConfig(rootFrom(flags, positional), overridesFrom(flags))
      const output = await buildProject(config)
      // The paths are printed from the directory the command was run in, not
      // from the project root: that is what the user sees.
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

    case 'init':
    case 'add':
    case 'list':
    case 'diff':
    case 'doctor': {
      const registry = await import('./add/commands.js')
      // The root comes from `--root` only: the positionals of `add` are
      // component names, not a path.
      const options = {
        root: typeof flags['root'] === 'string' ? flags['root'] : process.cwd(),
        registry: typeof flags['registry'] === 'string' ? flags['registry'] : undefined,
        yes: flags['yes'] === true,
      }

      if (command === 'add') return registry.addCommand(options, positional)
      if (command === 'init') return registry.initCommand(options)
      if (command === 'list') return registry.listCommand(options)
      if (command === 'diff') return registry.diffCommand(options)
      return registry.doctorCommand(options)
    }

    case 'db:login':
    case 'db:status':
    case 'db:create':
    case 'db:branch': {
      // The platform SDK is not a dependency of this binary: it is downloaded
      // on every project creation, and most projects do not use the platform.
      // The import is therefore dynamic, and its absence produces a sentence
      // that says what to install — not a trace about a missing module.
      const db = await import('./db/commands.js')

      const options = {
        root: typeof flags['root'] === 'string' ? flags['root'] : process.cwd(),
        ...(typeof flags['api'] === 'string' ? { apiUrl: flags['api'] } : {}),
        ...(typeof flags['env'] === 'string' ? { env: flags['env'] } : {}),
        ...(typeof flags['region'] === 'string' ? { region: flags['region'] } : {}),
        yes: flags['yes'] === true,
      }

      if (command === 'db:login') return db.loginCommand(options)
      if (command === 'db:status') return db.statusCommand(options)
      if (command === 'db:create') return db.createCommand(options)

      return db.branchCommand({
        ...options,
        ...(typeof flags['from'] === 'string' ? { from: flags['from'] } : {}),
        ...(typeof flags['name'] === 'string' ? { name: flags['name'] } : {}),
      })
    }

    default:
      log.error(`Unknown command: "${command}". Try "odoro help".`)
      return 1
  }
}

/**
 * Tells whether this module is the entry point of the process.
 *
 * The file is also imported — by the tests, and by the `create-odoro` package
 * which delegates here: the automatic run must only happen when it is really
 * launched from the command line.
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
      log.error('the command failed', cause)
      process.exitCode = 1
    })
}
