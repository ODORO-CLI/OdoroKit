/**
 * Validation of the inputs.
 *
 * ## One single input, three origins
 *
 * The body, the URL parameters and the query string arrive through three
 * channels and are merged into a single object before validation. The handler receives
 * `input`, without having to know where each field comes from.
 *
 * It is not only a convenience. A route that moved a field from the body
 * to the query string would then change neither its schema, nor its handler,
 * nor the client — only its path.
 *
 * ## The merge order, and why it is that one
 *
 * The URL parameters win over the query string, which wins over
 * the body. The URL parameter is part of the address: `/users/:id` designates
 * a user, and an `id` slipped into the body must not be able to
 * designate another one.
 *
 * The reverse is a classic privilege escalation — the identity is read in
 * the path to authorize, then one acts on the one of the body.
 *
 * ## The errors by field
 *
 * A refused input produces a `problem+json` document carrying `errors`, one
 * line per faulty field, with the path in dotted notation. That is what the
 * client of phase 4 spreads over the fields of the form, and that is what
 * avoids writing the same message logic three times.
 *
 * @module
 */

import type { Request } from 'express'
import type { z } from 'zod'

import { ValidationError, type FieldError } from './errors.js'

/**
 * Merges the three origins.
 *
 * Exported to be tested on its own: the order of precedence is a decision of
 * security, not an implementation detail.
 */
export function mergeSources(request: Request): Record<string, unknown> {
  const body =
    typeof request.body === 'object' && request.body !== null
      ? (request.body as Record<string, unknown>)
      : {}

  // From the least prioritary to the most prioritary. The URL parameter wins because
  // it is part of the address: an `id` slipped into the body must not
  // be able to designate another resource than the one the path names.
  return { ...body, ...request.query, ...request.params }
}

/**
 * Translates the problems of a schema into errors by field.
 *
 * The path is given in dotted notation — `address.city`, `lines.0.price` —
 * because that is how the form libraries designate their
 * fields, and because the client must be able to make the match without
 * translation.
 */
export function toFieldErrors(error: z.ZodError): readonly FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.map(String).join('.') || '(root)',
    message: issue.message,
  }))
}

/**
 * Validates an input against a schema.
 *
 * @throws {ValidationError} With the detail by field.
 */
export function validateInput<Schema extends z.ZodType>(
  schema: Schema,
  request: Request,
): z.infer<Schema> {
  const result = schema.safeParse(mergeSources(request))
  if (result.success) return result.data

  throw new ValidationError(toFieldErrors(result.error))
}

/**
 * Validates an output against its schema.
 *
 * ## Why validate what one emits
 *
 * An output schema serves first to type the client. Having it **enforced** at
 * the moment of the response makes it something else: the guarantee that no
 * undeclared field comes out.
 *
 * That is what makes the rule "no database entity is returned
 * directly" checkable rather than only written. A service that gave back
 * the complete row — password hash and reset token
 * included — sees these fields removed here, because a Zod object only keeps
 * what it declares.
 *
 * In development, an unexpected field also makes the request **fail**:
 * the leak is then found while writing the route, not while auditing
 * production.
 */
export function validateOutput<Schema extends z.ZodType>(
  schema: Schema,
  value: unknown,
  strict: boolean,
): z.infer<Schema> {
  const result = schema.safeParse(value)

  if (!result.success) {
    if (strict) {
      throw new Error(
        `The response does not comply with its output schema: ` +
          toFieldErrors(result.error)
            .map(({ field, message }) => `${field} — ${message}`)
            .join(' ; '),
      )
    }
    // In production, a non-compliant output must not turn a
    // correct response into a 500 error: the error goes up to the log, and
    // the caller receives what the schema was able to keep.
    return value as z.infer<Schema>
  }

  return result.data
}
