/**
 * The assembled application, on real HTTP requests.
 *
 * ## What these tests cover that the others cannot
 *
 * The container, the configuration and the order of the modules are tested in isolation.
 * Three things cannot be, and those are the ones that hurt in
 * production:
 *
 * 1. **An unexpected error must divulge nothing.** An SQL driver message
 *    quotes the query, therefore the structure of the tables. A constraint name says
 *    that an address already exists. The only way to check it is to throw
 *    such an error and read what comes out.
 *
 * 2. **Express 5 must pass on the rejected promises.** That is the reason
 *    for requiring this version; if the assumption is false, the request stays
 *    hanging and no unit test shows it.
 *
 * 3. **The request scope must close**, including when the request
 *    fails. A scope that leaks is only seen on the thousandth request, in
 *    memory that does not come back down.
 *
 * @module
 */

import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { createApp } from './app.js'
import { loadConfig, type KernelConfig } from './config.js'
import { createContainer } from './container.js'
import { ConflictError } from './http/errors.js'
import { route } from './http/route.js'
import { defineModule } from './module.js'
import { createLogger } from './logger.js'

/** A silent log: these tests read responses, not lines. */
const logger = createLogger({ level: 'silent' })

/** Assembles a test application. */
function build(
  routes: readonly ReturnType<typeof route>[],
  overrides: Partial<KernelConfig> = {},
  authenticate?: Parameters<typeof createApp>[0]['authenticate'],
) {
  const config = {
    ...loadConfig(undefined, { NODE_ENV: 'test' }),
    ...overrides,
  } as KernelConfig

  return createApp({
    config,
    logger,
    container: createContainer() as never,
    modules: [defineModule({ name: 'test', routes: routes as never }) as never],
    ...(authenticate === undefined ? {} : { authenticate }),
  })
}

describe('responses', () => {
  it('gives the validated output', async () => {
    const app = build([
      route({
        name: 'test.read',
        method: 'GET',
        path: '/test',
        auth: 'public',
        output: z.object({ value: z.number() }),
        handler: () => ({ value: 42 }),
      }),
    ])

    const response = await request(app.express).get('/test')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ value: 42 })
  })

  it('holds back the fields not declared by the output schema', async () => {
    // The rule "no database entity is returned directly" becomes
    // checkable rather than only written: a Zod object only keeps what
    // it declares, password hash included.
    const app = build(
      [
        route({
          name: 'test.user',
          method: 'GET',
          path: '/user',
          auth: 'public',
          output: z.object({ id: z.string() }),
          handler: () =>
            ({ id: 'u1', passwordHash: '$argon2id$…', resetToken: 'secret' }) as never,
        }),
      ],
      // In production, a non-compliant output does not fail: it is
      // reduced. It is that very behaviour that is checked here.
      { NODE_ENV: 'production' },
    )

    const response = await request(app.express).get('/user')
    expect(response.body).toEqual({ id: 'u1' })
    expect(response.text).not.toContain('argon2')
    expect(response.text).not.toContain('secret')
  })

  it('gives 204 when the route declares no output', async () => {
    const app = build([
      route({
        name: 'test.empty',
        method: 'DELETE',
        path: '/test',
        auth: 'public',
        handler: () => undefined,
      }),
    ])

    const response = await request(app.express).delete('/test')
    expect(response.status).toBe(204)
  })
})

describe('validation of the inputs', () => {
  const app = build([
    route({
      name: 'test.write',
      method: 'POST',
      path: '/test/:id',
      auth: 'public',
      input: z.object({
        id: z.string(),
        name: z.string().min(2),
        age: z.coerce.number(),
      }),
      output: z.object({ id: z.string(), name: z.string(), age: z.number() }),
      handler: ({ input }) => input,
    }),
  ])

  it('merges body, query string and URL parameters', async () => {
    const response = await request(app.express)
      .post('/test/u1?age=30')
      .send({ name: 'Lea' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ id: 'u1', name: 'Lea', age: 30 })
  })

  it('makes the URL parameter win over the body', async () => {
    // Classic privilege escalation: the identity is read in the path to
    // authorize, then one acts on the one of the body.
    const response = await request(app.express)
      .post('/test/u1?age=30')
      .send({ name: 'Lea', id: 'u2' })

    expect(response.body.id).toBe('u1')
  })

  it('details the faulty fields', async () => {
    const response = await request(app.express).post('/test/u1').send({ name: 'L' })

    expect(response.status).toBe(422)
    expect(response.type).toBe('application/problem+json')
    expect(response.body.kind).toBe('VALIDATION')

    const fields = response.body.errors.map((e: { field: string }) => e.field)
    expect(fields).toContain('name')
    expect(fields).toContain('age')
  })
})

