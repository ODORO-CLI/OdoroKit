/**
 * Errors, and their translation into HTTP responses.
 *
 * ## The format
 *
 * The error responses follow RFC 9457, `application/problem+json`: a
 * `type`, a `title`, a `status`, a `detail`, and whatever extensions one wants.
 * This is not an aesthetic choice — it is a format the client knows how to
 * discriminate without a house convention, which phase 4 depends on.
 *
 * ## What must never come out
 *
 * An unexpected error in production gives a correlation identifier and
 * nothing else. No stack trace, no SQL driver message, no
 * table name, no constraint name.
 *
 * The reason is concrete: an ORM message readily quotes the query, therefore
 * the structure of the tables, therefore enough to write a useful injection. A
 * violated constraint name says that an address already exists — that is an enumeration of
 * accounts offered by the error handler, without anyone having
 * wanted it.
 *
 * The complete trace goes into the logs, under the same identifier. Whoever
 * operates sees it; whoever calls only sees the identifier to quote.
 *
 * ## Why a hierarchy rather than a code
 *
 * A class per family is caught by type, is tested by `instanceof`, and
 * the editor knows how to follow it. A `code: string` field leads to comparisons of
 * strings scattered around, which no rename catches up with.
 *
 * @module
 */

import type { NextFunction, Request, Response } from 'express'

/** The error families the API distinguishes. */
export const ERROR_KINDS = [
  'VALIDATION',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMIT',
  'UNAVAILABLE',
  'INTERNAL',
] as const

/** Family of an error, as the client discriminates it. */
export type ErrorKind = (typeof ERROR_KINDS)[number]

/** HTTP status of each family. */
const STATUS: Readonly<Record<ErrorKind, number>> = {
  VALIDATION: 422,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  UNAVAILABLE: 503,
  INTERNAL: 500,
}

/** A validation error, field by field. */
export interface FieldError {
  /** Path of the field, in dotted notation: `address.city`. */
  readonly field: string
  /** Message meant to be displayed as it is. */
  readonly message: string
}

/**
 * The body of an error response, as the client receives it.
 *
 * It is exported because the generated client of phase 4 derives its error
 * types from it: it is the contract, not a serialisation detail.
 */
export interface ProblemDocument {
  /** URI identifying the type of problem. */
  readonly type: string
  /** Short summary, stable for a given `type`. */
  readonly title: string
  /** HTTP status, repeated in the body as the RFC asks. */
  readonly status: number
  /** Description of this occurrence. */
  readonly detail: string
  /** Family, for the discrimination on the client side. */
  readonly kind: ErrorKind
  /** Correlation identifier, present on every error response. */
  readonly correlationId: string
  /** Errors by field, on a validation error only. */
  readonly errors?: readonly FieldError[]
  /** Seconds to wait, on a rate limit only. */
  readonly retryAfter?: number
}

/**
 * Error meant for the client.
 *
 * Everything that inherits from it is **expected**: its message is written to be read by
 * the caller, and goes through as it is all the way to production. What does not inherit from it
 * is unexpected, and does not go through.
 */
export class ApiError extends Error {
  /** URI type, derived from the family. */
  readonly type: string

  constructor(
    readonly kind: ErrorKind,
    message: string,
    readonly options: {
      /** Errors by field. */
      readonly errors?: readonly FieldError[]
      /** Seconds before a new attempt. */
      readonly retryAfter?: number
      /** Original cause, logged, never passed on. */
      readonly cause?: unknown
      /**
       * Extension members of the problem document (RFC 9457, section 3.2).
       *
       * For a module that speaks an existing contract — Odoro's storefront
       * answers `{ erreur }`, and its clients read that field. The standard
       * members always win: an extension cannot rewrite `status` or `type`.
       */
      readonly extensions?: Readonly<Record<string, unknown>>
    } = {},
  ) {
    super(message, options.cause === undefined ? {} : { cause: options.cause })
    this.name = new.target.name
    this.type = `https://odoro.dev/problems/${kind.toLowerCase().replace(/_/g, '-')}`
  }

  /** Matching HTTP status. */
  get status(): number {
    return STATUS[this.kind]
  }
}

/** Input refused by a schema. */
export class ValidationError extends ApiError {
  constructor(errors: readonly FieldError[], message = 'The request is invalid.') {
    super('VALIDATION', message, { errors })
  }
}

/** No identity, or expired identity. */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required.') {
    super('UNAUTHORIZED', message)
  }
}

/**
 * Known identity, insufficient rights.
 *
 * Not to be confused with {@link UnauthorizedError}: the client of phase 4
 * signs out on a 401 and does not act on a 403. Confusing the two produces
 * a sign-out on every forbidden screen.
 */
export class ForbiddenError extends ApiError {
  constructor(
    message = 'Action not allowed.',
    options: Pick<ApiError['options'], 'extensions'> = {},
  ) {
    super('FORBIDDEN', message, options)
  }
}

/** Missing resource. */
export class NotFoundError extends ApiError {
  constructor(
    message = 'Resource not found.',
    options: Pick<ApiError['options'], 'extensions'> = {},
  ) {
    super('NOT_FOUND', message, options)
  }
}

