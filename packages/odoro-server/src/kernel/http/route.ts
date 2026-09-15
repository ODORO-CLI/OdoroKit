/**
 * Typed route definition.
 *
 * ## One single declaration, four consumers
 *
 * A route declares its method, its path, its guard, its input and output
 * schemas, and its handler. From this declaration derive:
 *
 * 1. the mounting on Express, with validation before the handler;
 * 2. the typing of the handler, without annotation;
 * 3. the TypeScript client of the front end;
 * 4. the OpenAPI specification, and the table of `odoro routes`.
 *
 * That is the reason for this file: nothing of the above must be
 * written twice. A documentation written by hand drifts in three
 * weeks; a copied type drifts on the first rename.
 *
 * ## Why the schemas are data, not calls
 *
 * `input` and `output` are Zod schemas set in an object, and not
 * chained method calls. The difference matters for the generator: an
 * object is read without running the route, whereas a chain of calls asks
 * for instrumenting the execution to know what has been declared.
 *
 * ## The guard is mandatory
 *
 * `auth` has no default value. Writing a route forces one to decide whether
 * it is public, and to say it. A default of `'public'` would make of the oversight an
 * open route; a default of `'required'` would make of the oversight a dead route,
 * which is less serious but remains a silent flaw.
 *
 * The field is therefore required, and `odoro routes` shows the column — it is the
 * only quick way to spot a mutating route left public.
 *
 * @module
 */

import type { z } from 'zod'

import type { Container } from '../container.js'

/** Accepted HTTP methods. */
export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

/** Method of a route. */
export type Method = (typeof METHODS)[number]

/** What a route requires from the caller. */
export type AuthRequirement =
  /** No identity required. */
  | 'public'
  /** A valid session is required; otherwise 401. */
  | 'required'
  /** The identity is read if it exists, without being required. */
  | 'optional'

/** The identity resolved by the guard. */
export interface Identity {
  /** Identifier of the user. */
  readonly id: string
  /** Identifier of the session in progress. */
  readonly sessionId: string
  /**
   * Current organization, when the context designates one.
   *
   * It is `undefined` as long as no organization is selected. The
   * policies receive it and decide: it is not up to the router to settle
   * what an absence means.
   */
  readonly organizationId: string | undefined
}

/** How a cookie is written. */
export interface CookieOptions {
  /**
   * Keeps the cookie out of reach of scripts.
   *
   * @defaultValue true — a session cookie readable by a script is a session
   *   stolen by the first cross-site injection.
   */
  readonly httpOnly?: boolean
  /**
   * Sends it over HTTPS only.
   *
   * @defaultValue true outside development, where there is no certificate.
   */
  readonly secure?: boolean
  /** @defaultValue 'lax' */
  readonly sameSite?: 'strict' | 'lax' | 'none'
  /** @defaultValue '/' */
  readonly path?: string
  /** Lifetime in seconds. Absent, the cookie dies with the browser session. */
  readonly maxAge?: number
}

/**
 * Writing the cookies of a response.
 *
 * ## Why the handler does not touch the response
 *
 * Everything else a handler produces is its return value, validated against a
 * schema. A cookie cannot be: it is a header, and it has to be written before
 * the body. Handing over the whole response object to set one would open the
 * door to a handler writing its own status, its own body, and escaping the
 * output contract entirely.
 *
 * So the cookies are collected, and the mounting writes them. A handler states
 * an intent; it does not drive the transport.
 */
export interface Cookies {
  /** Writes a cookie. */
  set(name: string, value: string, options?: CookieOptions): void
  /** Deletes a cookie, by expiring it. */
  clear(name: string, options?: Pick<CookieOptions, 'path'>): void
}

/** What a handler receives. */
export interface HandlerContext<Input, Services> {
  /** Validated input: body, URL parameters and query string merged. */
  readonly input: Input
  /** The cookies of the response. */
  readonly cookies: Cookies
  /**
   * The identity.
   *
   * Non null when `auth` is `'required'` — the guard has already refused otherwise.
   * Possibly absent when it is `'optional'` or `'public'`.
   */
  readonly user: Identity
  /** The container of the request. */
  readonly c: Container<Services>
  /** Cancellation, when the client hangs up. */
  readonly signal: AbortSignal
}

