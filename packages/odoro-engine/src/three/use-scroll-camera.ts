/**
 * Camera path driven by the scroll.
 *
 * The progress comes from the engine's scroll trigger, and therefore from the
 * same loop as the rendering: the camera is moved **before** the frame is
 * produced, within the same frame. An independent reading of the scroll would
 * introduce a one-frame gap between the position and what is drawn — the
 * characteristic jitter of scroll-driven scenes.
 *
 * @module
 */

import { useEffect, useRef } from 'react'
import type { PerspectiveCamera } from 'three'

import { motionPolicy } from '../core/motion-policy.js'
import { registry } from '../core/registry.js'
import { loadScrollTrigger } from '../gsap/setup.js'

/** A point of the path. */
export interface CameraKeyframe {
  /** Position along the path, from 0 to 1. */
  at: number
  /** Position of the camera. */
  position: readonly [number, number, number]
  /** Point looked at. @defaultValue the origin */
  lookAt?: readonly [number, number, number]
}

/** Options of {@link useScrollCamera}. */
export interface ScrollCameraOptions {
  /** Camera being driven. */
  camera: PerspectiveCamera | null
  /** Element whose scroll drives the path. */
  host: HTMLElement | null
  /** Points of the path, in increasing order. */
  keyframes: readonly CameraKeyframe[]
  /** Start of the observed range. @defaultValue 'top top' */
  start?: string
  /** End of the observed range. @defaultValue 'bottom bottom' */
  end?: string
  /** Name shown in the diagnostics panel. */
  name?: string
}

/** Interpolates linearly between two numbers. */
function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount
}

/**
 * Places the camera on a path, according to the scroll progress.
 *
 * Under reduced motion, the camera is placed once at the last point: the scene
 * is seen in its final state rather than frozen at its starting point.
 *
 * @example
 * useScrollCamera({
 *   camera,
 *   host: sectionRef.current,
 *   keyframes: [
 *     { at: 0, position: [0, 0, 8] },
 *     { at: 1, position: [2, 1, 3], lookAt: [0, 0.5, 0] },
 *   ],
 * })
 */
export function useScrollCamera(options: ScrollCameraOptions): void {
  const {
    camera,
    host,
    keyframes,
    start = 'top top',
    end = 'bottom bottom',
    name = 'camera-scroll',
  } = options

  const framesRef = useRef(keyframes)
  framesRef.current = keyframes

  useEffect(() => {
    if (camera === null || host === null) return

    /** Places the camera at a given progress. */
    const place = (progress: number): void => {
      const frames = framesRef.current
      const first = frames[0]
      if (first === undefined) return

      let previous = first
      let next = first

      for (const frame of frames) {
        if (frame.at <= progress) previous = frame
        else {
          next = frame
          break
        }
      }
      if (next.at <= previous.at) next = previous

      const span = next.at - previous.at
      const local = span === 0 ? 0 : (progress - previous.at) / span

      camera.position.set(
        lerp(previous.position[0], next.position[0], local),
        lerp(previous.position[1], next.position[1], local),
        lerp(previous.position[2], next.position[2], local),
      )

      const from = previous.lookAt ?? ([0, 0, 0] as const)
      const to = next.lookAt ?? ([0, 0, 0] as const)
      camera.lookAt(
        lerp(from[0], to[0], local),
        lerp(from[1], to[1], local),
        lerp(from[2], to[2], local),
      )
    }

    if (motionPolicy.state.reduced) {
      // Final state: the scene is seen as it would be at the end of the
      // scroll, rather than frozen at its starting point.
      place(1)
      return
    }

    let cancelled = false
    let trigger: ScrollTrigger | undefined
    let handle: ReturnType<typeof registry.register> | undefined

    void loadScrollTrigger().then((ScrollTriggerClass) => {
      if (ScrollTriggerClass === null || cancelled) return

      trigger = ScrollTriggerClass.create({
        trigger: host,
        start,
        end,
        scrub: true,
        onUpdate: (self) => place(self.progress),
      })

      handle = registry.register({
        kind: 'scroll-trigger',
        name,
        dispose: () => trigger?.kill(),
      })
    })

    return () => {
      cancelled = true
      handle?.release()
      trigger?.kill()
    }
  }, [camera, host, start, end, name])
}
