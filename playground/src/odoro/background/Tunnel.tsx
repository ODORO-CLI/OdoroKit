/**
 * Tunnel : une perspective obtenue en posant z = 1/r, sans camera ni matrice.
 *
 * ## Le principe
 *
 * Dans un couloir cylindrique, la distance le long de l axe est inversement proportionnelle au rayon apparent. La division suffit.
 *
 * L attenuation au loin n est pas decorative : elle eteint le point de fuite avant qu il ne batte avec la grille de pixels.
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
  TUNNEL_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro/engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface TunnelControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface TunnelOwnProps {
  /** Vitesse d avancee. @defaultValue 0.25 */
  speed?: number
  /** Espacement des anneaux. @defaultValue 0.6 */
  rings?: number
  /** Nombre de secteurs. @defaultValue 12 */
  segments?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<TunnelControls>
}

/** Toutes les proprietes. */
export type TunnelProps = Customisable<TunnelOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-zinc-950', '--o-palette-sky-400'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-950'

/**
 * Tunnel.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Tunnel className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Tunnel({
  speed = 0.25,
  rings = 0.6,
  segments = 12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: TunnelProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: TUNNEL_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: rings, uSegments: segments },
    name: 'tunnel',
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
