/**
 * Champ de points : une grille de disques qui respirent.
 *
 * ## Ce que ce composant apporte, et ce qu'il delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur — les recopier ici en ferait autant
 * de versions a maintenir qu'il y a de fonds.
 *
 * ## Le repli n'est pas une precaution
 *
 * C'est la moitie du composant. Il est affiche pendant le chargement du
 * backend, quand WebGL manque, quand l'arbitre refuse la surface — il n'en
 * accorde qu'une par backend — et sous mouvement reduit, ou un fond anime
 * n'apporte rien d'autre que son mouvement.
 *
 * @module
 */

import {
  DOTS_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro/engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface DotsControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface DotsOwnProps {
  /** Vitesse de la respiration. @defaultValue 1.2 */
  speed?: number
  /** Nombre de points par largeur. @defaultValue 14 */
  density?: number
  /** Taille des points, en fraction de la cellule. @defaultValue 0.18 */
  radius?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<DotsControls>
}

/** Toutes les proprietes. */
export type DotsProps = Customisable<DotsOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-950'

/**
 * Champ de points : une grille de disques qui respirent.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Dots className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Dots({
  speed = 1.2,
  density = 14,
  radius = 0.18,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DotsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: DOTS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uRadius: radius },
    name: 'points',
    // En qualite basse, la densite est bornee : c'est le seul reglage qui
    // pese vraiment, et le motif reste reconnaissable une fois reduit.
    degrade: (quality) => ({
      uScale: quality === 'low' ? Math.min(density, 8) : density,
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
