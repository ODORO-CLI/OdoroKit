/**
 * Pointer position, normalised and smoothed.
 *
 * ## The technique
 *
 * Following the pointer without a filter gives a jittery movement: the system
 * events arrive at an irregular rhythm, and each one moves the value by a
 * jump. Exponential damping corrects that — on every frame, the value fills in
 * a fraction of the gap separating it from its target.
 *
 * That fraction depends on the elapsed time. Using a constant would make the
 * speed of the movement vary with the display cadence: twice as fast on a
 * screen at a hundred and twenty frames per second. The formula
 * `1 - exp(-speed x dt)` produces the same movement whatever the cadence,
 * which is the only way to get a setting that behaves the same for everyone.
 *
 * ## Why a ref rather than state
 *
 * The value changes on every frame. Returning it as state would trigger a
 * React render per frame — sixty a second, to move an object React does not
 * even draw. The reading therefore happens inside the loop, where we already
 * are.
 *
 * @module
 */

import { CLOCK_PRIORITY, clock, motionPolicy } from '@odoro-cli/engine'
import { type RefObject, useEffect, useRef } from 'react'

/** Normalised position, origin at the centre, clamped to [-1, 1]. */
export interface PointerPosition {
  x: number
  y: number
}

/** Options of `usePointerDamped`. */
export interface PointerDampedOptions {
  /** Watched area. By default, the whole window. */
  host?: HTMLElement | null
  /** Catch-up speed. Higher is sharper. @defaultValue 3 */
  speed?: number
  /** Name displayed in the diagnostics panel. */
  name?: string
}

/**
 * Follows the pointer with damping.
 *
 * Under reduced motion, the value stays at rest: pointer following is an
 * embellishment, not content.
 *
 * @returns A ref whose `.current` is read inside the render loop.
 *
 * @example
 * const pointer = usePointerDamped({ host, speed: 4 })
 *
 * useScene({
 *   frame: ({ scene }) => {
 *     scene.rotation.y = pointer.current.x * 0.3
 *   },
 * })
 */
export function usePointerDamped(
  options: PointerDampedOptions = {},
): RefObject<PointerPosition> {
  const { host, speed = 3, name = 'pointer' } = options

  const current = useRef<PointerPosition>({ x: 0, y: 0 })
  const target = useRef<PointerPosition>({ x: 0, y: 0 })

  useEffect(() => {
    if (motionPolicy.state.reduced) return

    const surface: HTMLElement | Window = host ?? window

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      const bounds =
        host === null || host === undefined
          ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
          : host.getBoundingClientRect()

      target.current = {
        x: ((pointer.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1,
        y: ((pointer.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1,
      }
    }

    const onLeave = (): void => {
      // Back to rest, rather than a freeze on the last known position.
      target.current = { x: 0, y: 0 }
    }

    surface.addEventListener('pointermove', onMove, { passive: true })
    surface.addEventListener('pointerleave', onLeave)

    const subscription = clock.subscribe(
      ({ delta }) => {
        const factor = 1 - Math.exp(-speed * delta)
        current.current.x += (target.current.x - current.current.x) * factor
        current.current.y += (target.current.y - current.current.y) * factor
      },
      // Before the render: the value the scene reads is this frame's.
      { priority: CLOCK_PRIORITY.input, name },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
    }
  }, [host, speed, name])

  return current
}
