/**
 * Tramage : un degrade anime rendu en tramage ordonne.
 *
 * ## Pourquoi trois teintes, et pas un degrade
 *
 * Le tramage n'a d'interet que si les teintes sont peu nombreuses : c'est
 * la densite des points qui fait le degrade, pas leur couleur. Avec trois
 * teintes, le fond garde son grain et ses aplats ; au-dela, il redeviendrait
 * un degrade ordinaire, un peu bruite.
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

import { DITHER_FRAGMENT } from './dither.shader.js'

/** Ce que l'echappatoire recoit. */
export interface DitherControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface DitherOwnProps {
  /** Vitesse du degrade. @defaultValue 0.3 */
  speed?: number
  /** Cote d'un pixel de trame, en pixels physiques. @defaultValue 4 */
  pixel?: number
  /** Echelle du degrade. @defaultValue 2.2 */
  scale?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<DitherControls>
}

/** Toutes les proprietes. */
export type DitherProps = Customisable<DitherOwnProps>

/** Tokens employes par defaut : les trois teintes, du fond a la plus claire. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-indigo-500',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-brand-100 dark:o-via-brand-950 o-to-indigo-100 dark:o-to-indigo-950'

/**
 * Tramage.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Dither className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Dither({
  speed = 0.3,
  pixel = 4,
  scale = 2.2,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DitherProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: DITHER_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uPixel: pixel, uScale: scale },
    name: 'dither',
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
