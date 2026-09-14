/**
 * Nebuleuse : des nuages profonds, en deux couches de bruit couplees.
 *
 * ## Le principe
 *
 * Deux couches de bruit fractal a des vitesses differentes, la seconde lue en un point deja deplace par la premiere : le couplage fait les volutes.
 *
 * Une vignette assombrit les bords — c est elle qui donne la profondeur, pas le bruit.
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

import { NEBULA_FRAGMENT } from './nebula.shader.js'

/** Ce que l'echappatoire recoit. */
export interface NebulaControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface NebulaOwnProps {
  /** Vitesse de derive des couches. @defaultValue 0.1 */
  speed?: number
  /** Echelle du bruit. Plus haut, plus fin. @defaultValue 2.2 */
  scale?: number
  /** Nombre d'octaves des deux couches. @defaultValue 4 */
  depth?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<NebulaControls>
}

/** Toutes les proprietes. */
export type NebulaProps = Customisable<NebulaOwnProps>

/** Tokens employes par defaut : le fond, les nuages, les coeurs lumineux. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-rose-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-violet-950'

/**
 * Nebuleuse.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Nebula className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Nebula({
  speed = 0.1,
  scale = 2.2,
  depth = 4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: NebulaProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: NEBULA_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uDepth: depth },
    name: 'nebula',
    // Chaque octave est une evaluation de bruit de plus par pixel, et il y a
    // deux couches : c'est le reglage qui pese, donc celui qui est borne.
    degrade: (quality) => ({
      uDepth: quality === 'low' ? Math.min(depth, 2) : depth,
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
