/**
 * Spectre : un balayage angulaire de teintes, qui module la palette sans la remplacer.
 *
 * ## Le principe
 *
 * Trois cosinus decales d un tiers de tour : ils ne se rejoignent jamais tous au meme endroit, donc le tour ne traverse pas de gris.
 *
 * La teinte calculee teinte les couleurs recues plutot que de s y substituer : le fond reste dans les tons du theme.
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
  SPECTRUM_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from 'odoro-engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface SpectrumControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface SpectrumOwnProps {
  /** Vitesse du balayage. @defaultValue 0.08 */
  speed?: number
  /** Nombre de tours de roue. @defaultValue 1 */
  turns?: number
  /** Part de teinte melangee a la palette. @defaultValue 0.5 */
  saturation?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<SpectrumControls>
}

/** Toutes les proprietes. */
export type SpectrumProps = Customisable<SpectrumOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-zinc-950', '--o-palette-brand-400'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-br o-from-zinc-950 o-to-brand-950'

/**
 * Spectre.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Spectrum className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Spectrum({
  speed = 0.08,
  turns = 1,
  saturation = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SpectrumProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SPECTRUM_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: turns, uSaturation: saturation },
    name: 'spectrum',
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
