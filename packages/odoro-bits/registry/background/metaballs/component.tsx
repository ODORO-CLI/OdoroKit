/**
 * Metaballs: gel balls merging, one of which follows the pointer.
 *
 * ## The principle
 *
 * A sum of fields in r2/d2, thresholded: two balls drawing near join through a
 * neck before merging. What makes the gel rather than the flat wash is the
 * gradient of the field taken as the normal — a diffuse, a highlight, a light
 * rim where the surface lies down.
 *
 * ## What this background reacts to
 *
 * To the pointer moving, with damping: one extra ball follows it and merges
 * with those it crosses. On leaving the frame, the hook brings the target back
 * to the centre — the ball returns there on its own.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: the component mutates in place a stable array
 * passed as a uniform, and the surface re-reads its uniforms every frame. The
 * copy happens in the engine loop, at input priority.
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

import { METABALLS_FRAGMENT } from './metaballs.shader.js'

/** What the escape hatch receives. */
export interface MetaballsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface MetaballsOwnProps {
  /** Speed at which the balls drift. @defaultValue 0.3 */
  speed?: number
  /** Number of free balls. @defaultValue 7 */
  count?: number
  /** Threshold of the field. Lower means more matter. @defaultValue 1 */
  threshold?: number
  /** Strength of the highlight. @defaultValue 0.7 */
  gloss?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<MetaballsControls>
}

/** All props. */
export type MetaballsProps = Customisable<MetaballsOwnProps>

/** Tokens used by default: the background, the gel, the highlight. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-brand-500', '--o-theme-fg'] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-brand-200 dark:o-via-brand-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Number of balls at low quality.
 *
 * Every ball is paid for three times — one sum for the matter, two for the
 * normal. It is the only cost lever of the shader.
 */
const LOW_COUNT = 4

/**
 * Metaballs.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Metaballs className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Metaballs({
  speed = 0.3,
  count = 7,
  threshold = 1,
  gloss = 0.7,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MetaballsProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads the uniforms every
  // frame, the identity does not change, the mutation is enough — no setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 3, name: 'metaballs : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame (centred, y downwards) to the texture's
        // (bottom-left corner, y upwards).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'metaballs : bridge' },
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
    fragment: METABALLS_FRAGMENT,
    colors,
    uniforms: {
      uPointer,
      uSpeed: speed,
      uCount: count,
      uThreshold: threshold,
      uGloss: gloss,
    },
    name: 'metaballs',
    // The number of balls is the only setting that weighs: it is the only bound.
    degrade: (quality) => ({
      uCount: quality === 'low' ? Math.min(count, LOW_COUNT) : count,
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
