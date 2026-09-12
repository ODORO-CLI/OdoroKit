/**
 * Carre qui s'arrondit : un carre plein fait un demi-tour en devenant rond,
 * puis retrouve ses angles en finissant le tour.
 *
 * ## Le rond cache le milieu du tour
 *
 * Un carre qui tourne sur lui-meme se ressemble tous les quarts de tour :
 * une rotation seule se lirait comme un tremblement. Ici la rotation est
 * couplee au rayon des angles. Au depart, un carre ; a mi-course, un rond ;
 * a l'arrivee, le carre de nouveau. Le moment ou l'on ne saurait pas dire
 * si le carre a tourne est justement celui ou il n'y a plus d'angles a
 * suivre. Ce que l'oeil retient, c'est une forme qui se ramasse en cercle
 * et se redeploie en carre, un tour sur deux dans chaque sens de lecture.
 *
 * La forme se contracte un peu au passage en rond : un rond de meme cote
 * qu'un carre parait plus petit, la contraction accentue le mouvement au
 * lieu de le compenser. C'est une pulsation, pas une correction optique.
 *
 * Un seul element, une seule animation, aucun JavaScript apres le premier
 * rendu. Le rayon de bordure n'est pas tenu par le compositeur, mais sur un
 * element de cette taille le repeint est negligeable.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. La forme, elle, est
 * retiree de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le carre reste droit et plein : la figure se lit
 * encore comme un chargeur, seul le mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-square-morph'

/** Pose la forme et son tour, une fois par document. */
function ensureSquareMorphRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-square-morph]{display:inline-block;line-height:0}',
    '[data-o-square-morph-shape]{',
    'display:block;',
    'width:var(--o-square-size);height:var(--o-square-size);',
    'background:var(--o-square-color);border-radius:12%;',
    'animation:o-square-morph-turn var(--o-square-speed) ease-in-out infinite;',
    '}',
    // Un demi-tour pour devenir rond, un demi-tour pour redevenir carre :
    // la rotation ne s'arrete jamais, seuls les angles vont et viennent.
    '@keyframes o-square-morph-turn{',
    '0%{transform:rotate(0deg) scale(1);border-radius:12%}',
    '50%{transform:rotate(180deg) scale(0.78);border-radius:50%}',
    '100%{transform:rotate(360deg) scale(1);border-radius:12%}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-square-morph-shape]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SquareMorphOwnProps {
  /** Cote du carre, en pixels. @defaultValue 32 */
  size?: number
  /** Duree d'un tour complet, en millisecondes. @defaultValue 1800 */
  speed?: number
  /** Couleur de la forme. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type SquareMorphProps = Customisable<SquareMorphOwnProps, 'span'>

/**
 * Signale une attente par un carre qui tourne en s'arrondissant.
 *
 * @example
 * <SquareMorph />
 *
 * @example
 * // Plus petit, plus vif, dans la teinte de marque.
 * <SquareMorph size={20} speed={1200} color="var(--o-palette-brand-500)" />
 */
export function SquareMorph({
  size = 32,
  speed = 1800,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: SquareMorphProps): ReactElement {
  ensureSquareMorphRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-square-size': `${String(size)}px`,
    '--o-square-speed': `${String(speed)}ms`,
    '--o-square-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-square-morph=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-square-morph-shape="" />
    </span>
  )
}
