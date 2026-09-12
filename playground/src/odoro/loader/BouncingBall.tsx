/**
 * Balle qui rebondit : une balle tombe, s'ecrase au sol, repart, et son
 * ombre grandit a mesure qu'elle s'approche.
 *
 * ## Une chute n'est pas une montee a l'envers
 *
 * Une balle qui tombe accelere ; une balle qui remonte ralentit. La meme
 * courbe dans les deux sens — l'`ease-in-out` que l'on pose par reflexe —
 * donne une balle qui flotte, sans poids. Ici la chute est en `ease-in`, la
 * remontee en `ease-out`, et entre les deux la balle s'aplatit au sol :
 * c'est l'ecrasement qui dit qu'il y a eu un choc, et la reprise de forme
 * qui dit qu'elle est elastique. L'origine de l'ecrasement est le bas de la
 * balle, pour qu'elle reste posee au sol pendant qu'elle se deforme.
 *
 * L'ombre est ce qui donne la hauteur : sans elle, une balle qui monte et
 * descend est un point qui bouge. Elle se resserre et palit quand la balle
 * est loin, s'etale et fonce quand elle touche. Deux animations, tenues par
 * le compositeur, aucun JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. La balle et son ombre
 * sont retirees de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la balle est posee au sol, sur son ombre pleine :
 * c'est la ou une balle finit toujours, et la figure se reconnait encore.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-bouncing-ball'

/** Hauteur du rebond, en diametres de balle. */
const HEIGHT = 2.4

/** Pose la balle, son ombre et le rebond, une fois par document. */
function ensureBallRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La colonne reserve la hauteur du saut au-dessus de la balle : le
    // chargeur ne change pas de taille selon l'image ou on le regarde.
    '[data-o-bouncing-ball]{',
    'display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-end;',
    `height:calc(var(--o-ball-size) * ${String(HEIGHT + 1.5)});`,
    'width:calc(var(--o-ball-size) * 1.6);',
    '}',
    '[data-o-ball]{',
    'width:var(--o-ball-size);height:var(--o-ball-size);',
    'border-radius:50%;background:var(--o-ball-color);',
    'transform-origin:50% 100%;',
    'animation:o-bouncing-ball-jump var(--o-ball-speed) infinite;',
    '}',
    '[data-o-ball-shadow]{',
    'width:calc(var(--o-ball-size) * 1.2);height:calc(var(--o-ball-size) * 0.28);',
    'margin-top:calc(var(--o-ball-size) * 0.12);',
    'border-radius:50%;background:var(--o-ball-color);opacity:0.4;',
    'animation:o-bouncing-ball-shade var(--o-ball-speed) infinite;',
    '}',
    // Chute en accelerant, ecrasement au sol, remontee en ralentissant.
    '@keyframes o-bouncing-ball-jump{',
    `0%{transform:translateY(calc(var(--o-ball-size) * -${String(HEIGHT)})) scale(1);animation-timing-function:ease-in}`,
    '44%{transform:translateY(0) scale(1);animation-timing-function:ease-out}',
    '50%{transform:translateY(0) scale(1.25,0.72);animation-timing-function:ease-in}',
    '56%{transform:translateY(0) scale(1);animation-timing-function:ease-out}',
    `100%{transform:translateY(calc(var(--o-ball-size) * -${String(HEIGHT)})) scale(1)}`,
    '}',
    // L'ombre suit la hauteur : petite et pale au sommet, large et pleine
    // au contact.
    '@keyframes o-bouncing-ball-shade{',
    '0%{transform:scaleX(0.45);opacity:0.12;animation-timing-function:ease-in}',
    '44%,56%{transform:scaleX(1);opacity:0.4;animation-timing-function:ease-out}',
    '100%{transform:scaleX(0.45);opacity:0.12}',
    '}',
    // Une balle posee sur son ombre : la figure est dite, sans rebond.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ball],[data-o-ball-shadow]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface BouncingBallOwnProps {
  /** Diametre de la balle, en pixels. @defaultValue 12 */
  size?: number
  /** Duree d'un rebond complet, en millisecondes. @defaultValue 800 */
  speed?: number
  /** Couleur de la balle et de son ombre. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type BouncingBallProps = Customisable<BouncingBallOwnProps, 'span'>

/**
 * Signale une attente par une balle qui rebondit sur son ombre.
 *
 * @example
 * <BouncingBall />
 *
 * @example
 * // Plus grosse, plus lente, dans la teinte de marque.
 * <BouncingBall size={18} speed={1200} color="var(--o-palette-brand-500)" />
 */
export function BouncingBall({
  size = 12,
  speed = 800,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: BouncingBallProps): ReactElement {
  ensureBallRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-ball-size': `${String(size)}px`,
    '--o-ball-speed': `${String(speed)}ms`,
    '--o-ball-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-bouncing-ball=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-ball="" />
      <span aria-hidden data-o-ball-shadow="" />
    </span>
  )
}
