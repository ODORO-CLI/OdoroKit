/**
 * Option wheel: a drum one turns and that settles on a value, like the wheel
 * of a date picker.
 *
 * ## This is real scrolling, not a simulation
 *
 * The wheel is an area that scrolls with `scroll-snap-type`: the scroll
 * wheel, the finger, the scrollbar, the inertia of the system and the
 * snapping onto the centre line are the browser's own. Rewriting that from
 * the pointer would give an approximate inertia, different on every device,
 * and a drum that ignores the scroll wheel.
 *
 * ## The curve is painted, the value is set at the stop
 *
 * On every useful frame, each row receives a rotation proportional to its
 * distance to the centre — a direct write, with no React render. The value,
 * for its part, is published only once the scrolling stops: publishing it
 * along the way would make everything that listens to it flicker during the
 * gesture.
 *
 * ## The rows all have the same height
 *
 * That is what makes the position legible: the row at the centre is the
 * quotient of the scroll by the height of a row. A drum with unequal rows
 * would call for one measure per row on every frame, for an object whose
 * whole point is regularity.
 *
 * ## Reduced motion
 *
 * No curve and no animated scrolling: the wheel becomes a flat list that
 * jumps to the chosen option — its final state.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

/** An option of the wheel. */
export interface WheelOption {
  /** Value returned by `onChange`. */
  readonly value: string
  /** Displayed label. */
  readonly label: string
}

/** Props specific to the component. */
export interface OptionWheelOwnProps {
  /** The options, in drum order. */
  options: readonly WheelOption[]
  /** Name of the wheel for screen readers. */
  label: string
  /** Chosen option, in controlled mode. */
  value?: string
  /** Option chosen on mount, in uncontrolled mode. */
  defaultValue?: string
  /** Called when the wheel settles on an option. */
  onChange?: (value: string) => void
  /** Number of visible rows. An odd number centres the chosen row. @defaultValue 5 */
  visible?: number
  /** Tilt added per row of distance to the centre. @defaultValue 18 */
  curve?: number
}

/** All the props. */
export type OptionWheelProps = Customisable<OptionWheelOwnProps>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-option-wheel'

/** Sets the drum, its rows and the centre window, once per document. */
function ensureWheelRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-wheel]{position:relative;isolation:isolate}',
    '[data-o-wheel-scroll]{',
    // The visible window of an area that scrolls is its padding box: without
    // `border-box`, the inner padding would grow the drum.
    'position:relative;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;',
    'scroll-snap-type:y mandatory;perspective:600px;transform-style:preserve-3d;',
    'height:calc(var(--o-wheel-visible) * var(--o-wheel-row));',
    'padding-block:calc((var(--o-wheel-visible) - 1) / 2 * var(--o-wheel-row));',
    // The ends fade away: the drum has no hard edge.
    '-webkit-mask-image:linear-gradient(to bottom,transparent,currentColor 35%,currentColor 65%,transparent);',
    'mask-image:linear-gradient(to bottom,transparent,currentColor 35%,currentColor 65%,transparent);',
    '}',
    '[data-o-wheel-scroll]::-webkit-scrollbar{display:none}',
    '[data-o-wheel-scroll]:focus-visible{outline:2px solid var(--o-wheel-accent);outline-offset:2px;border-radius:0.6rem}',
    '[data-o-wheel-scroll] [role="option"]{',
    'display:flex;align-items:center;justify-content:center;',
    'height:var(--o-wheel-row);scroll-snap-align:center;cursor:pointer;',
    'white-space:nowrap;backface-visibility:hidden;',
    'transition:color var(--o-duration-fast) linear;',
    '}',
    '[data-o-wheel-scroll] [role="option"][aria-selected="true"]{color:var(--o-wheel-accent);font-weight:600}',
    // The window: two rules that mark the row held.
    '[data-o-wheel-window]{',
    'position:absolute;left:0;right:0;top:50%;height:var(--o-wheel-row);',
    'translate:0 -50%;pointer-events:none;z-index:1;',
    'border-top:1px solid var(--o-theme-line);border-bottom:1px solid var(--o-theme-line);',
    'background:color-mix(in oklab,var(--o-wheel-accent) 7%,transparent);',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Option wheel with scrolling and snapping.
 *
 * @example
 * <OptionWheel
 *   label="Duration"
 *   options={[
 *     { value: '15', label: '15 minutes' },
 *     { value: '30', label: '30 minutes' },
 *   ]}
 *   defaultValue="30"
 * />
 *
 * @example
 * // Controlled mode, seven visible rows and a more marked curve.
 * <OptionWheel label="City" options={cities} value={city} onChange={setCity} visible={7} curve={26} />
 */
