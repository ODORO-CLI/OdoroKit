/**
 * Mouvement de camera reagissant au pointeur.
 *
 * ## L'amortissement, et pourquoi il n'est pas cosmetique
 *
 * Suivre le pointeur sans filtre donne une camera nerveuse, qui saute d'une
 * position a l'autre au rythme des evenements du systeme — irreguliers par
 * nature. L'amortissement exponentiel corrige cela : a chaque image, la camera
 * comble une fraction de l'ecart qui la separe de sa cible.
 *
 * Cette fraction doit dependre du temps ecoule, sinon la vitesse du mouvement
 * varierait avec la cadence d'affichage — deux fois plus rapide sur un ecran a
 * cent vingt images par seconde que sur un ecran a soixante. La formule
 * employee, `1 - exp(-vitesse x dt)`, produit le meme mouvement quelle que
 * soit la cadence.
 *
 * @module
 */

import { useEffect, useRef } from 'react'
import type { PerspectiveCamera } from 'three'

import { CLOCK_PRIORITY, clock } from '../core/clock.js'
import { motionPolicy } from '../core/motion-policy.js'

/** Options de {@link useCameraRig}. */
export interface CameraRigOptions {
  /** Camera pilotee. */
  camera: PerspectiveCamera | null
  /** Element dont le survol est observe. Par defaut, la fenetre entiere. */
  host?: HTMLElement | null
  /** Amplitude du deplacement, en unites du monde. @defaultValue 0.4 */
  amplitude?: number
  /** Vitesse de rattrapage. Plus haut, plus sec. @defaultValue 3 */
  speed?: number
  /** Distance a l'origine, conservee pendant le mouvement. @defaultValue 5 */
  distance?: number
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
}

/**
 * Fait deriver la camera avec le pointeur, doucement.
 *
 * Sous mouvement reduit, la camera reste immobile a sa position de repos : le
 * deplacement au pointeur est un agrement, pas un contenu.
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

      // Coordonnees normalisees, origine au centre de la zone observee.
      target.current = {
        x: ((pointer.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1,
        y: ((pointer.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1,
      }
    }

    const onLeave = (): void => {
      // Retour au repos, plutot qu'un gel sur la derniere position connue.
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
