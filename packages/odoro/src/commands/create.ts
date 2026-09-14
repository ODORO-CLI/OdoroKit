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

import {
  MODULES,
  MODULES_PAR_DEFAUT,
  lireModules,
  resoudre,
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
  /**
   * Modules retenus, sous la forme `libs,router,icons`, sans demander.
   *
   * `aucun` n'en retient aucun : un projet React nu, sans style Odoro.
   */
  modules?: string
  /** Conduite a tenir si le dossier cible n'est pas vide. */
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

/** Descriptions affichees dans le selecteur de template. */
const TEMPLATE_LABELS: Readonly<Record<string, string>> = {
  'react-ts': 'Application monopage — React, TypeScript, routeur et animations Odoro',
  'react-ts-server':
    'Client et serveur — la meme application, plus un socle @odoro-cli/server modulaire et un Dockerfile',
}

/**
 * Demande comment le projet obtient sa base.
 *
 * Trois voies, dont deux fonctionnent aujourd'hui. La troisieme — le
 * provisionnement par la plateforme — attend `@odoro-cli/cloud-sdk` ; elle est
 * proposee et annoncee comme telle plutot que masquee, pour que le chemin
 * existe des maintenant dans la tete de celui qui cree un projet.
 */
async function askDatabase(): Promise<DatabaseOutcome> {
  const choice = ensure(
    await prompts.select<DatabaseChoice>({
      message: 'Base de donnees',
      initialValue: 'url',
      options: [
        {
          value: 'provider',
          label: 'Fournisseur Odoro',
          hint: 'provisionnement automatique — bientot',
        },
        {
          value: 'url',
          label: 'URL PostgreSQL existante',
          hint: 'Neon, Supabase, RDS, la votre',
        },
        { value: 'later', label: 'Configurer plus tard', hint: '.env.example seul' },
      ],
    }),
  )

  if (choice === 'provider') {
    prompts.log.warn(PROVIDER_PENDING)
    return { choice, note: 'Lancez `odoro db:create` des que la plateforme est la.' }
  }

  if (choice === 'later') {
    return {
      choice,
      note: 'Aucune base : le client demarrera, et /api/ready repondra 503 en disant ce qui manque.',
    }
  }

  const url = ensure(
    await prompts.text({
      message: 'URL PostgreSQL',
      placeholder: 'postgres://utilisateur:motdepasse@hote:5432/base?sslmode=require',
      validate: (value) => checkDatabaseUrl(value ?? ''),
    }),
  )

  return {
    choice,
    url: url.trim(),
    // Seule la forme a ete verifiee : le dire, plutot que de laisser croire
    // que la connexion a ete etablie.
    note: 'Forme de l URL verifiee. La connexion sera etablie au premier demarrage.',
  }
}

/**
 * Demande ce que le projet embarque.
 *
 * ## Une liste a cocher, et non une suite de oui/non
 *
 * Les modules ne dependent pas les uns des autres — sauf le routeur, qui vit
 * dans les bibliotheques — et les poser en questions successives ferait cinq
 * ecrans pour un choix qui tient en un. La liste montre en plus, d'un coup
 * d'oeil, ce que le projet **n'aura pas**, ce qu'une suite de questions cache.
 *
 * ## Rien n'est obligatoire
 *
 * On peut tout decocher. Le projet part alors sans feuille de style Odoro et
 * sans routeur, en React nu — c'est un choix legitime pour qui apporte son
 * propre systeme, et il valait mieux le rendre vrai que d'afficher une case
 * verrouillee. `required: false` est donc voulu : la liste vide est une
 * reponse, pas une erreur.
 *
 * @returns Les modules retenus, ou `undefined` si la saisie est refusee.
 */
async function askModules(
  options: CreateOptions,
): Promise<readonly ModuleId[] | undefined> {
  if (options.modules !== undefined) {
    const lu = lireModules(options.modules)
    if (lu.erreur !== undefined) {
      prompts.cancel(lu.erreur)
      return undefined
    }
    return annoncer(resoudre(lu.modules))
  }

  if (options.yes === true) return MODULES_PAR_DEFAUT

  const choisis = ensure(
    await prompts.multiselect<ModuleId>({
      message: 'Que met-on dans le projet ?',
      initialValues: [...MODULES_PAR_DEFAUT],
      required: false,
      options: MODULES.map((m) => ({ value: m.id, label: m.label, hint: m.hint })),
    }),
  )

  return annoncer(resoudre(choisis))
}

/** Dit ce que la resolution a du retirer, puis rend la selection retenue. */
function annoncer(resolution: ReturnType<typeof resoudre>): readonly ModuleId[] {
  for (const mot of resolution.avertissements) prompts.log.warn(mot)
  return resolution.modules
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

  const modules = await askModules(options)
  if (modules === undefined) return 1

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

  // La base ne se demande que pour un template qui en a un besoin.
  const database =
    template === 'react-ts-server' && options.yes !== true
      ? await askDatabase()
      : undefined

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
  scaffoldOptions.modules = modules

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

  if (database?.url !== undefined) {
    await writeDatabaseUrl(target, database.url)
    prompts.log.success('URL de base ecrite dans .env')

    const risque = await assertEnvIgnored(target)
    if (risque !== undefined) prompts.log.warn(risque)
  }

  if (database !== undefined) prompts.log.info(database.note)

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
    // Le registre ne s'installe pas : ses entrees sont copiees dans le projet,
    // une par une. La commande est donc rappelee ici plutot qu'ajoutee aux
    // dependances, ou elle n'aurait rien a faire.
    ...(modules.includes('registre') ? ['odoro init', 'odoro add text/count-up'] : []),
    runCommand(manager, 'dev'),
  ]

  prompts.note(steps.join('\n'), 'Prochaines etapes')
  prompts.outro(colors.green('Bon developpement.'))

  return 0
}
