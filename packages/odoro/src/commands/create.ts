/**
 * Commande `odoro create` : creation d'un projet.
 *
 * @module
 */

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { basename, resolve } from 'node:path'

import * as prompts from '@clack/prompts'
import colors from 'picocolors'

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

/** Options de la commande, telles qu'issues de la ligne de commande. */
export interface CreateOptions {
  /** Nom ou chemin du projet, en argument positionnel. */
  name?: string
  /** Template a utiliser, sans demander. */
  template?: string
  /** Gestionnaire de paquets, sans demander. */
  pm?: string
  /** Initialise un depot git. */
  git?: boolean
  /** Installe les dependances. */
  install?: boolean
  /** Accepte toutes les valeurs par defaut sans rien demander. */
  yes?: boolean
  /** Conduite a tenir si le dossier cible n'est pas vide. */
  overwrite?: OverwriteMode
}

/** Descriptions affichees dans le selecteur de template. */
const TEMPLATE_LABELS: Readonly<Record<string, string>> = {
  'react-ts': 'Application monopage — React, TypeScript, routeur et animations Odoro',
  'react-ts-express':
    'Client et serveur — la meme application, plus une API Express typee et un Dockerfile',
}

/** Interrompt proprement si l'utilisateur annule une question. */
function ensure<T>(value: T | symbol): T {
  if (prompts.isCancel(value)) {
    prompts.cancel('Creation annulee.')
    process.exit(0)
  }
  return value as T
}

/**
 * Cree un projet a partir d'un template.
 *
 * @returns Le code de sortie du processus.
 *
 * @example
 * await createCommand({ name: 'mon-site', template: 'react-ts', yes: true })
 */
export async function createCommand(options: CreateOptions): Promise<number> {
  const root = templatesRoot()
  const templates = availableTemplates(root)
  const defaultTemplate = templates[0] ?? 'react-ts'

  prompts.intro(colors.bold(colors.magenta(' odoro ')))

  const rawName =
    options.name ??
    (options.yes === true
      ? 'odoro-app'
      : ensure(
          await prompts.text({
            message: 'Nom du projet',
            placeholder: 'mon-site',
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

  // Piege courant : le dossier existe deja. Ecraser sans demander detruirait
  // du travail ; refuser sans alternative obligerait a tout recommencer.
  let overwrite = options.overwrite
  const state = inspectTarget(target)
  if (state === 'occupe' && overwrite === undefined) {
    if (options.yes === true) {
      prompts.cancel(
        `Le dossier "${basename(target)}" n'est pas vide. Precisez --overwrite ou --merge.`,
      )
      return 1
    }

    const choice = ensure(
      await prompts.select({
        message: `Le dossier "${basename(target)}" n'est pas vide.`,
        options: [
          { value: 'annuler', label: 'Annuler' },
          { value: 'fusionner', label: 'Fusionner — ecrase les fichiers de meme nom' },
          { value: 'ecraser', label: 'Vider le dossier puis creer le projet' },
        ],
      }),
    )

    if (choice === 'annuler') {
      prompts.cancel('Creation annulee.')
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
    prompts.cancel(
      `Template inconnu : "${template}". Disponibles : ${templates.join(', ')}.`,
    )
    return 1
  }

  const detected = detectPackageManager()
  const manager = (options.pm ??
    (options.yes === true
      ? detected
      : ensure(
          await prompts.select({
            message: 'Gestionnaire de paquets',
            initialValue: detected,
            options: PACKAGE_MANAGERS.map((name) => ({
              value: name,
              label: name,
              hint: name === detected ? 'detecte' : undefined,
            })),
          }),
        ))) as PackageManager

  if (!PACKAGE_MANAGERS.includes(manager)) {
    prompts.cancel(`Gestionnaire inconnu : "${manager}".`)
    return 1
  }

  const withGit =
    options.git ??
    (options.yes === true
      ? true
      : ensure(await prompts.confirm({ message: 'Initialiser un depot git ?' })))

  const withInstall =
    options.install ??
    (options.yes === true
      ? true
      : ensure(
          await prompts.confirm({
            message: `Installer les dependances avec ${manager} ?`,
          }),
        ))

  const spinner = prompts.spinner()
  spinner.start('Creation du projet')

  const scaffoldOptions: Parameters<typeof scaffold>[0] = {
    target,
    template,
    packageName,
    root,
  }
  if (overwrite !== undefined) scaffoldOptions.overwrite = overwrite

  const { files } = await scaffold(scaffoldOptions)
  spinner.stop(`${files.length} fichiers ecrits dans ${colors.cyan(basename(target))}`)

  if (withGit && !existsSync(resolve(target, '.git'))) {
    try {
      execSync('git init -q', { cwd: target, stdio: 'ignore' })
      prompts.log.success('Depot git initialise.')
    } catch {
      prompts.log.warn('git est introuvable : depot non initialise.')
    }
  }

  if (withInstall) {
    const install = prompts.spinner()
    install.start(`Installation avec ${manager}`)
    try {
      execSync(installCommand(manager), { cwd: target, stdio: 'ignore' })
      install.stop('Dependances installees.')
    } catch {
      install.stop('Installation echouee — a relancer a la main.')
    }
  }

  const steps = [
    `cd ${basename(target)}`,
    ...(withInstall ? [] : [installCommand(manager)]),
    runCommand(manager, 'dev'),
  ]

  prompts.note(steps.join('\n'), 'Prochaines etapes')
  prompts.outro(colors.green('Bon developpement.'))

  return 0
}
