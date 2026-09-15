/**
 * Counter: a number climbs to its value, when it enters the viewport.
 *
 * ## The final number is always in the DOM
 *
 * A counter that only wrote its current value would have a screen reader say
 * "0" — then "12", then "47", on every frame. Which is unbearable to the ear,
 * and wrong the moment you copy it.
 *
 * The final number is therefore rendered as is, once and for all. It is the one
 * that gets announced, copied, indexed. The intermediate values live in an
 * `aria-hidden` layer laid over it, which only exists for the duration of the
 * animation.
 *
 * ## The digits must not jitter
 *
 * In most fonts, a "1" is narrower than an "8". A counter that crosses a
 * thousand values therefore sees its width change on every frame, and pushes
 * whatever follows it. `font-variant-numeric: tabular-nums` gives every digit
 * the same advance width — that is exactly what this feature exists for.
 *
 * ## Formatting goes through `Intl`
 *
 * Separating thousands by hand gives "1,234" to a French reader, who reads a
 * decimal number in it. `Intl.NumberFormat` knows the convention of each
 * language, including the narrow no-break spaces of French.
 *
 * ## A loop that stops
 *
 * The animation runs on `requestAnimationFrame` — a value in JavaScript is not
 * a CSS property, the compositor does not know how to interpolate it. But it
 * lasts a second and a half, then stops: this is not a render loop, it is a
 * transition.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Properties specific to the component. */
export interface CountUpOwnProps {
  /** Target value. */
  value: number
  /** Starting value. @defaultValue 0 */
  from?: number
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Duration of the climb, in milliseconds. @defaultValue 1500 */
  duration?: number
  /** Delay before the start, in milliseconds. @defaultValue 0 */
  delay?: number
  /**
   * Formatting language.
   *
   * By default, the browser's — and not a hard-coded `fr-FR`: a counter that
   * shows no-break spaces to an English reader looks broken.
   */
  locale?: string
  /** Number of decimals. @defaultValue 0 */
  decimals?: number
  /** Text glued before the number. */
  prefix?: string
  /** Text glued after the number. */
  suffix?: string
  /**
   * When to start.
   *
   * @defaultValue 'view'
   */
  trigger?: 'view' | 'mount'
}

/** All properties. */
export type CountUpProps = Customisable<CountUpOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-count-up'

/** Sets the layer rules, once per document. */
function ensureCountUpRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The fixed advance width applies to both: without it, the final number
    // would not have the same width as the values scrolling above it.
    '[data-o-count-up]{position:relative;font-variant-numeric:tabular-nums}',
    '[data-o-count-up-layer]{position:absolute;inset:0;pointer-events:none}',
    '[data-o-count-up-hidden]{color:transparent}',
  ].join('')
  document.head.append(style)
}

/**
 * Exponential ease out: fast, then slower and slower.
 *
 * This is the profile that gives the impression that the counter "arrives"
 * rather than stops. A linear progression ends on an abrupt cut.
 */
function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * Makes a number climb to its value.
 *
 * @example
 * <CountUp value={12480} suffix=" projects" className="o-text-4xl o-font-bold" />
 *
 * @example
 * // Two decimals, and a start that is not zero.
 * <CountUp value={99.98} from={95} decimals={2} suffix=" %" />
 */
export function CountUp({
  value,
  from = 0,
  as: Tag = 'span',
  duration = 1500,
  delay = 0,
  locale,
  decimals = 0,
  prefix = '',
  suffix = '',
  trigger = 'view',
  ...rest
}: CountUpProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref: viewRef, inView } = useInView<HTMLElement>({
    immediate: trigger === 'mount',
  })

  const layerRef = useRef<HTMLSpanElement | null>(null)
  const [animating, setAnimating] = useState(false)

  ensureCountUpRule()

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [locale, decimals],
  )

  const final = `${prefix}${formatter.format(value)}${suffix}`

  useEffect(() => {
    // Under reduced motion, the number is simply there. That is what we wanted
    // to show anyway; the animation was only the manner.
    if (reduced || !inView) return

    const layer = layerRef.current
    if (layer === null) return

    let frame = 0
    let start: number | undefined
    setAnimating(true)

    const step = (now: number) => {
      start ??= now

      const elapsed = now - start - delay

      if (elapsed < 0) {
        layer.textContent = `${prefix}${formatter.format(from)}${suffix}`
        frame = requestAnimationFrame(step)
        return
      }

      const t = duration <= 0 ? 1 : Math.min(1, elapsed / duration)
      const current = from + (value - from) * easeOutExpo(t)

      layer.textContent = `${prefix}${formatter.format(current)}${suffix}`

      if (t < 1) {
        frame = requestAnimationFrame(step)
        return
      }

      // Done: we clear the layer and hand back to the original number, rather
      // than leaving a rounded value that could differ by one unit painted
      // over it.
      layer.textContent = ''
      setAnimating(false)
    }

    frame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frame)
      layer.textContent = ''
      setAnimating(false)
    }
  }, [inView, reduced, value, from, duration, delay, formatter, prefix, suffix])

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag
      {...rest}
      ref={viewRef}
      className={className}
      style={style as CSSProperties}
      data-o-count-up=""
    >
      <span {...(animating ? { 'data-o-count-up-hidden': '' } : {})}>{final}</span>
      {/* Always rendered, even empty: mounting it only during the animation
          would make its ref null at the moment the effect reads it, and the
          counter would never start. An empty span costs nothing. */}
      <span ref={layerRef} aria-hidden="true" data-o-count-up-layer="" />
    </Tag>
  )
}
