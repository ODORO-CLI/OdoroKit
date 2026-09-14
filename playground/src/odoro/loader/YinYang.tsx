/**
 * Yin et yang : le symbole tourne comme une toupie qu'on relance, deux
 * tours par chiquenaude, en ralentissant jusqu'a presque s'arreter.
 *
 * ## Une seule couleur, et le fond pour l'autre
 *
 * Le symbole en a deux ; le composant n'en connait qu'une. La moitie
 * sombre est un trace ferme — un demi-cercle exterieur et deux
 * demi-cercles interieurs en S — dont l'oeil est un trou, decoupe par la
 * regle `evenodd`. La moitie claire n'est pas dessinee : c'est ce que le
 * fond montre a travers, borde par le cercle exterieur en trait. Le
 * symbole reste donc juste sur n'importe quelle surface, sombre ou claire,
 * sans jamais nommer la couleur du fond.
 *
 * Le mouvement est celui d'une toupie, pas d'une roue : lancee d'un coup,
 * elle file, ralentit longuement, et manque de s'arreter avant d'etre
 * relancee. C'est une seule courbe en `ease-out` prononce sur deux tours,
 * suivie d'un temps d'arret. Une rotation lineaire, le choix par defaut,
 * ferait un disque qui tourne ; ici l'oeil voit le geste qui le relance.
 *
 * Une animation de rotation sur un groupe SVG, tenue par le compositeur,
 * aucun JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le symbole est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le symbole est droit, immobile : c'est la ou la
 * toupie finit, et la figure se reconnait encore.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-yin-yang'

/** Rayon du symbole, dans une vue de 100. */
const RADIUS = 45

/** Rayon de chaque oeil. */
const EYE = 6

/**
 * La moitie sombre : demi-cercle exterieur par la droite, puis le S par
 * deux demi-cercles interieurs, et l'oeil de la moitie sombre en trou.
 */
const DARK = [
  `M 50 ${String(50 - RADIUS)}`,
  `A ${String(RADIUS)} ${String(RADIUS)} 0 0 1 50 ${String(50 + RADIUS)}`,
  `A ${String(RADIUS / 2)} ${String(RADIUS / 2)} 0 0 1 50 50`,
  `A ${String(RADIUS / 2)} ${String(RADIUS / 2)} 0 0 0 50 ${String(50 - RADIUS)}`,
  'Z',
  `M ${String(50 + EYE)} ${String(50 + RADIUS / 2)}`,
  `A ${String(EYE)} ${String(EYE)} 0 1 0 ${String(50 - EYE)} ${String(50 + RADIUS / 2)}`,
  `A ${String(EYE)} ${String(EYE)} 0 1 0 ${String(50 + EYE)} ${String(50 + RADIUS / 2)}`,
  'Z',
].join(' ')

/** Pose le symbole et sa toupie, une fois par document. */
function ensureYinYangRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-yin-yang]{display:inline-block;line-height:0}',
    '[data-o-yin-yang] svg{display:block}',
    '[data-o-yin-yang-disc]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    'animation:o-yin-yang-spin var(--o-yin-yang-speed) infinite;',
    '}',
    // Une chiquenaude : deux tours qui partent vite et s'eteignent, puis
    // un temps d'arret avant la suivante.
    '@keyframes o-yin-yang-spin{',
    '0%{transform:rotate(0deg);animation-timing-function:cubic-bezier(0.1,0.7,0.2,1)}',
    '90%,100%{transform:rotate(720deg)}',
    '}',
    // Le symbole droit : la figure est dite, la toupie posee.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-yin-yang-disc]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface YinYangOwnProps {
  /** Diametre du symbole, en pixels. @defaultValue 44 */
  size?: number
  /** Duree d'une chiquenaude, deux tours et l'arret compris, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur de la moitie sombre et du contour ; l'autre moitie est le fond. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type YinYangProps = Customisable<YinYangOwnProps, 'span'>

/**
 * Signale une attente par un yin et yang qui tourne comme une toupie.
 *
 * @example
 * <YinYang />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <YinYang size={72} speed={4000} color="var(--o-palette-brand-500)" />
 */
export function YinYang({
  size = 44,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: YinYangProps): ReactElement {
  ensureYinYangRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-yin-yang-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-yin-yang=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g data-o-yin-yang-disc="">
          <circle
            cx={50}
            cy={50}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
          />
          <path d={DARK} fill="currentColor" fillRule="evenodd" />
          <circle cx={50} cy={50 - RADIUS / 2} r={EYE} fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}
