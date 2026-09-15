/**
 * Configuration: the environment, validated once, at startup.
 *
 * ## Why all at once
 *
 * A configuration read on demand fails on the hundredth request, on the
 * variable nobody thought of setting, in a rare code path.
 * It is therefore read **entirely** at startup, and the process refuses to
 * start if anything at all is missing.
 *
 * The error report lists **every** faulty variable at once. One
 * message per run would turn going live into a series of
 * restarts, one variable at a time.
 *
 * ## Why no default value in production
 *
 * A silent default value is a decision taken by the code in the
 * place of whoever deploys. `SESSION_SECRET` falling back to a constant,
 * `NODE_ENV` falling back to `development`, `DATABASE_URL` pointing at
 * localhost: each one produces a system that starts, looks healthy, and
 * behaves otherwise than intended.
 *
 * The defaults therefore exist for development, and **there only**. In
 * production, what is not declared fails the startup.
 *
 * ## `process.env` is only read here
 *
 * A read of `process.env` elsewhere escapes the validation, the typing, and
 * the startup report. The ESLint rule `no-restricted-properties`, set
 * on this package, makes it fail everywhere but on the line below — which
 * disables it by name, and stays the only point where the process is read.
 *
 * @module
 */

import { z } from 'zod'

/** Recognised environments. */
export const ENVIRONMENTS = ['development', 'test', 'production'] as const

/** Runtime environment. */
export type Environment = (typeof ENVIRONMENTS)[number]

/**
 * A size in bytes, written the way a human writes it.
 *
 * `2mb` rather than `2097152`: the second form reads badly and is typed
 * even worse, and a mistake by a factor of a thousand goes unnoticed in it.
 */
const byteSize = z
  .string()
  .regex(/^\d+(\.\d+)?\s*(b|kb|mb|gb)$/i, 'size expected, for example "2mb"')
  .transform((value) => {
    const match = /^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/i.exec(value)
    const amount = Number(match?.[1] ?? 0)
    const unit = (match?.[2] ?? 'b').toLowerCase()
    const factor = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 }[unit] ?? 1
    return Math.round(amount * factor)
  })

/** A duration in milliseconds, written the way a human writes it. */
const duration = z
  .string()
  .regex(/^\d+(\.\d+)?\s*(ms|s|m|h|d)$/i, 'duration expected, for example "30s"')
  .transform((value) => {
    const match = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)$/i.exec(value)
    const amount = Number(match?.[1] ?? 0)
    const unit = (match?.[2] ?? 'ms').toLowerCase()
    const factor = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 1
    return Math.round(amount * factor)
  })

/** A comma-separated list, empty when absent. */
const list = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
  )
  .pipe(z.array(z.string()))

/** A boolean spelled out in full. */
const flag = z
  .enum(['true', 'false', '1', '0'])
  .transform((value) => value === 'true' || value === '1')

/**
 * The schema of the kernel.
 *
 * A module that needs variables of its own declares them in its own
 * schema, merged here by {@link defineConfig}. The kernel does not know
 * `SMTP_HOST`; the `mail` module does.
 */
const kernelSchema = z.object({
  NODE_ENV: z.enum(ENVIRONMENTS).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3001),

  /**
   * The URL of the database. PostgreSQL, and nothing else.
   *
   * A single variable rather than five: a host, a port, a database name and
   * separate credentials drift apart, and the error that results from it
   * is a refused connection with no hint of which of the five is
   * at fault.
   *
   * It may be **empty outside production**. A freshly scaffolded project
   * has none yet: the server starts anyway, and `/ready` answers 503
   * saying what is missing. Refusing to start would make the first
   * impression a failure, while the interface itself is already served.
   *
   * In production, it is required — see {@link productionProblems}.
   */
  DATABASE_URL: z.string().default(''),

  /** Read replica, optional. Routing to it stays explicit. */
  DATABASE_REPLICA_URL: z.string().min(1).optional(),

  /** Pool size. The default depends on the environment, see further down. */
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(200).optional(),

  /**
   * Disables TLS on a remote connection.
   *
   * Explicit, never implicit: the encryption of a remote connection must
   * not be able to vanish by omission.
   */
  DATABASE_TLS_DISABLED: flag.default(false),

  /** Queues and cache. Absent, the in-memory fallback applies. */
  REDIS_URL: z.string().min(1).optional(),

  /**
   * Session secret, at least thirty-two bytes.
   *
   * The minimum is not decorative: a short secret is found by brute
   * force, and the day it happens, every session issued since the
   * first day is forgeable.
   */
  SESSION_SECRET: z.string().min(32, 'at least 32 characters'),

  /** Allowed origins. Never `*` with credentials — see phase 9. */
  ALLOWED_ORIGINS: list.default([]),

  /** Public URL of the server, for the links of the emails. */
  APP_URL: z.string().url(),

  /** Cap on the size of the request bodies. */
  // `prefault` and not `default`: the fallback value is a readable string,
  // which must go through the conversion. `default` applies to the output, and
  // would give here a number where one writes "1mb".
  BODY_LIMIT: byteSize.prefault('1mb'),

  /** Delay beyond which the graceful shutdown stops waiting for the requests. */
  SHUTDOWN_TIMEOUT: duration.prefault('15s'),

  /** Logging level. */
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
})

