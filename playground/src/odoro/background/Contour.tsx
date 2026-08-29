/**
 * Courbes de niveau : une carte topographique animee, d epaisseur de trait constante.
 *
 * ## Le principe
 *
 * Une courbe de niveau est le lieu ou le champ vaut un multiple du pas. Replier la valeur sur ce pas les donne toutes d un coup.
 *
 * L epaisseur est corrigee par la derivee du champ : sans cela, les lignes s epaississent sur les plats et disparaissent sur les pentes.
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
  CONTOUR_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface ContourControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface ContourOwnProps {
  /** Vitesse du relief. @defaultValue 0.06 */
  speed?: number
  /** Echelle du relief. @defaultValue 2.2 */
  scale?: number
  /** Nombre de paliers. @defaultValue 8 */
  levels?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<ContourControls>
}

/** Toutes les proprietes. */
export type ContourProps = Customisable<ContourOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-zinc-800',
  '--o-palette-emerald-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-950'

/**
 * Courbes de niveau.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Contour className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Contour({
  speed = 0.06,
  scale = 2.2,
  levels = 8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ContourProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CONTOUR_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uLevels: levels },
    name: 'contour',
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
