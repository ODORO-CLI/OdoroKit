/**
 * Points qui se poursuivent : une tete et sa trainee tournent en file sur un
 * cercle.
 *
 * ## Une seule rotation, quatre points poses
 *
 * Faire tourner quatre points separement demanderait quatre animations
 * synchronisees au degre pres — et la moindre derive les desalignerait.
 * Ici un seul element tourne : le plateau. Les points y sont poses une fois,
 * chacun a son angle, et ne bougent plus. La poursuite est un effet de
 * placement, pas de mouvement.
 *
 * Les points decroissent en taille et en opacite de la tete a la queue :
 * c'est ce degrade qui donne un sens de marche. Quatre points identiques
 * tourneraient sans qu'on sache lequel mene.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le plateau et ses
 * points sont retires de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le plateau s'arrete : la file — une tete et sa
 * trainee — se lit encore comme un chargeur, seul le tour s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-chasing-dots'

/** Pose le plateau et ses points, une fois par document. */
function ensureChaseRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-chasing-dots]{',
    'position:relative;display:inline-block;',
    'width:var(--o-chase-size);height:var(--o-chase-size);',
    '}',
    '[data-o-chasing-plate]{',
    'position:absolute;inset:0;',
    'animation:o-chasing-dots-spin var(--o-chase-speed) linear infinite;',
    '}',
    // Chaque point part du centre, tourne a son angle, puis s'ecarte
    // jusqu'au bord : le rayon vient de la translation, pas d'un calcul.
    '[data-o-chasing-dot]{',
    'position:absolute;top:50%;left:50%;',
    'width:var(--o-chase-dot);height:var(--o-chase-dot);',
    'margin:calc(var(--o-chase-dot) / -2);',
    'border-radius:50%;background:var(--o-chase-color);',
    'opacity:var(--o-chase-opacity);',
    'transform:rotate(var(--o-chase-angle)) translate3d(0,calc(var(--o-chase-size) / -2 + var(--o-chase-dot) / 2),0);',
    '}',
    '@keyframes o-chasing-dots-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    // La file immobile reste une tete et sa trainee : la figure se lit
    // encore comme un chargeur.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-chasing-plate]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface ChasingDotsOwnProps {
  /** Diametre du cercle parcouru, en pixels. @defaultValue 40 */
  size?: number
  /** Duree d'un tour complet, en millisecondes. @defaultValue 1000 */
  speed?: number
  /** Couleur des points. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type ChasingDotsProps = Customisable<ChasingDotsOwnProps, 'span'>

/**
 * Signale une attente par une file de points qui tourne.
 *
 * @example
 * <ChasingDots />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <ChasingDots size={64} speed={1600} color="var(--o-palette-brand-500)" />
 */
export function ChasingDots({
  size = 40,
  speed = 1000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: ChasingDotsProps): ReactElement {
  ensureChaseRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-chase-size': `${String(size)}px`,
    '--o-chase-speed': `${String(speed)}ms`,
    '--o-chase-color': color,
  } as CSSProperties

  // La tete en premier, puis trois points de plus en plus petits et pales,
  // chacun trente degres derriere le precedent. Le diametre de la tete vaut
  // un cinquieme du cercle : assez pour que la trainee ne se recouvre pas.
  const dots = [0, 1, 2, 3].map((index) => ({
    angle: `${String(-index * 30)}deg`,
    diameter: Math.max(2, Math.round((size / 5) * (1 - index * 0.2))),
    opacity: 1 - index * 0.22,
  }))

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-chasing-dots=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-chasing-plate="">
        {dots.map((dot, index) => (
          <span
            key={index}
            data-o-chasing-dot=""
            style={
              {
                '--o-chase-angle': dot.angle,
                '--o-chase-dot': `${String(dot.diameter)}px`,
                '--o-chase-opacity': String(dot.opacity),
              } as CSSProperties
            }
          />
        ))}
      </span>
    </span>
  )
}
