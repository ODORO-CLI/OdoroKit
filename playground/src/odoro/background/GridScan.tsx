/**
 * Grille balayee : un quadrillage qu'une barre lumineuse parcourt, et qui
 * s'eteint cellule par cellule derriere elle.
 *
 * ## Le principe
 *
 * La grille est lue dans le shader ; la barre parcourt un axe du cadre a
 * vitesse constante, avec une marge de chaque cote pour sortir du cadre
 * avant de reapparaitre. Chaque cellule qu'elle a franchie s'eteint a son
 * rythme, depuis une intensite qui lui est propre : c'est ce qui la
 * distingue d'un simple degrade qui glisse.
 *
 * Ce qui distingue cette entree de `scanlines` : il n'y a ni lignes
 * cathodiques, ni grain, ni vignette — seulement un quadrillage, et une
 * barre qui allume ses cellules. Et de `grid-lines` : celle-ci derive en
 * CSS ; ici rien ne derive, tout est balaye.
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

import { GRID_SCAN_FRAGMENT } from './grid-scan.shader.js'

/** Ce que l'echappatoire recoit. */
export interface GridScanControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface GridScanOwnProps {
  /** Nombre de cellules sur la hauteur. Borne a soixante par le shader. @defaultValue 14 */
  cells?: number
  /** Vitesse de la barre. @defaultValue 1 */
  speed?: number
  /** Longueur de la trainee, en cellules. @defaultValue 3 */
  trail?: number
  /** La barre parcourt la largeur plutot que la hauteur. @defaultValue false */
  vertical?: boolean
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<GridScanControls>
}

/** Toutes les proprietes. */
export type GridScanProps = Customisable<GridScanOwnProps>

/** Tokens employes par defaut : le fond, les lignes, la barre. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-cyan-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Grille balayee.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GridScan className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GridScan({
  cells = 14,
  speed = 1,
  trail = 3,
  vertical = false,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GridScanProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GRID_SCAN_FRAGMENT,
    colors,
    uniforms: {
      uCells: cells,
      uSpeed: speed,
      uTrail: trail,
      uVertical: vertical ? 1 : 0,
    },
    name: 'grid-scan',
    // Une grille serree a densite de pixels reduite scintille sur ses
    // lignes : en qualite basse, les cellules s'elargissent.
    degrade: (quality) => ({
      uCells: quality === 'low' ? Math.min(cells, 10) : cells,
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
