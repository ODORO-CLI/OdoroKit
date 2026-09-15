/**
 * Deferred block: a stand-in covers the content, then fades out to let it
 * appear.
 *
 * ## What the other skeletons do not do
 *
 * The `skeleton-*` entries are still figures: they get mounted, unmounted, and
 * it is the page that decides when. This one contains both states and the
 * passage from one to the other. It serves where the content is already there
 * but must not appear all at once — a showcase, a mockup, a load whose
 * duration is known — and it serves as a pattern to wire onto a real load, by
 * replacing the timer with `loaded`.
 *
 * ## The content is in the document from the start
 *
 * It is not mounted at the end: it is present, waiting behind the stand-in,
 * with its real height. That is what avoids the layout jump at the moment of
 * the passage — the fault this whole family sets out to correct.
 * `--o-lz-height` only serves as a floor, for the case where the content would
 * still be empty.
 *
 * As long as it is covered, it is removed from the accessibility tree and does
 * not receive the pointer: an invisible but clickable link would be a trap.
 *
 * ## The timer, not the frame loop
 *
 * Two moments to keep, not sixty a second: a timer is enough, and the engine
 * loop would be a permanent subscription for two events. The timers are
 * cancelled on unmount.
 *
 * ## Why looping is the default regime
 *
 * The waiting of this component is a **fiction**: `delay` is a number one
 * picks, whereas a real load does not know its duration. Its natural place is
 * therefore where the passage is being shown — showcase, mockup, screenshot —
 * and a passage played once, a few seconds after landing on the page, is seen
 * by nobody. `loop={false}` gives the one-shot version, for a page that drives
 * the moment itself; wired onto a real load, it is `loaded` that gets
 * replaced, and the timer disappears.
 *
 * Under reduced motion, the content is visible immediately and the cycle does
 * not replay: that is the final state, the one the passage was heading for.
 * The rule of the skeleton at rest holds for figures that wait; here, the
 * waiting has an end, and that end is the content.
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

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-lazy-block'

/** Sets up the stand-in, the content and their crossfade, once per document. */
function ensureLazyBlockRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-lz]{position:relative;display:block;width:100%}',
    // A floor, not a height: the content is in charge.
    '[data-o-lz]:not([data-o-lz-loaded]){min-height:var(--o-lz-height)}',
    '[data-o-lz-content]{',
    'opacity:0;pointer-events:none;',
    'transition:opacity var(--o-lz-speed) var(--o-ease-standard);',
    '}',
    '[data-o-lz-loaded] [data-o-lz-content]{opacity:1;pointer-events:auto}',
    '[data-o-lz-veil]{',
    'position:absolute;inset:0;pointer-events:none;',
    'border-radius:var(--o-lz-radius);',
    'background-color:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    'transition:opacity var(--o-lz-speed) var(--o-ease-standard);',
    'animation:o-lz-breathe var(--o-lz-breath) ease-in-out infinite;',
    '}',
    // The stand-in breathes without ever becoming transparent: what it covers
    // must not show through before its time.
    '@keyframes o-lz-breathe{',
    '0%,100%{background-color:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface))}',
    '50%{background-color:color-mix(in oklab,var(--o-theme-line) 38%,var(--o-theme-surface))}',
    '}',
    '[data-o-lz-loaded] [data-o-lz-veil]{opacity:0;animation:none}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-lz-content]{transition:none}',
    '[data-o-lz-veil]{transition:none;animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface LazyBlockOwnProps {
  /** The covered, then revealed, content. */
  children?: ReactNode
  /** Wait before the reveal, in milliseconds. @defaultValue 1400 */
  delay?: number
  /** Duration of the crossfade, in milliseconds. @defaultValue 500 */
  speed?: number
  /** Replay the cycle on a loop: the regime of a showcase or a mockup. @defaultValue true */
  loop?: boolean
  /** Time the content stays visible before setting off again, in milliseconds. @defaultValue 2400 */
  hold?: number
  /** Minimum height during the wait, in pixels. @defaultValue 96 */
  height?: number
  /** Corner radius of the stand-in, in pixels. @defaultValue 12 */
  radius?: number
  /** Label announced to screen readers during the wait. @defaultValue 'Loading content' */
  label?: string
}

/** All the props. */
export type LazyBlockProps = Customisable<LazyBlockOwnProps, 'div'>

/**
 * Covers a piece of content with a stand-in, then reveals it.
 *
 * @example
 * <LazyBlock height={120}>
 *   <Article />
 * </LazyBlock>
 *
 * @example
 * // A single passage: the page decides the moment.
 * <LazyBlock loop={false} delay={900}>{apercu}</LazyBlock>
 */
export function LazyBlock({
  children,
  delay = 1400,
  speed = 500,
  loop = true,
  hold = 2400,
  height = 96,
  radius = 12,
  label = 'Loading content',
  ...rest
}: LazyBlockProps): ReactElement {
  ensureLazyBlockRule()
  const { reduced } = useMotionState()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // The final state, with no passage: the content is there, straight away.
    if (reduced) {
      setLoaded(true)
      return
    }

    setLoaded(false)
    let timer = 0

    const reveal = (): void => {
      setLoaded(true)
      if (loop) timer = window.setTimeout(cover, speed + hold)
    }
    const cover = (): void => {
      setLoaded(false)
      timer = window.setTimeout(reveal, delay)
    }

    timer = window.setTimeout(reveal, delay)

    return () => {
      window.clearTimeout(timer)
    }
  }, [reduced, delay, speed, hold, loop])

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-lz-height': `${String(height)}px`,
    '--o-lz-radius': `${String(radius)}px`,
    '--o-lz-speed': `${String(speed)}ms`,
    // The breathing of the stand-in is independent of the wait: it has to stay
    // legible whether the reveal comes in one second or in ten.
    '--o-lz-breath': `${String(Math.max(600, Math.round(delay / 2)))}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-lz=""
      data-o-lz-loaded={loaded ? '' : undefined}
    >
      {/* The label goes quiet once the content is there: a live region
          repeating "loading" afterwards would say the opposite of the screen. */}
      <span className="o-sr-only" role="status">
        {loaded ? '' : label}
      </span>
      <div data-o-lz-content="" aria-hidden={loaded ? undefined : true}>
        {children}
      </div>
      <span aria-hidden data-o-lz-veil="" />
    </div>
  )
}
