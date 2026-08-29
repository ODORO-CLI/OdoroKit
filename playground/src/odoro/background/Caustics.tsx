/**
 * Caustiques : le reseau de lumiere au fond d un bassin, imite par replis successifs.
 *
 * ## Le principe
 *
 * Cinq replis de l espace par le sinus de ses propres coordonnees. La distance accumulee dessine des filaments la ou les rayons se concentreraient.
 *
 * L exposant applique a la fin est ce qui separe un filament net d un halo de brouillard.
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
  CAUSTICS_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from 'odoro-engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface CausticsControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface CausticsOwnProps {
  /** Vitesse du reseau. @defaultValue 0.5 */
  speed?: number
  /** Echelle du reseau. @defaultValue 4 */
  scale?: number
  /** Force de la lumiere. @defaultValue 1 */
  intensity?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<CausticsControls>
}

/** Toutes les proprietes. */
export type CausticsProps = Customisable<CausticsOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-sky-950', '--o-palette-sky-200'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-b o-from-sky-950 o-to-sky-800'

/**
 * Caustiques.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Caustics className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Caustics({
  speed = 0.5,
  scale = 4,
  intensity = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CausticsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CAUSTICS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uIntensity: intensity },
    name: 'caustics',
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
