/**
 * Anneau en tirets : le motif glisse le long du cercle, rien ne tourne.
 *
 * ## Un decalage, pas une rotation
 *
 * Le cercle est complet et immobile. Ce qui bouge est le decalage de son
 * tirete : chaque image, le motif est repris un peu plus loin sur le trace,
 * et les tirets semblent couler le long de l'anneau. La difference avec une
 * rotation se voit a l'oeil nu : aucun tiret n'a de tete ni de queue, le
 * mouvement est celui d'une chaine, pas d'une aiguille.
 *
 * Le pas du motif est une fraction exacte de la circonference — c'est le
 * seul moyen d'obtenir une boucle sans couture : un decalage d'une
 * circonference complete remet le motif exactement sur lui-meme.
 *
 * Le decalage du tirete n'est pas une propriete tenue par le compositeur :
 * l'anneau est repeint a chaque image. A la taille d'un chargeur, c'est un
 * cout invisible ; c'est le prix d'un mouvement qu'une rotation ne peut
 * pas produire.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin, lui, est
 * retire de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le tirete reste en place : un anneau en tirets se
 * lit encore comme un chargeur, seul le mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-dash-ring'

/** Pose le glissement du tirete, une fois par document. */
function ensureDashRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dash-ring]{display:inline-block;line-height:0}',
    '[data-o-dash-ring] svg{display:block}',
    '[data-o-dash-path]{',
    'animation:o-dash-ring-glide var(--o-dash-speed) linear infinite;',
    '}',
    // La fin de course est une circonference entiere, en negatif : le motif
    // avance dans le sens horaire et retombe sur lui-meme.
    '@keyframes o-dash-ring-glide{',
    'from{stroke-dashoffset:0}',
    'to{stroke-dashoffset:var(--o-dash-loop)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-dash-path]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface DashRingOwnProps {
  /** Diametre de l'anneau, en pixels. @defaultValue 48 */
  size?: number
  /** Epaisseur des tirets, en pixels. @defaultValue 4 */
  thickness?: number
  /** Nombre de tirets sur le tour. @defaultValue 12 */
  dashes?: number
  /** Duree pour qu'un tiret fasse le tour complet, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur des tirets. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type DashRingProps = Customisable<DashRingOwnProps, 'span'>

/**
 * Signale une attente par un tirete qui coule le long d'un anneau.
 *
 * @example
 * <DashRing />
 *
 * @example
 * // Plus de tirets, plus fins, dans la teinte de marque.
 * <DashRing dashes={24} thickness={2} color="var(--o-palette-brand-500)" />
 */
export function DashRing({
  size = 48,
  thickness = 4,
  dashes = 12,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: DashRingProps): ReactElement {
  ensureDashRule()

  const { className, style } = mergePresentation({}, rest)

  // Le dessin vit dans une vue de 100 unites : l'epaisseur demandee en
  // pixels est convertie pour que le trait garde sa mesure a toute taille.
  const stroke = Math.min((thickness / size) * 100, 25)
  const radius = 50 - stroke / 2
  const circumference = 2 * Math.PI * radius

  // Le pas divise exactement la circonference : la boucle est sans couture.
  const count = Math.max(1, Math.round(dashes))
  const period = circumference / count
  const dash = period * 0.55

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-dash-speed': `${String(speed)}ms`,
    '--o-dash-loop': String(-circumference),
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-dash-ring=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          data-o-dash-path=""
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={`${String(dash)} ${String(period - dash)}`}
        />
      </svg>
    </span>
  )
}
