/**
 * Trajectoire de camera pilotee par le defilement.
 *
 * La progression vient du declencheur de defilement du moteur, donc de la meme
 * boucle que le rendu : la camera est deplacee **avant** que l'image ne soit
 * produite, dans la meme frame. Une lecture independante du defilement
 * introduirait un decalage d'une image entre la position et ce qui est
 * dessine — le tremblement caracteristique des scenes pilotees au scroll.
 *
 * @module
 */

import { useEffect, useRef } from 'react'
import type { PerspectiveCamera } from 'three'

import { motionPolicy } from '../core/motion-policy.js'
import { registry } from '../core/registry.js'
import { loadScrollTrigger } from '../gsap/setup.js'

/** Un point de la trajectoire. */
export interface CameraKeyframe {
  /** Position sur la trajectoire, de 0 a 1. */
  at: number
  /** Position de la camera. */
  position: readonly [number, number, number]
  /** Point regarde. @defaultValue l'origine */
  lookAt?: readonly [number, number, number]
}

/** Options de {@link useScrollCamera}. */
export interface ScrollCameraOptions {
  /** Camera pilotee. */
  camera: PerspectiveCamera | null
  /** Element dont le defilement pilote la trajectoire. */
  host: HTMLElement | null
  /** Points de la trajectoire, dans l'ordre croissant. */
  keyframes: readonly CameraKeyframe[]
  /** Debut de la plage observee. @defaultValue 'top top' */
  start?: string
  /** Fin de la plage observee. @defaultValue 'bottom bottom' */
  end?: string
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
}

/** Interpole lineairement entre deux nombres. */
function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount
}

/**
 * Place la camera sur une trajectoire, selon la progression du defilement.
 *
 * Sous mouvement reduit, la camera est placee une fois au dernier point : la
 * scene est vue dans son etat final plutot que figee a son point de depart.
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

    /** Place la camera a une progression donnee. */
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
      // Etat final : la scene est vue telle qu'elle serait a la fin du
      // defilement, plutot que figee a son point de depart.
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
