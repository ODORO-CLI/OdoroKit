/**
 * Attraction : un element attire par le pointeur.
 *
 * ## Pourquoi la boucle plutot que l'evenement
 *
 * Reagir directement aux evenements de pointeur donnerait un mouvement dur :
 * l'element sauterait d'une position a l'autre au rythme irregulier ou le
 * systeme les livre. L'evenement ne fait donc que deplacer une **cible**, et
 * la boucle rapproche la position courante de cette cible a chaque image.
 *
 * Le rattrapage est exponentiel et exprime en fonction du temps ecoule :
 * `1 - exp(-vitesse x dt)`. Une fraction constante ferait varier la vitesse du
 * mouvement avec la cadence de l'ecran — deux fois plus rapide a cent vingt
 * images par seconde qu'a soixante — et le meme reglage ne donnerait pas le
 * meme resultat chez deux personnes.
 *
 * ## Le rayon
 *
 * Sans lui, tout element magnetique de la page reagirait a un pointeur situe a
 * l'autre bout. Au-dela du rayon, la cible revient au repos.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  motionPolicy,
  type Customisable,
} from '@odoro/engine'
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface MagneticOwnProps {
  /** Ce qui est attire. */
  children: ReactNode
  /** Fraction de la distance parcourue vers le pointeur. @defaultValue 0.35 */
  strength?: number
  /** Distance au-dela de laquelle l'attraction cesse, en pixels. @defaultValue 120 */
  radius?: number
  /** Vitesse de rattrapage. Plus haut, plus sec. @defaultValue 8 */
  ease?: number
}

/** Toutes les proprietes. */
export type MagneticProps = Customisable<MagneticOwnProps>

/**
 * Rend un element magnetique.
 *
 * @example
 * <Magnetic strength={0.4}>
 *   <button className="o-rounded-full o-px-6 o-py-3">Nous ecrire</button>
 * </Magnetic>
 */
export function Magnetic({
  children,
  strength = 0.35,
  radius = 120,
  ease = 8,
  ...rest
}: MagneticProps): ReactElement {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (host === null) return
    // L'attraction est un agrement : elle n'a pas d'etat final a preserver.
    if (motionPolicy.state.reduced) return

    const onMove = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      const dx = event.clientX - (box.left + box.width / 2)
      const dy = event.clientY - (box.top + box.height / 2)

      target.current =
        Math.hypot(dx, dy) > radius
          ? { x: 0, y: 0 }
          : { x: dx * strength, y: dy * strength }
    }

    const onLeave = (): void => {
      target.current = { x: 0, y: 0 }
    }

    // L'ecoute est posee sur la fenetre : l'attraction doit commencer avant
    // que le pointeur n'atteigne l'element, sans quoi elle ne se voit pas.
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)

    const subscription = clock.subscribe(
      ({ delta }) => {
        const factor = 1 - Math.exp(-ease * delta)
        current.current.x += (target.current.x - current.current.x) * factor
        current.current.y += (target.current.y - current.current.y) * factor
        host.style.transform = `translate3d(${current.current.x.toFixed(2)}px,${current.current.y.toFixed(2)}px,0)`
      },
      { name: 'attraction', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
      host.style.transform = ''
    }
  }, [host, strength, radius, ease])

  const { className, style } = mergePresentation(
    { className: 'o-inline-block o-will-change-transform' },
    rest,
  )

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      {children}
    </div>
  )
}
