/**
 * Points en orbite : trois points tournent chacun sur son orbite
 * concentrique, l'interieur plus vite que l'exterieur.
 *
 * ## Des orbites tracees, pas seulement des points
 *
 * Trois points qui tournent sans rien autour se lisent mal : rien ne dit
 * qu'ils sont lies, ni qu'ils suivent un cercle. Les orbites sont donc
 * tracees, en filet attenue — c'est elles qui font le systeme, et qui
 * restent lisibles a l'arret.
 *
 * Les periodes suivent l'idee de Kepler sans en faire le calcul : plus loin
 * du centre, plus lent. Le point interieur fait presque trois tours quand
 * l'exterieur en fait un. Des periodes egales feraient une roue ; des
 * periodes multiples entre elles feraient un motif qui se repete trop vite
 * pour paraitre vivant.
 *
 * ## Pourquoi un SVG
 *
 * Trois cercles concentriques et trois points a une position angulaire :
 * en CSS il faudrait des bordures pour les orbites et des translations
 * calculees pour les points. Dans un `viewBox`, chaque point est un cercle
 * pose en haut de son orbite, et un groupe qui tourne autour du centre.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les trois points s'arretent a des angles distincts,
 * un tiers de tour entre eux : les orbites tracees et leurs points se lisent
 * encore comme un chargeur, seule la rotation s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-dots-orbit'

/** Pose les orbites et leur rotation, une fois par document. */
function ensureOrbitRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dots-orbit]{display:inline-block;line-height:0}',
    '[data-o-dots-orbit-track]{',
    'fill:none;stroke:var(--o-dorbit-color);stroke-width:1.5;opacity:0.2;',
    '}',
    '[data-o-dots-orbit-dot]{fill:var(--o-dorbit-color)}',
    // Le groupe tourne autour du centre du dessin, pas de sa propre boite.
    '[data-o-dots-orbit-spin]{',
    'transform-box:view-box;transform-origin:50% 50%;',
    'animation:o-dots-orbit-turn var(--o-dorbit-speed) linear infinite;',
    '}',
    '@keyframes o-dots-orbit-turn{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    // Trois points a un tiers de tour l'un de l'autre : la figure se lit
    // encore comme un chargeur.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-dots-orbit-spin]{animation:none;transform:rotate(var(--o-dorbit-rest))}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface DotsOrbitOwnProps {
  /** Diametre de l'orbite exterieure, en pixels. @defaultValue 48 */
  size?: number
  /** Duree d'un tour de l'orbite interieure, en millisecondes. @defaultValue 1000 */
  speed?: number
  /** Couleur des points et des orbites. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type DotsOrbitProps = Customisable<DotsOrbitOwnProps, 'span'>

/**
 * Les trois orbites, en unites du `viewBox` de cent sur cent.
 *
 * Le rayon du point decroit avec la distance : un point lointain et gros
 * ecraserait le centre. Le facteur de periode est irrationnel a dessein,
 * pour que le motif ne se referme pas visiblement.
 */
const ORBITS = [
  { radius: 14, dot: 5, factor: 1, rest: 0 },
  { radius: 29, dot: 4, factor: 1.85, rest: 120 },
  { radius: 44, dot: 3.2, factor: 2.9, rest: 240 },
] as const

/**
 * Signale une attente par trois points en orbite.
 *
 * @example
 * <DotsOrbit />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <DotsOrbit size={96} speed={1800} color="var(--o-palette-brand-500)" />
 */
export function DotsOrbit({
  size = 48,
  speed = 1000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: DotsOrbitProps): ReactElement {
  ensureOrbitRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-dorbit-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-dots-orbit=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden width={size} height={size} viewBox="0 0 100 100">
        {ORBITS.map((orbit) => (
          <circle key={orbit.radius} data-o-dots-orbit-track="" cx="50" cy="50" r={orbit.radius} />
        ))}
        {ORBITS.map((orbit) => (
          <g
            key={orbit.radius}
            data-o-dots-orbit-spin=""
            style={
              {
                '--o-dorbit-speed': `${String(Math.round(speed * orbit.factor))}ms`,
                '--o-dorbit-rest': `${String(orbit.rest)}deg`,
              } as CSSProperties
            }
          >
            <circle data-o-dots-orbit-dot="" cx="50" cy={50 - orbit.radius} r={orbit.dot} />
          </g>
        ))}
      </svg>
    </span>
  )
}
