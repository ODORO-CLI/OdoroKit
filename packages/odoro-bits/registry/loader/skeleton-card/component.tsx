/**
 * Card in waiting: the card is already there — its surface, its rule, its
 * margins — and only its content is missing.
 *
 * ## What the card keeps, and what it loses
 *
 * `skeleton-lines` stands in for a paragraph: there is nothing around it. A
 * card, on the other hand, has a container, and that container is not
 * waiting — it is already drawn, with its surface (`--o-theme-surface`) and
 * its rule (`--o-theme-line`). Drawing only grey blocks, with no card around
 * them, would make the layout jump when the content arrives: that is the
 * classic flaw of the skeleton, promising one height and delivering another.
 *
 * Inside, the hierarchy is preserved: an image, a thicker title, lines of
 * text, and a footer with its dot. A skeleton that stacks identical bars
 * announces "some content"; this one announces **that** content.
 *
 * ## Shimmer or pulse, on the blocks alone
 *
 * The animation never touches the card: a container that blinks reads as an
 * error. Only the empty blocks move, in cascade with the shimmer, all
 * together with the pulse.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label; the blocks are removed
 * from the accessibility tree. Under reduced motion, they stay full and
 * still: the empty card stays visible, it does not fade away.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-skeleton-card'

/** Width of the last line of text, as a percentage. */
const LAST_WIDTH = 58

/** Sets the card, its blocks and their animation, once per document. */
function ensureSkeletonCardRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The card is a real container: it already takes up the room the content
    // will take, rule included.
    '[data-o-skcard]{',
    'display:block;width:100%;box-sizing:border-box;',
    'padding:1rem;border-radius:var(--o-skcard-radius);',
    'background:var(--o-theme-surface);',
    'border:1px solid var(--o-theme-line);',
    '}',
    '[data-o-skcard-body]{display:flex;flex-direction:column;gap:0.75rem}',
    '[data-o-skcard-text]{display:flex;flex-direction:column;gap:0.5rem}',
    '[data-o-skcard-foot]{display:flex;align-items:center;gap:0.6rem}',
    '[data-o-skcard-fill]{',
    'position:relative;display:block;overflow:hidden;',
    'border-radius:calc(var(--o-skcard-radius) * 0.6);',
    'background:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    '}',
    // The image keeps its ratio: it is what fixes the height of the card.
    '[data-o-skcard-media]{aspect-ratio:16/9;width:100%}',
    '[data-o-skcard-title]{height:1.1rem;width:70%}',
    '[data-o-skcard-line]{height:0.6rem}',
    '[data-o-skcard-avatar]{width:2rem;height:2rem;border-radius:50%;flex:none}',
    '[data-o-skcard-meta]{height:0.6rem;width:40%}',
    '[data-o-skcard-shimmer] [data-o-skcard-fill]::after{',
    'content:"";position:absolute;inset:0;',
    'background:linear-gradient(90deg,transparent 0 30%,color-mix(in oklab,var(--o-theme-surface) 85%,transparent) 50%,transparent 70% 100%);',
    'transform:translateX(-100%);',
    'animation:o-skcard-sweep var(--o-skcard-speed) linear infinite;',
    'animation-delay:var(--o-skcard-delay);',
    '}',
    '@keyframes o-skcard-sweep{to{transform:translateX(100%)}}',
    '[data-o-skcard-pulse] [data-o-skcard-fill]{',
    'animation:o-skcard-pulse var(--o-skcard-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-skcard-pulse{0%,100%{opacity:1}50%{opacity:0.45}}',
    // The empty card stays readable, with no motion.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-skcard-fill]{animation:none;opacity:1}',
    '[data-o-skcard-shimmer] [data-o-skcard-fill]::after{animation:none;opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface SkeletonCardOwnProps {
  /** Number of lines of text under the title. @defaultValue 2 */
  lines?: number
  /** Reserve the room for an image at the top of the card. @defaultValue true */
  media?: boolean
  /** Reserve the room for a footer: dot and caption. @defaultValue true */
  footer?: boolean
  /** Corner radius of the card, in pixels. @defaultValue 14 */
  radius?: number
  /** A shimmer going across rather than an overall pulse. @defaultValue true */
  shimmer?: boolean
  /** Duration of one shimmer pass or one pulse, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Label announced to screen readers. @defaultValue 'Loading card' */
  label?: string
}

/** All the properties. */
export type SkeletonCardProps = Customisable<SkeletonCardOwnProps, 'div'>

/**
 * Reserves the room for a whole card while it loads.
 *
 * @example
 * <SkeletonCard />
 *
 * @example
 * // A text-only card, pulsed.
 * <SkeletonCard media={false} lines={4} shimmer={false} />
 */
export function SkeletonCard({
  lines = 2,
  media = true,
  footer = true,
  radius = 14,
  shimmer = true,
  speed = 1600,
  label = 'Loading card',
  ...rest
}: SkeletonCardProps): ReactElement {
  ensureSkeletonCardRule()

  const count = Math.max(0, Math.round(lines))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-skcard-radius': `${String(radius)}px`,
    '--o-skcard-speed': `${String(speed)}ms`,
  } as CSSProperties

  /** Shimmer delay, from the top of the card down to its footer. */
  const delay = (rank: number): CSSProperties =>
    ({
      '--o-skcard-delay': `${String(Math.round((speed / 10) * rank))}ms`,
    }) as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-skcard=""
      data-o-skcard-shimmer={shimmer ? '' : undefined}
      data-o-skcard-pulse={shimmer ? undefined : ''}
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-skcard-body="">
        {media ? (
          <span data-o-skcard-fill="" data-o-skcard-media="" style={delay(0)} />
        ) : null}
        <span data-o-skcard-fill="" data-o-skcard-title="" style={delay(1)} />
        {count > 0 ? (
          <span data-o-skcard-text="">
            {Array.from({ length: count }, (_, index) => (
              <span
                key={index}
                data-o-skcard-fill=""
                data-o-skcard-line=""
                style={
                  {
                    ...delay(2 + index),
                    // The last line stops short of the edge: that is what
                    // makes it read as a paragraph and not as a table.
                    width:
                      index === count - 1 && count > 1
                        ? `${String(LAST_WIDTH)}%`
                        : undefined,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        ) : null}
        {footer ? (
          <span data-o-skcard-foot="">
            <span
              data-o-skcard-fill=""
              data-o-skcard-avatar=""
              style={delay(2 + count)}
            />
            <span data-o-skcard-fill="" data-o-skcard-meta="" style={delay(3 + count)} />
          </span>
        ) : null}
      </span>
    </div>
  )
}
