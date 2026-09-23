/**
 * Loading of the platform SDK.
 *
 * ## Why it is a dependency now, when it was not
 *
 * It was kept out on the grounds of weight: this binary is downloaded on every
 * `npm create odoro`, and most projects bring their own database. The argument
 * was right in the abstract and wrong in the measurement — the client and its
 * contracts weigh 428 Ko, next to the compiler and the transformer this CLI
 * already carries. Under three per cent, for the feature that decides whether
 * `odoro create` can hand back a project with a working database.
 *
 * It also had a cost nobody had counted: during `npm create odoro` there is no
 * project yet, so there is nowhere for a separately installed package to be
 * resolved from. Kept out, the platform path could never run at the one moment
 * it is most wanted.
 *
 * ## Why the load stays dynamic all the same
 *
 * Because it costs nothing and it keeps one property: a partial install, a
 * pruned tree, a registry that refuses — none of these should take down
 * `odoro dev`. A project that uses its own PostgreSQL never needs this module,
 * and must never be stopped by it.
 *
 * ## What a failed load must produce
 *
 * Not a runtime trace about a module that cannot be found. A sentence saying
 * what state the install is in and what still works without it.
 *
 * @module
 */

/** The package that carries the database commands. */
export const SDK_PACKAGE = '@odoro-cli/cloud-sdk'

/** What a load returns. */
export type SdkLoad =
  | { readonly ok: true; readonly sdk: CloudSdk }
  | { readonly ok: false; readonly reason: string }

/**
 * The surface of the SDK this CLI uses.
 *
 * Described here rather than imported: importing the types would make the
 * package a build dependency, and this repository has none — the communication
 * between the two repositories goes through the published package, in a single
 * direction.
 */
/** A live operation, as the platform reports it. */
export interface OperationSnapshot {
  readonly state: 'pending' | 'running' | 'succeeded' | 'failed'
  /** The resource the operation acted on — the database id, for a creation. */
  readonly subject?: string
  readonly error?: string
}

/**
 * The part of the client this CLI uses.
 *
 * The published package exposes a hundred and ten routes across thirty-four
 * groups. Six of them are named here — what it takes to answer the installer's
 * four questions and write one `DATABASE_URL`. Declaring the rest would tie
 * this file to a surface it never calls, and each addition to the platform
 * would then be a change here.
 */
export interface CloudClient {
  readonly projects: {
    readonly list: () => Promise<{
      readonly projects: readonly {
        readonly id: string
        readonly name: string
        readonly environments: readonly { readonly id: string; readonly name: string }[]
      }[]
    }>
  }
  readonly regions: {
    readonly list: () => Promise<{ readonly regions: readonly string[] }>
  }
  readonly databases: {
    readonly list: (input: { environmentId?: string }) => Promise<{
      readonly databases: readonly { id: string; state: string; region: string }[]
    }>
    readonly createAndWait: (
      input: {
        idempotencyKey: string
        environmentId: string
        name?: string
        region?: string
      },
      options?: { signal?: AbortSignal },
    ) => Promise<OperationSnapshot>
    readonly branchAndWait: (
      input: {
        idempotencyKey: string
        parentEnvironmentId: string
        name: string
        anonymization: readonly { table: string; column: string; strategy: string }[]
      },
      options?: { signal?: AbortSignal },
    ) => Promise<OperationSnapshot>
  }
  readonly credentials: {
    readonly rotate: (input: { databaseId: string }) => Promise<{
      credentialId: string
      connectionString: string
    }>
  }
}

export interface CloudSdk {
  createClient: (config: { baseUrl: string; token: string }) => CloudClient
  isApiError: (value: unknown, kind?: string) => boolean
}

/**
 * Loads the SDK, or explains what is missing.
 *
 * @example
 * const load = await loadSdk()
 * if (!load.ok) {
 *   log.error(load.reason)
 *   return 1
 * }
 */
export async function loadSdk(): Promise<SdkLoad> {
  try {
    // The specifier goes through a variable: written in plain sight, a bundler
    // would try to resolve it at build time and would fail on a package that is
    // deliberately absent.
    const specifier = SDK_PACKAGE
    const sdk = (await import(specifier)) as CloudSdk
    return { ok: true, sdk }
  } catch {
    return {
      ok: false,
      reason: [
        `${SDK_PACKAGE} could not be loaded.`,
        '',
        'It ships with odoro, so this is usually a partial install:',
        '',
        '  npm install',
        '',
        'Until it loads, a project can still bring its own PostgreSQL URL.',
      ].join('\n'),
    }
  }
}
