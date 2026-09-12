/**
 * Cadre d'image : un rectangle au bon rapport, cerne d'un filet pointille,
 * avec au centre le pictogramme de ce qui manque.
 *
 * ## Un cadre vide n'est pas un bloc gris
 *
 * Un bloc uni dit « ca charge ». Un cadre pointille avec une icone dit
 * « une image va ici » — et le dit meme quand rien ne charge : illustration
 * absente, champ de televersement encore vide, gabarit en cours de montage.
 * Les deux lectures ne demandent pas le meme dessin, d'ou une entree
 * separee de `skeleton-grid`, dont les vignettes sont pleines et anonymes.
 *
 * Le filet est **pointille** : c'est la convention qui distingue une place
 * reservee d'une bordure reelle. Un trait plein se lirait comme le cadre
 * definitif de l'image.
 *
 * Le pictogramme est dessine en ligne plutot qu'importe : trois traits, un
 * disque et un rectangle, c'est moins que le cout d'une dependance de plus
 * pour un composant qui n'affiche que lui.
 *
 * ## Le rapport, encore
 *
 * `ratio` reserve la hauteur exacte. C'est la meme raison que dans
 * `skeleton-grid` : sans rapport declare, la page se replie a l'arrivee de
 * l'image, et tout ce qui la suit saute.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle ; le cadre et son
 * pictogramme sont retires de l'arbre d'accessibilite. Sous mouvement
 * reduit, le reflet s'arrete et le cadre reste entier : la place reste
 * dite, elle ne s'efface pas.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-placeholder-image'

/** Rapports acceptes pour le cadre. */
const RATIOS = ['16/9', '4/3', '3/2', '1/1'] as const

/** Pose le cadre, son filet et son reflet, une fois par document. */
function ensurePlaceholderImageRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pimg]{display:block;width:100%}',
    '[data-o-pimg-frame]{',
    'position:relative;display:flex;align-items:center;justify-content:center;',
    'overflow:hidden;box-sizing:border-box;',
    'width:100%;aspect-ratio:var(--o-pimg-ratio);',
    'border-radius:var(--o-pimg-radius);',
    // Plus clair qu'un bloc de squelette : le pictogramme doit se lire.
    'background:color-mix(in oklab,var(--o-theme-line) 38%,var(--o-theme-surface));',
    // Pointille : la convention d'une place reservee, pas d'un cadre reel.
    'border:1px dashed var(--o-theme-line);',
    '}',
    // Le pictogramme prend l'encre en sourdine : present, jamais dominant.
    '[data-o-pimg-glyph]{',
    'position:relative;display:block;color:var(--o-theme-muted);',
    'width:var(--o-pimg-icon);height:auto;opacity:0.85;',
    '}',
    '[data-o-pimg-shimmer] [data-o-pimg-frame]::after{',
    'content:"";position:absolute;inset:0;',
    'background:linear-gradient(100deg,transparent 0 35%,color-mix(in oklab,var(--o-theme-surface) 80%,transparent) 50%,transparent 65% 100%);',
    'transform:translateX(-100%);',
    'animation:o-pimg-sweep var(--o-pimg-speed) linear infinite;',
    '}',
    '@keyframes o-pimg-sweep{to{transform:translateX(100%)}}',
    // Le cadre reste entier, sans reflet.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pimg-shimmer] [data-o-pimg-frame]::after{animation:none;opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface PlaceholderImageOwnProps {
  /** Rapport largeur sur hauteur du cadre. @defaultValue '16/9' */
  ratio?: string
  /** Largeur du pictogramme, en pixels. @defaultValue 40 */
  icon?: number
  /** Rayon des angles, en pixels. @defaultValue 12 */
  radius?: number
  /** Faire passer un reflet sur le cadre. @defaultValue false */
  shimmer?: boolean
  /** Duree d'un passage du reflet, en millisecondes. @defaultValue 2000 */
  speed?: number
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Image en attente' */
  label?: string
}

/** Toutes les proprietes. */
export type PlaceholderImageProps = Customisable<PlaceholderImageOwnProps, 'div'>

/**
 * Reserve la place d'une image, cadre et pictogramme compris.
 *
 * @example
 * <PlaceholderImage />
 *
 * @example
 * // Un carre qui charge vraiment : le reflet le dit.
 * <PlaceholderImage ratio="1/1" shimmer />
 */
export function PlaceholderImage({
  ratio = '16/9',
  icon = 40,
  radius = 12,
  shimmer = false,
  speed = 2000,
  label = 'Image en attente',
  ...rest
}: PlaceholderImageProps): ReactElement {
  ensurePlaceholderImageRule()

  // Un rapport inconnu casserait le cadre sans rien dire : on retombe sur
  // celui par defaut plutot que d'ecrire une valeur invalide.
  const safeRatio = (RATIOS as readonly string[]).includes(ratio) ? ratio : '16/9'

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-pimg-ratio': safeRatio,
    '--o-pimg-icon': `${String(icon)}px`,
    '--o-pimg-radius': `${String(radius)}px`,
    '--o-pimg-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-pimg=""
      data-o-pimg-shimmer={shimmer ? '' : undefined}
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-pimg-frame="">
        <svg
          data-o-pimg-glyph=""
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
          <circle cx="8.75" cy="10" r="1.6" />
          <path d="M3.5 16.4 8.6 12.1 13 15.8" />
          <path d="M12.4 15.3 15.9 12.2 20.5 16" />
        </svg>
      </span>
    </div>
  )
}
