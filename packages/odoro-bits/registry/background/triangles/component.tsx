/**
 * Triangulation : un pavage de facettes triangulaires dont l'eclairage
 * bouge, comme une lumiere qui glisse sur un cristal.
 *
 * ## Le principe
 *
 * Chaque case de la grille est coupee par une diagonale, alternee en damier
 * pour que le pavage n'ait pas de sens dominant. L'eclairage d'une facette
 * compose une respiration qui lui est propre et un balayage diagonal qui
 * traverse tout le pavage ; les plus vives prennent une teinte.
 *
 * Ce qui distingue cette entree de `mosaic` et de `cells` : les facettes
 * sont des triangles fixes, et c'est la lumiere qui bouge, pas le pavage.
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

import { TRIANGLES_FRAGMENT } from './triangles.shader.js'

/** Ce que l'echappatoire recoit. */
export interface TrianglesControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface TrianglesOwnProps {
  /** Nombre de cases sur la hauteur. Borne a quarante par le shader. @defaultValue 7 */
  size?: number
  /** Vitesse de l'eclairage. @defaultValue 0.5 */
  speed?: number
  /** Ecart entre facettes sombres et claires. @defaultValue 0.8 */
  contrast?: number
  /** Poids de la teinte sur les facettes les plus vives. @defaultValue 0.6 */
  tint?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<TrianglesControls>
}

/** Toutes les proprietes. */
export type TrianglesProps = Customisable<TrianglesOwnProps>

/** Tokens employes par defaut : le fond, les facettes, la teinte des plus vives. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-violet-500',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Triangulation.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Triangles className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Triangles({
  size = 7,
  speed = 0.5,
  contrast = 0.8,
  tint = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: TrianglesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: TRIANGLES_FRAGMENT,
    colors,
    uniforms: { uSize: size, uSpeed: speed, uContrast: contrast, uTint: tint },
    name: 'triangles',
    // Des joints fins entre des facettes petites scintillent a densite de
    // pixels reduite : en qualite basse, les cases s'elargissent.
    degrade: (quality) => ({
      uSize: quality === 'low' ? Math.min(size, 6) : size,
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
