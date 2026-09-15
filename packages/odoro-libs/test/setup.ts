/**
 * Test polyfills.
 *
 * jsdom implements neither the Web Animations API nor `IntersectionObserver`.
 * This file provides stand-ins faithful enough to check the behavior of the
 * animation engine: the animations progress in real time over short
 * durations, and the intersection is triggered explicitly by the tests.
 *
 * @module
 */

import { afterEach } from 'vitest'

/** Minimal stand-in for `Animation`, matching what the library uses. */
class TestAnimation {
  public playState: AnimationPlayState = 'running'
  public readonly finished: Promise<TestAnimation>
  public readonly effect: { keyframes: Keyframe[] | PropertyIndexedKeyframes }

  private resolve!: (value: TestAnimation) => void
  private reject!: (reason: unknown) => void
  private timer: ReturnType<typeof setTimeout> | undefined
  private settled = false

  public constructor(
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    private readonly options: KeyframeAnimationOptions,
  ) {
    this.effect = { keyframes }
    this.finished = new Promise<TestAnimation>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
    // The rejection is always handled by the library; without this guard
    // rail, Node would report an unhandled rejection for canceled
    // animations.
    this.finished.catch(() => undefined)

    const total = Number(options.duration ?? 0) + Number(options.delay ?? 0)
    this.timer = setTimeout(() => this.finish(), Math.min(total, 50))
    ACTIVE.add(this)
  }

  /** Total requested duration, exposed for the test assertions. */
  public get requestedTiming(): KeyframeAnimationOptions {
    return this.options
  }

  public finish(): void {
    if (this.settled) return
    this.settled = true
    clearTimeout(this.timer)
    this.playState = 'finished'
    ACTIVE.delete(this)
    this.resolve(this)
  }

  public cancel(): void {
    if (this.settled) return
    this.settled = true
    clearTimeout(this.timer)
    this.playState = 'idle'
    ACTIVE.delete(this)
    this.reject(new DOMException('The user aborted a request.', 'AbortError'))
  }

  public pause(): void {
    this.playState = 'paused'
  }

  public play(): void {
    this.playState = 'running'
  }
}

const ACTIVE = new Set<TestAnimation>()

Element.prototype.animate = function animate(
  this: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options?: number | KeyframeAnimationOptions,
): Animation {
  const resolved = typeof options === 'number' ? { duration: options } : (options ?? {})
  return new TestAnimation(keyframes ?? [], resolved) as unknown as Animation
}

/** Active observers, so that the tests can trigger the intersection. */
const OBSERVERS = new Map<IntersectionObserverCallback, Set<Element>>()

class TestIntersectionObserver implements IntersectionObserver {
  public readonly root = null
  public readonly rootMargin = '0px'
  public readonly thresholds: readonly number[] = [0]

  private readonly elements = new Set<Element>()

  public constructor(private readonly callback: IntersectionObserverCallback) {
    OBSERVERS.set(callback, this.elements)
  }

  public observe(element: Element): void {
    this.elements.add(element)
  }

  public unobserve(element: Element): void {
    this.elements.delete(element)
  }

  public disconnect(): void {
    this.elements.clear()
    OBSERVERS.delete(this.callback)
  }

  public takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

globalThis.IntersectionObserver =
  TestIntersectionObserver as unknown as typeof IntersectionObserver

/**
 * Reports to every active observer that its elements are — or are no longer —
 * visible.
 *
 * @example
 * triggerIntersection(true)
 */
export function triggerIntersection(isIntersecting: boolean): void {
  for (const [callback, elements] of [...OBSERVERS]) {
    const entries = [...elements].map(
      (target) => ({ target, isIntersecting }) as IntersectionObserverEntry,
    )
    if (entries.length > 0) {
      callback(entries, null as unknown as IntersectionObserver)
    }
  }
}

/**
 * Forces `prefers-reduced-motion` to a given value for the current test.
 *
 * @example
 * setReducedMotion(true)
 */
export function setReducedMotion(reduced: boolean): void {
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

setReducedMotion(false)

afterEach(() => {
  for (const animation of [...ACTIVE]) animation.cancel()
  OBSERVERS.clear()
  setReducedMotion(false)
})
