/**
 * Avion en papier : un avion traverse la vue en piquant puis en remontant,
 * et laisse derriere lui la trace exacte de son passage.
 *
 * ## Une seule courbe, deux animations qui ne peuvent pas deriver
 *
 * L'avion suit une courbe ; la trainee est cette meme courbe qui se
 * dessine. Le piege est classique : l'avion avance en parametre — a pas
 * egaux sur `t` — tandis qu'un trace en tirets avance en longueur d'arc. Sur
 * une courbe qui change de vitesse, les deux se decalent, et l'avion finit
 * par voler devant ou derriere sa propre trace.
 *
 * La courbe est donc echantillonnee une fois, au chargement du module, et
 * les deux animations sont ecrites depuis **la meme table** : a chaque
 * echantillon, la position et l'angle de l'avion d'un cote, la longueur
 * deja parcourue de l'autre. Les deux jeux d'images cles tombent aux memes
 * pourcentages ; il n'y a plus rien qui puisse deriver.
 *
 * L'angle vient de la derivee de la courbe, pas d'une valeur choisie a la
 * main : le nez de l'avion pointe toujours exactement la ou il va, y
 * compris au creux du piquer.
 *
 * Le chemin declare une longueur de cent, ce qui laisse ecrire les
 * decalages de tirets en pour cent du parcours, sans mesurer quoi que ce
 * soit dans le document.
 *
 * Trois animations CSS sur des elements SVG, tenues par le compositeur,
 * aucun JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, l'avion est pose au bout de sa course, trainee
 * complete : le trajet est raconte par son resultat.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-paper-plane'

/**
 * La courbe de vol, dans une vue de 100 unites : depart en bas a gauche,
 * creux au milieu, sortie en haut a droite.
 */
const P0 = { x: 10, y: 82 }
const P1 = { x: 34, y: 90 }
const P2 = { x: 54, y: 14 }
const P3 = { x: 90, y: 30 }

/** Le meme trace, pour la trainee : les deux viennent des memes points. */
const TRAIL = `M ${String(P0.x)} ${String(P0.y)} C ${String(P1.x)} ${String(P1.y)}, ${String(P2.x)} ${String(P2.y)}, ${String(P3.x)} ${String(P3.y)}`

/**
 * L'avion, dessine autour de l'origine, nez vers la droite, en deux demi-
 * ailes : le pli central n'est pas un trait, c'est la limite entre une aile
 * pleine et une aile en retrait, comme sur une feuille pliee vue de biais.
 */
const WING_NEAR = 'M 12 0 L -12 -8.5 L -6 0 Z'

/** L'aile lointaine, dans l'ombre du pli. */
const WING_FAR = 'M 12 0 L -12 8.5 L -6 0 Z'

/** Nombre d'echantillons de la courbe. Assez pour que l'oeil ne voie pas les segments. */
const SAMPLES = 24

/** Part du cycle occupee par le vol, en pour cent. Le reste est le fondu. */
const FLIGHT = 76

/** Un point du vol : ou est l'avion, comment il est oriente, ou en est la trainee. */
interface Sample {
  /** Instant dans le cycle, en pour cent. */
  readonly at: number
  /** Abscisse, en unites de la vue. */
  readonly x: number
  /** Ordonnee, en unites de la vue. */
  readonly y: number
  /** Cap, en degres. */
  readonly angle: number
  /** Part du trace qui reste a dessiner, en pour cent. */
  readonly left: number
}

/** Position et cap sur la courbe, a un parametre donne. */
function sampleAt(t: number): { x: number; y: number; angle: number } {
  const u = 1 - t
  const x = u * u * u * P0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t * t * t * P3.x
  const y = u * u * u * P0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t * t * t * P3.y

  // La derivee d'une cubique de Bezier : c'est elle qui donne le cap, et
  // non une orientation posee a l'oeil image par image.
  const dx = 3 * u * u * (P1.x - P0.x) + 6 * u * t * (P2.x - P1.x) + 3 * t * t * (P3.x - P2.x)
  const dy = 3 * u * u * (P1.y - P0.y) + 6 * u * t * (P2.y - P1.y) + 3 * t * t * (P3.y - P2.y)

  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI }
}

/**
 * Echantillonne la courbe une fois pour toutes.
 *
 * La longueur est cumulee sur la ligne brisee des echantillons : c'est la
 * meme approximation que celle que l'oeil voit, donc l'erreur entre l'avion
 * et sa trainee est celle du dessin lui-meme, pas une erreur de plus.
 */
