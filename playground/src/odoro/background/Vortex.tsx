/**
 * Vortex : une spirale obtenue en ajoutant a l angle une quantite qui decroit avec le rayon.
 *
 * ## Le principe
 *
 * En polaires, un tourbillon n est pas un mouvement mais une addition. Le motif enroule est volontairement trivial : la richesse vient de la torsion.
 *
 * La torsion est bornee au centre ; sans cela le pixel central clignoterait a chaque image.
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
  VORTEX_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro/engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface VortexControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface VortexOwnProps {
  /** Vitesse de rotation. @defaultValue 0.25 */
  speed?: number
  /** Nombre de bras. @defaultValue 6 */
  arms?: number
  /** Force de l enroulement. @defaultValue 2.5 */
  twist?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<VortexControls>
}

/** Toutes les proprietes. */
export type VortexProps = Customisable<VortexOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-brand-600',
  '--o-palette-amber-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-br o-from-zinc-950 o-to-brand-900'

/**
 * Vortex.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Vortex className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Vortex({
  speed = 0.25,
  arms = 6,
  twist = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: VortexProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: VORTEX_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: arms, uTwist: twist },
    name: 'vortex',
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
