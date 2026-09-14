/**
 * Aiguilles : une horloge dont la grande aiguille avance par a-coups, et
 * dont la petite prend un cran a chaque tour de la grande.
 *
 * ## Une aiguille qui saute, puis tremble
 *
 * Une aiguille mecanique ne glisse pas : elle saute d'un cran, depasse
 * legerement, et se pose. Le saut est une animation en `steps`, douze par
 * tour, sur un groupe exterieur ; le tremblement est une seconde animation,
 * sur un groupe interieur, d'une duree d'un cran exactement : elle part
 * d'un leger depassement et revient a zero en `ease-out`. Les deux se
 * synchronisent d'elles-memes, puisque la premiere saute a la fin de
 * chaque periode de la seconde. Une seule animation ne saurait pas faire
 * les deux : `steps` ne connait pas le depassement, et une courbe continue
 * ne connait pas le saut.
 *
 * La petite aiguille avance d'un cran — un douzieme de tour — chaque fois
 * que la grande boucle un tour : c'est le rapport d'une horloge, et c'est
 * ce qui la fait lire comme une horloge plutot que comme deux rayons qui
 * tournent. Les douze reperes du cadran sont calcules une fois au
 * chargement du module.
 *
 * Trois animations sur des groupes SVG, tenues par le compositeur, aucun
 * JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le cadran est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les deux aiguilles sont a midi, immobiles : la
 * figure se lit encore comme une horloge, seul le temps s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-clock-hands'

/** Crans par tour de la grande aiguille. */
const TICKS = 12

/** Un repere du cadran : un trait, plus long aux quarts. */
interface Mark {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
  readonly major: boolean
}

/** Les douze reperes, du rayon exterieur vers l'interieur. */
const MARKS: readonly Mark[] = Array.from({ length: TICKS }, (_, index) => {
  const angle = (2 * Math.PI * index) / TICKS - Math.PI / 2
  const major = index % 3 === 0
  const outer = 41
  const inner = major ? 34 : 37.5
  return {
    x1: Number((50 + outer * Math.cos(angle)).toFixed(2)),
    y1: Number((50 + outer * Math.sin(angle)).toFixed(2)),
    x2: Number((50 + inner * Math.cos(angle)).toFixed(2)),
    y2: Number((50 + inner * Math.sin(angle)).toFixed(2)),
    major,
  }
})

/** Pose le cadran, les sauts et le tremblement, une fois par document. */
function ensureClockRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-clock-hands]{display:inline-block;line-height:0}',
    '[data-o-clock-hands] svg{display:block}',
    '[data-o-clock-hand],[data-o-clock-settle]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    '}',
    // Douze sauts par tour, a la fin de chaque cran.
    '[data-o-clock-hand="minute"]{',
    `animation:o-clock-hands-turn var(--o-clock-speed) steps(${String(TICKS)},end) infinite;`,
    '}',
    // Un cran par tour de la grande : douze fois plus lent.
    '[data-o-clock-hand="hour"]{',
    `animation:o-clock-hands-turn calc(var(--o-clock-speed) * ${String(TICKS)}) steps(${String(TICKS)},end) infinite;`,
    '}',
    // Le tremblement dure un cran : il repart a chaque saut.
    '[data-o-clock-settle]{',
    `animation:o-clock-hands-settle calc(var(--o-clock-speed) / ${String(TICKS)}) ease-out infinite;`,
    '}',
    '@keyframes o-clock-hands-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    // Depassement, leger retour, repos : la mecanique se pose.
    '@keyframes o-clock-hands-settle{',
    '0%{transform:rotate(4deg)}',
    '35%{transform:rotate(-1.2deg)}',
    '60%,100%{transform:rotate(0deg)}',
    '}',
    // Midi, immobile : la figure est dite, sans que le temps passe.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-clock-hand],[data-o-clock-settle]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface ClockHandsOwnProps {
  /** Diametre du cadran, en pixels. @defaultValue 48 */
  size?: number
  /** Duree d'un tour de la grande aiguille, en millisecondes. @defaultValue 3000 */
  speed?: number
  /** Couleur du cadran et des aiguilles. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type ClockHandsProps = Customisable<ClockHandsOwnProps, 'span'>

/**
 * Signale une attente par une horloge dont les aiguilles avancent par
 * crans.
 *
 * @example
 * <ClockHands />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <ClockHands size={80} speed={6000} color="var(--o-palette-brand-500)" />
 */
export function ClockHands({
  size = 48,
  speed = 3000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: ClockHandsProps): ReactElement {
  ensureClockRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-clock-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-clock-hands=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          cx={50}
          cy={50}
          r={46}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
        />
        {MARKS.map((mark, index) => (
          <line
            key={index}
            x1={mark.x1}
            y1={mark.y1}
            x2={mark.x2}
            y2={mark.y2}
            stroke="currentColor"
            strokeWidth={mark.major ? 3 : 2}
            strokeLinecap="round"
            strokeOpacity={mark.major ? 1 : 0.5}
          />
        ))}
        <g data-o-clock-hand="hour">
          <line
            x1={50}
            y1={54}
            x2={50}
            y2={30}
            stroke="currentColor"
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>
        <g data-o-clock-hand="minute">
          <g data-o-clock-settle="">
            <line
              x1={50}
              y1={56}
              x2={50}
              y2={17}
              stroke="currentColor"
              strokeWidth={3.5}
              strokeLinecap="round"
            />
          </g>
        </g>
        <circle cx={50} cy={50} r={4} fill="currentColor" />
      </svg>
    </span>
  )
}
