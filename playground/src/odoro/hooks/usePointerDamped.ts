/**
 * Position du pointeur, normalisee et lissee.
 *
 * ## La technique
 *
 * Suivre le pointeur sans filtre donne un mouvement nerveux : les evenements
 * du systeme arrivent a un rythme irregulier, et chacun deplace la valeur d'un
 * saut. L'amortissement exponentiel corrige cela — a chaque image, la valeur
 * comble une fraction de l'ecart qui la separe de sa cible.
 *
 * Cette fraction depend du temps ecoule. Employer une constante ferait varier
 * la vitesse du mouvement avec la cadence d'affichage : deux fois plus rapide
 * sur un ecran a cent vingt images par seconde. La formule
 * `1 - exp(-vitesse x dt)` produit le meme mouvement quelle que soit la
 * cadence, ce qui est la seule facon d'obtenir un reglage qui se comporte
 * pareil chez tout le monde.
 *
 * ## Pourquoi une ref plutot qu'un etat
 *
 * La valeur change a chaque image. La rendre comme etat provoquerait un rendu
 * React par image — soixante par seconde, pour deplacer un objet que React ne
 * dessine meme pas. La lecture se fait donc dans la boucle, ou l'on est deja.
 *
 * @module
 */

import { CLOCK_PRIORITY, clock, motionPolicy } from '@odoro/engine'
import { type RefObject, useEffect, useRef } from 'react'

/** Position normalisee, origine au centre, bornee a [-1, 1]. */
export interface PointerPosition {
  x: number
  y: number
}

/** Options de `usePointerDamped`. */
export interface PointerDampedOptions {
  /** Zone observee. Par defaut, la fenetre entiere. */
  host?: HTMLElement | null
  /** Vitesse de rattrapage. Plus haut, plus sec. @defaultValue 3 */
  speed?: number
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
}

/**
 * Suit le pointeur avec amortissement.
 *
 * Sous mouvement reduit, la valeur reste au repos : le suivi du pointeur est
 * un agrement, pas un contenu.
 *
 * @returns Une ref dont `.current` est lue dans la boucle de rendu.
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
  const { host, speed = 3, name = 'pointeur' } = options

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
      },
      // Avant le rendu : la valeur lue par la scene est celle de cette image.
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
