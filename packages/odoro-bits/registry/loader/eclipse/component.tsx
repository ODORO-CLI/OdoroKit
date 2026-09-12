/**
 * Eclipse : un disque plein se creuse jusqu'a ne plus laisser qu'un anneau
 * de lumiere, dont le halo s'embrase, puis se referme.
 *
 * ## Un seul cercle, pas deux
 *
 * L'occultation naive consiste a poser un second disque par-dessus le
 * premier — mais ce disque devrait etre de la couleur du fond, que le
 * composant ne connait pas et n'a pas a connaitre. La forme visible est
 * donc construite directement : un anneau est un cercle trace, dont le
 * rayon et l'epaisseur bougent ensemble de facon que le bord exterieur ne
 * change jamais. Epaisseur maximale, le trait se rejoint au centre et
 * l'anneau est un disque plein ; epaisseur minimale, il ne reste qu'un
 * filet. Rien n'est masque, rien n'est superpose, et le fond reste ce qu'il
 * est.
 *
 * C'est la seule figure du lot dont le mouvement va vers l'interieur : le
 * trou s'ouvre au centre au lieu que quelque chose s'en echappe.
 *
 * ## Le halo dit le moment
 *
 * Deux cercles flous entourent l'anneau, l'un serre et vif, l'autre large
 * et tenu. Leur opacite ne monte qu'au moment ou le filet est le plus fin :
 * c'est ce qui donne a l'instant un pic, au lieu d'une respiration egale.
 * Le flou est un filtre applique a chacun ; a cette taille il porte sur
 * quelques centaines de pixels.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, l'anneau reste ouvert et le halo allume : c'est
 * l'instant que la figure raconte, fige.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-eclipse'

/** Rayon exterieur de la figure, en unites de la vue. */
const OUTER = 34

/** Epaisseur du filet restant a l'ouverture maximale. */
const THIN = 4

/** Pose l'anneau, son ouverture et son halo, une fois par document. */
function ensureEclipseRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const disc = `${String(OUTER / 2)}px`
  const ring = `${String(OUTER - THIN / 2)}px`

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-eclipse]{display:inline-block;line-height:0}',
    '[data-o-eclipse] svg{display:block}',
    '[data-o-eclipse-disc]{',
    'animation:o-eclipse-open var(--o-eclipse-speed) ease-in-out infinite;',
    '}',
    // Rayon et epaisseur bougent ensemble : leur somme, le bord exterieur,
    // reste constante d'un bout a l'autre.
    '@keyframes o-eclipse-open{',
    `0%,6%{r:${disc};stroke-width:${String(OUTER)}px}`,
    `46%,54%{r:${ring};stroke-width:${String(THIN)}px}`,
    `94%,100%{r:${disc};stroke-width:${String(OUTER)}px}`,
    '}',
    '[data-o-eclipse-halo]{',
    'filter:blur(var(--o-eclipse-blur));',
    'animation:o-eclipse-flare var(--o-eclipse-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-eclipse-flare{',
    '0%,6%{opacity:0}',
    '46%,54%{opacity:var(--o-eclipse-peak)}',
    '94%,100%{opacity:0}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    `[data-o-eclipse-disc]{animation:none;r:${ring};stroke-width:${String(THIN)}px}`,
    '[data-o-eclipse-halo]{animation:none;opacity:var(--o-eclipse-peak)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface EclipseOwnProps {
  /** Cote de la zone de dessin, en pixels. @defaultValue 64 */
  size?: number
  /** Duree d'une eclipse complete, en millisecondes. @defaultValue 3000 */
  speed?: number
  /** Couleur de l'anneau et du halo. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type EclipseProps = Customisable<EclipseOwnProps, 'span'>

/**
 * Signale une attente par un disque qui se creuse en anneau de lumiere.
 *
 * @example
 * <Eclipse />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <Eclipse size={96} speed={4500} color="var(--o-palette-brand-500)" />
 */
export function Eclipse({
  size = 64,
  speed = 3000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: EclipseProps): ReactElement {
  ensureEclipseRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-eclipse-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-eclipse=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          data-o-eclipse-halo=""
          cx="50"
          cy="50"
          r={OUTER + 8}
          fill="none"
          stroke="currentColor"
          strokeWidth={12}
          style={{ '--o-eclipse-blur': '7px', '--o-eclipse-peak': '0.28' } as CSSProperties}
        />
        <circle
          data-o-eclipse-halo=""
          cx="50"
          cy="50"
          r={OUTER}
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          style={{ '--o-eclipse-blur': '3px', '--o-eclipse-peak': '0.85' } as CSSProperties}
        />
        <circle
          data-o-eclipse-disc=""
          cx="50"
          cy="50"
          r={OUTER / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={OUTER}
        />
      </svg>
    </span>
  )
}
