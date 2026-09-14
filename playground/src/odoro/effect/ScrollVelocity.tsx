/**
 * Inclinaison au defilement : le conteneur penche avec la vitesse, pas la
 * position.
 *
 * ## La vitesse se mesure dans la boucle, pas dans l'evenement
 *
 * L'evenement `scroll` arrive par paquets irreguliers ; en deriver une
 * vitesse donnerait une valeur qui saute. La position est donc relevee a
 * chaque image de la boucle du moteur, et la vitesse est le delta divise par
 * le temps ecoule — puis lissee par amortissement exponentiel, en fonction du
 * temps (`1 - exp(-amortissement x dt)`), pour que le meme reglage donne le
 * meme mouvement a soixante comme a cent vingt images par seconde. A l'arret,
 * la vitesse lissee retombe d'elle-meme : le retour amorti n'est pas un
 * second mecanisme, c'est le meme.
 *
 * ## Deux variables CSS, un transform pose une fois
 *
 * La boucle n'ecrit que `--o-sv-skew` et `--o-sv-shift` ; le transform qui
 * les consomme est pose au rendu, une fois. L'inclinaison et le decalage sont
 * bornes : une vitesse de defilement n'a pas de plafond, une inclinaison
 * lisible en a un.
 *
 * Sous mouvement reduit, aucune souscription : le conteneur est immobile.
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
export interface ScrollVelocityOwnProps {
  /** Contenu qui s'incline. */
  children: ReactNode
  /** Ampleur de l'inclinaison et du decalage. @defaultValue 1 */
  strength?: number
  /** Vitesse du lissage et du retour. Plus haut, plus sec. @defaultValue 8 */
  damping?: number
}

/** Toutes les proprietes. */
export type ScrollVelocityProps = Customisable<ScrollVelocityOwnProps>

/** Borne une valeur dans un intervalle symetrique. */
function clamp(value: number, limit: number): number {
  return Math.min(limit, Math.max(-limit, value))
}

/**
 * Premier ancetre qui defile reellement, ou rien : la page servira.
 *
 * Sans cette remontee, un conteneur pose dans une zone a defilement interne
 * — un apercu, un panneau — ne pencherait jamais : `window.scrollY` n'y
 * bouge pas.
 */
function findScroller(start: HTMLElement): HTMLElement | null {
  let node = start.parentElement
  while (node !== null) {
    const overflow = getComputedStyle(node).overflowY
    if (
      (overflow === 'auto' || overflow === 'scroll') &&
      node.scrollHeight > node.clientHeight
    ) {
      return node
    }
    node = node.parentElement
  }
  return null
}

/**
 * Incline son contenu proportionnellement a la vitesse de defilement.
 *
 * @example
 * <ScrollVelocity className="o-space-y-8">
 *   {cartes.map((carte) => <Carte key={carte.id} {...carte} />)}
 * </ScrollVelocity>
 *
 * @example
 * // Une inclinaison discrete, au retour tres mou.
 * <ScrollVelocity strength={0.5} damping={4}>
 *   <img src={affiche} alt="Affiche du festival" />
 * </ScrollVelocity>
 */
export function ScrollVelocity({
  children,
  strength = 1,
  damping = 8,
  ...rest
}: ScrollVelocityProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (host === null || reduced) return

    const scroller = findScroller(host)
    const read = (): number => (scroller === null ? window.scrollY : scroller.scrollTop)

    let previous = read()
    let velocity = 0

    const subscription = clock.subscribe(
      ({ delta }) => {
        const dt = Math.max(delta, 1 / 240)
        const position = read()
        // Vitesse instantanee en pixels par seconde, puis lissage dependant
        // du temps : voir l'en-tete du module.
        const instant = (position - previous) / dt
        previous = position
        velocity += (instant - velocity) * (1 - Math.exp(-damping * dt))

        const skew = clamp(velocity * 0.004 * strength, 6)
        const shift = clamp(velocity * 0.015 * strength, 24)
        host.style.setProperty('--o-sv-skew', `${skew.toFixed(3)}deg`)
        host.style.setProperty('--o-sv-shift', `${shift.toFixed(2)}px`)
      },
      { name: 'scroll-velocity', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      subscription.unsubscribe()
      host.style.removeProperty('--o-sv-skew')
      host.style.removeProperty('--o-sv-shift')
    }
  }, [host, reduced, strength, damping])

  const { className, style } = mergePresentation(
    { className: 'o-will-change-transform' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      // Le transform est pose une fois ; la boucle n'ecrit que les deux
      // variables. Sans souscription, les replis valent zero : immobile.
      style={{
        transform: 'translateY(var(--o-sv-shift, 0px)) skewY(var(--o-sv-skew, 0deg))',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
