/**
 * The `odoro create` command: creation of a project.
 *
 * @module
 */

import { execSync, spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

import * as prompts from '@clack/prompts'
import colors from 'picocolors'

import {
  MODULES,
  DEFAULT_MODULES,
  readModules,
  resolveModules,
  type ModuleId,
} from '../scaffold/modules.js'
import { type OverwriteMode, scaffold } from '../scaffold/scaffold.js'
import {
  PACKAGE_MANAGERS,
  type PackageManager,
  availableTemplates,
  detectPackageManager,
  inspectTarget,
  installCommand,
  runCommand,
  templatesRoot,
  toPackageName,
  validatePackageName,
} from '../scaffold/utils.js'

/** Options of the command, as they come from the command line. */
export interface CreateOptions {
  /** Name or path of the project, as a positional argument. */
  name?: string
  /** Template to use, without asking. */
  template?: string
  /** Package manager, without asking. */
  pm?: string
  /** Initialises a git repository. */
  git?: boolean
  /** Installs the dependencies. */
  install?: boolean
  /** Accepts every default value without asking anything. */
  yes?: boolean
  /**
   * Modules kept, in the form `libs,router,icons`, without asking.
   *
   * `none` keeps none of them: a bare React project, without Odoro styling.
   */
  modules?: string
  /** What to do when the target directory is not empty. */
  overwrite?: OverwriteMode
}

import {
  PROVIDER_PENDING,
  assertEnvIgnored,
  checkDatabaseUrl,
  writeDatabaseUrl,
  type DatabaseChoice,
  type DatabaseOutcome,
} from './database.js'

/**
 * How many output lines to keep to explain a failure.
 *
 * Enough for the cause to be in there — a package manager says it in its last
 * lines — and not so many as to drown the terminal.
 */
const LAST_LINES = 8

/** Beyond this, an output line is cut so as not to scroll the progress bar. */
const LINE_WIDTH = 64

/** Descriptions shown in the template picker. */
const TEMPLATE_LABELS: Readonly<Record<string, string>> = {
  'react-ts': 'Single-page app — React, TypeScript, Odoro router and motion',
  'react-ts-server':
    'Client and server — the same app, plus a modular @odoro-cli/server base and a Dockerfile',
}

/**
 * Asks how the project gets its database.
 *
 * Three ways, two of which work today. The third — provisioning by the platform
 * — is waiting for `@odoro-cli/cloud-sdk`; it is offered and announced as such
 * rather than hidden, so that the path exists from now on in the mind of
 * whoever creates a project.
 */
async function askDatabase(): Promise<DatabaseOutcome> {
  const choice = ensure(
    await prompts.select<DatabaseChoice>({
      message: 'Database',
      initialValue: 'url',
      options: [
        {
          value: 'provider',
          label: 'Odoro provider',
          hint: 'automatic provisioning — coming soon',
        },
        {
          value: 'url',
          label: 'Existing PostgreSQL URL',
          hint: 'Neon, Supabase, RDS, your own',
        },
        { value: 'later', label: 'Set up later', hint: '.env.example only' },
      ],
    }),
  )

  if (choice === 'provider') {
    prompts.log.warn(PROVIDER_PENDING)
    return { choice, note: 'Run `odoro db:create` as soon as the platform is there.' }
  }

  if (choice === 'later') {
    return {
      choice,
      note: 'No database: the client will start, and /api/ready will answer 503 saying what is missing.',
    }
  }

  const url = ensure(
    await prompts.text({
      message: 'PostgreSQL URL',
      placeholder: 'postgres://user:password@host:5432/database?sslmode=require',
      validate: (value) => checkDatabaseUrl(value ?? ''),
    }),
  )

  return {
    choice,
    url: url.trim(),
    // Only the shape was checked: say so, rather than letting one believe the
    // connection was established.
    note: 'URL shape checked. The connection will be established on the first start.',
  }
}

/**
 * Asks what the project ships with.
 *
 * ## A checklist, and not a series of yes/no questions
 *
 * The modules do not depend on one another — except the router, which lives in
 * the libraries — and turning them into successive questions would make five
 * screens for a choice that fits in one. The list also shows, at a glance, what
 * the project **will not have**, which a series of questions hides.
 *
 * ## Nothing is mandatory
 *
 * Everything can be unticked. The project then starts without the Odoro
 * stylesheet and without the router, in bare React — a legitimate choice for
 * someone bringing their own system, and it was better to make it true than to
 * display a locked box. `required: false` is therefore deliberate: the empty
 * list is an answer, not an error.
 *
 * @returns The modules kept, or `undefined` when the input is refused.
 */
async function askModules(
  options: CreateOptions,
): Promise<readonly ModuleId[] | undefined> {
  if (options.modules !== undefined) {
    const read = readModules(options.modules)
    if (read.error !== undefined) {
      prompts.cancel(read.error)
      return undefined
    }
    return announce(resolveModules(read.modules))
  }

  if (options.yes === true) return DEFAULT_MODULES

  const chosen = ensure(
    await prompts.multiselect<ModuleId>({
      message: 'What goes in the project?',
      initialValues: [...DEFAULT_MODULES],
      required: false,
      options: MODULES.map((module) => ({
        value: module.id,
        label: module.label,
        hint: module.hint,
      })),
    }),
  )

  return announce(resolveModules(chosen))
}

/** Says what the resolution had to remove, then returns the selection kept. */
function announce(resolution: ReturnType<typeof resolveModules>): readonly ModuleId[] {
  for (const warning of resolution.warnings) prompts.log.warn(warning)
  return resolution.modules
}

/**
 * Installs the dependencies while showing where the manager is.
 *
 * ## Why this is no longer a silent \`execSync\`
 *
 * The install is by far the longest step — ten to sixty seconds depending on
 * the network. A line frozen during that time does not say whether something is
 * moving, whether the network went down, or whether the terminal is waiting for
 * an answer. One ends up pressing a key to see.
 *
 * The process is therefore run as a stream: every line it writes comes back,
 * and the last one is shown next to the timer. You see the manager resolve,
 * download, link — and you know, at every moment, that it is not stuck.
 *
 * ## On failure, we show the end
 *
 * \`stdio: 'ignore'\` threw the output away: a failure left a "run it by hand"
 * without saying why. The last lines are kept, and shown again — that is where
 * the manager explains what stopped it.
 *
 * @returns \`true\` when the install succeeded.
 */
async function installDependencies(
  target: string,
  manager: PackageManager,
): Promise<boolean> {
  const [command, ...args] = installCommand(manager).split(' ')
  if (command === undefined) return false

  const bar = prompts.spinner({ indicator: 'timer' })
  bar.start(`Installing dependencies with ${manager}`)

  // The last lines, and only them: a chatty install writes thousands of them,
  // and keeping only the end is enough to explain a failure.
  const tail: string[] = []
  const keep = (block: string): void => {
    for (const line of block.split('\n')) {
      const clean = line.trim()
      // Lines without content are skipped: a manager formats its warnings over
      // several lines, and showing a lone brace next to the timer says nothing
      // about what is moving.
      if (clean === '' || !/[a-z0-9]/i.test(clean)) continue
      tail.push(clean)
      if (tail.length > LAST_LINES) tail.shift()
      // Truncated: a line wider than the terminal would scroll it, and the bar
      // would jump on every update.
      bar.message(`${manager} · ${clean.slice(0, LINE_WIDTH)}`)
    }
  }

  const code = await new Promise<number>((resolve_) => {
    // \`shell\` on Windows: \`npm\` is a script there, and \`spawn\` without a shell
    // cannot run it.
    const child = spawn(command, args, {
      cwd: target,
      shell: process.platform === 'win32',
    })
    child.stdout?.setEncoding('utf8').on('data', keep)
    child.stderr?.setEncoding('utf8').on('data', keep)
    child.on('error', () => {
      resolve_(-1)
    })
    child.on('close', (status) => {
      resolve_(status ?? -1)
    })
  })

  if (code === 0) {
    bar.stop(`Dependencies installed with ${manager}`)
    return true
  }

  // The second argument marks the line as a failure: it comes out in red,
  // instead of looking like one more successful step.
  bar.stop(`${manager} install failed`, 1)
  for (const line of tail) prompts.log.error(colors.dim(line))
  return false
}

/**
 * The version of the CLI that is running, read from its own manifest.
 *
 * Frozen in a constant, it would be right the day it is written and wrong at
 * the next publication.
 */
function cliVersion(): string {
  try {
    const manifest = join(dirname(templatesRoot()), 'package.json')
    const { version } = JSON.parse(readFileSync(manifest, 'utf8')) as { version: string }
    return version
  } catch {
    // A creation must succeed even when the manifest cannot be read: we then
    // show no number rather than invent one.
    return '?'
  }
}

/** Stops cleanly when the user cancels a question. */
function ensure<T>(value: T | symbol): T {
  if (prompts.isCancel(value)) {
    prompts.cancel('Cancelled.')
    process.exit(0)
  }
  return value as T
}

/**
 * Creates a project from a template.
 *
 * @returns The exit code of the process.
 *
 * @example
 * await createCommand({ name: 'my-site', template: 'react-ts', yes: true })
 */
export async function createCommand(options: CreateOptions): Promise<number> {
  const root = templatesRoot()
  const templates = availableTemplates(root)
  const defaultTemplate = templates[0] ?? 'react-ts'

  // Blue and not magenta: it is the hue of the brand, the one of the mark and
  // of the site. The version number is shown because it is the first thing one
  // asks for when something goes wrong.
  prompts.intro(
    `${colors.bgBlue(colors.black(' ODORO '))} ${colors.dim(`v${cliVersion()}`)}`,
  )

  const rawName =
    options.name ??
    (options.yes === true
      ? 'odoro-app'
      : ensure(
          await prompts.text({
            message: 'Project name',
            placeholder: 'my-site',
            defaultValue: 'odoro-app',
            validate: (value) =>
              value === '' ? undefined : validatePackageName(toPackageName(value)),
          }),
        ))

  const target = resolve(process.cwd(), rawName)
  const packageName = toPackageName(basename(target))

  const invalid = validatePackageName(packageName)
  if (invalid !== undefined) {
    prompts.cancel(invalid)
    return 1
  }

  // Common trap: the directory already exists. Overwriting without asking would
  // destroy work; refusing without an alternative would force starting over.
  let overwrite = options.overwrite
  const state = inspectTarget(target)
  if (state === 'occupied' && overwrite === undefined) {
    if (options.yes === true) {
      prompts.cancel(
        `Folder "${basename(target)}" is not empty. Pass --overwrite or --merge.`,
      )
      return 1
    }

    const choice = ensure(
      await prompts.select({
        message: `Folder "${basename(target)}" is not empty.`,
        options: [
          { value: 'cancel', label: 'Cancel' },
          { value: 'fusionner', label: 'Merge — overwrites files of the same name' },
          { value: 'ecraser', label: 'Empty the folder, then create the project' },
        ],
      }),
    )

    if (choice === 'cancel') {
      prompts.cancel('Creation cancelled.')
      return 0
    }
    overwrite = choice as OverwriteMode
  }

  const template =
    options.template ??
    (options.yes === true
      ? defaultTemplate
      : ensure(
          await prompts.select({
            message: 'Template',
            initialValue: defaultTemplate,
            options: templates.map((name) => ({
              value: name,
              label: name,
              hint: TEMPLATE_LABELS[name],
            })),
          }),
        ))

  if (!templates.includes(template)) {
    prompts.cancel(`Unknown template: "${template}". Available: ${templates.join(', ')}.`)
    return 1
  }

  const modules = await askModules(options)
  if (modules === undefined) return 1

  const detected = detectPackageManager()
  const manager = (options.pm ??
    (options.yes === true
      ? detected
      : ensure(
          await prompts.select({
            message: 'Package manager',
            initialValue: detected,
            options: PACKAGE_MANAGERS.map((name) => ({
              value: name,
              label: name,
              hint: name === detected ? 'detected' : undefined,
            })),
          }),
        ))) as PackageManager

  if (!PACKAGE_MANAGERS.includes(manager)) {
    prompts.cancel(`Unknown package manager: "${manager}".`)
    return 1
  }

  // The database is only asked about for a template that needs one.
  const database =
    template === 'react-ts-server' && options.yes !== true
      ? await askDatabase()
      : undefined

  const withGit =
    options.git ??
    (options.yes === true
      ? true
      : ensure(await prompts.confirm({ message: 'Initialize a git repository?' })))

  const withInstall =
    options.install ??
    (options.yes === true
      ? true
      : ensure(
          await prompts.confirm({
            message: `Install dependencies with ${manager}?`,
          }),
        ))

  const spinner = prompts.spinner()
  spinner.start('Writing files')

  const scaffoldOptions: Parameters<typeof scaffold>[0] = {
    target,
    template,
    packageName,
    root,
  }
  if (overwrite !== undefined) scaffoldOptions.overwrite = overwrite
  scaffoldOptions.modules = modules

  const { files } = await scaffold(scaffoldOptions)
  spinner.stop(
    `${String(files.length)} files written to ${colors.cyan(basename(target))}`,
  )

  if (withGit && !existsSync(resolve(target, '.git'))) {
    try {
      execSync('git init -q', { cwd: target, stdio: 'ignore' })
      prompts.log.success('Git repository initialized.')
    } catch {
      prompts.log.warn('git was not found — repository not initialized.')
    }
  }

  if (database?.url !== undefined) {
    await writeDatabaseUrl(target, database.url)
    prompts.log.success('Database URL written to .env')

    const risk = await assertEnvIgnored(target)
    if (risk !== undefined) prompts.log.warn(risk)
  }

  if (database !== undefined) prompts.log.info(database.note)

  // The registry does not get installed: its entries are copied into the
  // project. What has to be prepared is therefore the destination.
  // `odoro.json` carries the landing directory, the import prefix inferred from
  // the tsconfig, and the address of the registry; without it, the first
  // `odoro add` command would stop to ask three questions whose answers are
  // already known.
  //
  // `yes` is passed: the creation has just asked its questions, and chaining
  // more would make the same choice be paid for twice.
  if (modules.includes('registre')) {
    const { initCommand } = await import('../add/commands.js')
    const code = await initCommand({ root: target, yes: true })
    if (code !== 0) {
      // An unconfigured registry does not compromise the project: everything
      // else is written, and the command can be run again by hand.
      prompts.log.warn(
        'The registry could not be configured. Run `odoro init` in the project.',
      )
    }
  }

  const installed = withInstall ? await installDependencies(target, manager) : false

  const steps = [
    `cd ${basename(target)}`,
    // When the install failed, the command comes back into the steps: the
    // project is written, it is only missing its dependencies.
    ...(installed ? [] : [installCommand(manager)]),
    // `odoro.json` has just been written: what remains to show is the command
    // that uses it.
    ...(modules.includes('registre') ? ['odoro add text/count-up'] : []),
    runCommand(manager, 'dev'),
  ]

  prompts.note(steps.join('\n'), 'Next steps')
  prompts.outro(colors.green('Happy building.'))

  return 0
}
