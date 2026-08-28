import { beforeEach, describe, expect, it } from 'vitest'

import {
  CATCH_ALL_PARAM,
  clearPatternCache,
  compilePattern,
  comparePatternSpecificity,
  compareRanks,
  matchPattern,
  patternCacheSize,
} from './matcher.js'

beforeEach(() => {
  clearPatternCache()
})

describe('compilePattern', () => {
  it('normalise le pattern avant compilation', () => {
    expect(compilePattern('users//:id/').regex.source).toBe(
      compilePattern('/users/:id').regex.source,
    )
  })

  it('extrait les noms de parametres dans l ordre des segments', () => {
    expect(compilePattern('/org/:org/repo/:repo').paramNames).toEqual(['org', 'repo'])
  })

  it('expose le parametre "*" pour un catch-all', () => {
    const compiled = compilePattern('/docs/*')
    expect(compiled.paramNames).toEqual([CATCH_ALL_PARAM])
    expect(compiled.hasCatchAll).toBe(true)
  })

  it('neutralise les caracteres speciaux des segments statiques', () => {
    expect(matchPattern('/a.b', '/a.b')).not.toBeNull()
    expect(matchPattern('/a.b', '/axb')).toBeNull()
  })

  it('refuse un catch-all qui n est pas en derniere position', () => {
    expect(() => compilePattern('/docs/*/edit')).toThrow(/dernier segment/)
  })

  it('refuse un parametre sans nom', () => {
    expect(() => compilePattern('/users/:')).toThrow(/sans nom/)
  })

  it('refuse un parametre declare deux fois', () => {
    expect(() => compilePattern('/:id/:id')).toThrow(/plusieurs fois/)
  })

  describe('cache', () => {
    it('ne compile un pattern qu une seule fois', () => {
      const first = compilePattern('/users/:id')
      const second = compilePattern('/users/:id')
      expect(second).toBe(first)
      expect(second.regex).toBe(first.regex)
      expect(patternCacheSize()).toBe(1)
    })

    it('normalise la cle du cache pour ne pas dupliquer les entrees', () => {
      compilePattern('/users/:id')
      compilePattern('users/:id/')
      // Deux ecritures differentes du meme pattern : deux entrees de cache,
      // mais des expressions regulieres identiques.
      expect(patternCacheSize()).toBe(2)
    })

    it('distingue le mode exact du mode prefixe', () => {
      compilePattern('/users', true)
      compilePattern('/users', false)
      expect(patternCacheSize()).toBe(2)
    })
  })
})

describe('matchPattern — segments statiques', () => {
  it('matche un chemin identique', () => {
    expect(matchPattern('/about', '/about')?.params).toEqual({})
  })

  it('tolere un slash final dans le chemin teste', () => {
    expect(matchPattern('/about', '/about/')).not.toBeNull()
  })

  it('est insensible a la casse', () => {
    expect(matchPattern('/About', '/about')).not.toBeNull()
  })

  it('ne matche pas un prefixe en mode exact', () => {
    expect(matchPattern('/about', '/about/team')).toBeNull()
  })

  it('ne matche pas un segment partiel', () => {
    expect(matchPattern('/user', '/users')).toBeNull()
  })

  it('matche la racine', () => {
    expect(matchPattern('/', '/')?.pathname).toBe('/')
    expect(matchPattern('/', '/about')).toBeNull()
  })
})

describe('matchPattern — segments dynamiques', () => {
  it('capture un segment simple', () => {
    expect(matchPattern('/users/:id', '/users/42')?.params).toEqual({ id: '42' })
  })

  it('capture plusieurs segments', () => {
    expect(matchPattern('/:org/:repo', '/odoro/libs')?.params).toEqual({
      org: 'odoro',
      repo: 'libs',
    })
  })

  it('exige la presence du segment', () => {
    expect(matchPattern('/users/:id', '/users')).toBeNull()
  })

  it('ne traverse pas les slashs', () => {
    expect(matchPattern('/users/:id', '/users/42/edit')).toBeNull()
  })

  it('decode les valeurs encodees', () => {
    expect(matchPattern('/tags/:tag', '/tags/c%2B%2B')?.params).toEqual({ tag: 'c++' })
  })

  it('conserve la valeur brute si le decodage echoue', () => {
    expect(matchPattern('/tags/:tag', '/tags/100%')?.params).toEqual({ tag: '100%' })
  })
})

describe('matchPattern — segments optionnels', () => {
  it('matche avec le segment present', () => {
    expect(matchPattern('/blog/:slug?', '/blog/hello')?.params).toEqual({ slug: 'hello' })
  })

  it('matche sans le segment', () => {
    expect(matchPattern('/blog/:slug?', '/blog')?.params).toEqual({ slug: undefined })
  })

  it('ne matche pas au dela du segment optionnel', () => {
    expect(matchPattern('/blog/:slug?', '/blog/a/b')).toBeNull()
  })

  it('gere un optionnel suivi d un statique', () => {
    expect(matchPattern('/blog/:slug?/edit', '/blog/hello/edit')?.params).toEqual({
      slug: 'hello',
    })
    expect(matchPattern('/blog/:slug?/edit', '/blog/edit')?.params).toEqual({
      slug: undefined,
    })
  })
})

