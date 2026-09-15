/**
 * Neon edging: a luminous arc that travels around a frame.
 *
 * ## Why a conic gradient is not enough
 *
 * This is the difficulty of the component, and it is not obvious. Rotating a
 * `conic-gradient` around a rectangle gives an arc whose **apparent speed** is
 * not constant: the angle advances evenly, but one degree covers far more edge
 * near the corners of an elongated rectangle than in the middle of a long
 * side. The result races along the short sides and drags along the long ones.
 *
 * The arc is therefore built the other way round. We advance at a constant
 * step **along the perimeter**, convert each sample into an angle as seen from
 * the centre, and make those the stops of the gradient. The correction is made
 * where the distortion is born, and the arc keeps the same edge length
 * everywhere.
 *
 * ## Two movements, and a single path
 *
 * `continuous` slides the arc without a pause. `step` makes it jump from one
 * corner to the next, with a curve that launches it and catches it. These are
 * two ways of computing a position on the perimeter, not two components: all
 * the rest — the construction of the arc, the halo layers — is shared.
 *
 * ## The halo is in three layers
 *
 * A single, blurred one gives a smudge. Three — short and dense, medium, long
 * and diffuse — give the light that spills out of the tube. It is the same
 * principle as a shop sign: the glass, the nearby glow, and the wall behind.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

/** The way the arc travels around the frame. */
export type NeonMovement = 'continuous' | 'step'

/** Properties specific to the component. */
export interface NeonBorderOwnProps {
  /** Radius of the corners, in pixels. @defaultValue 24 */
  radius?: number
  /** Thickness of the stroke, in pixels. @defaultValue 2 */
  thickness?: number
  /** Length of the arc, as a percentage of the half-perimeter. @defaultValue 50 */
  length?: number
  /** Intensity of the halo, from 0 to 100. @defaultValue 100 */
  glow?: number
  /** Movement of the arc. @defaultValue 'continuous' */
  movement?: NeonMovement
  /** Duration of one turn, in milliseconds. @defaultValue 4000 */
  duration?: number
  /** Token of the neon colour. */
  color?: string
}

/** All properties. */
export type NeonBorderProps = Customisable<NeonBorderOwnProps>

/** Token used by default. */
const DEFAULT_TOKEN = '--o-palette-amber-400'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-neon-border'

/** Number of samples of the arc. Beyond that, the curve gains nothing visible. */
const SAMPLES = 24

/** The three layers of the halo: blur, opacity, reach. */
const LAYERS = [
  { blur: 8, alpha: 0.5 },
  { blur: 15, alpha: 0.3 },
  { blur: 57, alpha: 0.18 },
] as const

/** Sets the edging rules, once per document. */
function ensureNeonRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-neon]{position:absolute;inset:0;pointer-events:none;',
    'border-radius:var(--o-neon-radius);padding:var(--o-neon-thickness);',
    // The mask keeps only the crown: the gradient fills the whole frame, and
    // it is this mask that turns it into a stroke rather than a flat fill.
    '-webkit-mask:linear-gradient(black,black) content-box exclude,linear-gradient(black,black);',
    'mask:linear-gradient(black,black) content-box exclude,linear-gradient(black,black);',
    '-webkit-mask-composite:xor;mask-composite:exclude}',

    '[data-o-neon-layer]{position:absolute;inset:0;border-radius:inherit;',
    'background-image:var(--o-neon-arc);',
    'filter:blur(var(--o-neon-blur));opacity:var(--o-neon-alpha)}',
    '[data-o-neon-layer="core"]{filter:none;opacity:1}',
  ].join('')
  document.head.append(style)
}

/**
 * A point on the perimeter of a rectangle, travelled at a constant step.
 *
 * @param u Position around the turn, from 0 to 1.
 */
function perimeterPoint(u: number, w: number, h: number): readonly [number, number] {
  const d = (((u % 1) + 1) % 1) * 2 * (w + h)
  if (d < w) return [d, 0]
  if (d < w + h) return [w, d - w]
  if (d < w * 2 + h) return [w - (d - w - h), h]
  return [0, h - (d - w * 2 - h)]
}

/** The angle under which this point is seen from the centre, in degrees. */
function perimeterAngle(u: number, w: number, h: number): number {
  const [x, y] = perimeterPoint(u, w, h)
  return (Math.atan2(x - w / 2, h / 2 - y) * 180) / Math.PI
}

/** The lap at which corner number `k` sits. */
function cornerLap(k: number, w: number, h: number): number {
  const p = 2 * (w + h)
  const at = [0, w / p, (w + h) / p, (w * 2 + h) / p]
  return Math.floor(k / 4) + (at[((k % 4) + 4) % 4] ?? 0)
}

/**
 * The conic gradient of the arc, at a given position on the perimeter.
 *
 * The stops are sampled **along the edge** and converted into angles: that is
 * what gives the arc the same edge length everywhere, instead of seeing it
 * race along the short sides.
 *
 * Accumulating the gaps, rather than the raw angles, avoids the cut at plus or
 * minus one hundred and eighty degrees, which would produce a flipped arc once
 * per turn.
 */
