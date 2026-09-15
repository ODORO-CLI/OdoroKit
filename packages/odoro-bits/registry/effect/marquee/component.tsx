/**
 * Scrolling banner, endless.
 *
 * ## The content is rendered twice
 *
 * An endless scroll requires the end of the content to be followed by its
 * beginning. The only way to get there without computation is to render the
 * content twice and to translate the whole by exactly half: at the moment the
 * first copy disappears, the second takes its place to the pixel, and the
 * cycle starts again without a jump.
 *
 * The copy is removed from the accessibility tree: a screen reader would
 * otherwise announce the same thing twice.
 *
 * ## The duration follows the width
 *
 * A fixed duration would scroll a short banner as slowly as a long one. The
 * setting is therefore a speed, and the duration is derived from the real
 * width of the content — read again when it changes.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface MarqueeOwnProps {
  /** Scrolling content. */
  children: ReactNode
  /** Duration of one cycle for a hundred percent of width, in seconds. @defaultValue 40 */
  speed?: number
  /** Reverses the direction of the scroll. @defaultValue false */
  reverse?: boolean
  /** Suspends the scroll on hover. @defaultValue true */
  pauseOnHover?: boolean
  /** Width of the side fades, as a percentage. @defaultValue 12 */
  fade?: number
}

/** All properties. */
export type MarqueeProps = Customisable<MarqueeOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-marquee'

/** Sets the animation, once per document. */
function ensureMarqueeRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@keyframes o-marquee{to{transform:translateX(-50%)}}',
    '@keyframes o-marquee-reverse{from{transform:translateX(-50%)}to{transform:none}}',
    '[data-o-marquee]{overflow:hidden;',
    '-webkit-mask:linear-gradient(90deg,transparent,black var(--o-marquee-fade),black calc(100% - var(--o-marquee-fade)),transparent);',
    'mask:linear-gradient(90deg,transparent,black var(--o-marquee-fade),black calc(100% - var(--o-marquee-fade)),transparent)}',
    '[data-o-marquee] > div{display:flex;width:max-content;',
    'animation:o-marquee var(--o-marquee-duration) linear infinite}',
    '[data-o-marquee-reverse] > div{animation-name:o-marquee-reverse}',
    '[data-o-marquee-pause]:hover > div{animation-play-state:paused}',
    '@media (prefers-reduced-motion:reduce){[data-o-marquee] > div{animation:none}}',
    '[data-o-marquee-frozen] > div{animation:none}',
  ].join('')
  document.head.append(style)
}

/**
 * Scrolls a content endlessly.
 *
 * @example
 * <Marquee speed={30} className="o-py-4">
 *   {logos.map((logo) => (
 *     <span key={logo} className="o-px-8">
 *       {logo}
 *     </span>
 *   ))}
 * </Marquee>
 */
export function Marquee({
  children,
  speed = 40,
  reverse = false,
  pauseOnHover = true,
  fade = 12,
  ...rest
}: MarqueeProps): ReactElement {
  const { reduced } = useMotionState()
  const [track, setTrack] = useState<HTMLElement | null>(null)
  const [duration, setDuration] = useState(speed)
  ensureMarqueeRule()

  useEffect(() => {
    if (track === null) return

    // The duration is derived from the width: a speed setting must give the
    // same apparent scroll whatever the content.
    const measure = (): void => {
      const width = track.scrollWidth / 2
      const viewport = track.parentElement?.clientWidth ?? 1
      setDuration(Math.max(2, (width / Math.max(viewport, 1)) * speed))
    }

    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [track, speed, children])

  const { className, style } = mergePresentation({ className: 'o-relative' }, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          '--o-marquee-duration': `${duration.toFixed(2)}s`,
          '--o-marquee-fade': `${String(fade)}%`,
        } as CSSProperties
      }
      // The attribute also carries the clipping and the mask, not just the
      // animation: removing it under reduced motion let the copy leave the
      // band and pushed the page by three hundred pixels. The @media rule of
      // the stylesheet already stops the scroll.
      data-o-marquee=""
      data-o-marquee-frozen={reduced ? '' : undefined}
      data-o-marquee-reverse={reverse ? '' : undefined}
      data-o-marquee-pause={pauseOnHover ? '' : undefined}
    >
      <div ref={setTrack}>
        <div className="o-flex">{children}</div>
        {/* The copy is there for the eye only: it must not be announced. */}
        <div aria-hidden className="o-flex">
          {children}
        </div>
      </div>
    </div>
  )
}
