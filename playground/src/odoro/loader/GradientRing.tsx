/**
 * Anneau degrade : un degrade conique masque en anneau, en rotation.
 *
 * ## Un degrade, un masque, une rotation
 *
 * Le disque porte un degrade conique qui va du transparent a la couleur
 * pleine sur un tour complet. Un masque radial ne garde que la couronne
 * exterieure : le disque devient un anneau dont l'intensite croit sur tout
 * le tour, sans tete ni queue nettes. C'est ce qui le distingue d'un arc
 * sur une piste : ici rien n'est decoupe, la couleur s'eteint continument.
 *
 * Le degrade se termine par une couture — pleine couleur a 360 degres,
 * transparent a 0 degre. Un point rond de l'epaisseur de l'anneau est pose
 * sur cette couture : il devient la tete du mouvement et arrondit une fin de
 * degrade qui, seule, serait coupee au rasoir.
 *
 * Le masque est un degrade radial dont la couleur ne compte pas, seule son
 * opacite : `currentColor` y fait office de plein, sans introduire une
 * valeur de couleur qui n'appartiendrait a aucun theme.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. L'anneau, lui, est
 * retire de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, l'anneau reste tete en haut : un anneau qui
 * s'eteint sur son tour se lit encore comme un chargeur, seul le mouvement
 * s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-gradient-ring'

/** Pose l'anneau, son masque et sa rotation, une fois par document. */
function ensureGradientRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const mask =
    'radial-gradient(farthest-side, transparent calc(100% - var(--o-grad-thickness)), currentColor calc(100% - var(--o-grad-thickness) + 0.5px))'

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-gradient-ring]{position:relative;display:inline-block;line-height:0}',
    '[data-o-grad-disc]{',
    'position:absolute;inset:0;border-radius:50%;',
    'background:conic-gradient(from 0deg, transparent, var(--o-grad-color));',
    `-webkit-mask:${mask};mask:${mask};`,
    'animation:o-gradient-ring-spin var(--o-grad-speed) linear infinite;',
    '}',
    // La tete : un point rond sur la couture du degrade.
    '[data-o-grad-disc]::after{',
    'content:"";position:absolute;top:0;left:50%;',
    'width:var(--o-grad-thickness);height:var(--o-grad-thickness);',
    'border-radius:50%;background:var(--o-grad-color);',
    'transform:translateX(-50%);',
    '}',
    '@keyframes o-gradient-ring-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-grad-disc]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface GradientRingOwnProps {
  /** Diametre de l'anneau, en pixels. @defaultValue 48 */
  size?: number
  /** Epaisseur de l'anneau, en pixels. @defaultValue 6 */
  thickness?: number
  /** Duree d'un tour, en millisecondes. @defaultValue 1000 */
  speed?: number
  /** Couleur de la tete. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type GradientRingProps = Customisable<GradientRingOwnProps, 'span'>

/**
 * Signale une attente par un anneau qui s'eteint sur son tour.
 *
 * @example
 * <GradientRing />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <GradientRing size={80} thickness={10} speed={1800} color="var(--o-palette-brand-500)" />
 */
export function GradientRing({
  size = 48,
  thickness = 6,
  speed = 1000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: GradientRingProps): ReactElement {
  ensureGradientRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    // Une epaisseur au-dela du rayon fermerait l'anneau en disque.
    '--o-grad-thickness': `${String(Math.min(thickness, size / 2))}px`,
    '--o-grad-speed': `${String(speed)}ms`,
    '--o-grad-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-gradient-ring=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-grad-disc="" />
    </span>
  )
}
