/**
 * Field lines: the circles of a dipole, one pole of which the pointer moves.
 *
 * ## What this background reacts to
 *
 * To the pointer moving, with damping: the second pole strays from its place at
 * the pace of the cursor, and every line redraws itself around it — they are
 * computed, not stored. On leaving the frame, the hook brings the target back
 * to the centre and the pole returns.
 *
 * What sets this entry apart from `magnet-grid`: that one moves aside the dots
 * of a grid; here there is no grid, only the continuous lines of the field,
 * sliding from one pole to the other.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: the damped position is copied into a stable array
 * by a subscription to the engine clock, and the surface re-reads its uniforms
 * every frame — the mutation is enough.
 *
 * ## Under reduced motion
 *
 * The surface is refused by the engine and the static fallback is shown.
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

import { MAGNETIC_LINES_FRAGMENT } from './magnetic-lines.shader.js'

/** What the escape hatch receives. */
export interface MagneticLinesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface MagneticLinesOwnProps {
  /** Number of field lines per turn. @defaultValue 16 */
  lines?: number
  /** Half-distance of the poles, in frame heights. @defaultValue 0.35 */
  spread?: number
  /** Speed at which the lines slide along the field. @defaultValue 0.15 */
  speed?: number
  /** Also draws the equipotentials. @defaultValue true */
  potential?: boolean
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<MagneticLinesControls>
}

/** All props. */
export type MagneticLinesProps = Customisable<MagneticLinesOwnProps>

/** Tokens used by default: the background, the lines, the poles. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-rose-400',
  '--o-palette-amber-300',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Field lines.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <MagneticLines className="o-absolute o-inset-0" potential={false} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function MagneticLines({
  lines = 16,
  spread = 0.35,
  speed = 0.15,
  potential = true,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MagneticLinesProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place in the loop: no setState per frame.
  const uPointer = useRef<number[]>([0, 0]).current

  const pointer = usePointerDamped({ host, speed: 3, name: 'magnetic-lines : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // The shader receives the hook's frame as is: centred, y downwards.
        uPointer[0] = pointer.current.x
        uPointer[1] = pointer.current.y
      },
      { priority: CLOCK_PRIORITY.input, name: 'magnetic-lines : bridge' },
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
    fragment: MAGNETIC_LINES_FRAGMENT,
    colors,
    uniforms: {
      uPointer,
      uLines: lines,
      uSpread: spread,
      uSpeed: speed,
      uPotential: potential ? 1 : 0,
    },
    name: 'magnetic-lines',
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
