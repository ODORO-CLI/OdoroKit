/**
 * Oscilloscope: a spot that sweeps the screen, and the phosphor that keeps its
 * trail.
 *
 * ## The principle
 *
 * Nothing is drawn: every fragment reconstructs the moment when the spot lit
 * it — in this sweep if it sits behind the spot, in the previous one
 * otherwise — and its intensity is the exponential of that age. The signal is
 * frozen per sweep, as on a real screen: the trail does not move behind the
 * spot, it dies away.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine — copying that here would leave as many
 * versions to maintain as there are backgrounds.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface — it grants only one per
 * backend — and under reduced motion.
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

/** What the escape hatch receives. */
export interface OscilloscopeControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface OscilloscopeOwnProps {
  /** Sweeps per second. @defaultValue 0.5 */
  speed?: number
  /** Decay speed of the phosphor. Lower means more persistence. @defaultValue 1.2 */
  decay?: number
  /** Periods of the signal in the frame. @defaultValue 3 */
  frequency?: number
  /** Height of the signal, as a fraction of the frame. @defaultValue 0.28 */
  amplitude?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<OscilloscopeControls>
}

/** All props. */
export type OscilloscopeProps = Customisable<OscilloscopeOwnProps>

/** Tokens used by default: the background, the graticule, the phosphor. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-green-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
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
    // A thin trail at reduced pixel density shimmers: at low quality the
    // phosphor dies away faster, and the persistence — the part that
    // shimmers — shortens by just as much.
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
