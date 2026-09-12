/**
 * Lignes flottantes : des segments courbes fins qui derivent et se croisent.
 *
 * ## Le principe
 *
 * Chaque ligne est un segment de longueur finie, pose dans son propre repere :
 * un centre qui derive en figure de Lissajous, une inclinaison qui oscille
 * autour d'une diagonale, des extremites qui s'eteignent. Aucun trace :
 * le fragment se projette sur l'axe et la normale de chaque segment.
 *
 * Ce qui distingue cette entree de ses cousines : les lignes sont diagonales
 * et de longueur finie, elles derivent librement au lieu d'onduler sur place,
 * et le rythme est tres lent — c'est le croisement de deux halos qui fait
 * l'evenement, pas le mouvement.
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

import { FLOATING_LINES_FRAGMENT } from './floating-lines.shader.js'

/** Ce que l'echappatoire recoit. */
export interface FloatingLinesControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface FloatingLinesOwnProps {
  /** Nombre de lignes. Borne a dix par le shader. @defaultValue 7 */
  count?: number
  /** Vitesse de la derive. @defaultValue 0.3 */
  speed?: number
  /** Longueur des segments, en hauteurs de cadre. @defaultValue 0.6 */
  length?: number
  /** Largeur du halo autour du trait. @defaultValue 0.03 */
  glow?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<FloatingLinesControls>
}

/** Toutes les proprietes. */
export type FloatingLinesProps = Customisable<FloatingLinesOwnProps>

/** Tokens employes par defaut : le fond, le halo, le coeur du trait. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-sky-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Nombre de lignes en qualite basse.
 *
 * Chaque ligne se paie une projection, un sinus et une exponentielle par
 * fragment : c'est le seul levier de cout, et il se retrograde sans toucher au
 * shader.
 */
const LOW_COUNT = 4

/**
 * Lignes flottantes.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <FloatingLines className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function FloatingLines({
  count = 7,
  speed = 0.3,
  length = 0.6,
  glow = 0.03,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FloatingLinesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: FLOATING_LINES_FRAGMENT,
    colors,
    uniforms: { uCount: count, uSpeed: speed, uLength: length, uGlow: glow },
    name: 'floating-lines',
    degrade: (quality) => ({
      uCount: quality === 'low' ? Math.min(count, LOW_COUNT) : count,
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
