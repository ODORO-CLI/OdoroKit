/**
 * Grille en vague : seize points se soulevent et grossissent le long d'une
 * diagonale, une vague qui traverse le carre.
 *
 * ## Sept fronts pour seize points
 *
 * Dans un carre de quatre par quatre, les points d'une meme anti-diagonale
 * — ceux dont la somme ligne plus colonne est egale — forment un front. Il
 * y en a sept, du coin haut gauche au coin bas droit. Le delai d'un point
 * est celui de son front : la vague avance d'un front a la fois, en biais,
 * et non point par point. C'est ce qui la distingue de `grid-fade`, dont
 * l'onde part du centre et ne se deplace pas.
 *
 * La vague souleve les points autant qu'elle les grossit : un simple
 * changement d'echelle se lirait comme un scintillement, la montee donne un
 * relief, une crete qui passe.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les points sont retires
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la grille reste plate, tous les points a leur taille
 * de repos : elle se lit encore comme un chargeur, seule la vague s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-grid-wave'

/** Cote de la grille, en points. */
const SIDE = 4

/** Nombre de fronts diagonaux : les sommes ligne plus colonne possibles. */
const FRONTS = SIDE * 2 - 1

/** Pose la grille et sa vague, une fois par document. */
function ensureGridWaveRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Un peu de marge en haut : la crete monte dedans sans deborder.
    '[data-o-grid-wave]{',
    'display:inline-grid;grid-template-columns:repeat(4,var(--o-gwave-size));',
    'gap:var(--o-gwave-size);padding-top:var(--o-gwave-size);',
    '}',
    '[data-o-grid-wave-dot]{',
    'width:var(--o-gwave-size);height:var(--o-gwave-size);',
    'border-radius:50%;background:var(--o-gwave-color);',
    'animation:o-grid-wave-crest var(--o-gwave-speed) ease-in-out infinite;',
    'animation-delay:var(--o-gwave-delay);',
    '}',
    // La crete est courte : un point n'est souleve qu'un tiers du cycle,
    // le reste du temps il attend a plat que la vague revienne.
    '@keyframes o-grid-wave-crest{',
    '0%,30%,100%{transform:translate3d(0,0,0) scale(1);opacity:0.45}',
    '15%{transform:translate3d(0,calc(var(--o-gwave-size) * -0.8),0) scale(1.5);opacity:1}',
    '}',
    // Une grille plate et pleine : elle dit encore « attente », sans vague.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-grid-wave-dot]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface GridWaveOwnProps {
  /** Diametre d'un point au repos, en pixels. @defaultValue 6 */
  size?: number
  /** Duree d'un passage complet de la vague, en millisecondes. @defaultValue 1400 */
  speed?: number
  /** Couleur des points. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type GridWaveProps = Customisable<GridWaveOwnProps, 'span'>

/**
 * Signale une attente par une vague diagonale sur une grille de points.
 *
 * @example
 * <GridWave />
 *
 * @example
 * // Plus gros, plus lent, dans la teinte de marque.
 * <GridWave size={10} speed={2000} color="var(--o-palette-brand-500)" />
 */
export function GridWave({
  size = 6,
  speed = 1400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: GridWaveProps): ReactElement {
  ensureGridWaveRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-gwave-size': `${String(size)}px`,
    '--o-gwave-speed': `${String(speed)}ms`,
    '--o-gwave-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-grid-wave=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: SIDE * SIDE }, (_, index) => {
        const front = Math.floor(index / SIDE) + (index % SIDE)
        return (
          <span
            key={index}
            aria-hidden
            data-o-grid-wave-dot=""
            style={
              {
                // Le premier front a le plus d'avance, le dernier part de
                // zero : la vague va du coin haut gauche au coin bas droit,
                // en negatif pour etre deja en route a la premiere image.
                '--o-gwave-delay': `${String(Math.round((-speed * (FRONTS - 1 - front)) / FRONTS))}ms`,
              } as CSSProperties
            }
          />
        )
      })}
    </span>
  )
}
