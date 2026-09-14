/**
 * Rubans : des bandes sinusoidales etagees, qui ondulent en se croisant.
 *
 * ## Le principe
 *
 * Chaque ruban est une sinusoide a sa propre phase ; sa lumiere est une exponentielle de la distance verticale a son axe.
 *
 * Les rubans se somment : leurs croisements s eclaircissent d eux-memes, sans aucun test.
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

import { RIBBONS_FRAGMENT } from './ribbons.shader.js'

/** Ce que l'echappatoire recoit. */
export interface RibbonsControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface RibbonsOwnProps {
  /** Vitesse de l'ondulation. @defaultValue 0.4 */
  speed?: number
  /** Nombre de rubans. @defaultValue 5 */
  count?: number
  /** Hauteur de l'ondulation, en fraction du cadre. @defaultValue 0.08 */
  amplitude?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<RibbonsControls>
}

/** Toutes les proprietes. */
export type RibbonsProps = Customisable<RibbonsOwnProps>

/** Tokens employes par defaut : le fond, puis les deux teintes des rubans. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-400',
  '--o-palette-sky-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-zinc-50 dark:o-to-sky-950'

/**
 * Rubans.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Ribbons className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Ribbons({
  speed = 0.4,
  count = 5,
  amplitude = 0.08,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: RibbonsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: RIBBONS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uCount: count, uAmplitude: amplitude },
    name: 'ribbons',
    // Chaque ruban ajoute trois sinus et deux exponentielles par fragment :
    // c'est le reglage qui pese, donc celui qui est borne.
    degrade: (quality) => ({
      uCount: quality === 'low' ? Math.min(count, 4) : count,
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
