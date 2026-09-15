/**
 * Shooting star border: two points of light travel along the outline, one on
 * the top edge heading right, the other on the bottom edge heading left, with
 * a trail that fades out behind them.
 *
 * ## This is neither the border beam nor the neon
 *
 * The border beam spins a conic gradient around the center: an arc going all
 * the way round. The neon corrects that spin so it advances at a constant
 * speed along the edge. Here there is no going round: two stars, in a
 * straight line, each on its own edge and in its own direction, born at one
 * corner and dying at the other. It is the image of a shooting star — a
 * trajectory, not an orbit.
 *
 * ## The star is a gradient three times wider than the frame
 *
 * A radial disc on a layer three widths across, parked off screen, which the
 * animation makes cross over. The content, laid on top with a background of
 * its own, only lets the layer show through the one pixel line around it: the
 * star and its trail exist nowhere else. An `overflow:hidden` on the frame
 * holds back what spills out. Nothing is measured, nothing is computed.
 *
 * ## The content carries the background, not the frame
 *
 * If the frame had a background, it would cover the stars. So it is the
 * content that is opaque, on theme surface, with a thin line: what one
 * frames looks like a card, and that is what one expects from a
 * border.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface StarBorderOwnProps {
  /** Framed content. */
  children: ReactNode
  /** Token of the star color. @defaultValue '--o-palette-brand-400' */
  color?: string
  /** Duration of one pass of a star, in milliseconds. @defaultValue 6000 */
  speed?: number
  /** Width of the line the star shines in, in pixels. @defaultValue 1 */
  thickness?: number
  /** Strength of the trail, from zero to one. @defaultValue 0.7 */
  glow?: number
}

/** All properties. */
export type StarBorderProps = Customisable<StarBorderOwnProps>

/** Token used by default. */
const DEFAULT_TOKEN = '--o-palette-brand-400'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-star-border'

/** Sets up the frame, the two stars and the content, once per document. */
function ensureStarRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-star]{',
    'position:relative;display:inline-block;overflow:hidden;isolation:isolate;',
    'padding:var(--o-star-thickness);border-radius:999px;',
    '}',
    // The layer of one star: three widths, half a height, a disc.
    '[data-o-star-streak]{',
    'position:absolute;z-index:0;width:300%;height:50%;pointer-events:none;',
    'opacity:var(--o-star-glow);',
    'background:radial-gradient(circle,var(--o-star-color),transparent 12%);',
    'animation-duration:var(--o-star-speed);animation-timing-function:linear;',
    'animation-iteration-count:infinite;',
    '}',
    '[data-o-star-streak="top"]{top:-11px;left:-250%;animation-name:o-star-top}',
    '[data-o-star-streak="bottom"]{bottom:-11px;right:-250%;animation-name:o-star-bottom}',
    // Each star is born at full strength at one corner and fades at the other.
    '@keyframes o-star-top{from{transform:translateX(0);opacity:var(--o-star-glow)}to{transform:translateX(100%);opacity:0}}',
    '@keyframes o-star-bottom{from{transform:translateX(0);opacity:var(--o-star-glow)}to{transform:translateX(-100%);opacity:0}}',
    // The content: opaque, on top, with the radius of the frame.
    '[data-o-star-content]{',
    'position:relative;z-index:1;border-radius:inherit;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    '}',
    // Reduced motion: each star parked in the middle of its edge.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-star-streak]{animation:none}',
    '[data-o-star-streak="top"]{transform:translateX(50%)}',
    '[data-o-star-streak="bottom"]{transform:translateX(-50%)}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Frames a piece of content with two shooting stars.
 *
 * @example
 * <StarBorder className="o-rounded-full">
 *   <button type="button" className="o-px-6 o-py-3">Get started</button>
 * </StarBorder>
 *
 * @example
 * // A card, sky stars, slower and more discreet.
 * <StarBorder color="--o-palette-sky-400" speed={9000} glow={0.5} className="o-rounded-xl">
 *   <div className="o-p-6">A featured offer</div>
 * </StarBorder>
 */
export function StarBorder({
  children,
  color = DEFAULT_TOKEN,
  speed = 6000,
  thickness = 1,
  glow = 0.7,
  ...rest
}: StarBorderProps): ReactElement {
  ensureStarRules()

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-star=""
      className={className}
      style={
        {
          '--o-star-color': `var(${color})`,
          '--o-star-speed': `${String(speed)}ms`,
          '--o-star-thickness': `${String(thickness)}px`,
          '--o-star-glow': String(glow),
          ...style,
        } as CSSProperties
      }
    >
      <span aria-hidden="true" data-o-star-streak="top" />
      <span aria-hidden="true" data-o-star-streak="bottom" />
      <div data-o-star-content="">{children}</div>
    </div>
  )
}
