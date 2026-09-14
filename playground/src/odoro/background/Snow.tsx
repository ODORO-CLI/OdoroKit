/**
 * Neige : trois couches de flocons qui tombent en parallaxe.
 *
 * ## Le principe
 *
 * Un flocon par cellule hachee, en halo exponentiel de la distance. La chute
 * est une translation verticale de la grille — les couches proches tombent
 * plus vite et plus gros — et chaque flocon se balance sur un sinus a phase
 * hachee : deux voisins ne derivent jamais a l'unisson.
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

import { SNOW_FRAGMENT } from './snow.shader.js'

/** Ce que l'echappatoire recoit. */
export interface SnowControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface SnowOwnProps {
  /** Vitesse de chute. @defaultValue 0.5 */
  speed?: number
  /** Nombre de cellules sur le plus petit cote. @defaultValue 12 */
  density?: number
  /** Amplitude du balancement lateral. @defaultValue 0.3 */
  drift?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<SnowControls>
}

/** Toutes les proprietes. */
export type SnowProps = Customisable<SnowOwnProps>

/** Tokens employes par defaut : la nuit d'hiver, les flocons lointains, les proches. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-sky-300', '--o-theme-fg'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-slate-950'

/**
 * Neige.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Snow className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Snow({
  speed = 0.5,
  density = 12,
  drift = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SnowProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SNOW_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uDrift: drift },
    name: 'snow',
    // Trois couches de neuf cellules chacune : une maille plus large fait
    // moins de halos qui se recouvrent, c'est le reglage qui pese, donc celui
    // qui est borne.
    degrade: (quality) => ({
      uDensity: quality === 'low' ? Math.min(density, 8) : density,
    }),
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