function buildArc(
  lap: number,
  length: number,
  w: number,
  h: number,
  token: string,
): string {
  const width = w > 0 ? w : 100
  const height = h > 0 ? h : 100
  const span = Math.max(0.015, (Math.max(0, Math.min(100, length)) / 100) * 0.5)
  const solid = length / 100

  const stops: string[] = []
  let base = 0
  let previous = 0
  let total = 0

  for (let index = 0; index <= SAMPLES; index += 1) {
    const f = index / SAMPLES
    const angle = perimeterAngle(lap + (f - 0.5) * span, width, height)

    if (index === 0) base = angle
    else {
      let step = angle - previous
      while (step > 180) step -= 360
      while (step < -180) step += 360
      total += step
    }
    previous = angle

    // The head is full, the tail dies out: without that the arc is a segment
    // that appears and disappears, instead of a light passing by.
    const t = Math.abs(f - 0.5) * 2
    const k = solid >= 1 ? 1 : t <= solid ? 1 : 1 - (t - solid) / (1 - solid)
    const eased = k * k * (3 - 2 * k)
    stops.push(
      `color-mix(in oklch, var(${token}) ${(eased * 100).toFixed(1)}%, transparent)` +
        ` ${total.toFixed(2)}deg`,
    )
  }

  stops.push(`transparent ${total.toFixed(2)}deg`)
  stops.push('transparent 360deg')

  return `conic-gradient(from ${base.toFixed(2)}deg at 50% 50%, ${stops.join(', ')})`
}

/**
 * A one-parameter Bezier curve, solved by Newton.
 *
 * Used for the step movement: the arc must leave fast and settle gently on the
 * next corner, which a linear interpolation does not do.
 */
function ease(t: number): number {
  const x = Math.max(0, Math.min(1, t))
  const bez = (a: number, b: number, u: number): number => {
    const v = 1 - u
    return 3 * v * v * u * a + 3 * v * u * u * b + u * u * u
  }

  let s = x
  for (let index = 0; index < 8; index += 1) {
    const cx = bez(0.72, 0.18, s) - x
    const v = 1 - s
    const dx = 3 * v * v * 0.72 + 6 * v * s * (0.18 - 0.72) + 3 * s * s * (1 - 0.18)
    if (Math.abs(dx) < 1e-6) break
    s = Math.max(0, Math.min(1, s - cx / dx))
  }
  return bez(0.16, 1.05, s)
}

/**
 * Neon edging around a frame.
 *
 * It is laid inside a positioned parent, which it fills.
 *
 * @example
 * <div className="o-relative o-rounded-2xl o-p-8">
 *   <NeonBorder radius={16} />
 *   <p>The content, on top.</p>
 * </div>
 *
 * @example
 * // By steps: the arc jumps from one corner to the next.
 * <NeonBorder movement="step" duration={2400} color="--o-palette-sky-400" />
 */
export function NeonBorder({
  radius = 24,
  thickness = 2,
  length = 50,
  glow = 100,
  movement = 'continuous',
  duration = 4000,
  color = DEFAULT_TOKEN,
  ...rest
}: NeonBorderProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  ensureNeonRules()

  // The colour is never read: the token goes into the gradient as it is, and
  // therefore follows the theme without any effect having to read it back.
  useEffect(() => {
    if (host === null) return

    let width = host.clientWidth
    let height = host.clientHeight

    const paint = (lap: number): void => {
      host.style.setProperty('--o-neon-arc', buildArc(lap, length, width, height, color))
    }

    // Measure first: the arc depends on the proportions of the frame, and a
    // frame that changes shape without a new measurement would see its
    // correction become wrong.
    const measure = (): void => {
      width = host.clientWidth
      height = host.clientHeight
    }
    measure()

    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
    observer?.observe(host)

    // Under reduced motion, the arc is laid once and no longer moves: the
    // frame keeps its edging, it does not turn.
    if (reduced) {
      paint(0)
      return () => observer?.disconnect()
    }

    const seconds = Math.max(0.2, duration / 1000)
    const subscription = clock.subscribe(
      ({ time }) => {
        const turns = time / seconds
        if (movement === 'continuous') {
          paint(turns)
          return
        }
        // By steps: the integer part names the corner reached, the fraction
        // the journey towards the next, smoothed by the curve.
        const index = Math.floor(turns * 4)
        const from = cornerLap(index, width, height)
        const to = cornerLap(index + 1, width, height)
        paint(from + (to - from) * ease((turns * 4) % 1))
      },
      { name: 'neon', priority: CLOCK_PRIORITY.render },
    )

    return () => {
      subscription.unsubscribe()
      observer?.disconnect()
    }
  }, [host, color, length, movement, duration, reduced])

  const { className, style } = mergePresentation({ className: '' }, rest)

  const intensity = Math.max(0, Math.min(100, glow)) / 100

  return (
    <div
      {...rest}
      ref={setHost}
      data-o-neon
      aria-hidden
      className={className}
      style={
        {
          '--o-neon-radius': `${String(radius)}px`,
          '--o-neon-thickness': `${String(thickness)}px`,
          ...style,
        } as CSSProperties
      }
    >
      {LAYERS.map((layer) => (
        <span
          key={layer.blur}
          data-o-neon-layer
          style={
            {
              '--o-neon-blur': `${String(layer.blur)}px`,
              '--o-neon-alpha': String(layer.alpha * intensity),
            } as CSSProperties
          }
        />
      ))}
      {/* The tube itself, crisp, over its three halos. */}
      <span data-o-neon-layer="core" />
    </div>
  )
}
