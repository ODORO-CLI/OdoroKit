/**
 * Pressure: the pointer deforms the font itself, axis by axis.
 *
 * ## Two axes, two distances
 *
 * A variable font does not have weights, it has continuous axes. The two most
 * widespread are `wght`, the weight, and `wdth`, the width. This component
 * wires them onto two different distances: the **vertical** gap to the pointer
 * commands the weight, the **horizontal** gap commands the width.
 *
 * The gesture then becomes readable. Moving up or down thickens or thins the
 * whole line; moving to the right stretches the letters being approached and
 * lets those being left behind fall back. Wiring both axes onto the same
 * radial distance would have given a plain bump, and the pointer would have
 * only one thing left to say.
 *
 * ## The font is probed, not assumed
 *
 * `font-variation-settings` is supported by every browser; the loaded font
 * still has to have the axes. An invisible probe is therefore placed inside
 * the element, with the inherited font, and measured at two extremes of each
 * axis. If the width does not move, the axis does not exist.
 *
 * Without `wght`, the fallback is discrete weight: the continuous value is
 * rounded to the hundred, and the browser picks the closest cut in the family.
 * Without `wdth`, the width is simply left alone — an axis that does not
 * answer is better than a simulated stretch that would distort the glyphs.
 *
 * ## A single box measurement per frame
 *
 * The centres of the letters are read once, in coordinates of the element, and
 * measured again when it changes size or when the font finishes arriving. Per
 * frame, all that is left is one box read — that of the element — and one
 * computation per letter. Reading the box of each letter on every frame would
 * trigger as many forced layouts as there are characters.
 *
 * ## The split is a display device
 *
 * The complete text appears once, in one piece; the letters are removed from
 * the accessibility tree.
 *
 * ## Reduced motion
 *
 * The text is rendered as it is, with no split and no axis setting: it is the
 * resting state, the one where the pointer is nowhere.
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
import { useEffect, useRef, type ElementType, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface TextPressureOwnProps {
  /** Text to put under pressure. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Weight at rest, on the `wght` axis. @defaultValue 200 */
  minWeight?: number
  /** Weight under the pointer, on the `wght` axis. @defaultValue 900 */
  maxWeight?: number
  /** Maximum stretch on the `wdth` axis, in width points. @defaultValue 25 */
  stretch?: number
  /** Reach of the pressure, in pixels. @defaultValue 260 */
  radius?: number
  /** Catch-up speed of the pointer. The higher, the snappier. @defaultValue 6 */
  speed?: number
}

/** All properties. */
export type TextPressureProps = Customisable<TextPressureOwnProps, 'span'>

/** No-break space: an ordinary space collapses inside an inline block. */
const NBSP = '\u00A0'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-text-pressure'

/** Reference width: that of the normal cut. */
const REST_WIDTH = 100

/** Width gap, in pixels, beyond which an axis is deemed to exist. */
const PROBE_THRESHOLD = 0.5

/** Sets the pressure rules, once per document. */
function ensurePressureRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pressure]{display:inline-block;position:relative}',
    '[data-o-pressure-letter]{display:inline-block}',
  ].join('')
  document.head.append(style)
}

/** What the probe found in the inherited font. */
interface Axes {
  /** The weight axis answers. */
  readonly weight: boolean
  /** The width axis answers. */
  readonly width: boolean
}

/**
 * Measures the axes of the font inherited by an element.
 *
 * The probe is a child of the element: it therefore inherits exactly the font
 * that will be deformed, including if the page changes it further down the
 * tree.
 */
function probeAxes(host: HTMLElement): Axes {
  if (
    typeof CSS === 'undefined' ||
    !CSS.supports('font-variation-settings', "'wght' 400")
  ) {
    return { weight: false, width: false }
  }

  const probe = document.createElement('span')
  probe.setAttribute('aria-hidden', 'true')
  probe.textContent = 'HAMBURGEFONS'
  probe.style.cssText =
    'position:absolute;left:0;top:0;visibility:hidden;white-space:pre;pointer-events:none'
  host.append(probe)

  const measure = (setting: string): number => {
    probe.style.fontVariationSettings = setting
    return probe.getBoundingClientRect().width
  }

  const weight = Math.abs(measure("'wght' 900") - measure("'wght' 100")) > PROBE_THRESHOLD
  const width = Math.abs(measure("'wdth' 125") - measure("'wdth' 75")) > PROBE_THRESHOLD

  probe.remove()
  return { weight, width }
}

