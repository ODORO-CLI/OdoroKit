/**
 * Single render loop.
 *
 * ## The most important architectural point of the engine
 *
 * There is **only one** render loop in an Odoro page. No scene, no surface, no
 * effect opens its own `requestAnimationFrame`: they all subscribe here.
 *
 * This is not a style preference. Two competing loops render in a
 * non-deterministic order: the DOM can be updated after the WebGL render of the
 * same frame, producing a one-frame gap between an animated element and the
 * background that should follow it. The symptom is an irregular jitter that
 * does not reproduce on demand and resists profiling. With a single loop and an
 * explicit order, the problem cannot exist.
 *
 * ## Two deltas, and why
 *
 * The underlying loop clamps abnormal deltas: after an 800 millisecond stall,
 * it reports 33 milliseconds. That is the right behaviour for an animation —
 * without it, it would jump abruptly on resume — but it is a lie for a
 * simulation that integrates elapsed time: a particle field would silently
 * drift.
 *
 * `delta` is therefore the smoothed value, `deltaRaw` the real one, measured
 * right here. Animations use the first, simulations the second.
 *
 * ## Pause
 *
 * `pause()` suspends delivery to this clock's subscribers, **without** touching
 * the underlying loop: putting it to sleep would also freeze unrelated
 * interface animations. Suspending one particular effect — off screen, hidden
 * tab — goes through `setActive` on its subscription.
 *
 * @module
 */

import gsap from 'gsap'

/**
 * Execution priorities within the frame.
 *
 * The **higher** the value, the earlier the subscriber runs. Graphics rendering
 * therefore carries a low priority: it must see the final state of the frame,
 * after every update has produced it.
 */
export const CLOCK_PRIORITY = {
  /** Reading inputs — pointer, scroll. */
  input: 200,
  /** Measurements and layout updates. */
  layout: 100,
  /** Default value. */
  default: 0,
  /** Graphics rendering, at the end of the frame. */
  render: -100,
} as const

/** State of a frame, passed to every subscriber. */
export interface FrameInfo {
  /** Time elapsed since the loop started, in seconds. */
  readonly time: number
  /**
   * Duration of the previous frame, in seconds, **smoothed**. Use this to
   * animate: it does not jump after a stall.
   */
  readonly delta: number
  /**
   * Real duration of the previous frame, in seconds. Use this for any
   * simulation that integrates time.
   */
  readonly deltaRaw: number
  /** Frame number since startup. */
  readonly frame: number
}

/** Function called on every frame. */
export type ClockCallback = (frame: FrameInfo) => void

/** Options of a subscription. */
export interface SubscribeOptions {
  /**
   * Position within the frame. See {@link CLOCK_PRIORITY}.
   *
   * @defaultValue 0
   */
  priority?: number
  /** Name shown in the diagnostics panel. */
  name?: string
}

/** Subscription to the loop. */
export interface ClockSubscription {
  /** Removes the subscription. */
  unsubscribe(): void
  /**
   * Suspends or resumes this subscriber, without removing it. This is the
   * mechanism to use for an off-screen effect: it keeps its order and its
   * state.
   */
  setActive(active: boolean): void
  /** `true` if the subscriber receives frames. */
  readonly active: boolean
  /** Name given to the subscription. */
  readonly name: string
}

/** A registered subscriber. */
interface Entry {
  callback: ClockCallback
  priority: number
  name: string
  active: boolean
}

/** Number of frames kept for the rolling average. */
const FPS_WINDOW = 30

/** Clock of the page: one instance, and one only. */
class Clock {
  private readonly entries: Entry[] = []
  private attached = false
  private paused = false
  private started = 0
  private lastRaw = 0
  private readonly durations: number[] = []

  /** Number of the last delivered frame. */
  public frame = 0

  /** Time elapsed since startup, in seconds. */
  public time = 0

  /** Current timestamp, isolated for the tests. */
  private now(): number {
    return typeof performance === 'undefined' ? Date.now() : performance.now()
  }

  /**
   * Frames per second, averaged over the last thirty frames.
   *
   * Returns 0 as long as no frame has been delivered.
   */
  public get fps(): number {
    if (this.durations.length === 0) return 0
    const total = this.durations.reduce((sum, value) => sum + value, 0)
    return total === 0 ? 0 : Math.round((this.durations.length * 1000) / total)
  }

