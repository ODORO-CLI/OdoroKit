/**
 * Anneau a segments : des segments fixes s'allument un a un.
 *
 * ## Rien ne bouge, tout s'allume
 *
 * Les segments ne se deplacent pas : ce sont des arcs fixes, a distance
 * egale, et seule leur opacite change. Chacun joue la meme animation —
 * s'allumer d'un coup, tenir, s'eteindre lentement — avec un delai negatif
 * proportionnel a sa place sur le tour. L'oeil voit un front qui avance
 * segment par segment, suivi d'une trainee qui s'efface. C'est le mouvement
 * d'un compteur a cadran, pas celui d'une aiguille.
 *
 * L'allumage est instantane et l'extinction lente, a dessein : le contraire
 * — monter lentement, couper net — se lirait comme un clignotement.
 *
 * Aucun JavaScript apres le premier rendu : une animation d'opacite par
 * segment, tenue par le compositeur.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin, lui, est
 * retire de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, tous les segments restent allumes : un anneau
 * segmente se lit encore comme un chargeur, seul le mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-segment-ring'

/** Pose l'allumage des segments, une fois par document. */
function ensureSegmentRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-segment-ring]{display:inline-block;line-height:0}',
    '[data-o-segment-ring] svg{display:block}',
    '[data-o-segment]{',
    'animation:o-segment-ring-light var(--o-seg-speed) linear infinite;',
    'animation-delay:var(--o-seg-delay);',
    '}',
    // Plein d'un coup, eteint lentement : le front est net, la trainee
    // douce.
    '@keyframes o-segment-ring-light{',
    '0%,20%{opacity:1}',
    '70%,100%{opacity:0.18}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-segment]{animation:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SegmentRingOwnProps {
  /** Diametre de l'anneau, en pixels. @defaultValue 48 */
  size?: number
  /** Epaisseur des segments, en pixels. @defaultValue 5 */
  thickness?: number
  /** Nombre de segments sur le tour. @defaultValue 8 */
  segments?: number
  /** Duree pour que le front fasse le tour, en millisecondes. @defaultValue 1200 */
  speed?: number
  /** Couleur des segments. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type SegmentRingProps = Customisable<SegmentRingOwnProps, 'span'>

/**
 * Signale une attente par des segments qui s'allument en sequence.
 *
 * @example
 * <SegmentRing />
 *
 * @example
 * // Douze segments fins, dans la teinte de marque.
 * <SegmentRing segments={12} thickness={3} color="var(--o-palette-brand-500)" />
 */
export function SegmentRing({
  size = 48,
  thickness = 5,
  segments = 8,
  speed = 1200,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: SegmentRingProps): ReactElement {
  ensureSegmentRule()

  const { className, style } = mergePresentation({}, rest)

  // Le dessin vit dans une vue de 100 unites : l'epaisseur demandee en
  // pixels est convertie pour que le trait garde sa mesure a toute taille.
  const stroke = Math.min((thickness / size) * 100, 25)
  const radius = 50 - stroke / 2
  const circumference = 2 * Math.PI * radius

  const count = Math.max(1, Math.round(segments))
  const period = circumference / count
  // Les bouts ronds mangent une demi-epaisseur de chaque cote : la part
  // peinte est reduite d'autant pour que l'espace reste visible.
  const painted = Math.max(period * 0.62 - stroke, period * 0.25)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-seg-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-segment-ring=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        {Array.from({ length: count }, (_, index) => (
          <circle
            key={index}
            data-o-segment=""
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${String(painted)} ${String(circumference)}`}
            transform={`rotate(${String((index * 360) / count - 90 + (stroke * 180) / (Math.PI * radius * 2))} 50 50)`}
            style={
              {
                // Le delai remonte le long du tour, en negatif : le front
                // avance dans le sens horaire et la sequence est complete
                // des la premiere image.
                '--o-seg-delay': `${String(Math.round((-speed * (count - index)) / count))}ms`,
              } as CSSProperties
            }
          />
        ))}
      </svg>
    </span>
  )
}
