/**
 * Grid: a mesh that drifts, with no graphics context.
 *
 * ## Why this one does not use WebGL
 *
 * A grid is a regular repetition of two strokes. Two repeated gradients
 * describe it exactly, and the browser compositor draws them without a line
 * of JavaScript running. Taking a graphics surface for that would mean
 * paying thirteen kilobytes and a context — of which the browser hands out
 * only a limited number — for an identical result.
 *
 * The practical consequence counts as much as the principle: the arbiter
 * grants only one surface per backend, so two shader backgrounds cannot
 * coexist on a page. This one can be placed as many times as one likes.
 *
 * ## The fade towards the edges
 *
 * A grid that stops dead at the edge of its container reads as a texture
 * laid on top. A radial mask makes it fade away gradually, which makes it
 * belong to the page rather than sit over it.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Properties specific to this component. */
export interface GridLinesOwnProps {
  /** Grid pitch, in pixels. @defaultValue 48 */
  size?: number
  /** Stroke thickness, in pixels. @defaultValue 1 */
  thickness?: number
  /** Stroke colour. */
  color?: string
  /** Duration of one drift cycle, in seconds. Zero to hold it still. @defaultValue 0 */
  speed?: number
  /** Fades the grid towards the edges. @defaultValue true */
  fade?: boolean
}

/** Every property. */
export type GridLinesProps = Customisable<GridLinesOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-grid-lines'

/** Applies the drift, once per document. */
function ensureGridRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The drift travels exactly one pitch: at the end of the cycle, the
    // pattern is superimposable on itself and the loop does not show.
    '@keyframes o-grid-drift{to{background-position:var(--o-grid-size) var(--o-grid-size)}}',
    '[data-o-grid-drift]{animation:o-grid-drift var(--o-grid-duration) linear infinite}',
    '@media (prefers-reduced-motion:reduce){[data-o-grid-drift]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Background grid.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GridLines className="o-absolute o-inset-0" speed={24} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GridLines({
  size = 48,
  thickness = 1,
  color = 'oklch(100% 0 0 / 0.08)',
  speed = 0,
  fade = true,
  ...rest
}: GridLinesProps): ReactElement {
  const { reduced } = useMotionState()
  ensureGridRule()

  const step = `${String(size)}px`
  const line = `${String(thickness)}px`

  const mask = fade
    ? 'radial-gradient(ellipse at center, black 45%, transparent 85%)'
    : undefined

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          '--o-grid-size': step,
          '--o-grid-duration': `${String(Math.max(speed, 1))}s`,
          backgroundImage: [
            `linear-gradient(to right, ${color} ${line}, transparent ${line})`,
            `linear-gradient(to bottom, ${color} ${line}, transparent ${line})`,
          ].join(','),
          backgroundSize: `${step} ${step}`,
          ...(mask === undefined ? {} : { WebkitMaskImage: mask, maskImage: mask }),
        } as CSSProperties
      }
      data-o-grid-drift={speed > 0 && !reduced ? '' : undefined}
      aria-hidden
    />
  )
}
