/**
 * Loading of the platform SDK.
 *
 * ## Why it is not a dependency
 *
 * This binary is downloaded on every `npm create odoro`. Every dependency added
 * to it is paid for by everyone who scaffolds a project, including those who
 * will never use the platform — that is, the majority.
 *
 * `@odoro-cli/cloud-sdk` is therefore imported **dynamically**, and only when a
 * `db:*` command is called. Its absence is not a failure: it is the normal
 * state of a project that uses its own database.
 *
 * ## What the absence must produce
 *
 * Not a runtime trace about a module that cannot be found. A sentence saying
 * which package to install, and why the command needs it. That is the
 * difference between a command one can use and a command that fails on a
 * message nobody connects to a missing install.
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
export interface CloudSdk {
  createClient: (config: { baseUrl: string; token: string }) => {
    databases: {
      list: (input: { environmentId?: string }) => Promise<{
        databases: readonly { id: string; state: string; region: string }[]
      }>
      createAndWait: (
        input: { idempotencyKey: string; environmentId: string; region: string },
        options?: { signal?: AbortSignal },
      ) => Promise<{ subject?: string; result?: unknown }>
      branchAndWait: (
        input: {
          idempotencyKey: string
          parentEnvironmentId: string
          name: string
          anonymization: readonly { table: string; column: string; strategy: string }[]
        },
        options?: { signal?: AbortSignal },
      ) => Promise<{ subject?: string; result?: unknown }>
    }
    credentials: {
      rotate: (input: { databaseId: string }) => Promise<{
        credentialId: string
        connectionString: string
      }>
    }
  }
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
      reason:
        `This command needs ${SDK_PACKAGE}, which is not installed.\n` +
        `\n` +
        `  npm install --save-dev ${SDK_PACKAGE}\n` +
        `\n` +
        `It does not ship with odoro: this binary is downloaded on every\n` +
        `project creation, and most projects do not use the platform.`,
    }
  }
}