/**
 * Puts a text under the pressure of the pointer, in a variable font.
 *
 * @example
 * <TextPressure as="h1" className="o-text-6xl">
 *   Under pressure
 * </TextPressure>
 *
 * @example
 * // Weight alone, over a short reach.
 * <TextPressure stretch={0} radius={120} minWeight={300}>Tight</TextPressure>
 */
export function TextPressure({
  children,
  as: Tag = 'span',
  minWeight = 200,
  maxWeight = 900,
  stretch = 25,
  radius = 260,
  speed = 6,
  ...rest
}: TextPressureProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)

  ensurePressureRule()

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    const letters = [...element.querySelectorAll<HTMLElement>('[data-o-pressure-letter]')]
    if (letters.length === 0) return

    const axes = probeAxes(element)

    // Centres in coordinates of the element: they move neither on scroll nor
    // when the page shifts, only when the line recomposes.
    let centres = letters.map(() => ({ x: 0, y: 0 }))
    const readCentres = (): void => {
      const frame = element.getBoundingClientRect()
      centres = letters.map((letter) => {
        const box = letter.getBoundingClientRect()
        return {
          x: box.left - frame.left + box.width / 2,
          y: box.top - frame.top + box.height / 2,
        }
      })
    }
    readCentres()

    const observer = new ResizeObserver(readCentres)
    observer.observe(element)
    // A font that arrives after the fact changes every width: without this
    // re-read, the pressure would aim beside the mark forever.
    void document.fonts?.ready.then(readCentres)

    // Raw target and damped point: the pointer jumps from one event to the
    // next, the pressure glides.
    const target = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY }
    const point = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY }

    const onMove = (event: PointerEvent): void => {
      const frame = element.getBoundingClientRect()
      target.x = event.clientX - frame.left
      target.y = event.clientY - frame.top
      if (!Number.isFinite(point.x)) {
        // First arrival: the pressure settles where it is, it does not cross
        // the screen from infinity.
        point.x = target.x
        point.y = target.y
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    // Last values written per letter: without them, every frame rewrites an
    // identical setting and invalidates the layout for nothing.
    const lastWeight = letters.map(() => Number.NaN)
    const lastWidth = letters.map(() => Number.NaN)

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (!Number.isFinite(point.x)) return

        const factor = 1 - Math.exp(-speed * delta)
        point.x += (target.x - point.x) * factor
        point.y += (target.y - point.y) * factor

        const reach = Math.max(1, radius)

        for (let index = 0; index < letters.length; index += 1) {
          const letter = letters[index]
          const centre = centres[index]
          if (letter === undefined || centre === undefined) continue

          // Vertical for the weight, horizontal for the width: see the module
          // header.
          const weightShare = Math.max(0, 1 - Math.abs(point.y - centre.y) / reach)
          const widthShare = Math.max(0, 1 - Math.abs(point.x - centre.x) / reach)

          const weight = minWeight + (maxWeight - minWeight) * weightShare
          const width = REST_WIDTH + stretch * widthShare

          const weightMoves = !(Math.abs(weight - (lastWeight[index] ?? Number.NaN)) < 1)
          const widthMoves = !(Math.abs(width - (lastWidth[index] ?? Number.NaN)) < 0.2)
          if (!weightMoves && !widthMoves) continue
          lastWeight[index] = weight
          lastWidth[index] = width

          if (axes.weight) {
            letter.style.fontVariationSettings = axes.width
              ? `'wght' ${weight.toFixed(0)}, 'wdth' ${width.toFixed(1)}`
              : `'wght' ${weight.toFixed(0)}`
          } else {
            // Fallback: the continuous weight is rounded to the hundred, and
            // the family supplies the closest cut.
            letter.style.fontWeight = String(Math.round(weight / 100) * 100)
          }
        }
      },
      { name: 'text pressure', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      subscription.unsubscribe()
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
      for (const letter of letters) {
        letter.style.removeProperty('font-variation-settings')
        letter.style.removeProperty('font-weight')
      }
    }
  }, [reduced, children, minWeight, maxWeight, stretch, radius, speed])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text is there, at rest, with no split.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const letters = [...children]

  return (
    <Tag {...rest} ref={host} className={className} style={style} data-o-pressure="">
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {letters.map((letter, index) => (
          <span key={`${letter}-${String(index)}`} data-o-pressure-letter="">
            {/* An ordinary space collapses inside an inline block: the
                no-break one keeps its width. */}
            {letter === ' ' ? NBSP : letter}
          </span>
        ))}
      </span>
    </Tag>
  )
}
