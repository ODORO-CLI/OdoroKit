/**
 * Glisser avec inertie : l'element se laisse trainer, file sur sa lancee,
 * puis revient a sa place en ressort.
 *
 * ## Une seule integration, deux regimes
 *
 * Pendant la prise, le pointeur ecrit directement la position — un objet
 * tenu doit coller a la main, tout amortissement se sentirait comme du
 * caoutchouc — et la boucle en derive la velocite, lissee d'un cran pour ne
 * pas retenir le bruit d'echantillonnage du dernier evenement.
 *
 * Au lacher, la meme boucle change de regime : la velocite acquise porte
 * l'element, et un ressort amorti le rappelle a l'origine
 * (`a = -ressort x position - friction x velocite`). C'est la physique la plus
 * simple qui donne a la fois la lancee, le depassement elastique et le retour.
 * Le pas de temps est borne : une image longue — onglet revenu au premier
 * plan — ferait exploser l'integration.
 *
 * ## Ce que le composant ne fait pas
 *
 * Pas de clavier : le glisser est un agrement, l'element n'a pas d'etat final
 * a atteindre — il revient toujours a sa place. Sous mouvement reduit, rien
 * n'ecoute et rien ne bouge : la position est fixe.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface InertiaDragOwnProps {
  /** Ce qui se laisse trainer. */
  children: ReactNode
  /** Freinage de la lancee. Plus haut, plus court. @defaultValue 8 */
  friction?: number
  /** Raideur du rappel vers la place d'origine. @defaultValue 120 */
  spring?: number
}

/** Toutes les proprietes. */
export type InertiaDragProps = Customisable<InertiaDragOwnProps>

/**
 * Rend un element trainable, avec inertie et retour elastique.
 *
 * @example
 * <InertiaDrag>
 *   <span className="o-inline-flex o-h-16 o-w-16 o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-current">
 *     Moi
 *   </span>
 * </InertiaDrag>
 *
 * @example
 * // Un retour raide, presque sans depassement.
 * <InertiaDrag friction={20} spring={300}>
 *   <Badge>Promo</Badge>
 * </InertiaDrag>
 */
export function InertiaDrag({
  children,
  friction = 8,
  spring = 120,
  ...rest
}: InertiaDragProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (host === null || reduced) return

    const position = { x: 0, y: 0 }
    const previous = { x: 0, y: 0 }
    const velocity = { x: 0, y: 0 }
    const grip = { x: 0, y: 0 }
    let dragging = false

    const onDown = (event: PointerEvent): void => {
      dragging = true
      grip.x = event.clientX - position.x
      grip.y = event.clientY - position.y
      // La capture garde le suivi meme quand le pointeur sort de l'element :
      // sans elle, un geste vif lache la prise en pleine course.
      host.setPointerCapture(event.pointerId)
      host.style.cursor = 'grabbing'
      event.preventDefault()
    }

    const onMove = (event: PointerEvent): void => {
      if (!dragging) return
      position.x = event.clientX - grip.x
      position.y = event.clientY - grip.y
    }

    const onUp = (): void => {
      dragging = false
      host.style.cursor = ''
    }

    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerup', onUp)
    host.addEventListener('pointercancel', onUp)

    const subscription = clock.subscribe(
      ({ delta }) => {
        // Pas de temps borne : voir l'en-tete du module.
        const dt = Math.min(Math.max(delta, 1 / 240), 1 / 30)

        if (dragging) {
          // La velocite se deduit du chemin parcouru, lissee d'un cran pour
          // que la lancee reflete le geste et non le dernier soubresaut.
          velocity.x += ((position.x - previous.x) / dt - velocity.x) * 0.5
          velocity.y += ((position.y - previous.y) / dt - velocity.y) * 0.5
        } else {
          velocity.x += (-spring * position.x - friction * velocity.x) * dt
          velocity.y += (-spring * position.y - friction * velocity.y) * dt
          position.x += velocity.x * dt
          position.y += velocity.y * dt

          // Au voisinage du repos, on y est : laisser osciller des fractions
          // de pixel garderait la boucle occupee a ne rien montrer.
          if (
            Math.abs(position.x) < 0.1 &&
            Math.abs(position.y) < 0.1 &&
            Math.abs(velocity.x) < 1 &&
            Math.abs(velocity.y) < 1
          ) {
            position.x = 0
            position.y = 0
            velocity.x = 0
            velocity.y = 0
          }
        }

        previous.x = position.x
        previous.y = position.y
        host.style.transform = `translate3d(${position.x.toFixed(2)}px,${position.y.toFixed(2)}px,0)`
      },
      { name: 'inertia-drag', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerup', onUp)
      host.removeEventListener('pointercancel', onUp)
      subscription.unsubscribe()
      host.style.transform = ''
      host.style.cursor = ''
    }
  }, [host, reduced, friction, spring])

  // Sous mouvement reduit, l'element n'est pas trainable : lui laisser le
  // curseur de prise promettrait un geste qui ne repond pas.
  const { className, style } = mergePresentation(
    {
      className: reduced
        ? 'o-inline-block'
        : 'o-inline-block o-cursor-grab o-select-none o-touch-none o-will-change-transform',
    },
    rest,
  )

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      {children}
    </div>
  )
}