/** The same context, for a route without guaranteed identity. */
export interface OpenHandlerContext<Input, Services> extends Omit<
  HandlerContext<Input, Services>,
  'user'
> {
  readonly user: Identity | undefined
}

/**
 * A route, as it is declared.
 *
 * The type is deliberately wide here — the precise parameters live in
 * {@link route}, which infers them. This shape is the one the mounting, the CLI
 * and the generator consume.
 */
export interface RouteDefinition {
  /** Canonical name, in dotted notation: `account.updateProfile`. */
  readonly name: string
  readonly method: Method
  /** Express path, parameters included: `/account/:id`. */
  readonly path: string
  readonly auth: AuthRequirement
  /** Input schema. Absent, the route accepts nothing. */
  readonly input?: z.ZodType
  /** Output schema. Serves the typing of the client and the serialisation. */
  readonly output?: z.ZodType
  /**
   * Applied policy, by name.
   *
   * Purely declarative here: it is the authorization module that applies it.
   * The name appears in `odoro routes`, which makes a mutating route
   * without a policy visible.
   */
  readonly policy?: string
  /** One-line summary, taken up in OpenAPI. */
  readonly summary?: string
  /** The processing. */
  readonly handler: (context: never) => unknown
}

/** What {@link route} accepts. */
export interface RouteOptions<
  Input extends z.ZodType | undefined,
  Output extends z.ZodType | undefined,
  Auth extends AuthRequirement,
  Services,
> {
  readonly name: string
  readonly method: Method
  readonly path: string
  readonly auth: Auth
  readonly input?: Input
  readonly output?: Output
  readonly policy?: string
  readonly summary?: string
  readonly handler: (
    context: Auth extends 'required'
      ? HandlerContext<InputOf<Input>, Services>
      : OpenHandlerContext<InputOf<Input>, Services>,
  ) => Promise<OutputOf<Output>> | OutputOf<Output>
}

/** The input type of a route, or `undefined` if it declares none. */
type InputOf<Input> = Input extends z.ZodType ? z.infer<Input> : undefined

/** The output type of a route. */
type OutputOf<Output> = Output extends z.ZodType ? z.infer<Output> : void

/**
 * Declares a route.
 *
 * @example
 * export const updateProfile = route({
 *   name: 'account.updateProfile',
 *   method: 'PATCH',
 *   path: '/account/profile',
 *   auth: 'required',
 *   policy: 'account.update',
 *   input: z.object({ displayName: z.string().min(1).max(80) }),
 *   output: profileResource,
 *   handler: async ({ input, user, c }) =>
 *     c.get('accountService').updateProfile(user.id, input),
 * })
 */
export function route<
  Input extends z.ZodType | undefined,
  Output extends z.ZodType | undefined,
  Auth extends AuthRequirement,
  Services = Record<never, never>,
>(
  options: RouteOptions<Input, Output, Auth, Services>,
): RouteOptions<Input, Output, Auth, Services> {
  return options
}

/**
 * What a mutating route must have.
 *
 * A route that changes the state and requires neither identity nor policy is almost
 * always an oversight. Almost: a contact form, a sign-up,
 * a reset request are legitimately public and mutating.
 *
 * The kernel therefore cannot refuse these routes — it **reports** them, and the
 * declaration must then say explicitly that it is intended.
 */
export const MUTATING_METHODS: readonly Method[] = ['POST', 'PUT', 'PATCH', 'DELETE']

/** A mutating route left public without an explicit mention. */
export interface OpenMutationWarning {
  readonly name: string
  readonly method: Method
  readonly path: string
}

/**
 * Spots the public mutating routes.
 *
 * Feeds `odoro routes` and a test of the kernel. Looking for these routes by eye
 * in the code does not work: they only differ from the others by
 * the absence of a field.
 */
export function findOpenMutations(
  routes: readonly RouteDefinition[],
): readonly OpenMutationWarning[] {
  return routes
    .filter(
      (route) =>
        MUTATING_METHODS.includes(route.method) &&
        route.auth === 'public' &&
        route.policy === undefined,
    )
    .map(({ name, method, path }) => ({ name, method, path }))
}
