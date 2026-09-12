/**
 * Tableau en attente : des rangees separees par leurs filets, une premiere
 * colonne large, des cellules de longueurs inegales.
 *
 * ## Ce qui fait lire un tableau
 *
 * Trois choses, et aucune n'est le nombre de blocs : les **filets** entre
 * les rangees, la premiere colonne plus large que les autres, et des
 * cellules de longueurs differentes. Une grille de barres identiques se lit
 * comme un mur ; ces trois indices suffisent a la lire comme des donnees,
 * avant qu'aucune donnee ne soit la.
 *
 * Les longueurs ne sont pas tirees au hasard : un tirage change a chaque
 * rendu, et un squelette qui bouge d'un rendu a l'autre trahit qu'il est
 * faux. Elles viennent d'une suite fixe, indexee par la position de la
 * cellule.
 *
 * L'en-tete est peint a la pleine valeur du filet, plus dense que les
 * cellules : c'est ce contraste qui le detache, pas une taille differente.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle ; les cellules sont
 * retirees de l'arbre d'accessibilite. Sous mouvement reduit, elles restent
 * pleines et immobiles : la table vide reste visible, elle ne s'efface pas.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-skeleton-table'

/**
 * Longueurs de cellule, en pourcentage de leur colonne.
 *
 * Une suite fixe plutot qu'un tirage : le squelette doit etre identique a
 * chaque rendu, sans quoi un simple re-rendu le fait tressaillir.
 */
const WIDTHS = [86, 58, 72, 44, 64, 92, 52, 78] as const

/** Pose la table, ses filets et l'animation des cellules, une fois par document. */
function ensureSkeletonTableRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-sktab]{display:block;width:100%}',
    // Le filet est ce qui distingue une table d'une grille : il reste
    // dessine meme quand toutes les cellules sont vides.
    '[data-o-sktab-row]{',
    'display:grid;grid-template-columns:var(--o-sktab-cols);',
    'gap:1rem;align-items:center;padding:var(--o-sktab-pad) 0;',
    'border-bottom:1px solid var(--o-theme-line);',
    '}',
    '[data-o-sktab-row]:last-child{border-bottom:0}',
    '[data-o-sktab-cell]{',
    'position:relative;display:block;overflow:hidden;',
    'height:var(--o-sktab-cell);border-radius:var(--o-sktab-radius);',
    'background:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    '}',
    // L'en-tete est plus dense, a la pleine valeur du filet.
    '[data-o-sktab-head] [data-o-sktab-cell]{background:var(--o-theme-line)}',
    '[data-o-sktab-shimmer] [data-o-sktab-cell]::after{',
    'content:"";position:absolute;inset:0;',
    'background:linear-gradient(90deg,transparent 0 30%,color-mix(in oklab,var(--o-theme-surface) 85%,transparent) 50%,transparent 70% 100%);',
    'transform:translateX(-100%);',
    'animation:o-sktab-sweep var(--o-sktab-speed) linear infinite;',
    'animation-delay:var(--o-sktab-delay);',
    '}',
    '@keyframes o-sktab-sweep{to{transform:translateX(100%)}}',
    '[data-o-sktab-pulse] [data-o-sktab-cell]{',
    'animation:o-sktab-pulse var(--o-sktab-speed) ease-in-out infinite;',
    'animation-delay:var(--o-sktab-delay);',
    '}',
    '@keyframes o-sktab-pulse{0%,100%{opacity:1}50%{opacity:0.45}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-sktab-cell]{animation:none;opacity:1}',
    '[data-o-sktab-shimmer] [data-o-sktab-cell]::after{animation:none;opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SkeletonTableOwnProps {
  /** Nombre de rangees de donnees, en-tete exclu. @defaultValue 4 */
  rows?: number
  /** Nombre de colonnes. @defaultValue 4 */
  columns?: number
  /** Dessiner une rangee d en-tete plus dense. @defaultValue true */
  header?: boolean
  /** Hauteur d'une cellule, en pixels. @defaultValue 10 */
  height?: number
  /** Rayon des angles d'une cellule, en pixels. @defaultValue 5 */
  radius?: number
  /** Reflet qui traverse plutot qu'une pulsation d'ensemble. @defaultValue true */
  shimmer?: boolean
  /** Duree d'un passage du reflet ou d'une pulsation, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement du tableau' */
  label?: string
}

/** Toutes les proprietes. */
export type SkeletonTableProps = Customisable<SkeletonTableOwnProps, 'div'>

/**
 * Reserve la place d'un tableau de donnees.
 *
 * @example
 * <SkeletonTable />
 *
 * @example
 * // Six lignes, trois colonnes, sans en-tete, en pulsation.
 * <SkeletonTable rows={6} columns={3} header={false} shimmer={false} />
 */
export function SkeletonTable({
  rows = 4,
  columns = 4,
  header = true,
  height = 10,
  radius = 5,
  shimmer = true,
  speed = 1600,
  label = 'Chargement du tableau',
  ...rest
}: SkeletonTableProps): ReactElement {
  ensureSkeletonTableRule()

  const rowCount = Math.max(1, Math.round(rows))
  const columnCount = Math.max(1, Math.round(columns))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    // La premiere colonne est large : c'est celle qui nomme la rangee.
    '--o-sktab-cols': `1.7fr ${Array.from({ length: columnCount - 1 }, () => '1fr').join(' ')}`,
    '--o-sktab-cell': `${String(height)}px`,
    '--o-sktab-pad': `${String(Math.round(height * 1.1))}px`,
    '--o-sktab-radius': `${String(radius)}px`,
    '--o-sktab-speed': `${String(speed)}ms`,
  } as CSSProperties

  /** Une rangee, en-tete ou donnees. */
  const row = (rank: number, isHead: boolean): ReactElement => (
    <span
      key={isHead ? 'head' : rank}
      aria-hidden
      data-o-sktab-row=""
      data-o-sktab-head={isHead ? '' : undefined}
    >
      {Array.from({ length: columnCount }, (_, column) => (
        <span
          key={column}
          data-o-sktab-cell=""
          style={
            {
              // Le reflet descend la table dans l'ordre de lecture.
              '--o-sktab-delay': `${String(Math.round((speed / 14) * (rank + column)))}ms`,
              width: isHead
                ? '55%'
                : `${String(WIDTHS[(rank * columnCount + column) % WIDTHS.length] ?? 70)}%`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-sktab=""
      data-o-sktab-shimmer={shimmer ? '' : undefined}
      data-o-sktab-pulse={shimmer ? undefined : ''}
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {header ? row(0, true) : null}
      {Array.from({ length: rowCount }, (_, rank) => row(rank + 1, false))}
    </div>
  )
}
