/**
 * `onReady`: level 5 of the contract, the escape hatch.
 *
 * ## What it gives
 *
 * The imperative object the component built — a timeline, a scene, a surface —
 * at the moment it becomes usable, and not before. What follows no longer
 * needs to go through a property: you hold the thing itself.
 *
 * ## The trap it avoids
 *
 * An escape hatch written naively fires on every render of the parent. The
 * caller almost always writes an inline function:
 *
 * ```tsx
 * <Molten onReady={({ handle }) => handle.timeScale(0.5)} />
 * ```
 *
 * That function is **a new value on every render**. An effect that had it in
 * its dependencies would replay the escape hatch as soon as the parent
 * re-renders — for an unrelated reason, such as a hover elsewhere on the page.
 * Depending on what the callback does, this ranges from waste to a leak: a
 * subscription set on every render and released only once.
 *
 * The function is therefore kept in a ref, and the effect only depends on what
 * really matters: the object, and the element. We do not ask the caller to
 * memoise their callback — they would forget, and the flaw would be invisible
 * until the memory profile.
 *
 * @module
 */

import { useEffect, useRef } from 'react'

import { motionPolicy, type MotionState } from '../core/motion-policy.js'

/** What the escape hatch receives. */
export interface ReadyContext<Handle> {
  /** The imperative object built by the component. */
  readonly handle: Handle
  /** The root element, already in the document. */
  readonly element: HTMLElement
  /**
   * Motion state at the time of the call. A callback that adds an animation
   * must consult it: the escape hatch bypasses the component's API, not the
   * user's preference.
   */
  readonly motion: MotionState
}

/**
 * Escape hatch callback.
 *
 * What it returns, if it returns anything, is called on unmount — or before
 * replaying the callback. An escape hatch that sets a subscription without
 * being able to remove it would be a leak offered by the API itself.
 */
export type ReadyCallback<Handle> = (context: ReadyContext<Handle>) => void | (() => void)

/**
 * Fires the escape hatch once the object is ready.
 *
 * @param callback Callback supplied by the caller. May be an inline function:
 * its re-identity has no effect.
 * @param handle Imperative object, or `null` as long as it does not exist.
 * @param element Root element, or `null` as long as it is not mounted.
 *
 * @example
 * const timeline = useTimeline(…)
 * useOnReady(onReady, timeline.instance, host.current)
 */
export function useOnReady<Handle>(
  callback: ReadyCallback<Handle> | undefined,
  handle: Handle | null | undefined,
  element: HTMLElement | null | undefined,
): void {
  const latest = useRef(callback)
  latest.current = callback

  useEffect(() => {
    const run = latest.current
    if (run === undefined) return
    if (handle === null || handle === undefined) return
    if (element === null || element === undefined) return

    return run({ handle, element, motion: motionPolicy.state })
    // The function is deliberately absent from the dependencies: it is read
    // from the ref, which the dependency analysis recognises. See the
    // explanation at the top of the module.
  }, [handle, element])
}
