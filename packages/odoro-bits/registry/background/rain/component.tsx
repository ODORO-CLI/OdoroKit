/**
 * Pluie : des trainees verticales, une vitesse par colonne.
 *
 * ## Le principe
 *
 * L espace est decoupe en colonnes qui defilent independamment. Une goutte n est pas un objet : c est une attenuation fonction de la distance a la tete.
 *
 * La coordonnee est repliee sur la colonne entiere : une goutte sortie par le bas rentre par le haut sans qu on ait a la creer.
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
  RAIN_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro/engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface RainControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface RainOwnProps {
  /** Vitesse de chute. @defaultValue 0.6 */
  speed?: number
  /** Nombre de colonnes. @defaultValue 60 */
  columns?: number
  /** Longueur des trainees. @defaultValue 0.35 */
  length?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<RainControls>
}

/** Toutes les proprietes. */
export type RainProps = Customisable<RainOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-zinc-950', '--o-palette-sky-300'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-b o-from-zinc-950 o-to-sky-950'

/**
 * Pluie.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Rain className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Rain({
  speed = 0.6,
  columns = 60,
  length = 0.35,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: RainProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: RAIN_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: columns, uLength: length },
    name: 'rain',
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
