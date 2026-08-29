/**
 * Mosaique : un bruit lu au centre de chaque cellule, donc quantifie en carreaux.
 *
 * ## Le principe
 *
 * Le carreau n existe nulle part dans le calcul : il apparait parce que le champ est echantillonne grossierement, exprès.
 *
 * Le joint entre carreaux n est pas decoratif — sans lui, deux valeurs voisines se fondent et la grille disparait.
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
  MOSAIC_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro/engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface MosaicControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface MosaicOwnProps {
  /** Vitesse du champ. @defaultValue 0.05 */
  speed?: number
  /** Nombre de carreaux par cote. @defaultValue 16 */
  density?: number
  /** Largeur du joint. @defaultValue 0.06 */
  gap?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<MosaicControls>
}

/** Toutes les proprietes. */
export type MosaicProps = Customisable<MosaicOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-900',
  '--o-palette-brand-600',
  '--o-palette-fuchsia-500',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-br o-from-zinc-900 o-to-brand-900'

/**
 * Mosaique.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Mosaic className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Mosaic({
  speed = 0.05,
  density = 16,
  gap = 0.06,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MosaicProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: MOSAIC_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uGap: gap },
    name: 'mosaic',
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
