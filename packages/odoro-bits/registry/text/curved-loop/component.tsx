/**
 * Curved loop: a sentence scrolls endlessly along an arc.
 *
 * ## Why `startOffset` and nothing else
 *
 * The text is laid on a path by `textPath`: it is the browser that computes
 * the position and the tilt of each glyph. Scrolling it then amounts to moving
 * a single value, `startOffset`, along that path. No transform, no glyph
 * measurement, no React render: one attribute written per frame.
 *
 * A translation would do something else — it would slide the block of text
 * alongside the curve instead of running it along it.
 *
 * ## The pattern is measured, not guessed
 *
 * For a loop to be invisible, the offset must come back to zero after exactly
 * one repetition. That width depends on the font actually loaded: it is
 * therefore read once, on a copy of the pattern kept off screen, and the
 * number of repetitions needed to cover the path is derived from it. One extra
 * repetition is added, the one entering from the edge.
 *
 * ## Distinction
 *
 * `circular-text` wraps a sentence on a closed ring and turns the ring: the
 * sentence does not move relative to its support. Here the support is open and
 * motionless, and it is the text that runs along it, continuously.
 *
 * ## Accessibility
 *
 * The pattern is repeated as many times as it takes to cover the arc: read as
 * it is, it would announce the sentence five times. The drawing is therefore
 * removed from the accessibility tree, and the sentence appears there once, in
 * full.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ElementType,
  type ReactElement,
} from 'react'

/** Direction of the scroll. */
export type CurvedLoopDirection = 'left' | 'right'

/** Properties specific to the component. */
export interface CurvedLoopOwnProps {
  /** Sentence that scrolls. */
  children: string
  /** Rendered tag. @defaultValue 'div' */
  as?: ElementType
  /** Separator inserted between two repetitions. @defaultValue ' — ' */
  separator?: string
  /** Dip of the curve, from 0 (straight) to 1. @defaultValue 0.5 */
  curve?: number
  /** Type size, in drawing units (total height: 200). @defaultValue 96 */
  size?: number
  /** Speed, in drawing units per second. @defaultValue 60 */
  speed?: number
  /** Direction of the scroll. @defaultValue 'left' */
  direction?: CurvedLoopDirection
}

/** All properties. */
export type CurvedLoopProps = Customisable<CurvedLoopOwnProps>

/** Width of the drawing, in internal units. */
const VIEW_WIDTH = 1000

/** Height of the drawing, in internal units. */
const VIEW_HEIGHT = 200

/** Repetitions rendered before the first measurement. */
const INITIAL_REPEATS = 4

/** Ceiling on repetitions: a very narrow font would ask for a thousand. */
const MAX_REPEATS = 40

/**
 * Runs a sentence along an arc, endlessly.
 *
 * @example
 * <CurvedLoop className="o-w-full">Odoro, a registry of animated components</CurvedLoop>
 *
 * @example
 * // A deep arc, slow, running to the right.
 * <CurvedLoop curve={0.9} speed={28} direction="right">Workshop</CurvedLoop>
 */
export function CurvedLoop({
  children,
  as: Tag = 'div',
  separator = ' — ',
  curve = 0.5,
  size = 96,
  speed = 60,
  direction = 'left',
  ...rest
}: CurvedLoopProps): ReactElement {
  const { reduced } = useMotionState()

  const raw = useId()
  // A React identifier contains colons; placed inside a fragment reference, it
  // becomes fragile. We keep only what is safe.
  const pathId = `o-curved-loop-${raw.replace(/[^a-zA-Z0-9_-]/g, '')}`

  const pathRef = useRef<SVGPathElement | null>(null)
  const patternRef = useRef<SVGTextElement | null>(null)
  const textRef = useRef<SVGTextPathElement | null>(null)

  const [repeats, setRepeats] = useState(INITIAL_REPEATS)

  const pattern = `${children}${separator}`

  // The dip: at zero the curve is a straight line, and the component behaves
  // like an ordinary scrolling banner.
  const dip = Math.max(0, Math.min(1, curve)) * 70
  const path = `M 0 ${String(VIEW_HEIGHT / 2 + dip)} Q ${String(VIEW_WIDTH / 2)} ${String(VIEW_HEIGHT / 2 - dip * 1.8)} ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT / 2 + dip)}`

  useEffect(() => {
    const arc = pathRef.current
    const template = patternRef.current
    const text = textRef.current
    if (arc === null || template === null || text === null) return

    // Without these two measurements — an environment with no SVG layout — the
    // loop would be wrong. The text then stays laid down, motionless:
    // readable.
    if (
      typeof arc.getTotalLength !== 'function' ||
      typeof template.getComputedTextLength !== 'function'
    ) {
      return
    }

    const patternWidth = template.getComputedTextLength()
    if (patternWidth <= 0) return

    const length = arc.getTotalLength()
    const wanted = Math.min(
      MAX_REPEATS,
      Math.ceil((length + patternWidth) / patternWidth) + 1,
    )
    if (wanted !== repeats) setRepeats(wanted)

    // Reduced motion: the pattern is laid at the start of the path and no
    // longer moves. The arc, the text and its shape are all there — only the
    // scrolling is missing, and that is exactly what was asked for.
    if (reduced) {
      text.setAttribute('startOffset', '0')
      return
    }

    const sign = direction === 'left' ? -1 : 1
    const startedAt = performance.now()

    const subscription = clock.subscribe(
      () => {
        const travelled = ((performance.now() - startedAt) / 1000) * speed
        const cycle = (((travelled * sign) % patternWidth) + patternWidth) % patternWidth
        // The pattern starts one repetition before the arc: the one leaving by
        // one edge is never rendered, and the one entering by the other is
        // already there.
        text.setAttribute('startOffset', (cycle - patternWidth).toFixed(2))
      },
      { name: 'curved loop', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [pattern, path, size, speed, direction, reduced, repeats])

  const { className, style } = mergePresentation({ className: 'o-block' }, rest)

  return (
    <Tag {...rest} className={className} style={style}>
      {/* The sentence, once, in full, for screen readers. */}
      <span className="o-sr-only">{children}</span>

      <svg
        aria-hidden="true"
        viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}
        className="o-block o-w-full"
        fill="currentColor"
      >
        <defs>
          <path id={pathId} ref={pathRef} d={path} fill="none" />
        </defs>

        {/*
          The measuring template: a single repetition, out of view, whose real
          width is read once the font has loaded.
        */}
        <text ref={patternRef} x={0} y={-VIEW_HEIGHT} fontSize={size} visibility="hidden">
          {pattern}
        </text>

        <text fontSize={size}>
          <textPath ref={textRef} href={`#${pathId}`} startOffset="0">
            {pattern.repeat(repeats)}
          </textPath>
        </text>
      </svg>
    </Tag>
  )
}
