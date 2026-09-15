/**
 * Caustics: the web of light on the floor of a pool, imitated by successive folds.
 *
 * ## The principle
 *
 * Five folds of space by the sine of its own coordinates. The accumulated distance draws filaments where the rays would converge.
 *
 * The exponent applied at the end is what separates a crisp filament from a halo of fog.
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
  CAUSTICS_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface CausticsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface CausticsOwnProps {
  /** Web speed. @defaultValue 0.5 */
  speed?: number
  /** Web scale. @defaultValue 4 */
  scale?: number
  /** Light strength. @defaultValue 1 */
  intensity?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<CausticsControls>
}

/** Every property. */
export type CausticsProps = Customisable<CausticsOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-sky-200'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-sky-950 o-to-zinc-200 dark:o-to-sky-800'

/**
 * Caustics.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Caustics className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Caustics({
  speed = 0.5,
  scale = 4,
  intensity = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CausticsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CAUSTICS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uIntensity: intensity },
    name: 'caustics',
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
