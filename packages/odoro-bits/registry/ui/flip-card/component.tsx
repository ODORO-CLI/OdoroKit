/**
 * Flip card: two faces, a toggle on click or from the keyboard.
 *
 * ## A button that looks like a card
 *
 * The toggle is a state the user controls, so the element is a button as far
 * as the accessibility tree is concerned: `role="button"`, focusable,
 * activated by Enter and Space, and `aria-pressed` says which face is shown.
 * Without that, the card would be a trap: clickable with the mouse, invisible
 * to the keyboard and mute to the screen reader.
 *
 * The hidden face is removed from the tree too: a screen reader has no
 * business reading the back of a card that is showing its front.
 *
 * ## The rotation is a transition, not an animation
 *
 * The target state — face up or turned over — is an angle, and the transition
 * makes the journey. Interrupting the toggle halfway therefore restarts from
 * the current angle, without a jump: exactly what transitions know how to do
 * and animations do not.
 *
 * Under reduced motion, the toggle becomes a cross-fade: the information —
 * the other face — still arrives, only the three-dimensional gesture is left
 * out.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface FlipCardOwnProps {
  /** Face shown at rest. */
  front: ReactNode
  /** Face revealed by the toggle. */
  back: ReactNode
  /** Axis of the rotation. @defaultValue 'horizontal' */
  direction?: 'horizontal' | 'vertical'
  /** Duration of the toggle, in milliseconds. @defaultValue 600 */
  duration?: number
}

/** All properties. */
export type FlipCardProps = Customisable<FlipCardOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-flip-card'

/** Applies the three-dimensional scene, once per document. */
function ensureFlipRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-flip]{position:relative;display:block;perspective:1000px;cursor:pointer}',
    '[data-o-flip-inner]{',
    'position:relative;width:100%;height:100%;',
    'transform-style:preserve-3d;',
    'transition:transform var(--o-flip-duration) cubic-bezier(0.4,0.2,0.2,1);',
    '}',
    '[data-o-flip][aria-pressed="true"] [data-o-flip-inner]{transform:var(--o-flip-turn)}',
    '[data-o-flip-face]{',
    'position:absolute;inset:0;',
    'backface-visibility:hidden;-webkit-backface-visibility:hidden;',
    '}',
    '[data-o-flip-face="back"]{transform:var(--o-flip-turn)}',
    // The front face gives the card its size: it alone is in the flow.
    '[data-o-flip-face="front"]{position:relative}',
    // Reduced motion: no more scene, a cross-fade between the faces.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-flip-inner]{transform-style:flat;transition:none}',
    '[data-o-flip][aria-pressed="true"] [data-o-flip-inner]{transform:none}',
    '[data-o-flip-face]{backface-visibility:visible;-webkit-backface-visibility:visible;',
    'transform:none;transition:opacity 240ms linear}',
    '[data-o-flip][aria-pressed="true"] [data-o-flip-face="front"]{opacity:0}',
    '[data-o-flip]:not([aria-pressed="true"]) [data-o-flip-face="back"]{opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Turns a card between two faces, on click as much as from the keyboard.
 *
 * Both faces cover the same surface: it is the front face that gives the card
 * its size.
 *
 * @example
 * <FlipCard
 *   className="o-h-48 o-w-72"
 *   front={<div className="o-rounded-xl o-border-w-1 o-p-6">Front</div>}
 *   back={<div className="o-rounded-xl o-border-w-1 o-p-6">Back</div>}
 * />
 *
 * @example
 * // Toggle from top to bottom, slower.
 * <FlipCard direction="vertical" duration={900} front={front} back={back} />
 */
export function FlipCard({
  front,
  back,
  direction = 'horizontal',
  duration = 600,
  ...rest
}: FlipCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [flipped, setFlipped] = useState(false)
  ensureFlipRule()

  const toggle = (): void => setFlipped((value) => !value)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    // Space would scroll the page: the card is what takes the gesture.
    event.preventDefault()
    toggle()
  }

  const { className, style } = mergePresentation({}, rest)

  const angle = direction === 'vertical' ? 'rotateX(180deg)' : 'rotateY(180deg)'

  const cardStyle = {
    ...style,
    '--o-flip-turn': angle,
    '--o-flip-duration': `${String(reduced ? 0 : duration)}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={cardStyle}
      data-o-flip=""
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      onClick={toggle}
      onKeyDown={onKeyDown}
    >
      <div data-o-flip-inner="">
        <div data-o-flip-face="front" {...(flipped ? { 'aria-hidden': true } : {})}>
          {front}
        </div>
        <div data-o-flip-face="back" {...(flipped ? {} : { 'aria-hidden': true })}>
          {back}
        </div>
      </div>
    </div>
  )
}
