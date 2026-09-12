/**
 * Onde au clic : un cercle part du point touche et s'etend jusqu'aux bords.
 *
 * ## L'onde vit dans le DOM, pas dans l'etat
 *
 * Chaque clic cree un element, le lance avec l'API Web Animations, et le
 * retire quand l'animation se termine. Porter les ondes dans l'etat React
 * imposerait un rendu par clic et un autre par disparition, pour des
 * elements que personne ne lit : ils sont decoratifs, ephemeres, et leur
 * cycle de vie est exactement celui de leur animation. `onfinish` est leur
 * seul contrat.
 *
 * ## Le rayon est calcule, pas devine
 *
 * L'onde doit atteindre le coin le plus lointain de la zone, quel que soit
 * l'endroit du clic. Le rayon final est donc la distance au coin le plus
 * eloigne — un cercle a taille fixe paraitrait court pres des bords et
 * demesure au centre.
 *
 * Sous mouvement reduit, aucun element n'est cree : l'onde n'est qu'un
 * geste, et le geste est ce qu'on nous demande d'omettre.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface RippleClickOwnProps {
  /** Contenu de la zone cliquable. */
  children: ReactNode
  /** Duree de l'expansion, en millisecondes. @defaultValue 600 */
  duration?: number
  /** Opacite de depart de l'onde. @defaultValue 0.25 */
  opacity?: number
  /** Couleur de l'onde. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type RippleClickProps = Customisable<RippleClickOwnProps>

/**
 * Fait partir une onde de chaque clic sur sa zone.
 *
 * L'enveloppe est transparente : elle se pose autour d'un bouton, d'une
 * carte, d'une ligne de tableau, sans rien changer a leur mise en page.
 *
 * @example
 * <RippleClick className="o-rounded-xl">
 *   <button type="button" className="o-px-6 o-py-3">Valider</button>
 * </RippleClick>
 *
 * @example
 * // Une onde teintee, plus lente.
 * <RippleClick color="var(--o-palette-brand-500)" duration={900} opacity={0.2}>
 *   <div className="o-p-8">Toute la carte repond</div>
 * </RippleClick>
 */
export function RippleClick({
  children,
  duration = 600,
  opacity = 0.25,
  color = 'currentColor',
  ...rest
}: RippleClickProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (host === null || reduced) return

    const onPointerDown = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      const x = event.clientX - box.left
      const y = event.clientY - box.top

      // Distance au coin le plus lointain : l'onde couvre toute la zone,
      // d'ou que parte le clic.
      const radius = Math.hypot(
        Math.max(x, box.width - x),
        Math.max(y, box.height - y),
      )

      const ripple = document.createElement('span')
      ripple.style.position = 'absolute'
      ripple.style.left = `${String(x - radius)}px`
      ripple.style.top = `${String(y - radius)}px`
      ripple.style.width = `${String(radius * 2)}px`
      ripple.style.height = `${String(radius * 2)}px`
      ripple.style.borderRadius = '50%'
      ripple.style.background = color
      ripple.style.pointerEvents = 'none'
      ripple.setAttribute('aria-hidden', 'true')
      ripple.setAttribute('data-o-ripple', '')
      host.append(ripple)

      const animation = ripple.animate(
        [
          { transform: 'scale(0)', opacity },
          { transform: 'scale(1)', opacity: 0 },
        ],
        { duration, easing: 'ease-out', fill: 'forwards' },
      )
      animation.onfinish = () => ripple.remove()
    }

    host.addEventListener('pointerdown', onPointerDown)
    return () => {
      host.removeEventListener('pointerdown', onPointerDown)
      // Les ondes en vol appartiennent a cette instance : elles partent
      // avec elle.
      for (const orphan of host.querySelectorAll('[data-o-ripple]')) {
        orphan.remove()
      }
    }
  }, [host, reduced, duration, opacity, color])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      // L'onde est absolue dans la zone, et coupee a ses bords : sans le
      // debordement cache, elle s'etendrait sur toute la page.
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {children}
    </div>
  )
}
