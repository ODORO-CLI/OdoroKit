/**
 * Grille neon : un sol quadrille qui fuit vers l'horizon, sous un soleil raye.
 *
 * ## Le principe
 *
 * Le sol est projete en posant la profondeur egale a l'inverse de la
 * distance a l'horizon ; un decalage du domaine le fait defiler vers le
 * spectateur. Au-dessus, un disque decoupe par des bandes horizontales qui
 * glissent, et une ligne d'horizon en neon. Distinct du quadrillage plat et
 * du tunnel radial : ici la grille converge vers un point de fuite.
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

import { NEON_GRID_FRAGMENT } from './neon-grid.shader.js'

/** Ce que l'echappatoire recoit. */
export interface NeonGridControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface NeonGridOwnProps {
  /** Vitesse de defilement du sol. @defaultValue 1 */
  speed?: number
  /** Hauteur de l'horizon, en fraction du cadre. @defaultValue 0.5 */
  horizon?: number
  /** Nombre de lignes de profondeur visibles. @defaultValue 8 */
  density?: number
  /** Portee du halo des traits, en cellules de sol. @defaultValue 0.06 */
  glow?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<NeonGridControls>
}

/** Toutes les proprietes. */
export type NeonGridProps = Customisable<NeonGridOwnProps>

/** Tokens employes par defaut : le fond, le neon, le soleil. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-amber-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-fuchsia-100 dark:o-from-fuchsia-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Grille neon.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <NeonGrid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function NeonGrid({
  speed = 1,
  horizon = 0.5,
  density = 8,
  glow = 0.06,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: NeonGridProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: NEON_GRID_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uHorizon: horizon, uDensity: density, uGlow: glow },
    name: 'neon-grid',
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
