/**
 * Vortex torsade : un couloir dont les aretes s'enroulent en helice, qui
 * pivote, et dont la teinte tourne autour de la paroi.
 *
 * ## Le principe
 *
 * La profondeur vaut l'inverse du rayon, comme dans le tunnel ; mais l'angle
 * est tordu avec la profondeur, le tout pivote avec le temps et le point de
 * fuite se promene. Les parois portent six aretes en helice, des bandes qui
 * avancent, et une teinte qui glisse d'une couleur a l'autre.
 *
 * Ce qui distingue cette entree de `tunnel` : la torsion, la rotation, le
 * point de fuite mobile, et deux teintes au lieu d'une. Le tunnel est un
 * couloir droit et monochrome ; ceci est un vortex.
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

import { WORMHOLE_FRAGMENT } from './wormhole.shader.js'

/** Ce que l'echappatoire recoit. */
export interface WormholeControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface WormholeOwnProps {
  /** Vitesse d'avancee. @defaultValue 0.5 */
  speed?: number
  /** Torsion des aretes avec la profondeur. @defaultValue 1 */
  twist?: number
  /** Vitesse de rotation de l'ensemble. @defaultValue 0.3 */
  spin?: number
  /** Densite des bandes de profondeur. @defaultValue 8 */
  rings?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<WormholeControls>
}

/** Toutes les proprietes. */
export type WormholeProps = Customisable<WormholeOwnProps>

/** Tokens employes par defaut : le fond, les deux teintes des parois. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-cyan-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-fuchsia-100 dark:o-to-fuchsia-950'

/**
 * Vortex torsade.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Wormhole className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Wormhole({
  speed = 0.5,
  twist = 1,
  spin = 0.3,
  rings = 8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: WormholeProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: WORMHOLE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uTwist: twist, uSpin: spin, uRings: rings },
    name: 'wormhole',
    // Des bandes serrees au loin battent avec la grille de pixels a densite
    // reduite : en qualite basse, elles s'espacent.
    degrade: (quality) => ({
      uRings: quality === 'low' ? Math.min(rings, 5) : rings,
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
