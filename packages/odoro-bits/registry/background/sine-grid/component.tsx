/**
 * Grille sinusoidale : une grille dont chaque noeud oscille, et un moire leger.
 *
 * ## Le principe
 *
 * Les noeuds ne sont pas deplaces : le domaine est deforme en sinus avant que
 * la grille y soit lue, et chaque noeud decrit une petite boucle avec les
 * lignes qui le joignent. Une seconde grille, un peu plus fine et tournee de
 * quelques degres, se superpose en contre-phase : ses franges de moire se
 * deplacent bien plus lentement que les noeuds.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur — les recopier ici en ferait autant
 * de versions a maintenir qu'il y a de fonds.
 *
 * Le repli n'est pas une precaution : il est affiche pendant le chargement du
 * backend, quand WebGL manque, quand l'arbitre refuse la surface — il n'en
 * accorde qu'une par backend — et sous mouvement reduit.
 *
 * @module
 */

import {
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

import { SINE_GRID_FRAGMENT } from './sine-grid.shader.js'

/** Ce que l'echappatoire recoit. */
export interface SineGridControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface SineGridOwnProps {
  /** Nombre de cellules sur la hauteur. Borne a quarante par le shader. @defaultValue 12 */
  cells?: number
  /** Course de l'oscillation, en cellules. @defaultValue 0.18 */
  amplitude?: number
  /** Vitesse de l'oscillation. @defaultValue 0.8 */
  speed?: number
  /** Poids de la seconde grille, celle du moire. Zero l'eteint. @defaultValue 0.6 */
  moire?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<SineGridControls>
}

/** Toutes les proprietes. */
export type SineGridProps = Customisable<SineGridOwnProps>

/** Tokens employes par defaut : le fond, les lignes, les noeuds. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-brand-500',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Grille sinusoidale.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <SineGrid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function SineGrid({
  cells = 12,
  amplitude = 0.18,
  speed = 0.8,
  moire = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SineGridProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SINE_GRID_FRAGMENT,
    colors,
    uniforms: { uCells: cells, uAmplitude: amplitude, uSpeed: speed, uMoire: moire },
    name: 'sine-grid',
    // La seconde grille double les lectures et, a densite de pixels reduite,
    // ses franges scintillent : en qualite basse elle s'eteint.
    degrade: (quality) => ({ uMoire: quality === 'low' ? 0 : moire }),
  })

  useOnReady(onReady, ready ? { colours, refused } : null, ref.current)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={(element) => {
        setHost(element)
        ref.current = element
      }}
      className={className}
      style={style}
      aria-hidden
    >
      {ready && refused === undefined ? null : (
        <div className={`o-absolute o-inset-0 ${fallback}`} />
      )}
    </div>
  )
}
