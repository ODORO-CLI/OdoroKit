/**
 * Barre de chargement : une ligne fine en haut de son conteneur, pilotee par
 * une progression reelle ou balayee en attente.
 *
 * ## Deux modes, deux honnetetes
 *
 * Le mode determine recoit `progress` et le montre tel quel : la barre est un
 * `role="progressbar"` complet, valeur comprise, et sa largeur est une
 * echelle de transformation — jamais une largeur, qui forcerait une mise en
 * page a chaque avancee.
 *
 * Le mode `indeterminate` ne pretend rien mesurer : un segment balaye la
 * barre en boucle, et le `progressbar` est declare **sans** valeur — c'est
 * exactement ainsi que la specification decrit une progression inconnue.
 * Afficher un pourcentage invente serait le mensonge classique des barres de
 * chargement.
 *
 * ## Fixee a son conteneur, ou a l'ecran
 *
 * Par defaut la barre se pose en haut du premier ancetre positionne — un
 * panneau, une carte, un cadre d'apercu. `fixed` l'ancre a la fenetre, pour
 * la barre de navigation globale d'une application.
 *
 * Sous mouvement reduit, le balayage indetermine devient une barre pleine et
 * attenuee — presente, immobile — et la progression determinee saute sans
 * transition.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-top-loader'

/** Pose la barre et son balayage, une fois par document. */
function ensureTopLoaderRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-top-loader]{overflow:hidden;pointer-events:none}',
    '[data-o-top-bar]{',
    'height:100%;width:100%;transform-origin:left;',
    'background:linear-gradient(90deg,var(--o-tl-from),var(--o-tl-to));',
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '}',
    // Le balayage : un segment plus court traverse la barre en boucle.
    '[data-o-top-indeterminate] [data-o-top-bar]{',
    'width:40%;transition:none;',
    'animation:o-top-loader-sweep 1200ms ease-in-out infinite;',
    '}',
    '@keyframes o-top-loader-sweep{',
    'from{transform:translate3d(-100%,0,0)}',
    'to{transform:translate3d(350%,0,0)}',
    '}',
    // Une barre pleine et attenuee : l'attente reste dite, sans mouvement.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-top-bar]{transition:none}',
    '[data-o-top-indeterminate] [data-o-top-bar]{animation:none;width:100%;opacity:0.5;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface TopLoaderOwnProps {
  /** Progression, de 0 a 100. Ignoree en mode indetermine. @defaultValue 0 */
  progress?: number
  /** Balayage sans valeur, quand rien n'est mesurable. @defaultValue false */
  indeterminate?: boolean
  /** Epaisseur de la barre, en pixels. @defaultValue 3 */
  height?: number
  /** Ancrer a la fenetre plutot qu'au conteneur. @defaultValue false */
  fixed?: boolean
  /** Depart du degrade. @defaultValue la teinte de marque */
  from?: string
  /** Arrivee du degrade. @defaultValue un bleu ciel */
  to?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type TopLoaderProps = Customisable<TopLoaderOwnProps>

/**
 * Barre de chargement en haut de son conteneur.
 *
 * @example
 * // Progression reelle, dans un conteneur positionne.
 * <div className="o-relative">
 *   <TopLoader progress={sent / total * 100} />
 *   …
 * </div>
 *
 * @example
 * // Attente sans mesure, ancree a la fenetre.
 * <TopLoader indeterminate fixed />
 */
export function TopLoader({
  progress = 0,
  indeterminate = false,
  height = 3,
  fixed = false,
  from = 'var(--o-palette-brand-500)',
  to = 'var(--o-palette-sky-400)',
  label = 'Chargement',
  ...rest
}: TopLoaderProps): ReactElement {
  ensureTopLoaderRule()

  const value = Math.min(100, Math.max(0, progress))

  const { className, style } = mergePresentation(
    {
      className: fixed
        ? 'o-fixed o-top-0 o-left-0 o-right-0 o-z-50'
        : 'o-absolute o-top-0 o-left-0 o-right-0',
    },
    rest,
  )

  const hostStyle = {
    ...style,
    height: `${String(height)}px`,
    '--o-tl-from': from,
    '--o-tl-to': to,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-top-loader=""
      data-o-top-indeterminate={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // Un progressbar sans aria-valuenow est indetermine : c'est la maniere
      // normative de dire « j'avance, mais je ne sais pas de combien ».
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(value)}
    >
      <div
        aria-hidden
        data-o-top-bar=""
        style={indeterminate ? undefined : { transform: `scaleX(${String(value / 100)})` }}
      />
    </div>
  )
}
