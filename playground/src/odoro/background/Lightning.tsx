/**
 * Eclairs : des arcs intermittents sur un ciel de nuit.
 *
 * ## Le principe
 *
 * Un chemin vertical deplace par un bruit multi-octave, un trait en
 * exponentielle de la distance horizontale a ce chemin, et un temps hache en
 * paliers dont le hachage decide des rafales : l'eclair vit deux ou trois
 * images, puis laisse une lueur residuelle.
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

import { LIGHTNING_FRAGMENT } from './lightning.shader.js'

/** Ce que l'echappatoire recoit. */
export interface LightningControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface LightningOwnProps {
  /** Cadence des paliers, donc des rafales possibles. @defaultValue 0.6 */
  frequency?: number
  /** Octaves du deplacement du chemin, donc la ramure. @defaultValue 4 */
  branches?: number
  /** Portee de la lueur autour du trait. @defaultValue 0.5 */
  glow?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<LightningControls>
}

/** Toutes les proprietes. */
export type LightningProps = Customisable<LightningOwnProps>

/** Tokens employes par defaut : le ciel de nuit, la lueur, l'arc. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-indigo-400', '--o-theme-fg'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Eclairs.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Lightning className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Lightning({
  frequency = 0.6,
  branches = 4,
  glow = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LightningProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LIGHTNING_FRAGMENT,
    colors,
    uniforms: { uFrequency: frequency, uBranches: branches, uGlow: glow },
    name: 'lightning',
    // Chaque octave du deplacement est une evaluation de bruit de plus par
    // pixel : c'est le reglage qui pese, donc celui qui est borne.
    degrade: (quality) => ({
      uBranches: quality === 'low' ? Math.min(branches, 2) : branches,
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