function buildFlight(): readonly Sample[] {
  const points: { x: number; y: number; angle: number }[] = []
  for (let index = 0; index <= SAMPLES; index += 1) points.push(sampleAt(index / SAMPLES))

  const walked: number[] = []
  let total = 0
  let previous: { x: number; y: number } | undefined
  for (const point of points) {
    if (previous !== undefined) total += Math.hypot(point.x - previous.x, point.y - previous.y)
    walked.push(total)
    previous = point
  }

  return points.map((point, index) => ({
    at: (index / SAMPLES) * FLIGHT,
    x: point.x,
    y: point.y,
    angle: point.angle,
    left: 100 * (1 - (walked[index] ?? 0) / total),
  }))
}

/** Le vol, calcule une fois au chargement du module. */
const FLIGHT_PATH = buildFlight()

/** Pose l'avion, sa trainee et leur fondu, une fois par document. */
function ensurePlaneRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const last = FLIGHT_PATH[FLIGHT_PATH.length - 1]
  const end = last ?? { at: FLIGHT, x: P3.x, y: P3.y, angle: 0, left: 0 }

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-paper-plane]{display:inline-block;line-height:0}',
    '[data-o-paper-plane] svg{display:block}',
    '[data-o-plane-fade]{animation:o-paper-plane-fade var(--o-plane-speed) infinite}',
    '[data-o-plane-body],[data-o-plane-trail]{',
    'transform-box:view-box;',
    'animation-duration:var(--o-plane-speed);animation-iteration-count:infinite;',
    'animation-timing-function:linear;',
    '}',
    '[data-o-plane-body]{animation-name:o-paper-plane-fly}',
    '[data-o-plane-trail]{',
    'stroke-dasharray:100 100;stroke-dashoffset:100;animation-name:o-paper-plane-trail;',
    '}',
    '@keyframes o-paper-plane-fly{',
    ...FLIGHT_PATH.map(
      (point) =>
        `${point.at.toFixed(2)}%{transform:translate(${point.x.toFixed(2)}px,${point.y.toFixed(2)}px) rotate(${point.angle.toFixed(1)}deg)}`,
    ),
    // L'avion tient sa derniere pose pendant que tout s'efface : sans cette
    // image cle, il reviendrait doucement a son point de depart.
    `100%{transform:translate(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px) rotate(${end.angle.toFixed(1)}deg)}`,
    '}',
    '@keyframes o-paper-plane-trail{',
    ...FLIGHT_PATH.map(
      (point) => `${point.at.toFixed(2)}%{stroke-dashoffset:${point.left.toFixed(2)}}`,
    ),
    '100%{stroke-dashoffset:0}',
    '}',
    // Le fondu porte sur l'ensemble : l'avion et sa trainee disparaissent
    // ensemble, et le cycle repart d'une vue vide plutot que d'un saut.
    '@keyframes o-paper-plane-fade{',
    '0%{opacity:0;animation-timing-function:ease-out}',
    `6%,${String(FLIGHT)}%{opacity:1;animation-timing-function:ease-in}`,
    '92%,100%{opacity:0}',
    '}',
    // Avion pose au bout de sa course, trainee complete : le trajet dit par
    // son resultat.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-plane-fade]{animation:none;opacity:1}',
    '[data-o-plane-trail]{animation:none;stroke-dashoffset:0}',
    `[data-o-plane-body]{animation:none;transform:translate(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px) rotate(${end.angle.toFixed(1)}deg)}`,
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface PaperPlaneOwnProps {
  /** Cote du dessin, en pixels. @defaultValue 80 */
  size?: number
  /** Duree d'un vol complet, fondu compris, en millisecondes. @defaultValue 2600 */
  speed?: number
  /** Couleur de l'avion et de sa trainee. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type PaperPlaneProps = Customisable<PaperPlaneOwnProps, 'span'>

/**
 * Signale une attente par un avion en papier qui trace son passage.
 *
 * @example
 * <PaperPlane />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <PaperPlane size={120} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function PaperPlane({
  size = 80,
  speed = 2600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: PaperPlaneProps): ReactElement {
  ensurePlaneRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-plane-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-paper-plane=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g data-o-plane-fade="">
          <path
            data-o-plane-trail=""
            d={TRAIL}
            pathLength={100}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeOpacity={0.35}
            strokeLinecap="round"
            strokeDasharray="100 100"
          />
          <g data-o-plane-body="">
            <path d={WING_FAR} fill="currentColor" fillOpacity={0.55} />
            <path d={WING_NEAR} fill="currentColor" />
          </g>
        </g>
      </svg>
    </span>
  )
}
