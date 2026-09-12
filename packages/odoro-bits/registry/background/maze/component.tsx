/**
 * Labyrinthe : des diagonales qui se dessinent et se redessinent.
 *
 * ## Pourquoi un front, et pas un fondu
 *
 * Un labyrinthe qui change d'un coup ne se voit pas changer ; un fondu entre
 * deux labyrinthes montre deux dessins superposes, lisibles ni l'un ni
 * l'autre. Le front, lui, ne touche qu'une diagonale de cellules a la fois :
 * le dessin reste lisible partout, et l'oeil suit la tete qui trace.
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

import { MAZE_FRAGMENT } from './maze.shader.js'

/** Ce que l'echappatoire recoit. */
export interface MazeControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface MazeOwnProps {
  /** Duree d'un dessin complet, en secondes. @defaultValue 6 */
  period?: number
  /** Nombre de cellules sur la hauteur. @defaultValue 14 */
  density?: number
  /** Epaisseur des traits, en fraction de la cellule. @defaultValue 0.1 */
  thickness?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<MazeControls>
}

/** Toutes les proprietes. */
export type MazeProps = Customisable<MazeOwnProps>

/** Tokens employes par defaut : le fond, les traits, la tete. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Labyrinthe.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Maze className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Maze({
  period = 6,
  density = 14,
  thickness = 0.1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MazeProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: MAZE_FRAGMENT,
    colors,
    uniforms: { uPeriod: period, uDensity: density, uThickness: thickness },
    name: 'maze',
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
