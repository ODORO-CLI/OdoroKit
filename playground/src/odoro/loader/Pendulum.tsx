/**
 * Pendule : une masse au bout d'une tige oscille autour d'un pivot, le long
 * d'un arc trace en pointille.
 *
 * ## Une seule courbe, parce que c'est la bonne
 *
 * Un pendule aux petites amplitudes est le mouvement harmonique par
 * excellence : sa position est un sinus du temps, lent aux extremes,
 * rapide au passage par la verticale. La courbe `ease-in-out` en est une
 * approximation tres proche sur une demi-periode, et c'est la seule ou
 * elle est juste — une chute, un rebond, un choc appellent d'autres
 * courbes. Ici, deux demi-periodes, une par sens, et rien d'autre.
 *
 * L'arc en pointille est ce qui distingue ce pendule d'une bille qui se
 * balance : il montre l'amplitude, et la masse le parcourt exactement,
 * parce que son rayon est la longueur de la tige. Il est decoupe par un
 * `clip-path` en secteur, ouvert de l'angle de l'oscillation de part et
 * d'autre de la verticale.
 *
 * Une animation de rotation, tenue par le compositeur, aucun JavaScript
 * apres le premier rendu. La tige et la masse tournent ensemble : c'est le
 * bras entier qui pivote, autour du point d'attache.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le pendule est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la masse pend a la verticale sous son arc : c'est
 * l'etat ou tout pendule finit par revenir, et la figure se reconnait
 * encore.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-pendulum'

/** Longueur de la tige, en diametres de masse. */
const ROD = 3.5

/** Diametre du pivot, en diametres de masse. */
const PIVOT = 0.5

/** Amplitude de part et d'autre de la verticale, en degres. */
const ANGLE = 32

/**
 * Demi-ouverture du secteur qui decoupe l'arc, en pour cent de la boite.
 *
 * Le secteur part du centre de la boite et s'ouvre vers le bas : a la
 * hauteur du bord inferieur, il s'ecarte de `tan(ANGLE)` fois le rayon de
 * part et d'autre du milieu.
 */
const WEDGE = Number((50 * Math.tan((ANGLE * Math.PI) / 180)).toFixed(1))

/** Pose le pivot, l'arc, le bras et son oscillation, une fois par document. */
function ensurePendulumRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La boite est assez large pour la masse a son point le plus ecarte,
    // et assez haute pour le pivot, la tige et la moitie de la masse.
    '[data-o-pendulum]{',
    'position:relative;display:inline-block;',
    `width:calc(var(--o-pendulum-size) * ${String((2 * ROD * Math.sin((ANGLE * Math.PI) / 180) + 1.3).toFixed(2))});`,
    `height:calc(var(--o-pendulum-size) * ${String(PIVOT / 2 + ROD + 0.5 + 0.2)});`,
    '}',
    '[data-o-pendulum-pivot]{',
    'position:absolute;top:0;left:50%;',
    `width:calc(var(--o-pendulum-size) * ${String(PIVOT)});height:calc(var(--o-pendulum-size) * ${String(PIVOT)});`,
    `margin-left:calc(var(--o-pendulum-size) * ${String(-PIVOT / 2)});`,
    'border-radius:50%;background:var(--o-pendulum-color);',
    '}',
    // Un cercle en pointille centre sur le pivot, du rayon de la tige,
    // dont seul un secteur vers le bas est conserve.
    '[data-o-pendulum-arc]{',
    'position:absolute;left:50%;',
    `top:calc(var(--o-pendulum-size) * ${String(PIVOT / 2 - ROD)});`,
    `margin-left:calc(var(--o-pendulum-size) * ${String(-ROD)});`,
    `width:calc(var(--o-pendulum-size) * ${String(2 * ROD)});height:calc(var(--o-pendulum-size) * ${String(2 * ROD)});`,
    'border-radius:50%;border:1px dashed var(--o-pendulum-color);opacity:0.35;',
    `clip-path:polygon(50% 50%,${String(50 - WEDGE)}% 100%,${String(50 + WEDGE)}% 100%);`,
    '}',
    // Le bras est un point sans taille au pivot : tige et masse s'y
    // accrochent, et tournent avec lui.
    '[data-o-pendulum-arm]{',
    'position:absolute;left:50%;width:0;height:0;',
    `top:calc(var(--o-pendulum-size) * ${String(PIVOT / 2)});`,
    'transform-origin:0 0;',
    'animation:o-pendulum-swing var(--o-pendulum-speed) infinite;',
    '}',
    '[data-o-pendulum-rod]{',
    'position:absolute;top:0;left:-0.5px;width:1px;',
    `height:calc(var(--o-pendulum-size) * ${String(ROD)});`,
    'background:var(--o-pendulum-color);opacity:0.6;',
    '}',
    '[data-o-pendulum-bob]{',
    'position:absolute;',
    `top:calc(var(--o-pendulum-size) * ${String(ROD - 0.5)});`,
    'left:calc(var(--o-pendulum-size) * -0.5);',
    'width:var(--o-pendulum-size);height:var(--o-pendulum-size);',
    'border-radius:50%;background:var(--o-pendulum-color);',
    '}',
    // Lent aux extremes, rapide a la verticale : un sinus, en deux moities.
    '@keyframes o-pendulum-swing{',
    `0%{transform:rotate(${String(ANGLE)}deg);animation-timing-function:ease-in-out}`,
    `50%{transform:rotate(${String(-ANGLE)}deg);animation-timing-function:ease-in-out}`,
    `100%{transform:rotate(${String(ANGLE)}deg)}`,
    '}',
    // Une masse a la verticale sous son arc : la figure est dite, au repos.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pendulum-arm]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface PendulumOwnProps {
  /** Diametre de la masse, en pixels. @defaultValue 12 */
  size?: number
  /** Duree d'un aller-retour, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Couleur de la masse, de la tige, du pivot et de l'arc. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type PendulumProps = Customisable<PendulumOwnProps, 'span'>

/**
 * Signale une attente par un pendule qui oscille le long de son arc.
 *
 * @example
 * <Pendulum />
 *
 * @example
 * // Plus gros, plus lent, dans la teinte de marque.
 * <Pendulum size={16} speed={2400} color="var(--o-palette-brand-500)" />
 */
export function Pendulum({
  size = 12,
  speed = 1600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: PendulumProps): ReactElement {
  ensurePendulumRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-pendulum-size': `${String(size)}px`,
    '--o-pendulum-speed': `${String(speed)}ms`,
    '--o-pendulum-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-pendulum=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-pendulum-arc="" />
      <span aria-hidden data-o-pendulum-pivot="" />
      <span aria-hidden data-o-pendulum-arm="">
        <span data-o-pendulum-rod="" />
        <span data-o-pendulum-bob="" />
      </span>
    </span>
  )
}
