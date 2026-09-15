/**
 * Ghost fibers: filaments that drift across the frame and pinch towards
 * the pointer when it passes beneath them.
 *
 * ## What this background reacts to
 *
 * To pointer movement, with damping: level with the cursor, the fibers are
 * pulled towards its ordinate, the more so the closer they are to it in
 * abscissa. The pinch is an interpolation, not a force: the fibers recover
 * their path as soon as the cursor moves away, with no spring and no
 * memory. On leaving the frame, the hook brings the target back to the
 * centre.
 *
 * What sets this entry apart from `strands`: there the locks are anchored at
 * the bottom of the frame and sway, with no pointer. From `threads`: there
 * the bundle is fixed and of constant thickness. And from `web-threads`:
 * that is a web of joined points, in a 3D scene.
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

import { GHOST_FIBERS_FRAGMENT } from './ghost-fibers.shader.js'

/** What the escape hatch receives. */
export interface GhostFibersControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface GhostFibersOwnProps {
  /** Number of fibers. Capped at twelve by the shader. @defaultValue 9 */
  fibers?: number
  /** Strength of the attraction towards the pointer, between zero and one. @defaultValue 0.7 */
  bend?: number
  /** Drift speed of the fibers. @defaultValue 0.6 */
  speed?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<GhostFibersControls>
}

/** Every property. */
export type GhostFibersProps = Customisable<GhostFibersOwnProps>

/** Tokens used by default: the background, the fibers at rest, the pulled fibers. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-cyan-300',
] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-cyan-100 dark:o-via-cyan-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Ghost fibers.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GhostFibers className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GhostFibers({
  fibers = 9,
  bend = 0.7,
  speed = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GhostFibersProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads the uniforms every
  // frame, the identity never changes, mutating is enough — no setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 3.5, name: 'ghost-fibers : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame (centred, y downwards) to the texture's frame
        // (bottom-left corner, y upwards).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'ghost-fibers : bridge' },
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
    fragment: GHOST_FIBERS_FRAGMENT,
    colors,
    uniforms: { uPointer, uFibers: fibers, uBend: bend, uSpeed: speed },
    name: 'ghost-fibers',
    // Each fiber costs two exponentials per fragment: it is the only lever
    // that counts, and it is set by the count.
    degrade: (quality) => ({
      uFibers: quality === 'low' ? Math.min(fibers, 5) : fibers,
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
