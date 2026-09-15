/**
 * Elastic slider: the track stretches when one pulls beyond its stop, and
 * comes back overshooting a little.
 *
 * ## The control stays an `input[type=range]`
 *
 * Everything one sees is decorative; what one handles is the native field,
 * placed on top and made transparent. A slider rebuilt out of `div` loses
 * everything at once: the arrow keys, Home and End, the wheel, the step, the
 * role and the announced value, the form that reads it. None of those points
 * can be rewritten in a few lines, and the omission is invisible to the eye.
 *
 * ## The elasticity is a transform, not a width
 *
 * Beyond the stop, the track is stretched by `scaleX` from the opposite side:
 * the material resists. The factor is written straight on the element, with no
 * React render — one render per pixel travelled would be the opposite of what
 * we are trying to make felt. On release, the transform is removed: the
 * emphasized curve transition makes the return, with the slight overshoot that
 * gives the spring.
 *
 * ## The resistance is bounded and non linear
 *
 * The stretch follows a square root of the overshoot: the first pixels pull a
 * lot, the following ones almost none. A linear relation would give a track
 * one can stretch forever, which resembles no material at all.
 *
 * ## Reduced motion
 *
 * No stretch: the track stays at its size, that is to say at the state where
 * it ends up anyway.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface ElasticSliderOwnProps {
  /** Name of the slider for screen readers. */
  label: string
  /** Lower bound. @defaultValue 0 */
  min?: number
  /** Upper bound. @defaultValue 100 */
  max?: number
  /** Step of the value. @defaultValue 1 */
  step?: number
  /** Value, in controlled mode. */
  value?: number
  /** Value on mount, in uncontrolled mode. By default, the middle. */
  defaultValue?: number
  /** Called on every value change. */
  onChange?: (value: number) => void
  /** Maximum stretch of the track, as a share of its width. @defaultValue 0.12 */
  stretch?: number
  /** Shows the value on the right of the track. @defaultValue true */
  showValue?: boolean
  /** Element placed before the track, an icon for instance. */
  leading?: ReactNode
  /** Neutralizes the slider. @defaultValue false */
  disabled?: boolean
}

/** All the properties. */
export type ElasticSliderProps = Customisable<ElasticSliderOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-elastic-slider'

/** Places the rail, the track and the transparent field, once per document. */
function ensureSliderRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-eslider]{display:flex;align-items:center;gap:0.75rem}',
    '[data-o-eslider][data-o-eslider-disabled]{opacity:0.5;pointer-events:none}',
    '[data-o-eslider-rail]{position:relative;flex:1 1 auto;display:flex;align-items:center;height:1.75rem}',
    '[data-o-eslider-track]{',
    'position:absolute;inset-inline:0;height:6px;border-radius:999px;overflow:hidden;',
    'background:color-mix(in oklab,currentColor 14%,transparent);',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized),',
    'scale var(--o-duration-base) var(--o-ease-standard);',
    '}',
    // Once grabbed, the track thickens: the material tenses before stretching.
    '[data-o-eslider][data-o-eslider-grab] [data-o-eslider-track]{scale:1 1.6}',
    '[data-o-eslider-fill]{',
    'display:block;height:100%;width:calc(var(--o-eslider-ratio) * 100%);',
    'background:var(--o-eslider-accent);',
    '}',
    '[data-o-eslider-thumb]{',
    'position:absolute;top:50%;width:1.05rem;height:1.05rem;border-radius:999px;',
    'left:calc(var(--o-eslider-ratio) * (100% - 1.05rem));translate:0 -50%;',
    'background:var(--o-theme-surface);border:1px solid var(--o-eslider-accent);',
    'box-shadow:0 1px 3px color-mix(in oklab,currentColor 25%,transparent);',
    'transition:scale var(--o-duration-base) var(--o-ease-emphasized);',
    '}',
    '[data-o-eslider][data-o-eslider-grab] [data-o-eslider-thumb]{scale:1.25}',
    // The real control: transparent, above everything, and alone in taking the gesture.
    '[data-o-eslider-rail] input{',
    'position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;',
    'appearance:none;-webkit-appearance:none;background:transparent;cursor:pointer;',
    '}',
    '[data-o-eslider-rail]:has(input:focus-visible) [data-o-eslider-thumb]{',
    'outline:2px solid var(--o-eslider-accent);outline-offset:2px}',
    '[data-o-eslider-value]{',
    'flex:none;min-width:3ch;text-align:right;font-variant-numeric:tabular-nums;opacity:0.7}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-eslider-track],[data-o-eslider-thumb]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Slider whose track stretches beyond the stops.
 *
 * @example
 * <ElasticSlider label="Volume" defaultValue={60} />
 *
 * @example
 * // Controlled mode, with a scale of its own.
 * <ElasticSlider label="Duration" min={5} max={45} step={5} value={duration} onChange={setDuration} />
 */
export function ElasticSlider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onChange,
  stretch = 0.12,
  showValue = true,
  leading,
  disabled = false,
  ...rest
}: ElasticSliderProps): ReactElement {
  const { reduced } = useMotionState()
  const trackRef = useRef<HTMLSpanElement | null>(null)
  const railRef = useRef<HTMLSpanElement | null>(null)
  const [internal, setInternal] = useState(defaultValue ?? Math.round((min + max) / 2))
  const [grabbing, setGrabbing] = useState(false)
  ensureSliderRules()

  const current = Math.min(max, Math.max(min, value ?? internal))
  const ratio = max === min ? 0 : (current - min) / (max - min)

  const onPointerDown = (event: ReactPointerEvent<HTMLSpanElement>): void => {
    if (disabled || event.button !== 0) return
    setGrabbing(true)

    const pull = (pointerX: number): void => {
      const track = trackRef.current
      const rail = railRef.current
      if (track === null || rail === null || reduced) return
      const rect = rail.getBoundingClientRect()
      const over =
        pointerX < rect.left
          ? rect.left - pointerX
          : pointerX > rect.right
            ? pointerX - rect.right
            : 0
      if (over === 0) {
        track.style.transform = ''
        return
      }
      // Square root: the first pixels pull a lot, the following ones almost none.
      const amount = Math.min(1, Math.sqrt(over / Math.max(1, rect.width)))
      track.style.transformOrigin = pointerX < rect.left ? 'right center' : 'left center'
      track.style.transform = `scaleX(${String(1 + amount * stretch)})`
    }

    const onMove = (moveEvent: PointerEvent): void => {
      pull(moveEvent.clientX)
    }

    const finish = (): void => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      // Removing the transform is enough: the transition makes the return.
      if (trackRef.current !== null) trackRef.current.style.transform = ''
      setGrabbing(false)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-eslider=""
      data-o-eslider-grab={grabbing ? '' : undefined}
      data-o-eslider-disabled={disabled ? '' : undefined}
      className={className}
      style={
        {
          '--o-eslider-accent': 'var(--o-palette-brand-500)',
          '--o-eslider-ratio': ratio,
          ...style,
        } as CSSProperties
      }
    >
      {leading !== undefined && <span aria-hidden="true">{leading}</span>}
      <span ref={railRef} data-o-eslider-rail="" onPointerDown={onPointerDown}>
        <span ref={trackRef} data-o-eslider-track="" aria-hidden="true">
          <span data-o-eslider-fill="" />
        </span>
        <span data-o-eslider-thumb="" aria-hidden="true" />
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={current}
          disabled={disabled}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (value === undefined) setInternal(next)
            onChange?.(next)
          }}
        />
      </span>
      {showValue && <span data-o-eslider-value="">{current}</span>}
    </div>
  )
}
