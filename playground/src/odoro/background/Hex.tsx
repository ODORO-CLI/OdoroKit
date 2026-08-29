/**
 * Alveoles : un pavage hexagonal dont chaque alveole pulse a son rythme.
 *
 * ## Le principe
 *
 * Une grille hexagonale est la superposition de deux grilles rectangulaires decalees d une demi-maille : on evalue les deux et on garde la plus proche.
 *
 * La distance employee est hexagonale, pas euclidienne — c est elle qui donne des bords droits plutot que des disques.
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
  HEX_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from 'odoro-engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface HexControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface HexOwnProps {
  /** Vitesse de la pulsation. @defaultValue 0.6 */
  speed?: number
  /** Nombre d alveoles par cote. @defaultValue 9 */
  density?: number
  /** Adoucissement du bord. @defaultValue 0.04 */
  edge?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<HexControls>
}

/** Toutes les proprietes. */
export type HexProps = Customisable<HexOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-brand-500',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-b o-from-zinc-950 o-to-brand-950'

/**
 * Alveoles.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Hex className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Hex({
  speed = 0.6,
  density = 9,
  edge = 0.04,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: HexProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: HEX_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uEdge: edge },
    name: 'hex',
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
