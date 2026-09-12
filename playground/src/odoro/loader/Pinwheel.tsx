/**
 * Moulinet : quatre pales triangulaires en deux nuances tournent par
 * rafales, une acceleration et un ralenti par demi-tour.
 *
 * ## Tourner comme sous le vent
 *
 * Un moulinet ne tourne pas a vitesse constante : il part sous une rafale,
 * ralentit, repart. La rotation est donc decoupee en deux demi-tours, chacun
 * avec sa propre acceleration et son propre ralenti. Un moulinet a quatre
 * pales en deux nuances est identique a lui-meme tous les demi-tours : la
 * boucle est invisible, et l'oeil ne voit que des rafales.
 *
 * ## Une pale, quatre fois
 *
 * Chaque pale est un carre coupe en triangle par un `clip-path`, dont l'un
 * des sommets est le centre du moulinet. Les quatre pales sont le meme
 * element, tourne d'un quart de tour a chaque fois autour de ce sommet.
 * Une pale sur deux est attenuee : sans cette alternance, quatre triangles
 * de la meme couleur forment un carre plein et rien ne tourne.
 *
 * Le moyeu est un point rond au centre : il cache la jonction des quatre
 * sommets, qui ne tombe jamais exactement juste au pixel pres.
 *
 * Une seule animation, sur le conteneur des pales, tenue par le
 * compositeur. Aucun JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le moulinet, lui, est
 * retire de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le moulinet reste immobile : quatre pales en deux
 * nuances se lisent encore comme un chargeur, seul le vent tombe.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-pinwheel'

/** Pose les pales et leurs rafales, une fois par document. */
function ensurePinwheelRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pinwheel]{display:inline-block;line-height:0}',
    '[data-o-pinwheel-wheel]{',
    'display:block;position:relative;',
    'width:var(--o-pinwheel-size);height:var(--o-pinwheel-size);',
    'animation:o-pinwheel-gust var(--o-pinwheel-speed) infinite;',
    '}',
    // Une pale occupe le quart haut droit ; son sommet bas gauche est le
    // centre du moulinet, et c'est autour de lui que les copies tournent.
    '[data-o-pinwheel-blade]{',
    'position:absolute;top:0;left:50%;width:50%;height:50%;',
    'background:color-mix(in oklab, var(--o-pinwheel-color) var(--o-pinwheel-shade), transparent);',
    'clip-path:polygon(0 100%, 0 0, 100% 100%);',
    'transform-origin:0 100%;transform:rotate(var(--o-pinwheel-angle));',
    '}',
    '[data-o-pinwheel-hub]{',
    'position:absolute;top:50%;left:50%;width:22%;height:22%;',
    'border-radius:50%;background:var(--o-pinwheel-color);',
    'transform:translate(-50%,-50%);',
    '}',
    // Deux rafales par tour, chacune avec son elan et son ralenti : un
    // `ease-in-out` par demi-tour, pas un lineaire sur le tour entier.
    '@keyframes o-pinwheel-gust{',
    '0%{transform:rotate(0deg);animation-timing-function:cubic-bezier(0.55,0,0.3,1)}',
    '50%{transform:rotate(180deg);animation-timing-function:cubic-bezier(0.55,0,0.3,1)}',
    '100%{transform:rotate(360deg)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pinwheel-wheel]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface PinwheelOwnProps {
  /** Diametre du moulinet, en pixels. @defaultValue 40 */
  size?: number
  /** Duree d'un tour, soit deux rafales, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Couleur des pales. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type PinwheelProps = Customisable<PinwheelOwnProps, 'span'>

/**
 * Signale une attente par un moulinet qui tourne par rafales.
 *
 * @example
 * <Pinwheel />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <Pinwheel size={64} speed={2400} color="var(--o-palette-brand-500)" />
 */
export function Pinwheel({
  size = 40,
  speed = 1600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: PinwheelProps): ReactElement {
  ensurePinwheelRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-pinwheel-size': `${String(size)}px`,
    '--o-pinwheel-speed': `${String(speed)}ms`,
    '--o-pinwheel-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-pinwheel=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-pinwheel-wheel="">
        {[0, 1, 2, 3].map((blade) => (
          <span
            key={blade}
            data-o-pinwheel-blade=""
            style={
              {
                '--o-pinwheel-angle': `${String(blade * 90)}deg`,
                // Une pale sur deux est attenuee : c'est l'alternance qui
                // rend la rotation visible.
                '--o-pinwheel-shade': blade % 2 === 0 ? '100%' : '45%',
              } as CSSProperties
            }
          />
        ))}
        <span data-o-pinwheel-hub="" />
      </span>
    </span>
  )
}
