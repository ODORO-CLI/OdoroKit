/**
 * Anneau de progression : un arc qui rejoint sa valeur en glissant.
 *
 * ## Le trait est un perimetre decale
 *
 * L'arc est un cercle SVG dont le tiret fait exactement le perimetre :
 * decaler le tiret decouvre la fraction voulue. C'est une seule propriete,
 * `stroke-dashoffset`, et une transition CSS fait le trajet — changer la
 * valeur en cours de route repart de la position courante, sans saut ni
 * boucle JavaScript.
 *
 * ## Le pourcentage est en chiffres tabulaires
 *
 * Pendant que l'arc glisse, le nombre au centre ne bouge pas d'un pixel :
 * les chiffres tabulaires ont tous la meme chasse, « 9 » et « 1 » compris.
 * Sans cela, le passage de 99 a 100 ferait respirer tout le centre.
 *
 * ## Une barre de progression pour l'arbre d'accessibilite
 *
 * `role="progressbar"` et `aria-valuenow` : un lecteur d'ecran annonce la
 * valeur, pas un dessin. Le pourcentage affiche est retire de l'arbre pour
 * ne pas etre lu deux fois.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface ProgressRingOwnProps {
  /** Progression, de zero a cent. @defaultValue 65 */
  value?: number
  /** Diametre de l'anneau, en pixels. @defaultValue 96 */
  size?: number
  /** Epaisseur du trait, en pixels. @defaultValue 8 */
  thickness?: number
  /** Nom de la mesure pour les lecteurs d'ecran. @defaultValue 'Progression' */
  label?: string
}

/** Toutes les proprietes. */
export type ProgressRingProps = Customisable<ProgressRingOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-progress-ring'

/** Pose la transition de l'arc, une fois par document. */
function ensureRingRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ring]{position:relative;display:inline-grid;place-items:center}',
    '[data-o-ring] svg{transform:rotate(-90deg)}',
    '[data-o-ring-arc]{',
    'stroke:var(--o-ring-tint);',
    'transition:stroke-dashoffset var(--o-duration-slower) var(--o-ease-standard);',
    '}',
    '[data-o-ring-track]{stroke:color-mix(in oklch,currentColor 15%,transparent)}',
    '[data-o-ring-value]{position:absolute}',
    // Mouvement reduit : l arc saute directement a sa valeur.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ring-arc]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Anneau de progression SVG, avec le pourcentage au centre.
 *
 * @example
 * <ProgressRing value={72} />
 *
 * @example
 * // Un grand anneau fin, nomme pour les lecteurs d'ecran.
 * <ProgressRing value={progression} size={160} thickness={4} label="Televersement" />
 */
export function ProgressRing({
  value = 65,
  size = 96,
  thickness = 8,
  label = 'Progression',
  ...rest
}: ProgressRingProps): ReactElement {
  const { reduced } = useMotionState()
  ensureRingRules()

  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      data-o-ring=""
      className={className}
      style={
        {
          ...style,
          '--o-ring-tint': 'var(--o-palette-brand-500)',
          ...(reduced ? { '--o-duration-slower': '0ms' } : {}),
        } as CSSProperties
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${String(size)} ${String(size)}`}
        aria-hidden="true"
      >
        <circle
          data-o-ring-track=""
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
        />
        <circle
          data-o-ring-arc=""
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
        />
      </svg>
      <span
        data-o-ring-value=""
        aria-hidden="true"
        className="o-tabular-nums o-font-semibold"
        style={{ fontSize: `${String(Math.max(12, size / 4.5))}px` }}
      >
        {clamped}
        <span className="o-text-xs o-opacity-70">%</span>
      </span>
    </div>
  )
}
