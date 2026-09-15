/**
 * Ripple distortion under the pointer, behind a content.
 *
 * ## What this component deforms, and what it does not
 *
 * It does **not** deform the content it wraps. A shader cannot read the
 * document: twisting text or a card would require capturing them as an image,
 * which fails on remote fonts and cross origins — filter deformation exists
 * for that case, and it is another component.
 *
 * What is deformed here is a surface painted by the shader, laid **under** the
 * content. The text stays crisp, selectable and readable; it is the ground
 * that ripples beneath it.
 *
 * ## Why the pointer goes through a uniform mutated in place
 *
 * The position changes on every frame. Carrying it in React state would mean
 * sixty renders per second to move a wave centre that the shader reads on its
 * own. The damped pointer hook therefore writes its value inside the loop, and
 * a stable array — never rebuilt — passes it to the surface, which reads its
 * uniforms again on every frame.
 *
 * The damping is not an ornament: without it, a fast movement makes the centre
 * jump from one end of the area to the other, and the rings break instead of
 * following.
 *
 * ## The fallback is not a precaution
 *
 * It is displayed while the backend loads, when WebGL is missing, when the
 * arbiter refuses the surface, and under reduced motion. It reuses the same
 * tokens, in frozen rings: what disappears is the rippling, not the decor.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
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
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import { RIPPLE_DISTORTION_FRAGMENT } from './ripple-distortion.shader.js'

/** What the escape hatch receives. */
export interface RippleDistortionControls {
  /** Colours actually passed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to the component. */
export interface RippleDistortionOwnProps {
  /** Content laid over the surface. It stays crisp. */
  children: ReactNode
  /** Propagation speed of the waves. @defaultValue 1 */
  speed?: number
  /** Tightness of the waves and of the bands. @defaultValue 26 */
  scale?: number
  /** Amplitude of the lookup offset. @defaultValue 0.5 */
  amount?: number
  /** Catch-up speed of the pointer. The higher, the snappier. @defaultValue 3 */
  damping?: number
  /** Tokens of the trough of the bands, of their crest, then of the sheen. */
  colors?: readonly [string, string, string]
  /** Classes of the fallback, in place of the frozen rings derived from the tokens. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<RippleDistortionControls>
}

/** All properties. */
export type RippleDistortionProps = Customisable<RippleDistortionOwnProps>

/** Tokens used by default: trough, crest, then sheen. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-surface',
  '--o-palette-brand-500',
] as const

/**
 * Default fallback: the same rings, motionless and with no source.
 *
 * What must disappear is the rippling, not the decor: a flat fill would erase
 * the pattern for everyone who receives the fallback, when only its setting in
 * motion is at issue.
 *
 * @param colors Tokens of the trough, of the crest, then of the sheen.
 * @param scale Tightness of the waves, from which the ring pitch is derived.
 */
function staticRings(
  colors: readonly [string, string, string],
  scale: number,
): CSSProperties {
  const pitch = Math.max(8, Math.round(700 / Math.max(scale, 1)))

  return {
    backgroundColor: `var(${colors[0]})`,
    backgroundImage:
      `repeating-radial-gradient(circle at 50% 50%,` +
      ` var(${colors[1]}) 0 ${String(pitch)}px,` +
      ` transparent ${String(pitch)}px ${String(pitch * 2)}px)`,
  }
}

/**
 * Tightness on low quality.
 *
 * The cost does not come from the tightness — every fragment does the same
 * work — but waves that are too fine shimmer as soon as the pixel density is
 * capped.
 */
const LOW_SCALE = 18

/**
 * Ripples a surface under its content, around the pointer.
 *
 * @example
 * <RippleDistortion className="o-rounded-xl o-p-10">
 *   <h2>Move the mouse over</h2>
 * </RippleDistortion>
 *
 * @example
 * // Wide and slow waves, with no brand sheen.
 * <RippleDistortion
 *   scale={12}
 *   speed={0.4}
 *   colors={['--o-theme-bg', '--o-theme-line', '--o-theme-muted']}
 * >
 *   <section className="o-p-8">…</section>
 * </RippleDistortion>
 */
export function RippleDistortion({
  children,
  speed = 1,
  scale = 26,
  amount = 0.5,
  damping = 3,
  colors = DEFAULT_TOKENS,
  fallback,
  onReady,
  ...rest
}: RippleDistortionProps): ReactElement {
  const { quality, reduced } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const [colours, setColours] = useState<readonly ShaderColour[]>([])

  const pointer = usePointerDamped({ host, speed: damping, name: 'ripples : pointer' })

  // Stable array, mutated in place: rebuilding the uniform on every frame
  // would also rebuild the uniform table of the surface.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // The hook returns a position centred on zero, with the vertical axis
        // pointing down; vUv has its origin at the bottom left.
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      // After the inputs are read, before the render of the same frame.
      { priority: CLOCK_PRIORITY.layout, name: 'ripples : centre' },
    )

    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  // The tokens enter by their text, never by the identity of the array: a
  // literal passed as a prop would build a new one on every render, and the
  // effect that depended on it would never stop.
  const tokenList = colors.join(' ')

  useEffect(() => {
    if (host === null) return
    setColours(tokenList.split(' ').map((token) => readTokenColour(token, host)))
    // The motion policy follows the theme: its switch reads the tokens again.
  }, [host, tokenList, reduced, quality])

  const uniforms = useMemo(() => {
    const [a, b, c] = colours
    if (a === undefined || b === undefined || c === undefined) return undefined

    return {
      uColorA: a,
      uColorB: b,
      uColorC: c,
      uPointer,
      uSpeed: speed,
      uScale: quality === 'low' ? LOW_SCALE : scale,
      uAmount: amount,
    }
  }, [colours, uPointer, speed, scale, amount, quality])

  const { ref, ready, refused } = useShaderSurface<HTMLDivElement>({
    fragment: RIPPLE_DISTORTION_FRAGMENT,
    // With no colours read, the shader would paint black: the fallback covers
    // that instant better.
    uniforms: uniforms ?? {},
    name: 'ripples',
  })

  useOnReady(onReady, ready ? { colours, refused } : null, host)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const showFallback = !ready || refused !== undefined || uniforms === undefined

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      {/* The surface is laid under the content, and intercepts nothing. */}
      <div
        aria-hidden
        ref={ref}
        className="o-absolute o-inset-0 o-pointer-events-none"
        style={{ borderRadius: 'inherit', overflow: 'hidden' }}
      >
        {showFallback ? (
          <div
            className={`o-absolute o-inset-0 ${fallback ?? ''}`}
            style={fallback === undefined ? staticRings(colors, scale) : undefined}
          />
        ) : null}
      </div>

      <div className="o-relative">{children}</div>
    </div>
  )
}
