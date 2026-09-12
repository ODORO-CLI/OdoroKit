/**
 * Blocs qui sautent : une image dont des blocs se decalent par a-coups,
 * teintes inversees ou ecartees.
 *
 * ## Le principe
 *
 * Tout est hache par paliers de temps : entre deux paliers, rien ne bouge.
 * A chaque palier, un tirage par bloc decide s'il saute ; un bloc qui saute
 * lit l'image ailleurs et l'ecrit a l'envers. Des bandes entieres sautent
 * plus rarement, d'un seul tenant.
 *
 * Ce qui distingue cette entree de `tv-static` : il y a une image, et elle
 * se casse ; et de `vhs-tracking` : ici les sauts sont des rectangles nets,
 * pas des bandes qui roulent.
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

import { GLITCH_BLOCKS_FRAGMENT } from './glitch-blocks.shader.js'

/** Ce que l'echappatoire recoit. */
export interface GlitchBlocksControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface GlitchBlocksOwnProps {
  /** Nombre de rangees de blocs sur la hauteur. Borne a quarante par le shader. @defaultValue 12 */
  blocks?: number
  /** Paliers par seconde. @defaultValue 6 */
  rate?: number
  /** Part des blocs qui sautent a chaque palier. Zero fige l'image. @defaultValue 0.5 */
  amount?: number
  /** Vitesse du degrade de fond. @defaultValue 0.3 */
  speed?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<GlitchBlocksControls>
}

/** Toutes les proprietes. */
export type GlitchBlocksProps = Customisable<GlitchBlocksOwnProps>

/** Tokens employes par defaut : le fond, les deux teintes du degrade. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-cyan-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-violet-100 dark:o-via-violet-950 o-to-cyan-100 dark:o-to-cyan-950'

/**
 * Blocs qui sautent.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GlitchBlocks className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GlitchBlocks({
  blocks = 12,
  rate = 6,
  amount = 0.5,
  speed = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GlitchBlocksProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GLITCH_BLOCKS_FRAGMENT,
    colors,
    uniforms: { uBlocks: blocks, uRate: rate, uAmount: amount, uSpeed: speed },
    name: 'glitch-blocks',
    // Le fragment coute autant a chaque image ; ce qui pese, c'est le
    // rythme des images reellement differentes, donc il est borne.
    degrade: (quality) => ({
      uRate: quality === 'low' ? Math.min(rate, 3) : rate,
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
