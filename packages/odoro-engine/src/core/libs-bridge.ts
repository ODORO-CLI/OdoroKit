/**
 * The bridge to `@odoro-cli/libs`, when it is present.
 *
 * ## Why a bridge rather than a dependency
 *
 * The engine depends on no Odoro package. This is deliberate: it is used on
 * its own, in a project that does not have the library, and forcing it to pull
 * the library in just to read a system preference would be a dependency
 * imposed by a convenience.
 *
 * But when both are there, two things must stop existing twice.
 *
 * ## The loop
 *
 * `@odoro-cli/libs/motion` opens a loop in a single place: the measurement of
 * scroll progress, which is read per frame and not per event. The engine has
 * one too — GSAP's, which drives everything else.
 *
 * Two competing loops read and write the layout in an order the other ignores.
 * The result is a jitter that does not reproduce on demand, and that gets
 * blamed on the engine when it comes from their coexistence. The bridge
 * therefore installs the GSAP ticker as the scheduler of the library, and
 * gives it back on unmount.
 *
 * ## The decision to animate
 *
 * `prefers-reduced-motion` was read on both sides. As long as nobody forces
 * the setting, the two readings agree; they diverge as soon as a project
 * decides to ignore it on a page. The bridge makes the library follow the
 * engine's setting, so that the answer is the same everywhere.
 *
 * ## The import is dynamic, and its failure is normal
 *
 * `@odoro-cli/libs` is an optional dependency. Its absence is not an error: it
 * is the case of a project that only uses the engine. The bridge then simply
 * does nothing.
 *
 * @module
 */

import gsap from 'gsap'

/** What the bridge installs, and knows how to undo. */
export type BridgeTeardown = () => void

/** Minimal shape of what the bridge consumes from the library. */
interface LibsMotionPolicy {
  setFrameScheduler: (next: (task: () => void) => () => void) => () => void
  setReducedMotion: (setting: 'respect' | 'force' | 'ignore') => void
}

/**
 * Hooks the engine up to the library, if it is there.
 *
 * @returns What is needed to undo the hook-up. Returns an inert function when
 *   the library is absent.
 *
 * @example
 * useEffect(() => {
 *   let undo: BridgeTeardown = () => undefined
 *   void bridgeToLibs(reducedMotion).then((fn) => (undo = fn))
 *   return () => undo()
 * }, [reducedMotion])
 */
export async function bridgeToLibs(
  reducedMotion: 'respect' | 'force' | 'ignore',
): Promise<BridgeTeardown> {
  let libs: LibsMotionPolicy
  try {
    libs = (await import('@odoro-cli/libs/motion-policy')) as unknown as LibsMotionPolicy
  } catch {
    // The library is not installed: this is an ordinary case, not a failure.
    return () => undefined
  }

  // The GSAP ticker, with `once`: the task is removed after it runs, which
  // reproduces exactly the semantics of a `requestAnimationFrame` — one frame,
  // not a subscription.
  const restoreScheduler = libs.setFrameScheduler((task) => {
    const run = (): void => {
      gsap.ticker.remove(run)
      task()
    }
    gsap.ticker.add(run)
    return () => gsap.ticker.remove(run)
  })

  libs.setReducedMotion(reducedMotion)

  return () => {
    restoreScheduler()
    // The library goes back to the system preference: with the engine gone,
    // nothing justifies it following a setting the engine had forced.
    libs.setReducedMotion('respect')
  }
}
