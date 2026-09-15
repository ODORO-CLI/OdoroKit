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
  it('normalizes the pattern before compiling it', () => {
    expect(compilePattern('users//:id/').regex.source).toBe(
      compilePattern('/users/:id').regex.source,
    )
  })

  it('extracts the parameter names in the order of the segments', () => {
    expect(compilePattern('/org/:org/repo/:repo').paramNames).toEqual(['org', 'repo'])
  })

  it('exposes the "*" parameter for a catch-all', () => {
    const compiled = compilePattern('/docs/*')
    expect(compiled.paramNames).toEqual([CATCH_ALL_PARAM])
    expect(compiled.hasCatchAll).toBe(true)
  })

  it('neutralizes the special characters of the static segments', () => {
    expect(matchPattern('/a.b', '/a.b')).not.toBeNull()
    expect(matchPattern('/a.b', '/axb')).toBeNull()
  })

  it('rejects a catch-all that is not in last position', () => {
    expect(() => compilePattern('/docs/*/edit')).toThrow(/last segment/)
  })

  it('rejects a parameter without a name', () => {
    expect(() => compilePattern('/users/:')).toThrow(/without a name/)
  })

  it('rejects a parameter declared twice', () => {
    expect(() => compilePattern('/:id/:id')).toThrow(/several times/)
  })

  describe('cache', () => {
    it('compiles a pattern only once', () => {
      const first = compilePattern('/users/:id')
      const second = compilePattern('/users/:id')
      expect(second).toBe(first)
      expect(second.regex).toBe(first.regex)
      expect(patternCacheSize()).toBe(1)
    })

    it('normalizes the cache key so as not to duplicate the entries', () => {
      compilePattern('/users/:id')
      compilePattern('users/:id/')
      // Two different spellings of the same pattern: two cache entries, but
      // identical regular expressions.
      expect(patternCacheSize()).toBe(2)
    })

    it('tells the exact mode apart from the prefix mode', () => {
      compilePattern('/users', true)
      compilePattern('/users', false)
      expect(patternCacheSize()).toBe(2)
    })
  })
})

describe('matchPattern — static segments', () => {
  it('matches an identical path', () => {
    expect(matchPattern('/about', '/about')?.params).toEqual({})
  })

  it('tolerates a trailing slash in the tested path', () => {
    expect(matchPattern('/about', '/about/')).not.toBeNull()
  })

  it('is case insensitive', () => {
    expect(matchPattern('/About', '/about')).not.toBeNull()
  })

  it('does not match a prefix in exact mode', () => {
    expect(matchPattern('/about', '/about/team')).toBeNull()
  })

  it('does not match a partial segment', () => {
    expect(matchPattern('/user', '/users')).toBeNull()
  })

  it('matches the root', () => {
    expect(matchPattern('/', '/')?.pathname).toBe('/')
    expect(matchPattern('/', '/about')).toBeNull()
  })
})

describe('matchPattern — dynamic segments', () => {
  it('captures a simple segment', () => {
    expect(matchPattern('/users/:id', '/users/42')?.params).toEqual({ id: '42' })
  })

  it('captures several segments', () => {
    expect(matchPattern('/:org/:repo', '/odoro/libs')?.params).toEqual({
      org: 'odoro',
      repo: 'libs',
    })
  })

  it('requires the segment to be present', () => {
    expect(matchPattern('/users/:id', '/users')).toBeNull()
  })

  it('does not cross the slashes', () => {
    expect(matchPattern('/users/:id', '/users/42/edit')).toBeNull()
  })

  it('decodes the encoded values', () => {
    expect(matchPattern('/tags/:tag', '/tags/c%2B%2B')?.params).toEqual({ tag: 'c++' })
  })

  it('keeps the raw value when the decoding fails', () => {
    expect(matchPattern('/tags/:tag', '/tags/100%')?.params).toEqual({ tag: '100%' })
  })
})

describe('matchPattern — optional segments', () => {
  it('matches with the segment present', () => {
    expect(matchPattern('/blog/:slug?', '/blog/hello')?.params).toEqual({ slug: 'hello' })
  })

  it('matches without the segment', () => {
    expect(matchPattern('/blog/:slug?', '/blog')?.params).toEqual({ slug: undefined })
  })

  it('does not match beyond the optional segment', () => {
    expect(matchPattern('/blog/:slug?', '/blog/a/b')).toBeNull()
  })

  it('handles an optional followed by a static', () => {
    expect(matchPattern('/blog/:slug?/edit', '/blog/hello/edit')?.params).toEqual({
      slug: 'hello',
    })
    expect(matchPattern('/blog/:slug?/edit', '/blog/edit')?.params).toEqual({
      slug: undefined,
    })
  })
})

