/**
 * Anneau tournant : un seul arc court sur une piste attenuee.
 *
 * ## Une piste et un arc sur le meme element
 *
 * Deux bordures, un seul element. La piste est la bordure entiere, peinte a
 * faible opacite sur les quatre cotes ; l'arc est le cote haut, repeint a
 * pleine couleur. Le compositeur fait tourner l'ensemble : la piste est
 * symetrique, on ne voit donc bouger que l'arc. Aucun JavaScript apres le
 * premier rendu, et rien a synchroniser puisqu'il n'y a qu'une animation.
 *
 * La piste n'est pas un ornement : sans elle, un arc seul flotte et l'oeil
 * ne sait pas ou est le centre. Avec elle, la figure est un cercle complet
 * dont une portion s'eclaire — c'est ce que l'on reconnait comme « ca
 * charge » avant meme le premier tour.
 *
 * ## L'epaisseur change le caractere
 *
 * A deux pixels c'est un filet discret dans un bouton ; a huit, une piece
 * d'interface a part entiere au centre d'une page vide. C'est pour cela que
 * l'epaisseur est un reglage et non une constante deduite de la taille.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. L'anneau, lui, est
 * retire de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, l'arc reste en haut de la piste : la figure se lit
 * encore comme un chargeur, seul le mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-ring-spinner'

/** Pose l'anneau et sa rotation, une fois par document. */
function ensureRingRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ring-spinner]{display:inline-block;line-height:0}',
    '[data-o-ring-arc]{',
    'display:block;box-sizing:border-box;',
    'width:var(--o-ring-size);height:var(--o-ring-size);',
    'border-radius:50%;',
    'border:var(--o-ring-thickness) solid color-mix(in oklab, var(--o-ring-color) 18%, transparent);',
    'border-top-color:var(--o-ring-color);',
    'animation:o-ring-spinner-spin var(--o-ring-speed) linear infinite;',
    '}',
    '@keyframes o-ring-spinner-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    // L'arc s'arrete en haut : c'est la position que l'oeil attend d'un
    // chargeur au repos.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ring-arc]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface RingSpinnerOwnProps {
  /** Diametre de l'anneau, en pixels. @defaultValue 40 */
  size?: number
  /** Epaisseur du trait, en pixels. @defaultValue 4 */
  thickness?: number
  /** Duree d'un tour, en millisecondes. @defaultValue 900 */
  speed?: number
  /** Couleur de l'arc. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type RingSpinnerProps = Customisable<RingSpinnerOwnProps, 'span'>

/**
 * Signale une attente par un arc qui parcourt une piste.
 *
 * @example
 * <RingSpinner />
 *
 * @example
 * // Un filet fin, dans la teinte de marque, pour un bouton.
 * <RingSpinner size={16} thickness={2} color="var(--o-palette-brand-500)" />
 */
export function RingSpinner({
  size = 40,
  thickness = 4,
  speed = 900,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: RingSpinnerProps): ReactElement {
  ensureRingRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-ring-size': `${String(size)}px`,
    // Deux traits doivent tenir dans le diametre : au-dela, l'anneau se
    // remplirait et l'arc disparaitrait.
    '--o-ring-thickness': `${String(Math.min(thickness, size / 2))}px`,
    '--o-ring-speed': `${String(speed)}ms`,
    '--o-ring-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-ring-spinner=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-ring-arc="" />
    </span>
  )
}
