/**
 * Oscilloscope : un spot qui balaie l'ecran, et le phosphore qui garde sa trace.
 *
 * ## Le principe
 *
 * Rien n'est trace : chaque fragment reconstruit l'instant ou le spot l'a
 * eclaire — dans ce balayage s'il est derriere le spot, dans le precedent
 * sinon — et son intensite est l'exponentielle de cet age. Le signal est fige
 * par balayage, comme sur un vrai ecran : la trace ne bouge pas derriere le
 * spot, elle s'eteint.
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

import { OSCILLOSCOPE_FRAGMENT } from './oscilloscope.shader.js'

/** Ce que l'echappatoire recoit. */
export interface OscilloscopeControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface OscilloscopeOwnProps {
  /** Balayages par seconde. @defaultValue 0.5 */
  speed?: number
  /** Vitesse d'extinction du phosphore. Plus bas, plus de remanence. @defaultValue 1.2 */
  decay?: number
  /** Periodes du signal dans le cadre. @defaultValue 3 */
  frequency?: number
  /** Hauteur du signal, en fraction du cadre. @defaultValue 0.28 */
  amplitude?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<OscilloscopeControls>
}

/** Toutes les proprietes. */
export type OscilloscopeProps = Customisable<OscilloscopeOwnProps>

/** Tokens employes par defaut : le fond, la graticule, le phosphore. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-green-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-green-950'

/**
 * Oscilloscope.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Oscilloscope className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Oscilloscope({
  speed = 0.5,
  decay = 1.2,
  frequency = 3,
  amplitude = 0.28,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: OscilloscopeProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: OSCILLOSCOPE_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uDecay: decay,
      uFrequency: frequency,
      uAmplitude: amplitude,
    },
    name: 'oscilloscope',
    // Une trace fine a densite de pixels reduite scintille : en qualite basse
    // le phosphore s'eteint plus vite, et la remanence — la partie qui
    // scintille — raccourcit d'autant.
    degrade: (quality) => ({ uDecay: quality === 'low' ? decay * 2 : decay }),
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
