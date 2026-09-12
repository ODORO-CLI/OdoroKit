/**
 * Points en couronne : des points fixes en cercle, l'eclat tourne de l'un a
 * l'autre.
 *
 * ## Les points ne bougent pas, l'eclat si
 *
 * Chaque point est pose a sa place sur la couronne et n'en bouge plus : sa
 * seule vie est son opacite, qui tombe lineairement du plein au pale sur un
 * cycle. Un delai negatif par point, proportionnel a sa place, decale les
 * cycles : le point le plus vif est toujours suivi d'une trainee de points
 * de plus en plus pales, et cette trainee tourne. C'est le chargeur des
 * systemes d'exploitation depuis vingt ans, et il est reconnu avant meme
 * d'avoir tourne.
 *
 * Le placement se fait par une rotation autour du centre de la couronne,
 * pas par des coordonnees calculees : l'origine de la transformation est
 * deplacee au centre, et chaque point n'a qu'un angle. Aucune
 * trigonometrie, et la couronne reste exacte a toute taille.
 *
 * Aucun JavaScript apres le premier rendu : une animation d'opacite par
 * point, tenue par le compositeur.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les points, eux, sont
 * retires de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, tous les points restent pleins : une couronne de
 * points se lit encore comme un chargeur, seul le mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-ring-dots'

/** Pose les points et leur fondu, une fois par document. */
function ensureRingDotsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ring-dots]{position:relative;display:inline-block;line-height:0}',
    // Le point est pose au sommet, puis tourne autour du centre de la
    // couronne : l'origine de sa transformation est ramenee a ce centre.
    '[data-o-ring-dot]{',
    'position:absolute;top:0;left:50%;',
    'width:var(--o-rd-dot);height:var(--o-rd-dot);',
    'margin-left:calc(var(--o-rd-dot) / -2);',
    'border-radius:50%;background:var(--o-rd-color);',
    'transform-origin:50% calc(var(--o-rd-size) / 2);',
    'transform:rotate(var(--o-rd-angle));',
    'animation:o-ring-dots-fade var(--o-rd-speed) linear infinite;',
    'animation-delay:var(--o-rd-delay);',
    '}',
    '@keyframes o-ring-dots-fade{from{opacity:1}to{opacity:0.15}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ring-dot]{animation:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface RingDotsOwnProps {
  /** Diametre de la couronne, en pixels. @defaultValue 40 */
  size?: number
  /** Diametre d'un point, en pixels. @defaultValue 6 */
  dot?: number
  /** Nombre de points sur la couronne. @defaultValue 8 */
  count?: number
  /** Duree pour que l'eclat fasse le tour, en millisecondes. @defaultValue 1000 */
  speed?: number
  /** Couleur des points. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type RingDotsProps = Customisable<RingDotsOwnProps, 'span'>

/**
 * Signale une attente par un eclat qui tourne sur une couronne de points.
 *
 * @example
 * <RingDots />
 *
 * @example
 * // Douze points fins, dans la teinte de marque.
 * <RingDots count={12} dot={4} color="var(--o-palette-brand-500)" />
 */
export function RingDots({
  size = 40,
  dot = 6,
  count = 8,
  speed = 1000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: RingDotsProps): ReactElement {
  ensureRingDotsRule()

  const { className, style } = mergePresentation({}, rest)

  const total = Math.max(1, Math.round(count))

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    '--o-rd-size': `${String(size)}px`,
    '--o-rd-dot': `${String(Math.min(dot, size / 2))}px`,
    '--o-rd-speed': `${String(speed)}ms`,
    '--o-rd-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-ring-dots=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          aria-hidden
          data-o-ring-dot=""
          style={
            {
              '--o-rd-angle': `${String((index * 360) / total)}deg`,
              // Le delai remonte le long du tour, en negatif : l'eclat
              // avance dans le sens horaire et la trainee est complete des
              // la premiere image.
              '--o-rd-delay': `${String(Math.round((-speed * (total - index)) / total))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}
