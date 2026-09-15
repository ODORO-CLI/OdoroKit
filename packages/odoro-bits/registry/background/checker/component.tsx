/**
 * Checker: alternating squares, from a single repeated conic gradient.
 *
 * ## Why a conic gradient
 *
 * A checkerboard is usually described with two offset linear gradients — the
 * recipe from before `conic-gradient`. The conic does better: four quarter
 * turns around a tile's centre give exactly two filled squares and two empty
 * ones, in a single background image. Fewer layers, same pattern.
 *
 * ## Why the strength is a setting and not the colour alone
 *
 * A full checkerboard draws the eye like a game board. As a background it
 * must be no more than a texture: the strength mixes the colour with
 * transparent, and the default setting leaves it barely visible.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Properties specific to this component. */
export interface CheckerOwnProps {
  /** Side of one square, in pixels. @defaultValue 24 */
  size?: number
  /** Opacity of the filled squares, between 0 and 1. @defaultValue 0.06 */
  strength?: number
  /** Colour of the filled squares. */
  color?: string
}

/** Every property. */
export type CheckerProps = Customisable<CheckerOwnProps>

/**
 * Background checker.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Checker className="o-absolute o-inset-0" size={32} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Checker({
  size = 24,
  strength = 0.06,
  color = 'var(--o-palette-zinc-500, oklch(55.2% 0.016 285.938))',
  ...rest
}: CheckerProps): ReactElement {
  const tile = `color-mix(in oklab, ${color} ${String(Math.round(strength * 100))}%, transparent)`
  // The tile is two squares on a side: the conic cuts its four quarters there.
  const period = `${String(size * 2)}px`

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          backgroundImage: `conic-gradient(${tile} 0 25%, transparent 0 50%, ${tile} 0 75%, transparent 0)`,
          backgroundSize: `${period} ${period}`,
        } as CSSProperties
      }
      aria-hidden
    />
  )
}
