import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { motionPolicy } from './motion-policy.js'

/** Forces the system answer for `prefers-reduced-motion`. */
function setSystemReduced(reduced: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}

beforeEach(() => {
  setSystemReduced(false)
})

afterEach(() => {
  motionPolicy.dispose()
})

describe('system preference', () => {
  it('respects the preference by default', () => {
    setSystemReduced(true)
    motionPolicy.configure({})
    expect(motionPolicy.state.reduced).toBe(true)
  })

  it('reports nothing reduced when the system asks for nothing', () => {
    motionPolicy.configure({})
    expect(motionPolicy.state.reduced).toBe(false)
  })

  it('neutralises in every circumstance with force', () => {
    motionPolicy.configure({ reducedMotion: 'force' })
    expect(motionPolicy.state.reduced).toBe(true)
  })

  it('overrides the preference with ignore', () => {
    setSystemReduced(true)
    motionPolicy.configure({ reducedMotion: 'ignore' })
    expect(motionPolicy.state.reduced).toBe(false)
  })

  it('brings the quality down to the lowest when motion is reduced', () => {
    // The animation is neutralised; it would be absurd to keep rendering at
    // the most expensive level of detail.
    motionPolicy.configure({ quality: 'high', reducedMotion: 'force' })
    expect(motionPolicy.state.quality).toBe('low')
  })
})

describe('forced quality', () => {
  it('keeps the requested level', () => {
    motionPolicy.configure({ quality: 'low' })
    expect(motionPolicy.state.quality).toBe('low')
    expect(motionPolicy.state.reason).toBe('forced quality')

    motionPolicy.configure({ quality: 'high' })
    expect(motionPolicy.state.quality).toBe('high')
  })

  it('starts from the highest level in automatic mode', () => {
    motionPolicy.configure({ quality: 'auto' })
    expect(motionPolicy.state.quality).toBe('high')
  })
})

describe('snapshot', () => {
  it('keeps the same reference as long as nothing changes', () => {
    // `useSyncExternalStore` compares snapshots by identity: rebuilding one on
    // every read would cause a render loop.
    motionPolicy.configure({})
    expect(motionPolicy.state).toBe(motionPolicy.state)
  })

  it('changes reference on a real change', () => {
    motionPolicy.configure({ quality: 'high' })
    const before = motionPolicy.state
    motionPolicy.configure({ quality: 'low' })
    expect(motionPolicy.state).not.toBe(before)
  })
})

describe('subscription', () => {
  it('notifies on a state change', () => {
    const listener = vi.fn()
    motionPolicy.configure({ quality: 'high' })
    motionPolicy.subscribe(listener)

    motionPolicy.configure({ quality: 'low' })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0]?.[0]).toMatchObject({ quality: 'low' })
  })

  it('does not notify when nothing changes', () => {
    const listener = vi.fn()
    motionPolicy.configure({ quality: 'low' })
    motionPolicy.subscribe(listener)

    motionPolicy.configure({ quality: 'low' })

    expect(listener).not.toHaveBeenCalled()
  })

  it('stops notifying after unsubscribing', () => {
    const listener = vi.fn()
    motionPolicy.configure({ quality: 'high' })
    const unsubscribe = motionPolicy.subscribe(listener)

    unsubscribe()
    motionPolicy.configure({ quality: 'low' })

    expect(listener).not.toHaveBeenCalled()
  })
})

describe('tab visibility', () => {
  it('follows the state of the document', () => {
    motionPolicy.configure({})
    expect(motionPolicy.state.visible).toBe(true)

    const listener = vi.fn()
    motionPolicy.subscribe(listener)

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(motionPolicy.state.visible).toBe(false)
    expect(listener).toHaveBeenCalled()

    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(motionPolicy.state.visible).toBe(true)
  })
})

describe('release', () => {
  it('returns to the initial settings', () => {
    motionPolicy.configure({ quality: 'low', reducedMotion: 'force' })
    motionPolicy.dispose()

    expect(motionPolicy.state.reduced).toBe(false)
    expect(motionPolicy.state.quality).toBe('high')
  })

  it('removes the listeners', () => {
    const listener = vi.fn()
    motionPolicy.configure({})
    motionPolicy.subscribe(listener)

    motionPolicy.dispose()
    motionPolicy.configure({ quality: 'low' })

    expect(listener).not.toHaveBeenCalled()
  })
})
