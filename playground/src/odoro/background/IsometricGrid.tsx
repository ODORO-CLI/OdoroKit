/**
 * Pave isometrique : des cubes vus en isometrie, dont les cellules
 * s'allument chacune a son rythme.
 *
 * ## Ce qui le distingue des alveoles
 *
 * Meme grille hexagonale, mais l'hexagone est coupe en trois faces a trois
 * ombres : le pavage a du relief, et l'allumage eclaire un cube entier, faces
 * comprises. Les alveoles pulsent ; ici, rien ne bouge, des cubes s'allument
 * et s'eteignent.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur.
 *
 * Le repli n'est pas une precaution : il est affiche pendant le chargement du
 * backend, quand WebGL manque, quand l'arbitre refuse la surface et sous
 * mouvement reduit.
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

import { ISOMETRIC_GRID_FRAGMENT } from './isometric-grid.shader.js'

/** Ce que l'echappatoire recoit. */
export interface IsometricGridControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface IsometricGridOwnProps {
  /** Vitesse de l'allumage. @defaultValue 0.5 */
  speed?: number
  /** Nombre de cubes sur la hauteur. @defaultValue 7 */
  density?: number
  /** Part des cubes allumes a un instant donne. @defaultValue 0.25 */
  lit?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<IsometricGridControls>
}

/** Toutes les proprietes. */
export type IsometricGridProps = Customisable<IsometricGridOwnProps>

/** Tokens employes par defaut : le fond, l'ombre des faces, l'allumage. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Pave isometrique.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <IsometricGrid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function IsometricGrid({
  speed = 0.5,
  density = 7,
  lit = 0.25,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: IsometricGridProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: ISOMETRIC_GRID_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uLit: lit },
    name: 'isometric-grid',
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
