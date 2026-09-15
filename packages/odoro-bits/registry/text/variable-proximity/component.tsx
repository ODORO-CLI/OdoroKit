/**
 * Proximity weight: each letter thickens as the pointer comes closer.
 *
 * ## What this component does that `text-pressure` does not
 *
 * `text-pressure` wires two axes onto two directions: that is a gesture, and
 * it holds for a poster line. Here there is only one axis, the weight, and a
 * single distance, radial. In exchange, the effect holds over a whole
 * paragraph, over several lines, and reads like a magnifying glass: what is
 * close is heavy, what is far is light.
 *
 * ## The trail comes from the letter, not from the pointer
 *
 * The tracked point is not damped: it is the raw position of the pointer. The
 * damping sits elsewhere — in each letter, which reaches its target weight at
 * its own pace. Consequence: a letter the pointer has just left is still
 * heavy, and the halo leaves a trail behind the gesture instead of following
 * it like a rigid blob.
 *
 * It is the same exponential damping as everywhere else in the registry,
 * computed on the elapsed time so that the trail lasts the same at sixty and
 * at a hundred and twenty frames per second.
 *
 * ## The font is probed, not assumed
 *
 * An invisible probe is placed inside the element, with the inherited font,
 * and measured at two extremes of the `wght` axis. If its width does not move,
 * the axis does not exist: the fallback is then discrete weight, rounded to
 * the hundred, where the browser picks the closest cut of the family.
 *
 * ## A single box measurement per frame
 *
 * The centres of the letters are read once, in coordinates of the element, and
 * measured again when it changes size or when the font finishes arriving. Per
 * frame, all that is left is one box read and one computation per letter.
 *
 * ## The split is a display device
 *
 * The complete text appears once, in one piece; the letters are removed from
 * the accessibility tree.
 *
 * ## Reduced motion
 *
 * The text is rendered as it is, at its resting weight and with no split: it
 * is the state where the pointer is nowhere.
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
export interface VariableProximityOwnProps {
  /** Text to thicken. */
  children: string
  /** Rendered tag. @defaultValue 'p' */
  as?: ElementType
  /** Reach of the magnifying glass, in pixels. @defaultValue 180 */
  radius?: number
  /** Weight far from the pointer, on the `wght` axis. @defaultValue 300 */
  minWeight?: number
  /** Weight under the pointer, on the `wght` axis. @defaultValue 800 */
  maxWeight?: number
  /** Speed at which a letter reaches its weight. The lower, the longer the trail. @defaultValue 10 */
  speed?: number
}

/** All properties. */
export type VariableProximityProps = Customisable<VariableProximityOwnProps, 'p'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-variable-proximity'

/** Width gap, in pixels, beyond which the axis is deemed to exist. */
const PROBE_THRESHOLD = 0.5

/** Sets the magnifying glass rules, once per document. */
function ensureProximityRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-proximity]{position:relative}',
    '[data-o-proximity-letter]{display:inline-block}',
  ].join('')
  document.head.append(style)
}

/**
 * Says whether the font inherited by an element answers the weight axis.
 *
 * The probe is a child of the element: it therefore inherits exactly the font
 * that will be deformed.
 */
function probeWeight(host: HTMLElement): boolean {
  if (
    typeof CSS === 'undefined' ||
    !CSS.supports('font-variation-settings', "'wght' 400")
  ) {
    return false
  }

  const probe = document.createElement('span')
  probe.setAttribute('aria-hidden', 'true')
  probe.textContent = 'HAMBURGEFONS'
  probe.style.cssText =
    'position:absolute;left:0;top:0;visibility:hidden;white-space:pre;pointer-events:none'
  host.append(probe)

  probe.style.fontVariationSettings = "'wght' 100"
  const thin = probe.getBoundingClientRect().width
  probe.style.fontVariationSettings = "'wght' 900"
  const bold = probe.getBoundingClientRect().width

  probe.remove()
  return Math.abs(bold - thin) > PROBE_THRESHOLD
}

/**
 * Thickens the letters of a text as the pointer comes closer to them.
 *
 * @example
 * <VariableProximity as="p" className="o-text-2xl">
 *   A component you cannot modify is not yours.
 * </VariableProximity>
 *
 * @example
 * // Tight glass, long trail.
 * <VariableProximity radius={90} speed={3}>Close up only</VariableProximity>
 */
export function VariableProximity({
  children,
  as: Tag = 'p',
  radius = 180,
  minWeight = 300,
  maxWeight = 800,
  speed = 10,
  ...rest
}: VariableProximityProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)

  ensureProximityRule()

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    const letters = [
      ...element.querySelectorAll<HTMLElement>('[data-o-proximity-letter]'),
    ]
    if (letters.length === 0) return

    const variable = probeWeight(element)

    // Centres in coordinates of the element: scrolling does not change them,
    // only a recomposition of the line does.
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
    // re-read, the glass would aim beside the mark forever.
    void document.fonts?.ready.then(readCentres)

    const pointer = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY }
    const onMove = (event: PointerEvent): void => {
      const frame = element.getBoundingClientRect()
      pointer.x = event.clientX - frame.left
      pointer.y = event.clientY - frame.top
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    // Current weight of each letter: it is what carries the trail.
    const weights = letters.map(() => minWeight)
    const written = letters.map(() => Number.NaN)

    const subscription = clock.subscribe(
      ({ delta }) => {
        const factor = 1 - Math.exp(-speed * delta)
        const reach = Math.max(1, radius)
        const seen = Number.isFinite(pointer.x)

        for (let index = 0; index < letters.length; index += 1) {
          const letter = letters[index]
          const centre = centres[index]
          const current = weights[index]
          if (letter === undefined || centre === undefined || current === undefined) {
            continue
          }

          let share = 0
          if (seen) {
            const dx = pointer.x - centre.x
            const dy = pointer.y - centre.y
            const raw = Math.max(0, 1 - Math.hypot(dx, dy) / reach)
            // Smoothing: a cone lets the edge of the radius show, an S curve
            // melts it into the text.
            share = raw * raw * (3 - 2 * raw)
          }

          const aimed = minWeight + (maxWeight - minWeight) * share
          const next = current + (aimed - current) * factor
          weights[index] = next

          if (Math.abs(next - (written[index] ?? Number.NaN)) < 1) continue
          written[index] = next

          if (variable) {
            letter.style.fontVariationSettings = `'wght' ${next.toFixed(0)}`
          } else {
            // Fallback: the continuous weight is rounded to the hundred, and
            // the family supplies the closest cut.
            letter.style.fontWeight = String(Math.round(next / 100) * 100)
          }
        }
      },
      { name: 'proximity weight', priority: CLOCK_PRIORITY.default },
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
  }, [reduced, children, radius, minWeight, maxWeight, speed])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text is there, at its resting weight, with no split.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const letters = [...children]

  return (
    <Tag {...rest} ref={host} className={className} style={style} data-o-proximity="">
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {letters.map((letter, index) =>
          letter === ' ' ? (
            // A space stays a space, outside the inline block: it is the only
            // way for a paragraph to still be able to wrap. A no-break one
            // would turn the whole text into a single word.
            <span key={`space-${String(index)}`}> </span>
          ) : (
            <span key={`${letter}-${String(index)}`} data-o-proximity-letter="">
              {letter}
            </span>
          ),
        )}
      </span>
    </Tag>
  )
}
