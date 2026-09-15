/**
 * Repetition at a regular interval, aligned on the engine clock.
 *
 * ## What `setInterval` gets wrong in an animated page
 *
 * It keeps going when the tab is hidden. The browser slows it down — once per
 * second at best — but it does not stop it: a carousel of words brought back
 * to the foreground has cycled three hundred times into the void, and the
 * battery paid for it. The engine loop, on the other hand, is backed by the
 * display: a hidden tab receives no frame, therefore no beat, and it resumes
 * where it left off.
 *
 * It drifts, too. `setInterval(f, 1000)` rarely calls `f` one second apart:
 * the delay starts after the previous execution, and the task queue adds
 * whatever it likes. Two equal intervals started together fall out of sync
 * within minutes, which shows immediately when they animate two neighbouring
 * elements. Here the elapsed time is accumulated and the remainder carried
 * over: the cadence holds over time.
 *
 * And it opens one more timer. A page displaying twenty counters opens twenty
 * timers, which nothing coordinates with the frames; here everything goes
 * through the single engine loop, which runs them in a known order.
 *
 * ## Why catch-up is capped at one beat per frame
 *
 * After a stall — a tab brought back, a long script — the elapsed time would
 * exceed several intervals. Replaying them all in the same frame would produce
 * a burst: a counter jumping by thirty, an animation flickering. The excess
 * time is therefore thrown away, because what matters for an interface
 * repetition is the cadence to come, not catching up with the past.
 *
 * @module
 */

import { CLOCK_PRIORITY, clock } from '@odoro-cli/engine'
import { useEffect, useRef } from 'react'

/** Options of `useIntervalClock`. */
export interface IntervalClockOptions {
  /** Time between two beats, in milliseconds. @defaultValue 1000 */
  interval?: number
  /**
   * Whether to beat.
   *
   * This is where reduced motion goes through: the hook animates nothing by
   * itself and cannot judge in the caller's place. A carousel that cycles on
   * its own passes `active={!reduced}`; a countdown, which is content and not
   * an embellishment, beats anyway.
   *
   * @defaultValue true
   */
  active?: boolean
  /**
   * Beat once immediately, without waiting for the interval.
   *
   * @defaultValue false
   */
  immediate?: boolean
  /** Name displayed in the diagnostics panel. */
  name?: string
}

/**
 * Calls a function at a regular interval, inside the engine loop.
 *
 * @param callback Called on every beat. Its latest version is always the one
 * that runs: changing it does not restart the count.
 *
 * @example
 * const [index, setIndex] = useState(0)
 * const { reduced } = useMotionState()
 *
 * useIntervalClock(() => setIndex((n) => (n + 1) % mots.length), {
 *   interval: 2400,
 *   active: !reduced,
 *   name: 'mots-tournants',
 * })
 */
export function useIntervalClock(
  callback: () => void,
  options: IntervalClockOptions = {},
): void {
  const { interval = 1000, active = true, immediate = false, name = 'interval' } = options

  // The function lives in a ref: without this, a function built at render time
  // — the normal case — would restart the count on every render, and the
  // interval would never be reached on a page that renders often.
  const latest = useRef(callback)
  useEffect(() => {
    latest.current = callback
  }, [callback])

  useEffect(() => {
    if (!active || interval <= 0) return

    const period = interval / 1000
    let accumulated = 0

    if (immediate) latest.current()

    const subscription = clock.subscribe(
      ({ deltaRaw }) => {
        // Real time, not smoothed time: a cadence is counted in true seconds.
        // Capped at one period, so that a stall produces one beat and not a
        // burst.
        accumulated += deltaRaw > period ? period : deltaRaw
        if (accumulated < period) return
        accumulated -= period
        latest.current()
      },
      { priority: CLOCK_PRIORITY.default, name },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [interval, active, immediate, name])
}
