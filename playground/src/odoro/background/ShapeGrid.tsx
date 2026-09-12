/**
 * Grille de formes : rond, carre ou triangle par cellule, chacun tournant a
 * sa vitesse.
 *
 * ## Ce qui le distingue des trames de points
 *
 * La matrice de points et la grille de spots posent un point identique par
 * cellule et animent la trame entiere. Ici, chaque cellule porte une forme
 * differente, orientee et cadencee a part : c'est une collection, pas une
 * trame.
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

import { SHAPE_GRID_FRAGMENT } from './shape-grid.shader.js'

/** Ce que l'echappatoire recoit. */
export interface ShapeGridControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface ShapeGridOwnProps {
  /** Vitesse de rotation moyenne. @defaultValue 0.4 */
  speed?: number
  /** Nombre de cellules sur la hauteur. @defaultValue 9 */
  density?: number
  /** Rayon des formes, en fraction de la cellule. @defaultValue 0.28 */
  size?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<ShapeGridControls>
}

/** Toutes les proprietes. */
export type ShapeGridProps = Customisable<ShapeGridOwnProps>

/** Tokens employes par defaut : le fond, puis les deux teintes des formes. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-sky-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Grille de formes.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <ShapeGrid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function ShapeGrid({
  speed = 0.4,
  density = 9,
  size = 0.28,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ShapeGridProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SHAPE_GRID_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uSize: size },
    name: 'shape-grid',
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
