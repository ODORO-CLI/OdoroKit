/**
 * Sonar: concentric pulses widening out from the pointer.
 *
 * ## What this background reacts to
 *
 * To the pointer moving, with damping: the point of emission catches up with
 * the cursor smoothly, and the rings follow — they do not remember their
 * origin. On leaving the frame, the hook brings the target back to the centre
 * and the sonar returns there on its own.
 *
 * What sets this entry apart from `click-waves`: the emission is continuous and
 * follows the pointer, where the other one dates every click and leaves its
 * rings at the exact point of the press.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: the component mutates in place a stable array
 * passed as a uniform, and the surface re-reads its uniforms every frame. The
 * copy happens in the engine loop, at input priority.
 *
 * ## Under reduced motion
 *
 * The surface is refused by the engine and the static fallback is shown:
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

import { SONAR_FRAGMENT } from './sonar.shader.js'

/** What the escape hatch receives. */
export interface SonarControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface SonarOwnProps {
  /** Speed at which the pulses propagate. @defaultValue 0.8 */
  speed?: number
  /** Rings per frame height. @defaultValue 6 */
  spacing?: number
  /** Rate of fading with the distance. @defaultValue 1.6 */
  fade?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<SonarControls>
}

/** All props. */
export type SonarProps = Customisable<SonarOwnProps>

/** Tokens used by default: the background, the rings, the front of the pulses. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-emerald-500',
  '--o-palette-emerald-200',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-emerald-950'

/**
 * Sonar.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Sonar className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Sonar({
  speed = 0.8,
  spacing = 6,
  fade = 1.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SonarProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads the uniforms every
  // frame, the identity does not change, the mutation is enough — no setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 3, name: 'sonar : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame (centred, y downwards) to the texture's
        // (bottom-left corner, y upwards).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'sonar : bridge' },
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
    fragment: SONAR_FRAGMENT,
    colors,
    uniforms: { uPointer, uSpeed: speed, uSpacing: spacing, uFade: fade },
    name: 'sonar',
    // Tight rings at a reduced pixel density shimmer on their front: at low
    // quality, they spread out.
    degrade: (quality) => ({
      uSpacing: quality === 'low' ? Math.min(spacing, 4) : spacing,
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
