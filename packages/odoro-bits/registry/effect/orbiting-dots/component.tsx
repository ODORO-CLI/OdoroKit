/**
 * Orbiting dots: satellites turn around the content.
 *
 * ## One pivot per dot, and the compositor as the only clockmaker
 *
 * Each dot sits at the end of an invisible arm — an element centred on the
 * content, which the CSS rotation turns. The dot itself does not move in its
 * own frame of reference: it is the arm that turns, and the compositor holds
 * as many rotations as there are dots without a line of JavaScript running.
 *
 * The starting phase of each arm is carried by a negative delay: the dots are
 * spread around the circle from the first render, instead of all leaving from
 * the same meridian.
 *
 * ## Two rings rather than one
 *
 * The even and odd dots turn neither at the same speed nor in the same
 * direction. A single turning ring reads as a spinner; two crossed rings read
 * as an aura — and that difference is what makes the ornament.
 *
 * Under reduced motion, the dots stay in place on their circle: the
 * composition remains, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface OrbitingDotsOwnProps {
  /** Content around which the dots turn. */
  children: ReactNode
  /** Number of dots. @defaultValue 6 */
  count?: number
  /** Radius of the orbit, in pixels. @defaultValue 48 */
  radius?: number
  /** Duration of one revolution, in milliseconds. @defaultValue 6000 */
  speed?: number
  /** Colour of the dots. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type OrbitingDotsProps = Customisable<OrbitingDotsOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-orbiting-dots'

/** Sets the rotation, once per document. */
function ensureOrbitRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-orbits]{position:relative;display:inline-flex;align-items:center;justify-content:center}',
    // The arm: a pivot point at the centre of the content. Its size is zero,
    // only its frame of reference matters.
    '[data-o-orbit-arm]{',
    'position:absolute;left:50%;top:50%;width:0;height:0;',
    'animation:o-orbit-spin var(--o-orbit-speed) linear infinite;',
    'animation-delay:var(--o-orbit-phase);',
    'animation-direction:var(--o-orbit-direction);',
    '}',
    '[data-o-orbit-dot]{',
    'position:absolute;left:var(--o-orbit-radius);top:0;',
    'width:var(--o-orbit-size);height:var(--o-orbit-size);',
    'margin:calc(var(--o-orbit-size) / -2);',
    'border-radius:50%;background:var(--o-orbit-color);',
    '}',
    '@keyframes o-orbit-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    '@media (prefers-reduced-motion:reduce){[data-o-orbit-arm]{animation-play-state:paused}}',
  ].join('')
  document.head.append(style)
}

/**
 * Puts dots in orbit around a badge, an avatar, an icon.
 *
 * @example
 * <OrbitingDots radius={40}>
 *   <img src={avatar} alt="Portrait" className="o-rounded-full" />
 * </OrbitingDots>
 *
 * @example
 * // A dense and slow aura.
 * <OrbitingDots count={10} radius={64} speed={12000}>
 *   <span className="o-text-2xl">New</span>
 * </OrbitingDots>
 */
export function OrbitingDots({
  children,
  count = 6,
  radius = 48,
  speed = 6000,
  color = 'currentColor',
  ...rest
}: OrbitingDotsProps): ReactElement {
  ensureOrbitRule()

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-orbit-color': color,
    '--o-orbit-size': '6px',
  } as CSSProperties

  return (
    <div {...rest} className={className} style={hostStyle} data-o-orbits="">
      {children}
      {Array.from({ length: count }, (_, index) => {
        // Alternating rings: the odd ones turn backwards, faster and closer.
        // See the module header.
        const inverse = index % 2 === 1
        const duration = inverse ? speed * 0.7 : speed
        return (
          <span
            key={index}
            aria-hidden
            data-o-orbit-arm=""
            style={
              {
                '--o-orbit-radius': `${String(Math.round(inverse ? radius * 0.72 : radius))}px`,
                '--o-orbit-speed': `${String(Math.round(duration))}ms`,
                // Negative delay: each arm starts at its own place on the
                // circle, not on the common meridian.
                '--o-orbit-phase': `${String(Math.round((-index / count) * duration))}ms`,
                '--o-orbit-direction': inverse ? 'reverse' : 'normal',
              } as CSSProperties
            }
          >
            <span data-o-orbit-dot="" />
          </span>
        )
      })}
    </div>
  )
}
