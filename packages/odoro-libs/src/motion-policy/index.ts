/**
 * Motion policy: a single decision, for everything that animates.
 *
 * ## Why this module exists separately
 *
 * `prefers-reduced-motion` was consulted by each component of `motion`, and
 * a second time, independently, by the animation engine. Two reads
 * of the same system preference, which answer the same thing as long as
 * nobody forces it — and diverge as soon as a project decides to ignore it on
 * a specific page.
 *
 * The decision therefore lives here, in a module that depends on nothing: neither React,
 * nor the engine. `@odoro-cli/libs/motion` consults it, and `@odoro-cli/engine` can
 * consult it too, without either of the two depending on the other.
 *
 * ## The loop is yieldable
 *
 * An animation through the Web Animations API is driven by the compositor:
 * no JavaScript loop is opened. Some measurements require one
 * nonetheless — a scroll progress is read per frame, not per
 * event, on pain of recomputing the layout dozens of times
 * per second.
 *
 * That loop is **yieldable**. By default it uses
 * `requestAnimationFrame`; when `@odoro-cli/engine` is present, it installs its
 * own scheduler and everything goes through the single GSAP ticker.
 *
 * Two competing loops produce a jitter that is never attributed
 * to the right cause: each reads and writes the layout in an order that
 * the other ignores, and the defect does not reproduce on demand.
 *
 * @module
 */

/** What a project can impose on top of the system preference. */
export type ReducedMotionSetting =
  /** Follows the system preference. The default, and the right one. */
  | 'respect'
  /** Animates as if the preference were enabled, whatever the system says. */
  | 'force'
  /**
   * Ignores the preference.
   *
   * To be used only on an animation that carries meaning and has no
   * static equivalent — a demonstration of what the engine does, for
   * example. Never for aesthetic comfort.
   */
  | 'ignore'

/** Media query queried. */
const QUERY = '(prefers-reduced-motion: reduce)'

/** Retrieves the MediaQueryList, or `null` outside a browser. */
function mediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null
  }
  return window.matchMedia(QUERY)
}

/** Imposed setting, if there is one. */
let setting: ReducedMotionSetting = 'respect'

/** Subscribers to the changes, system or imposed. */
const listeners = new Set<() => void>()

/** Unsubscription from the media query, when someone listens. */
let detach: (() => void) | undefined

/** Warns the subscribers. */
function notify(): void {
  for (const listener of listeners) listener()
}

/**
 * Tells whether animations must be reduced.
 *
 * Usable outside a component. Returns `false` on the server side, where the animation does
 * not take place anyway.
 *
 * @example
 * const duration = prefersReducedMotion()? 0: 300
 */
export function prefersReducedMotion(): boolean {
  if (setting === 'force') return true
  if (setting === 'ignore') return false
  return mediaQuery()?.matches ?? false
}

/**
 * Imposes a setting, or goes back to the system preference.
 *
 * @example
 * // On an engine demonstration page, and nowhere else.
 * setReducedMotion('ignore')
 */
export function setReducedMotion(next: ReducedMotionSetting): void {
  if (next === setting) return
  setting = next
  notify()
}

/** The current setting. */
export function reducedMotionSetting(): ReducedMotionSetting {
  return setting
}

/**
 * Subscribes a listener to the changes of the policy.
 *
 * @returns What is needed to unsubscribe.
 */
export function subscribeMotion(listener: () => void): () => void {
  listeners.add(listener)

  // The media query is listened to only as long as someone is interested in it: a
  // listener set at load time and never removed is a leak that is not seen,
  // because it costs only one object.
  if (detach === undefined) {
    const query = mediaQuery()
    if (query !== null) {
      query.addEventListener('change', notify)
      detach = () => query.removeEventListener('change', notify)
    }
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      detach?.()
      detach = undefined
    }
  }
}

/* -------------------------------------------------------------------------- */
/* The yieldable scheduler                                                    */
/* -------------------------------------------------------------------------- */

/** Schedules a task for the next frame, and returns what is needed to cancel it. */
export type FrameScheduler = (task: () => void) => () => void

/** Default scheduler: a browser frame. */
const rafScheduler: FrameScheduler = (task) => {
  if (typeof requestAnimationFrame !== 'function') {
    // Outside a browser, the task runs once, right away: that is what
    // makes a server rendering produce a value rather than a void.
    task()
    return () => undefined
  }
  const handle = requestAnimationFrame(task)
  return () => cancelAnimationFrame(handle)
}

let scheduler: FrameScheduler = rafScheduler

/**
 * Replaces the scheduler of the library.
 *
 * Called by `@odoro-cli/engine` on its mount, so that the measurements of the
 * library go through the same ticker as the animations of the engine. Without
 * this, two loops read and write the layout in an order that
 * the other ignores.
 *
 * @returns What is needed to give back the previous scheduler, on unmount of the engine.
 *
 * @example
 * // On the engine side:
 * const restore = setFrameScheduler((task) => {
 *   const wrapped = () => task()
 *   gsap.ticker.add(wrapped, true)
 *   return () => gsap.ticker.remove(wrapped)
 * })
 */
export function setFrameScheduler(next: FrameScheduler): () => void {
  const previous = scheduler
  scheduler = next
  return () => {
    scheduler = previous
  }
}

/**
 * Schedules a task on the next frame.
 *
 * Goes through the current scheduler: the browser one, or the engine one
 * when it is present.
 */
export function onFrame(task: () => void): () => void {
  return scheduler(task)
}

/** Puts the policy back in its initial state. Reserved for tests. */
export function resetMotionPolicy(): void {
  setting = 'respect'
  listeners.clear()
  detach?.()
  detach = undefined
  scheduler = rafScheduler
}