/** Incompatible state: address already taken, stale version. */
export class ConflictError extends ApiError {
  constructor(
    message = 'Conflict with the current state.',
    options: Pick<ApiError['options'], 'extensions'> = {},
  ) {
    super('CONFLICT', message, options)
  }
}

/** Too many attempts. */
export class RateLimitError extends ApiError {
  constructor(retryAfter: number, message = 'Too many attempts.') {
    super('RATE_LIMIT', message, { retryAfter })
  }
}

/**
 * A dependency is missing, the service cannot work.
 *
 * To be distinguished from {@link ApiError} in 500: a 503 says that the demand was
 * valid and that the service is momentarily unable to answer it. That is what
 * a load balancer reads to stop sending traffic — where a 500 would
 * let it carry on, since it reports a faulty request and not a
 * service in trouble.
 *
 * It is also what `/ready` gives as long as something is missing.
 */
export class ServiceUnavailableError extends ApiError {
  constructor(
    message = 'Service momentarily unavailable.',
    retryAfter?: number,
    options: Pick<ApiError['options'], 'extensions'> = {},
  ) {
    super(
      'UNAVAILABLE',
      message,
      retryAfter === undefined ? options : { ...options, retryAfter },
    )
  }
}

/** Titles, stable for a given type. */
const TITLES: Readonly<Record<ErrorKind, string>> = {
  VALIDATION: 'Invalid request',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Not found',
  CONFLICT: 'Conflict',
  RATE_LIMIT: 'Too many requests',
  UNAVAILABLE: 'Service unavailable',
  INTERNAL: 'Internal error',
}

/** What the handler needs. */
export interface ErrorHandlerOptions {
  /**
   * Lets the message and the trace of the unexpected errors through.
   *
   * True in development only. The default is false: an inversion by
   * omission must lean towards the side that divulges nothing.
   */
  readonly exposeInternals?: boolean
  /** Logs the error with its correlation identifier. */
  readonly log: (entry: {
    readonly correlationId: string
    readonly error: unknown
    readonly expected: boolean
  }) => void
}

/**
 * Builds the error handler.
 *
 * It is placed **last**, after every route: Express recognises an
 * error handler by its four parameters, and only calls it for what
 * has been passed to `next(error)` — or, in Express 5, for any promise
 * rejected in a handler.
 *
 * @example
 * app.use(createErrorHandler({ log: (e) => logger.error(e) }))
 */
export function createErrorHandler(options: ErrorHandlerOptions) {
  const { exposeInternals = false, log } = options

  return function errorHandler(
    error: unknown,
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    // A response already begun can no longer become an error document:
    // the headers are gone. Express knows how to close the connection cleanly.
    if (response.headersSent) {
      next(error)
      return
    }

    const correlationId = readCorrelationId(request)
    const expected = error instanceof ApiError

    log({ correlationId, error, expected })

    const problem = expected
      ? describe(error, correlationId)
      : describeInternal(error, correlationId, exposeInternals)

    if (problem.retryAfter !== undefined) {
      response.setHeader('Retry-After', String(problem.retryAfter))
    }

    response.status(problem.status).type('application/problem+json').json(problem)
  }
}

/** Translates an expected error. */
function describe(error: ApiError, correlationId: string): ProblemDocument {
  return {
    ...(error.options.extensions ?? {}),
    type: error.type,
    title: TITLES[error.kind],
    status: error.status,
    detail: error.message,
    kind: error.kind,
    correlationId,
    ...(error.options.errors === undefined ? {} : { errors: error.options.errors }),
    ...(error.options.retryAfter === undefined
      ? {}
      : { retryAfter: error.options.retryAfter }),
  }
}

/**
 * Translates an unexpected error.
 *
 * In production, `detail` only holds the identifier to quote. The original
 * message stays in the logs: it may name a table, a constraint
 * or a query, and each of these three informs an attacker.
 */
function describeInternal(
  error: unknown,
  correlationId: string,
  exposeInternals: boolean,
): ProblemDocument {
  const detail = exposeInternals
    ? `${error instanceof Error ? error.message : String(error)} (${correlationId})`
    : `An internal error occurred. Quote the identifier ${correlationId} to support.`

  return {
    type: 'https://odoro.dev/problems/internal',
    title: TITLES.INTERNAL,
    status: 500,
    detail,
    kind: 'INTERNAL',
    correlationId,
  }
}

/** Header carrying the correlation identifier. */
export const CORRELATION_HEADER = 'x-request-id'

/** Reads the identifier set by the logging middleware. */
function readCorrelationId(request: Request): string {
  const header = request.get(CORRELATION_HEADER)
  return header ?? 'unknown'
}

/**
 * Unmatched route.
 *
 * Placed after the routes and before the error handler: without it,
 * Express gives its default HTML page, which is neither `problem+json` nor
 * discriminable by the client.
 */
export function notFoundHandler(
  _request: Request,
  _response: Response,
  next: NextFunction,
): void {
  next(new NotFoundError('No route matches this address.'))
}
