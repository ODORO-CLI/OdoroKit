/**
 * Outline: a wireframe text whose fill rises from the bottom.
 *
 * ## Two superimposed copies, neither waits for the other
 *
 * The real text is rendered as an outline — `-webkit-text-stroke`, transparent
 * fill. A full copy, laid over it and hidden from the accessibility tree, is
 * revealed by an animated `clip-path` that rises: the fill seems to pour into
 * the letters.
 *
 * The outline is only a dressing: for a screen reader, the base text is an
 * ordinary text, there is nothing to compensate for.
 *
 * ## The hidden state is only applied if the reveal will happen
 *
 * The full copy is only clipped by the code that schedules its reveal. If that
 * code never runs — an error, an environment without scripts — the text
 * appears filled, that is, in its final state: an effect that does not play is
 * always better than a truncated heading.
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
export interface StrokeTextOwnProps {
  /** Text to fill. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Thickness of the outline, in pixels. @defaultValue 1.5 */
  strokeWidth?: number
  /** Duration of the rise, in milliseconds. @defaultValue 900 */
  duration?: number
  /** Colour of the outline. @defaultValue brand-300 from the palette */
  stroke?: string
  /** Colour of the fill. @defaultValue brand-500 from the palette */
  fill?: string
}

/** All properties. */
export type StrokeTextProps = Customisable<StrokeTextOwnProps, 'span'>

/** Clip that hides everything: the top inset covers the whole height. */
const HIDDEN_CLIP = 'inset(100% 0 0 0)'

/**
 * Fills an outlined text, from the bottom up, on entering the viewport.
 *
 * @example
 * <StrokeText as="h1" className="o-text-5xl o-font-extrabold">
 *   MASSIVE
 * </StrokeText>
 *
 * @example
 * // Thick outline, slow rise.
 * <StrokeText strokeWidth={3} duration={1800}>Big heading</StrokeText>
 */
export function StrokeText({
  children,
  as: Tag = 'span',
  strokeWidth = 1.5,
  duration = 900,
  stroke = 'var(--o-palette-brand-300)',
  fill = 'var(--o-palette-brand-500)',
  ...rest
}: StrokeTextProps): ReactElement {
  const { reduced } = useMotionState()
  const layer = useRef<HTMLSpanElement | null>(null)
  const host = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = host.current
    const copy = layer.current
    if (element === null || copy === null || reduced) return

    // The hidden state is applied here, not in the render: without this code,
    // the text appears filled. See the module header.
    copy.style.clipPath = HIDDEN_CLIP

    let played = false
    let animation: Animation | undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (played || entries.every((entry) => !entry.isIntersecting)) return
        played = true
        observer.disconnect()

        copy.style.clipPath = ''
        animation = copy.animate(
          [{ clipPath: HIDDEN_CLIP }, { clipPath: 'inset(0 0 0 0)' }],
          {
            duration,
            easing: 'cubic-bezier(0.2, 0, 0, 1)',
            fill: 'both',
          },
        )
      },
      { threshold: 0.4 },
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      animation?.cancel()
      copy.style.clipPath = ''
    }
  }, [reduced, children, duration])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text is there, filled — its final state, with no copy.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={{ color: fill, ...style }}>
        {children}
      </Tag>
    )
  }

  const outlineStyle = {
    WebkitTextStroke: `${String(strokeWidth)}px ${stroke}`,
    WebkitTextFillColor: 'transparent',
  } as CSSProperties

  return (
    <Tag
      {...rest}
      ref={host}
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
    >
      <span style={outlineStyle}>{children}</span>
      {/* The full copy, revealed by the clip. Hidden from screen readers: for
          them, there is only one text. */}
      <span
        ref={layer}
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          color: fill,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {children}
      </span>
    </Tag>
  )
}
