/**
 * Hexagone tournant : un hexagone en trait tourne par crans d'un sixieme de
 * tour tandis qu'un hexagone plein pulse en son centre.
 *
 * ## Tourner par crans
 *
 * Un hexagone qui tourne en continu ressemble a un rond qui tourne : rien
 * ne permet de suivre le mouvement. Par crans, chaque sixieme de tour
 * ramene la figure sur elle-meme et l'oeil voit un declic, puis un temps
 * d'arret, puis un autre declic. C'est le mouvement d'un ecrou qu'on visse,
 * pas celui d'une roue.
 *
 * Deux crans par cycle, et le cycle couvre un tiers de tour : un hexagone
 * est identique a lui-meme tous les sixiemes de tour, la boucle est donc
 * invisible quel que soit le nombre de crans. Deux suffisent a garder le
 * cycle court et les delais lisibles.
 *
 * Le noyau plein pulse en contretemps : il se gonfle pendant l'arret du
 * cadre et se retracte pendant le cran. Sans lui, la figure est un simple
 * contour ; avec lui, elle a un coeur qui bat.
 *
 * Les deux animations sont des transformations sur des groupes SVG, tenues
 * par le compositeur. Aucun JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les deux hexagones restent alignes, pointe en
 * haut : la figure se lit encore comme un chargeur, seul le mouvement
 * s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-hex-spinner'

/**
 * Sommets d'un hexagone pointe en haut, de rayon donne, autour de (50, 50).
 *
 * Calcules une fois par rayon : le contour et le noyau ont le leur.
 */
function hexagon(radius: number): string {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
}

/** Le noyau plein occupe un peu moins de la moitie du contour. */
const CORE = hexagon(21)

/** Pose les hexagones, leurs crans et leur pulsation, une fois par document. */
function ensureHexRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-hex-spinner]{display:inline-block;line-height:0}',
    '[data-o-hex-spinner] svg{display:block}',
    // L'origine est le centre de la vue, en unites de la vue : c'est ce que
    // `transform-box:view-box` garantit quelle que soit la taille rendue.
    '[data-o-hex-frame],[data-o-hex-core]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    '}',
    '[data-o-hex-frame]{',
    'animation:o-hex-spinner-notch var(--o-hex-speed) ease-in-out infinite;',
    '}',
    '[data-o-hex-core]{',
    'animation:o-hex-spinner-beat var(--o-hex-speed) ease-in-out infinite;',
    '}',
    // Deux crans, deux arrets. Un cran dure un peu moins que l'arret qui le
    // suit : le declic est net, la pause est lisible.
    '@keyframes o-hex-spinner-notch{',
    '0%,12%{transform:rotate(0deg)}',
    '40%,62%{transform:rotate(60deg)}',
    '90%,100%{transform:rotate(120deg)}',
    '}',
    // Le noyau se gonfle pendant les arrets du cadre et se retracte pendant
    // les crans : les deux mouvements se relaient au lieu de se superposer.
    '@keyframes o-hex-spinner-beat{',
    '0%,12%{transform:scale(1);opacity:1}',
    '26%{transform:scale(0.55);opacity:0.5}',
    '40%,62%{transform:scale(1);opacity:1}',
    '76%{transform:scale(0.55);opacity:0.5}',
    '90%,100%{transform:scale(1);opacity:1}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-hex-frame],[data-o-hex-core]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface HexSpinnerOwnProps {
  /** Largeur de l'hexagone, en pixels. @defaultValue 44 */
  size?: number
  /** Epaisseur du trait exterieur, en pixels. @defaultValue 3 */
  thickness?: number
  /** Duree de deux crans, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Couleur des deux hexagones. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type HexSpinnerProps = Customisable<HexSpinnerOwnProps, 'span'>

/**
 * Signale une attente par un hexagone qui tourne par crans.
 *
 * @example
 * <HexSpinner />
 *
 * @example
 * // Un trait fin, plus lent, dans la teinte de marque.
 * <HexSpinner thickness={2} speed={2400} color="var(--o-palette-brand-500)" />
 */
export function HexSpinner({
  size = 44,
  thickness = 3,
  speed = 1600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: HexSpinnerProps): ReactElement {
  ensureHexRule()

  const { className, style } = mergePresentation({}, rest)

  // Le dessin vit dans une vue de 100 unites : l'epaisseur demandee en
  // pixels est convertie pour que le trait garde sa mesure a toute taille,
  // et le contour recule d'une demi-epaisseur pour ne pas etre rogne.
  const stroke = Math.min((thickness / size) * 100, 20)
  const frame = hexagon(48 - stroke / 2)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-hex-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-hex-spinner=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g data-o-hex-frame="">
          <polygon
            points={frame}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinejoin="round"
          />
        </g>
        <g data-o-hex-core="">
          <polygon points={CORE} fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}
