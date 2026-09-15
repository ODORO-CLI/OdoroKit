import { afterEach, describe, expect, it, vi } from 'vitest'

import { registry } from './registry.js'

afterEach(() => {
  registry.disposeAll()
})

describe('registration', () => {
  it('counts the live resources', () => {
    expect(registry.count()).toBe(0)

    registry.register({ kind: 'surface', name: 'aurora', dispose: vi.fn() })
    registry.register({ kind: 'timeline', name: 'hero', dispose: vi.fn() })

    expect(registry.count()).toBe(2)
    expect(registry.count('surface')).toBe(1)
    expect(registry.count('timeline')).toBe(1)
    expect(registry.count('scroll-trigger')).toBe(0)
  })

  it('assigns a distinct identifier to each resource', () => {
    const first = registry.register({ kind: 'surface', name: 'a', dispose: vi.fn() })
    const second = registry.register({ kind: 'surface', name: 'b', dispose: vi.fn() })
    expect(first.id).not.toBe(second.id)
  })

  it('lists the resources from the oldest to the most recent', () => {
    registry.register({ kind: 'timeline', name: 'first', dispose: vi.fn() })
    registry.register({ kind: 'timeline', name: 'second', dispose: vi.fn() })

    expect(registry.list().map((entry) => entry.name)).toEqual(['first', 'second'])
  })

  it('filters the list by nature', () => {
    registry.register({ kind: 'surface', name: 'aurora', dispose: vi.fn() })
    registry.register({ kind: 'timeline', name: 'hero', dispose: vi.fn() })

    expect(registry.list('surface').map((entry) => entry.name)).toEqual(['aurora'])
  })

  it('carries the diagnostics information', () => {
    registry.register({
      kind: 'surface',
      name: 'aurora',
      dispose: vi.fn(),
      detail: { backend: 'ogl' },
    })

    expect(registry.list()[0]?.detail).toEqual({ backend: 'ogl' })
  })

  it('updates the information during its lifetime', () => {
    const handle = registry.register({
      kind: 'surface',
      name: 'aurora',
      dispose: vi.fn(),
    })
    handle.update({ triangles: 1200 })
    expect(registry.list()[0]?.detail).toEqual({ triangles: 1200 })
  })
})

describe('removal', () => {
  it('removes the resource without releasing it', () => {
    // This is the normal path: a resource that releases itself simply reports
    // that it is no longer to be tracked.
    const dispose = vi.fn()
    const handle = registry.register({ kind: 'surface', name: 'aurora', dispose })

    handle.release()

    expect(registry.count()).toBe(0)
    expect(dispose).not.toHaveBeenCalled()
  })

  it('tolerates a repeated removal', () => {
    const handle = registry.register({
      kind: 'surface',
      name: 'aurora',
      dispose: vi.fn(),
    })
    handle.release()
    expect(() => handle.release()).not.toThrow()
  })

  it('ignores an update after removal', () => {
    const handle = registry.register({
      kind: 'surface',
      name: 'aurora',
      dispose: vi.fn(),
    })
    handle.release()
    expect(() => handle.update({ a: 1 })).not.toThrow()
  })
})

describe('bulk release', () => {
  it('releases every resource and returns the count', () => {
    const first = vi.fn()
    const second = vi.fn()
    registry.register({ kind: 'surface', name: 'a', dispose: first })
    registry.register({ kind: 'timeline', name: 'b', dispose: second })

    expect(registry.disposeAll()).toBe(2)
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
    expect(registry.count()).toBe(0)
  })

  it('releases a single nature', () => {
    const surface = vi.fn()
    const timeline = vi.fn()
    registry.register({ kind: 'surface', name: 'a', dispose: surface })
    registry.register({ kind: 'timeline', name: 'b', dispose: timeline })

    expect(registry.disposeAll('surface')).toBe(1)
    expect(surface).toHaveBeenCalled()
    expect(timeline).not.toHaveBeenCalled()
    expect(registry.count()).toBe(1)
  })

  it('carries on despite a release that fails', () => {
    // The goal is to let everything go, not to stop at the first problem: a
    // resource left hanging is precisely what we are trying to avoid.
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const next = vi.fn()

    registry.register({
      kind: 'surface',
      name: 'faulty',
      dispose: () => {
        throw new Error('release impossible')
      },
    })
    registry.register({ kind: 'surface', name: 'healthy', dispose: next })

    expect(registry.disposeAll()).toBe(2)
    expect(next).toHaveBeenCalled()
    expect(error).toHaveBeenCalled()
    expect(registry.count()).toBe(0)
  })
})

describe('leak detection', () => {
  it('comes back to zero after a hundred cycles', () => {
    // This is the shape every component leak test will take: an inventory that
    // does not come back to zero is a leak, and nothing else.
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
