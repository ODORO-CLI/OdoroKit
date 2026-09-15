/**
 * Masked heading: an image seen through the letters, and drifting.
 *
 * ## The text is the mask, the image is the ink
 *
 * `background-clip: text` clips the background to the shape of the glyphs.
 * This is not a superimposition: there is only one element, and the letters
 * stay letters — selectable, searchable, announced as they are. No split, no
 * layer, no `aria-label` to maintain.
 *
 * ## A sway, not an endless band
 *
 * An arbitrary image cannot be tiled: scrolling it on a loop would make the
 * seam jump on every turn. The movement therefore goes from one edge to the
 * other then comes back — `alternate` — which has no seam to show. The image
 * is enlarged beyond the frame so that there is something to travel.
 *
 * ## What a browser that cannot clip sees
 *
 * Everything that makes the text invisible — the background, the transparent
 * colour — lives inside a `@supports`. Without the clipping, all that is left
 * is a heading in the current ink. The other way round would have given an
 * absent heading.
 *
 * ## The image says nothing
 *
 * It is a material, not a content: it is the text that carries the meaning,
 * and that is why there is no alternative text to supply. An image that
 * informs has no place here.
 *
 * ## Reduced motion
 *
 * The sway stops at the centre of the image. The heading stays filled: the
 * material is the arrival state, only its movement was the animation.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface MaskedHeadingOwnProps {
  /** Text of the heading. */
  children: ReactNode
  /**
   * Image seen through the letters.
   *
   * Purely decorative: the meaning is carried by the text.
   */
  src: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /**
   * Width of the image, as a share of that of the heading.
   *
   * Beyond a hundred percent, there is something left to travel: that margin
   * is what the sway crosses.
   *
   * @defaultValue 220
   */
  zoom?: number
  /** Duration of one pass, in milliseconds. @defaultValue 14000 */
  speed?: number
}

/** All properties. */
export type MaskedHeadingProps = Customisable<MaskedHeadingOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-masked-heading'

/** Sets the mask rules, once per document. */
function ensureMaskedRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-masked]{display:inline-block}',
    '@keyframes o-masked-pan{',
    'from{background-position:0% 50%}',
    'to{background-position:100% 50%}',
    '}',
    // Everything that makes the text invisible lives here: without the
    // clipping, a heading in the current ink is left. See the header.
    '@supports ((-webkit-background-clip:text) or (background-clip:text)){',
    '[data-o-masked]{',
    'background-image:var(--o-masked-image);',
    'background-size:var(--o-masked-zoom) auto;',
    'background-repeat:no-repeat;',
    'background-position:0% 50%;',
    '-webkit-background-clip:text;',
    'background-clip:text;',
    'color:transparent;',
    'animation:o-masked-pan var(--o-masked-speed) ease-in-out infinite alternate;',
    '}',
    '}',
    // With no motion, the image settles at the centre and no longer moves.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-masked]{animation:none;background-position:50% 50%}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Fills a heading with an image that sways slowly.
 *
 * @example
 * <MaskedHeading as="h1" src="/textures/concrete.jpg" className="o-text-6xl o-font-black">
 *   Material
 * </MaskedHeading>
 *
 * @example
 * // A tight framing, a brisker sway.
 * <MaskedHeading src="/textures/waves.jpg" zoom={400} speed={6000}>
 *   Tide
 * </MaskedHeading>
 */
export function MaskedHeading({
  children,
  src,
  as: Tag = 'span',
  zoom = 220,
  speed = 14000,
  ...rest
}: MaskedHeadingProps): ReactElement {
  ensureMaskedRule()

  const { className, style } = mergePresentation({}, rest)

  const rootStyle = {
    ...style,
    // The value is set by the property, never concatenated into a stylesheet:
    // nothing the address contains can become CSS.
    '--o-masked-image': `url(${JSON.stringify(src)})`,
    '--o-masked-zoom': `${String(Math.max(100, zoom))}%`,
    '--o-masked-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <Tag {...rest} className={className} style={rootStyle} data-o-masked="">
      {children}
    </Tag>
  )
}
