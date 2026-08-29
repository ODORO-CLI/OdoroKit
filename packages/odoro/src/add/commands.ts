/**
 * Les commandes de registre : `init`, `add`, `list`, `diff`, `doctor`.
 *
 * Elles ne portent que l'interaction et l'affichage. Tout ce qui se decide —
 * resolution du graphe, plan d'ecriture, comparaison des versions — vit dans
 * les modules voisins, ou cela se teste sans terminal.
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

/** Registre public par defaut. */
export const DEFAULT_REGISTRY = 'https://register.odoro.dev'

/** Options communes a toutes les commandes de registre. */
export interface RegistryOptions {
  /** Racine du projet. */
  root: string
  /** Adresse du registre, si elle surcharge celle du projet. */
  registry?: string | undefined
  /** N'attend aucune confirmation. */
  yes?: boolean | undefined
}

/**
 * Indique si l'on peut poser une question.
 *
 * Sans terminal — integration continue, sortie redirigee, script — une
 * invite n'attendrait pas une reponse : elle attendrait indefiniment. La
 * commande refuse alors, en disant quoi ajouter, plutot que de bloquer une
 * chaine de compilation sur un curseur que personne ne voit.
 */
function canAsk(options: RegistryOptions): boolean {
  return options.yes !== true && process.stdin.isTTY === true
}

/** Refus explicite quand une confirmation serait necessaire mais impossible. */
function needsConfirmation(what: string): number {
  log.error(
    `${what} Relancez avec ${colors.cyan('--yes')} pour l'accepter sans question.`,
  )
  return 1
}

/** Affiche une liste de problemes et rend le code de sortie. */
function fail(title: string, problems: readonly string[]): number {
  log.error(title)
  for (const problem of problems) console.error(`  ${colors.dim('·')} ${problem}`)
  return 1
}

/** Charge la configuration, ou explique quoi faire. */
async function requireProject(root: string): Promise<ProjectConfig | number> {
  const loaded = await loadProject(root)
  if (loaded.ok) return loaded.config

  if (loaded.reason === 'absent') {
    log.error(`Aucun ${CONFIG_FILE} ici. Lancez ${colors.cyan('odoro init')} d'abord.`)
    return 1
  }
  return fail(`${CONFIG_FILE} est illisible :`, loaded.problems)
}

/**
 * Prepare un projet a recevoir des composants.
 *
 * @example
 * await initCommand({ root: process.cwd(), yes: true })
 */
