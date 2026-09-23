/**
 * Provisioning a database on the Odoro platform, by asking what is missing.
 *
 * ## Why this lives apart from the commands
 *
 * Two callers need the same four answers — a token, an environment, a region,
 * a name — and they reach them from opposite directions. `odoro db:create` is
 * run inside a project by someone who knows the platform and passes flags.
 * `odoro create` is run by someone who has just typed the name of their
 * project and has none of those four things.
 *
 * Written once inside the command, the flow would have been a series of
 * `--env is required` refusals in the installer. Written once inside the
 * installer, the command would have kept its refusals. It is therefore here,
 * and each caller supplies what it already knows.
 *
 * ## Why every answer is asked rather than defaulted
 *
 * A database is not a preference one corrects later: it holds data, it sits in
 * a jurisdiction, and it is billed. The region especially — four are offered,
 * and which one is chosen is a statement about where personal data lives, not
 * a matter of taste. The only value taken without asking is the project's own
 * directory name, which is visible on screen at that moment.
 *
 * ## What never passes through here
 *
 * The provider's own credentials. The platform hands out a connection string
 * scoped to one database; what opens an account at the provider stays in the
 * control plane. And the connection string itself is written into `.env` by
 * the caller rather than printed — a terminal keeps its history.
 *
 * @module
 */

import { randomUUID } from 'node:crypto'

import type * as clack from '@clack/prompts'

import type { CloudClient } from './sdk.js'
import { findToken, storeToken } from '../config/user.js'

/** Where the platform answers, unless told otherwise. */
export const DEFAULT_API_URL = 'https://db.odoro.dev'

/**
 * An idempotency key, unique per attempt.
 *
 * The contract asks for at least sixteen characters. A UUID gives
 * thirty-six, and two attempts never share one — which is the point: a
 * retried creation must not provision twice.
 */
export function idempotencyKey(): string {
  return randomUUID()
}

/** What the prompts module gives us, without importing it eagerly. */
type Prompts = typeof clack

/** A cancelled prompt: the caller stops, it does not guess. */
export const CANCELLED = Symbol('cancelled')

/** Either an answer, or the fact that the person gave up. */
export type Answer<T> = T | typeof CANCELLED

/** True when a prompt was cancelled. */
export function cancelled<T>(value: Answer<T>): value is typeof CANCELLED {
  return value === CANCELLED
}

/**
 * Finds the platform token, or asks for it and stores it.
 *
 * ## Why it is asked and not fetched
 *
 * The first token cannot be issued by the API: issuing one requires being
 * authenticated already. It is therefore read from the dashboard and pasted
 * here — the same gesture as `odoro db:login`, which is why this function is
 * what that command should end up calling too.
 *
 * It is stored in the user configuration, never in the project: a token in a
 * repository is a token in every clone of it.
 */
export async function ensureToken(
  prompts: Prompts,
  apiUrl: string,
): Promise<Answer<string>> {
  const known = await findToken(apiUrl)
  if (known !== undefined) return known

  prompts.log.info(`No token yet for ${apiUrl}. Create one at ${apiUrl}/tokens.`)

  const value = await prompts.password({
    message: 'Platform token',
    validate: (input) =>
      input.startsWith('odk_') ? undefined : 'A token starts with odk_live_ or odk_test_',
  })
  if (prompts.isCancel(value)) return CANCELLED

  const report = await storeToken(apiUrl, value)
  prompts.log.success(`Token recorded in ${report.path}`)
  return value
}

/** An environment, named by the project that holds it. */
export interface EnvironmentChoice {
  readonly id: string
  /** `project / environment`, as it is shown. */
  readonly label: string
}

/**
 * Asks which environment receives the database.
 *
 * Environments live inside projects, so the list is flattened: a person picks
 * `boutique / production`, not a project and then an environment. Two prompts
 * for one decision is one prompt too many.
 *
 * When the account holds exactly one, it is taken and announced rather than
 * offered — a menu with a single entry asks a question whose answer is
 * already known.
 */
