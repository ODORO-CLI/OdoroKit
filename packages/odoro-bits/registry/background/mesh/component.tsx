/**
 * Mesh: three colour blots drifting and blending.
 *
 * ## What this component brings, and what it delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, converting them to floats and re-reading them
 * when the theme changes all come from the engine — copying that here would
 * leave as many versions to maintain as there are backgrounds.
 *
 * ## The fallback is not a precaution
 *
 * It is half the component. It is shown while the backend loads, when WebGL is
 * missing, when the arbiter refuses the surface — it grants only one per
 * backend — and under reduced motion, where an animated background brings
 * nothing but its motion.
 *
 * @module
 */

import {
  MESH_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface MeshControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface MeshOwnProps {
  /** Speed at which the blots drift. @defaultValue 0.2 */
  speed?: number
  /** Extent of the blots. @defaultValue 0.55 */
  spread?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<MeshControls>
}

/** All props. */
export type MeshProps = Customisable<MeshOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-brand-800 o-via-fuchsia-800 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Mesh: three colour blots drifting and blending.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Mesh className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Mesh({
  speed = 0.2,
  spread = 0.55,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MeshProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: MESH_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: spread },
    name: 'sheet',
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
