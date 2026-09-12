/**
 * Rangees glissantes : des tuiles arrondies qui defilent par rangees, en
 * sens alternes, chacune a sa vitesse.
 *
 * ## Le principe
 *
 * Rien ne se deplace : chaque rangee lit son abscisse decalee du temps,
 * avec un sens et une vitesse qui lui sont propres. Deux rangees voisines
 * ne restent jamais alignees, et le motif se lit comme un convoyeur plutot
 * que comme un damier. Quelques tuiles portent l'accent et respirent.
 *
 * Ce qui distingue cette entree de `mosaic` et de `checker` : ici les
 * cellules ne sont pas fixes, elles defilent ; et de `stripes` : ce sont
 * des tuiles separees, pas des bandes continues.
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

import { GRID_MOTION_FRAGMENT } from './grid-motion.shader.js'

/** Ce que l'echappatoire recoit. */
export interface GridMotionControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface GridMotionOwnProps {
  /** Nombre de rangees sur la hauteur. Borne a quarante par le shader. @defaultValue 8 */
  rows?: number
  /** Vitesse du glissement. @defaultValue 0.6 */
  speed?: number
  /** Espace entre les tuiles, en fraction de rangee. @defaultValue 0.12 */
  gap?: number
  /** Part des tuiles accentuees, entre zero et un. @defaultValue 0.12 */
  accent?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<GridMotionControls>
}

/** Toutes les proprietes. */
export type GridMotionProps = Customisable<GridMotionOwnProps>

/** Tokens employes par defaut : le fond, les tuiles, les tuiles accentuees. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-brand-500',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Rangees glissantes.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GridMotion className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GridMotion({
  rows = 8,
  speed = 0.6,
  gap = 0.12,
  accent = 0.12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GridMotionProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GRID_MOTION_FRAGMENT,
    colors,
    uniforms: { uRows: rows, uSpeed: speed, uGap: gap, uAccent: accent },
    name: 'grid-motion',
    // Des tuiles petites qui defilent scintillent sur leurs coins a densite
    // de pixels reduite : en qualite basse, les rangees s'elargissent.
    degrade: (quality) => ({
      uRows: quality === 'low' ? Math.min(rows, 6) : rows,
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
