/**
 * Jauge : un arc de trois quarts de tour, gradue, qui se remplit jusqu'a la
 * valeur.
 *
 * ## Un cadran, pas un anneau
 *
 * L'arc est ouvert en bas, comme un compteur de vitesse : l'ouverture donne
 * un debut et une fin a la course, et les cinq graduations la rendent
 * lisible sans le chiffre — on voit d'un coup d'oeil si la jauge est au
 * quart ou aux trois quarts. Le chiffre, dessous, confirme.
 *
 * L'arc de remplissage est le meme cercle que la piste, dont le tirete est
 * decale : la longueur visible est proportionnelle a la valeur, et changer
 * de valeur ne fait que deplacer le decalage. C'est une propriete que le
 * navigateur sait faire glisser sans recalculer la mise en page.
 *
 * ## Deux modes, deux honnetetes
 *
 * Le mode determine recoit `value` et le montre tel quel : la jauge est un
 * `role="progressbar"` complet, valeur comprise. Le mode `indeterminate` ne
 * pretend rien mesurer : un court segment balaye l'arc d'un bout a l'autre,
 * le chiffre disparait, et le `progressbar` est declare **sans** valeur —
 * c'est ainsi que la specification decrit une progression inconnue.
 *
 * Sous mouvement reduit, la valeur saute sans transition, et le balayage
 * indetermine s'arrete a mi-course : la jauge se lit encore, seul le
 * mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-gauge'

/** Part du tour couverte par l'arc. */
const SWEEP = 0.75

/** Angle, en degres depuis trois heures, ou l'arc commence. */
const START = 135

/** Pose la jauge, sa transition et son balayage, une fois par document. */
function ensureGaugeRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-gauge]{position:relative;display:inline-block;line-height:0}',
    '[data-o-gauge] svg{display:block}',
    '[data-o-gauge-fill]{',
    'transition:stroke-dashoffset var(--o-duration-base) var(--o-ease-standard);',
    '}',
    // Le balayage : un segment court fait l'aller-retour sur l'arc.
    '[data-o-gauge-indeterminate] [data-o-gauge-fill]{',
    'transition:none;',
    'animation:o-gauge-sweep var(--o-gauge-speed) ease-in-out infinite alternate;',
    '}',
    '@keyframes o-gauge-sweep{',
    'from{stroke-dashoffset:0}',
    'to{stroke-dashoffset:var(--o-gauge-far)}',
    '}',
    '[data-o-gauge-value]{',
    'position:absolute;left:0;right:0;top:50%;',
    'transform:translateY(-30%);',
    'text-align:center;line-height:1;font-weight:600;',
    'font-variant-numeric:tabular-nums;',
    'font-size:var(--o-gauge-font);',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-gauge-fill]{transition:none}',
    '[data-o-gauge-indeterminate] [data-o-gauge-fill]{animation:none;stroke-dashoffset:var(--o-gauge-rest)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface GaugeOwnProps {
  /** Valeur, de 0 a 100. Ignoree en mode indetermine. @defaultValue 64 */
  value?: number
  /** Balayage sans valeur, quand rien n'est mesurable. @defaultValue false */
  indeterminate?: boolean
  /** Largeur de la jauge, en pixels. @defaultValue 96 */
  size?: number
  /** Epaisseur de l'arc, en pixels. @defaultValue 8 */
  thickness?: number
  /** Duree d'un aller du balayage indetermine, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Couleur du remplissage. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type GaugeProps = Customisable<GaugeOwnProps, 'span'>

/**
 * Jauge en arc, determinee ou balayee.
 *
 * @example
 * // Progression reelle.
 * <Gauge value={sent / total * 100} />
 *
 * @example
 * // Attente sans mesure, dans la teinte de marque.
 * <Gauge indeterminate color="var(--o-palette-brand-500)" />
 */
export function Gauge({
  value = 64,
  indeterminate = false,
  size = 96,
  thickness = 8,
  speed = 1600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: GaugeProps): ReactElement {
  ensureGaugeRule()

  const clamped = Math.min(100, Math.max(0, value))

  // Le dessin vit dans une vue de 100 unites. Les graduations debordent de
  // l'arc : le rayon leur laisse la place.
  const stroke = Math.min((thickness / size) * 100, 20)
  const radius = 50 - stroke / 2 - 7
  const circumference = 2 * Math.PI * radius
  const arc = circumference * SWEEP

  // En mode indetermine le segment fait un cinquieme de l'arc ; sa course
  // va du debut de l'arc a sa fin, moins sa propre longueur.
  const sweep = arc * 0.2
  const far = -(arc - sweep)

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-gauge-speed': `${String(speed)}ms`,
    '--o-gauge-far': String(far),
    '--o-gauge-rest': String(far / 2),
    '--o-gauge-font': `${String(Math.round(size * 0.24))}px`,
  } as CSSProperties

  const tickOuter = 50 - (radius + stroke / 2 + 2)
  const tickInner = tickOuter - 4

  return (
    <span
      {...rest}
      className={className}
      style={hostStyle}
      data-o-gauge=""
      data-o-gauge-indeterminate={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // Un progressbar sans aria-valuenow est indetermine : c'est la maniere
      // normative de dire « j'avance, mais je ne sais pas de combien ».
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
    >
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        {[0, 1, 2, 3, 4].map((tick) => (
          <line
            key={tick}
            x1="50"
            y1={tickOuter}
            x2="50"
            y2={tickInner}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.4}
            // Une graduation posee en haut, puis tournee jusqu'a sa place
            // sur l'arc : le quart de tour ramene le haut a trois heures.
            transform={`rotate(${String(START + 90 + (tick * (SWEEP * 360)) / 4)} 50 50)`}
          />
        ))}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${String(arc)} ${String(circumference)}`}
          opacity={0.15}
          transform={`rotate(${String(START)} 50 50)`}
        />
        <circle
          data-o-gauge-fill=""
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
              ? `${String(sweep)} ${String(circumference)}`
              : `${String(arc)} ${String(circumference)}`
          }
          strokeDashoffset={indeterminate ? undefined : arc * (1 - clamped / 100)}
          transform={`rotate(${String(START)} 50 50)`}
        />
      </svg>
      {indeterminate ? null : (
        <span aria-hidden data-o-gauge-value="">
          {Math.round(clamped)}
        </span>
      )}
    </span>
  )
}
