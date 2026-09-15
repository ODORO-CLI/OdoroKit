/**
 * The registry commands: `init`, `add`, `list`, `diff`, `doctor`.
 *
 * They carry only the interaction and the display. Everything that is decided —
 * graph resolution, write plan, comparison of versions — lives in the
 * neighbouring modules, where it can be tested without a terminal.
 *
 * @module
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import * as prompts from '@clack/prompts'

import type { PublishedEntry } from '../registry/index.js'
import * as log from '../shared/logger.js'
import { colors } from '../shared/logger.js'
import { defaultAliases, guessAlias } from './aliases.js'
import { inspectAll, previewChanges, STATE_LABEL, type FileState } from './inspect.js'
import { planInstall, prepareInstall, recordInstall } from './install.js'
import { CONFIG_FILE, loadProject, saveProject, type ProjectConfig } from './project.js'
import { usedTokens } from './rewrite.js'
import { isRemote, openRegistry } from './source.js'
import { requiredPackages, weighEntries } from './weight.js'
import { applyPlan } from './writer.js'

/** Default public registry. */
export const DEFAULT_REGISTRY = 'https://register.odoro.dev'

/** Options common to every registry command. */
export interface RegistryOptions {
  /** Project root. */
  root: string
  /** Address of the registry, when it overrides the project one. */
  registry?: string | undefined
  /** Waits for no confirmation. */
  yes?: boolean | undefined
}

/**
 * Tells whether a question can be asked.
 *
 * Without a terminal — continuous integration, redirected output, script — a
 * prompt would not wait for an answer: it would wait forever. The command then
 * refuses, saying what to add, rather than block a build chain on a cursor
 * nobody sees.
 */
function canAsk(options: RegistryOptions): boolean {
  return options.yes !== true && process.stdin.isTTY === true
}

/** Explicit refusal when a confirmation would be needed but is impossible. */
function needsConfirmation(what: string): number {
  log.error(`${what} Run again with ${colors.cyan('--yes')} to accept it without asking.`)
  return 1
}

/** Prints a list of problems and returns the exit code. */
function fail(title: string, problems: readonly string[]): number {
  log.error(title)
  for (const problem of problems) console.error(`  ${colors.dim('·')} ${problem}`)
  return 1
}

/** Loads the configuration, or explains what to do. */
async function requireProject(root: string): Promise<ProjectConfig | number> {
  const loaded = await loadProject(root)
  if (loaded.ok) return loaded.config

  if (loaded.reason === 'absent') {
    log.error(`No ${CONFIG_FILE} here. Run ${colors.cyan('odoro init')} first.`)
    return 1
  }
  return fail(`${CONFIG_FILE} is unreadable:`, loaded.problems)
}

/**
 * Prepares a project to receive components.
 *
 * @example
 * await initCommand({ root: process.cwd(), yes: true })
 */
