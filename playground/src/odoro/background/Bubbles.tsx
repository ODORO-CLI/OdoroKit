/**
 * Bulles : des disques qui montent et fusionnent en col quand ils se rapprochent.
 *
 * ## Le principe
 *
 * Additionner des champs qui decroissent avec la distance, puis seuiller la somme : c est le principe des surfaces implicites.
 *
 * Le champ vaut un sur le bord du disque, si bien qu une bulle isolee retrouve exactement sa taille nominale.
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
  BUBBLES_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from 'odoro-engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface BubblesControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface BubblesOwnProps {
  /** Vitesse de remontee. @defaultValue 0.25 */
  speed?: number
  /** Nombre de bulles. Borne a seize par le shader. @defaultValue 9 */
  count?: number
  /** Rayon de reference. @defaultValue 0.09 */
  radius?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<BubblesControls>
}

/** Toutes les proprietes. */
export type BubblesProps = Customisable<BubblesOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-zinc-950', '--o-palette-fuchsia-600'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-t o-from-fuchsia-950 o-to-zinc-950'

/**
 * Bulles.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Bubbles className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Bubbles({
  speed = 0.25,
  count = 9,
  radius = 0.09,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: BubblesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: BUBBLES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: count, uRadius: radius },
    name: 'bubbles',
    // En qualite basse, le reglage qui pese est borne : le motif reste
    // reconnaissable une fois reduit.
    degrade: (quality) => ({
      uScale: quality === 'low' ? Math.min(count, 6) : count,
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