export function OptionWheel({
  options,
  label,
  value,
  defaultValue,
  onChange,
  visible = 5,
  curve = 18,
  ...rest
}: OptionWheelProps): ReactElement {
  const { reduced } = useMotionState()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const rowHeight = useRef(0)
  const frame = useRef(0)
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mounted = useRef(false)
  const baseId = useId()
  const [internal, setInternal] = useState<string | undefined>(defaultValue)
  ensureWheelRules()

  const current = value ?? internal ?? options[0]?.value
  const currentIndex = Math.max(
    0,
    options.findIndex((option) => option.value === current),
  )

  const choose = (next: string): void => {
    if (next === current) return
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  /** Tilts each row according to its distance to the centre row. */
  const paint = (): void => {
    frame.current = 0
    const host = scrollRef.current
    const row = rowHeight.current
    if (host === null || row === 0) return
    const center = host.scrollTop / row
    const half = Math.max(1, (visible - 1) / 2)

    for (const [index, element] of Array.from(
      host.querySelectorAll<HTMLElement>('[role="option"]'),
    ).entries()) {
      const away = index - center
      const far = Math.min(1, Math.abs(away) / (half + 0.5))
      element.style.opacity = String(1 - far * 0.75)
      element.style.transform = reduced
        ? ''
        : `rotateX(${String(-away * curve)}deg) translateZ(${String(-Math.abs(away) * 6)}px)`
    }
  }

  const onScroll = (): void => {
    if (frame.current === 0 && typeof requestAnimationFrame === 'function') {
      frame.current = requestAnimationFrame(paint)
    }
    // The snap is published at the stop: `scrollend` is not everywhere, a
    // silence of a few frames is.
    clearTimeout(settle.current)
    settle.current = setTimeout(() => {
      const host = scrollRef.current
      const row = rowHeight.current
      if (host === null || row === 0) return
      const index = Math.round(host.scrollTop / row)
      const option = options[Math.min(options.length - 1, Math.max(0, index))]
      if (option !== undefined) choose(option.value)
    }, 140)
  }

  // Measure, snap onto the current option, first paint. The first pass jumps,
  // the next ones slide: arriving by sliding onto a value one has not seen yet
  // makes no sense.
  useLayoutEffect(() => {
    const host = scrollRef.current
    if (host === null) return
    const first = host.querySelector<HTMLElement>('[role="option"]')
    rowHeight.current = first?.offsetHeight ?? 0
    const target = rowHeight.current * currentIndex
    if (Math.abs(host.scrollTop - target) > 1) {
      host.scrollTo({
        top: target,
        behavior: mounted.current && !reduced ? 'smooth' : 'auto',
      })
    }
    mounted.current = true
    paint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, reduced, curve, visible, options.length])

  useLayoutEffect(
    () => () => {
      clearTimeout(settle.current)
      if (frame.current !== 0) cancelAnimationFrame(frame.current)
    },
    [],
  )

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const last = options.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowDown: Math.min(last, currentIndex + 1),
      ArrowUp: Math.max(0, currentIndex - 1),
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    const option = options[target]
    if (option !== undefined) choose(option.value)
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-wheel=""
      className={className}
      style={
        {
          '--o-wheel-accent': 'var(--o-palette-brand-500)',
          '--o-wheel-row': '2.5rem',
          '--o-wheel-visible': visible,
          ...style,
        } as CSSProperties
      }
    >
      <div data-o-wheel-window="" aria-hidden="true" />
      <div
        ref={scrollRef}
        data-o-wheel-scroll=""
        role="listbox"
        aria-label={label}
        aria-activedescendant={`${baseId}-${String(currentIndex)}`}
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
      >
        {options.map((option, index) => (
          <div
            key={option.value}
            id={`${baseId}-${String(index)}`}
            role="option"
            aria-selected={index === currentIndex}
            onClick={() => {
              choose(option.value)
            }}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  )
}
