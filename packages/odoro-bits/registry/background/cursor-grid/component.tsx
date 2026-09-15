/**
 * Cursor grid: a sheet of tiles that light up around the pointer and keep
 * the trace of its passage.
 *
 * ## What this background reacts to
 *
 * To pointer movement, through two positions rather than one: the live one,
 * damped short, lights the nearby tiles; the lagged one, a second damping
 * laid over the first, leaves a broader and duller trail behind the
 * gesture. Two positions are enough where a history buffer would otherwise
 * be needed.
 *
 * What sets this entry apart from `magnet-grid`: that one moves points,
 * here nothing moves — tiles light up. From `grid-distortion`: there the
 * grid is magnified by a lens, not lit. And from `tiles-flip`, where the
 * tiles turn over.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: two stable arrays passed as uniforms are
 * mutated in place inside the engine loop, at input priority. The surface
 * re-reads its uniforms every frame.
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

import { CURSOR_GRID_FRAGMENT } from './cursor-grid.shader.js'

/** What the escape hatch receives. */
export interface CursorGridControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface CursorGridOwnProps {
  /** Number of cells across the height. Capped at forty-eight by the shader. @defaultValue 14 */
  cells?: number
  /** Reach of the lighting, in frame heights. @defaultValue 0.28 */
  radius?: number
  /** Strength of the trail left by the gesture. @defaultValue 0.7 */
  trail?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<CursorGridControls>
}

/** Every property. */
export type CursorGridProps = Customisable<CursorGridOwnProps>

/** Tokens used by default: the background, the line and the trail, the live tiles. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-line', '--o-palette-sky-400'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Catch-up speed of the lagged position, in units per second.
 *
 * Far slower than that of the live pointer: it is the gap between the two
 * that draws the trail.
 */
const ECHO_SPEED = 1.6

/**
 * Cursor grid.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <CursorGrid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function CursorGrid({
  cells = 14,
  radius = 0.28,
  trail = 0.7,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CursorGridProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable arrays, mutated in place: the surface re-reads the uniforms every
  // frame, the identity never changes, mutating is enough.
  const uPointer = useRef<number[]>([0.5, 0.5]).current
  const uEcho = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 6, name: 'cursor-grid : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ delta }) => {
        // From the hook's frame (centred, y downwards) to the texture's frame
        // (bottom-left corner, y upwards).
        const x = (pointer.current.x + 1) / 2
        const y = 1 - (pointer.current.y + 1) / 2
        uPointer[0] = x
        uPointer[1] = y

        // Second damping, laid over the first. The fraction depends on the elapsed
        // time: the lag is the same at any display rate.
        const factor = 1 - Math.exp(-ECHO_SPEED * delta)
        const ex = uEcho[0] ?? x
        const ey = uEcho[1] ?? y
        uEcho[0] = ex + (x - ex) * factor
        uEcho[1] = ey + (y - ey) * factor
      },
      { priority: CLOCK_PRIORITY.input, name: 'cursor-grid : bridge' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer, uEcho])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: CURSOR_GRID_FRAGMENT,
    colors,
    uniforms: { uPointer, uEcho, uCells: cells, uRadius: radius, uTrail: trail },
    name: 'cursor-grid',
    // A tight grid shimmers on its lines at reduced pixel density: at low
    // quality the tiles grow wider.
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
