/**
 * Goutte qui tombe : une goutte se detache, s'allonge en chutant, s'ecrase
 * sur la surface, et une onde unique part du point d'impact.
 *
 * ## L'etirement fait la chute
 *
 * Une goutte qui descend a forme constante ressemble a une bille. Ce qui
 * dit « liquide », c'est la deformation : la goutte s'affine en prenant de
 * la vitesse, puis s'aplatit d'un coup au contact. Les deux echelles sont
 * portees par la meme transformation que la position — un seul groupe, une
 * seule animation, et l'ordre des fonctions garantit que l'ecrasement se
 * fait bien autour du centre de la goutte et non de la vue.
 *
 * La chute occupe les deux tiers du cycle, l'impact un dixieme, et le reste
 * est un temps mort. Sans ce temps mort, la goutte suivante partirait
 * pendant que l'onde s'etale encore, et l'oeil ne saurait plus laquelle
 * regarder.
 *
 * ## Une seule onde
 *
 * L'onde est une ellipse — pas un cercle : la surface est vue de biais, et
 * un cercle la ferait basculer a plat. Elle nait petite et vive au moment
 * exact de l'impact, s'elargit et s'eteint. Une seule suffit : c'est la
 * consequence d'un evenement unique, pas un battement. C'est la ce qui
 * separe ce chargeur d'ondes concentriques, ou les anneaux se relaient sans
 * cause visible.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la goutte reste suspendue juste au-dessus de la
 * surface et l'onde reste naissante : les deux moities de l'histoire sont
 * visibles d'un coup, sans mouvement.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-water-drop'

/** Hauteur de la surface, en unites de la vue. */
const SURFACE = 74

/**
 * Trace de la goutte, centre sur son origine locale.
 *
 * Pointe en haut, ventre en bas : c'est la forme d'une goutte en chute
 * libre, pas celle d'une larme au repos.
 */
const DROP =
  'M 0 -15 C 6.4 -5.4 9.5 -1.4 9.5 4 C 9.5 10.1 5.2 15 0 15 C -5.2 15 -9.5 10.1 -9.5 4 C -9.5 -1.4 -6.4 -5.4 0 -15 Z'

/** Pose la goutte, son impact et son onde, une fois par document. */
function ensureDropRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-water-drop]{display:inline-block;line-height:0}',
    '[data-o-water-drop] svg{display:block}',
    // L'origine est celle de la vue : les fonctions de transformation
    // placent la goutte, puis la deforment autour de son propre centre.
    '[data-o-water-drop-body],[data-o-water-drop-ring]{',
    'transform-box:view-box;transform-origin:0 0;',
    '}',
    '[data-o-water-drop-body]{',
    'animation:o-water-drop-fall var(--o-drop-speed) linear infinite;',
    '}',
    // Les positions sont celles du centre de la goutte : a chaque etape,
    // c'est sa demi-hauteur, echelle comprise, qui dit ou est son ventre.
    '@keyframes o-water-drop-fall{',
    '0%{transform:translate(50px,15px) scale(0.7,1.15);opacity:0}',
    '8%{transform:translate(50px,20px) scale(0.8,1.1);opacity:1}',
    // La chute accelere : la moitie du chemin est faite au tiers du temps.
    '38%{transform:translate(50px,34px) scale(0.78,1.18)}',
    '62%{transform:translate(50px,55px) scale(0.72,1.32);opacity:1}',
    `70%{transform:translate(50px,${String(SURFACE - 5)}px) scale(1.45,0.34);opacity:0.85}`,
    `78%,100%{transform:translate(50px,${String(SURFACE - 2)}px) scale(1.9,0.12);opacity:0}`,
    '}',
    '[data-o-water-drop-ring]{',
    `transform-origin:50px ${String(SURFACE)}px;`,
    'animation:o-water-drop-spread var(--o-drop-speed) ease-out infinite;',
    '}',
    // L'onde n'existe qu'apres l'impact : avant, elle est a zero.
    '@keyframes o-water-drop-spread{',
    '0%,66%{transform:scale(0.12);opacity:0}',
    '72%{transform:scale(0.3);opacity:0.9}',
    '100%{transform:scale(1);opacity:0}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-water-drop-body]{animation:none;transform:translate(50px,50px) scale(0.75,1.25);opacity:1}',
    '[data-o-water-drop-ring]{animation:none;transform:scale(0.4);opacity:0.5}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface WaterDropOwnProps {
  /** Cote de la zone de dessin, en pixels. @defaultValue 64 */
  size?: number
  /** Duree d'un cycle, chute et onde comprises, en millisecondes. @defaultValue 2000 */
  speed?: number
  /** Couleur de la goutte, de l'onde et de la surface. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type WaterDropProps = Customisable<WaterDropOwnProps, 'span'>

/**
 * Signale une attente par une goutte qui tombe et ride la surface.
 *
 * @example
 * <WaterDrop />
 *
 * @example
 * // Plus grande, plus lente, dans la teinte de marque.
 * <WaterDrop size={96} speed={3200} color="var(--o-palette-brand-500)" />
 */
export function WaterDrop({
  size = 64,
  speed = 2000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: WaterDropProps): ReactElement {
  ensureDropRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-drop-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-water-drop=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <line
          x1="14"
          y1={SURFACE}
          x2="86"
          y2={SURFACE}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.28}
        />
        <ellipse
          data-o-water-drop-ring=""
          cx="50"
          cy={SURFACE}
          rx="34"
          ry="8"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          // Sans cela, l'echelle epaissirait le trait a mesure que l'onde
          // s'elargit : une ride qui grossit en s'eloignant.
          vectorEffect="non-scaling-stroke"
        />
        <g data-o-water-drop-body="">
          <path d={DROP} fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}
