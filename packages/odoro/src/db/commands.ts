/**
 * Les commandes `db:*`.
 *
 * ## Ce que ces commandes ecrivent, et ou
 *
 * Le `.env` du projet recoit `DATABASE_URL`, et rien d'autre. Le jeton de la
 * plateforme, lui, vit dans la configuration de l'utilisateur : range dans le
 * projet, il finirait versionne, et un secret pousse est a faire tourner plutot
 * qu'a retirer d'un historique.
 *
 * ## La chaine n'est affichee qu'une fois
 *
 * La plateforme ne la rend qu'a la creation. Ces commandes l'ecrivent
 * directement dans le `.env` plutot que de l'afficher : un terminal garde son
 * historique, et un secret colle dans une conversation d'equipe y reste.
 *
 * Ce qui est affiche est ce qui a ete fait, pas ce qui a ete recu.
 *
 * @module
 */

import { randomBytes } from 'node:crypto'

import * as log from '../shared/logger.js'
import { colors } from '../shared/logger.js'
import { assertEnvIgnored, writeDatabaseUrl } from '../commands/database.js'
import { findToken, storeToken } from '../config/user.js'
import { loadSdk, SDK_PACKAGE } from './sdk.js'

/** Racine de l'API, par defaut. */
const DEFAULT_API_URL = 'https://api.odoro.dev'

/** Options communes aux commandes de base. */
export interface DbOptions {
  /** Racine du projet, ou ecrire le `.env`. */
  readonly root: string
  /** Racine de l'API. */
  readonly apiUrl?: string
  /** Environnement vise. */
  readonly env?: string
  /** Ne pose aucune question. */
  readonly yes?: boolean
}

/** Une cle d'idempotence pour une demande. */
function idempotencyKey(): string {
  return randomBytes(24).toString('hex')
}

/** Prepare un client, ou explique ce qui manque. */
async function connect(options: DbOptions) {
  const apiUrl = options.apiUrl ?? DEFAULT_API_URL

  const load = await loadSdk()
  if (!load.ok) {
    log.error(load.reason)
    return undefined
  }

  const token = await findToken(apiUrl)
  if (token === undefined) {
    log.error(
      `Aucun jeton pour ${apiUrl}.\n` +
        `\n` +
        `  odoro db:login\n` +
        `\n` +
        `Ou fournissez-le par la variable ODORO_TOKEN, ce que fait une\n` +
        `integration continue.`,
    )
    return undefined
  }

  return { client: load.sdk.createClient({ baseUrl: apiUrl, token }), sdk: load.sdk }
}

/**
 * Enregistre un jeton de plateforme.
 *
 * Le jeton est lu sur l'entree standard plutot que passe en argument : un
 * argument de ligne de commande se retrouve dans l'historique du terminal, et
 * dans la liste des processus le temps de son execution.
 */
export async function loginCommand(options: DbOptions): Promise<number> {
  const apiUrl = options.apiUrl ?? DEFAULT_API_URL

  const prompts = await import('@clack/prompts')
  const value = await prompts.password({
    message: `Jeton pour ${apiUrl}`,
    validate: (input) =>
      input.startsWith('odk_')
        ? undefined
        : 'Un jeton commence par odk_live_ ou odk_test_',
  })

  if (prompts.isCancel(value)) {
    log.info('Annule.')
    return 0
  }

  const report = await storeToken(apiUrl, value)
  log.success(`Jeton enregistre dans ${colors.dim(report.path)}`)

  if (!report.restricted) {
    // Le dire plutot que de laisser croire a une protection qui n'existe pas.
    log.warn(
      'Les droits restrictifs du fichier n ont pas pu etre poses sur ce systeme : ' +
        'verifiez que ce dossier n est pas partage ni synchronise.',
    )
  }

  return 0
}

/** Liste les bases du projet. */
export async function statusCommand(options: DbOptions): Promise<number> {
  const connection = await connect(options)
  if (connection === undefined) return 1

  const { databases } = await connection.client.databases.list(
    options.env === undefined ? {} : { environmentId: options.env },
  )

  if (databases.length === 0) {
    log.info('Aucune base. `odoro db:create` en provisionne une.')
    return 0
  }

  for (const base of databases) {
    const etat =
      base.state === 'ready'
        ? colors.green(base.state)
        : base.state === 'failed' || base.state === 'quarantined'
          ? colors.red(base.state)
          : colors.dim(base.state)

    console.log(`  ${base.id}  ${etat}  ${colors.dim(base.region)}`)
  }

  return 0
}

/**
 * Provisionne une base et ecrit son URL dans le `.env`.
 *
 * L'attente est explicite : la creation prend des dizaines de secondes chez le
 * fournisseur, et une commande qui rendrait la main avant la fin laisserait un
 * `.env` sans URL.
 */