export async function initCommand(options: RegistryOptions): Promise<number> {
  const { root } = options

  const existing = await loadProject(root)
  if (existing.ok && options.yes !== true) {
    if (!canAsk(options)) {
      return needsConfirmation(`${CONFIG_FILE} already exists and would be replaced.`)
    }
    const replace = await prompts.confirm({
      message: `${CONFIG_FILE} already exists. Replace it?`,
      initialValue: false,
    })
    if (prompts.isCancel(replace) || !replace) {
      log.info('Nothing was changed.')
      return 0
    }
  }

  const guess = await guessAlias(root)
  const suggested = defaultAliases(guess)

  if (guess === null) {
    log.warn(
      `No alias found in tsconfig.json: the components will go to ${colors.cyan(suggested.directory)}/ and will import each other relatively.`,
    )
  } else {
    log.info(
      `Alias found in tsconfig.json: ${colors.cyan(`${guess.prefix}/*`)} towards ${colors.cyan(`${guess.directory}/`)}.`,
    )
  }

  let aliases = suggested
  let registry = options.registry ?? DEFAULT_REGISTRY

  if (canAsk(options)) {
    const directory = await prompts.text({
      message: 'Where should the components be written?',
      initialValue: suggested.directory,
    })
    if (prompts.isCancel(directory)) return 0

    const importPrefix = await prompts.text({
      message: 'Under which prefix should they be imported?',
      initialValue: suggested.import,
    })
    if (prompts.isCancel(importPrefix)) return 0

    const source = await prompts.text({ message: 'Registry?', initialValue: registry })
    if (prompts.isCancel(source)) return 0

    aliases = { directory, import: importPrefix }
    registry = source
  }

  const config: ProjectConfig = { version: 1, registry, aliases, installed: {} }
  await saveProject(root, config)

  log.success(`${CONFIG_FILE} written.`)
  console.log(`  ${colors.dim('destination')}  ${aliases.directory}/`)
  console.log(`  ${colors.dim('imports')}      ${aliases.import}/…`)
  console.log(`  ${colors.dim('registry')}     ${registry}`)
  console.log(`\n  ${colors.cyan('odoro list')} gives the catalogue.\n`)
  return 0
}

/** Symbol shown in front of a write action. */
const ACTION_MARK = {
  create: colors.green('+'),
  replace: colors.yellow('~'),
  unchanged: colors.dim('='),
} as const

/**
 * Installs one or several registry entries.
 *
 * @example
 * await addCommand({ root: process.cwd() }, ['hero/molten'])
 */
export async function addCommand(
  options: RegistryOptions,
  requested: readonly string[],
): Promise<number> {
  const { root } = options

  const config = await requireProject(root)
  if (typeof config === 'number') return config

  if (requested.length === 0) {
    log.error('Nothing to install. Give a name, or "odoro list" for the catalogue.')
    return 1
  }

  const registry = openRegistry(options.registry ?? config.registry, root)
  const prepared = await prepareInstall(registry, requested)
  if (!prepared.ok) return fail('Install impossible:', prepared.problems)

  const { entries, implied } = prepared

  // What arrives without having been asked for must be said beforehand, not
  // discovered afterwards in version control.
  if (implied.length > 0) {
    log.info(`Dependencies added: ${implied.map((id) => colors.cyan(id)).join(', ')}`)
  }

  for (const warning of weighEntries(entries)) log.warn(warning.message)

  const missing = await missingPackages(root, requiredPackages(entries))
  if (missing.length > 0) {
    log.warn(`To install next: ${missing.map((name) => colors.cyan(name)).join(' ')}`)
  }

  const plan = await planInstall(root, config, entries)
  const replacing = plan.filter((write) => write.action === 'replace')

  console.log('')
  for (const write of plan) {
    console.log(`  ${ACTION_MARK[write.action]} ${write.path}`)
  }
  console.log('')

  if (replacing.length > 0 && options.yes !== true) {
    // A replacement can erase hours of tuning. It is the only question the
    // command really asks.
    if (!canAsk(options)) {
      return needsConfirmation(
        `${String(replacing.length)} existing file(s) would be replaced.`,
      )
    }
    const go = await prompts.confirm({
      message: `${String(replacing.length)} existing file(s) will be replaced. Continue?`,
      initialValue: false,
    })
    if (prompts.isCancel(go) || !go) {
      log.info('Nothing was written.')
      return 0
    }
  }

  try {
    const report = await applyPlan(root, plan)
    const updated: ProjectConfig = {
      ...config,
      installed: recordInstall(config.installed, entries, plan, new Date()),
    }
    await saveProject(root, updated)

    const written = String(report.written.length)
    const skipped =
      report.skipped.length > 0 ? `, ${String(report.skipped.length)} unchanged` : ''
    log.success(`${written} file(s) written${skipped}.`)
  } catch (cause) {
    log.error('Write interrupted: the project is unchanged.', cause)
    return 1
  }

  warnUndeclared(entries)
  return 0
}

/** Reports the registry imports an entry did not declare. */
function warnUndeclared(entries: readonly PublishedEntry[]): void {
  const targets = new Set(
    entries.flatMap((entry) => entry.files.map((file) => file.target)),
  )

  for (const entry of entries) {
    for (const source of Object.values(entry.sources)) {
      for (const token of usedTokens(source)) {
        const matched = [...targets].some((target) => target.startsWith(token))
        if (!matched) {
          log.warn(
            `${entry.id} imports ${colors.cyan(token)} without declaring it: report it to the registry.`,
          )
        }
      }
    }
  }
}

/** Required packages that do not appear in the `package.json` of the project. */
async function missingPackages(
  root: string,
  required: readonly string[],
): Promise<string[]> {
  if (required.length === 0) return []

  let manifest: {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }
  try {
    manifest = JSON.parse(
      await readFile(join(root, 'package.json'), 'utf8'),
    ) as typeof manifest
  } catch {
    return [...required]
  }

  const present = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
  ])
  return required.filter((name) => !present.has(name))
}

/**
 * Shows the catalogue.
 *
 * @example
 * await listCommand({ root: process.cwd() })
 */
export async function listCommand(options: RegistryOptions): Promise<number> {
  const { root } = options

  const loaded = await loadProject(root)
  const location =
    options.registry ?? (loaded.ok ? loaded.config.registry : DEFAULT_REGISTRY)
  const installed = loaded.ok
    ? new Set(Object.keys(loaded.config.installed))
    : new Set<string>()

  const registry = openRegistry(location, root)
  const index = await registry.index()
  if (!index.ok) return fail('Catalogue unreadable:', index.problems)

  const byCategory = new Map<string, typeof index.value.entries>()
  for (const entry of index.value.entries) {
    byCategory.set(entry.category, [...(byCategory.get(entry.category) ?? []), entry])
  }

  console.log(`\n  ${colors.dim(registry.location)}\n`)

  for (const [category, entries] of [...byCategory].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    console.log(`  ${colors.bold(category)}`)
    for (const entry of entries) {
      const mark = installed.has(entry.id) ? colors.green('✓') : ' '
      const cost =
        entry.backend === false ? '' : colors.yellow(` (${entry.backend}, ${entry.tier})`)
      console.log(
        `   ${mark} ${colors.cyan(entry.name.padEnd(22))} ${entry.description}${cost}`,
      )
    }
    console.log('')
  }

  const total = String(index.value.entries.length)
  const marked = installed.size > 0 ? `, ${colors.green('✓')} = already installed` : ''
  console.log(`  ${colors.dim(`${total} entr${total === '1' ? 'y' : 'ies'}${marked}`)}\n`)
  return 0
}

/** Colour matching a file state. */
function stateColor(state: FileState): string {
  const label = STATE_LABEL[state]
  if (state === 'up-to-date') return colors.green(label)
  if (state === 'edited') return colors.cyan(label)
  if (state === 'missing' || state === 'diverged') return colors.red(label)
  return colors.yellow(label)
}

/**
 * Compares what is installed to what the registry serves.
 *
 * @example
 * await diffCommand({ root: process.cwd() })
 */
export async function diffCommand(options: RegistryOptions): Promise<number> {
  const { root } = options

  const config = await requireProject(root)
  if (typeof config === 'number') return config

  const ids = Object.keys(config.installed)
  if (ids.length === 0) {
    log.info('No component installed.')
    return 0
  }

  const registry = openRegistry(options.registry ?? config.registry, root)
  const reports = await inspectAll(root, config, registry)

  let interesting = 0
  console.log('')

  for (const report of reports) {
    if (report.orphan) {
      console.log(
        `  ${colors.cyan(report.id)} ${colors.dim('— missing from the registry')}`,
      )
      interesting += 1
      continue
    }

    for (const file of report.files) {
      if (file.state === 'up-to-date') continue
      interesting += 1

      console.log(`  ${colors.cyan(report.id)} ${colors.dim(file.path)}`)
      console.log(`    ${stateColor(file.state)}`)

      if (file.local !== null && file.upstream !== null && file.state !== 'edited') {
        const changes = previewChanges(file.local, file.upstream)
        for (const line of changes.removed)
          console.log(`    ${colors.red(`- ${line.trim()}`)}`)
        for (const line of changes.added)
          console.log(`    ${colors.green(`+ ${line.trim()}`)}`)
      }
      console.log('')
    }
  }

  if (interesting === 0) {
    log.success(
      `${String(ids.length)} entr${ids.length === 1 ? 'y' : 'ies'} installed, all up to date.`,
    )
    return 0
  }

  console.log(
    `  ${colors.dim(`odoro add <name> rewrites an entry from the registry. Your edits would be lost.`)}\n`,
  )
  return 0
}

/**
 * Checks that a project is in working order.
 *
 * @example
 * await doctorCommand({ root: process.cwd() })
 */
export async function doctorCommand(options: RegistryOptions): Promise<number> {
  const { root } = options
  const troubles: string[] = []
  const notes: string[] = []

  const loaded = await loadProject(root)
  if (!loaded.ok) {
    return loaded.reason === 'absent'
      ? fail('Diagnostics impossible:', [`no ${CONFIG_FILE}. Run "odoro init".`])
      : fail(`${CONFIG_FILE} is unreadable:`, loaded.problems)
  }
  const config = loaded.config

  notes.push(`registry: ${config.registry}`)
  if (!isRemote(config.registry)) {
    notes.push('local registry: the other machines of the team will not see it.')
  }

  // The destination directory.
  const { access } = await import('node:fs/promises')
  try {
    await access(join(root, config.aliases.directory))
  } catch {
    if (Object.keys(config.installed).length > 0) {
      troubles.push(
        `${config.aliases.directory}/ does not exist, while entries are recorded in it.`,
      )
    }
  }

  // The announced files.
  const registry = openRegistry(options.registry ?? config.registry, root)
  const reports = await inspectAll(root, config, registry)

  let edited = 0
  for (const report of reports) {
    if (report.orphan) {
      notes.push(`${report.id} is no longer served by the registry.`)
      continue
    }
    for (const file of report.files) {
      if (file.state === 'missing') {
        troubles.push(`${report.id}: ${file.path} is recorded as installed but missing.`)
      }
      if (file.state === 'edited') edited += 1
      if (file.state === 'update-available' || file.state === 'diverged') {
        notes.push(`${report.id}: ${STATE_LABEL[file.state]} (${file.path}).`)
      }
    }
  }

  if (edited > 0) {
    // A local edit is not a problem — it is the whole point of the copy. It is
    // reported because a reinstall would erase it.
    notes.push(
      `${String(edited)} file(s) edited locally: "odoro add" would rewrite them.`,
    )
  }

  // The required packages. They are read from the `meta` of each entry, not
  // from the index: that one does not keep the orchestration plugins.
  const served = reports
    .map((report) => report.upstream)
    .filter((entry): entry is PublishedEntry => entry !== null)

  for (const name of await missingPackages(root, requiredPackages(served))) {
    troubles.push(
      `${name} is required by an installed component but missing from the package.json.`,
    )
  }

  console.log('')
  for (const note of notes) console.log(`  ${colors.dim('·')} ${note}`)
  if (notes.length > 0) console.log('')

  if (troubles.length === 0) {
    log.success('Nothing to report.')
    return 0
  }

  for (const trouble of troubles) console.error(`  ${colors.red('·')} ${trouble}`)
  console.log('')
  log.error(`${String(troubles.length)} problem(s).`)
  return 1
}
