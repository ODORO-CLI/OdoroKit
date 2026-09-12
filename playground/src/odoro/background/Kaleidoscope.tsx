/**
 * Kaleidoscope : un bruit anime replie en secteurs symetriques.
 *
 * ## Le principe
 *
 * L'angle du pixel est ramene modulo 2pi/n puis reflechi par rapport au milieu
 * du secteur : tous les secteurs lisent le meme domaine, et un simple bruit
 * fractal devient symetrique sans qu'aucune symetrie ne soit dessinee. Une
 * rotation lente fait tourner l'ensemble.
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

import { KALEIDOSCOPE_FRAGMENT } from './kaleidoscope.shader.js'

/** Ce que l'echappatoire recoit. */
export interface KaleidoscopeControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface KaleidoscopeOwnProps {
  /** Vitesse de rotation et de derive du bruit. @defaultValue 0.15 */
  speed?: number
  /** Nombre de secteurs du repliement. @defaultValue 6 */
  segments?: number
  /** Echelle du bruit. Plus haut, plus fin. @defaultValue 2.5 */
  scale?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<KaleidoscopeControls>
}

/** Toutes les proprietes. */
export type KaleidoscopeProps = Customisable<KaleidoscopeOwnProps>

/** Tokens employes par defaut : le fond, les nappes, les rehauts. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-purple-500',
  '--o-palette-pink-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-purple-950'

/**
 * Kaleidoscope.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Kaleidoscope className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Kaleidoscope({
  speed = 0.15,
  segments = 6,
  scale = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: KaleidoscopeProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: KALEIDOSCOPE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uSegments: segments, uScale: scale, uDetail: 4 },
    name: 'kaleidoscope',
    // Le repliement est gratuit, les secteurs aussi : ce sont les octaves des
    // deux lectures de bruit qui pesent, donc c'est elles qui sont bornees.
    degrade: (quality) => ({
      uDetail: quality === 'low' ? 2 : 4,
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
