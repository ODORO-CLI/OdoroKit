/**
 * Grille en attente : des vignettes au meme rapport, chacune avec sa
 * legende, balayees en diagonale.
 *
 * ## Le rapport avant tout
 *
 * Une galerie qui charge sans reserver la hauteur de ses vignettes fait
 * sauter la page entiere a chaque image arrivee. C'est le seul vrai travail
 * de ce squelette : `ratio` fixe le rapport de chaque case, et la grille
 * occupe des maintenant la place exacte que les images occuperont.
 *
 * La legende sous chaque vignette est plus courte que la case : c'est ce
 * decalage qui distingue une galerie d'un damier.
 *
 * ## Une diagonale, pas une ligne
 *
 * Le retard du reflet suit la somme de la ligne et de la colonne : l'onde
 * traverse la grille en biais. Un retard par colonne seule ferait defiler
 * des bandes verticales, et l'oeil suivrait la bande au lieu de lire la
 * grille ; en diagonale, le mouvement reste une respiration d'ensemble.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle ; les vignettes sont
 * retirees de l'arbre d'accessibilite. Sous mouvement reduit, elles restent
 * pleines et immobiles : la grille vide reste visible, elle ne s'efface pas.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-skeleton-grid'

/** Rapports acceptes pour une vignette. */
const RATIOS = ['16/9', '4/3', '3/2', '1/1'] as const

/** Longueurs de legende, en pourcentage de la vignette. */
const CAPTIONS = [72, 54, 84, 62] as const

/** Pose la grille, ses vignettes et leur animation, une fois par document. */
function ensureSkeletonGridRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-skgrid]{',
    'display:grid;width:100%;',
    'grid-template-columns:repeat(var(--o-skgrid-columns),minmax(0,1fr));',
    'gap:var(--o-skgrid-gap);',
    '}',
    '[data-o-skgrid-cell]{display:flex;flex-direction:column;gap:calc(var(--o-skgrid-gap) * 0.45)}',
    '[data-o-skgrid-fill]{',
    'position:relative;display:block;overflow:hidden;',
    'background:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    '}',
    // Le rapport reserve la hauteur : c'est ce qui empeche la page de
    // sauter quand les images arrivent.
    '[data-o-skgrid-tile]{',
    'width:100%;aspect-ratio:var(--o-skgrid-ratio);',
    'border-radius:var(--o-skgrid-radius);',
    '}',
    '[data-o-skgrid-caption]{',
    'height:0.55rem;border-radius:calc(var(--o-skgrid-radius) * 0.5);',
    '}',
    '[data-o-skgrid-shimmer] [data-o-skgrid-fill]::after{',
    'content:"";position:absolute;inset:0;',
    'background:linear-gradient(90deg,transparent 0 30%,color-mix(in oklab,var(--o-theme-surface) 85%,transparent) 50%,transparent 70% 100%);',
    'transform:translateX(-100%);',
    'animation:o-skgrid-sweep var(--o-skgrid-speed) linear infinite;',
    'animation-delay:var(--o-skgrid-delay);',
    '}',
    '@keyframes o-skgrid-sweep{to{transform:translateX(100%)}}',
    '[data-o-skgrid-pulse] [data-o-skgrid-fill]{',
    'animation:o-skgrid-pulse var(--o-skgrid-speed) ease-in-out infinite;',
    'animation-delay:var(--o-skgrid-delay);',
    '}',
    '@keyframes o-skgrid-pulse{0%,100%{opacity:1}50%{opacity:0.45}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-skgrid-fill]{animation:none;opacity:1}',
    '[data-o-skgrid-shimmer] [data-o-skgrid-fill]::after{animation:none;opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SkeletonGridOwnProps {
  /** Nombre de rangees. @defaultValue 2 */
  rows?: number
  /** Nombre de colonnes. @defaultValue 3 */
  columns?: number
  /** Rapport largeur sur hauteur d'une vignette. @defaultValue '4/3' */
  ratio?: string
  /** Reserver la place d'une legende sous chaque vignette. @defaultValue true */
  caption?: boolean
  /** Ecart entre les vignettes, en pixels. @defaultValue 14 */
  gap?: number
  /** Rayon des angles d'une vignette, en pixels. @defaultValue 10 */
  radius?: number
  /** Reflet qui traverse plutot qu'une pulsation d'ensemble. @defaultValue true */
  shimmer?: boolean
  /** Duree d'un passage du reflet ou d'une pulsation, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement de la galerie' */
  label?: string
}

/** Toutes les proprietes. */
export type SkeletonGridProps = Customisable<SkeletonGridOwnProps, 'div'>

/**
 * Reserve la place d'une galerie de vignettes.
 *
 * @example
 * <SkeletonGrid />
 *
 * @example
 * // Quatre colonnes carrees, sans legende.
 * <SkeletonGrid rows={2} columns={4} ratio="1/1" caption={false} />
 */
export function SkeletonGrid({
  rows = 2,
  columns = 3,
  ratio = '4/3',
  caption = true,
  gap = 14,
  radius = 10,
  shimmer = true,
  speed = 1600,
  label = 'Chargement de la galerie',
  ...rest
}: SkeletonGridProps): ReactElement {
  ensureSkeletonGridRule()

  const rowCount = Math.max(1, Math.round(rows))
  const columnCount = Math.max(1, Math.round(columns))
  // Un rapport inconnu casserait la grille sans rien dire : on retombe sur
  // celui par defaut plutot que d'ecrire une valeur invalide.
  const safeRatio = (RATIOS as readonly string[]).includes(ratio) ? ratio : '4/3'

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-skgrid-columns': String(columnCount),
    '--o-skgrid-ratio': safeRatio,
    '--o-skgrid-gap': `${String(gap)}px`,
    '--o-skgrid-radius': `${String(radius)}px`,
    '--o-skgrid-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-skgrid=""
      data-o-skgrid-shimmer={shimmer ? '' : undefined}
      data-o-skgrid-pulse={shimmer ? undefined : ''}
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: rowCount * columnCount }, (_, index) => {
        const row = Math.floor(index / columnCount)
        const column = index % columnCount
        // La somme ligne plus colonne : l'onde traverse en biais.
        const delay = {
          '--o-skgrid-delay': `${String(Math.round((speed / 12) * (row + column)))}ms`,
        } as CSSProperties

        return (
          <span key={index} aria-hidden data-o-skgrid-cell="">
            <span data-o-skgrid-fill="" data-o-skgrid-tile="" style={delay} />
            {caption ? (
              <span
                data-o-skgrid-fill=""
                data-o-skgrid-caption=""
                style={
                  {
                    ...delay,
                    width: `${String(CAPTIONS[index % CAPTIONS.length] ?? 70)}%`,
                  } as CSSProperties
                }
              />
            ) : null}
          </span>
        )
      })}
    </div>
  )
}