describe('errors', () => {
  it('lets the message of an expected error through', async () => {
    const app = build([
      route({
        name: 'test.conflict',
        method: 'POST',
        path: '/conflict',
        auth: 'public',
        handler: () => {
          throw new ConflictError('This address is already taken.')
        },
      }),
    ])

    const response = await request(app.express).post('/conflict')
    expect(response.status).toBe(409)
    expect(response.body.kind).toBe('CONFLICT')
    expect(response.body.detail).toBe('This address is already taken.')
  })

  it('divulges nothing of an unexpected error in production', async () => {
    const app = build(
      [
        route({
          name: 'test.failure',
          method: 'GET',
          path: '/failure',
          auth: 'public',
          handler: () => {
            // What an SQL driver would really give: the query, therefore the
            // structure of the tables, and the name of a violated constraint.
            throw new Error(
              'duplicate key value violates unique constraint "users_email_key" ' +
                'DETAIL: Key (email)=(lea@example.com) already exists.',
            )
          },
        }),
      ],
      { NODE_ENV: 'production' },
    )

    const response = await request(app.express).get('/failure')

    expect(response.status).toBe(500)
    expect(response.body.kind).toBe('INTERNAL')
    expect(response.text).not.toContain('users_email_key')
    expect(response.text).not.toContain('lea@example.com')
    expect(response.text).not.toContain('unique constraint')
    expect(response.body.correlationId).toEqual(expect.any(String))
  })

  it('passes on a rejected promise without a wrapper', async () => {
    // The assumption that justifies Express 5. False, the request would stay
    // hanging until the client timed out.
    const app = build(
      [
        route({
          name: 'test.async',
          method: 'GET',
          path: '/async',
          auth: 'public',
          handler: async () => {
            await Promise.resolve()
            throw new ConflictError('asynchronous rejection')
          },
        }),
      ],
      { NODE_ENV: 'production' },
    )

    const response = await request(app.express).get('/async')
    expect(response.status).toBe(409)
  })

  it('gives a problem+json on a missing route', async () => {
    const app = build([])
    const response = await request(app.express).get('/nowhere')

    expect(response.status).toBe(404)
    expect(response.type).toBe('application/problem+json')
    expect(response.body.kind).toBe('NOT_FOUND')
  })

  it('carries the correlation identifier in a header and in the body', async () => {
    const app = build(
      [
        route({
          name: 'test.failure',
          method: 'GET',
          path: '/failure',
          auth: 'public',
          handler: () => {
            throw new Error('internal')
          },
        }),
      ],
      { NODE_ENV: 'production' },
    )

    const response = await request(app.express).get('/failure')
    expect(response.headers['x-request-id']).toBe(response.body.correlationId)
  })

  it('keeps an identifier coming from upstream', async () => {
    // Behind a gateway, it is what ties our trace to its own.
    const app = build([])
    const response = await request(app.express)
      .get('/nowhere')
      .set('x-request-id', 'upstream-trace')

    expect(response.body.correlationId).toBe('upstream-trace')
  })
})

describe('authentication guard', () => {
  it('refuses a private route without an identity', async () => {
    const app = build([
      route({
        name: 'test.private',
        method: 'GET',
        path: '/private',
        auth: 'required',
        handler: () => undefined,
      }),
    ])

    const response = await request(app.express).get('/private')
    expect(response.status).toBe(401)
    expect(response.body.kind).toBe('UNAUTHORIZED')
  })

  it('refuses as well when no authentication module is mounted', async () => {
    // The right default: a server without authentication does not serve its
    // private routes as if they were public.
    const app = build([
      route({
        name: 'test.private',
        method: 'GET',
        path: '/private',
        auth: 'required',
        handler: () => undefined,
      }),
    ])

    expect((await request(app.express).get('/private')).status).toBe(401)
  })

  it('passes the identity on to the handler', async () => {
    const app = build(
      [
        route({
          name: 'test.me',
          method: 'GET',
          path: '/me',
          auth: 'required',
          output: z.object({ id: z.string() }),
          handler: ({ user }) => ({ id: user.id }),
        }),
      ],
      {},
      () => Promise.resolve({ id: 'u1', sessionId: 's1', organizationId: undefined }),
    )

    const response = await request(app.express).get('/me')
    expect(response.body).toEqual({ id: 'u1' })
  })
})

describe('request scope', () => {
  it('closes it even when the request fails', async () => {
    // A scope that leaks is only seen on the thousandth request, in memory that
    // does not come back down.
    const released = vi.fn()
    const container = createContainer().register(
      'resource',
      () => ({ dispose: released }),
      'request',
    )

    const app = createApp({
      config: { ...loadConfig(undefined, { NODE_ENV: 'test' }), NODE_ENV: 'production' },
      logger,
      container: container as never,
      modules: [
        defineModule({
          name: 'test',
          routes: [
            route({
              name: 'test.failure',
              method: 'GET',
              path: '/failure',
              auth: 'public',
              handler: ({ c }) => {
                ;(c as unknown as { get: (k: string) => unknown }).get('resource')
                throw new Error('internal')
              },
            }),
          ] as never,
        }) as never,
      ],
    })

    await request(app.express).get('/failure')
    expect(released).toHaveBeenCalledTimes(1)
  })
})

describe('inventory', () => {
  it('exposes the mounted routes', async () => {
    const app = build([
      route({
        name: 'test.read',
        method: 'GET',
        path: '/test',
        auth: 'public',
        handler: () => undefined,
      }),
    ])

    expect(app.routes.map((r) => r.name)).toEqual(['test.read'])
    await Promise.resolve()
  })
})
