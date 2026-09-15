/**
 * Grid under a lens: a grid that a magnifier enlarges wherever the pointer
 * passes.
 *
 * ## What this background reacts to
 *
 * To pointer movement, with damping: the lens catches up with the cursor
 * smoothly, and the grid dilates beneath it. On leaving the frame, the hook
 * brings the target back to the centre and the lens returns to it.
 *
 * What sets this entry apart from `magnet-grid`: that one moves points; here
 * they are continuous lines, and they bend as though under glass. And from
 * `ripple-grid`: there the wave is radial and temporal, with no pointer.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: the component mutates a stable array in place
 * passed as a uniform, and the surface re-reads its uniforms every frame. The
 * copy happens inside the engine loop, at input priority.
 *
 * ## Under reduced motion
 *
 * The surface is refused by the engine and the static fallback shows: the
 * pointer tracking is a nicety, not content.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import { GRID_DISTORTION_FRAGMENT } from './grid-distortion.shader.js'

/** What the escape hatch receives. */
export interface GridDistortionControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface GridDistortionOwnProps {
  /** Number of cells across the height. Capped at sixty by the shader. @defaultValue 16 */
  cells?: number
  /** Magnification strength, between zero and one. @defaultValue 0.55 */
  strength?: number
  /** Lens radius, in frame heights. @defaultValue 0.3 */
  radius?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<GridDistortionControls>
}

/** Every property. */
export type GridDistortionProps = Customisable<GridDistortionOwnProps>

/** Tokens used by default: the background, the lines, the lens rim. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-brand-500',
] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Grid under a lens.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GridDistortion className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GridDistortion({
  cells = 16,
  strength = 0.55,
  radius = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GridDistortionProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads the uniforms every
  // frame, the identity never changes, mutating is enough — no setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({
    host,
    speed: 4,
    name: 'grid under lens : pointer',
  })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame (centred, y downwards) to the texture's frame
        // (bottom-left corner, y upwards).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'grid under lens : bridge' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: GRID_DISTORTION_FRAGMENT,
    colors,
    uniforms: { uPointer, uCells: cells, uStrength: strength, uRadius: radius },
    name: 'grid-distortion',
    // A tight grid shimmers along its lines at reduced pixel density: at
    // low quality, the cells widen.
    degrade: (quality) => ({
      uCells: quality === 'low' ? Math.min(cells, 10) : cells,
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
        setShaderHost(element)
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
