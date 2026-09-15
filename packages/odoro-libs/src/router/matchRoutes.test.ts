import { describe, expect, it } from 'vitest'

import { flattenRoutes, matchRoutes } from './matchRoutes.js'
import type { RouteObject } from './types.js'

/** Reading shortcut: the sequence of the patterns traversed. */
function patternsOf(routes: readonly RouteObject[], pathname: string): string[] | null {
  const matches = matchRoutes(routes, pathname)
  return matches?.map((match) => match.pattern) ?? null
}

describe('flattenRoutes', () => {
  it('flattens a tree into complete branches', () => {
    const routes: RouteObject[] = [
      {
        path: '/',
        children: [
          { index: true },
          { path: 'users', children: [{ path: ':id' }] },
          { path: '*' },
        ],
      },
    ]
    expect(flattenRoutes(routes).map((branch) => branch.pattern)).toEqual([
      '/',
      '/users/:id',
      '/*',
    ])
  })

  it('ranks the branches by decreasing specificity', () => {
    const routes: RouteObject[] = [
      { path: '*' },
      { path: 'users/:id' },
      { path: 'users/me' },
    ]
    expect(flattenRoutes(routes).map((branch) => branch.pattern)).toEqual([
      '/users/me',
      '/users/:id',
      '/*',
    ])
  })

  it('memoizes the result by identity of the route array', () => {
    const routes: RouteObject[] = [{ path: 'a' }]
    expect(flattenRoutes(routes)).toBe(flattenRoutes(routes))
  })

  it('produces no branch for a parent route without a leaf', () => {
    const routes: RouteObject[] = [{ path: 'layout', children: [{ path: 'a' }] }]
    expect(flattenRoutes(routes).map((branch) => branch.pattern)).toEqual(['/layout/a'])
  })

  it('traverses a route without a path as a transparent layout', () => {
    const routes: RouteObject[] = [{ children: [{ path: 'a' }, { path: 'b' }] }]
    expect(flattenRoutes(routes).map((branch) => branch.pattern)).toEqual(['/a', '/b'])
  })

  it('rejects an index route with a path', () => {
    expect(() => flattenRoutes([{ index: true, path: 'a' }])).toThrow(/index route/)
  })

  it('rejects an index route with children', () => {
    expect(() => flattenRoutes([{ index: true, children: [] }])).toThrow(/index route/)
  })
})

describe('matchRoutes — resolution', () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      children: [
        { index: true },
        { path: 'about' },
        {
          path: 'users',
          children: [{ index: true }, { path: 'me' }, { path: ':id' }],
        },
        { path: 'docs/*' },
        { path: '*' },
      ],
    },
  ]

  it('resolves the index route of the root', () => {
    expect(patternsOf(routes, '/')).toEqual(['/', '/'])
  })

  it('resolves a static route', () => {
    expect(patternsOf(routes, '/about')).toEqual(['/', '/about'])
  })

  it('prefers the static segment over the dynamic segment', () => {
    expect(patternsOf(routes, '/users/me')).toEqual(['/', '/users', '/users/me'])
  })

  it('falls back on the dynamic segment', () => {
    const matches = matchRoutes(routes, '/users/42')
    expect(matches?.map((match) => match.pattern)).toEqual(['/', '/users', '/users/:id'])
    expect(matches?.at(-1)?.params).toEqual({ id: '42' })
  })

  it('resolves the index route of a parent', () => {
    expect(patternsOf(routes, '/users')).toEqual(['/', '/users', '/users'])
  })

  it('resolves a nested catch-all', () => {
    const matches = matchRoutes(routes, '/docs/guide/intro')
    expect(matches?.at(-1)?.params).toEqual({ '*': 'guide/intro' })
  })

  it('falls back on the root catch-all for an unknown path', () => {
    const matches = matchRoutes(routes, '/inconnu/profond')
    expect(matches?.at(-1)?.pattern).toBe('/*')
    expect(matches?.at(-1)?.params).toEqual({ '*': 'inconnu/profond' })
  })

  it('returns null when no branch matches', () => {
    expect(matchRoutes([{ path: 'a' }], '/b')).toBeNull()
  })
})

describe('matchRoutes — parameters', () => {
  const routes: RouteObject[] = [
    {
      path: ':org',
      children: [{ path: ':repo', children: [{ path: 'issues/:number' }] }],
    },
  ]

  it('accumulates the parameters from the root down to the leaf', () => {
    const matches = matchRoutes(routes, '/odoro/libs/issues/7')
    expect(matches?.map((match) => match.params)).toEqual([
      { org: 'odoro' },
      { org: 'odoro', repo: 'libs' },
      { org: 'odoro', repo: 'libs', number: '7' },
    ])
  })

  it('exposes the consumed pathname at each level', () => {
    const matches = matchRoutes(routes, '/odoro/libs/issues/7')
    expect(matches?.map((match) => match.pathname)).toEqual([
      '/odoro',
      '/odoro/libs',
      '/odoro/libs/issues/7',
    ])
  })

  it('handles a missing optional segment in a nested branch', () => {
    const optional: RouteObject[] = [{ path: 'blog', children: [{ path: ':slug?' }] }]
    expect(matchRoutes(optional, '/blog')?.at(-1)?.params).toEqual({ slug: undefined })
    expect(matchRoutes(optional, '/blog/hello')?.at(-1)?.params).toEqual({
      slug: 'hello',
    })
  })
})

describe('matchRoutes — pathnameBase', () => {
  it('removes the catch-all portion from the pathname', () => {
    const routes: RouteObject[] = [{ path: 'docs', children: [{ path: '*' }] }]
    const leaf = matchRoutes(routes, '/docs/guide/intro')?.at(-1)
    expect(leaf?.pathname).toBe('/docs/guide/intro')
    expect(leaf?.pathnameBase).toBe('/docs')
  })

  it('equals the pathname when there is no catch-all', () => {
    const routes: RouteObject[] = [{ path: 'users/:id' }]
    const leaf = matchRoutes(routes, '/users/42')?.at(-1)
    expect(leaf?.pathnameBase).toBe('/users/42')
  })
})

describe('matchRoutes — priorities between competing branches', () => {
  it('prefers the index route over the sibling catch-all', () => {
    const routes: RouteObject[] = [
      { path: 'app', children: [{ path: '*' }, { index: true }] },
    ]
    expect(matchRoutes(routes, '/app')?.at(-1)?.route.index).toBe(true)
  })

  it('prefers a deep static branch over a short dynamic branch', () => {
    const routes: RouteObject[] = [
      { path: ':section', children: [{ path: ':page' }] },
      { path: 'docs', children: [{ path: 'intro' }] },
    ]
    expect(patternsOf(routes, '/docs/intro')).toEqual(['/docs', '/docs/intro'])
  })

  it('keeps the declaration order at equal specificity', () => {
    const routes: RouteObject[] = [{ path: ':a' }, { path: ':b' }]
    expect(matchRoutes(routes, '/x')?.at(-1)?.params).toEqual({ a: 'x' })
  })
})
