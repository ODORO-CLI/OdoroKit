/**
 * Polygone qui gagne des cotes : un polygone en trait passe du triangle a
 * l'hexagone un cote a la fois, puis les reperd.
 *
 * ## Soixante points pour quatre polygones
 *
 * Un navigateur n'interpole deux traces que s'ils ont le meme nombre de
 * points. Un triangle en a trois, un hexagone six : pour passer de l'un a
 * l'autre, chaque polygone est reecrit avec soixante points repartis a
 * distance egale le long de son perimetre. Soixante parce que c'est le plus
 * petit multiple commun de trois, quatre, cinq et six : chaque vrai sommet
 * tombe alors exactement sur un point, et les cotes restent droits a
 * chaque palier au lieu de bomber.
 *
 * Entre deux paliers, les points glissent chacun vers leur nouvelle place
 * et un sommet nait au milieu d'un cote. C'est cela que l'oeil suit : non
 * une forme qui tourne, mais une forme qui se complique, puis se simplifie.
 * L'aller-retour evite le saut de l'hexagone au triangle qu'imposerait une
 * boucle a sens unique.
 *
 * L'interpolation est confiee a SMIL, natif dans le SVG : aucun JavaScript
 * apres le premier rendu, et pas de filtre. Les points sont calcules une
 * fois au chargement du module.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * SMIL ignore la preference de mouvement reduit : c'est donc le composant
 * qui la lit, et qui n'insere pas l'animation quand elle est active. Il
 * reste l'hexagone, la forme la plus aboutie du cycle.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-polygon-morph'

/** Points par trace : le plus petit multiple commun de 3, 4, 5 et 6. */
const SAMPLES = 60

/** Rayon du cercle circonscrit, dans une vue de 100 unites. */
const RADIUS = 42

/**
 * Trace d'un polygone regulier a `sides` cotes, pointe en haut, ecrit avec
 * `SAMPLES` points repartis le long de son perimetre.
 */
function polygon(sides: number): string {
  const vertices = Array.from({ length: sides }, (_, index) => {
    const angle = ((2 * Math.PI) / sides) * index - Math.PI / 2
    return [50 + RADIUS * Math.cos(angle), 50 + RADIUS * Math.sin(angle)] as const
  })
  const perSide = SAMPLES / sides

  const points = Array.from({ length: SAMPLES }, (_, index) => {
    const side = Math.floor(index / perSide)
    const along = (index % perSide) / perSide
    const [ax, ay] = vertices[side] ?? [50, 50]
    const [bx, by] = vertices[(side + 1) % sides] ?? [50, 50]
    return `${(ax + (bx - ax) * along).toFixed(2)} ${(ay + (by - ay) * along).toFixed(2)}`
  })

  return `M ${points.join(' L ')} Z`
}

const TRIANGLE = polygon(3)
const SQUARE = polygon(4)
const PENTAGON = polygon(5)
const HEXAGON = polygon(6)

/** L'aller-retour, avec un palier sur chaque forme. */
const SEQUENCE = [TRIANGLE, SQUARE, PENTAGON, HEXAGON, PENTAGON, SQUARE]
const VALUES = [...SEQUENCE.flatMap((shape) => [shape, shape]), TRIANGLE].join(';')
const KEY_TIMES = Array.from({ length: SEQUENCE.length * 2 + 1 }, (_, index) => {
  // Chaque forme tient un peu plus longtemps qu'elle ne met a changer :
  // les paliers sont ce que l'on reconnait, les transitions ce qui bouge.
  const step = Math.floor(index / 2)
  const hold = index % 2 === 1 ? 0.55 : 0
  return ((step + hold) / SEQUENCE.length).toFixed(4)
}).join(';')
const KEY_SPLINES = Array.from({ length: SEQUENCE.length * 2 }, () => '0.4 0 0.2 1').join(';')

/** Pose le cadre, une fois par document. */
function ensurePolygonMorphRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-polygon-morph]{display:inline-block;line-height:0}',
    '[data-o-polygon-morph] svg{display:block}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface PolygonMorphOwnProps {
  /** Cote de la zone de dessin, en pixels. @defaultValue 44 */
  size?: number
  /** Epaisseur du trait, en pixels. @defaultValue 3 */
  thickness?: number
  /** Duree d'un aller-retour complet, en millisecondes. @defaultValue 3000 */
  speed?: number
  /** Couleur du trait. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type PolygonMorphProps = Customisable<PolygonMorphOwnProps, 'span'>

/**
 * Signale une attente par un polygone qui gagne et perd des cotes.
 *
 * @example
 * <PolygonMorph />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <PolygonMorph size={72} speed={4800} color="var(--o-palette-brand-500)" />
 */
export function PolygonMorph({
  size = 44,
  thickness = 3,
  speed = 3000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: PolygonMorphProps): ReactElement {
  ensurePolygonMorphRule()
  const { reduced } = useMotionState()

  const { className, style } = mergePresentation({}, rest)

  // Le dessin vit dans une vue de 100 unites : l'epaisseur demandee en
  // pixels est convertie pour que le trait garde sa mesure a toute taille.
  const stroke = Math.min((thickness / size) * 100, 16)

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
      data-o-polygon-morph=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path
          d={reduced ? HEXAGON : TRIANGLE}
          fill="currentColor"
          fillOpacity={0.12}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinejoin="round"
        >
          {reduced ? null : (
            <animate
              attributeName="d"
              values={VALUES}
              keyTimes={KEY_TIMES}
              keySplines={KEY_SPLINES}
              calcMode="spline"
              dur={`${String(speed)}ms`}
              repeatCount="indefinite"
            />
          )}
        </path>
      </svg>
    </span>
  )
}
