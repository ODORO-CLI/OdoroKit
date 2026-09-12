/**
 * Halo qui pulse : un coeur qui respire et des anneaux emis a un rythme lent.
 *
 * ## Le principe
 *
 * Des anneaux gaussiens dont le rayon croit avec leur phase, repartis
 * uniformement sur la periode pour une emission reguliere ; ils s'elargissent
 * et palissent en s'eloignant. Le coeur grossit a chaque emission. Distinct
 * du sonar, aux fronts raides et au pointeur : ici tout est doux et pose.
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

import { HALO_PULSE_FRAGMENT } from './halo-pulse.shader.js'

/** Ce que l'echappatoire recoit. */
export interface HaloPulseControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface HaloPulseOwnProps {
  /** Periode du rythme, en millisecondes. @defaultValue 4000 */
  period?: number
  /** Nombre d'anneaux en vol. @defaultValue 3 */
  rings?: number
  /** Portee des anneaux, en hauteurs de cadre. @defaultValue 0.8 */
  size?: number
  /** Position horizontale du centre, en fraction du cadre. @defaultValue 0.5 */
  x?: number
  /** Position verticale du centre, en fraction du cadre. @defaultValue 0.5 */
  y?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<HaloPulseControls>
}

/** Toutes les proprietes. */
export type HaloPulseProps = Customisable<HaloPulseOwnProps>

/** Tokens employes par defaut : le fond, les anneaux, le coeur. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-400',
  '--o-palette-brand-500',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-teal-100 dark:o-to-teal-950'

/**
 * Halo qui pulse.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <HaloPulse className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function HaloPulse({
  period = 4000,
  rings = 3,
  size = 0.8,
  x = 0.5,
  y = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: HaloPulseProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: HALO_PULSE_FRAGMENT,
    colors,
    // Le registre parle en millisecondes, le shader en secondes.
    uniforms: { uPeriod: period / 1000, uRings: rings, uSize: size, uX: x, uY: y },
    name: 'halo-pulse',
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