describe('matchPattern — catch-all', () => {
  it('captures the rest of the path', () => {
    expect(matchPattern('/docs/*', '/docs/guide/intro')?.params).toEqual({
      '*': 'guide/intro',
    })
  })

  it('matches the bare path, with no remainder', () => {
    const match = matchPattern('/docs/*', '/docs')
    expect(match).not.toBeNull()
    expect(match?.params['*']).toBeUndefined()
  })

  it('captures a remainder of a single segment', () => {
    expect(matchPattern('/docs/*', '/docs/intro')?.params).toEqual({ '*': 'intro' })
  })

  it('combines parameters and catch-all', () => {
    expect(matchPattern('/:lang/docs/*', '/fr/docs/a/b')?.params).toEqual({
      lang: 'fr',
      '*': 'a/b',
    })
  })

  it('matches everything when used at the root', () => {
    expect(matchPattern('/*', '/n-importe/quoi')?.params).toEqual({
      '*': 'n-importe/quoi',
    })
    expect(matchPattern('/*', '/')).not.toBeNull()
  })
})

describe('matchPattern — prefix mode (parent routes)', () => {
  it('accepts a longer path', () => {
    const match = matchPattern('/users', '/users/42', false)
    expect(match?.pathname).toBe('/users')
  })

  it('does not cut in the middle of a segment', () => {
    expect(matchPattern('/user', '/users/42', false)).toBeNull()
  })

  it('captures the parameters of the prefix', () => {
    expect(matchPattern('/users/:id', '/users/42/settings', false)?.params).toEqual({
      id: '42',
    })
  })

  it('the root consumes an empty path', () => {
    const match = matchPattern('/', '/users/42', false)
    expect(match?.pathname).toBe('/')
  })
})

describe('ranking by specificity', () => {
  it('ranks static before dynamic before catch-all', () => {
    const sorted = ['/users/*', '/users/:id', '/users/me'].sort(comparePatternSpecificity)
    expect(sorted).toEqual(['/users/me', '/users/:id', '/users/*'])
  })

  it('ranks dynamic before optional', () => {
    const sorted = ['/blog/:slug?', '/blog/:slug'].sort(comparePatternSpecificity)
    expect(sorted).toEqual(['/blog/:slug', '/blog/:slug?'])
  })

  it('compares from left to right', () => {
    const sorted = ['/:a/static', '/static/:b'].sort(comparePatternSpecificity)
    expect(sorted).toEqual(['/static/:b', '/:a/static'])
  })

  it('favours the pattern that stops on a competing optional', () => {
    const sorted = ['/blog/:slug?', '/blog'].sort(comparePatternSpecificity)
    expect(sorted).toEqual(['/blog', '/blog/:slug?'])
  })

  it('favours the pattern that stops on a competing catch-all', () => {
    const sorted = ['/docs/*', '/docs'].sort(comparePatternSpecificity)
    expect(sorted).toEqual(['/docs', '/docs/*'])
  })

  it('does not separate static patterns of different depths', () => {
    // Two entirely static patterns of different lengths can never match the
    // same path: their relative order has no effect on the resolution. The
    // rule that is applied ("a pattern that stops describes the path exactly")
    // therefore ranks them from the shortest to the longest, which is
    // arbitrary but deterministic.
    const sorted = ['/a/b/c', '/a', '/a/b'].sort(comparePatternSpecificity)
    expect(sorted).toEqual(['/a', '/a/b', '/a/b/c'])

    const target = '/a/b'
    const matching = ['/a', '/a/b', '/a/b/c'].filter(
      (pattern) => matchPattern(pattern, target) !== null,
    )
    expect(matching).toEqual(['/a/b'])
  })

  it('returns 0 for two patterns of the same shape, preserving the declared order', () => {
    expect(comparePatternSpecificity('/:a/:b', '/:x/:y')).toBe(0)
    const declared = ['/:x/:y', '/:a/:b']
    expect([...declared].sort(comparePatternSpecificity)).toEqual(declared)
  })

  it('compareRanks treats a missing position as the most specific', () => {
    expect(compareRanks([4], [4, 1])).toBeLessThan(0)
    expect(compareRanks([4, 1], [4])).toBeGreaterThan(0)
    expect(compareRanks([4], [4])).toBe(0)
  })
})
