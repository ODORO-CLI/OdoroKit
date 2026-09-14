/**
 * Etapes de progression : des etapes numerotees reliees par une barre. La
 * progression remplit la barre et coche les etapes franchies ; sans mesure,
 * un reflet parcourt la barre.
 *
 * ## Une valeur continue, des etapes discretes
 *
 * La barre recoit `value` en continu et la montre par une echelle de
 * transformation, jamais une largeur. Les etapes, elles, sont reparties a
 * egale distance sur la barre, et chacune se coche quand la valeur a depasse
 * sa position : la premiere etape qui ne l'est pas encore est l'etape en
 * cours, et pulse. Le composant ne demande donc pas « a quelle etape en
 * est-on » — il le deduit de la meme valeur que la barre, et les deux ne
 * peuvent pas se contredire.
 *
 * ## Deux modes, deux honnetetes
 *
 * Le mode determine est un `role="progressbar"` complet, valeur comprise.
 * Le mode `indeterminate` ne pretend rien mesurer : aucune etape n'est
 * cochee, un reflet court le long de la barre, et le `progressbar` est
 * declare **sans** valeur — c'est ainsi que la specification decrit une
 * progression inconnue.
 *
 * ## Le fond des etapes
 *
 * Une etape a franchir est un cercle vide pose sur la barre : pour que la
 * barre ne le traverse pas, il a besoin d'un fond opaque, pris au theme.
 * Le numero d'une etape franchie s'ecrit dans ce meme fond, sur la couleur
 * pleine : c'est ce qui le garde lisible dans les deux themes.
 *
 * Sous mouvement reduit, la valeur saute sans transition, l'etape en cours
 * ne pulse pas, et le reflet indetermine devient une barre pleine et
 * attenuee.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-progress-steps'

/** Pose la barre, les etapes et leurs etats, une fois par document. */
function ensureProgressStepsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // En bloc : les etapes se repartissent sur la largeur du parent.
    '[data-o-progress-steps]{',
    'position:relative;display:flex;align-items:center;justify-content:space-between;',
    'font-size:calc(var(--o-psteps-size) * 0.42);font-weight:600;line-height:1;',
    'font-variant-numeric:tabular-nums;',
    '}',
    // La barre court de centre a centre des etapes extremes.
    '[data-o-psteps-rail]{',
    'position:absolute;top:50%;left:calc(var(--o-psteps-size) / 2);right:calc(var(--o-psteps-size) / 2);',
    'height:2px;margin-top:-1px;overflow:hidden;',
    'background:color-mix(in oklab,var(--o-psteps-color) 20%,transparent);',
    '}',
    '[data-o-psteps-fill]{',
    'position:absolute;inset:0;background:var(--o-psteps-color);transform-origin:left;',
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-psteps-indeterminate] [data-o-psteps-fill]{',
    'width:30%;transition:none;',
    'animation:o-progress-steps-run var(--o-psteps-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-progress-steps-run{',
    'from{transform:translateX(-100%)}',
    'to{transform:translateX(340%)}',
    '}',
    '[data-o-psteps-step]{',
    'position:relative;display:inline-flex;align-items:center;justify-content:center;',
    'box-sizing:border-box;width:var(--o-psteps-size);height:var(--o-psteps-size);',
    'border-radius:50%;border:2px solid color-mix(in oklab,var(--o-psteps-color) 30%,transparent);',
    'background:var(--o-theme-bg);color:var(--o-psteps-color);',
    'transition:background-color var(--o-duration-base) var(--o-ease-standard),',
    'border-color var(--o-duration-base) var(--o-ease-standard);',
    '}',
    // Le numero est un element a part : si le cercle lui-meme prenait la
    // couleur du fond, un `currentColor` recu en couleur s'y resoudrait et
    // le cercle plein disparaitrait dans le fond.
    '[data-o-psteps-num]{transition:color var(--o-duration-base) var(--o-ease-standard)}',
    '[data-o-psteps-step="done"]{',
    'background:var(--o-psteps-color);border-color:var(--o-psteps-color);',
    '}',
    '[data-o-psteps-step="done"] [data-o-psteps-num]{color:var(--o-theme-bg)}',
    '[data-o-psteps-step="current"]{',
    'border-color:var(--o-psteps-color);',
    'animation:o-progress-steps-pulse var(--o-psteps-speed) ease-out infinite;',
    '}',
    // Un halo qui s'eloigne et s'eteint : l'etape en cours respire.
    '@keyframes o-progress-steps-pulse{',
    '0%{box-shadow:0 0 0 0 color-mix(in oklab,var(--o-psteps-color) 45%,transparent)}',
    '100%{box-shadow:0 0 0 calc(var(--o-psteps-size) * 0.4) transparent}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-psteps-fill],[data-o-psteps-step],[data-o-psteps-num]{transition:none}',
    '[data-o-psteps-step="current"]{animation:none}',
    '[data-o-psteps-indeterminate] [data-o-psteps-fill]{animation:none;width:100%;opacity:0.5;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Etat d'une etape, deduit de la valeur. */
type StepState = 'done' | 'current' | 'todo'

/** Proprietes propres au composant. */
export interface ProgressStepsOwnProps {
  /** Progression, de 0 a 100. Ignoree en mode indetermine. @defaultValue 40 */
  value?: number
  /** Reflet sans valeur, quand rien n'est mesurable. @defaultValue false */
  indeterminate?: boolean
  /** Nombre d'etapes, reparties a egale distance. @defaultValue 4 */
  steps?: number
  /** Diametre d'une etape, en pixels. @defaultValue 28 */
  size?: number
  /** Periode de la pulsation et du reflet, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Couleur des etapes franchies et de la barre. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type ProgressStepsProps = Customisable<ProgressStepsOwnProps, 'span'>

/**
 * Etapes numerotees sur une barre de progression.
 *
 * @example
 * // Trois etapes, la deuxieme en cours.
 * <ProgressSteps steps={3} value={50} />
 *
 * @example
 * // Attente sans mesure, dans la teinte de marque.
 * <ProgressSteps indeterminate color="var(--o-palette-brand-500)" />
 */
export function ProgressSteps({
  value = 40,
  indeterminate = false,
  steps = 4,
  size = 28,
  speed = 1600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: ProgressStepsProps): ReactElement {
  ensureProgressStepsRule()

  const clamped = Math.min(100, Math.max(0, value))
  const count = Math.max(2, Math.round(steps))

  // Une etape est franchie quand la valeur a depasse sa position ; la
  // premiere qui ne l'est pas est en cours. A cent, tout est franchi.
  let currentFound = false
  const states: StepState[] = Array.from({ length: count }, (_, index) => {
    if (indeterminate) return 'todo'
    const position = (index / (count - 1)) * 100
    if (clamped >= 100 || position < clamped) return 'done'
    if (!currentFound) {
      currentFound = true
      return 'current'
    }
    return 'todo'
  })

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-psteps-size': `${String(size)}px`,
    '--o-psteps-speed': `${String(speed)}ms`,
    '--o-psteps-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={hostStyle}
      data-o-progress-steps=""
      data-o-psteps-indeterminate={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // Un progressbar sans aria-valuenow est indetermine : c'est la maniere
      // normative de dire « j'avance, mais je ne sais pas de combien ».
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
    >
      <span aria-hidden data-o-psteps-rail="">
        <span
          data-o-psteps-fill=""
          style={
            indeterminate ? undefined : { transform: `scaleX(${String(clamped / 100)})` }
          }
        />
      </span>
      {states.map((state, index) => (
        <span key={index} aria-hidden data-o-psteps-step={state}>
          <span data-o-psteps-num="">{index + 1}</span>
        </span>
      ))}
    </span>
  )
}
