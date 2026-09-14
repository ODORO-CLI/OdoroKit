/**
 * Derive des teintes : le cadre est une table de reglage. La position
 * horizontale du pointeur fait tourner les teintes, la verticale monte ou
 * descend la saturation.
 *
 * ## Deux axes, pas un interrupteur
 *
 * Une image qui change de couleur au survol change une fois : c'est un etat.
 * Ici le survol ne declenche rien, il **dose**. On promene le pointeur et
 * l'on cherche le ton, comme sur un correcteur colorimetrique. C'est ce qui
 * distingue cette entree de la bichromie, qui impose deux tons choisis a
 * l'avance, et du glitch, qui separe les couches sans les teindre.
 *
 * ## Une seule propriete animee, deux variables
 *
 * Le filtre est ecrit une fois, en ligne, et ne contient que des variables :
 * `hue-rotate(var(...)) saturate(var(...))`. Le geste n'ecrit donc que deux
 * nombres sur l'element hote, dont l'image herite. Aucun rendu React, une
 * seule propriete recalculee, et une transition courte qui suffit a lisser le
 * pas irregulier auquel le systeme livre les evenements de pointeur.
 *
 * ## Sous mouvement reduit
 *
 * Le filtre n'est pas pose du tout et rien n'ecoute : l'image reste dans ses
 * couleurs d'origine, nette. Une derive de teintes est un agrement, pas une
 * information — il n'y a pas d'etat final a preserver.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface ColorShiftOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur du cadre. @defaultValue 1.777 */
  ratio?: number
  /**
   * Rotation des teintes atteinte aux bords du cadre, en degres.
   *
   * La rotation est symetrique : a gauche elle est negative, a droite
   * positive, et nulle en son milieu — le centre rend l'image telle quelle.
   *
   * @defaultValue 140
   */
  shift?: number
  /** Saturation atteinte en haut du cadre. En bas, l'image est desaturee. @defaultValue 1.6 */
  saturate?: number
  /** Duree du lissage entre deux positions, en millisecondes. @defaultValue 220 */
  duration?: number
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type ColorShiftProps = Customisable<ColorShiftOwnProps, 'img'>

/**
 * Fait deriver les teintes d'une image sous le pointeur.
 *
 * @example
 * <ColorShift src="/photo.jpg" alt="Vue de l atelier" />
 *
 * @example
 * // Derive courte, saturation contenue : un simple frisson de couleur.
 * <ColorShift src="/photo.jpg" alt="" shift={40} saturate={1.2} />
 */
export function ColorShift({
  src,
  alt,
  ratio = 1.777,
  shift = 140,
  saturate = 1.6,
  duration = 220,
  ...rest
}: ColorShiftProps): ReactElement {
  const { reduced } = useMotionState()

  const amplitude = Math.max(0, shift)
  const haut = Math.max(0, saturate)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    '--o-cs-hue': '0deg',
    '--o-cs-sat': '1',
  } as CSSProperties

  /** Ramene une valeur au repos : l'image telle qu'elle a ete fournie. */
  const reposer = (frame: HTMLElement): void => {
    frame.style.setProperty('--o-cs-hue', '0deg')
    frame.style.setProperty('--o-cs-sat', '1')
  }

  return (
    <div
      className={className}
      style={hostStyle}
      onPointerMove={
        reduced
          ? undefined
          : (event) => {
              const frame = event.currentTarget
              const box = frame.getBoundingClientRect()

              // Horizontale ramenee a [-1, 1] : le milieu du cadre ne touche
              // pas aux teintes.
              const x = ((event.clientX - box.left) / Math.max(box.width, 1)) * 2 - 1
              // Verticale ramenee a [0, 1], puis retournee : le haut sature,
              // le bas efface — le sens qu'a un curseur d'intensite.
              const y = 1 - (event.clientY - box.top) / Math.max(box.height, 1)

              frame.style.setProperty('--o-cs-hue', `${(x * amplitude).toFixed(1)}deg`)
              frame.style.setProperty('--o-cs-sat', (y * haut).toFixed(3))
            }
      }
      onPointerLeave={
        reduced
          ? undefined
          : (event) => {
              reposer(event.currentTarget)
            }
      }
    >
      <img
        loading="lazy"
        decoding="async"
        {...rest}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover"
        style={
          reduced
            ? undefined
            : {
                filter: 'hue-rotate(var(--o-cs-hue)) saturate(var(--o-cs-sat))',
                transition: `filter ${String(Math.max(0, duration))}ms var(--o-ease-standard)`,
              }
        }
      />
    </div>
  )
}
