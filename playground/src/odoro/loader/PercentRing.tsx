/**
 * Anneau de progression : un anneau complet qui se remplit depuis le sommet,
 * le pourcentage au centre.
 *
 * ## Le remplissage est un decalage
 *
 * La piste et le remplissage sont le meme cercle. Le tirete du second a la
 * longueur de la circonference, et son decalage retient la part qui n'est
 * pas encore atteinte : passer de 40 a 60 ne change qu'un nombre, que le
 * navigateur fait glisser sans recalculer la mise en page. Le cercle part
 * de trois heures ; un quart de tour en arriere le fait partir du sommet,
 * la ou l'on attend le zero d'une horloge.
 *
 * ## Deux modes, deux honnetetes
 *
 * Le mode determine recoit `value` et le montre tel quel : l'anneau est un
 * `role="progressbar"` complet, valeur comprise, et le chiffre au centre est
 * du texte reel. Le mode `indeterminate` ne pretend rien mesurer : un arc
 * d'un quart de tour tourne sans fin, le centre reste vide, et le
 * `progressbar` est declare **sans** valeur — c'est ainsi que la
 * specification decrit une progression inconnue. Afficher un pourcentage
 * invente serait le mensonge classique des chargeurs.
 *
 * Sous mouvement reduit, la valeur saute sans transition, et l'arc
 * indetermine reste au sommet : la figure se lit encore, seul le mouvement
 * s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-percent-ring'

/** Pose l'anneau, sa transition et sa rotation, une fois par document. */
function ensurePercentRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-percent-ring]{position:relative;display:inline-block;line-height:0}',
    '[data-o-percent-ring] svg{display:block}',
    // Le cercle part du sommet : la rotation est posee en CSS pour que la
    // version animee puisse la remplacer sans se battre avec un attribut.
    '[data-o-pct-fill]{',
    'transform-box:view-box;transform-origin:50% 50%;transform:rotate(-90deg);',
    'transition:stroke-dashoffset var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-pct-indeterminate] [data-o-pct-fill]{',
    'transition:none;',
    'animation:o-percent-ring-spin var(--o-pct-speed) linear infinite;',
    '}',
    '@keyframes o-percent-ring-spin{from{transform:rotate(-90deg)}to{transform:rotate(270deg)}}',
    '[data-o-pct-value]{',
    'position:absolute;inset:0;',
    'display:flex;align-items:center;justify-content:center;',
    'line-height:1;font-weight:600;font-variant-numeric:tabular-nums;',
    'font-size:var(--o-pct-font);',
    '}',
    '[data-o-pct-unit]{font-size:0.55em;font-weight:500;opacity:0.6;margin-left:0.1em}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pct-fill]{transition:none}',
    '[data-o-pct-indeterminate] [data-o-pct-fill]{animation:none;transform:rotate(-90deg)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface PercentRingOwnProps {
  /** Progression, de 0 a 100. Ignoree en mode indetermine. @defaultValue 42 */
  value?: number
  /** Arc tournant sans valeur, quand rien n'est mesurable. @defaultValue false */
  indeterminate?: boolean
  /** Diametre de l'anneau, en pixels. @defaultValue 80 */
  size?: number
  /** Epaisseur de l'anneau, en pixels. @defaultValue 5 */
  thickness?: number
  /** Duree d'un tour de l'arc indetermine, en millisecondes. @defaultValue 1000 */
  speed?: number
  /** Couleur du remplissage. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type PercentRingProps = Customisable<PercentRingOwnProps, 'span'>

/**
 * Anneau de progression, determine ou tournant.
 *
 * @example
 * // Progression reelle.
 * <PercentRing value={sent / total * 100} />
 *
 * @example
 * // Attente sans mesure, dans la teinte de marque.
 * <PercentRing indeterminate color="var(--o-palette-brand-500)" />
 */
export function PercentRing({
  value = 42,
  indeterminate = false,
  size = 80,
  thickness = 5,
  speed = 1000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: PercentRingProps): ReactElement {
  ensurePercentRule()

  const clamped = Math.min(100, Math.max(0, value))

  // Le dessin vit dans une vue de 100 unites : l'epaisseur demandee en
  // pixels est convertie pour que le trait garde sa mesure a toute taille.
  const stroke = Math.min((thickness / size) * 100, 25)
  const radius = 50 - stroke / 2
  const circumference = 2 * Math.PI * radius

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-pct-speed': `${String(speed)}ms`,
    '--o-pct-font': `${String(Math.round(size * 0.26))}px`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={hostStyle}
      data-o-percent-ring=""
      data-o-pct-indeterminate={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // Un progressbar sans aria-valuenow est indetermine : c'est la maniere
      // normative de dire « j'avance, mais je ne sais pas de combien ».
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
    >
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          opacity={0.15}
        />
        <circle
          data-o-pct-fill=""
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          // A zero, un bout rond dessinerait encore un point.
          strokeLinecap={indeterminate || clamped > 0 ? 'round' : 'butt'}
          strokeDasharray={
            indeterminate
              ? `${String(circumference * 0.25)} ${String(circumference)}`
              : `${String(circumference)} ${String(circumference)}`
          }
          strokeDashoffset={indeterminate ? undefined : circumference * (1 - clamped / 100)}
        />
      </svg>
      {indeterminate ? null : (
        <span aria-hidden data-o-pct-value="">
          {Math.round(clamped)}
          <span data-o-pct-unit="">%</span>
        </span>
      )}
    </span>
  )
}
