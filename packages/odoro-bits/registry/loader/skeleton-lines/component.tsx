/**
 * Waiting lines: a paragraph replaced by its lines, the last one shorter like
 * a real end of text.
 *
 * ## A stand-in, not an ink
 *
 * The other loaders are drawn in `currentColor`: they borrow the ink of the
 * text because they are a sign, a symbol set down on the page. A skeleton is
 * not a sign, it is a **surface** — the room the content will occupy. So it is
 * painted with the theme variables, a blend of rule and surface, and not with
 * the ink: on a light background as on a dark one, it stays what it is, an
 * empty area slightly denser than the page.
 *
 * The last line is shortened. Without it, the block reads as a grid, not as
 * text: it is that shortening which makes a paragraph recognisable before it
 * even arrives.
 *
 * ## Reflection or pulse, never both
 *
 * `shimmer` chooses between a reflection crossing the lines in a cascade and
 * an overall pulse. The reflection gives a reading direction — something is
 * coming, from left to right; the pulse only says "not yet". Overlaying them
 * would produce a flicker the eye follows instead of reading.
 *
 * The offset between the lines is **positive**, unlike the dot loaders: here
 * the block is already visible without its animation, no line is waiting its
 * turn to exist. The offset serves the cascade, not the first frame.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label; the lines are removed from
 * the accessibility tree. Under reduced motion, they stay solid and still: a
 * skeleton at rest remains visible, it does not fade away — there is nothing
 * else to show as long as the content is not there.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-skeleton-lines'

/** Width of the last line, as a percentage of the column. */
const LAST_WIDTH = 62

/** Sets up the lines, the reflection and the pulse, once per document. */
function ensureSkeletonLinesRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // As a block: the skeleton takes the width of its parent, like the
    // paragraph it replaces.
    '[data-o-sklines]{display:block;width:100%}',
    '[data-o-sklines-rows]{display:flex;flex-direction:column;gap:var(--o-sklines-gap)}',
    '[data-o-sklines-row]{',
    'position:relative;display:block;overflow:hidden;',
    'height:var(--o-sklines-height);border-radius:var(--o-sklines-radius);',
    // The rule gives the density, the surface lightens it: the blend holds in
    // light as in dark, without ever becoming an ink.
    'background:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    '}',
    // The reflection is a band of surface crossing the line.
    '[data-o-sklines-shimmer] [data-o-sklines-row]::after{',
    'content:"";position:absolute;inset:0;',
    'background:linear-gradient(90deg,transparent 0 30%,color-mix(in oklab,var(--o-theme-surface) 85%,transparent) 50%,transparent 70% 100%);',
    'transform:translateX(-100%);',
    'animation:o-sklines-sweep var(--o-sklines-speed) linear infinite;',
    'animation-delay:var(--o-sklines-delay);',
    '}',
    '@keyframes o-sklines-sweep{to{transform:translateX(100%)}}',
    '[data-o-sklines-pulse] [data-o-sklines-row]{',
    'animation:o-sklines-pulse var(--o-sklines-speed) ease-in-out infinite;',
    'animation-delay:var(--o-sklines-delay);',
    '}',
    '@keyframes o-sklines-pulse{0%,100%{opacity:1}50%{opacity:0.45}}',
    // Solid and still lines: the room stays stated.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-sklines-row]{animation:none;opacity:1}',
    '[data-o-sklines-shimmer] [data-o-sklines-row]::after{animation:none;opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface SkeletonLinesOwnProps {
  /** Number of lines. @defaultValue 3 */
  lines?: number
  /** Thickness of a line, in pixels. @defaultValue 12 */
  height?: number
  /** Corner radius of a line, in pixels. @defaultValue 6 */
  radius?: number
  /** A reflection crossing over rather than an overall pulse. @defaultValue true */
  shimmer?: boolean
  /** Duration of one pass of the reflection or of one pulse, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Label announced to screen readers. @defaultValue 'Loading content' */
  label?: string
}

/** All the props. */
export type SkeletonLinesProps = Customisable<SkeletonLinesOwnProps, 'div'>

/**
 * Replaces a paragraph with its waiting lines.
 *
 * @example
 * <SkeletonLines lines={4} />
 *
 * @example
 * // A pulse rather than a reflection, thicker lines.
 * <SkeletonLines lines={2} height={16} shimmer={false} />
 */
export function SkeletonLines({
  lines = 3,
  height = 12,
  radius = 6,
  shimmer = true,
  speed = 1600,
  label = 'Loading content',
  ...rest
}: SkeletonLinesProps): ReactElement {
  ensureSkeletonLinesRule()

  const count = Math.max(1, Math.round(lines))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-sklines-height': `${String(height)}px`,
    '--o-sklines-gap': `${String(Math.round(height * 0.85))}px`,
    '--o-sklines-radius': `${String(radius)}px`,
    '--o-sklines-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-sklines=""
      data-o-sklines-shimmer={shimmer ? '' : undefined}
      data-o-sklines-pulse={shimmer ? undefined : ''}
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-sklines-rows="">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            data-o-sklines-row=""
            style={
              {
                // An eighth of a cycle per line: the cascade shows without the
                // last line waiting a whole turn.
                '--o-sklines-delay': `${String(Math.round((speed / 8) * index))}ms`,
                // Only the last line is short: it is what makes one read a
                // paragraph and not a grid.
                width:
                  index === count - 1 && count > 1 ? `${String(LAST_WIDTH)}%` : undefined,
              } as CSSProperties
            }
          />
        ))}
      </span>
    </div>
  )
}
