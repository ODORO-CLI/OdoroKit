/**
 * Grille en fondu : neuf points s'eteignent et se rallument en ondes
 * concentriques, du centre vers les coins.
 *
 * ## Trois anneaux, pas neuf delais
 *
 * Dans un carre de trois par trois, chaque point est a l'une de trois
 * distances du centre : le centre lui-meme, les quatre milieux de cote, les
 * quatre coins. Le delai de chaque point est celui de son anneau, pas de sa
 * position : l'onde part du centre et atteint les coins en dernier, comme un
 * caillou dans l'eau. Un delai par position, de gauche a droite, ferait une
 * lecture — c'est le sujet de `grid-wave`, pas celui-ci.
 *
 * Les delais sont negatifs, et c'est le centre qui a le plus d'avance :
 * l'onde est deja en route a la premiere image, sans point qui attend.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les points sont retires
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les neuf points restent pleins : la grille se lit
 * encore comme un chargeur, seule l'onde s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-grid-fade'

/** Pose la grille et son fondu, une fois par document. */
function ensureGridFadeRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-grid-fade]{',
    'display:inline-grid;grid-template-columns:repeat(3,var(--o-gfade-size));',
    'gap:calc(var(--o-gfade-size) * 0.6);',
    '}',
    '[data-o-grid-fade-dot]{',
    'width:var(--o-gfade-size);height:var(--o-gfade-size);',
    'border-radius:50%;background:var(--o-gfade-color);',
    'animation:o-grid-fade-pulse var(--o-gfade-speed) ease-in-out infinite;',
    'animation-delay:var(--o-gfade-delay);',
    '}',
    '@keyframes o-grid-fade-pulse{',
    '0%,100%{opacity:1;transform:scale(1)}',
    '50%{opacity:0.15;transform:scale(0.6)}',
    '}',
    // Neuf points pleins : la grille dit encore « attente », sans onde.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-grid-fade-dot]{animation:none;opacity:1;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface GridFadeOwnProps {
  /** Diametre d'un point, en pixels. @defaultValue 8 */
  size?: number
  /** Duree d'un cycle complet, en millisecondes. @defaultValue 1200 */
  speed?: number
  /** Couleur des points. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type GridFadeProps = Customisable<GridFadeOwnProps, 'span'>

/**
 * Distance en anneaux depuis le centre d'un carre de trois par trois.
 *
 * Le centre vaut zero, les milieux de cote un, les coins deux : c'est la
 * distance de Tchebychev, celle ou une diagonale coute autant qu'un pas.
 */
function ring(index: number): number {
  const row = Math.floor(index / 3) - 1
  const col = (index % 3) - 1
  return Math.max(Math.abs(row), Math.abs(col))
}

/**
 * Signale une attente par une grille de points en ondes concentriques.
 *
 * @example
 * <GridFade />
 *
 * @example
 * // Plus gros, plus lent, dans la teinte de marque.
 * <GridFade size={12} speed={1800} color="var(--o-palette-brand-500)" />
 */
export function GridFade({
  size = 8,
  speed = 1200,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: GridFadeProps): ReactElement {
  ensureGridFadeRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-gfade-size': `${String(size)}px`,
    '--o-gfade-speed': `${String(speed)}ms`,
    '--o-gfade-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-grid-fade=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: 9 }, (_, index) => (
        <span
          key={index}
          aria-hidden
          data-o-grid-fade-dot=""
          style={
            {
              // Le centre a deux quarts de cycle d'avance sur les coins :
              // l'onde part du milieu, en negatif pour etre deja en route.
              '--o-gfade-delay': `${String(Math.round((-speed * (2 - ring(index))) / 4))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}
