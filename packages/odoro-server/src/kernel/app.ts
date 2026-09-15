/**
 * Assembly of the Express application.
 *
 * ## The order of the layers is not negotiable
 *
 * 1. **Request context** — first, without which the first log lines
 *    come out with no correlation identifier, and those are often
 *    the ones that matter.
 * 2. **Body**, with its size cap.
 * 3. **Container scope** — each request opens its own, and closes it
 *    at the end, including when it fails.
 * 4. **Routes**, in the topological order of the modules.
 * 5. **Missing route**, which produces a `problem+json` rather than the HTML
 *    page of Express.
 * 6. **Error handler**, last — Express recognises it by its
 *    four parameters.
 *
 * ## Express 5 and rejected promises
 *
 * An `async` handler whose promise is rejected was, in Express 4, a
 * request left hanging until the client timed out: the rejection did not
 * reach the error handler. That is what `express-async-handler`
 * wrapped.
 *
 * Express 5 passes the rejection to `next` on its own. No wrapper is
 * therefore needed here, and that is the main reason for requiring this version.
 *
 * @module
 */

import express, { type Express, type Request, type Response } from 'express'

import type { Container } from './container.js'
import type { KernelConfig } from './config.js'
import {
  createErrorHandler,
  notFoundHandler,
  type ProblemDocument,
} from './http/errors.js'
import { validateInput, validateOutput } from './http/validate.js'
import type { Identity, RouteDefinition } from './http/route.js'
import { createRequestContext, type Logger } from './logger.js'
import { assertCapabilities, orderModules, type ModuleDefinition } from './module.js'

/** What building the application asks for. */
export interface AppOptions {
  readonly config: KernelConfig
  readonly logger: Logger
  /** The root container, already stocked with the kernel services. */
  readonly container: Container<never>
  /** The enabled modules. The order they are written in does not matter. */
  readonly modules: readonly ModuleDefinition<never>[]
  /**
   * Capabilities of the current dialect.
   *
   * Compared to the requirements of the modules before any mounting: an
   * incompatible module fails the startup, it does not degrade silently.
   */
  readonly capabilities?: Readonly<Record<string, boolean>>
  /** Name of the dialect, for the incompatibility message. */
  readonly dialect?: string
  /**
   * Resolves the identity of a request.
   *
   * Provided by the authentication module. Absent, any route requiring
   * an identity refuses — which is the right default: a server without
   * authentication must not serve its private routes as if they
   * were public.
   */
  readonly authenticate?: (request: Request) => Promise<Identity | undefined>
}

/** The mounted application, and what it takes to inspect it. */
export interface OdoroApp {
  readonly express: Express
  /** Every mounted route, for `odoro routes` and the tests. */
  readonly routes: readonly RouteDefinition[]
  /** The modules, in the order they were loaded. */
  readonly modules: readonly ModuleDefinition<never>[]
}

/** Assembles the application. */
export function createApp(options: AppOptions): OdoroApp {
  const {
    config,
    logger,
    container,
    modules,
    capabilities = {},
    dialect = 'unknown',
    authenticate,
  } = options

  // The two startup refusals, before any mounting: an impossible order and
  // a module the engine cannot serve.
  const ordered = orderModules(modules)
  assertCapabilities(ordered, capabilities, dialect)

  for (const module of ordered) module.register?.(container as never)

  const app = express()

  // Behind a load balancer, without this, the address seen is the one of the
  // balancer: rate limiting indexed on the IP would then count
  // all the traffic on a single address.
  app.set('trust proxy', true)
  app.disable('x-powered-by')

  app.use(createRequestContext(logger))
  app.use(express.json({ limit: config.BODY_LIMIT }))
  app.use(express.urlencoded({ extended: false, limit: config.BODY_LIMIT }))

  const routes: RouteDefinition[] = []
  const strictOutput = config.NODE_ENV !== 'production'

  for (const module of ordered) {
    for (const definition of module.routes ?? []) {
      routes.push(definition)
      mount(app, definition, { container, authenticate, strictOutput })
    }
  }

  app.use(notFoundHandler)
  app.use(
    createErrorHandler({
      exposeInternals: config.NODE_ENV === 'development',
      log: ({ correlationId, error, expected }) => {
        const child = logger.child({ correlationId })
        // An expected error is an ordinary event — a wrong password,
        // a missing page. Logging it at `error` would drown the
        // real failures under the noise of normal operation.
        if (expected) child.info({ err: error }, 'application error')
        else child.error({ err: error }, 'unexpected error')
      },
    }),
  )

  return { express: app, routes, modules: ordered }
}

/** What mounting a route needs to know. */
interface MountContext {
  readonly container: Container<never>
  readonly authenticate: AppOptions['authenticate']
  readonly strictOutput: boolean
}

/** Mounts a route on Express. */
function mount(app: Express, definition: RouteDefinition, context: MountContext): void {
  const method = definition.method.toLowerCase() as
    'get' | 'post' | 'put' | 'patch' | 'delete'

  app[method](definition.path, async (request: Request, response: Response) => {
    // The scope of the request: its services live there, and die there.
    const scoped = context.container.scope()

    try {
      const user = await resolveIdentity(definition, request, context)
      const input =
        definition.input === undefined
          ? undefined
          : validateInput(definition.input, request)

      const result = await (
        definition.handler as (ctx: unknown) => Promise<unknown> | unknown
      )({
        input,
        user,
        c: scoped,
        // The signal of the client: a long handler can watch it and give up
        // when nobody is waiting for the response any more.
        signal:
          (request as Request & { signal?: AbortSignal }).signal ??
          new AbortController().signal,
      })

      if (definition.output === undefined) {
        response.status(result === undefined ? 204 : 200)
        if (result !== undefined) response.json(result)
        else response.end()
        return
      }

      // The output schema is enforced, not merely declared: that is what
      // keeps an undeclared field from getting through.
      response.json(validateOutput(definition.output, result, context.strictOutput))
    } finally {
      await scoped.dispose()
    }
  })
}

/** Applies the guard of a route. */
async function resolveIdentity(
  definition: RouteDefinition,
  request: Request,
  context: MountContext,
): Promise<Identity | undefined> {
  if (definition.auth === 'public') return undefined

  const identity = await context.authenticate?.(request)

  if (definition.auth === 'required' && identity === undefined) {
    // Imported here rather than at the top: the guard is the only path that
    // needs it, and the kernel does not have to tie its errors to its assembly.
    const { UnauthorizedError } = await import('./http/errors.js')
    throw new UnauthorizedError()
  }

  return identity
}

/** The type of an error document, re-exported for the integration tests. */
export type { ProblemDocument }
