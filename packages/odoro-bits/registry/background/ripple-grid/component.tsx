/**
 * Grille ondulante : un quadrillage souleve par une onde radiale.
 *
 * ## Le principe
 *
 * Le deplacement est radial : chaque point s ecarte du centre le long de sa propre direction, ce qui evite le cisaillement.
 *
 * A amplitude nulle, `background/grid-lines` fait le meme travail sans contexte graphique et pour treize kilo-octets de moins.
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
  RIPPLE_GRID_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro/engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface RippleGridControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface RippleGridOwnProps {
  /** Vitesse de l onde. @defaultValue 0.4 */
  speed?: number
  /** Nombre de mailles. @defaultValue 14 */
  density?: number
  /** Amplitude du soulevement. @defaultValue 0.06 */
  amplitude?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<RippleGridControls>
}

/** Toutes les proprietes. */
export type RippleGridProps = Customisable<RippleGridOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-zinc-950', '--o-palette-sky-400'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-950'

/**
 * Grille ondulante.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <RippleGrid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function RippleGrid({
  speed = 0.4,
  density = 14,
  amplitude = 0.06,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: RippleGridProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: RIPPLE_GRID_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uAmplitude: amplitude },
    name: 'ripple-grid',
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
