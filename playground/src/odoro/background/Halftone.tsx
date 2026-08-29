/**
 * Trame : un demi-ton dont les points grossissent avec la lumiere, comme en impression.
 *
 * ## Le principe
 *
 * La trame est bicolore : c est le taux de couverture, donc la taille des points, qui simule la nuance.
 *
 * La grille est tournee pour la meme raison qu en impression : alignee sur les axes, elle bat avec la grille de pixels et produit un moire.
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
  HALFTONE_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro/engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface HalftoneControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface HalftoneOwnProps {
  /** Vitesse du champ. @defaultValue 0.12 */
  speed?: number
  /** Finesse de la trame. @defaultValue 26 */
  density?: number
  /** Rotation de la trame, en radians. @defaultValue 0.26 */
  angle?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<HalftoneControls>
}

/** Toutes les proprietes. */
export type HalftoneProps = Customisable<HalftoneOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-zinc-950', '--o-palette-amber-300'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-950'

/**
 * Trame.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Halftone className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Halftone({
  speed = 0.12,
  density = 26,
  angle = 0.26,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: HalftoneProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: HALFTONE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uAngle: angle },
    name: 'halftone',
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
