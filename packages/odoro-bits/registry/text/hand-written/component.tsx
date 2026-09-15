/**
 * Signature: a stroke draws itself in a single gesture, as with a pen.
 *
 * ## A dash as long as the path
 *
 * The stroke is not revealed by a sliding mask: it is a dash whose length
 * equals the whole path, moved by its own offset. When the offset equals the
 * length, the dash is entirely out and nothing is painted; when it falls back
 * to zero, the stroke is complete. The pen therefore advances along the curve,
 * following its loops and its returns — something no rectangular mask could
 * do.
 *
 * The path declares a length of one hundred: the keyframes read as percentages
 * and hold for any signature, whatever the real length of its outline. That is
 * what makes it possible to pass one's own as a property without touching
 * anything else.
 *
 * ## No hollow shape
 *
 * `logo-draw` lets its mark show as a watermark during the drawing: a
 * half-drawn logo is only a fragment, and the eye needs to know what is
 * missing. A signature, no — seeing it in advance would destroy the only point
 * of the gesture. It is read only once laid down.
 *
 * ## The complete stroke is the starting state
 *
 * The offset is zero in the stylesheet: without JavaScript, the signature is
 * there, whole. It is the animation code that takes it away before laying it
 * down again, never the render.
 *
 * ## What the signature is not
 *
 * A drawing, not a text. The name it carries appears once, in one piece, for
 * screen readers; the stroke is removed from the accessibility tree.
 *
 * ## Reduced motion
 *
 * The signature fully drawn, at a standstill: that is the arrival state.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, type ElementType, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** What triggers the drawing. */
export type HandWrittenTrigger = 'mount' | 'view' | 'hover'

/** Properties specific to the component. */
export interface HandWrittenOwnProps {
  /** Name the signature carries, announced to screen readers. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /**
   * Stroke of the signature, as SVG path data. A single continuous stroke: a
   * signature does not lift the pen.
   * @defaultValue a flourish
   */
  path?: string
  /** View of the stroke. To be changed along with the path. @defaultValue '0 0 320 110' */
  viewBox?: string
  /** Width of the drawing, in pixels. @defaultValue 280 */
  width?: number
  /** Thickness of the stroke, in view units. @defaultValue 5 */
  thickness?: number
  /** Duration of the drawing, in milliseconds. @defaultValue 1800 */
  duration?: number
  /** Colour of the ink. @defaultValue the text colour */
  color?: string
  /**
   * When to draw.
   *
   * `view` waits for the entry into the viewport, `mount` starts right away,
   * `hover` replays on every entry of the pointer.
   *
   * @defaultValue 'view'
   */
  trigger?: HandWrittenTrigger
}

/** All properties. */
export type HandWrittenProps = Customisable<HandWrittenOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-hand-written'

/**
 * Default flourish: an opening loop, three downstrokes, and the underline that
 * comes back beneath the word without the pen having been lifted.
 */
const FLOURISH = [
  'M 26 74',
  'C 18 44, 44 18, 66 26',
  'C 86 34, 78 66, 60 74',
  'C 46 80, 34 74, 40 60',
  'C 52 32, 84 26, 104 40',
  'C 118 50, 112 72, 96 74',
  'C 84 76, 80 64, 88 56',
  'C 100 44, 122 44, 132 58',
  'C 140 70, 134 78, 124 74',
  'C 112 70, 116 52, 132 48',
  'C 146 44, 152 56, 148 70',
  'C 146 78, 152 80, 158 72',
  'C 168 58, 186 50, 198 58',
  'C 210 66, 204 80, 190 78',
  'C 178 76, 178 60, 192 52',
  'C 214 40, 252 44, 270 62',
  'C 280 72, 274 86, 258 84',
  'C 232 80, 176 90, 120 92',
  'C 84 93, 48 90, 30 84',
].join(' ')

/** View of the default flourish. */
const FLOURISH_VIEW = '0 0 320 110'

/** Even ease out, barely slowed at the end: a hand does not brake. */
const CURVE = 'cubic-bezier(0.35, 0.1, 0.3, 1)'

/** Sets the drawing, once per document. */
function ensureHandRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-hand]{display:inline-block;line-height:0}',
    '[data-o-hand] svg{display:block;height:auto}',
    // Zero offset: the signature is laid down. See the module header.
    '[data-o-hand-line]{stroke-dasharray:100 100;stroke-dashoffset:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Draws a handwritten signature.
 *
 * @example
 * <HandWritten>Odoro</HandWritten>
 *
 * @example
 * // One's own signature, in its own view, replayed on hover.
 * <HandWritten
 *   path="M 10 60 C 60 10, 120 90, 190 40"
 *   viewBox="0 0 200 100"
 *   trigger="hover"
 * >
 *   Camille
 * </HandWritten>
 */
export function HandWritten({
  children,
  as: Tag = 'span',
  path = FLOURISH,
  viewBox = FLOURISH_VIEW,
  width = 280,
  thickness = 5,
  duration = 1800,
  color = 'currentColor',
  trigger = 'view',
  ...rest
}: HandWrittenProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>({
    immediate: trigger === 'mount',
  })

  ensureHandRule()

  useEffect(() => {
    const element = ref.current
    if (element === null || reduced) return

    const stroke = element.querySelector<SVGPathElement>('[data-o-hand-line]')
    if (stroke === null) return

    let animation: Animation | null = null

    const stop = (): void => {
      animation?.cancel()
      animation = null
    }

    const play = (): void => {
      stop()
      animation = stroke.animate(
        [{ strokeDashoffset: '100' }, { strokeDashoffset: '0' }],
        { duration, easing: CURVE, fill: 'both' },
      )
    }

    if (trigger === 'hover') {
      // Nothing is erased in advance: the signature waits, laid down, and it
      // is the animation itself that takes it away while it rewrites it.
      const onEnter = (): void => {
        play()
      }
      element.addEventListener('pointerenter', onEnter)
      return () => {
        element.removeEventListener('pointerenter', onEnter)
        stop()
      }
    }

    if (!inView) {
      // The erased state is written here, not in the render: see the header.
      stroke.style.strokeDashoffset = '100'
      return
    }

    play()
    return () => {
      stop()
      stroke.style.removeProperty('stroke-dashoffset')
    }
  }, [ref, reduced, inView, path, duration, trigger])

  // The width is a base, not a constraint: it comes first so that a `style`
  // from the caller wins.
  const { className, style } = mergePresentation(
    { style: { width: `${String(width)}px` } },
    rest,
  )

  return (
    <Tag {...rest} ref={ref} className={className} style={style} data-o-hand="">
      {/* The name, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <svg aria-hidden viewBox={viewBox} width="100%">
        <path
          data-o-hand-line=""
          d={path}
          pathLength={100}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Tag>
  )
}
