/**
 * Comete : un point court sur un cercle, une trainee s'efface derriere lui.
 *
 * ## La trainee est une pile d'arcs
 *
 * Un trait SVG ne sait pas s'eteindre le long de sa course : un degrade ne
 * suit pas une courbe. La trainee est donc faite de cinq arcs de longueurs
 * decroissantes, tous termines sous la tete, chacun peu opaque. La ou ils se
 * superposent — pres de la tete — les opacites s'additionnent ; loin
 * derriere, il ne reste que le plus long et le plus pale. Cinq paliers
 * suffisent : a la taille d'un chargeur, l'oeil les fond en un seul
 * degrade.
 *
 * La tete est un disque plus large que la trainee : c'est elle que l'oeil
 * suit, et c'est elle qui dit le sens du mouvement — une trainee seule
 * pourrait aller dans les deux sens.
 *
 * Une orbite attenuee reste visible sous la comete : sans elle, le point
 * flotterait et le cercle ne se lirait qu'apres un tour complet.
 *
 * Un seul groupe tourne, par une animation CSS. Aucun JavaScript apres le
 * premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin, lui, est
 * retire de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la comete reste en haut de son orbite : un point
 * et sa trainee se lisent encore comme un chargeur, seul le mouvement
 * s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-comet-ring'

/** Pose la rotation de la comete, une fois par document. */
function ensureCometRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-comet-ring]{display:inline-block;line-height:0}',
    '[data-o-comet-ring] svg{display:block}',
    '[data-o-comet-body]{',
    'transform-box:view-box;transform-origin:50% 50%;',
    'animation:o-comet-ring-spin var(--o-comet-speed) linear infinite;',
    '}',
    '@keyframes o-comet-ring-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-comet-body]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface CometRingOwnProps {
  /** Diametre de l'orbite, en pixels. @defaultValue 48 */
  size?: number
  /** Epaisseur de la trainee, en pixels ; la tete fait pres du double. @defaultValue 3 */
  thickness?: number
  /** Longueur de la trainee, en degres d'orbite. @defaultValue 150 */
  tail?: number
  /** Duree d'un tour, en millisecondes. @defaultValue 1100 */
  speed?: number
  /** Couleur de la comete. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type CometRingProps = Customisable<CometRingOwnProps, 'span'>

/**
 * Les paliers de la trainee : part de la longueur totale, opacite.
 *
 * Du plus long et plus pale au plus court et plus franc. Les opacites sont
 * choisies pour que la pile, sous la tete, approche le plein sans
 * l'atteindre : la tete doit rester le point le plus dense.
 */
const TRAIL = [
  { share: 1, opacity: 0.1 },
  { share: 0.66, opacity: 0.14 },
  { share: 0.4, opacity: 0.2 },
  { share: 0.2, opacity: 0.3 },
  { share: 0.08, opacity: 0.5 },
] as const

/**
 * Signale une attente par une comete qui court sur son orbite.
 *
 * @example
 * <CometRing />
 *
 * @example
 * // Une longue trainee, lente, dans la teinte de marque.
 * <CometRing size={80} tail={240} speed={2000} color="var(--o-palette-brand-500)" />
 */
export function CometRing({
  size = 48,
  thickness = 3,
  tail = 150,
  speed = 1100,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: CometRingProps): ReactElement {
  ensureCometRule()

  const { className, style } = mergePresentation({}, rest)

  // Le dessin vit dans une vue de 100 unites. La tete deborde du trait :
  // le rayon laisse la place a son diametre, pas seulement a l'epaisseur.
  const stroke = Math.min((thickness / size) * 100, 20)
  const head = stroke * 0.9
  const radius = 50 - head
  const circumference = 2 * Math.PI * radius
  const tailLength = Math.min(Math.max(tail, 0), 340)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-comet-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-comet-ring=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          opacity={0.12}
        />
        <g data-o-comet-body="">
          {TRAIL.map((layer, index) => {
            // Chaque arc part `angle` degres avant le sommet et s'y termine :
            // le tirete d'un cercle commence a trois heures, d'ou le quart
            // de tour retranche.
            const angle = tailLength * layer.share
            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${String((circumference * angle) / 360)} ${String(circumference)}`}
                opacity={layer.opacity}
                transform={`rotate(${String(-90 - angle)} 50 50)`}
              />
            )
          })}
          <circle cx="50" cy={50 - radius} r={head} fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}