export async function initCommand(options: RegistryOptions): Promise<number> {
  const { root } = options

  const existing = await loadProject(root)
  if (existing.ok && options.yes !== true) {
    if (!canAsk(options)) {
      return needsConfirmation(`${CONFIG_FILE} existe deja et serait remplace.`)
    }
    const replace = await prompts.confirm({
      message: `${CONFIG_FILE} existe deja. Le remplacer ?`,
      initialValue: false,
    })
    if (prompts.isCancel(replace) || !replace) {
      log.info('Rien n a ete change.')
      return 0
    }
  }

  const guess = await guessAlias(root)
  const suggested = defaultAliases(guess)

  if (guess === null) {
    log.warn(
      `Aucun alias trouve dans tsconfig.json : les imports seront ecrits en ${colors.cyan(suggested.import)}.`,
    )
  } else {
    log.info(
      `Alias trouve dans tsconfig.json : ${colors.cyan(`${guess.prefix}/*`)} vers ${colors.cyan(`${guess.directory}/`)}.`,
    )
  }

  let aliases = suggested
  let registry = options.registry ?? DEFAULT_REGISTRY

  if (canAsk(options)) {
    const directory = await prompts.text({
      message: 'Ou ecrire les composants ?',
      initialValue: suggested.directory,
    })
    if (prompts.isCancel(directory)) return 0

    const importPrefix = await prompts.text({
      message: 'Sous quel prefixe les importer ?',
      initialValue: suggested.import,
    })
    if (prompts.isCancel(importPrefix)) return 0

    const source = await prompts.text({ message: 'Registre ?', initialValue: registry })
    if (prompts.isCancel(source)) return 0

    aliases = { directory, import: importPrefix }
    registry = source
  }

  const config: ProjectConfig = { version: 1, registry, aliases, installed: {} }
  await saveProject(root, config)

  log.success(`${CONFIG_FILE} ecrit.`)
  console.log(`  ${colors.dim('destination')}  ${aliases.directory}/`)
  console.log(`  ${colors.dim('imports')}      ${aliases.import}/…`)
  console.log(`  ${colors.dim('registre')}     ${registry}`)
  console.log(`\n  ${colors.cyan('odoro list')} donne le catalogue.\n`)
  return 0
}

/** Symbole affiche devant une action d'ecriture. */
const ACTION_MARK = {
  creation: colors.green('+'),
  remplacement: colors.yellow('~'),
  inchange: colors.dim('='),
} as const

/**
 * Installe une ou plusieurs entrees du registre.
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
    log.error('Rien a installer. Donnez un nom, ou "odoro list" pour le catalogue.')
    return 1
  }

  const registry = openRegistry(options.registry ?? config.registry, root)
  const prepared = await prepareInstall(registry, requested)
  if (!prepared.ok) return fail('Installation impossible :', prepared.problems)

  const { entries, implied } = prepared

  // Ce qui arrive sans avoir ete demande doit etre dit avant, pas decouvert
  // apres coup dans le suivi de version.
  if (implied.length > 0) {
    log.info(`Dependances ajoutees : ${implied.map((id) => colors.cyan(id)).join(', ')}`)
  }

  for (const warning of weighEntries(entries)) log.warn(warning.message)

  const missing = await missingPackages(root, requiredPackages(entries))
  if (missing.length > 0) {
    log.warn(
      `A installer ensuite : ${missing.map((name) => colors.cyan(name)).join(' ')}`,
    )
  }

  const plan = await planInstall(root, config, entries)
  const replacing = plan.filter((write) => write.action === 'remplacement')

  console.log('')
  for (const write of plan) {
    console.log(`  ${ACTION_MARK[write.action]} ${write.path}`)
  }
  console.log('')

  if (replacing.length > 0 && options.yes !== true) {
    // Un remplacement peut effacer des heures de reglages. C'est la seule
    // question que la commande pose vraiment.
    if (!canAsk(options)) {
      return needsConfirmation(
        `${String(replacing.length)} fichier(s) existant(s) seraient remplaces.`,
      )
    }
    const go = await prompts.confirm({
      message: `${String(replacing.length)} fichier(s) existant(s) seront remplaces. Continuer ?`,
      initialValue: false,
    })
    if (prompts.isCancel(go) || !go) {
      log.info('Rien n a ete ecrit.')
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
      report.skipped.length > 0 ? `, ${String(report.skipped.length)} inchange(s)` : ''
    log.success(`${written} fichier(s) ecrit(s)${skipped}.`)
  } catch (cause) {
    log.error('Ecriture interrompue : le projet est inchange.', cause)
    return 1
  }

  warnUndeclared(entries)
  return 0
}

/** Signale les imports de registre qu'une entree n'a pas declares. */
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
            `${entry.id} importe ${colors.cyan(token)} sans l'avoir declare : signalez-le au registre.`,
          )
        }
      }
    }
  }
}

/** Paquets reclames qui ne figurent pas dans le `package.json` du projet. */
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
 * Affiche le catalogue.
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
  if (!index.ok) return fail('Catalogue illisible :', index.problems)

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
  const marked = installed.size > 0 ? `, ${colors.green('✓')} = deja installe` : ''
  console.log(`  ${colors.dim(`${total} entree(s)${marked}`)}\n`)
  return 0
}

/** Couleur associee a un etat de fichier. */
function stateColor(state: FileState): string {
  const label = STATE_LABEL[state]
  if (state === 'a-jour') return colors.green(label)
  if (state === 'retouche') return colors.cyan(label)
  if (state === 'absent' || state === 'divergence') return colors.red(label)
  return colors.yellow(label)
}

