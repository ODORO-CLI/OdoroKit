/**
 * Wobbling jelly: a rounded block sags onto its base, bounces back, and its
 * oscillations die away before it starts again.
 *
 * ## The wobble is a damping
 *
 * A jelly that alternates between two states makes a metronome. What makes it
 * soft is that each bounce is weaker than the last: the initial squash is
 * sharp, the return overshoots a little, the next one much less, and the last
 * is barely visible. The sequence of amplitudes is therefore decreasing, and
 * the steps draw closer together — which is what a soft mass dissipating its
 * energy does.
 *
 * The anchor is at the bottom: the matter squashes towards its base and only
 * the top moves. Anchored at the centre, the shape would expand on both sides
 * at once, which is the motion of a balloon, not of a jelly set down.
 *
 * ## The radius makes the matter
 *
 * Scale alone would give a rectangle flattening. It is the corner radii that
 * make the jelly: they stretch where the matter spreads, tighten where it
 * pulls, and each corner has its own horizontal and vertical radius. It is the
 * only animated property that is not a transform; on a shape of this size, the
 * cost is that of a single rectangle redrawn.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the wait
 * is information, not decoration. The shape is removed from the accessibility
 * tree.
 *
 * Under reduced motion, the block stays at rest, corners rounded: the figure
 * still reads, only the wobble stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-jelly-loader'

/** Sets the jelly and its damped wobble, once per document. */
function ensureJellyRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-jelly-loader]{display:inline-flex;align-items:flex-end;justify-content:center}',
    '[data-o-jelly-body]{',
    // The size is not up for negotiation: the neighbouring label is an
    // element of the same rank, and without this it could squeeze the jelly.
    'flex:none;',
    'width:var(--o-jelly-size);height:var(--o-jelly-size);',
    'background:var(--o-jelly-color);',
    'border-radius:26%;',
    // The base does not move: it is the ground of the jelly.
    'transform-origin:50% 100%;',
    'animation:o-jelly-loader-wobble var(--o-jelly-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-jelly-loader-wobble{',
    '0%{transform:scale(1,1);border-radius:26%}',
    '10%{transform:scale(1.22,0.78);border-radius:44% 44% 30% 30% / 58% 58% 22% 22%}',
    '26%{transform:scale(0.86,1.16);border-radius:30% 30% 44% 44% / 22% 22% 58% 58%}',
    '42%{transform:scale(1.1,0.92);border-radius:36% 36% 28% 28% / 44% 44% 24% 24%}',
    '58%{transform:scale(0.94,1.06);border-radius:28% 28% 34% 34% / 24% 24% 40% 40%}',
    '72%{transform:scale(1.03,0.97);border-radius:30% 30% 26% 26% / 32% 32% 24% 24%}',
    '84%,100%{transform:scale(1,1);border-radius:26%}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-jelly-body]{animation:none;transform:none;border-radius:26%}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface JellyLoaderOwnProps {
  /** Side of the block at rest, in pixels. @defaultValue 40 */
  size?: number
  /** Duration of one full wobble, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Colour of the jelly. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type JellyLoaderProps = Customisable<JellyLoaderOwnProps, 'span'>

/**
 * Signals a wait with a block of jelly wobbling on its base.
 *
 * @example
 * <JellyLoader />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <JellyLoader size={64} speed={2400} color="var(--o-palette-brand-500)" />
 */
export function JellyLoader({
  size = 40,
  speed = 1600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: JellyLoaderProps): ReactElement {
  ensureJellyRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    // The box reserves the room for the highest bounce: without that margin,
    // the top would spill out of the line of text.
    width: `${String(Math.round(size * 1.3))}px`,
    height: `${String(Math.round(size * 1.2))}px`,
    '--o-jelly-size': `${String(size)}px`,
    '--o-jelly-speed': `${String(speed)}ms`,
    '--o-jelly-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-jelly-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-jelly-body="" />
    </span>
  )
}
