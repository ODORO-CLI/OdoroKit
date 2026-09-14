/**
 * Commande `odoro create` : creation d'un projet.
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

/**
 * Combien de lignes de sortie garder pour expliquer un echec.
 *
 * Assez pour que la cause y figure — un gestionnaire de paquets la dit dans ses
 * dernieres lignes — et pas au point de noyer le terminal.
 */
const DERNIERES_LIGNES = 8

/** Au-dela, une ligne de sortie est coupee pour ne pas faire defiler la barre. */
const LARGEUR_LIGNE = 64

/** Descriptions affichees dans le selecteur de template. */
const TEMPLATE_LABELS: Readonly<Record<string, string>> = {
  'react-ts': 'Single-page app — React, TypeScript, Odoro router and motion',
  'react-ts-server':
    'Client and server — the same app, plus a modular @odoro-cli/server base and a Dockerfile',
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
      message: 'PostgreSQL URL',
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
      message: 'What goes in the project?',
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

/**
 * Installe les dependances en montrant ou en est le gestionnaire.
 *
 * ## Pourquoi ce n'est plus un \`execSync\` muet
 *
 * L'installation est de loin l'etape la plus longue — dix a soixante
 * secondes selon le reseau. Une ligne figee pendant ce temps ne dit pas si
 * quelque chose avance, si le reseau est tombe, ou si le terminal attend une
 * reponse. On finit par appuyer sur une touche pour voir.
 *
 * Le processus est donc lance en flux : chaque ligne qu'il ecrit remonte, et
 * la derniere est affichee a cote du minuteur. On voit le gestionnaire
 * resoudre, telecharger, lier — et l'on sait, a tout instant, que ce n'est
 * pas bloque.
 *
 * ## En cas d'echec, on montre la fin
 *
 * \`stdio: 'ignore'\` jetait la sortie : un echec laissait un « relancez a la
 * main » sans dire pourquoi. Les dernieres lignes sont gardees, et
 * reaffichees — c'est la ou le gestionnaire explique ce qui l'a arrete.
 *
 * @returns \`true\` si l'installation a abouti.
 */
async function installerDependances(
  target: string,
  manager: PackageManager,
): Promise<boolean> {
  const [commande, ...args] = installCommand(manager).split(' ')
  if (commande === undefined) return false

  const barre = prompts.spinner({ indicator: 'timer' })
  barre.start(`Installing dependencies with ${manager}`)

  // Les dernieres lignes, et elles seules : une installation bavarde en ecrit
  // des milliers, et n'en garder que la fin suffit a expliquer un echec.
  const fin: string[] = []
  const garder = (bloc: string): void => {
    for (const ligne of bloc.split('\n')) {
      const propre = ligne.trim()
      // Les lignes sans contenu sont sautees : un gestionnaire met en forme
      // ses avertissements sur plusieurs lignes, et afficher une accolade
      // seule a cote du minuteur ne dit rien de ce qui avance.
      if (propre === '' || !/[a-z0-9]/i.test(propre)) continue
      fin.push(propre)
      if (fin.length > DERNIERES_LIGNES) fin.shift()
      // Tronquee : une ligne plus large que le terminal le ferait defiler, et
      // la barre sauterait a chaque mise a jour.
      barre.message(`${manager} · ${propre.slice(0, LARGEUR_LIGNE)}`)
    }
  }

  const code = await new Promise<number>((resolve_) => {
    // \`shell\` sur Windows : \`npm\` y est un script, et \`spawn\` sans shell ne
    // sait pas l'executer.
    const processus = spawn(commande, args, {
      cwd: target,
      shell: process.platform === 'win32',
    })
    processus.stdout?.setEncoding('utf8').on('data', garder)
    processus.stderr?.setEncoding('utf8').on('data', garder)
    processus.on('error', () => {
      resolve_(-1)
    })
    processus.on('close', (sortie) => {
      resolve_(sortie ?? -1)
    })
  })

  if (code === 0) {
    barre.stop(`Dependencies installed with ${manager}`)
    return true
  }

  // Le second argument marque la ligne comme un echec : elle sort en rouge,
  // au lieu de ressembler a une etape reussie de plus.
  barre.stop(`${manager} install failed`, 1)
  for (const ligne of fin) prompts.log.error(colors.dim(ligne))
  return false
}
/**
 * La version de la CLI qui tourne, lue dans son propre manifeste.
 *
 * Figee dans une constante, elle serait juste le jour ou on l'ecrit et fausse a
 * la publication suivante.
 */
function versionCli(): string {
  try {
    const manifeste = join(dirname(templatesRoot()), 'package.json')
    const { version } = JSON.parse(readFileSync(manifeste, 'utf8')) as { version: string }
    return version
  } catch {
    // Une creation doit aboutir meme si le manifeste est illisible : on
    // n'affiche alors pas de numero plutot que d'en inventer un.
    return '?'
  }
}

/** Interrompt proprement si l'utilisateur annule une question. */
function ensure<T>(value: T | symbol): T {
  if (prompts.isCancel(value)) {
    prompts.cancel('Cancelled.')
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

  // Bleu et non magenta : c'est la teinte de la marque, celle du signe et du
  // site. Le numero de version est affiche parce que c'est la premiere chose
  // qu'on demande quand quelque chose se passe mal.
  prompts.intro(
    `${colors.bgBlue(colors.black(' ODORO '))} ${colors.dim(`v${versionCli()}`)}`,
  )

  const rawName =
    options.name ??
    (options.yes === true
      ? 'odoro-app'
      : ensure(
          await prompts.text({
            message: 'Project name',
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
        `Folder "${basename(target)}" is not empty. Pass --overwrite or --merge.`,
      )
      return 1
    }

    const choice = ensure(
      await prompts.select({
        message: `Folder "${basename(target)}" is not empty.`,
        options: [
          { value: 'annuler', label: 'Cancel' },
          { value: 'fusionner', label: 'Merge — overwrites files of the same name' },
          { value: 'ecraser', label: 'Empty the folder, then create the project' },
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
      `Unknown template: "${template}". Available: ${templates.join(', ')}.`,
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

  // La base ne se demande que pour un template qui en a un besoin.
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
  spinner.stop(`${String(files.length)} files written to ${colors.cyan(basename(target))}`)

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

    const risque = await assertEnvIgnored(target)
    if (risque !== undefined) prompts.log.warn(risque)
  }

  if (database !== undefined) prompts.log.info(database.note)

  // Le registre ne s'installe pas : ses entrees sont copiees dans le projet.
  // Ce qu'il faut donc preparer, c'est la destination. `odoro.json` porte le
  // dossier d'arrivee, le prefixe d'import deduit du tsconfig, et l'adresse du
  // registre ; sans lui, la premiere commande `odoro add` s'arreterait pour
  // poser trois questions dont on connait deja les reponses.
  //
  // `yes` est passe : la creation vient de faire ses demandes, et en
  // enchainer d'autres ferait payer deux fois le meme choix.
  if (modules.includes('registre')) {
    const { initCommand } = await import('../add/commands.js')
    const code = await initCommand({ root: target, yes: true })
    if (code !== 0) {
      // Un registre non configure ne compromet pas le projet : tout le reste
      // est ecrit, et la commande se relance a la main.
      prompts.log.warn(
        'The registry could not be configured. Run `odoro init` in the project.',
      )
    }
  }

  const installe = withInstall ? await installerDependances(target, manager) : false

  const steps = [
    `cd ${basename(target)}`,
    // Si l'installation a echoue, la commande revient dans les etapes : le
    // projet est ecrit, il ne lui manque que ses dependances.
    ...(installe ? [] : [installCommand(manager)]),
    // `odoro.json` vient d'etre ecrit : ce qui reste a montrer, c'est la
    // commande qui s'en sert.
    ...(modules.includes('registre') ? ['odoro add text/count-up'] : []),
    runCommand(manager, 'dev'),
  ]

  prompts.note(steps.join('\n'), 'Next steps')
  prompts.outro(colors.green('Happy building.'))

  return 0
}
