/**
 * Drawn underline: a freehand stroke that draws itself under the text.
 *
 * ## `pathLength`, free normalisation
 *
 * For an SVG stroke, drawing itself means animating `stroke-dashoffset` of a
 * dash as long as the path. The real length of the path depends on its curves
 * — but `pathLength="1"` declares it equal to 1, and both the dash and the
 * offset become constants. No measurement, no computation in JavaScript.
 *
 * The stroke is deliberately irregular — two curves that undulate — because a
 * perfectly straight underline drawing itself looks like a progress bar.
 * `vector-effect: non-scaling-stroke` keeps the thickness in pixels whatever
 * the stretching of the SVG under the word.
 *
 * ## Two triggers, a single mechanism
 *
 * On hover, it is a CSS transition that `:hover` arms and disarms — the stroke
 * erases itself backwards when the pointer leaves, for free. On entering the
 * viewport, an observer sets the same attribute once and for all. In both
 * cases, the transition does the work.
 *
 * The stroke is an ornament: the SVG is hidden from the accessibility tree,
 * the text stays a text. Under reduced motion, the stroke is simply there,
 * already drawn.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

/** Properties specific to the component. */
export interface UnderlineDrawOwnProps {
  /** Text to underline. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /**
   * What triggers the drawing.
   *
   * `view` draws once, on entering the viewport. `hover` draws on hover or on
   * focus — of the text itself, or of the link that wraps it — and erases on
   * the way back.
   *
   * @defaultValue 'view'
   */
  trigger?: 'view' | 'hover'
  /** Thickness of the stroke, in pixels. @defaultValue 3 */
  thickness?: number
  /** Duration of the drawing, in milliseconds. @defaultValue 700 */
  duration?: number
  /** Colour of the stroke. @defaultValue brand-400 from the palette */
  color?: string
}

/** All properties. */
export type UnderlineDrawProps = Customisable<UnderlineDrawOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-underline-draw'

/** Sets the stroke rules, once per document. */
function ensureUnderlineRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-underline]{position:relative;display:inline-block}',
    '[data-o-underline] svg{',
    'position:absolute;left:0;right:0;bottom:-0.18em;width:100%;height:0.32em;',
    'overflow:visible;pointer-events:none;',
    '}',
    // Thanks to pathLength=1, the dash and its offset are constants.
    '[data-o-underline] path{',
    'stroke-dasharray:1;stroke-dashoffset:1;',
    'transition:stroke-dashoffset var(--o-underline-duration) cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-underline-on] path{stroke-dashoffset:0}',
    // The hover of the text, or that of the link wrapping it: the stroke of
    // menus draws itself as soon as the pointer touches the clickable area.
    '[data-o-underline-trigger="hover"]:hover path,',
    '[data-o-underline-trigger="hover"]:focus-visible path,',
    ':where(a,button):hover [data-o-underline-trigger="hover"] path,',
    ':where(a,button):focus-visible [data-o-underline-trigger="hover"] path{',
    'stroke-dashoffset:0;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Draws an irregular underline beneath a text.
 *
 * @example
 * <p className="o-text-3xl o-font-bold">
 *   A <UnderlineDraw>deliberate</UnderlineDraw> choice.
 * </p>
 *
 * @example
 * // Inside a link: the stroke draws on hover, erases on leaving.
 * <a href="/pricing">
 *   <UnderlineDraw trigger="hover">See the pricing</UnderlineDraw>
 * </a>
 */
export function UnderlineDraw({
  children,
  as: Tag = 'span',
  trigger = 'view',
  thickness = 3,
  duration = 700,
  color = 'var(--o-palette-brand-400)',
  ...rest
}: UnderlineDrawProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)
  ensureUnderlineRule()

  useEffect(() => {
    const element = host.current
    if (element === null || reduced || trigger !== 'view') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.every((entry) => !entry.isIntersecting)) return
        // The attribute arms the transition; the observer has finished its
        // work.
        element.setAttribute('data-o-underline-on', '')
        observer.disconnect()
      },
      { threshold: 0.6 },
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      element.removeAttribute('data-o-underline-on')
    }
  }, [reduced, trigger])

  const { className, style } = mergePresentation({}, rest)

  const underlineStyle = {
    ...style,
    '--o-underline-duration': `${String(duration)}ms`,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      ref={host}
      className={className}
      style={underlineStyle}
      data-o-underline=""
      data-o-underline-trigger={trigger}
      // Reduced motion: the stroke is already drawn on the first render, and
      // since it is born at its final value, the transition has nothing to
      // play.
      {...(reduced ? { 'data-o-underline-on': '' } : {})}
    >
      {children}
      <svg aria-hidden viewBox="0 0 100 10" preserveAspectRatio="none">
        {/* Two slightly mismatched curves: the stroke of a marker pen, not a
            ruler. */}
        <path
          d="M 3 7 Q 25 2.5 50 5.5 Q 75 8.5 97 4"
          pathLength={1}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </Tag>
  )
}
