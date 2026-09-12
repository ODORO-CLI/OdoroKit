/**
 * Etincelles : de petits traits jaillissent du point d'appui a chaque clic.
 *
 * ## Les etincelles vivent dans le DOM, pas dans l'etat
 *
 * Comme l'onde au clic, chaque rafale cree ses elements, les lance avec
 * l'API Web Animations, et les retire quand l'animation se termine. Porter
 * une rafale dans l'etat React imposerait deux rendus par clic pour des
 * traits que personne ne lit : ils sont decoratifs, ephemeres, et leur cycle
 * de vie est exactement celui de leur animation. `onfinish` est leur seul
 * contrat.
 *
 * ## Une roue reguliere, legerement brouillee
 *
 * Les angles partent d'une repartition reguliere — la rafale couvre tout le
 * tour, aucun cote n'est oublie — puis chaque trait recoit un ecart et une
 * portee tires au sort. Une roue parfaite se lirait comme un mecanisme ;
 * le brouillage la rend organique. Le tirage a lieu au moment du clic, cote
 * client uniquement : il ne peut pas creer d'ecart d'hydratation.
 *
 * Sous mouvement reduit, aucun element n'est cree : l'etincelle n'est qu'un
 * geste, et le geste est ce qu'on nous demande d'omettre.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface ClickSparksOwnProps {
  /** Contenu de la zone cliquable. */
  children: ReactNode
  /** Nombre de traits par clic. @defaultValue 8 */
  count?: number
  /** Portee du jaillissement, en pixels. @defaultValue 48 */
  distance?: number
  /** Duree de la rafale, en millisecondes. @defaultValue 500 */
  duration?: number
  /** Couleur des traits. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type ClickSparksProps = Customisable<ClickSparksOwnProps>

/**
 * Fait jaillir des etincelles de chaque clic sur sa zone.
 *
 * L'enveloppe est transparente : elle se pose autour d'un bouton, d'une
 * carte, d'une zone entiere, sans rien changer a leur mise en page.
 *
 * @example
 * <ClickSparks className="o-rounded-xl">
 *   <button type="button" className="o-px-6 o-py-3">Valider</button>
 * </ClickSparks>
 *
 * @example
 * // Une gerbe teintee, plus ample.
 * <ClickSparks color="var(--o-palette-brand-500)" count={10} distance={64}>
 *   <div className="o-p-8">Toute la carte repond</div>
 * </ClickSparks>
 */
export function ClickSparks({
  children,
  count = 8,
  distance = 48,
  duration = 500,
  color = 'currentColor',
  ...rest
}: ClickSparksProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (host === null || reduced) return

    const onPointerDown = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      const x = event.clientX - box.left
      const y = event.clientY - box.top

      for (let index = 0; index < count; index += 1) {
        // Repartition reguliere sur le tour, puis un ecart tire au sort :
        // voir l'en-tete du module.
        const angle = (index / count) * 360 + Math.random() * (180 / count)
        const reach = distance * (0.7 + Math.random() * 0.6)

        const spark = document.createElement('span')
        spark.style.position = 'absolute'
        spark.style.left = `${String(x)}px`
        spark.style.top = `${String(y)}px`
        spark.style.width = `${String(Math.max(6, Math.round(reach * 0.2)))}px`
        spark.style.height = '2px'
        spark.style.borderRadius = '1px'
        spark.style.background = color
        // Le trait pivote autour du point d'appui, pas de son propre centre :
        // toutes les etincelles partent exactement du meme endroit.
        spark.style.transformOrigin = 'left center'
        spark.style.pointerEvents = 'none'
        spark.setAttribute('aria-hidden', 'true')
        spark.setAttribute('data-o-spark', '')
        host.append(spark)

        const animation = spark.animate(
          [
            { transform: `rotate(${String(angle)}deg) translateX(0) scaleX(1)`, opacity: 1 },
            {
              transform: `rotate(${String(angle)}deg) translateX(${String(Math.round(reach))}px) scaleX(0.4)`,
              opacity: 0,
            },
          ],
          { duration, easing: 'cubic-bezier(0, 0, 0.2, 1)', fill: 'forwards' },
        )
        animation.onfinish = () => spark.remove()
      }
    }

    host.addEventListener('pointerdown', onPointerDown)
    return () => {
      host.removeEventListener('pointerdown', onPointerDown)
      // Les etincelles en vol appartiennent a cette instance : elles partent
      // avec elle.
      for (const orphan of host.querySelectorAll('[data-o-spark]')) {
        orphan.remove()
      }
    }
  }, [host, reduced, count, distance, duration, color])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      // Les traits sont absolus dans la zone, et coupes a ses bords : sans le
      // debordement cache, une gerbe pres du bord s'etalerait sur la page.
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {children}
    </div>
  )
}
