/**
 * Luminous stroke travelling along a border.
 *
 * ## A conic gradient, not an element that rotates
 *
 * The naive approach consists in spinning a small rectangle around the
 * outline. It requires knowing the geometry, breaks as soon as the element
 * changes proportions, and gets stuck in the rounded corners.
 *
 * A conic gradient, on the other hand, rotates around the centre: the bright
 * band naturally sweeps the whole outline, whatever the shape. All that is
 * left is to keep only the border, which a two-layer mask does by subtracting
 * the interior.
 *
 * ## No JavaScript per frame
 *
 * The rotation is a CSS animation on a custom property registered as an angle.
 * Without that registration, a browser would interpolate the value as a
 * string — that is, not at all: the stroke would jump from one turn to the
 * next instead of rotating.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface BorderBeamOwnProps {
  /** Framed content. */
  children: ReactNode
  /** Duration of one full turn, in milliseconds. @defaultValue 4000 */
  duration?: number
  /** Thickness of the stroke, in pixels. @defaultValue 2 */
  width?: number
  /** Colour of the stroke. */
  color?: string
  /** Length of the trail, as a percentage of the outline. @defaultValue 25 */
  trail?: number
}

/** All properties. */
export type BorderBeamProps = Customisable<BorderBeamOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-border-beam'

/** Sets the animation and the angle registration, once per document. */
function ensureBeamRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@property --o-beam-angle{syntax:"<angle>";inherits:false;initial-value:0deg}',
    '@keyframes o-beam{to{--o-beam-angle:360deg}}',
    '[data-o-beam]{position:relative;isolation:isolate}',
    '[data-o-beam]::after{',
    'content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;',
    'padding:var(--o-beam-width);',
    'background:conic-gradient(from var(--o-beam-angle),transparent 0%,var(--o-beam-color) var(--o-beam-trail),transparent calc(var(--o-beam-trail) * 2));',
    '-webkit-mask:linear-gradient(black 0 0) content-box,linear-gradient(black 0 0);',
    'mask:linear-gradient(black 0 0) content-box,linear-gradient(black 0 0);',
    '-webkit-mask-composite:xor;mask-composite:exclude;',
    'animation:o-beam var(--o-beam-duration) linear infinite',
    '}',
    '@media (prefers-reduced-motion:reduce){[data-o-beam]::after{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Runs a stroke along the outline.
 *
 * @example
 * <BorderBeam className="o-rounded-xl o-border-w-1 o-p-6" duration={6000}>
 *   <p>A highlighted card</p>
 * </BorderBeam>
 */
export function BorderBeam({
  children,
  duration = 4000,
  width = 2,
  color = 'oklch(70% 0.18 264)',
  trail = 25,
  ...rest
}: BorderBeamProps): ReactElement {
  const { reduced } = useMotionState()
  ensureBeamRule()

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          '--o-beam-duration': `${String(duration)}ms`,
          '--o-beam-width': `${String(width)}px`,
          '--o-beam-color': color,
          '--o-beam-trail': `${String(trail)}%`,
        } as CSSProperties
      }
      data-o-beam={reduced ? undefined : ''}
    >
      {children}
    </div>
  )
}
