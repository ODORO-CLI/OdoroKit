/**
 * Barre de progression : une barre dans le flux, avec son etiquette et sa
 * valeur, remplie par une progression reelle ou parcourue d'un segment qui
 * respire quand rien n'est mesurable.
 *
 * ## Une barre dans la page, pas un filet sur le bord
 *
 * `top-loader` est un filet colle au bord de son conteneur, sans piste
 * visible ni texte : il dit « la page travaille ». Cette barre-ci prend sa
 * place dans le flux, montre sa piste, et nomme ce qu'elle mesure — un
 * envoi, une installation — avec sa valeur en chiffres. Elle dit « voici
 * ou en est cette tache ».
 *
 * ## Deux modes, deux honnetetes
 *
 * Le mode determine recoit `value` et le montre tel quel : la barre est un
 * `role="progressbar"` complet, valeur comprise, et le remplissage est une
 * echelle de transformation — jamais une largeur, qui forcerait une mise en
 * page a chaque avancee.
 *
 * Le mode `indeterminate` ne pretend rien mesurer : un segment traverse la
 * piste en s'etirant au milieu et en se resserrant aux bords, en boucle, et
 * le `progressbar` est declare **sans** valeur — c'est ainsi que la
 * specification decrit une progression inconnue. La valeur affichee devient
 * trois points : un pourcentage invente serait le mensonge classique des
 * barres de chargement.
 *
 * L'etiquette visible et le libelle annonce sont le meme texte : ce que
 * l'oeil lit et ce que le lecteur d'ecran entend ne doivent pas diverger.
 *
 * Sous mouvement reduit, la valeur saute sans transition et le segment
 * indetermine devient une piste pleine et attenuee — presente, immobile.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-progress-bar'

/** Pose la piste, le remplissage et le segment, une fois par document. */
function ensureProgressBarRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // En bloc : la barre prend la largeur de son parent, comme un champ.
    '[data-o-progress-bar]{',
    'display:flex;flex-direction:column;gap:0.45em;',
    'font-size:0.875rem;line-height:1.2;',
    '}',
    '[data-o-pbar-head]{display:flex;justify-content:space-between;gap:1em}',
    '[data-o-pbar-value]{font-variant-numeric:tabular-nums;opacity:0.6}',
    '[data-o-pbar-track]{',
    'position:relative;display:block;overflow:hidden;',
    'height:var(--o-pbar-height);border-radius:var(--o-pbar-height);',
    'background:color-mix(in oklab,var(--o-pbar-color) 15%,transparent);',
    '}',
    '[data-o-pbar-fill]{',
    'position:absolute;inset:0;border-radius:inherit;',
    'background:var(--o-pbar-color);transform-origin:left;',
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '}',
    // Le segment respire : etroit aux bords, large au milieu de la piste,
    // et il repart de la gauche a chaque aller.
    '[data-o-pbar-indeterminate] [data-o-pbar-fill]{',
    'width:35%;transition:none;',
    'animation:o-progress-bar-run var(--o-pbar-speed) cubic-bezier(0.4,0,0.2,1) infinite;',
    '}',
    '@keyframes o-progress-bar-run{',
    '0%{transform:translateX(-100%) scaleX(0.5)}',
    '50%{transform:translateX(110%) scaleX(1.4)}',
    '100%{transform:translateX(300%) scaleX(0.5)}',
    '}',
    // Une piste pleine et attenuee : l'attente reste dite, sans mouvement.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pbar-fill]{transition:none}',
    '[data-o-pbar-indeterminate] [data-o-pbar-fill]{animation:none;width:100%;opacity:0.5;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface ProgressBarOwnProps {
  /** Progression, de 0 a 100. Ignoree en mode indetermine. @defaultValue 42 */
  value?: number
  /** Segment sans valeur, quand rien n'est mesurable. @defaultValue false */
  indeterminate?: boolean
  /** Afficher l'etiquette et la valeur au-dessus de la piste. @defaultValue true */
  showLabel?: boolean
  /** Epaisseur de la piste, en pixels. @defaultValue 6 */
  height?: number
  /** Duree d'un aller du segment indetermine, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Couleur du remplissage. @defaultValue la couleur du texte */
  color?: string
  /** Etiquette affichee et annoncee aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type ProgressBarProps = Customisable<ProgressBarOwnProps, 'span'>

/**
 * Barre de progression dans le flux, determinee ou indeterminee.
 *
 * @example
 * // Progression reelle, etiquetee.
 * <ProgressBar label="Envoi" value={sent / total * 100} />
 *
 * @example
 * // Attente sans mesure, sans etiquette, dans la teinte de marque.
 * <ProgressBar indeterminate showLabel={false} color="var(--o-palette-brand-500)" />
 */
export function ProgressBar({
  value = 42,
  indeterminate = false,
  showLabel = true,
  height = 6,
  speed = 1600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: ProgressBarProps): ReactElement {
  ensureProgressBarRule()

  const clamped = Math.min(100, Math.max(0, value))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-pbar-height': `${String(height)}px`,
    '--o-pbar-speed': `${String(speed)}ms`,
    '--o-pbar-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={hostStyle}
      data-o-progress-bar=""
      data-o-pbar-indeterminate={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // Un progressbar sans aria-valuenow est indetermine : c'est la maniere
      // normative de dire « j'avance, mais je ne sais pas de combien ».
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
    >
      {showLabel ? (
        // Le texte visible double le libelle du role : il est retire de
        // l'arbre pour ne pas etre annonce deux fois.
        <span aria-hidden data-o-pbar-head="">
          <span>{label}</span>
          <span data-o-pbar-value="">
            {indeterminate ? '...' : `${String(Math.round(clamped))}\u00a0%`}
          </span>
        </span>
      ) : null}
      <span aria-hidden data-o-pbar-track="">
        <span
          data-o-pbar-fill=""
          style={indeterminate ? undefined : { transform: `scaleX(${String(clamped / 100)})` }}
        />
      </span>
    </span>
  )
}
