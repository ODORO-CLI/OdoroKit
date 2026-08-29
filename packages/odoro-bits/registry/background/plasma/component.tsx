/**
 * Plasma : l interference de quatre ondes, dont une radiale qui brise la periodicite.
 *
 * ## Le principe
 *
 * Quatre sinus evalues au meme point. La figure n a aucune structure propre : elle n est faite que de leurs battements.
 *
 * L onde radiale est ce qui empeche le reseau de rester une grille de losanges.
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
  PLASMA_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro/engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface PlasmaControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface PlasmaOwnProps {
  /** Vitesse des ondes. @defaultValue 0.35 */
  speed?: number
  /** Echelle du motif. Plus grand, plus serre. @defaultValue 3 */
  scale?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<PlasmaControls>
}

/** Toutes les proprietes. */
export type PlasmaProps = Customisable<PlasmaOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-br o-from-zinc-950 o-to-fuchsia-900'

/**
 * Plasma.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Plasma className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Plasma({
  speed = 0.35,
  scale = 3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PlasmaProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: PLASMA_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale },
    name: 'plasma',
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
