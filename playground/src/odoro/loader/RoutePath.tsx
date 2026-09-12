/**
 * Itineraire : une route se dessine depuis le point de depart jusqu'a la
 * destination, qui s'allume a l'arrivee.
 *
 * ## Une route se parcourt, elle ne clignote pas
 *
 * Le trace est un tiret aussi long que le chemin entier : le faire glisser
 * par son decalage revient a faire avancer une tete, du depart vers la
 * destination, sans que la queue ne bouge. C'est le geste d'un doigt sur
 * une carte, pas un remplissage.
 *
 * Le chemin declare une longueur de cent : le tiret et son decalage se
 * lisent alors en pour cent du trace, quelle que soit sa longueur reelle.
 * Les images cles tombent juste sans qu'aucune mesure ne soit lue dans le
 * document.
 *
 * Sous le trace, la route en pointille reste toujours visible : sans elle,
 * un itineraire a demi parcouru n'est qu'une courbe qui s'arrete, et l'oeil
 * ne sait pas ou elle va. La destination, elle, n'apparait qu'a l'arrivee —
 * c'est ce qui fait la difference entre « en route » et « arrive ».
 *
 * La boucle ne se rembobine pas : une fois la destination atteinte, le
 * trace s'efface en fondu, et le cycle repart d'un chemin vide. Un retour
 * en arriere donnerait un itineraire qu'on defait, ce qui ne veut rien dire.
 *
 * Deux animations CSS sur des elements SVG, tenues par le compositeur,
 * aucun JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la route est entierement tracee et la destination
 * allumee : c'est l'etat d'arrivee, celui qui dit le plus.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-route-path'

/**
 * L'itineraire, dans une vue de 100 unites.
 *
 * Deux courbes cubiques qui se raccordent : la route serpente au lieu de
 * filer droit, ce qui donne au parcours une duree lisible.
 */
const ROUTE = 'M 14 82 C 34 82, 28 58, 46 54 C 64 50, 58 32, 76 28'

/** Depart de la route. */
const FROM = { x: 14, y: 82 }

/** Destination. */
const TO = { x: 76, y: 28 }

/** Pose la route, son trace et l'arrivee, une fois par document. */
function ensureRouteRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-route-path]{display:inline-block;line-height:0}',
    '[data-o-route-path] svg{display:block}',
    '[data-o-route-line]{',
    'stroke-dasharray:100 100;stroke-dashoffset:100;',
    'animation:o-route-path-draw var(--o-route-speed) infinite;',
    '}',
    '[data-o-route-goal]{',
    'transform-box:view-box;opacity:0;',
    `transform-origin:${String(TO.x)}px ${String(TO.y)}px;`,
    'animation:o-route-path-land var(--o-route-speed) infinite;',
    '}',
    // La tete avance du depart a la destination, marque un temps, puis le
    // trace s'efface : le cycle repart d'un chemin vide, jamais d'un retour
    // en arriere.
    '@keyframes o-route-path-draw{',
    '0%{stroke-dashoffset:100;opacity:1;animation-timing-function:ease-in-out}',
    '62%{stroke-dashoffset:0;opacity:1}',
    '84%{stroke-dashoffset:0;opacity:1;animation-timing-function:ease-in}',
    '100%{stroke-dashoffset:0;opacity:0}',
    '}',
    // La destination se pose avec un leger depassement, comme une epingle
    // qu'on plante, juste au moment ou la tete l'atteint.
    '@keyframes o-route-path-land{',
    '0%,54%{transform:scale(0.3);opacity:0;animation-timing-function:cubic-bezier(0.34,1.56,0.64,1)}',
    '70%{transform:scale(1);opacity:1}',
    '84%{transform:scale(1);opacity:1;animation-timing-function:ease-in}',
    '100%{transform:scale(1);opacity:0}',
    '}',
    // Route parcourue, destination allumee : l'etat d'arrivee, immobile.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-route-line]{animation:none;stroke-dashoffset:0}',
    '[data-o-route-goal]{animation:none;opacity:1;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface RoutePathOwnProps {
  /** Cote du dessin, en pixels. @defaultValue 72 */
  size?: number
  /** Epaisseur de la route, en pixels. @defaultValue 4 */
  thickness?: number
  /** Duree d'un parcours complet, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur de la route et des reperes. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type RoutePathProps = Customisable<RoutePathOwnProps, 'span'>

/**
 * Signale une attente par un itineraire qui se trace jusqu'a sa destination.
 *
 * @example
 * <RoutePath />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <RoutePath size={112} speed={3200} color="var(--o-palette-brand-500)" />
 */
export function RoutePath({
  size = 72,
  thickness = 4,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: RoutePathProps): ReactElement {
  ensureRouteRule()

  const { className, style } = mergePresentation({}, rest)

  // Le dessin vit dans une vue de 100 unites : l'epaisseur demandee en
  // pixels est convertie pour que la route garde sa mesure a toute taille.
  const stroke = Math.min((thickness / size) * 100, 12)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-route-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-route-path=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path
          d={ROUTE}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeOpacity={0.32}
          strokeLinecap="round"
          strokeDasharray={`${(stroke * 0.35).toFixed(2)} ${(stroke * 1.15).toFixed(2)}`}
        />
        <path
          data-o-route-line=""
          d={ROUTE}
          pathLength={100}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <circle cx={FROM.x} cy={FROM.y} r={stroke * 1.1} fill="currentColor" />
        <g data-o-route-goal="">
          <circle
            cx={TO.x}
            cy={TO.y}
            r={stroke * 2.1}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke * 0.7}
          />
          <circle cx={TO.x} cy={TO.y} r={stroke * 0.8} fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}
