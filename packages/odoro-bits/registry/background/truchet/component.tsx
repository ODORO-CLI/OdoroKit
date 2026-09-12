/**
 * Truchet : des tuiles a deux arcs qui pivotent en cascade.
 *
 * ## Pourquoi un quart de tour, et pas un demi
 *
 * Un demi-tour ramene une tuile de Truchet sur elle-meme : rien ne
 * changerait. Le quart de tour est la plus petite rotation qui recompose le
 * pavage, et l'animer suffit a montrer d'ou vient le nouveau dessin.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur.
 *
 * Le repli n'est pas une precaution : il est affiche pendant le chargement du
 * backend, quand WebGL manque, quand l'arbitre refuse la surface et sous
 * mouvement reduit.
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

import { TRUCHET_FRAGMENT } from './truchet.shader.js'

/** Ce que l'echappatoire recoit. */
export interface TruchetControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface TruchetOwnProps {
  /** Cadence des pivots, en periodes par seconde. @defaultValue 0.35 */
  speed?: number
  /** Nombre de tuiles sur la hauteur. @defaultValue 8 */
  density?: number
  /** Epaisseur des arcs, en fraction de la tuile. @defaultValue 0.09 */
  thickness?: number
  /** Retard diagonal entre deux tuiles voisines, en periodes. @defaultValue 0.12 */
  stagger?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<TruchetControls>
}

/** Toutes les proprietes. */
export type TruchetProps = Customisable<TruchetOwnProps>

/** Tokens employes par defaut : le fond, le premier arc, le second arc. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-teal-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Truchet.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Truchet className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Truchet({
  speed = 0.35,
  density = 8,
  thickness = 0.09,
  stagger = 0.12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: TruchetProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: TRUCHET_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uDensity: density,
      uThickness: thickness,
      uStagger: stagger,
    },
    name: 'truchet',
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
