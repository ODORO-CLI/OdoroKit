/**
 * The container, and above all its typing promises.
 *
 * The value assertions do not say much about a container: what
 * matters is what TypeScript knows about it. The typing cases are therefore checked
 * at compilation, by expressions that would not compile if
 * the inference were lost — `tsc --noEmit` fails the suite before it even
 * runs.
 *
 * @module
 */

import { describe, expect, it, vi } from 'vitest'

import { createContainer } from './container.js'

describe('resolution', () => {
  it('gives the registered service', () => {
    const c = createContainer().register('number', () => 42)
    expect(c.get('number')).toBe(42)
  })

  it('infers the type without annotation', () => {
    const c = createContainer()
      .register('name', () => 'odoro')
      .register('size', (c) => c.get('name').length)

    // `.length` would not exist if `get('name')` gave `unknown`: the line
    // above is itself the typing assertion.
    expect(c.get('size')).toBe(5)

    const name: string = c.get('name')
    expect(name).toBe('odoro')
  })

  it('lets a factory read the services already registered', () => {
    const c = createContainer()
      .register('database', () => ({ url: 'postgres://' }))
      .register('client', (c) => ({ target: c.get('database').url }))

    expect(c.get('client')).toEqual({ target: 'postgres://' })
  })

  it('refuses an unknown key at runtime as well', () => {
    const c = createContainer().register('a', () => 1)
    // The key is forbidden by the type; this path stays reachable from
    // JavaScript, and the message must name what exists.
    expect(() => (c as { get: (k: string) => unknown }).get('b')).toThrow(
      /Unknown service/,
    )
  })

  it('refuses a double registration', () => {
    const c = createContainer().register('a', () => 1)
    expect(() =>
      (c as { register: (k: string, f: () => unknown) => unknown }).register(
        'a',
        () => 2,
      ),
    ).toThrow(/already registered/)
  })
})

describe('scopes', () => {
  it('builds a singleton only once', () => {
    const factory = vi.fn(() => ({ id: Math.random() }))
    const c = createContainer().register('service', factory)

    expect(c.get('service')).toBe(c.get('service'))
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('shares the singleton with the children', () => {
    const c = createContainer().register('service', () => ({}))
    const scoped = c.scope()

    expect(scoped.get('service')).toBe(c.get('service'))
  })

  it('rebuilds a request service in each child', () => {
    const c = createContainer().register('trace', () => ({}), 'request')

    const a = c.scope()
    const b = c.scope()

    expect(a.get('trace')).not.toBe(b.get('trace'))
    expect(a.get('trace')).toBe(a.get('trace'))
  })

  it('refuses that a singleton captures a request service', () => {
    // The flaw this rule prevents: the singleton, built during the
    // first request, would keep the trace of that very request for all the
    // following ones. Nothing would fail — the log would simply write under the
    // wrong identifier, and that would only be seen by rereading traces that
    // make no sense.
    const c = createContainer()
      .register('trace', () => ({ id: Math.random() }), 'request')
      .register('logger', (c) => ({ read: () => c.get('trace') }))

    // The read is deferred in a closure: it takes place well after the
    // construction of the singleton. It is the common case, and the one a
    // watch on the construction stack would let through.
    expect(() => c.scope().get('logger').read()).toThrow(/Captive dependency/)
  })

  it('refuses the immediate capture as well', () => {
    const c = createContainer()
      .register('trace', () => ({}), 'request')
      .register('logger', (c) => ({ trace: c.get('trace') }))

    expect(() => c.scope().get('logger')).toThrow(/Captive dependency/)
  })

  it('names both services in the refusal', () => {
    const c = createContainer()
      .register('trace', () => ({}), 'request')
      .register('logger', (c) => c.get('trace'))

    expect(() => c.scope().get('logger')).toThrow(/"logger".*"trace"/s)
  })

  it('lets a request service read another one', () => {
    const c = createContainer()
      .register('trace', () => ({ id: 1 }), 'request')
      .register('logger', (c) => ({ read: () => c.get('trace') }), 'request')

    const a = c.scope()
    const b = c.scope()

    expect(a.get('logger').read()).toBe(a.get('trace'))
    expect(b.get('logger').read()).toBe(b.get('trace'))
    expect(a.get('logger').read()).not.toBe(b.get('logger').read())
  })
})

describe('cycles', () => {
  it('names the cycle rather than overflowing the stack', () => {
    const c = createContainer().register('a', () => 1)

    // The type forbids writing a cycle: a factory only sees the keys
    // already registered. It stays constructible by working around the type, and the
    // message must then show the path.
    const raw = c as unknown as {
      register: (k: string, f: (r: { get: (k: string) => unknown }) => unknown) => void
      get: (k: string) => unknown
    }
    raw.register('b', (r) => r.get('c'))
    raw.register('c', (r) => r.get('b'))

    expect(() => raw.get('b')).toThrow(/Dependency cycle.*b -> c -> b/s)
  })
})

describe('release', () => {
  it('releases the services that declare it, in reverse order', async () => {
    const order: string[] = []
    const c = createContainer()
      .register('database', () => ({ dispose: () => void order.push('database') }))
      .register('cache', () => ({ dispose: () => void order.push('cache') }))

    c.get('database')
    c.get('cache')
    await c.dispose()

    // `cache` was built after `database`: it is released before.
    expect(order).toEqual(['cache', 'database'])
  })

  it('ignores the services without dispose', async () => {
    const c = createContainer().register('plain', () => ({ value: 1 }))
    c.get('plain')
    await expect(c.dispose()).resolves.toBeUndefined()
  })

  it('waits for the asynchronous releases', async () => {
    let closed = false
    const c = createContainer().register('pool', () => ({
      dispose: async () => {
        await new Promise((resolve) => setTimeout(resolve, 5))
        closed = true
      },
    }))

    c.get('pool')
    await c.dispose()
    expect(closed).toBe(true)
  })

  it('only releases its own scope, not the one of the parent', async () => {
    const order: string[] = []
    const c = createContainer()
      .register('global', () => ({ dispose: () => void order.push('global') }))
      .register(
        'perRequest',
        () => ({ dispose: () => void order.push('request') }),
        'request',
      )

    const scoped = c.scope()
    scoped.get('global')
    scoped.get('perRequest')

    await scoped.dispose()
    expect(order).toEqual(['request'])

    await c.dispose()
    expect(order).toEqual(['request', 'global'])
  })
})

describe('inventory', () => {
  it('lists the visible keys, parent included', () => {
    const c = createContainer()
      .register('a', () => 1)
      .register('b', () => 2)

    expect([...c.keys()].sort()).toEqual(['a', 'b'])
    expect([...c.scope().keys()].sort()).toEqual(['a', 'b'])
  })
})
