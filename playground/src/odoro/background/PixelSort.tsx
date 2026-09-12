/**
 * Tri de pixels : des bandes de pixels tries qui sortent des zones claires
 * d'une image et coulent.
 *
 * ## Le principe
 *
 * L'effet reel trie chaque colonne de l'image la ou la luminance passe un
 * seuil ; ici il est simule sans lire la colonne. Chaque colonne porte des
 * segments tires de leur rang, dont la luminance croit du haut vers le bas
 * — le degrade que produirait un tri — et qui n'apparaissent que la ou
 * l'image de fond est assez claire. Ils defilent a des vitesses inegales.
 *
 * Ce qui distingue cette entree de `dither` : pas de trame, des colonnes
 * continues ; et de `glitch-blocks` : rien ne saute, tout coule.
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

import { PIXEL_SORT_FRAGMENT } from './pixel-sort.shader.js'

/** Ce que l'echappatoire recoit. */
export interface PixelSortControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface PixelSortOwnProps {
  /** Largeur d'une colonne, en pixels physiques. @defaultValue 3 */
  pixel?: number
  /** Nombre de segments sur la hauteur d'une colonne. @defaultValue 5 */
  density?: number
  /** Seuil de luminance au-dessus duquel une bande sort. @defaultValue 0.45 */
  threshold?: number
  /** Vitesse d'ecoulement. @defaultValue 0.3 */
  speed?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<PixelSortControls>
}

/** Toutes les proprietes. */
export type PixelSortProps = Customisable<PixelSortOwnProps>

/** Tokens employes par defaut : le fond, l'image, le haut des bandes. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-500',
  '--o-palette-rose-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-rose-100 dark:o-from-rose-950 o-via-sky-100 dark:o-via-sky-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Tri de pixels.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <PixelSort className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function PixelSort({
  pixel = 3,
  density = 5,
  threshold = 0.45,
  speed = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PixelSortProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: PIXEL_SORT_FRAGMENT,
    colors,
    uniforms: {
      uPixel: pixel,
      uDensity: density,
      uThreshold: threshold,
      uSpeed: speed,
    },
    name: 'pixel-sort',
    // Des colonnes d'un ou deux pixels fourmillent a densite de pixels
    // reduite : en qualite basse, elles s'elargissent.
    degrade: (quality) => ({
      uPixel: quality === 'low' ? Math.max(pixel, 6) : pixel,
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
