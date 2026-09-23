/**
 * The `db:*` commands.
 *
 * ## What these commands write, and where
 *
 * The `.env` of the project receives `DATABASE_URL`, and nothing else. The
 * platform token lives in the user configuration: stored in the project, it
 * would end up versioned, and a pushed secret is to be rotated rather than
 * removed from a history.
 *
 * ## The connection string is shown only once
 *
 * The platform only returns it at creation time. These commands write it
 * straight into the `.env` rather than print it: a terminal keeps its history,
 * and a secret pasted into a team conversation stays there.
 *
 * What is shown is what was done, not what was received.
 *
 * @module
 */

import { randomBytes } from 'node:crypto'

import * as log from '../shared/logger.js'
import { colors } from '../shared/logger.js'
import { assertEnvIgnored, writeDatabaseUrl } from '../commands/database.js'
import { findToken, storeToken } from '../config/user.js'
import { cancelled, chooseEnvironment, chooseRegion } from './provision.js'
import { loadSdk, SDK_PACKAGE } from './sdk.js'

/**
 * Root of the API, by default.
 *
 * `db.odoro.dev` serves the interface **and** the API: both share the origin,
 * which spares the browser a preflight request on every call.
 *
 * An earlier version named `api.odoro.dev`, which does not exist. The command
 * therefore failed for everyone, on a domain nobody had ever deployed.
 */
const DEFAULT_API_URL = 'https://db.odoro.dev'

/** Options common to the database commands. */
export interface DbOptions {
  /** Project root, where the `.env` is written. */
  readonly root: string
  /** Root of the API. */
  readonly apiUrl?: string
  /** Target environment. */
  readonly env?: string
  /** Region, when a script already knows which one. */
  readonly region?: string
  /** Asks no question. */
  readonly yes?: boolean
}

/** An idempotency key for a request. */
function idempotencyKey(): string {
  return randomBytes(24).toString('hex')
}

/** Prepares a client, or explains what is missing. */
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
      `No token for ${apiUrl}.\n` +
        `\n` +
        `  odoro db:login\n` +
        `\n` +
        `Or provide it through the ODORO_TOKEN variable, which is what a\n` +
        `continuous integration does.`,
    )
    return undefined
  }

  return { client: load.sdk.createClient({ baseUrl: apiUrl, token }), sdk: load.sdk }
}

/**
 * Records a platform token.
 *
 * The token is read from standard input rather than passed as an argument: a
 * command line argument ends up in the terminal history, and in the process
 * list for the duration of its run.
 */
export async function loginCommand(options: DbOptions): Promise<number> {
  const apiUrl = options.apiUrl ?? DEFAULT_API_URL

  const prompts = await import('@clack/prompts')
  const value = await prompts.password({
    message: `Token for ${apiUrl}`,
    validate: (input) =>
      input.startsWith('odk_') ? undefined : 'A token starts with odk_live_ or odk_test_',
  })

  if (prompts.isCancel(value)) {
    log.info('Cancelled.')
    return 0
  }

  const report = await storeToken(apiUrl, value)
  log.success(`Token recorded in ${colors.dim(report.path)}`)

  if (!report.restricted) {
    // Say it rather than let one believe in a protection that does not exist.
    log.warn(
      'The restrictive file permissions could not be set on this system: ' +
        'check that this directory is neither shared nor synchronised.',
    )
  }

  return 0
}

/** Lists the databases of the project. */
export async function statusCommand(options: DbOptions): Promise<number> {
  const connection = await connect(options)
  if (connection === undefined) return 1

  const { databases } = await connection.client.databases.list(
    options.env === undefined ? {} : { environmentId: options.env },
  )

  if (databases.length === 0) {
    log.info('No database. `odoro db:create` provisions one.')
    return 0
  }

  for (const database of databases) {
    const state =
      database.state === 'ready'
        ? colors.green(database.state)
        : database.state === 'failed' || database.state === 'quarantined'
          ? colors.red(database.state)
          : colors.dim(database.state)

    console.log(`  ${database.id}  ${state}  ${colors.dim(database.region)}`)
  }

  return 0
}

/**
 * Provisions a database and writes its URL into the `.env`.
 *
 * The wait is explicit: the creation takes dozens of seconds at the provider,
 * and a command that handed back control before the end would leave a `.env`
 * without a URL.
 */
