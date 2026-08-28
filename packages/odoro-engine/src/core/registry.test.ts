import { afterEach, describe, expect, it, vi } from 'vitest'

import { registry } from './registry.js'

afterEach(() => {
  registry.disposeAll()
})

describe('enregistrement', () => {
  it('compte les ressources vivantes', () => {
    expect(registry.count()).toBe(0)

    registry.register({ kind: 'surface', name: 'aurora', dispose: vi.fn() })
    registry.register({ kind: 'timeline', name: 'hero', dispose: vi.fn() })

    expect(registry.count()).toBe(2)
    expect(registry.count('surface')).toBe(1)
    expect(registry.count('timeline')).toBe(1)
    expect(registry.count('scroll-trigger')).toBe(0)
  })

  it('attribue un identifiant distinct a chaque ressource', () => {
    const first = registry.register({ kind: 'surface', name: 'a', dispose: vi.fn() })
    const second = registry.register({ kind: 'surface', name: 'b', dispose: vi.fn() })
    expect(first.id).not.toBe(second.id)
  })

  it('liste les ressources de la plus ancienne a la plus recente', () => {
    registry.register({ kind: 'timeline', name: 'premiere', dispose: vi.fn() })
    registry.register({ kind: 'timeline', name: 'seconde', dispose: vi.fn() })

    expect(registry.list().map((entry) => entry.name)).toEqual(['premiere', 'seconde'])
  })

  it('filtre la liste par nature', () => {
    registry.register({ kind: 'surface', name: 'aurora', dispose: vi.fn() })
    registry.register({ kind: 'timeline', name: 'hero', dispose: vi.fn() })

    expect(registry.list('surface').map((entry) => entry.name)).toEqual(['aurora'])
  })

  it('porte les informations de diagnostic', () => {
    registry.register({
      kind: 'surface',
      name: 'aurora',
      dispose: vi.fn(),
      detail: { backend: 'ogl' },
    })

    expect(registry.list()[0]?.detail).toEqual({ backend: 'ogl' })
  })

  it('met a jour les informations en cours de vie', () => {
    const handle = registry.register({
      kind: 'surface',
      name: 'aurora',
      dispose: vi.fn(),
    })
    handle.update({ triangles: 1200 })
    expect(registry.list()[0]?.detail).toEqual({ triangles: 1200 })
  })
})

describe('retrait', () => {
  it('retire la ressource sans la liberer', () => {
    // C'est la voie normale : une ressource qui se libere elle-meme signale
    // simplement qu'elle n'est plus a suivre.
    const dispose = vi.fn()
    const handle = registry.register({ kind: 'surface', name: 'aurora', dispose })

    handle.release()

    expect(registry.count()).toBe(0)
    expect(dispose).not.toHaveBeenCalled()
  })

  it('tolere un retrait repete', () => {
    const handle = registry.register({
      kind: 'surface',
      name: 'aurora',
      dispose: vi.fn(),
    })
    handle.release()
    expect(() => handle.release()).not.toThrow()
  })

  it('ignore une mise a jour apres retrait', () => {
    const handle = registry.register({
      kind: 'surface',
      name: 'aurora',
      dispose: vi.fn(),
    })
    handle.release()
    expect(() => handle.update({ a: 1 })).not.toThrow()
  })
})

describe('liberation en masse', () => {
  it('libere toutes les ressources et rend le compte', () => {
    const first = vi.fn()
    const second = vi.fn()
    registry.register({ kind: 'surface', name: 'a', dispose: first })
    registry.register({ kind: 'timeline', name: 'b', dispose: second })

    expect(registry.disposeAll()).toBe(2)
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
    expect(registry.count()).toBe(0)
  })

  it('libere une seule nature', () => {
    const surface = vi.fn()
    const timeline = vi.fn()
    registry.register({ kind: 'surface', name: 'a', dispose: surface })
    registry.register({ kind: 'timeline', name: 'b', dispose: timeline })

    expect(registry.disposeAll('surface')).toBe(1)
    expect(surface).toHaveBeenCalled()
    expect(timeline).not.toHaveBeenCalled()
    expect(registry.count()).toBe(1)
  })

  it('poursuit malgre une liberation qui echoue', () => {
    // Le but est de tout relacher, pas de s'arreter au premier probleme : une
    // ressource restee accrochee est precisement ce qu'on cherche a eviter.
    const erreur = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const suivant = vi.fn()

    registry.register({
      kind: 'surface',
      name: 'fautive',
      dispose: () => {
        throw new Error('liberation impossible')
      },
    })
    registry.register({ kind: 'surface', name: 'saine', dispose: suivant })

    expect(registry.disposeAll()).toBe(2)
    expect(suivant).toHaveBeenCalled()
    expect(erreur).toHaveBeenCalled()
    expect(registry.count()).toBe(0)
  })
})

describe('detection de fuite', () => {
  it('revient a zero apres cent cycles', () => {
    // C'est la forme que prendra chaque test de fuite de composant : un
    // inventaire qui ne revient pas a zero est une fuite, et rien d'autre.
    for (let i = 0; i < 100; i += 1) {
      const handle = registry.register({
        kind: 'surface',
        name: `cycle-${i}`,
        dispose: vi.fn(),
      })
      handle.release()
    }

    expect(registry.count()).toBe(0)
  })
})
