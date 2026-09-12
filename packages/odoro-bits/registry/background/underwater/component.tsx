/**
 * Sous l'eau : des rais de lumiere qui se balancent et des bulles qui montent.
 *
 * ## Le principe
 *
 * Les rais convergent vers un point au-dessus du cadre — presque paralleles,
 * ils s'ouvrent en descendant — et s'eteignent avec la profondeur. Les
 * bulles montent par colonnes, anneau fin et point de reflet, sur deux
 * profondeurs. Distinct des caustiques, qui sont le reseau au fond du bassin,
 * et des bulles seules, qui fusionnent en col.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur.
 *
 * Le repli n'est pas une precaution : il est affiche pendant le chargement du
 * backend, quand WebGL manque, quand l'arbitre refuse la surface et sous
 * mouvement reduit.
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

import { UNDERWATER_FRAGMENT } from './underwater.shader.js'

/** Ce que l'echappatoire recoit. */
export interface UnderwaterControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface UnderwaterOwnProps {
  /** Vitesse du balancement et de la montee. @defaultValue 1 */
  speed?: number
  /** Nombre de rais sur la largeur. @defaultValue 6 */
  rays?: number
  /** Nombre de colonnes de bulles sur la hauteur. Zero les supprime. @defaultValue 8 */
  bubbles?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<UnderwaterControls>
}

/** Toutes les proprietes. */
export type UnderwaterProps = Customisable<UnderwaterOwnProps>

/** Tokens employes par defaut : le fond, la lumiere, la profondeur. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-300',
  '--o-palette-sky-600',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-sky-200 dark:o-to-sky-900'

/**
 * Sous l'eau.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Underwater className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Underwater({
  speed = 1,
  rays = 6,
  bubbles = 8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: UnderwaterProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: UNDERWATER_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uRays: rays, uBubbles: bubbles },
    name: 'underwater',
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
