/**
 * Double anneau : deux anneaux a deux arcs opposes, en sens contraire.
 *
 * ## Deux arcs par anneau, et non un seul
 *
 * Chaque anneau peint deux cotes opposes de sa bordure — haut et bas pour
 * l'exterieur, gauche et droite pour l'interieur — et tourne a la meme
 * vitesse que l'autre, mais dans l'autre sens. La symetrie d'ordre deux
 * change tout par rapport a un arc unique : les quatre arcs se croisent
 * deux fois par tour, toujours aux memes endroits, et c'est ce croisement
 * regulier — pas la vitesse — qui donne l'impression d'un mecanisme.
 *
 * Meme vitesse, c'est voulu : a des vitesses differentes les croisements
 * deriveraient, et la figure perdrait son rythme.
 *
 * Deux animations declarees une fois, tenues par le compositeur. Aucun
 * JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les anneaux, eux,
 * sont retires de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les arcs restent en croix — deux en haut et en
 * bas, deux a gauche et a droite : la figure se lit encore comme un
 * chargeur, seul le mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-dual-ring'

/** Pose les deux anneaux et leurs rotations, une fois par document. */
function ensureDualRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dual-ring]{position:relative;display:inline-block;line-height:0}',
    '[data-o-dual-outer],[data-o-dual-inner]{',
    'position:absolute;box-sizing:border-box;border-radius:50%;',
    'border:var(--o-dual-thickness) solid transparent;',
    'animation:o-dual-ring-spin var(--o-dual-speed) linear infinite;',
    '}',
    '[data-o-dual-outer]{',
    'inset:0;',
    'border-top-color:var(--o-dual-color);border-bottom-color:var(--o-dual-color);',
    '}',
    // L'anneau interieur laisse un espace d'une epaisseur entre les deux
    // traits : colles, les arcs ne se distingueraient plus au croisement.
    '[data-o-dual-inner]{',
    'inset:calc(var(--o-dual-thickness) * 2);',
    'border-left-color:var(--o-dual-color);border-right-color:var(--o-dual-color);',
    'opacity:0.7;animation-direction:reverse;',
    '}',
    '@keyframes o-dual-ring-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-dual-outer],[data-o-dual-inner]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface DualRingOwnProps {
  /** Diametre de l'anneau exterieur, en pixels. @defaultValue 48 */
  size?: number
  /** Epaisseur des traits, en pixels. @defaultValue 3 */
  thickness?: number
  /** Duree d'un tour, en millisecondes. @defaultValue 1200 */
  speed?: number
  /** Couleur des arcs. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type DualRingProps = Customisable<DualRingOwnProps, 'span'>

/**
 * Signale une attente par deux anneaux qui se croisent en rythme.
 *
 * @example
 * <DualRing />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <DualRing size={80} thickness={5} speed={2000} color="var(--o-palette-brand-500)" />
 */
export function DualRing({
  size = 48,
  thickness = 3,
  speed = 1200,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: DualRingProps): ReactElement {
  ensureDualRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    // Deux traits et un espace doivent tenir dans le rayon.
    '--o-dual-thickness': `${String(Math.min(thickness, size / 6))}px`,
    '--o-dual-speed': `${String(speed)}ms`,
    '--o-dual-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-dual-ring=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-dual-outer="" />
      <span aria-hidden data-o-dual-inner="" />
    </span>
  )
}
