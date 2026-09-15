/**
 * Electric border: an outline that crackles, sparks running along the stroke
 * in both directions, a halo that flickers.
 *
 * ## Why not a turbulence
 *
 * The original effect warps the stroke with an animated `feTurbulence`: the
 * noise is recomputed on every frame, over the whole surface of the frame, and
 * a browser showing three of them starts to stutter. This is not a setting to
 * turn down, it is a cost per pixel and per frame.
 *
 * The electricity is therefore written otherwise, with what an SVG engine
 * animates for almost nothing: the offset of a dashed line. Two strokes of the
 * same rectangle each carry an irregular dash pattern — short, long, spaced
 * without regularity — and their `stroke-dashoffset` scrolls, one way for one,
 * the other way for the other. Two rows of sparks crossing over a continuous
 * core: the geometry does not change, only the phase moves on.
 *
 * ## The flicker goes by steps
 *
 * An electric glow does not fade out: it jumps. The opacity of the halo
 * therefore follows a `steps(1)` animation, with stops at irregular
 * moments — a brief drop, a return, a longer drop. The curve has been
 * tuned by eye: too regular and it reads as a blinker; too dense and it
 * tires the eye.
 *
 * ## `pathLength` makes the dashes independent of the size
 *
 * The rectangle declares a perimeter of one hundred, whatever its real size. A
 * dash pattern written in hundredths of a turn therefore gives the same sparks
 * on a button and on a card, with nothing to measure.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface ElectricBorderOwnProps {
  /** Framed content. */
  children: ReactNode
  /**
   * Tokens of the current and of the sparks running along it.
   *
   * Two, in that order. The current makes the halo and the core; the sparks
   * are the light dashes scrolling over it.
   */
  colors?: readonly [string, string]
  /** Thickness of the stroke, in pixels. @defaultValue 2 */
  thickness?: number
  /** Corner radius of the frame, in pixels. @defaultValue 16 */
  radius?: number
  /** Duration of one turn of the sparks, in milliseconds. @defaultValue 1400 */
  speed?: number
  /** Strength of the halo, from zero to one. @defaultValue 0.8 */
  intensity?: number
}

/** All the properties. */
export type ElectricBorderProps = Customisable<ElectricBorderOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-palette-sky-400', '--o-palette-white'] as const

/**
 * Dash patterns of the two rows of sparks, in hundredths of the perimeter.
 *
 * Irregular on purpose: a regular pattern makes a dotted line, not an
 * electric arc. The two sums differ so that the rows never overlap
 * exactly.
 */
const ARC_A = '1 9 3 17 1 6 4 23 2 12'
const ARC_B = '2 14 1 7 3 19 1 11 2 27'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-electric-border'

/** Places the frame, the strokes and their animations, once per document. */
function ensureElectricRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-elec]{position:relative;display:inline-block;isolation:isolate;',
    'border-radius:var(--o-elec-radius)}',
    '[data-o-elec-content]{position:relative;z-index:1;border-radius:inherit}',
    // The SVG is inset by half a thickness: the stroke, centered on the edge
    // of the rectangle, then falls exactly on the edge of the frame.
    '[data-o-elec-svg]{',
    'position:absolute;z-index:0;pointer-events:none;overflow:visible;',
    'inset:calc(var(--o-elec-w) / 2);',
    'width:calc(100% - var(--o-elec-w));height:calc(100% - var(--o-elec-w));',
    '}',
    '[data-o-elec-svg] rect{fill:none;stroke-linejoin:round;stroke-linecap:round}',
    '[data-o-elec-trace="halo"]{stroke:var(--o-elec-current);stroke-width:calc(var(--o-elec-w) * 5);',
    'opacity:calc(var(--o-elec-intensity) * 0.3);',
    'animation:o-elec-flicker 2100ms steps(1,end) infinite}',
    '[data-o-elec-trace="core"]{stroke:var(--o-elec-current);stroke-width:var(--o-elec-w);',
    'opacity:0.9;animation:o-elec-flicker 2100ms steps(1,end) infinite reverse}',
    '[data-o-elec-trace="arc"]{stroke:var(--o-elec-spark);stroke-width:var(--o-elec-w);',
    'animation:o-elec-run var(--o-elec-speed) linear infinite}',
    '[data-o-elec-trace="arc"][data-o-elec-back]{animation-direction:reverse;opacity:0.7}',
    '@keyframes o-elec-run{to{stroke-dashoffset:-100}}',
    // The steps of the flicker, as fractions of the resting intensity.
    '@keyframes o-elec-flicker{',
    '0%,100%{opacity:calc(var(--o-elec-intensity) * 0.3)}',
    '7%{opacity:calc(var(--o-elec-intensity) * 0.16)}',
    '9%{opacity:calc(var(--o-elec-intensity) * 0.34)}',
    '31%{opacity:calc(var(--o-elec-intensity) * 0.26)}',
    '33%{opacity:calc(var(--o-elec-intensity) * 0.1)}',
    '36%{opacity:calc(var(--o-elec-intensity) * 0.32)}',
    '58%{opacity:calc(var(--o-elec-intensity) * 0.2)}',
    '60%{opacity:calc(var(--o-elec-intensity) * 0.36)}',
    '83%{opacity:calc(var(--o-elec-intensity) * 0.14)}',
    '85%{opacity:calc(var(--o-elec-intensity) * 0.3)}',
    '}',
    '@media (prefers-reduced-motion:reduce){[data-o-elec-svg] rect{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Frames a content with an electric stroke.
 *
 * @example
 * <ElectricBorder className="o-p-6">
 *   <h3>Offer of the moment</h3>
 * </ElectricBorder>
 *
 * @example
 * // Purple current, thicker stroke, softer corners.
 * <ElectricBorder colors={['--o-palette-fuchsia-400', '--o-palette-white']} thickness={3} radius={24}>
 *   <button type="button" className="o-px-6 o-py-3">Activate</button>
 * </ElectricBorder>
 */
export function ElectricBorder({
  children,
  colors = DEFAULT_TOKENS,
  thickness = 2,
  radius = 16,
  speed = 1400,
  intensity = 0.8,
  ...rest
}: ElectricBorderProps): ReactElement {
  const { reduced } = useMotionState()
  ensureElectricRules()

  const { className, style } = mergePresentation({}, rest)

  // The rectangle is inset by half a thickness: so is its radius.
  const rx = Math.max(0, radius - thickness / 2)

  const trace = (
    kind: 'halo' | 'core' | 'arc',
    dash?: string,
    back = false,
  ): ReactElement => (
    <rect
      data-o-elec-trace={kind}
      data-o-elec-back={back ? '' : undefined}
      x="0"
      y="0"
      width="100%"
      height="100%"
      rx={rx}
      pathLength={100}
      strokeDasharray={dash}
    />
  )

  return (
    <div
      {...rest}
      data-o-elec=""
      className={className}
      style={
        {
          '--o-elec-current': `var(${colors[0]})`,
          '--o-elec-spark': `var(${colors[1]})`,
          '--o-elec-w': `${String(thickness)}px`,
          '--o-elec-radius': `${String(radius)}px`,
          '--o-elec-speed': `${String(speed)}ms`,
          '--o-elec-intensity': String(intensity),
          ...style,
        } as CSSProperties
      }
    >
      <svg aria-hidden="true" data-o-elec-svg="">
        {trace('halo')}
        {trace('core')}
        {/* Under reduced motion the sparks do not run: the core is enough. */}
        {!reduced && trace('arc', ARC_A)}
        {!reduced && trace('arc', ARC_B, true)}
      </svg>
      <div data-o-elec-content="">{children}</div>
    </div>
  )
}
