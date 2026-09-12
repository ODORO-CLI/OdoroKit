/**
 * Batterie qui se charge : un boitier a plot dont le niveau se remplit par
 * la gauche.
 *
 * ## Une echelle, pas une barre
 *
 * Le niveau est un seul rectangle mis a l'echelle horizontalement, ancre
 * sur le bord gauche du boitier. Une largeur animee obligerait le
 * navigateur a redessiner la geometrie a chaque image ; une echelle est une
 * transformation, que le compositeur applique sans rien recalculer.
 *
 * Le boitier est un contour, le plot une forme pleine : c'est la silhouette
 * qui dit « batterie », pas la couleur. Rien n'est ecrit en dur, tout suit
 * `currentColor` — une batterie rouge en fin de course est une decision de
 * page, pas du composant.
 *
 * ## Deux modes, deux honnetetes
 *
 * Le mode determine recoit `value` et le montre tel quel : la batterie est
 * un `role="progressbar"` complet, valeur comprise. Le niveau glisse d'une
 * valeur a l'autre par une transition, jamais par un saut.
 *
 * Le mode `indeterminate` est la charge en cours : le niveau balaye le
 * boitier sans fin, l'eclair apparait, et le `progressbar` est declare
 * **sans** valeur — c'est ainsi que la specification decrit une progression
 * inconnue. Le niveau y est a demi-opaque pour que l'eclair, lui plein,
 * reste lisible qu'il soit sur le vide ou sur le plein : deux formes de la
 * meme couleur ne se distinguent que par leur densite.
 *
 * Sous mouvement reduit, la valeur saute sans transition et la charge
 * s'arrete a mi-course : la batterie se lit encore, seul le mouvement
 * s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-battery-fill'

/** Bord gauche de la zone remplissable, en unites de la vue. */
const LEFT = 8

/** Eclair de charge, centre dans le boitier. */
const BOLT = 'M 52 11 L 38 27 L 46 27 L 42 37 L 56 21 L 48 21 Z'

/** Pose le boitier, sa transition et sa charge, une fois par document. */
function ensureBatteryRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-battery-fill]{display:inline-block;line-height:0}',
    '[data-o-battery-fill] svg{display:block}',
    // L'echelle part du bord gauche du boitier, en unites de la vue.
    '[data-o-battery-level]{',
    `transform-box:view-box;transform-origin:${String(LEFT)}px 24px;`,
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-battery-charging] [data-o-battery-level]{',
    'transition:none;',
    'animation:o-battery-fill-charge var(--o-battery-speed) ease-in-out infinite;',
    '}',
    // Le niveau repart de presque rien : une charge qui recommence pleine
    // ressemblerait a un clignotement, pas a une montee.
    '@keyframes o-battery-fill-charge{',
    '0%{transform:scaleX(0.04)}',
    '80%,100%{transform:scaleX(1)}',
    '}',
    '[data-o-battery-bolt]{',
    'transform-box:view-box;transform-origin:47px 24px;',
    'animation:o-battery-fill-spark var(--o-battery-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-battery-fill-spark{',
    '0%,100%{transform:scale(0.88);opacity:0.55}',
    '80%{transform:scale(1);opacity:1}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-battery-level]{transition:none}',
    '[data-o-battery-charging] [data-o-battery-level]{animation:none;transform:scaleX(0.5)}',
    '[data-o-battery-bolt]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface BatteryFillOwnProps {
  /** Charge, de 0 a 100. Ignoree en mode indetermine. @defaultValue 58 */
  value?: number
  /** Charge en cours, sans valeur mesurable. @defaultValue false */
  indeterminate?: boolean
  /** Largeur de la batterie, en pixels. @defaultValue 96 */
  size?: number
  /** Duree d une charge complete, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur du boitier et du niveau. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type BatteryFillProps = Customisable<BatteryFillOwnProps, 'span'>

/**
 * Batterie dont le niveau dit la charge, ou se remplit sans fin.
 *
 * @example
 * // Charge reelle.
 * <BatteryFill value={battery.level * 100} />
 *
 * @example
 * // Charge en cours, dans la teinte de marque.
 * <BatteryFill indeterminate color="var(--o-palette-brand-500)" />
 */
export function BatteryFill({
  value = 58,
  indeterminate = false,
  size = 96,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: BatteryFillProps): ReactElement {
  ensureBatteryRule()

  const clamped = Math.min(100, Math.max(0, value))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    width: `${String(size)}px`,
    // La vue fait 100 sur 48 : la hauteur suit, sans quoi le boitier
    // s'etirerait.
    height: `${String(Math.round(size * 0.48))}px`,
    color,
    '--o-battery-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={hostStyle}
      data-o-battery-fill=""
      data-o-battery-charging={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // Un progressbar sans aria-valuenow est indetermine : c'est la maniere
      // normative de dire « j'avance, mais je ne sais pas de combien ».
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
    >
      <svg aria-hidden viewBox="0 0 100 48" width="100%" height="100%">
        <rect
          x="1.5"
          y="1.5"
          width="86"
          height="45"
          rx="9"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          opacity={0.5}
        />
        <rect x="91" y="15" width="7.5" height="18" rx="3" fill="currentColor" opacity={0.5} />
        <rect
          data-o-battery-level=""
          x={LEFT}
          y="8"
          width="73"
          height="32"
          rx="4"
          fill="currentColor"
          fillOpacity={indeterminate ? 0.45 : 1}
          style={indeterminate ? undefined : { transform: `scaleX(${(clamped / 100).toFixed(4)})` }}
        />
        {indeterminate ? (
          <path data-o-battery-bolt="" d={BOLT} fill="currentColor" />
        ) : null}
      </svg>
    </span>
  )
}
