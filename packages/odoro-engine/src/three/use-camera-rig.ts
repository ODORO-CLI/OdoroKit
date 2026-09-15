/**
 * Camera movement reacting to the pointer.
 *
 * ## The damping, and why it is not cosmetic
 *
 * Following the pointer without a filter gives a jittery camera, jumping from
 * one position to the next at the rhythm of the system events — irregular by
 * nature. Exponential damping corrects this: on every frame, the camera closes
 * a fraction of the gap that separates it from its target.
 *
 * That fraction must depend on the elapsed time, otherwise the speed of the
 * movement would vary with the frame rate — twice as fast on a display at one
 * hundred and twenty frames per second as on one at sixty. The formula used,
 * `1 - exp(-speed x dt)`, produces the same movement whatever the frame rate.
 *
 * @module
 */

import { useEffect, useRef } from 'react'
import type { PerspectiveCamera } from 'three'

import { CLOCK_PRIORITY, clock } from '../core/clock.js'
import { motionPolicy } from '../core/motion-policy.js'

/** Options of {@link useCameraRig}. */
export interface CameraRigOptions {
  /** Camera being driven. */
  camera: PerspectiveCamera | null
  /** Element whose hover is observed. Defaults to the whole window. */
  host?: HTMLElement | null
  /** Amplitude of the movement, in world units. @defaultValue 0.4 */
  amplitude?: number
  /** Catch-up speed. Higher is snappier. @defaultValue 3 */
  speed?: number
  /** Distance to the origin, kept during the movement. @defaultValue 5 */
  distance?: number
  /** Name shown in the diagnostics panel. */
  name?: string
}

/**
 * Drifts the camera with the pointer, gently.
 *
 * Under reduced motion, the camera stays still at its rest position: the
 * pointer-driven movement is an embellishment, not content.
 *
 * @example
 * useCameraRig({ camera, host: hostRef.current, amplitude: 0.6 })
 */
export function useCameraRig(options: CameraRigOptions): void {
  const {
    camera,
    host,
    amplitude = 0.4,
    speed = 3,
    distance = 5,
    name = 'camera',
  } = options

  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (camera === null) return
    if (motionPolicy.state.reduced) return

    const surface: HTMLElement | Window = host ?? window

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      const bounds =
        host === null || host === undefined
          ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
          : host.getBoundingClientRect()

      // Normalised coordinates, origin at the centre of the observed area.
      target.current = {
        x: ((pointer.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1,
        y: ((pointer.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1,
      }
    }

    const onLeave = (): void => {
      // Back to rest, rather than freezing on the last known position.
      target.current = { x: 0, y: 0 }
    }

    surface.addEventListener('pointermove', onMove, { passive: true })
    surface.addEventListener('pointerleave', onLeave)

    const subscription = clock.subscribe(
      ({ delta }) => {
        const factor = 1 - Math.exp(-speed * delta)
        current.current.x += (target.current.x - current.current.x) * factor
        current.current.y += (target.current.y - current.current.y) * factor

        camera.position.x = current.current.x * amplitude
        camera.position.y = -current.current.y * amplitude
        camera.position.z = distance
        camera.lookAt(0, 0, 0)
      },
      { priority: CLOCK_PRIORITY.layout, name },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
    }
  }, [camera, host, amplitude, speed, distance, name])
}
