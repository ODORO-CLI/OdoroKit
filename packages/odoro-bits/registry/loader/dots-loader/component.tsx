/**
 * Breathing dots: three dots pulse in canon.
 *
 * ## One animation, three negative delays
 *
 * The three dots play exactly the same animation; only their phase differs, by
 * a negative delay of a third of a cycle each. A positive delay would make the
 * last two dots wait at the first render — for a moment, a single dot would be
 * visible, and the loader would look broken. Negative, each dot already starts
 * in the middle of its run: the canon is there from the very first frame.
 *
 * No JavaScript after the first render: three animations declared once, held
 * by the compositor.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the wait
 * is information, not decoration. The dots themselves are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the three dots stay full and still: the figure still
 * reads as a loader, only the motion stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-dots-loader'

/** Sets the dots and their breathing, once per document. */
function ensureDotsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dots-loader]{',
    'display:inline-flex;align-items:center;',
    'gap:calc(var(--o-dots-size) * 0.6);',
    '}',
    '[data-o-dots-dot]{',
    'width:var(--o-dots-size);height:var(--o-dots-size);',
    'border-radius:50%;background:var(--o-dots-color);',
    'animation:o-dots-breathe var(--o-dots-speed) ease-in-out infinite;',
    'animation-delay:var(--o-dots-delay);',
    '}',
    '@keyframes o-dots-breathe{',
    '0%,100%{transform:scale(0.6);opacity:0.35}',
    '50%{transform:scale(1);opacity:1}',
    '}',
    // Three full dots: the figure still says "waiting", without a pulse.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-dots-dot]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface DotsLoaderOwnProps {
  /** Diameter of one dot, in pixels. @defaultValue 10 */
  size?: number
  /** Duration of one breathing cycle, in milliseconds. @defaultValue 900 */
  speed?: number
  /** Colour of the dots. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type DotsLoaderProps = Customisable<DotsLoaderOwnProps, 'span'>

/**
 * Signals a wait with three dots breathing in canon.
 *
 * @example
 * <DotsLoader />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <DotsLoader size={14} speed={1400} color="var(--o-palette-brand-500)" />
 */
export function DotsLoader({
  size = 10,
  speed = 900,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: DotsLoaderProps): ReactElement {
  ensureDotsRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-dots-size': `${String(size)}px`,
    '--o-dots-speed': `${String(speed)}ms`,
    '--o-dots-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-dots-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          aria-hidden
          data-o-dots-dot=""
          style={
            {
              // A third of a cycle apart, negative: the canon is complete from
              // the very first frame.
              '--o-dots-delay': `${String(Math.round((-speed * dot) / 3))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}
