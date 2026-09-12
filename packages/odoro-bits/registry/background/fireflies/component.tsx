/**
 * Lucioles : des points qui clignotent chacun a sa phase, dans un halo doux.
 *
 * ## Le principe
 *
 * Une luciole par cellule d une grille, sa position tiree du hachage de la cellule ; le clignotement est un sinus de phase propre, jamais un tirage par image.
 *
 * Le halo est une exponentielle de la distance, sommee sur les neuf cellules voisines pour traverser les bords de maille.
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

import { FIREFLIES_FRAGMENT } from './fireflies.shader.js'

/** Ce que l'echappatoire recoit. */
export interface FirefliesControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface FirefliesOwnProps {
  /** Cadence du clignotement et de la derive. @defaultValue 0.8 */
  speed?: number
  /** Nombre de cellules sur le plus petit cote. @defaultValue 16 */
  density?: number
  /** Portee du halo. @defaultValue 0.6 */
  glow?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<FirefliesControls>
}

/** Toutes les proprietes. */
export type FirefliesProps = Customisable<FirefliesOwnProps>

/** Tokens employes par defaut : la nuit, puis les deux teintes de lucioles. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-300',
  '--o-palette-lime-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Lucioles.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Fireflies className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Fireflies({
  speed = 0.8,
  density = 16,
  glow = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FirefliesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: FIREFLIES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uGlow: glow },
    name: 'fireflies',
    // Une maille plus large fait moins de lucioles a l'ecran, donc moins de
    // halos qui se recouvrent : c'est le reglage qui pese, donc il est borne.
    degrade: (quality) => ({
      uDensity: quality === 'low' ? Math.min(density, 10) : density,
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
