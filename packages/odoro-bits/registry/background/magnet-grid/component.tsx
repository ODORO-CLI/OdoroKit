/**
 * Magnetic grid: dots pushed away — or pulled in — by the cursor.
 *
 * ## What this background reacts to
 *
 * To the pointer moving, with damping: every dot of the grid moves away from
 * the cursor by a force exponential in the distance, or moves towards it when
 * `attract` is true. The displacement is computed entirely in the shader: no
 * geometry, no element of the document.
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

import { MAGNET_GRID_FRAGMENT } from './magnet-grid.shader.js'

/** What the escape hatch receives. */
export interface MagnetGridControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface MagnetGridOwnProps {
  /** Number of dots per frame height. @defaultValue 18 */
  density?: number
  /** Reach of the magnet, in frame heights. @defaultValue 0.25 */
  radius?: number
  /** Amplitude of the dot offset. @defaultValue 0.6 */
  force?: number
  /** Attracts the dots instead of repelling them. @defaultValue false */
  attract?: boolean
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<MagnetGridControls>
}

/** All props. */
export type MagnetGridProps = Customisable<MagnetGridOwnProps>

/** Tokens used by default: the background, the dots, the excited dots. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-indigo-400',
  '--o-palette-sky-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-slate-950 o-to-zinc-50 dark:o-to-indigo-950'

/**
 * Magnetic grid.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <MagnetGrid className="o-absolute o-inset-0" attract />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function MagnetGrid({
  density = 18,
  radius = 0.25,
  force = 0.6,
  attract = false,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MagnetGridProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place in the loop: no setState per frame.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 4, name: 'magnet-grid : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame (centred, y downwards) to the texture's.
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'magnet-grid : bridge' },
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
    fragment: MAGNET_GRID_FRAGMENT,
    colors,
    uniforms: {
      uPointer,
      uDensity: density,
      uRadius: radius,
      uForce: force,
      uAttract: attract ? 1 : 0,
    },
    name: 'magnet-grid',
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
