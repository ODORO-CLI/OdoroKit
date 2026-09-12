/**
 * Iridescence : une nacre qui ondule doucement : la teinte tourne avec l inclinaison de la surface, deux reflets se posent par addition.
 *
 * ## Le principe
 *
 * Une surface de sinus directionnels a grande longueur d'onde, dont le
 * gradient se calcule a la main et donne une normale. L'inclinaison et
 * la hauteur font une phase, et la phase fait tourner la teinte entre
 * deux tokens sans creuser de frange : tout est doux, c'est ce qui fait
 * la nacre plutot que le film de savon.
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

import { IRIDESCENCE_FRAGMENT } from './iridescence.shader.js'

/** Ce que l'echappatoire recoit. */
export interface IridescenceControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface IridescenceOwnProps {
  /** Vitesse de l ondulation. @defaultValue 0.3 */
  speed?: number
  /** Echelle des ondes. Plus haut, plus serre. @defaultValue 1.4 */
  scale?: number
  /** Force des reflets. @defaultValue 0.7 */
  shimmer?: number
  /** Tours de teinte sur la hauteur de la surface. @defaultValue 2.5 */
  bands?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<IridescenceControls>
}

/** Toutes les proprietes. */
export type IridescenceProps = Customisable<IridescenceOwnProps>

/** Tokens employes par defaut : le fond, les deux teintes de la nacre. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-pink-300',
  '--o-palette-teal-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-tr o-from-pink-100 dark:o-from-pink-950 o-via-zinc-50 dark:o-via-zinc-950 o-to-teal-100 dark:o-to-teal-950'

/**
 * Detail hors qualite basse.
 *
 * Chaque onde est un sinus et son gradient : c'est le seul levier de
 * cout, et il tombe a deux ondes en qualite basse.
 */
const DETAIL = 4

/** Detail en qualite basse. */
const LOW_DETAIL = 2

/**
 * Iridescence.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Iridescence className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Iridescence({
  speed = 0.3,
  scale = 1.4,
  shimmer = 0.7,
  bands = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: IridescenceProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: IRIDESCENCE_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uScale: scale,
      uShimmer: shimmer,
      uBands: bands,
      uDetail: DETAIL,
    },
    name: 'iridescence',
    degrade: (quality) => ({
      uDetail: quality === 'low' ? LOW_DETAIL : DETAIL,
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
