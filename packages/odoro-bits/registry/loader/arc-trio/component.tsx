/**
 * Trio d'arcs : trois arcs de longueurs differentes sur un meme cercle.
 *
 * ## Un seul cercle, trois vitesses
 *
 * Les trois arcs partagent le meme rayon — ce n'est pas un chargeur
 * concentrique. Ils n'ont ni la meme longueur ni la meme vitesse : le long
 * est lent, le court est vif. A vitesses inegales, ils se rattrapent, se
 * recouvrent un instant — l'opacite s'additionne, l'arc semble s'epaissir —
 * puis se separent. C'est cette respiration irreguliere qui fait le
 * chargeur : trois arcs a la meme vitesse ne seraient qu'un anneau
 * tournant a trous.
 *
 * Chaque arc est un cercle SVG dont le tirete ne peint qu'une portion. Le
 * point de depart de chacun est fixe par un attribut SVG sur un groupe
 * exterieur, et la rotation par une animation CSS sur un groupe interieur :
 * les deux transformations ne se disputent pas la meme propriete, sinon
 * l'animation effacerait le decalage.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin, lui, est
 * retire de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les arcs restent a un tiers de tour les uns des
 * autres : la figure se lit encore comme un chargeur, seul le mouvement
 * s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-arc-trio'

/** Pose la rotation des arcs, une fois par document. */
function ensureTrioRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-arc-trio]{display:inline-block;line-height:0}',
    '[data-o-arc-trio] svg{display:block}',
    // La boite de reference est la vue SVG : l'origine de la rotation est le
    // centre du dessin, pas celui du seul arc peint.
    '[data-o-trio-arc]{',
    'transform-box:view-box;transform-origin:50% 50%;',
    'animation:o-arc-trio-spin var(--o-trio-speed) linear infinite;',
    '}',
    '@keyframes o-arc-trio-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-trio-arc]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface ArcTrioOwnProps {
  /** Diametre du cercle, en pixels. @defaultValue 48 */
  size?: number
  /** Epaisseur des arcs, en pixels. @defaultValue 4 */
  thickness?: number
  /** Duree d'un tour de l'arc le plus long, en millisecondes. @defaultValue 1400 */
  speed?: number
  /** Couleur des arcs. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type ArcTrioProps = Customisable<ArcTrioOwnProps, 'span'>

/**
 * Les trois arcs : part du cercle, multiplicateur de duree, opacite.
 *
 * Le long est lent et plein ; le court est vif et leger. L'ordre des
 * vitesses est inverse a celui des longueurs pour que l'oeil suive toujours
 * un arc net et rapide devant une masse plus lente.
 */
const ARCS = [
  { share: 0.3, tempo: 1, opacity: 1 },
  { share: 0.17, tempo: 0.62, opacity: 0.7 },
  { share: 0.08, tempo: 0.4, opacity: 0.45 },
] as const

/**
 * Signale une attente par trois arcs qui se rattrapent sur un meme cercle.
 *
 * @example
 * <ArcTrio />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <ArcTrio size={80} thickness={6} speed={2200} color="var(--o-palette-brand-500)" />
 */
export function ArcTrio({
  size = 48,
  thickness = 4,
  speed = 1400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: ArcTrioProps): ReactElement {
  ensureTrioRule()

  const { className, style } = mergePresentation({}, rest)

  // Le dessin vit dans une vue de 100 unites : l'epaisseur demandee en
  // pixels est convertie pour que le trait garde sa mesure a toute taille.
  const stroke = Math.min((thickness / size) * 100, 25)
  const radius = 50 - stroke / 2
  const circumference = 2 * Math.PI * radius

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-arc-trio=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        {ARCS.map((arc, index) => (
          <g key={index} transform={`rotate(${String(index * 120 - 90)} 50 50)`}>
            <g
              data-o-trio-arc=""
              style={
                {
                  '--o-trio-speed': `${String(Math.round(speed * arc.tempo))}ms`,
                } as CSSProperties
              }
            >
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${String(circumference * arc.share)} ${String(circumference)}`}
                opacity={arc.opacity}
              />
            </g>
          </g>
        ))}
      </svg>
    </span>
  )
}
