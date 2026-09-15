/**
 * Hyperspace: shooting stars towards the camera, stretched by the speed.
 *
 * ## The principle
 *
 * The frame is read in polar coordinates from its vanishing point, and the
 * distance as a logarithm: a cell of constant length there is tiny at the
 * centre and wide at the edge, which is the perspective of an object rushing
 * towards the eye. The trail lengthens with the speed — dots at a standstill,
 * strokes at full speed.
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

import { HYPERSPACE_FRAGMENT } from './hyperspace.shader.js'

/** What the escape hatch receives. */
export interface HyperspaceControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface HyperspaceOwnProps {
  /** Speed of the rush towards the camera. @defaultValue 1 */
  speed?: number
  /** Number of rays around one turn. @defaultValue 64 */
  density?: number
  /** Extra lengthening of the trails, beyond what the speed gives. @defaultValue 1 */
  stretch?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<HyperspaceControls>
}

/** Every property. */
export type HyperspaceProps = Customisable<HyperspaceOwnProps>

/** Tokens used by default: the background, the body of the trails, their head. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-indigo-300', '--o-theme-fg'] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-indigo-200 dark:o-to-indigo-950'

/**
 * Layers outside low quality.
 *
 * Each layer is a family of rays evaluated per fragment: it is the only cost
 * lever, and the third layer is the faintest.
 */
const LAYERS = 3

/** Layers at low quality. */
const LOW_LAYERS = 2

/**
 * Hyperspace.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Hyperspace className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Hyperspace({
  speed = 1,
  density = 64,
  stretch = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: HyperspaceProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: HYPERSPACE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uStretch: stretch, uLayers: LAYERS },
    name: 'hyperspace',
    degrade: (quality) => ({ uLayers: quality === 'low' ? LOW_LAYERS : LAYERS }),
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
