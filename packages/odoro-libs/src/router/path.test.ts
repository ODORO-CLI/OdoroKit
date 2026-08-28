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
  ])('normalise %j en %j', (input, expected) => {
    expect(normalizePathname(input)).toBe(expected)
  })
})

describe('joinPaths', () => {
  it('concatene des fragments', () => {
    expect(joinPaths('/app', 'users', ':id')).toBe('/app/users/:id')
  })

  it('ignore les fragments vides ou absents', () => {
    expect(joinPaths('/app', undefined, '', 'about')).toBe('/app/about')
  })

  it('retourne la racine si tout est vide', () => {
    expect(joinPaths('/', undefined)).toBe('/')
  })

  it('aplatit un slash initial du fragment enfant', () => {
    expect(joinPaths('/app', '/about')).toBe('/app/about')
  })
})

describe('parsePath', () => {
  it('separe pathname, search et hash', () => {
    expect(parsePath('/blog?page=2#top')).toEqual({
      pathname: '/blog',
      search: '?page=2',
      hash: '#top',
    })
  })

  it('gere un hash contenant un point d interrogation', () => {
    expect(parsePath('/blog#a?b')).toEqual({
      pathname: '/blog',
      search: '',
      hash: '#a?b',
    })
  })

  it('gere une entree vide', () => {
    expect(parsePath('')).toEqual({ pathname: '/', search: '', hash: '' })
  })

  it('ignore un search ou un hash vides', () => {
    expect(parsePath('/a?#')).toEqual({ pathname: '/a', search: '', hash: '' })
  })
})

describe('createPath', () => {
  it('recompose une URL complete', () => {
    expect(createPath({ pathname: '/blog', search: '?page=2', hash: '#top' })).toBe(
      '/blog?page=2#top',
    )
  })

  it('ajoute les prefixes manquants', () => {
    expect(createPath({ pathname: '/blog', search: 'page=2', hash: 'top' })).toBe(
      '/blog?page=2#top',
    )
  })

  it('omet les parties vides', () => {
    expect(createPath({ pathname: '/blog' })).toBe('/blog')
    expect(createPath({})).toBe('/')
  })

  it('fait l aller-retour avec parsePath', () => {
    const url = '/a/b?x=1#y'
    expect(createPath(parsePath(url))).toBe(url)
  })
})

describe('resolvePath', () => {
  it('retourne une cible absolue telle quelle', () => {
    expect(resolvePath('/about', '/users/42').pathname).toBe('/about')
  })

  it('resout une cible relative simple', () => {
    expect(resolvePath('settings', '/users/42').pathname).toBe('/users/42/settings')
  })

  it('resout un prefixe ./', () => {
    expect(resolvePath('./settings', '/users/42').pathname).toBe('/users/42/settings')
  })

  it('remonte avec ..', () => {
    expect(resolvePath('../settings', '/users/42/profile').pathname).toBe(
      '/users/42/settings',
    )
  })

  it('enchaine plusieurs ..', () => {
    expect(resolvePath('../../x', '/a/b/c').pathname).toBe('/a/x')
  })

  it('ne remonte pas au dela de la racine', () => {
    expect(resolvePath('../../../../x', '/a').pathname).toBe('/x')
  })

  it('conserve search et hash de la cible', () => {
    expect(resolvePath('../list?page=2#top', '/users/42')).toEqual({
      pathname: '/users/list',
      search: '?page=2',
      hash: '#top',
    })
  })

  it('utilise la racine par defaut', () => {
    expect(resolvePath('about').pathname).toBe('/about')
  })
})