/**
 * Compare ce qui est installe a ce que le registre sert.
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
    log.info('Aucun composant installe.')
    return 0
  }

  const registry = openRegistry(options.registry ?? config.registry, root)
  const reports = await inspectAll(root, config, registry)

  let interesting = 0
  console.log('')

  for (const report of reports) {
    if (report.orphan) {
      console.log(`  ${colors.cyan(report.id)} ${colors.dim('— absent du registre')}`)
      interesting += 1
      continue
    }

    for (const file of report.files) {
      if (file.state === 'a-jour') continue
      interesting += 1

      console.log(`  ${colors.cyan(report.id)} ${colors.dim(file.path)}`)
      console.log(`    ${stateColor(file.state)}`)

      if (file.local !== null && file.upstream !== null && file.state !== 'retouche') {
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
    log.success(`${String(ids.length)} entree(s) installee(s), toutes a jour.`)
    return 0
  }

  console.log(
    `  ${colors.dim(`odoro add <nom> réécrit une entrée depuis le registre. Vos retouches seraient perdues.`)}\n`,
  )
  return 0
}

/**
 * Verifie qu'un projet est en etat de fonctionner.
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
      ? fail('Diagnostic impossible :', [`aucun ${CONFIG_FILE}. Lancez "odoro init".`])
      : fail(`${CONFIG_FILE} est illisible :`, loaded.problems)
  }
  const config = loaded.config

  notes.push(`registre : ${config.registry}`)
  if (!isRemote(config.registry)) {
    notes.push('registre local : les autres machines de l equipe ne le verront pas.')
  }

  // Le dossier de destination.
  const { access } = await import('node:fs/promises')
  try {
    await access(join(root, config.aliases.directory))
  } catch {
    if (Object.keys(config.installed).length > 0) {
      troubles.push(
        `${config.aliases.directory}/ n'existe pas, alors que des entrees y sont notees.`,
      )
    }
  }

  // Les fichiers annonces.
  const registry = openRegistry(options.registry ?? config.registry, root)
  const reports = await inspectAll(root, config, registry)

  let retouched = 0
  for (const report of reports) {
    if (report.orphan) {
      notes.push(`${report.id} n'est plus servi par le registre.`)
      continue
    }
    for (const file of report.files) {
      if (file.state === 'absent') {
        troubles.push(`${report.id} : ${file.path} est note comme installe mais absent.`)
      }
      if (file.state === 'retouche') retouched += 1
      if (file.state === 'mise-a-jour' || file.state === 'divergence') {
        notes.push(`${report.id} : ${STATE_LABEL[file.state]} (${file.path}).`)
      }
    }
  }

  if (retouched > 0) {
    // Une retouche locale n'est pas un probleme — c'est la raison d'etre de la
    // copie. Elle est signalee parce qu'une reinstallation l'effacerait.
    notes.push(
      `${String(retouched)} fichier(s) retouche(s) localement : "odoro add" les reecrirait.`,
    )
  }

  // Les paquets reclames. Ils se lisent dans le `meta` de chaque entree, pas
  // dans l'index : celui-ci ne garde pas les plugins d'orchestration.
  const served = reports
    .map((report) => report.upstream)
    .filter((entry): entry is PublishedEntry => entry !== null)

  for (const name of await missingPackages(root, requiredPackages(served))) {
    troubles.push(
      `${name} est requis par un composant installe mais absent du package.json.`,
    )
  }

  console.log('')
  for (const note of notes) console.log(`  ${colors.dim('·')} ${note}`)
  if (notes.length > 0) console.log('')

  if (troubles.length === 0) {
    log.success('Rien a signaler.')
    return 0
  }

  for (const trouble of troubles) console.error(`  ${colors.red('·')} ${trouble}`)
  console.log('')
  log.error(`${String(troubles.length)} probleme(s).`)
  return 1
}
