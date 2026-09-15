import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  prefersReducedMotion,
  runViewTransition,
  supportsViewTransitions,
} from './viewTransition.js'

/** Installs a fake implementation of the View Transitions API. */
function stubViewTransition(): {
  start: ReturnType<typeof vi.fn>
  finished: Promise<void>
} {
  const finished = Promise.resolve()
  const start = vi.fn((callback: () => void) => {
    callback()
    return { finished }
  })
  Object.defineProperty(document, 'startViewTransition', {
    value: start,
    configurable: true,
    writable: true,
  })
  return { start, finished }
}

/** Forces the answer of `matchMedia` for `prefers-reduced-motion`. */
function stubReducedMotion(matches: boolean): void {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList)
}

afterEach(() => {
  Reflect.deleteProperty(document, 'startViewTransition')
})

describe('supportsViewTransitions', () => {
  it('returns false when the API is missing', () => {
    expect(supportsViewTransitions()).toBe(false)
  })

  it('returns true when the API is present', () => {
    stubViewTransition()
    expect(supportsViewTransitions()).toBe(true)
  })
})

describe('prefersReducedMotion', () => {
  it('reflects the media query', () => {
    stubReducedMotion(true)
    expect(prefersReducedMotion()).toBe(true)
    stubReducedMotion(false)
    expect(prefersReducedMotion()).toBe(false)
  })
})

describe('runViewTransition', () => {
  it('runs the commit directly when the API is missing', () => {
    const commit = vi.fn()
    runViewTransition(commit)
    expect(commit).toHaveBeenCalledTimes(1)
  })

  it('goes through the API when it is available', () => {
    const { start } = stubViewTransition()
    stubReducedMotion(false)
    const commit = vi.fn()

    runViewTransition(commit)

    expect(start).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledTimes(1)
  })

  it('bypasses the API when the animations are reduced', () => {
    const { start } = stubViewTransition()
    stubReducedMotion(true)
    const commit = vi.fn()

    runViewTransition(commit)

    expect(start).not.toHaveBeenCalled()
    expect(commit).toHaveBeenCalledTimes(1)
  })

  it('bypasses the API when the transition is disabled', () => {
    const { start } = stubViewTransition()
    stubReducedMotion(false)
    const commit = vi.fn()

    runViewTransition(commit, false)

    expect(start).not.toHaveBeenCalled()
    expect(commit).toHaveBeenCalledTimes(1)
  })

  it('swallows the rejection of an interrupted transition', async () => {
    const rejected = Promise.reject(new Error('interrupted'))
    Object.defineProperty(document, 'startViewTransition', {
      value: (callback: () => void) => {
        callback()
        return { finished: rejected }
      },
      configurable: true,
      writable: true,
    })
    stubReducedMotion(false)

    expect(() => runViewTransition(vi.fn())).not.toThrow()
    await expect(rejected.catch(() => 'gere')).resolves.toBe('gere')
  })
})
