/**
 * Avatar in waiting: a disc and its lines beside it, the pattern of an
 * identity that has not arrived yet.
 *
 * ## The disc first, and why it is round
 *
 * It is the shape that makes the pattern recognisable: a round followed by two
 * lines reads as "somebody" before any name is there. The rectangular blocks
 * of `skeleton-lines` do not say that, and a whole card says too much. This
 * skeleton is the one for an author header, a comment thread, a member list.
 *
 * The first line is shorter and thicker than the second: a name and then a
 * role, not two sentences. Without that difference, the pattern turns back
 * into a paragraph.
 *
 * ## Several rows of the list, a single rhythm
 *
 * `rows` repeats the pattern: a list of people in waiting. The shimmer delay
 * follows the reading, top to bottom and left to right, so that the list is
 * scanned as a list and not as a collective blink.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label; the blocks are removed from
 * the accessibility tree. Under reduced motion, they stay full and still: the
 * room stays held, it does not fade away.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-skeleton-avatar'

/** Widths of the lines, from the first to the last, as percentages. */
const WIDTHS = [45, 70, 60, 52] as const

/** Sets the disc, its lines and their animation, once per document. */
function ensureSkeletonAvatarRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-skav]{display:flex;flex-direction:column;gap:1rem;width:100%}',
    // The disc never squeezes: it is what carries the pattern.
    '[data-o-skav-row]{display:flex;align-items:center;gap:0.85rem}',
    '[data-o-skav-stack]{display:flex;flex-direction:column;gap:0.5rem;flex:1 1 auto;min-width:0}',
    '[data-o-skav-fill]{',
    'position:relative;display:block;overflow:hidden;',
    'background:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    '}',
    '[data-o-skav-disc]{',
    'flex:none;border-radius:50%;',
    'width:var(--o-skav-size);height:var(--o-skav-size);',
    '}',
    '[data-o-skav-line]{',
    'height:var(--o-skav-line);border-radius:var(--o-skav-radius);',
    '}',
    // The first line carries the name: thicker than the ones that follow.
    '[data-o-skav-stack] [data-o-skav-line]:first-child{height:calc(var(--o-skav-line) * 1.35)}',
    '[data-o-skav-shimmer] [data-o-skav-fill]::after{',
    'content:"";position:absolute;inset:0;',
    'background:linear-gradient(90deg,transparent 0 30%,color-mix(in oklab,var(--o-theme-surface) 85%,transparent) 50%,transparent 70% 100%);',
    'transform:translateX(-100%);',
    'animation:o-skav-sweep var(--o-skav-speed) linear infinite;',
    'animation-delay:var(--o-skav-delay);',
    '}',
    '@keyframes o-skav-sweep{to{transform:translateX(100%)}}',
    '[data-o-skav-pulse] [data-o-skav-fill]{',
    'animation:o-skav-pulse var(--o-skav-speed) ease-in-out infinite;',
    'animation-delay:var(--o-skav-delay);',
    '}',
    '@keyframes o-skav-pulse{0%,100%{opacity:1}50%{opacity:0.45}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-skav-fill]{animation:none;opacity:1}',
    '[data-o-skav-shimmer] [data-o-skav-fill]::after{animation:none;opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface SkeletonAvatarOwnProps {
  /** Number of people in waiting. @defaultValue 1 */
  rows?: number
  /** Number of lines beside the disc. @defaultValue 2 */
  lines?: number
  /** Diameter of the disc, in pixels. @defaultValue 44 */
  size?: number
  /** Corner radius of the lines, in pixels. @defaultValue 6 */
  radius?: number
  /** A shimmer going across rather than an overall pulse. @defaultValue true */
  shimmer?: boolean
  /** Duration of one shimmer pass or one pulse, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Label announced to screen readers. @defaultValue 'Loading profile' */
  label?: string
}

/** All the properties. */
export type SkeletonAvatarProps = Customisable<SkeletonAvatarOwnProps, 'div'>

/**
 * Reserves the room for an avatar and its identity.
 *
 * @example
 * <SkeletonAvatar />
 *
 * @example
 * // A member list, pulsed.
 * <SkeletonAvatar rows={4} size={36} shimmer={false} />
 */
export function SkeletonAvatar({
  rows = 1,
  lines = 2,
  size = 44,
  radius = 6,
  shimmer = true,
  speed = 1600,
  label = 'Loading profile',
  ...rest
}: SkeletonAvatarProps): ReactElement {
  ensureSkeletonAvatarRule()

  const rowCount = Math.max(1, Math.round(rows))
  const lineCount = Math.max(1, Math.round(lines))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-skav-size': `${String(size)}px`,
    // The lines are sized by the disc: the pattern holds by its proportions,
    // not by two settings that could drift apart.
    '--o-skav-line': `${String(Math.round(size * 0.18))}px`,
    '--o-skav-radius': `${String(radius)}px`,
    '--o-skav-speed': `${String(speed)}ms`,
  } as CSSProperties

  /** Shimmer delay, in the reading order of the list. */
  const delay = (rank: number): CSSProperties =>
    ({
      '--o-skav-delay': `${String(Math.round((speed / 10) * rank))}ms`,
    }) as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-skav=""
      data-o-skav-shimmer={shimmer ? '' : undefined}
      data-o-skav-pulse={shimmer ? undefined : ''}
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: rowCount }, (_, row) => (
        <span key={row} aria-hidden data-o-skav-row="">
          <span
            data-o-skav-fill=""
            data-o-skav-disc=""
            style={delay(row * (lineCount + 1))}
          />
          <span data-o-skav-stack="">
            {Array.from({ length: lineCount }, (_, line) => (
              <span
                key={line}
                data-o-skav-fill=""
                data-o-skav-line=""
                style={
                  {
                    ...delay(row * (lineCount + 1) + line + 1),
                    width: `${String(WIDTHS[line % WIDTHS.length] ?? 60)}%`,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        </span>
      ))}
    </div>
  )
}