export async function chooseEnvironment(
  prompts: Prompts,
  client: CloudClient,
): Promise<Answer<EnvironmentChoice | undefined>> {
  const { projects } = await client.projects.list()

  const all: EnvironmentChoice[] = projects.flatMap((project) =>
    project.environments.map((environment) => ({
      id: environment.id,
      label: `${project.name} / ${environment.name}`,
    })),
  )

  if (all.length === 0) {
    prompts.log.warn(
      `No environment on this account. Create a project at ${DEFAULT_API_URL}, then run \`odoro db:create\`.`,
    )
    return undefined
  }

  const only = all[0]
  if (all.length === 1 && only !== undefined) {
    prompts.log.info(`Environment: ${only.label}`)
    return only
  }

  const picked = await prompts.select<string>({
    message: 'Environment',
    options: all.map((entry) => ({ value: entry.id, label: entry.label })),
  })
  if (prompts.isCancel(picked)) return CANCELLED

  return all.find((entry) => entry.id === picked)
}

/**
 * Asks where the database lives.
 *
 * The list comes from the platform rather than from a constant here: a region
 * opened next month must appear without this file being republished. The
 * region was hard-coded to `eu-central-1` before — defensible for a single
 * provider, wrong for a question that decides which jurisdiction holds the
 * data.
 */
export async function chooseRegion(
  prompts: Prompts,
  client: CloudClient,
): Promise<Answer<string | undefined>> {
  const { regions } = await client.regions.list()
  if (regions.length === 0) return undefined

  const preferred = regions.includes('eu-central-1') ? 'eu-central-1' : regions[0]

  const picked = await prompts.select<string>({
    message: 'Region',
    initialValue: preferred,
    options: regions.map((region) => ({ value: region, label: region })),
  })
  if (prompts.isCancel(picked)) return CANCELLED

  return picked
}

/** What a provisioning needs to know, once the questions are answered. */
export interface ProvisionInput {
  readonly client: CloudClient
  readonly environmentId: string
  readonly region?: string
  /** Shown in the dashboard; the project directory name when nothing better. */
  readonly name?: string
}

/** What a provisioning gives back. */
export type ProvisionResult =
  | { readonly ok: true; readonly databaseId: string; readonly connectionString: string }
  | { readonly ok: false; readonly reason: string }

/**
 * Provisions, waits, and issues a credential.
 *
 * ## Why the wait is explicit
 *
 * Creation takes dozens of seconds at the provider. Handing back control
 * before the end would leave a project whose `.env` has no URL and whose owner
 * believes it does.
 *
 * Interrupting gives up the *wait*, not the work: the resource keeps being
 * created, and `odoro db:status` finds it afterwards. That is why the signal
 * is wired to `SIGINT` rather than the process simply dying.
 */
export async function provision(input: ProvisionInput): Promise<ProvisionResult> {
  const abort = new AbortController()
  const onInterrupt = (): void => abort.abort()
  process.once('SIGINT', onInterrupt)

  try {
    const finished = await input.client.databases.createAndWait(
      {
        idempotencyKey: idempotencyKey(),
        environmentId: input.environmentId,
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.region === undefined ? {} : { region: input.region }),
      },
      { signal: abort.signal },
    )

    if (finished.state !== 'succeeded') {
      return {
        ok: false,
        reason:
          finished.error ??
          `The operation ended in state "${finished.state}". \`odoro db:status\` will show where it stands.`,
      }
    }

    const databaseId = finished.subject
    if (databaseId === undefined) {
      return {
        ok: false,
        reason:
          'The operation succeeded without naming the database it created. `odoro db:status` will show it.',
      }
    }

    // The connection string only exists when a credential is issued, and only
    // once: the caller writes it, nobody prints it.
    const { connectionString } = await input.client.credentials.rotate({ databaseId })
    return { ok: true, databaseId, connectionString }
  } finally {
    process.removeListener('SIGINT', onInterrupt)
  }
}