  /** `true` if delivery is suspended. */
  public get isPaused(): boolean {
    return this.paused
  }

  /** Number of subscribers, active or not. */
  public get size(): number {
    return this.entries.length
  }

  /** Subscribers, from the highest priority to the lowest. */
  public inspect(): readonly { name: string; priority: number; active: boolean }[] {
    return this.entries.map((entry) => ({
      name: entry.name,
      priority: entry.priority,
      active: entry.active,
    }))
  }

  /** Delivers a frame to every active subscriber. */
  private readonly tick = (time: number, deltaMs: number, frame: number): void => {
    const raw = this.now()
    const deltaRaw = this.lastRaw === 0 ? deltaMs : raw - this.lastRaw
    this.lastRaw = raw

    this.durations.push(deltaRaw)
    if (this.durations.length > FPS_WINDOW) this.durations.shift()

    this.frame = frame
    this.time = time - this.started

    if (this.paused) return

    const info: FrameInfo = {
      time: this.time,
      delta: deltaMs / 1000,
      deltaRaw: deltaRaw / 1000,
      frame,
    }

    // A copy protects the loop from a subscriber that would unsubscribe during
    // its own execution — a common case for an animation that ends.
    for (const entry of [...this.entries]) {
      if (!entry.active) continue
      try {
        entry.callback(info)
      } catch (cause) {
        // A faulty subscriber must not interrupt the frame of the others.
        console.error(`[odoro] subscriber "${entry.name}" failed`, cause)
      }
    }
  }

  /** Attaches the underlying loop, only once. */
  private attach(): void {
    if (this.attached || typeof window === 'undefined') return
    this.attached = true
    this.started = gsap.ticker.time
    this.lastRaw = 0
    gsap.ticker.add(this.tick)
  }

  /** Detaches the loop when nobody listens any more. */
  private detach(): void {
    if (!this.attached) return
    this.attached = false
    gsap.ticker.remove(this.tick)
    this.durations.length = 0
  }

  /**
   * Subscribes a function to the loop.
   *
   * @example
   * const subscription = clock.subscribe(
   *   ({ deltaRaw }) => simulation.step(deltaRaw),
   *   { priority: CLOCK_PRIORITY.render, name: 'aurora' },
   * )
   */
  public subscribe(
    callback: ClockCallback,
    options: SubscribeOptions = {},
  ): ClockSubscription {
    const entry: Entry = {
      callback,
      priority: options.priority ?? CLOCK_PRIORITY.default,
      name: options.name ?? 'anonymous',
      active: true,
    }

    this.entries.push(entry)
    // Descending sort: high priority runs first, rendering last.
    this.entries.sort((a, b) => b.priority - a.priority)
    this.attach()

    return {
      get active() {
        return entry.active
      },
      get name() {
        return entry.name
      },
      setActive: (active: boolean) => {
        entry.active = active
      },
      unsubscribe: () => {
        const index = this.entries.indexOf(entry)
        if (index >= 0) this.entries.splice(index, 1)
        if (this.entries.length === 0) this.detach()
      },
    }
  }

  /**
   * Suspends delivery.
   *
   * The underlying loop keeps running: interface animations that do not belong
   * to this clock are not affected.
   */
  public pause(): void {
    this.paused = true
  }

  /** Resumes delivery. */
  public resume(): void {
    this.paused = false
    // The next delta would otherwise equal the whole duration of the pause.
    this.lastRaw = 0
  }

  /**
   * Removes every subscriber and puts the underlying loop to sleep.
   *
   * Reserved for the tests and for closing a page: without it, the loop keeps
   * the process alive indefinitely.
   */
  public dispose(): void {
    this.entries.length = 0
    this.detach()
    this.paused = false
    this.frame = 0
    this.time = 0
    if (typeof window !== 'undefined') gsap.ticker.sleep()
  }
}

/**
 * Clock of the page.
 *
 * This is deliberately a module singleton: the uniqueness of the loop is the
 * guarantee this module brings, and two instances would reduce it to nothing.
 *
 * @example
 * import { clock, CLOCK_PRIORITY } from '@odoro-cli/engine'
 *
 * const subscription = clock.subscribe(({ time }) => {
 *   mesh.rotation.y = time * 0.2
 * }, { priority: CLOCK_PRIORITY.render, name: 'molten' })
 */
export const clock = new Clock()

/** Type of the clock, for the signatures that take it as a parameter. */
export type ClockInstance = Clock
