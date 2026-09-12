/**
 * Forme organique : une seule forme qui respire au centre, bord frange.
 *
 * ## Le principe
 *
 * Un rayon module par trois harmoniques impaires de l'angle, chacune tournant
 * a sa vitesse : la forme ne se repete jamais et ne parait jamais
 * geometrique. Le bord est perturbe par un bruit fin avant le seuil, et un
 * halo s'en echappe.
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

import { BLOB_MORPH_FRAGMENT } from './blob-morph.shader.js'

/** Ce que l'echappatoire recoit. */
export interface BlobMorphControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface BlobMorphOwnProps {
  /** Rayon moyen, en hauteurs de cadre. @defaultValue 0.28 */
  size?: number
  /** Vitesse de la respiration. @defaultValue 0.4 */
  speed?: number
  /** Amplitude des harmoniques du contour. @defaultValue 0.35 */
  wobble?: number
  /** Largeur de la frange, force du halo. @defaultValue 0.5 */
  fringe?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<BlobMorphControls>
}

/** Toutes les proprietes. */
export type BlobMorphProps = Customisable<BlobMorphOwnProps>

/** Tokens employes par defaut : le fond, le corps, la frange. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-300',
] as const

/** Repli par defaut : un halo fige au centre, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-brand-400 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Octaves de la frange hors qualite basse.
 *
 * La frange est le seul bruit somme du shader : c'est le seul levier de cout,
 * et il n'a pas besoin d'etre une prop pour etre retrograde.
 */
const DETAIL = 2

/** Octaves de la frange en qualite basse. */
const LOW_DETAIL = 1

/**
 * Forme organique.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <BlobMorph className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function BlobMorph({
  size = 0.28,
  speed = 0.4,
  wobble = 0.35,
  fringe = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: BlobMorphProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: BLOB_MORPH_FRAGMENT,
    colors,
    uniforms: {
      uSize: size,
      uSpeed: speed,
      uWobble: wobble,
      uFringe: fringe,
      uDetail: DETAIL,
    },
    name: 'blob-morph',
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
