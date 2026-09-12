/**
 * Bloc qui pulse : une surface en attente dont le ton respire, sans bande
 * et sans jamais devenir transparente.
 *
 * ## Le ton respire, pas l'opacite
 *
 * La facon courante de faire pulser un squelette est de faire varier son
 * opacite. Elle a un defaut qu'on ne voit qu'une fois le composant pose :
 * au creux de la pulsation, le bloc laisse passer ce qu'il y a derriere —
 * une image de fond, une autre carte, un degrade. Le substitut se met alors
 * a montrer autre chose que lui-meme, et l'attente devient un clignotement.
 *
 * Ici c'est la **teinte** qui varie : le bloc reste opaque du debut a la
 * fin, et seul son melange de filet et de surface se rapproche de la
 * surface. `depth` dit de combien. Le cout est un repeint par image sur un
 * seul element — pas de mise en page recalculee, pas de couche
 * supplementaire a composer.
 *
 * ## Ce qu'il dit, et ce que le reflet dit
 *
 * `shimmer-block` traverse la meme surface d'une bande : il donne un sens
 * de lecture, quelque chose arrive de la gauche. La pulsation n'en donne
 * aucun ; elle dit « pas encore », et rien d'autre. C'est le bon choix
 * quand plusieurs blocs attendent ensemble sans ordre entre eux, ou quand
 * une bande de plus, a cote d'un vrai chargement, ferait deux mouvements
 * concurrents.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle ; le bloc est retire de
 * l'arbre d'accessibilite. Sous mouvement reduit, il se fige a sa valeur
 * pleine : la surface reste visible, elle ne s'efface pas.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-pulse-block'

/** Part de filet dans le ton plein du bloc, en pourcentage. */
const FULL_MIX = 72

/** Pose le bloc et sa respiration, une fois par document. */
function ensurePulseBlockRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pbk]{display:block;width:100%}',
    '[data-o-pbk-face]{',
    'display:block;width:100%;height:var(--o-pbk-height);',
    'border-radius:var(--o-pbk-radius);',
    'background-color:color-mix(in oklab,var(--o-theme-line) var(--o-pbk-full),var(--o-theme-surface));',
    'animation:o-pbk-breathe var(--o-pbk-speed) ease-in-out infinite;',
    '}',
    // Le creux se rapproche de la surface sans jamais la traverser : le
    // bloc reste opaque, et ne montre jamais ce qu'il y a derriere.
    '@keyframes o-pbk-breathe{',
    '0%,100%{background-color:color-mix(in oklab,var(--o-theme-line) var(--o-pbk-full),var(--o-theme-surface))}',
    '50%{background-color:color-mix(in oklab,var(--o-theme-line) var(--o-pbk-low),var(--o-theme-surface))}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pbk-face]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface PulseBlockOwnProps {
  /** Hauteur du bloc, en pixels. @defaultValue 96 */
  height?: number
  /** Rayon des angles, en pixels. @defaultValue 12 */
  radius?: number
  /** Amplitude de la respiration, de 0 (immobile) a 1 (jusqu'a la surface). @defaultValue 0.55 */
  depth?: number
  /** Duree d'un cycle, en millisecondes. @defaultValue 1400 */
  speed?: number
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type PulseBlockProps = Customisable<PulseBlockOwnProps, 'div'>

/**
 * Reserve une surface et la fait respirer.
 *
 * @example
 * <PulseBlock height={140} />
 *
 * @example
 * // Une respiration a peine perceptible, lente.
 * <PulseBlock height={48} depth={0.25} speed={2400} />
 */
export function PulseBlock({
  height = 96,
  radius = 12,
  depth = 0.55,
  speed = 1400,
  label = 'Chargement',
  ...rest
}: PulseBlockProps): ReactElement {
  ensurePulseBlockRule()

  const amount = Math.min(1, Math.max(0, depth))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-pbk-height': `${String(height)}px`,
    '--o-pbk-radius': `${String(radius)}px`,
    '--o-pbk-full': `${String(FULL_MIX)}%`,
    // Le creux est calcule ici plutot qu'en CSS : `color-mix` accepte une
    // variable pour son pourcentage, mais pas une expression de plus.
    '--o-pbk-low': `${String(Math.round(FULL_MIX * (1 - amount)))}%`,
    '--o-pbk-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <div {...rest} className={className} style={hostStyle} data-o-pbk="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-pbk-face="" />
    </div>
  )
}
