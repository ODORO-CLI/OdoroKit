/**
 * Structured logging, and redaction.
 *
 * ## The redaction list is written before the first incident
 *
 * A log collects what it is given. Give it a whole request, and
 * it will record the `authorization` header, the session cookie, the
 * password of the body — then ship them to an aggregator, where they will stay
 * indexed and searchable as long as the retention allows.
 *
 * The moment this list is written decides everything: after the first
 * incident, one has to purge a history, rotate every exposed
 * secret, and notify. The list is therefore here, complete, from the first
 * commit.
 *
 * It censors by **path**, which Pino does natively and efficiently. A
 * filtering written by hand is forgotten on the first log added elsewhere.
 *
 * ## The correlation identifier
 *
 * A request receives an identifier, sent back in a response header, present
 * in every log line it produces, and quoted in the error
 * document it gives. That is what makes it possible to go from a screenshot
 * of a user to the exact trace, without guessing anything.
 *
 * It is propagated by `AsyncLocalStorage` rather than passed as a parameter: otherwise
 * every function of the call path would have to carry it, including those that do
 * not log.
 *
 * @module
 */

import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'

import type { NextFunction, Request, Response } from 'express'
import { pino, type Logger as PinoLogger } from 'pino'

import { CORRELATION_HEADER } from './http/errors.js'

/**
 * Paths censored in every log line.
 *
 * Each one has a reason to be there, and none is there out of excess of caution:
 *
 * - **authorization headers and cookies** — a logged session token
 *   is a token usable by whoever reads the logs;
 * - **passwords, including the old one and the confirmation** — the change
 *   form carries three, and only two are obvious;
 * - **reset and verification tokens** — single use, therefore
 *   usable by the first one who reads them in a log;
 * - **secrets and API keys** — ours as well as those entrusted to us;
 * - **card numbers and security codes** — their presence in a log
 *   is enough to take the whole system out of the compliant perimeter.
 */
export const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  'req.headers["proxy-authorization"]',
  'res.headers["set-cookie"]',

  'password',
  'newPassword',
  'oldPassword',
  'currentPassword',
  'passwordConfirmation',
  '*.password',
  '*.newPassword',
  '*.oldPassword',
  '*.currentPassword',

  'token',
  'accessToken',
  'refreshToken',
  'sessionToken',
  'resetToken',
  'verificationToken',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.sessionToken',

  'secret',
  'apiKey',
  'privateKey',
  'clientSecret',
  '*.secret',
  '*.apiKey',
  '*.clientSecret',

  'cardNumber',
  'cvv',
  'cvc',
  '*.cardNumber',
  '*.cvv',
] as const

/** The log, as the rest of the code sees it. */
export type Logger = PinoLogger

/** Options of {@link createLogger}. */
export interface LoggerOptions {
  /** Logging threshold. */
  readonly level: string
  /**
   * Readable formatting rather than JSON.
   *
   * Reserved for development: JSON is what an aggregator knows how to index,
   * and the readable formatting costs a transport process.
   *
   * The transport is an **optional** dependency. Absent, the log
   * falls back on JSON rather than preventing the startup — a production
   * server left in `development` by mistake must serve its requests,
   * not die over a question of formatting.
   */
  readonly pretty?: boolean
  /** Name of the service, present in every line. */
  readonly name?: string
}

/**
 * Is the formatting transport installed?
 *
 * Pino resolves the target at the moment of building the log, and throws if it
 * is missing. The question is therefore asked before, once, rather than by catching
 * an exception one would not know whether it came from there.
 */
function prettyAvailable(): boolean {
  try {
    createRequire(import.meta.url).resolve('pino-pretty')
    return true
  } catch {
    return false
  }
}

/** Opens a log. */
export function createLogger(options: LoggerOptions): Logger {
  const { level, pretty = false, name = 'odoro' } = options
  const readable = pretty && prettyAvailable()

  return pino({
    name,
    level,
    redact: {
      paths: [...REDACTED_PATHS],
      censor: '[redacted]',
    },
    // The level spelled out rather than as a number: a log is read
    // more often than it is sorted.
    formatters: { level: (label) => ({ level: label }) },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(readable
      ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
      : {}),
  })
}

/** What the context of a request carries. */
export interface RequestContext {
  /** Correlation identifier. */
  readonly correlationId: string
  /** Log enriched with this identifier. */
  readonly logger: Logger
}

/**
 * The context of the request in progress.
 *
 * `AsyncLocalStorage` crosses the `await` and the callbacks: a function
 * called three levels deep reaches it without the three
 * intermediaries having to carry anything at all.
 */
const storage = new AsyncLocalStorage<RequestContext>()

/**
 * The context of the current request, if there is one.
 *
 * Gives `undefined` outside a request — in a queue job, a scheduled task
 * or a script. That is intended: these paths have their own log, and a
 * request identifier would be a lie there.
 */
export function currentContext(): RequestContext | undefined {
  return storage.getStore()
}

/**
 * The log of the current request, or the one supplied as a fallback.
 *
 * @example
 * log(fallback).info({ userId }, 'profile updated')
 */
export function log(fallback: Logger): Logger {
  return storage.getStore()?.logger ?? fallback
}

/**
 * Middleware opening the context of a request.
 *
 * It must be set **before** everything that logs, without which the first
 * lines come out with no identifier — and those are often the ones that matter.
 */
export function createRequestContext(logger: Logger) {
  return function requestContext(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    // An identifier coming from upstream is kept: behind a load balancer or
    // a gateway, it is what ties our trace to its own.
    const correlationId = request.get(CORRELATION_HEADER) ?? randomUUID()

    request.headers[CORRELATION_HEADER] = correlationId
    response.setHeader(CORRELATION_HEADER, correlationId)

    const child = logger.child({ correlationId })
    const started = process.hrtime.bigint()

    response.on('finish', () => {
      const elapsed = Number(process.hrtime.bigint() - started) / 1e6
      child.info(
        {
          method: request.method,
          // `route.path` rather than the URL: `/users/:id` groups, whereas
          // `/users/8f2c…` produces a series of one.
          path: request.route?.path ?? request.path,
          status: response.statusCode,
          durationMs: Math.round(elapsed * 100) / 100,
        },
        'request',
      )
    })

    storage.run({ correlationId, logger: child }, next)
  }
}
