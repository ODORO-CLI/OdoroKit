/**
 * Animated background: a dot pattern that reveals itself from the centre.
 *
 * ## A single surface, for the outward pass as well as the return
 *
 * The implementation this component draws on mounted **two** canvases — one
 * for the reveal, one for its inverse — and cross-faded them over two seconds.
 * That cannot work here, and the failure mode is worth knowing: the surface
 * arbiter grants only one context per library, so the second canvas would be
 * refused and would show its fallback. The transition would not be visible,
 * and nothing would report it.
 *
 * The direction is therefore a **uniform**, not a second mount. `uPhase` holds
 * the time at which the direction changed: without it, the inversion would
 * pick up absolute time, where the animation finished long ago, and the return
 * would be instantaneous.
 *
 * It is also cheaper — one context instead of two — and the cross-fade is
 * exact, since there is nothing to cross-fade.
 *
 * ## The colours come from the palette
 *
 * Three tokens: two dot hues and the background. The surface is allocated
 * without an alpha channel, so the background belongs to the render and cannot
 * be left to a class placed behind it.
 *
 * ## The fallback is not a precaution
 *
 * It is shown while the backend loads, when WebGL is missing, when the arbiter
 * refuses the surface, and under reduced motion — where an animated background
 * brings nothing but its motion.
 *
 * @module
 */

