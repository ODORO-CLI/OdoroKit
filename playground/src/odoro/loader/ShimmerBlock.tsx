/**
 * Bloc balaye : une seule surface en attente, traversee par un reflet
 * oblique.
 *
 * ## Une primitive, pas une maquette
 *
 * Les squelettes de ce lot dessinent une forme reconnaissable — un
 * paragraphe, une carte, un tableau. Celui-ci ne dessine rien : c'est le
 * bloc nu, celui qu'on pose soi-meme aux dimensions du contenu attendu.
 * Il prend la largeur de son parent et la hauteur qu'on lui donne, et c'est
 * tout ce qu'il promet.
 *
 * ## Le reflet est dans le fond, pas au-dessus
 *
 * La bande n'est pas une couche posee par-dessus : c'est le fond du bloc
 * lui-meme, une image large de deux fois et demie sa boite dont seule la
 * **position** bouge. Aucun element de plus, aucune composition a empiler —
 * et surtout, la bande suit les angles arrondis sans avoir a redire le
 * rayon.
 *
 * L'obliquite est reglable et vaut cent dix degres par defaut : une bande
 * verticale se lit comme un curseur, et un curseur promet une position dans
 * une progression. Penchee, elle redevient un reflet sur une surface.
 *
 * `pulse-block` traite la meme surface autrement : il n'a pas de bande du
 * tout, il respire. Un reflet dit « quelque chose passe » et donne un sens
 * de lecture ; une pulsation dit seulement « pas encore ».
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle ; le bloc est retire de
 * l'arbre d'accessibilite. Sous mouvement reduit, le fond perd sa bande et
 * garde sa pleine valeur : la surface reste visible, elle ne s'efface pas.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-shimmer-block'

/** Pose le bloc et son reflet, une fois par document. */
function ensureShimmerBlockRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-shb]{display:block;width:100%}',
    '[data-o-shb-face]{',
    'display:block;width:100%;height:var(--o-shb-height);',
    'border-radius:var(--o-shb-radius);',
    // Le ton du bloc : le filet donne la densite, la surface l'eclaircit.
    'background-color:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    // La bande est le fond, pas une couche : elle suit donc le rayon.
    'background-image:linear-gradient(var(--o-shb-angle),transparent 0 calc(50% - var(--o-shb-band)),color-mix(in oklab,var(--o-theme-surface) 85%,transparent) 50%,transparent calc(50% + var(--o-shb-band)) 100%);',
    'background-size:250% 100%;background-repeat:no-repeat;',
    'background-position:150% 0;',
    'animation:o-shb-sweep var(--o-shb-speed) linear infinite;',
    '}',
    '@keyframes o-shb-sweep{from{background-position:150% 0}to{background-position:-50% 0}}',
    // Sans bande, a pleine valeur : la place reste tenue.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-shb-face]{animation:none;background-image:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface ShimmerBlockOwnProps {
  /** Hauteur du bloc, en pixels. @defaultValue 96 */
  height?: number
  /** Rayon des angles, en pixels. @defaultValue 12 */
  radius?: number
  /** Obliquite de la bande, en degres. @defaultValue 110 */
  angle?: number
  /** Demi-largeur de la bande, en pourcentage de l'image de fond. @defaultValue 14 */
  band?: number
  /** Duree d'un passage de la bande, en millisecondes. @defaultValue 1800 */
  speed?: number
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type ShimmerBlockProps = Customisable<ShimmerBlockOwnProps, 'div'>

/**
 * Reserve une surface et la traverse d'un reflet.
 *
 * @example
 * <ShimmerBlock height={140} />
 *
 * @example
 * // Une bande large et presque horizontale, lente.
 * <ShimmerBlock height={64} angle={80} band={24} speed={2600} />
 */
export function ShimmerBlock({
  height = 96,
  radius = 12,
  angle = 110,
  band = 14,
  speed = 1800,
  label = 'Chargement',
  ...rest
}: ShimmerBlockProps): ReactElement {
  ensureShimmerBlockRule()

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-shb-height': `${String(height)}px`,
    '--o-shb-radius': `${String(radius)}px`,
    '--o-shb-angle': `${String(angle)}deg`,
    '--o-shb-band': `${String(Math.max(1, band))}%`,
    '--o-shb-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <div {...rest} className={className} style={hostStyle} data-o-shb="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-shb-face="" />
    </div>
  )
}
