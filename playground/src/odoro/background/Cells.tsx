/**
 * Cellules : un pavage cellulaire anime, dont les aretes viennent de la seconde distance.
 *
 * ## Le principe
 *
 * Chaque cellule d une grille porte un germe. Neuf tests suffisent a trouver le plus proche, quelle que soit la densite.
 *
 * La difference entre premiere et seconde distance s annule sur les aretes : c est ainsi qu on obtient le reseau sans en construire une seule.
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
  CELLS_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface CellsControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface CellsOwnProps {
  /** Vitesse de derive des germes. @defaultValue 0.35 */
  speed?: number
  /** Nombre de cellules par cote. @defaultValue 7 */
  density?: number
  /** Largeur des aretes. @defaultValue 0.06 */
  edge?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<CellsControls>
}

/** Toutes les proprietes. */
export type CellsProps = Customisable<CellsOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-emerald-700',
  '--o-palette-emerald-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-b o-from-zinc-950 o-to-emerald-950'

/**
 * Cellules.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Cells className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Cells({
  speed = 0.35,
  density = 7,
  edge = 0.06,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CellsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CELLS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uEdge: edge },
    name: 'cells',
    // En qualite basse, le reglage qui pese est borne : le motif reste
    // reconnaissable une fois reduit.
    degrade: (quality) => ({
      uScale: quality === 'low' ? Math.min(density, 5) : density,
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
