/**
 * Circular text: a sentence laid on a ring that turns endlessly.
 *
 * ## A `textPath`, not letters placed one by one
 *
 * Placing each letter by hand — one element per character, one rotation per
 * element — redoes by hand what SVG does natively: `textPath` follows the
 * path, handles the spacing, and costs a single node. The rotation is a CSS
 * animation on the whole SVG, held by the compositor; after the first render,
 * nothing runs any more.
 *
 * ## The circle is a picture, the text is elsewhere
 *
 * Wrapped text reads poorly to the eye and not at all to the ear: a screen
 * reader diving into the SVG would come out with mush. The whole SVG is
 * therefore `aria-hidden`, and the complete text lives alongside it in a
 * visually hidden element.
 *
 * Under reduced motion, the ring stays — it is layout — but no longer turns.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useId, type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface CircularTextOwnProps {
  /** Text to wrap. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Diameter of the ring, in pixels. @defaultValue 160 */
  size?: number
  /** Duration of one full turn, in seconds. @defaultValue 12 */
  speed?: number
  /** Turn the other way. @defaultValue false */
  reverse?: boolean
}

/** All properties. */
export type CircularTextProps = Customisable<CircularTextOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-circular-text'

/** Sets the rotation, once per document. */
function ensureCircularRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@keyframes o-circular-spin{to{transform:rotate(360deg)}}',
    '[data-o-circular]{',
    'display:block;',
    'animation:o-circular-spin var(--o-circular-speed) linear infinite;',
    'animation-direction:var(--o-circular-direction);',
    '}',
    // The system preference is honoured even if the engine state has not been
    // read yet: the stylesheet knows how to stop it on its own.
    '@media (prefers-reduced-motion:reduce){[data-o-circular]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Wraps a text on a circle that turns continuously.
 *
 * @example
 * <CircularText size={180}>
 *   SINCE 2012 · HANDMADE · SINCE 2012 · HANDMADE ·
 * </CircularText>
 *
 * @example
 * // Small badge, slow rotation the other way.
 * <CircularText size={110} speed={24} reverse>
 *   OPEN EVERY DAY ·
 * </CircularText>
 */
export function CircularText({
  children,
  as: Tag = 'span',
  size = 160,
  speed = 12,
  reverse = false,
  ...rest
}: CircularTextProps): ReactElement {
  const { reduced } = useMotionState()
  const pathId = useId()
  ensureCircularRule()

  const { className, style } = mergePresentation({}, rest)

  const svgStyle = {
    '--o-circular-speed': `${String(speed)}s`,
    '--o-circular-direction': reverse ? 'reverse' : 'normal',
  } as CSSProperties

  return (
    <Tag
      {...rest}
      className={className}
      style={{
        display: 'inline-block',
        width: `${String(size)}px`,
        height: `${String(size)}px`,
        ...style,
      }}
    >
      {/* The text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        // Under reduced motion the attribute is not set: the ring is there,
        // motionless, and the stylesheet has nothing to animate.
        {...(reduced ? {} : { 'data-o-circular': '' })}
        style={reduced ? undefined : svgStyle}
      >
        <defs>
          {/* A circle of radius 38: enough margin for the letters not to leave
              the box when the font overflows the path. */}
          <path id={pathId} d="M 50 12 a 38 38 0 1 1 -0.01 0" fill="none" />
        </defs>
        <text fill="currentColor" fontSize="11" letterSpacing="1.5">
          <textPath href={`#${pathId}`}>{children}</textPath>
        </text>
      </svg>
    </Tag>
  )
}
