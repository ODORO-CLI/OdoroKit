/**
 * Moire: two gratings of rings whose product makes beats.
 *
 * ## The principle
 *
 * The product of two sines of distances — one per centre — is bright in
 * phase, dark in opposition: the fringes draw hyperbolas that neither of the
 * two gratings contains.
 *
 * The centres orbit at periods that are not multiples of one another: the
 * figure recomposes endlessly.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine — copying them here would leave as
 * many versions to maintain as there are backgrounds.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface — it grants only one
 * per backend — and under reduced motion.
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

import { INTERFERENCE_FRAGMENT } from './interference.shader.js'

/** What the escape hatch receives. */
export interface InterferenceControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface InterferenceOwnProps {
  /** Orbit speed. @defaultValue 0.15 */
  speed?: number
  /** Number of rings per unit of distance. @defaultValue 24 */
  frequency?: number
  /** Orbit radius, hence the gap between the two centres. @defaultValue 0.25 */
  separation?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<InterferenceControls>
}

/** Every property. */
export type InterferenceProps = Customisable<InterferenceOwnProps>

/** Tokens used by default: the background, then the two tones of the fringes. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-400',
  '--o-palette-cyan-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-fuchsia-950'

/**
 * Moire.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Interference className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Interference({
  speed = 0.15,
  frequency = 24,
  separation = 0.25,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: InterferenceProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: INTERFERENCE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uFrequency: frequency, uSeparation: separation },
    name: 'interference',
    // The computation is constant, but rings that are too tight shimmer
    // with sampling on screens whose density has been capped: the frequency
    // is therefore the setting that gets bounded.
    degrade: (quality) => ({
      uFrequency: quality === 'low' ? Math.min(frequency, 14) : frequency,
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