/** The configuration of the kernel. */
export type KernelConfig = z.infer<typeof kernelSchema>

/**
 * Defaults specific to development, refused in production.
 *
 * `DATABASE_URL` is not among them, and cannot be: there is no local
 * database. What would replace it would be a remote URL, that is to say a
 * secret — and a secret has no default value.
 */
const DEVELOPMENT_DEFAULTS: Readonly<Record<string, string>> = {
  SESSION_SECRET: 'development-only-never-use-anywhere-else',
  APP_URL: 'http://localhost:3001',
}

/**
 * What is tolerable in development and refused in production.
 *
 * These rules cannot live in the schema: they depend on another
 * variable of the same object, and a schema that references itself makes the
 * error report unreadable.
 */
function productionProblems(config: KernelConfig): readonly ConfigProblem[] {
  if (config.NODE_ENV !== 'production') return []

  const problems: ConfigProblem[] = []

  if (config.DATABASE_URL.trim().length === 0) {
    problems.push({
      variable: 'DATABASE_URL',
      reason: 'required in production: postgres://user:password@host:5432/database',
    })
  } else if (!/^postgres(ql)?:\/\//.test(config.DATABASE_URL)) {
    // The shape only: no connection is opened here. A typo
    // in the password is discovered on the first access, not at
    // startup — that is the price of a startup that does not depend on the network.
    problems.push({
      variable: 'DATABASE_URL',
      reason: 'must start with postgres:// or postgresql://',
    })
  }

  return problems
}

/** A configuration problem, as it is reported. */
export interface ConfigProblem {
  /** Name of the variable. */
  readonly variable: string
  /** What is wrong. */
  readonly reason: string
}

/** Thrown when the configuration is incomplete or invalid. */
export class ConfigError extends Error {
  constructor(readonly problems: readonly ConfigProblem[]) {
    super(
      [
        `Invalid configuration — ${String(problems.length)} problem(s):`,
        '',
        ...problems.map(({ variable, reason }) => `  ${variable}  ${reason}`),
        '',
        'See .env.example for the complete and commented list.',
      ].join('\n'),
    )
    this.name = 'ConfigError'
  }
}

/**
 * Reads and validates the environment.
 *
 * @param extra Schema of a module, merged into the schema of the kernel.
 * @param source Environment to read. Injected by the tests; in production,
 *   it is `process.env` and nothing else.
 *
 * @throws {ConfigError} If a variable is missing or invalid. The message
 *   lists every problem, not only the first one.
 *
 * @example
 * const config = loadConfig()
 * config.PORT      // number
 * config.BODY_LIMIT // number, in bytes, from "1mb"
 */
export function loadConfig<Extra extends z.ZodRawShape = Record<never, never>>(
  extra?: z.ZodObject<Extra>,
  // eslint-disable-next-line no-restricted-properties -- the only reading point
  source: NodeJS.ProcessEnv = process.env,
): KernelConfig & z.infer<z.ZodObject<Extra>> {
  const schema = extra === undefined ? kernelSchema : kernelSchema.extend(extra.shape)

  const environment = source['NODE_ENV'] ?? 'development'
  const applied: Record<string, string | undefined> = { ...source }

  // The development defaults only fill what is absent, and
  // only outside production: in production, the omission must fail.
  if (environment !== 'production') {
    for (const [key, value] of Object.entries(DEVELOPMENT_DEFAULTS)) {
      applied[key] ??= value
    }
  }

  const result = schema.safeParse(applied)

  if (result.success) {
    const extra = productionProblems(result.data as KernelConfig)
    if (extra.length === 0) return Object.freeze(result.data) as never
    throw new ConfigError(extra)
  }

  // Every problem at once: one variable per run would turn
  // going live into a series of restarts.
  const problems = result.error.issues.map((issue) => ({
    variable: issue.path.map(String).join('.') || '(root)',
    reason: issue.message,
  }))

  throw new ConfigError(problems)
}

/**
 * Pool size retained, for want of an explicit setting.
 *
 * The defaults differ because the constraints differ: in
 * development, a single instance and a local database; in production,
 * several instances sharing the limit of the server, and a pool too
 * wide saturates before the load arrives.
 */
export function defaultPoolSize(environment: Environment): number {
  return { development: 5, test: 1, production: 10 }[environment]
}
