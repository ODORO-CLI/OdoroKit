/**
 * Deux engrenages : un grand et un petit tournent en sens contraires, dents
 * engrenees, a des vitesses qui respectent leur rapport.
 *
 * ## Des dents qui ne se traversent pas
 *
 * Deux engrenages dessines au hasard se chevauchent : une dent de l'un
 * finit toujours par passer a travers une dent de l'autre, et l'oeil le
 * voit meme sans savoir pourquoi. Ici les deux roues ont des dents de la
 * meme hauteur et du meme pas, ce qui fixe leurs rayons a proportion de
 * leur nombre de dents, et leur entraxe a la somme de leurs rayons
 * primitifs. Chaque roue est ensuite tournee pour qu'une dent de l'une
 * pointe vers l'autre, et un creux de l'autre vers la premiere.
 *
 * Le rapport des vitesses est celui des dents : douze contre huit, le
 * petit engrenage tourne une fois et demie plus vite, en sens inverse.
 * C'est la seule vitesse ou les dents restent engrenees ; toute autre les
 * ferait glisser.
 *
 * Les dents sont des trapezes, pas des developpantes : a cette taille, la
 * difference est invisible, et le trace reste une suite de segments que le
 * navigateur rend sans effort.
 *
 * Deux animations de rotation, tenues par le compositeur. Aucun JavaScript
 * apres le premier rendu : les traces sont calcules une fois au chargement
 * du module.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les engrenages restent immobiles, dents
 * engrenees : la figure se lit encore comme un chargeur, seul le mouvement
 * s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-gear-pair'

/** Ce qui definit une roue. */
interface Gear {
  readonly cx: number
  readonly cy: number
  readonly teeth: number
  /** Rayon primitif : la ou les dents des deux roues se rencontrent. */
  readonly pitch: number
}

/** Hauteur d'une dent, de part et d'autre du rayon primitif. */
const TOOTH = 4

/**
 * Jeu au sommet des dents.
 *
 * Sans lui, le bout d'une dent toucherait exactement le fond du creux d'en
 * face, et les dents en trapeze s'y chevaucheraient d'une fraction d'unite
 * a chaque passage. Une unite de retrait suffit a l'eviter.
 */
const CLEARANCE = 1

/**
 * Trace d'une roue dentee, avec son trou central.
 *
 * Chaque dent est un trapeze : montee au quart du pas, plateau jusqu'a la
 * moitie, descente aux trois quarts, creux jusqu'au pas suivant. `toothAt`
 * est l'angle, en degres, ou l'on veut le milieu d'une dent : c'est par lui
 * que les deux roues s'engrenent.
 */
function gearPath(gear: Gear, toothAt: number): string {
  const outer = gear.pitch + TOOTH - CLEARANCE
  const inner = gear.pitch - TOOTH
  const pitch = (2 * Math.PI) / gear.teeth
  const start = (toothAt * Math.PI) / 180 - pitch * 0.375

  const point = (angle: number, radius: number): string =>
    `${(gear.cx + radius * Math.cos(angle)).toFixed(2)} ${(gear.cy + radius * Math.sin(angle)).toFixed(2)}`

  const points: string[] = []
  for (let index = 0; index < gear.teeth; index += 1) {
    const base = start + pitch * index
    points.push(
      point(base, inner),
      point(base + pitch * 0.25, outer),
      point(base + pitch * 0.5, outer),
      point(base + pitch * 0.75, inner),
    )
  }

  const hole = gear.pitch * 0.32
  return [
    `M ${points.join(' L ')} Z`,
    `M ${point(0, hole)} A ${String(hole)} ${String(hole)} 0 1 0 ${point(Math.PI, hole)}`,
    `A ${String(hole)} ${String(hole)} 0 1 0 ${point(0, hole)} Z`,
  ].join(' ')
}

/** La grande roue, en bas a gauche de la vue. */
const BIG: Gear = { cx: 38, cy: 58, teeth: 12, pitch: 24 }

/** Direction du petit engrenage depuis le grand, en degres. */
const LINK = -35

/**
 * La petite roue, a l'entraxe exact : la somme des rayons primitifs, dans
 * la direction de liaison.
 */
const SMALL: Gear = {
  cx: BIG.cx + (BIG.pitch + 16) * Math.cos((LINK * Math.PI) / 180),
  cy: BIG.cy + (BIG.pitch + 16) * Math.sin((LINK * Math.PI) / 180),
  teeth: 8,
  pitch: 16,
}

/** Une dent du grand pointe vers le petit ; un creux du petit lui repond. */
const BIG_PATH = gearPath(BIG, LINK)
const SMALL_PATH = gearPath(SMALL, LINK + 180 + 360 / SMALL.teeth / 2)

/** Pose les engrenages et leurs rotations, une fois par document. */
function ensureGearRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-gear-pair]{display:inline-block;line-height:0}',
    '[data-o-gear-pair] svg{display:block}',
    // Chaque roue tourne autour de son propre centre, en unites de la vue.
    '[data-o-gear]{',
    'transform-box:view-box;transform-origin:var(--o-gear-origin);',
    'animation:var(--o-gear-spin) var(--o-gear-speed) linear infinite;',
    '}',
    '@keyframes o-gear-pair-cw{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@keyframes o-gear-pair-ccw{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-gear]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface GearPairOwnProps {
  /** Cote de la zone de dessin, en pixels. @defaultValue 56 */
  size?: number
  /** Duree d'un tour du grand engrenage, en millisecondes. @defaultValue 3000 */
  speed?: number
  /** Couleur des engrenages. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type GearPairProps = Customisable<GearPairOwnProps, 'span'>

/**
 * Signale une attente par deux engrenages qui tournent l'un contre l'autre.
 *
 * @example
 * <GearPair />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <GearPair size={96} speed={5000} color="var(--o-palette-brand-500)" />
 */
export function GearPair({
  size = 56,
  speed = 3000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: GearPairProps): ReactElement {
  ensureGearRule()

  const { className, style } = mergePresentation({}, rest)

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
      data-o-gear-pair=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path
          data-o-gear=""
          d={BIG_PATH}
          fill="currentColor"
          fillRule="evenodd"
          style={
            {
              '--o-gear-origin': `${String(BIG.cx)}px ${String(BIG.cy)}px`,
              '--o-gear-spin': 'o-gear-pair-cw',
              '--o-gear-speed': `${String(speed)}ms`,
            } as CSSProperties
          }
        />
        <path
          data-o-gear=""
          d={SMALL_PATH}
          fill="currentColor"
          fillOpacity={0.7}
          fillRule="evenodd"
          style={
            {
              '--o-gear-origin': `${SMALL.cx.toFixed(2)}px ${SMALL.cy.toFixed(2)}px`,
              '--o-gear-spin': 'o-gear-pair-ccw',
              // Le rapport des dents : le petit fait un tour pendant que le
              // grand en fait huit douziemes.
              '--o-gear-speed': `${String(Math.round((speed * SMALL.teeth) / BIG.teeth))}ms`,
            } as CSSProperties
          }
        />
      </svg>
    </span>
  )
}
