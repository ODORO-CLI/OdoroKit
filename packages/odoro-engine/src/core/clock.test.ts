import gsap from 'gsap'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CLOCK_PRIORITY, clock } from './clock.js'

/**
 * Triggers a frame manually.
 *
 * `gsap.ticker.tick()` delivers immediately, without waiting for the next
 * refresh: the tests stay deterministic and do not depend on real time.
 */
function tick(): void {
  gsap.ticker.tick()
}

/**
 * Number of calls recorded by a spy.
 *
 * The assertions are about **differences**, never about totals: the underlying
 * loop also runs on its own, and an automatic frame can slip in between two
 * hand-triggered frames. Counting in absolute terms would make these tests
 * flaky.
 */
function calls(spy: ReturnType<typeof vi.fn>): number {
  return spy.mock.calls.length
}

afterEach(() => {
  clock.dispose()
})

describe('subscription', () => {
  it('delivers a frame to the subscribers', () => {
    const seen = vi.fn()
    clock.subscribe(seen, { name: 'test' })

    const before = calls(seen)
    tick()

    expect(calls(seen)).toBeGreaterThan(before)
    const frame = seen.mock.calls[0]?.[0] as { frame: number; time: number }
    expect(typeof frame.frame).toBe('number')
    expect(typeof frame.time).toBe('number')
  })

  it('stops delivering after unsubscribing', () => {
    const seen = vi.fn()
    const subscription = clock.subscribe(seen)

    tick()
    subscription.unsubscribe()
    const after = calls(seen)
    tick()

    expect(calls(seen)).toBe(after)
  })

  it('counts the subscribers, active or not', () => {
    expect(clock.size).toBe(0)
    const first = clock.subscribe(vi.fn())
    clock.subscribe(vi.fn())
    expect(clock.size).toBe(2)
    first.unsubscribe()
    expect(clock.size).toBe(1)
  })
})

describe('order within the frame', () => {
  it('runs the high priority before the low priority', () => {
    const order: string[] = []
    // Graphics rendering must see the final state of the frame: it therefore
    // carries the lowest priority and runs last.
    clock.subscribe(() => order.push('render'), { priority: CLOCK_PRIORITY.render })
    clock.subscribe(() => order.push('layout'), { priority: CLOCK_PRIORITY.layout })
    clock.subscribe(() => order.push('input'), { priority: CLOCK_PRIORITY.input })

    tick()

    expect(order).toEqual(['input', 'layout', 'render'])
  })

  it('places a subscriber added afterwards', () => {
    const order: string[] = []
    clock.subscribe(() => order.push('default'))
    clock.subscribe(() => order.push('render'), { priority: CLOCK_PRIORITY.render })
    clock.subscribe(() => order.push('input'), { priority: CLOCK_PRIORITY.input })

    tick()

    expect(order).toEqual(['input', 'default', 'render'])
  })

  it('exposes the inventory of subscribers, sorted', () => {
    clock.subscribe(vi.fn(), { name: 'render', priority: CLOCK_PRIORITY.render })
    clock.subscribe(vi.fn(), { name: 'input', priority: CLOCK_PRIORITY.input })

    expect(clock.inspect().map((entry) => entry.name)).toEqual(['input', 'render'])
  })
})

describe('suspension', () => {
  it('suspends a subscriber without removing it', () => {
    const seen = vi.fn()
    const subscription = clock.subscribe(seen)

    subscription.setActive(false)
    const suspended = calls(seen)
    tick()
    expect(calls(seen)).toBe(suspended)
    expect(clock.size).toBe(1)

    subscription.setActive(true)
    tick()
    expect(calls(seen)).toBeGreaterThan(suspended)
  })

  it('keeps the place of the suspended subscriber', () => {
    const order: string[] = []
    const suspended = clock.subscribe(() => order.push('middle'))
    clock.subscribe(() => order.push('render'), { priority: CLOCK_PRIORITY.render })
    clock.subscribe(() => order.push('input'), { priority: CLOCK_PRIORITY.input })

    suspended.setActive(false)
    tick()
    expect(order).toEqual(['input', 'render'])

    order.length = 0
    suspended.setActive(true)
    tick()
    expect(order).toEqual(['input', 'middle', 'render'])
  })

  it('reflects the active state in the subscription', () => {
    const subscription = clock.subscribe(vi.fn())
    expect(subscription.active).toBe(true)
    subscription.setActive(false)
    expect(subscription.active).toBe(false)
  })
})

describe('global pause', () => {
  it('suspends delivery to every subscriber', () => {
    const seen = vi.fn()
    clock.subscribe(seen)

    clock.pause()
    const paused = calls(seen)
    tick()
    expect(calls(seen)).toBe(paused)
    expect(clock.isPaused).toBe(true)

    clock.resume()
    tick()
    expect(calls(seen)).toBeGreaterThan(paused)
    expect(clock.isPaused).toBe(false)
  })

  it('keeps counting frames during the pause', () => {
    clock.subscribe(vi.fn())
    clock.pause()
    const before = clock.frame
    tick()
    // The underlying loop is not stopped: only deliveries are. A pause that
    // froze the loop would also freeze interface animations unrelated to this
    // clock.
    expect(clock.frame).not.toBe(before)
  })
})

describe('robustness', () => {
  it('isolates a subscriber that fails', () => {
    const next = vi.fn()
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    clock.subscribe(
      () => {
        throw new Error('faulty subscriber')
      },
      { priority: CLOCK_PRIORITY.input, name: 'faulty' },
    )
    clock.subscribe(next, { priority: CLOCK_PRIORITY.render })

    const before = calls(next)
    tick()

    expect(calls(next)).toBeGreaterThan(before)
    expect(error).toHaveBeenCalled()
  })

  it('tolerates an unsubscribe during delivery', () => {
    const next = vi.fn()
    const subscription = clock.subscribe(() => subscription.unsubscribe(), {
      priority: CLOCK_PRIORITY.input,
    })
    clock.subscribe(next, { priority: CLOCK_PRIORITY.render })

    const before = calls(next)
    expect(() => tick()).not.toThrow()
    expect(calls(next)).toBeGreaterThan(before)
  })
})

describe('load measurement', () => {
  it('reports no frame rate before the first frame', () => {
    expect(clock.fps).toBe(0)
  })

  it('reports a frame rate after a few frames', () => {
    clock.subscribe(vi.fn())
    for (let i = 0; i < 5; i += 1) tick()
    expect(clock.fps).toBeGreaterThan(0)
  })
})

describe('release', () => {
  it('removes every subscriber', () => {
    clock.subscribe(vi.fn())
    clock.subscribe(vi.fn())

    clock.dispose()

    expect(clock.size).toBe(0)
    expect(clock.fps).toBe(0)
  })

  it('puts the underlying loop to sleep', () => {
    // Without it, the loop keeps the process alive indefinitely: a test suite
    // never finishes.
    const sleep = vi.spyOn(gsap.ticker, 'sleep')
    clock.subscribe(vi.fn())
    clock.dispose()
    expect(sleep).toHaveBeenCalled()
  })
})
