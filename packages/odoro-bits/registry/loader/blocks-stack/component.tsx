/**
 * Stacked blocks: four blocks fall onto one another in a column, the stack
 * holds for an instant, then tips over and collapses.
 *
 * ## Two animations that know nothing of each other
 *
 * The fall belongs to each block: it starts from the top of the container, in
 * `ease-in` — gravity accelerates — and stops dead on the previous block. The
 * collapse, for its part, is carried by the whole column, which pivots around
 * its bottom right corner and fades out. The blocks know nothing of the tip,
 * the column knows nothing of the falls: two simple animations instead of a
 * single one that would have to coordinate everything, and a legible figure —
 * one builds, then everything falls.
 *
 * Each block knows its window in the cycle, through an animation of its own
 * written once into the stylesheet; that is what lets the stack stand whole
 * before falling, where a plain phase shift would give a perpetual fall.
 *
 * The container is only one block wide: the toppled column overflows to the
 * right for the time it takes to fade, without touching the layout.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The blocks are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the stack stays complete and upright: the figure
 * still reads, only the fall and the tip stop.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-blocks-stack'

/** Number of blocks. */
const BLOCKS = 4

/** Height of the container, in blocks: the stack plus the margin they fall from. */
const HEIGHT = BLOCKS + 2

/** Share of the cycle between two starts of a fall, in per cent. */
const STEP = 13

/** Duration of one fall, in per cent of the cycle. */
const DROP = 11

/** Moment when the complete stack starts to tip, in per cent. */
const TOPPLE_AT = 66

/** Applies the column, the falls and the tip, once per document. */
function ensureBlocksStackRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-blocks-stack]{',
    'display:inline-flex;align-items:flex-end;',
    `width:var(--o-bstack-size);height:calc(var(--o-bstack-size) * ${String(HEIGHT)});`,
    '}',
    '[data-o-blocks-stack-column]{',
    'display:flex;flex-direction:column-reverse;',
    'gap:calc(var(--o-bstack-size) * 0.15);transform-origin:bottom right;',
    'animation:o-blocks-stack-topple var(--o-bstack-speed) infinite;',
    '}',
    '[data-o-blocks-stack-block]{',
    'width:var(--o-bstack-size);height:var(--o-bstack-size);flex:none;',
    'border-radius:calc(var(--o-bstack-size) / 5);background:var(--o-bstack-color);',
    'animation-duration:var(--o-bstack-speed);animation-iteration-count:infinite;',
    '}',
    // One fall per block: it starts from the top of the container, invisible,
    // and appears on the way so as not to pop in all at once.
    ...Array.from({ length: BLOCKS }, (_, block) => {
      const start = block * STEP
      const end = start + DROP
      const fall = HEIGHT - 1 - block
      return [
        `[data-o-blocks-stack-block="${String(block)}"]{animation-name:o-blocks-stack-${String(block)}}`,
        `@keyframes o-blocks-stack-${String(block)}{`,
        `0%,${String(start)}%{transform:translateY(calc(var(--o-bstack-size) * ${String(-fall)}));opacity:0;animation-timing-function:ease-in}`,
        `${String(start + 2)}%{opacity:1}`,
        `${String(end)}%,100%{transform:none;opacity:1}`,
        '}',
      ].join('')
    }),
    // The column pivots on its bottom right corner and fades out on the floor.
    '@keyframes o-blocks-stack-topple{',
    `0%,${String(TOPPLE_AT)}%{transform:none;opacity:1;animation-timing-function:ease-in}`,
    `${String(TOPPLE_AT + 14)}%{transform:rotate(90deg);opacity:1}`,
    `${String(TOPPLE_AT + 20)}%,100%{transform:rotate(90deg);opacity:0}`,
    '}',
    // An upright stack: the figure is stated, with no fall and no tip.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-blocks-stack-column]{animation:none;transform:none;opacity:1}',
    '[data-o-blocks-stack-block]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface BlocksStackOwnProps {
  /** Side of a block, in pixels. @defaultValue 10 */
  size?: number
  /** Duration of one complete cycle, in milliseconds. @defaultValue 2200 */
  speed?: number
  /** Colour of the blocks. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type BlocksStackProps = Customisable<BlocksStackOwnProps, 'span'>

/**
 * Signals a wait with blocks that stack up then collapse.
 *
 * @example
 * <BlocksStack />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <BlocksStack size={14} speed={3000} color="var(--o-palette-brand-500)" />
 */
export function BlocksStack({
  size = 10,
  speed = 2200,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: BlocksStackProps): ReactElement {
  ensureBlocksStackRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-bstack-size': `${String(size)}px`,
    '--o-bstack-speed': `${String(speed)}ms`,
    '--o-bstack-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-blocks-stack=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-blocks-stack-column="">
        {Array.from({ length: BLOCKS }, (_, block) => (
          <span key={block} data-o-blocks-stack-block={String(block)} />
        ))}
      </span>
    </span>
  )
}