describe('matchPattern — catch-all', () => {
  it('capture le reste du chemin', () => {
    expect(matchPattern('/docs/*', '/docs/guide/intro')?.params).toEqual({
      '*': 'guide/intro',
    })
  })

  it('matche le chemin nu, sans suite', () => {
    const match = matchPattern('/docs/*', '/docs')
    expect(match).not.toBeNull()
    expect(match?.params['*']).toBeUndefined()
  })

  it('capture une suite d un seul segment', () => {
    expect(matchPattern('/docs/*', '/docs/intro')?.params).toEqual({ '*': 'intro' })
  })

  it('combine parametres et catch-all', () => {
    expect(matchPattern('/:lang/docs/*', '/fr/docs/a/b')?.params).toEqual({
      lang: 'fr',
      '*': 'a/b',
    })
  })

  it('utilise en racine, matche tout', () => {
    expect(matchPattern('/*', '/n-importe/quoi')?.params).toEqual({
      '*': 'n-importe/quoi',
    })
    expect(matchPattern('/*', '/')).not.toBeNull()
  })
})

describe('matchPattern — mode prefixe (routes parentes)', () => {
  it('accepte un chemin plus long', () => {
    const match = matchPattern('/users', '/users/42', false)
    expect(match?.pathname).toBe('/users')
  })

  it('ne coupe pas au milieu d un segment', () => {
    expect(matchPattern('/user', '/users/42', false)).toBeNull()
  })

  it('capture les parametres du prefixe', () => {
    expect(matchPattern('/users/:id', '/users/42/settings', false)?.params).toEqual({
      id: '42',
    })
  })

  it('la racine consomme un chemin vide', () => {
    const match = matchPattern('/', '/users/42', false)
    expect(match?.pathname).toBe('/')
  })
})

describe('classement par specificite', () => {
  it('classe statique avant dynamique avant catch-all', () => {
    const sorted = ['/users/*', '/users/:id', '/users/me'].sort(comparePatternSpecificity)
    expect(sorted).toEqual(['/users/me', '/users/:id', '/users/*'])
  })

  it('classe dynamique avant optionnel', () => {
    const sorted = ['/blog/:slug?', '/blog/:slug'].sort(comparePatternSpecificity)
    expect(sorted).toEqual(['/blog/:slug', '/blog/:slug?'])
  })

  it('compare de gauche a droite', () => {
    const sorted = ['/:a/static', '/static/:b'].sort(comparePatternSpecificity)
    expect(sorted).toEqual(['/static/:b', '/:a/static'])
  })

  it('privilegie le pattern qui s arrete sur un optionnel concurrent', () => {
    const sorted = ['/blog/:slug?', '/blog'].sort(comparePatternSpecificity)
    expect(sorted).toEqual(['/blog', '/blog/:slug?'])
  })

  it('privilegie le pattern qui s arrete sur un catch-all concurrent', () => {
    const sorted = ['/docs/*', '/docs'].sort(comparePatternSpecificity)
    expect(sorted).toEqual(['/docs', '/docs/*'])
  })

  it('ne departage pas des patterns statiques de profondeurs differentes', () => {
    // Deux patterns entierement statiques de longueurs differentes ne peuvent
    // jamais matcher le meme chemin : leur ordre relatif est sans effet sur la
    // resolution. La regle appliquee ("un pattern qui s arrete decrit le
    // chemin exactement") les classe donc du plus court au plus long, ce qui
    // est arbitraire mais deterministe.
    const sorted = ['/a/b/c', '/a', '/a/b'].sort(comparePatternSpecificity)
    expect(sorted).toEqual(['/a', '/a/b', '/a/b/c'])

    const target = '/a/b'
    const matching = ['/a', '/a/b', '/a/b/c'].filter(
      (pattern) => matchPattern(pattern, target) !== null,
    )
    expect(matching).toEqual(['/a/b'])
  })

  it('retourne 0 pour deux patterns de meme forme, preservant l ordre declare', () => {
    expect(comparePatternSpecificity('/:a/:b', '/:x/:y')).toBe(0)
    const declared = ['/:x/:y', '/:a/:b']
    expect([...declared].sort(comparePatternSpecificity)).toEqual(declared)
  })

  it('compareRanks traite une position absente comme la plus specifique', () => {
    expect(compareRanks([4], [4, 1])).toBeLessThan(0)
    expect(compareRanks([4, 1], [4])).toBeGreaterThan(0)
    expect(compareRanks([4], [4])).toBe(0)
  })
})
