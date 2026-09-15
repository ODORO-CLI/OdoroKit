/**
 * DNA helix: two strands of dots turn around each other, linked by rungs that
 * stretch and draw together.
 *
 * ## A helix seen from the side is a sine, and a depth
 *
 * Each dot turns on a circle seen edge-on: its height is a sine of time, and
 * its distance from the eye a cosine. The second is not a detail: it is what
 * makes it read as a helix rather than two waves crossing. A dot passing in
 * front is large and solid, a dot passing behind is small and pale, and the
 * stacking order changes as it goes by — otherwise the dot behind would cover
 * the one in front at every crossing.
 *
 * A single animation, sampled every thirty degrees, linearly: an easing curve
 * cannot serve both the sine of the height and the cosine of the depth, so the
 * sine is traced by points, close enough together that the eye does not see
 * the segments. Each column plays the same animation with a phase offset; the
 * second strand is a half turn behind the first; the rung between the two is
 * as long as their spread, that is to say the absolute value of the same sine.
 *
 * The phases are set negative: the helix is complete from the first frame, and
 * its shape at rest — computed here, column by column — is exactly one frame of
 * its movement.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The strands are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the helix stays frozen in its shape: every dot keeps
 * the height and the depth of its phase, and the figure still reads as a
 * helix.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-dna-loader'

/** Amplitude of the height, in dot diameters. */
const AMPLITUDE = 1.6

/** Samples per turn: one every thirty degrees. */
const STEPS = 12

/** What a dot shows at a given phase. */
interface Pose {
  /** Height, as a share of the amplitude. */
  readonly y: number
  /** Scale: full in front, reduced behind. */
  readonly scale: number
  /** Opacity: full in front, faded behind. */
  readonly opacity: number
  /** Stacking order: in front of or behind the rung. */
  readonly layer: number
}

/** Position of a dot at a phase, in radians. */
function poseAt(phase: number): Pose {
  const depth = Math.cos(phase)
  // The dot is in front over the half turn centred on phase zero; the switch
  // falls between two samples, not on one.
  const degrees = ((((phase * 180) / Math.PI) % 360) + 360) % 360
  return {
    y: Math.sin(phase),
    scale: 0.75 + 0.25 * depth,
    opacity: 0.7 + 0.3 * depth,
    layer: degrees < 105 || degrees >= 285 ? 2 : 1,
  }
}

