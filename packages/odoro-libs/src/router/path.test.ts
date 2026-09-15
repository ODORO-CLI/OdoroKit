import { describe, expect, it } from 'vitest'

import {
  createPath,
  joinPaths,
  normalizePathname,
  parsePath,
  resolvePath,
} from './path.js'

describe('normalizePathname', () => {
  it.each([
    ['', '/'],
    ['/', '/'],
    ['users', '/users'],
    ['/users/', '/users'],
    ['//users//42//', '/users/42'],
  ])('normalizes %j into %j', (input, expected) => {
    expect(normalizePathname(input)).toBe(expected)
  })
})

describe('joinPaths', () => {
  it('concatenates fragments', () => {
    expect(joinPaths('/app', 'users', ':id')).toBe('/app/users/:id')
  })

  it('ignores empty or missing fragments', () => {
    expect(joinPaths('/app', undefined, '', 'about')).toBe('/app/about')
  })

  it('returns the root when everything is empty', () => {
    expect(joinPaths('/', undefined)).toBe('/')
  })

  it('flattens a leading slash of the child fragment', () => {
    expect(joinPaths('/app', '/about')).toBe('/app/about')
  })
})

describe('parsePath', () => {
  it('separates pathname, search and hash', () => {
    expect(parsePath('/blog?page=2#top')).toEqual({
      pathname: '/blog',
      search: '?page=2',
      hash: '#top',
    })
  })

  it('handles a hash holding a question mark', () => {
    expect(parsePath('/blog#a?b')).toEqual({
      pathname: '/blog',
      search: '',
      hash: '#a?b',
    })
  })

  it('handles an empty input', () => {
    expect(parsePath('')).toEqual({ pathname: '/', search: '', hash: '' })
  })

  it('ignores an empty search or hash', () => {
    expect(parsePath('/a?#')).toEqual({ pathname: '/a', search: '', hash: '' })
  })
})

describe('createPath', () => {
  it('rebuilds a complete URL', () => {
    expect(createPath({ pathname: '/blog', search: '?page=2', hash: '#top' })).toBe(
      '/blog?page=2#top',
    )
  })

  it('adds the missing prefixes', () => {
    expect(createPath({ pathname: '/blog', search: 'page=2', hash: 'top' })).toBe(
      '/blog?page=2#top',
    )
  })

  it('omits the empty parts', () => {
    expect(createPath({ pathname: '/blog' })).toBe('/blog')
    expect(createPath({})).toBe('/')
  })

  it('round-trips with parsePath', () => {
    const url = '/a/b?x=1#y'
    expect(createPath(parsePath(url))).toBe(url)
  })
})

describe('resolvePath', () => {
  it('returns an absolute target as is', () => {
    expect(resolvePath('/about', '/users/42').pathname).toBe('/about')
  })

  it('resolves a simple relative target', () => {
    expect(resolvePath('settings', '/users/42').pathname).toBe('/users/42/settings')
  })

  it('resolves a ./ prefix', () => {
    expect(resolvePath('./settings', '/users/42').pathname).toBe('/users/42/settings')
  })

  it('goes up with ..', () => {
    expect(resolvePath('../settings', '/users/42/profile').pathname).toBe(
      '/users/42/settings',
    )
  })

  it('chains several ..', () => {
    expect(resolvePath('../../x', '/a/b/c').pathname).toBe('/a/x')
  })

  it('does not go up beyond the root', () => {
    expect(resolvePath('../../../../x', '/a').pathname).toBe('/x')
  })

  it('keeps the search and the hash of the target', () => {
    expect(resolvePath('../list?page=2#top', '/users/42')).toEqual({
      pathname: '/users/list',
      search: '?page=2',
      hash: '#top',
    })
  })

  it('uses the root by default', () => {
    expect(resolvePath('about').pathname).toBe('/about')
  })
})
