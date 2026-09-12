/**
 * Vague tranchee : une bande epaisse lue par colonnes, qui ondule en escalier.
 *
 * ## Le principe
 *
 * Le cadre est decoupe en tranches verticales ; dans chacune, la hauteur de
 * la bande est evaluee au centre de la colonne, jamais au fragment. La vague
 * saute donc d'une marche a la suivante, et chaque colonne bat en plus a son
 * propre rythme.
 *
 * Ce qui distingue cette entree de ses cousines : la bande est epaisse, le
 * mouvement est vertical — les colonnes montent et descendent — et le rythme
 * est vif, avec un tressaillement propre a chaque tranche.
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

import { SLICED_WAVES_FRAGMENT } from './sliced-waves.shader.js'

/** Ce que l'echappatoire recoit. */
export interface SlicedWavesControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface SlicedWavesOwnProps {
  /** Nombre de tranches. Borne a cent vingt par le shader. @defaultValue 40 */
  slices?: number
  /** Hauteur de la vague, en fraction du cadre. @defaultValue 0.22 */
  amplitude?: number
  /** Vitesse de la vague. @defaultValue 0.9 */
  speed?: number
  /** Epaisseur de la bande, en fraction du cadre. @defaultValue 0.28 */
  height?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<SlicedWavesControls>
}

/** Toutes les proprietes. */
export type SlicedWavesProps = Customisable<SlicedWavesOwnProps>

/** Tokens employes par defaut : le fond, le corps de la bande, son bord. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-violet-200',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-violet-950'

/**
 * Nombre de tranches en qualite basse.
 *
 * Le shader evalue une tranche par fragment, donc le nombre ne coute rien en
 * calcul. Mais un sillon d'un pixel entre des tranches etroites, a densite de
 * pixels reduite, se met a scintiller : moins de tranches, plus larges, et
 * l'escalier reste net.
 */
const LOW_SLICES = 20

/**
 * Vague tranchee.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <SlicedWaves className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function SlicedWaves({
  slices = 40,
  amplitude = 0.22,
  speed = 0.9,
  height = 0.28,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SlicedWavesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SLICED_WAVES_FRAGMENT,
    colors,
    uniforms: {
      uSlices: slices,
      uAmplitude: amplitude,
      uSpeed: speed,
      uHeight: height,
    },
    name: 'sliced-waves',
    degrade: (quality) => ({
      uSlices: quality === 'low' ? Math.min(slices, LOW_SLICES) : slices,
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