/** Sets up the strands, the rungs and their rotation, once per document. */
function ensureDnaRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const turn = Array.from({ length: STEPS + 1 }, (_, step) => {
    const pose = poseAt((2 * Math.PI * step) / STEPS)
    return `${((step * 100) / STEPS).toFixed(3)}%{transform:translateY(calc(var(--o-dna-amp) * ${pose.y.toFixed(3)})) scale(${pose.scale.toFixed(3)});opacity:${pose.opacity.toFixed(3)};z-index:${String(pose.layer)}}`
  })
  const rung = Array.from({ length: STEPS + 1 }, (_, step) => {
    const length = Math.abs(Math.sin((2 * Math.PI * step) / STEPS))
    return `${((step * 100) / STEPS).toFixed(3)}%{transform:scaleY(${length.toFixed(3)})}`
  })

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dna-loader]{',
    'display:inline-flex;align-items:center;',
    'gap:calc(var(--o-dna-size) * 0.7);',
    `height:calc(var(--o-dna-size) * ${String(2 * AMPLITUDE + 1)});`,
    '}',
    '[data-o-dna-pair]{',
    'position:relative;width:var(--o-dna-size);height:100%;',
    '}',
    // The rung is centred and stretches from its middle: its two ends follow
    // the two dots.
    '[data-o-dna-rung]{',
    'position:absolute;left:50%;top:50%;',
    'width:calc(var(--o-dna-size) * 0.18);',
    `height:calc(var(--o-dna-size) * ${String(2 * AMPLITUDE)});`,
    'margin-left:calc(var(--o-dna-size) * -0.09);',
    `margin-top:calc(var(--o-dna-size) * ${String(-AMPLITUDE)});`,
    'background:var(--o-dna-color);opacity:0.35;',
    'transform:scaleY(var(--o-dna-rung));',
    'animation:o-dna-loader-rung var(--o-dna-speed) linear infinite;',
    'animation-delay:var(--o-dna-delay);',
    '}',
    // At rest, each dot holds its phase pose; in motion, the animation
    // replaces it frame by frame.
    '[data-o-dna-dot]{',
    'position:absolute;left:0;top:50%;',
    'width:var(--o-dna-size);height:var(--o-dna-size);',
    'margin-top:calc(var(--o-dna-size) * -0.5);',
    'border-radius:50%;background:var(--o-dna-color);',
    'transform:translateY(calc(var(--o-dna-amp) * var(--o-dna-y))) scale(var(--o-dna-s));',
    'opacity:var(--o-dna-o);z-index:var(--o-dna-z);',
    'animation:o-dna-loader-turn var(--o-dna-speed) linear infinite;',
    'animation-delay:var(--o-dna-delay);',
    '}',
    `@keyframes o-dna-loader-turn{${turn.join('')}}`,
    `@keyframes o-dna-loader-rung{${rung.join('')}}`,
    // The helix frozen in its shape: every dot keeps its pose.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-dna-dot],[data-o-dna-rung]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface DnaLoaderOwnProps {
  /** Diameter of a dot, in pixels. @defaultValue 6 */
  size?: number
  /** Number of dot pairs, and so of rungs. One turn of the helix crosses them all. @defaultValue 8 */
  pairs?: number
  /** Duration of a complete turn, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Colour of the dots and of the rungs. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type DnaLoaderProps = Customisable<DnaLoaderOwnProps, 'span'>

/** Pose variables of a dot, for its state at rest. */
function poseVars(phase: number): CSSProperties {
  const pose = poseAt(phase)
  return {
    '--o-dna-y': pose.y.toFixed(3),
    '--o-dna-s': pose.scale.toFixed(3),
    '--o-dna-o': pose.opacity.toFixed(3),
    '--o-dna-z': String(pose.layer),
  } as CSSProperties
}

/**
 * Signals a wait through a turning DNA helix.
 *
 * @example
 * <DnaLoader />
 *
 * @example
 * // More pairs, slower, in the brand hue.
 * <DnaLoader pairs={12} speed={2400} color="var(--o-palette-brand-500)" />
 */
export function DnaLoader({
  size = 6,
  pairs = 8,
  speed = 1600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: DnaLoaderProps): ReactElement {
  ensureDnaRule()

  const { className, style } = mergePresentation({}, rest)

  const count = Math.max(2, Math.round(pairs))

  const loaderStyle = {
    ...style,
    '--o-dna-size': `${String(size)}px`,
    '--o-dna-amp': `${String(size * AMPLITUDE)}px`,
    '--o-dna-speed': `${String(speed)}ms`,
    '--o-dna-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-dna-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: count }, (_, pair) => {
        // A share of a turn per column, negative: the helix is there from the
        // first frame, and its pose at rest matches its phase.
        const phase = (2 * Math.PI * pair) / count
        const delay = Math.round((-speed * pair) / count)
        return (
          <span key={pair} aria-hidden data-o-dna-pair="">
            <span
              data-o-dna-rung=""
              style={
                {
                  '--o-dna-delay': `${String(delay)}ms`,
                  '--o-dna-rung': Math.abs(Math.sin(phase)).toFixed(3),
                } as CSSProperties
              }
            />
            <span
              data-o-dna-dot=""
              style={
                {
                  ...poseVars(phase),
                  '--o-dna-delay': `${String(delay)}ms`,
                } as CSSProperties
              }
            />
            <span
              data-o-dna-dot=""
              style={
                {
                  ...poseVars(phase + Math.PI),
                  '--o-dna-delay': `${String(delay - Math.round(speed / 2))}ms`,
                } as CSSProperties
              }
            />
          </span>
        )
      })}
    </span>
  )
}
