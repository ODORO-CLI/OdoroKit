import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  prefersReducedMotion,
  runViewTransition,
  supportsViewTransitions,
} from './viewTransition.js'

/** Installe une implementation factice de l'API View Transitions. */
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

/** Force la reponse de `matchMedia` pour `prefers-reduced-motion`. */
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
  it('retourne false quand l API est absente', () => {
    expect(supportsViewTransitions()).toBe(false)
  })

  it('retourne true quand l API est presente', () => {
    stubViewTransition()
    expect(supportsViewTransitions()).toBe(true)
  })
})

describe('prefersReducedMotion', () => {
  it('reflete la media query', () => {
    stubReducedMotion(true)
    expect(prefersReducedMotion()).toBe(true)
    stubReducedMotion(false)
    expect(prefersReducedMotion()).toBe(false)
  })
})

describe('runViewTransition', () => {
  it('execute le commit directement quand l API est absente', () => {
    const commit = vi.fn()
    runViewTransition(commit)
    expect(commit).toHaveBeenCalledTimes(1)
  })

  it('passe par l API quand elle est disponible', () => {
    const { start } = stubViewTransition()
    stubReducedMotion(false)
    const commit = vi.fn()

    runViewTransition(commit)

    expect(start).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledTimes(1)
  })

  it('contourne l API quand les animations sont reduites', () => {
    const { start } = stubViewTransition()
    stubReducedMotion(true)
    const commit = vi.fn()

    runViewTransition(commit)

    expect(start).not.toHaveBeenCalled()
    expect(commit).toHaveBeenCalledTimes(1)
  })

  it('contourne l API quand la transition est desactivee', () => {
    const { start } = stubViewTransition()
    stubReducedMotion(false)
    const commit = vi.fn()

    runViewTransition(commit, false)

    expect(start).not.toHaveBeenCalled()
    expect(commit).toHaveBeenCalledTimes(1)
  })

  it('avale le rejet d une transition interrompue', async () => {
    const rejected = Promise.reject(new Error('interrompue'))
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