export async function createCommand(options: DbOptions): Promise<number> {
  const connection = await connect(options)
  if (connection === undefined) return 1

  const environmentId = options.env
  if (environmentId === undefined) {
    log.error('Precisez l environnement : `odoro db:create --env production`.')
    return 1
  }

  const prompts = await import('@clack/prompts')
  const spinner = prompts.spinner()
  spinner.start('Provisionnement')

  // Le signal permet d'abandonner l'attente sans abandonner le travail : la
  // ressource continue d'etre creee, et `odoro db:status` la retrouvera.
  const abort = new AbortController()
  const onInterrupt = (): void => abort.abort()
  process.once('SIGINT', onInterrupt)

  try {
    const fini = await connection.client.databases.createAndWait(
      { idempotencyKey: idempotencyKey(), environmentId, region: 'eu-central-1' },
      { signal: abort.signal },
    )

    spinner.stop('Base provisionnee')

    const databaseId = fini.subject
    if (databaseId === undefined) {
      log.warn(
        'L operation a abouti sans nommer la base creee. `odoro db:status` la montrera.',
      )
      return 0
    }

    // La chaine n'est rendue qu'a l'emission d'un identifiant, et une seule
    // fois : elle est ecrite, jamais affichee.
    const { connectionString } = await connection.client.credentials.rotate({
      databaseId,
    })
    await writeDatabaseUrl(options.root, connectionString)

    log.success('DATABASE_URL ecrite dans .env')

    const risque = await assertEnvIgnored(options.root)
    if (risque !== undefined) log.warn(risque)

    return 0
  } catch (cause) {
    spinner.stop('Provisionnement interrompu')

    if (abort.signal.aborted) {
      // Le travail continue chez le fournisseur : le dire, sinon on relance et
      // on paie deux bases.
      log.info(
        'Attente abandonnee. Le provisionnement continue : `odoro db:status` en ' +
          'montrera l aboutissement.',
      )
      return 0
    }

    log.error(describe(cause, connection.sdk))
    return 1
  } finally {
    process.off('SIGINT', onInterrupt)
  }
}

/**
 * Cree une previsualisation par branche.
 *
 * Les regles d'anonymisation sont exigees par la plateforme, pas par cette
 * commande : une branche porte les donnees de production, et le refus vient de
 * la ou il ne peut pas etre contourne.
 */
export async function branchCommand(
  options: DbOptions & { readonly from?: string; readonly name?: string },
): Promise<number> {
  const connection = await connect(options)
  if (connection === undefined) return 1

  if (options.from === undefined || options.name === undefined) {
    log.error('Usage : `odoro db:branch --from production --name preview-42`')
    return 1
  }

  const prompts = await import('@clack/prompts')
  const spinner = prompts.spinner()
  spinner.start(`Branche depuis ${options.from}`)

  try {
    const fini = await connection.client.databases.branchAndWait({
      idempotencyKey: idempotencyKey(),
      parentEnvironmentId: options.from,
      name: options.name,
      // Sans regle declaree, la plateforme refuse. On ne devine pas a sa
      // place : une regle inventee ici anonymiserait la mauvaise colonne, ou
      // aucune.
      anonymization: [],
    })

    spinner.stop('Branche creee')
    log.info(`Base : ${fini.subject ?? 'voir odoro db:status'}`)
    return 0
  } catch (cause) {
    spinner.stop('Branche refusee')
    log.error(describe(cause, connection.sdk))
    return 1
  }
}

/** Traduit une erreur du SDK en message lisible. */
function describe(
  cause: unknown,
  sdk: { isApiError: (v: unknown, k?: string) => boolean },
): string {
  if (sdk.isApiError(cause, 'VALIDATION')) {
    const errors = (
      cause as { options?: { errors?: readonly { field: string; message: string }[] } }
    ).options?.errors
    return [
      'La demande a ete refusee :',
      ...(errors ?? []).map(({ field, message }) => `  ${field} — ${message}`),
    ].join('\n')
  }

  if (sdk.isApiError(cause, 'RATE_LIMIT')) {
    return (
      'Trop de demandes. Les routes qui provisionnent sont volontairement ' +
      'limitees : chaque creation coute.'
    )
  }

  if (sdk.isApiError(cause, 'UNAUTHORIZED')) {
    return `Jeton refuse. \`odoro db:login\` en enregistre un autre.`
  }

  return cause instanceof Error ? cause.message : String(cause)
}

/** Ce que l'aide affiche pour ces commandes. */
export const DB_HELP = [
  '  db:login              Enregistre un jeton de plateforme',
  '  db:status             Liste les bases du projet',
  '  db:create --env <e>   Provisionne une base et ecrit .env',
  '  db:branch --from <e> --name <n>',
  '                        Cree une previsualisation par branche',
  `                        (necessite ${SDK_PACKAGE})`,
].join('\n')
