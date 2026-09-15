/**
 * The ordering of the modules.
 *
 * Three flaws must fail at startup rather than on the first request:
 * a missing dependency, a cycle, and a module that requires from the engine a
 * capability it does not have. Each one shows up otherwise on use, on a
 * rare path, with a message that does not say where it comes from.
 *
 * @module
 */

import { describe, expect, it } from 'vitest'

import { ModuleError, assertCapabilities, defineModule, orderModules } from './module.js'
import { findOpenMutations, type RouteDefinition } from './http/route.js'

/** A module reduced to its name and to its dependencies. */
function mod(name: string, requires: readonly string[] = []) {
  return defineModule({ name, requires }) as never
}

describe('loading order', () => {
  it('places a dependency before the one that requires it', () => {
    const order = orderModules([mod('account', ['auth']), mod('auth')])
    expect(order.map((m) => m.name)).toEqual(['auth', 'account'])
  })

  it('resolves a complete chain', () => {
    const order = orderModules([
      mod('notifications', ['account']),
      mod('account', ['auth']),
      mod('auth'),
    ])
    expect(order.map((m) => m.name)).toEqual(['auth', 'account', 'notifications'])
  })

  it('accepts a diamond', () => {
    // `audit` reached twice by different paths is not a cycle,
    // and it is that distinction the third state of the traversal allows.
    const order = orderModules([
      mod('account', ['audit']),
      mod('files', ['audit']),
      mod('audit'),
    ]).map((m) => m.name)

    expect(order.indexOf('audit')).toBeLessThan(order.indexOf('account'))
    expect(order.indexOf('audit')).toBeLessThan(order.indexOf('files'))
    expect(order).toHaveLength(3)
  })

  it('produces the same order on each call', () => {
    // An order that varies makes irreproducible any flaw that depends on it.
    const modules = [mod('c', ['a', 'b']), mod('b', ['a']), mod('a')]
    const first = orderModules(modules).map((m) => m.name)
    const second = orderModules(modules).map((m) => m.name)
    expect(first).toEqual(second)
  })
})

describe('refusal at startup', () => {
  it('names the absent dependency and what is enabled', () => {
    expect(() => orderModules([mod('account', ['auth'])])).toThrow(
      /"account" requires "auth", which is not enabled/,
    )
  })

  it('shows the path of a cycle', () => {
    expect(() =>
      orderModules([mod('a', ['b']), mod('b', ['c']), mod('c', ['a'])]),
    ).toThrow(/Cycle between modules: a -> b -> c -> a/)
  })

  it('refuses two modules with the same name', () => {
    expect(() => orderModules([mod('auth'), mod('auth')])).toThrow(
      /Two modules bear the name "auth"/,
    )
  })

  it('throws a ModuleError and not a generic error', () => {
    expect(() => orderModules([mod('a', ['unknown'])])).toThrow(ModuleError)
  })
})

describe('capabilities of the engine', () => {
  const search = defineModule({
    name: 'search',
    requiresCapabilities: ['fullText', 'jsonb'],
  }) as never

  it('lets through when the dialect offers them', () => {
    expect(() =>
      assertCapabilities([search], { fullText: true, jsonb: true }, 'postgres'),
    ).not.toThrow()
  })

  it('names the module, the capability and the dialect', () => {
    // All three are needed: without the module one does not know what to
    // disable, without the capability one does not know why, and without the
    // dialect one does not know whether the engine must be changed.
    expect(() =>
      assertCapabilities([search], { fullText: false, jsonb: true }, 'sqlite'),
    ).toThrow(/"search".*"fullText".*sqlite/s)
  })

  it('reports every missing capability', () => {
    try {
      assertCapabilities([search], {}, 'sqlite')
      expect.unreachable('the capabilities should have been refused')
    } catch (error) {
      expect((error as Error).message).toContain('fullText')
      expect((error as Error).message).toContain('jsonb')
    }
  })
})

describe('public mutating routes', () => {
  /** A route reduced to what the inspection looks at. */
  const r = (
    name: string,
    method: RouteDefinition['method'],
    auth: RouteDefinition['auth'],
    policy?: string,
  ): RouteDefinition => ({
    name,
    method,
    path: `/${name}`,
    auth,
    ...(policy === undefined ? {} : { policy }),
    handler: () => undefined,
  })

  it('reports a mutating route left public', () => {
    // The flaw this inspection exists to catch: these routes only
    // differ from the others by the absence of a field, and are therefore looked for
    // by eye without ever being found.
    const found = findOpenMutations([
      r('account.delete', 'DELETE', 'public'),
      r('account.read', 'GET', 'public'),
      r('account.update', 'PATCH', 'required'),
    ])

    expect(found.map((route) => route.name)).toEqual(['account.delete'])
  })

  it('does not report a public route that declares a policy', () => {
    // A sign-up or a reset request are legitimately
    // public and mutating: the declared policy says it is intended.
    expect(
      findOpenMutations([r('auth.register', 'POST', 'public', 'auth.register')]),
    ).toEqual([])
  })
})
