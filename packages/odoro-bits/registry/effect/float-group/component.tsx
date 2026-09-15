/**
 * Float: every direct child sways gently, never in chorus.
 *
 * ## The cadence comes from the index, not from chance
 *
 * Duration and phase of each child are derived from its position by the same
 * deterministic sequence as the meteor shower. `Math.random()` at render time
 * would give two different floats between the server and the client — one
 * hydration error per child — and a new float on every render of the parent.
 * Above all, seeding by index guarantees what makes the effect: two
 * neighbours never share either duration or phase, and the group breathes
 * instead of jumping in unison.
 *
 * ## The compositor carries everything
 *
 * Each child is wrapped in a `span` that carries a single CSS animation — a
 * sinusoidal vertical translation — driven by variables. No JavaScript runs
 * during the float; the negative delay means each one is already somewhere
 * along its course at first glance.
 *
 * The wrappers carry no `aria-hidden`: they contain real content — badges,
 * thumbnails — that the float must not silence. Under reduced motion, the
 * animation is suspended: everything stays in place.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { Children, type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface FloatGroupOwnProps {
  /** Elements that float, each on its own cadence. */
  children: ReactNode
  /** Amplitude of the sway, in pixels. @defaultValue 8 */
  amplitude?: number
  /** Reference duration of one round trip, in milliseconds. @defaultValue 3000 */
  duration?: number
}

/** All properties. */
export type FloatGroupProps = Customisable<FloatGroupOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-float-group'

/**
 * Pseudo-random value in [0, 1), stable for an index-channel pair.
 *
 * A congruence is enough: this is not cryptography, only a guarantee that two
 * neighbours never share their cadence.
 */
function seeded(index: number, channel: number): number {
  const value = Math.sin(index * 127.1 + channel * 311.7) * 43758.5453
  return value - Math.floor(value)
}

/** Sets the sway, once per document. */
function ensureFloatRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-float]{',
    'display:inline-block;',
    'animation:o-float-drift var(--o-float-duration) ease-in-out infinite;',
    'animation-delay:var(--o-float-phase);',
    'will-change:transform;',
    '}',
    // A sine wave in three points: the round trip is symmetric, and
    // ease-in-out rounds the extremes like a real float.
    '@keyframes o-float-drift{',
    '0%,100%{transform:translateY(0)}',
    '50%{transform:translateY(calc(var(--o-float-amplitude) * -1))}',
    '}',
    '@media (prefers-reduced-motion:reduce){[data-o-float]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Makes each of its direct children float, for badges and thumbnails.
 *
 * The layout of the group belongs to the caller: a row, a grid, a cloud — the
 * component only wraps each child.
 *
 * @example
 * <FloatGroup className="o-flex o-items-center o-gap-6">
 *   <Badge>New</Badge>
 *   <Badge>No commitment</Badge>
 *   <Badge>Open at night</Badge>
 * </FloatGroup>
 *
 * @example
 * // A wide and slow float, for large thumbnails.
 * <FloatGroup amplitude={16} duration={5000} className="o-grid o-grid-cols-3 o-gap-8">
 *   {thumbnails}
 * </FloatGroup>
 */
export function FloatGroup({
  children,
  amplitude = 8,
  duration = 3000,
  ...rest
}: FloatGroupProps): ReactElement {
  ensureFloatRule()

  const { className, style } = mergePresentation({}, rest)

  return (
    <div {...rest} className={className} style={style}>
      {Children.map(children, (child, index) => {
        // Duration spread around the reference, phase carried by a negative
        // delay: see the module header.
        const own = duration * (0.85 + seeded(index, 0) * 0.4)
        return (
          <span
            data-o-float=""
            style={
              {
                '--o-float-amplitude': `${String(amplitude)}px`,
                '--o-float-duration': `${String(Math.round(own))}ms`,
                '--o-float-phase': `${String(-Math.round(seeded(index, 1) * own))}ms`,
              } as CSSProperties
            }
          >
            {child}
          </span>
        )
      })}
    </div>
  )
}
