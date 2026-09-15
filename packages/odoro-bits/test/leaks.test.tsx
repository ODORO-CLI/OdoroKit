/**
 * @vitest-environment jsdom
 *
 * What these components leave behind when they are unmounted.
 *
 * ## Why this family deserves a test of its own
 *
 * The `text` entries of this slice render nothing in WebGL: there is no
 * geometry, no texture, no material to release. But each one opens something
 * else, and each one opens a different thing: an intersection observer, a
 * resize observer, a frame loop, an interval, animations. Five ways to leak,
 * five cleanups to write — and nothing in the types says they were written.
 *
 * A leak of this family breaks nothing right away. It shows on a documentation
 * page browsed for ten minutes, when a hundred observers detached from their
 * element keep receiving events.
 *
 * ## The doubles are the measuring instrument
 *
 * `jsdom` implements neither `IntersectionObserver`, nor `ResizeObserver`, nor
 * the animation API. They have to be provided — and that is a windfall: by
 * providing them, we count. Every `observe` and every `disconnect` goes through
 * us, and the balance is read at the end.
 *
 * @module
 */

import { act, type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { CountUp } from '../registry/text/count-up/component.js'
import { HighlightSweep } from '../registry/text/highlight-sweep/component.js'
import { RotatingWords } from '../registry/text/rotating-words/component.js'
import { SplitLines } from '../registry/text/split-lines/component.js'

/** How many mount/unmount cycles. */
const CYCLES = 100

/** What the doubles count. */
interface Counters {
  observed: number
  detached: number
  animations: number
  cancelled: number
  intervals: number
  frames: number
}

let counters: Counters

beforeEach(() => {
  counters = {
    observed: 0,
    detached: 0,
    animations: 0,
    cancelled: 0,
    intervals: 0,
    frames: 0,
  }

  class ObserverDouble {
    observe(): void {
      counters.observed += 1
    }
    unobserve(): void {
      /* nothing: it is `disconnect` that the components use */
    }
    disconnect(): void {
      counters.detached += 1
    }
    takeRecords(): readonly unknown[] {
      return []
    }
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds: readonly number[] = []
  }

  globalThis.IntersectionObserver =
    ObserverDouble as unknown as typeof IntersectionObserver
  globalThis.ResizeObserver = ObserverDouble as unknown as typeof ResizeObserver

  // The animation API: a double that plays nothing but remembers having been
  // cancelled.
  Element.prototype.animate = function animate(): Animation {
    counters.animations += 1
    return {
      cancel: () => {
        counters.cancelled += 1
      },
      finish: () => undefined,
      play: () => undefined,
      pause: () => undefined,
    } as unknown as Animation
  }
})

afterEach(() => {
  counters.intervals = 0
})

/** Mounts, then unmounts, a number of times. */
function cycle(element: () => ReactElement, cycles = CYCLES): void {
  for (let i = 0; i < cycles; i += 1) {
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)

    act(() => {
      root.render(element())
    })

    act(() => {
      root.unmount()
    })

    host.remove()
  }
}

describe('what is opened gets closed', () => {
  it('detaches as many observers as it opens — split-lines', () => {
    // Two per cycle: the one for entering the viewport, the one for layout. The
    // second is the easiest to forget, because it is created in the same effect
    // as the layer itself.
    cycle(() => (
      <SplitLines>A line does not exist in the DOM, it is measured.</SplitLines>
    ))

    expect(counters.observed).toBeGreaterThan(0)
    expect(counters.detached).toBe(counters.observed)
  })

  it('cancels every animation it starts — split-lines', () => {
    cycle(() => <SplitLines trigger="mount">A demonstration sentence.</SplitLines>)

    // Every one, not most: an animation that outlives its element keeps a
    // reference to it, and the element can no longer be reclaimed.
    expect(counters.cancelled).toBeGreaterThanOrEqual(counters.animations)
  })

  it('detaches its observer — count-up', () => {
    cycle(() => <CountUp value={12480} />)

    expect(counters.observed).toBeGreaterThan(0)
    expect(counters.detached).toBe(counters.observed)
  })

  it('detaches its observer — highlight-sweep', () => {
    cycle(() => <HighlightSweep>highlighted</HighlightSweep>)

    expect(counters.observed).toBeGreaterThan(0)
    expect(counters.detached).toBe(counters.observed)
  })

  it('detaches its observer — rotating-words', () => {
    cycle(() => <RotatingWords words={['fast', 'sure', 'together']} />)

    expect(counters.observed).toBeGreaterThan(0)
    expect(counters.detached).toBe(counters.observed)
  })

  it('creates no observer when the trigger is on mount', () => {
    // An observer posted to answer a question already settled would be pure
    // work: the hook short-circuits, and this test holds it to that.
    cycle(() => <CountUp value={7} trigger="mount" />, 10)

    expect(counters.observed).toBe(0)
  })
})

describe('timers do not outlive the unmount', () => {
  it('rotating-words leaves no interval running', () => {
    const open = new Set<unknown>()
    const realSet = globalThis.setInterval
    const realClear = globalThis.clearInterval

    globalThis.setInterval = ((...args: Parameters<typeof setInterval>) => {
      const id = realSet(...args)
      open.add(id)
      return id
    }) as typeof setInterval

    globalThis.clearInterval = ((id?: Parameters<typeof clearInterval>[0]) => {
      open.delete(id)
      realClear(id)
    }) as typeof clearInterval

    try {
      cycle(() => <RotatingWords words={['a', 'b']} />, 20)
    } finally {
      globalThis.setInterval = realSet
      globalThis.clearInterval = realClear
      for (const id of open) realClear(id as Parameters<typeof clearInterval>[0])
    }

    // An interval that survives keeps waking the processor for a component that
    // is no longer on screen — and one is left per cycle.
    expect(open.size).toBe(0)
  })

  it('count-up leaves no frame pending', () => {
    const open = new Set<number>()
    const realRaf = globalThis.requestAnimationFrame
    const realCancel = globalThis.cancelAnimationFrame

    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      const id = realRaf(cb)
      open.add(id)
      return id
    }) as typeof requestAnimationFrame

    globalThis.cancelAnimationFrame = ((id: number) => {
      open.delete(id)
      realCancel(id)
    }) as typeof cancelAnimationFrame

    try {
      cycle(() => <CountUp value={999} trigger="mount" />, 20)
    } finally {
      globalThis.requestAnimationFrame = realRaf
      globalThis.cancelAnimationFrame = realCancel
      for (const id of open) realCancel(id)
    }

    expect(open.size).toBe(0)
  })
})

describe('the text stays readable whatever happens', () => {
  it('split-lines keeps the original text in the DOM', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)

    act(() => {
      root.render(<SplitLines trigger="mount">Hello world</SplitLines>)
    })

    // The layer is `aria-hidden`; what stays readable must be the original
    // node, whole, and not a series of fragments.
    const layer = host.querySelector('[aria-hidden="true"]')
    layer?.remove()

    expect(host.textContent).toBe('Hello world')

    act(() => {
      root.unmount()
    })
    host.remove()
  })

  it('count-up announces the final value, never the intermediate ones', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)

    act(() => {
      root.render(<CountUp value={1234} locale="en-GB" trigger="mount" />)
    })

    const layer = host.querySelector('[aria-hidden="true"]')
    layer?.remove()

    // The final value, formatted — and not "0", which is what a screen reader
    // would announce if the layer were the only text present.
    expect(host.textContent).toContain('234')

    act(() => {
      root.unmount()
    })
    host.remove()
  })
})