export async function createCommand(options: DbOptions): Promise<number> {
  const connection = await connect(options)
  if (connection === undefined) return 1

  const prompts = await import('@clack/prompts')

  // `--env` names the environment for a script; without it the command asks,
  // rather than refusing. Refusing taught the identifier before the menu that
  // lists it — the wrong way round for someone running this for the first time.
  let environmentId = options.env
  if (environmentId === undefined) {
    const chosen = await chooseEnvironment(prompts, connection.client)
    if (cancelled(chosen) || chosen === undefined) return 1
    environmentId = chosen.id
  }

  // The region was written here in full. It decides which jurisdiction holds
  // the data, so it is asked — unless a script already said which one.
  let region = options.region
  if (region === undefined) {
    const chosen = await chooseRegion(prompts, connection.client)
    if (cancelled(chosen)) return 1
    region = chosen
  }

  const spinner = prompts.spinner()
  spinner.start(`Provisioning in ${region ?? 'the default region'}`)

  // The signal allows giving up the wait without giving up the work: the
  // resource keeps being created, and `odoro db:status` will find it.
  const abort = new AbortController()
  const onInterrupt = (): void => abort.abort()
  process.once('SIGINT', onInterrupt)

  try {
    const finished = await connection.client.databases.createAndWait(
      {
        idempotencyKey: idempotencyKey(),
        environmentId,
        ...(region === undefined ? {} : { region }),
      },
      { signal: abort.signal },
    )

    spinner.stop('Database provisioned')

    const databaseId = finished.subject
    if (databaseId === undefined) {
      log.warn(
        'The operation succeeded without naming the created database. `odoro db:status` will show it.',
      )
      return 0
    }

    // The connection string is only returned when a credential is issued, and
    // only once: it is written, never printed.
    const { connectionString } = await connection.client.credentials.rotate({
      databaseId,
    })
    await writeDatabaseUrl(options.root, connectionString)

    log.success('DATABASE_URL written to .env')

    const risk = await assertEnvIgnored(options.root)
    if (risk !== undefined) log.warn(risk)

    return 0
  } catch (cause) {
    spinner.stop('Provisioning interrupted')

    if (abort.signal.aborted) {
      // The work carries on at the provider: say so, otherwise one starts again
      // and pays for two databases.
      log.info(
        'Wait abandoned. The provisioning carries on: `odoro db:status` will ' +
          'show its outcome.',
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
 * Creates a per-branch preview.
 *
 * The anonymisation rules are demanded by the platform, not by this command: a
 * branch carries production data, and the refusal comes from where it cannot be
 * worked around.
 */
export async function branchCommand(
  options: DbOptions & { readonly from?: string; readonly name?: string },
): Promise<number> {
  const connection = await connect(options)
  if (connection === undefined) return 1

  if (options.from === undefined || options.name === undefined) {
    log.error('Usage: `odoro db:branch --from production --name preview-42`')
    return 1
  }

  const prompts = await import('@clack/prompts')
  const spinner = prompts.spinner()
  spinner.start(`Branching from ${options.from}`)

  try {
    const finished = await connection.client.databases.branchAndWait({
      idempotencyKey: idempotencyKey(),
      parentEnvironmentId: options.from,
      name: options.name,
      // Without a declared rule, the platform refuses. We do not guess in its
      // place: a rule invented here would anonymise the wrong column, or none.
      anonymization: [],
    })

    spinner.stop('Branch created')
    log.info(`Database: ${finished.subject ?? 'see odoro db:status'}`)
    return 0
  } catch (cause) {
    spinner.stop('Branch refused')
    log.error(describe(cause, connection.sdk))
    return 1
  }
}

/** Turns an SDK error into a readable message. */
function describe(
  cause: unknown,
  sdk: { isApiError: (value: unknown, kind?: string) => boolean },
): string {
  if (sdk.isApiError(cause, 'VALIDATION')) {
    const errors = (
      cause as { options?: { errors?: readonly { field: string; message: string }[] } }
    ).options?.errors
    return [
      'The request was refused:',
      ...(errors ?? []).map(({ field, message }) => `  ${field} — ${message}`),
    ].join('\n')
  }

  if (sdk.isApiError(cause, 'RATE_LIMIT')) {
    return (
      'Too many requests. The routes that provision are deliberately ' +
      'rate limited: every creation costs.'
    )
  }

  if (sdk.isApiError(cause, 'UNAUTHORIZED')) {
    return `Token refused. \`odoro db:login\` records another one.`
  }

  return cause instanceof Error ? cause.message : String(cause)
}

/** What the help shows for these commands. */
export const DB_HELP = [
  '  db:login              Record a platform token',
  '  db:status             List the databases of the project',
  '  db:create             Provision a database and write .env',
  '                        (--env and --region skip the questions)',
  '  db:branch --from <e> --name <n>',
  '                        Create a per-branch preview',
  `                        (requires ${SDK_PACKAGE})`,
].join('\n')
