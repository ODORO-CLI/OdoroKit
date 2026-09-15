/**
 * Health module — and an example of what a module looks like.
 *
 * It is the only module of this template, and it is written here rather than
 * provided by `@odoro-cli/server` for a reason: writing a module is the first
 * thing you do on this foundation, and an example you can open beats a page of
 * documentation.
 *
 * ## A module is a function of what it needs
 *
 * This one receives the configuration as a parameter rather than reading
 * `process.env`. That is the rule of the foundation: the environment is
 * validated once, at startup, and everything else consumes the result. A
 * direct read escapes that validation and shows up on the hundredth request.
 *
 * ## Two health endpoints, and why they differ
 *
 * `/api/health` answers that **the process is alive**. It tests nothing else,
 * and must answer even when everything else is broken: that is what an
 * orchestrator asks to decide whether to restart the container. Making it
 * depend on the database would restart a perfectly healthy server every time
 * the database hiccups — and a restart does not repair a database.
 *
 * `/api/ready` answers that **the service can do its work**, and returns 503
 * for as long as something is missing: that is what a load balancer asks to
 * decide whether it can send traffic.
 *
 * Confusing the two gives one of two faults: a service restarting in a loop
 * during a database incident, or a load balancer sending traffic to a service
 * that cannot answer.
 *
 * ## Why `/ready` fails on the first start
 *
 * A freshly scaffolded project has no `DATABASE_URL` yet. The client starts,
 * the interface shows, and `/api/ready` says what is missing. So you see
 * something in the first minute, and you know exactly what is left to do.
 *
 * @module
 */

import {
  ServiceUnavailableError,
  defineModule,
  route,
  type KernelConfig,
} from '@odoro-cli/server'
import { z } from 'zod'

/** What the liveness check returns. */
const liveness = z.object({
  status: z.literal('ok'),
  environment: z.string(),
  uptime: z.number(),
})

/** What the readiness check returns, when everything answers. */
const readiness = z.object({
  ready: z.literal(true),
  dependencies: z.array(z.object({ name: z.string(), detail: z.string() })),
})

/** A dependency and its state. */
interface Dependency {
  readonly name: string
  readonly ready: boolean
  readonly detail: string
}

/**
 * State of the dependencies.
 *
 * The database is not queried yet — the foundation has no persistence layer.
 * What is checked here is its **configuration**, which is enough to tell a
 * project that never received a URL from a configured one. When persistence
 * arrives, this function is the one that will learn to open a connection, and
 * nothing else will change.
 */
function inspect(config: KernelConfig): readonly Dependency[] {
  const url = config.DATABASE_URL.trim()
  return [
    {
      name: 'database',
      ready: url.length > 0,
      detail:
        url.length > 0
          ? 'URL configured'
          : 'DATABASE_URL missing — see .env.example, or run `odoro db:create`',
    },
  ]
}

/**
 * Builds the module.
 *
 * @example
 * createApp({ modules: [createHealthModule(config)], … })
 */
export function createHealthModule(config: KernelConfig) {
  return defineModule({
    name: 'health',
    routes: [
      route({
        name: 'health.live',
        method: 'GET',
        path: '/api/health',
        auth: 'public',
        summary: 'The process answers.',
        output: liveness,
        handler: () => ({
          status: 'ok' as const,
          environment: config.NODE_ENV,
          uptime: Math.round(process.uptime()),
        }),
      }),

      route({
        name: 'health.ready',
        method: 'GET',
        path: '/api/ready',
        auth: 'public',
        summary: 'The dependencies answer.',
        output: readiness,
        handler: () => {
          const dependencies = inspect(config)
          const missing = dependencies.filter((d) => !d.ready)

          if (missing.length > 0) {
            // 503 and not 500: the request was valid, it is the service that
            // cannot answer it yet.
            throw new ServiceUnavailableError(
              missing.map((d) => `${d.name} — ${d.detail}`).join(' ; '),
            )
          }

          return {
            ready: true as const,
            dependencies: dependencies.map(({ name, detail }) => ({ name, detail })),
          }
        },
      }),
    ] as never,
  })
}
