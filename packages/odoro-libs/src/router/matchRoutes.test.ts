import { describe, expect, it } from 'vitest'

import { flattenRoutes, matchRoutes } from './matchRoutes.js'
import type { RouteObject } from './types.js'

/** Raccourci de lecture : la suite des patterns traverses. */
function patternsOf(routes: readonly RouteObject[], pathname: string): string[] | null {
  const matches = matchRoutes(routes, pathname)
  return matches?.map((match) => match.pattern) ?? null
}

describe('flattenRoutes', () => {
  it('aplatit un arbre en branches completes', () => {
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

  it('classe les branches par specificite decroissante', () => {
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

  it('memorise le resultat par identite du tableau de routes', () => {
    const routes: RouteObject[] = [{ path: 'a' }]
    expect(flattenRoutes(routes)).toBe(flattenRoutes(routes))
  })

  it('ne produit pas de branche pour une route parente sans feuille', () => {
    const routes: RouteObject[] = [{ path: 'layout', children: [{ path: 'a' }] }]
    expect(flattenRoutes(routes).map((branch) => branch.pattern)).toEqual(['/layout/a'])
  })

  it('traverse une route sans chemin comme un layout transparent', () => {
    const routes: RouteObject[] = [{ children: [{ path: 'a' }, { path: 'b' }] }]
    expect(flattenRoutes(routes).map((branch) => branch.pattern)).toEqual(['/a', '/b'])
  })

  it('refuse une route index avec un chemin', () => {
    expect(() => flattenRoutes([{ index: true, path: 'a' }])).toThrow(/route index/)
  })

  it('refuse une route index avec des enfants', () => {
    expect(() => flattenRoutes([{ index: true, children: [] }])).toThrow(/route index/)
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

  it('resout la route index de la racine', () => {
    expect(patternsOf(routes, '/')).toEqual(['/', '/'])
  })

  it('resout une route statique', () => {
    expect(patternsOf(routes, '/about')).toEqual(['/', '/about'])
  })

  it('prefere le segment statique au segment dynamique', () => {
    expect(patternsOf(routes, '/users/me')).toEqual(['/', '/users', '/users/me'])
  })

  it('retombe sur le segment dynamique', () => {
    const matches = matchRoutes(routes, '/users/42')
    expect(matches?.map((match) => match.pattern)).toEqual(['/', '/users', '/users/:id'])
    expect(matches?.at(-1)?.params).toEqual({ id: '42' })
  })

  it('resout la route index d un parent', () => {
    expect(patternsOf(routes, '/users')).toEqual(['/', '/users', '/users'])
  })

  it('resout un catch-all imbrique', () => {
    const matches = matchRoutes(routes, '/docs/guide/intro')
    expect(matches?.at(-1)?.params).toEqual({ '*': 'guide/intro' })
  })

  it('retombe sur le catch-all racine pour un chemin inconnu', () => {
    const matches = matchRoutes(routes, '/inconnu/profond')
    expect(matches?.at(-1)?.pattern).toBe('/*')
    expect(matches?.at(-1)?.params).toEqual({ '*': 'inconnu/profond' })
  })

  it('retourne null si aucune branche ne correspond', () => {
    expect(matchRoutes([{ path: 'a' }], '/b')).toBeNull()
  })
})

describe('matchRoutes — parametres', () => {
  const routes: RouteObject[] = [
    {
      path: ':org',
      children: [{ path: ':repo', children: [{ path: 'issues/:number' }] }],
    },
  ]

  it('accumule les parametres de la racine vers la feuille', () => {
    const matches = matchRoutes(routes, '/odoro/libs/issues/7')
    expect(matches?.map((match) => match.params)).toEqual([
      { org: 'odoro' },
      { org: 'odoro', repo: 'libs' },
      { org: 'odoro', repo: 'libs', number: '7' },
    ])
  })

  it('expose le pathname consomme a chaque niveau', () => {
    const matches = matchRoutes(routes, '/odoro/libs/issues/7')
    expect(matches?.map((match) => match.pathname)).toEqual([
      '/odoro',
      '/odoro/libs',
      '/odoro/libs/issues/7',
    ])
  })

  it('gere un segment optionnel absent dans une branche imbriquee', () => {
    const optional: RouteObject[] = [{ path: 'blog', children: [{ path: ':slug?' }] }]
    expect(matchRoutes(optional, '/blog')?.at(-1)?.params).toEqual({ slug: undefined })
    expect(matchRoutes(optional, '/blog/hello')?.at(-1)?.params).toEqual({
      slug: 'hello',
    })
  })
})

describe('matchRoutes — pathnameBase', () => {
  it('retire la portion catch-all du pathname', () => {
    const routes: RouteObject[] = [{ path: 'docs', children: [{ path: '*' }] }]
    const leaf = matchRoutes(routes, '/docs/guide/intro')?.at(-1)
    expect(leaf?.pathname).toBe('/docs/guide/intro')
    expect(leaf?.pathnameBase).toBe('/docs')
  })

  it('vaut le pathname quand il n y a pas de catch-all', () => {
    const routes: RouteObject[] = [{ path: 'users/:id' }]
    const leaf = matchRoutes(routes, '/users/42')?.at(-1)
    expect(leaf?.pathnameBase).toBe('/users/42')
  })
})

describe('matchRoutes — priorites entre branches concurrentes', () => {
  it('prefere la route index au catch-all frere', () => {
    const routes: RouteObject[] = [
      { path: 'app', children: [{ path: '*' }, { index: true }] },
    ]
    expect(matchRoutes(routes, '/app')?.at(-1)?.route.index).toBe(true)
  })

  it('prefere une branche profonde statique a une branche dynamique courte', () => {
    const routes: RouteObject[] = [
      { path: ':section', children: [{ path: ':page' }] },
      { path: 'docs', children: [{ path: 'intro' }] },
    ]
    expect(patternsOf(routes, '/docs/intro')).toEqual(['/docs', '/docs/intro'])
  })

  it('conserve l ordre de declaration a specificite egale', () => {
    const routes: RouteObject[] = [{ path: ':a' }, { path: ':b' }]
    expect(matchRoutes(routes, '/x')?.at(-1)?.params).toEqual({ a: 'x' })
  })
})