import {
  clock,
  mergePresentation,
  readTokenColour,
  useMotionState,
  useOnReady,
  useShaderSurface,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

import { DOT_MATRIX_FRAGMENT } from './dot-matrix.shader.js'

/** What the escape hatch receives. */
export interface DotMatrixControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Time at which the current phase started, in seconds. */
  readonly phase: number
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface DotMatrixOwnProps {
  /**
   * Direction of the reveal. `false` lights the dots up from the centre;
   * `true` puts them out from the edges.
   *
   * Changing it restarts the animation: this is a transition, not a state.
   *
   * @defaultValue false
   */
  reverse?: boolean
  /** Propagation speed of the front. @defaultValue 0.6 */
  speed?: number
  /** Number of cells along the shorter side. @defaultValue 42 */
  cells?: number
  /** Dot side, as a fraction of the cell. @defaultValue 0.3 */
  dot?: number
  /** Share of twinkle, from 0 to 1. @defaultValue 0.7 */
  flicker?: number
  /** Tokens for the two dot hues and the background. */
  colors?: readonly [string, string, string]
  /**
   * Fallback classes, in place of the frozen pattern derived from the tokens.
   *
   * Without them, the fallback reuses the same pattern, motionless.
   */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<DotMatrixControls>
}

/** Every property. */
export type DotMatrixProps = Customisable<DotMatrixOwnProps>

/** Tokens used by default: the two dot hues, then the background. */
const DEFAULT_TOKENS = ['--o-theme-fg', '--o-theme-muted', '--o-theme-bg'] as const

/**
 * Default fallback: the same pattern, motionless.
 *
 * ## Why not a flat fill
 *
 * A flat colour would be shorter to write, and it would erase the pattern for
 * everyone who receives the fallback — without WebGL, under reduced motion, on
 * a refused surface. Yet the dots are not motion: only their appearance is.
 * What has to go is the reveal, not the drawing.
 *
 * The pattern is therefore rebuilt as a repeated radial gradient, from the
 * same tokens as the shader. It follows the theme, and the mesh follows
 * `cells`.
 *
 * @param colors Tokens for the two dot hues, then the background.
 * @param cells Number of cells along the shorter side.
 * @param dot Dot side, as a fraction of the cell.
 */
function staticPattern(
  colors: readonly [string, string, string],
  cells: number,
  dot: number,
): CSSProperties {
  // The mesh is expressed in pixels for want of expressing it as a fraction of
  // the shorter side: `background-size` in percent refers to each axis
  // separately, which would make the dots oval. A thousand pixels is a
  // plausible reference width, and the gap with the WebGL render is invisible
  // on a pattern nobody ever compares side by side.
  const pitch = Math.max(4, Math.round(1000 / Math.max(cells, 1)))
  const radius = Math.max(2, Math.min(48, dot * 50))

  return {
    backgroundColor: `var(${colors[2]})`,
    backgroundImage:
      `radial-gradient(` +
      `color-mix(in oklch, var(${colors[0]}) 45%, transparent) ${String(radius)}%,` +
      ` transparent ${String(radius + 1)}%)`,
    backgroundSize: `${String(pitch)}px ${String(pitch)}px`,
  }
}

/**
 * Number of cells at low quality.
 *
 * The cost of this shader does not come from the number of cells — every
 * fragment does the same work whatever the mesh — but a coarser pattern
 * reduces the number of edges, and therefore the sampling shimmer on screens
 * whose density has been capped.
 */
const LOW_CELLS = 28

/**
 * Dot pattern revealed from the centre.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <DotMatrix className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 *
 * @example
 * // The direction flips through a prop: the surface itself does not move.
 * const [reversed, setReversed] = useState(false)
 * <DotMatrix reverse={reversed} onReady={() => console.log('pattern ready')} />
 */
export function DotMatrix({
  reverse = false,
  speed = 0.6,
  cells = 42,
  dot = 0.3,
  flicker = 0.7,
  colors = DEFAULT_TOKENS,
  fallback,
  onReady,
  ...rest
}: DotMatrixProps): ReactElement {
  const { quality, reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [colours, setColours] = useState<readonly ShaderColour[]>([])

  // Tokens enter through their text, never through the array identity.
  //
  // `<DotMatrix colors={['--o-palette-red-500', …]} />` builds a fresh array on
  // every render. An effect depending on it would set a state, which would
  // trigger a render, which would build a fresh array: the loop would never
  // stop, and nothing in the signature hints that passing a literal is
  // forbidden. The string, on the other hand, compares by value.
  const tokenList = colors.join(' ')

  // The colours are re-read when the host changes, when the requested tokens
  // change, and when the theme flips — that last case goes through the motion
  // policy, which is renewed on every state change.
  useEffect(() => {
    if (host === null) return
    setColours(tokenList.split(' ').map((token) => readTokenColour(token, host)))
  }, [host, tokenList, reduced, quality])

  // The direction changes: the animation restarts from its beginning, and not
  // from absolute time, where it finished long ago.
  const [phase, setPhase] = useState(() => clock.time)
  useEffect(() => {
    setPhase(clock.time)
  }, [reverse])

  const uniforms = useMemo(() => {
    const [a, b, background] = colours
    if (a === undefined || b === undefined || background === undefined) return undefined

    return {
      uColorA: a,
      uColorB: b,
      uColorBackground: background,
      uCells: quality === 'low' ? LOW_CELLS : cells,
      uDot: dot,
      uSpeed: speed,
      uReverse: reverse ? 1 : 0,
      uPhase: phase,
      uFlicker: flicker,
    }
  }, [colours, quality, cells, dot, speed, reverse, phase, flicker])

  const { ref, ready, refused } = useShaderSurface<HTMLDivElement>({
    fragment: DOT_MATRIX_FRAGMENT,
    // The surface is mounted only once the colours have been read: building it
    // with empty uniforms would paint a black frame before the first
    // correction, which the fallback already covers better.
    uniforms: uniforms ?? {},
    name: 'weave',
  })

  useOnReady(onReady, ready ? { colours, phase, refused } : null, host)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const showFallback = !ready || refused !== undefined || uniforms === undefined

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
      {showFallback ? (
        <div
          className={`o-absolute o-inset-0 ${fallback ?? ''}`}
          style={fallback === undefined ? staticPattern(colors, cells, dot) : undefined}
        />
      ) : null}
    </div>
  )
}
