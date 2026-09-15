/**
 * Segmented control with a slider: one choice among a few options, in a
 * hollow rail where a raised slider comes to rest under the chosen option.
 *
 * ## These are radio buttons, not tabs
 *
 * Tabs with a pill change the view: what they show is elsewhere in the page,
 * and their semantics is `tablist`. A segmented control picks a value — a
 * sort, a unit, a period — and what it shows is its own state. It is a
 * `radiogroup`, and it follows the rules of one: the arrows move the
 * selection itself, not only the focus, and a single option is in the
 * tab order.
 *
 * ## The slider is a relief on a hollow
 *
 * Tabs lay a solid pill, in the brand hue, on a flat bar. Here the rail is
 * hollowed out — a veil of the current ink — and the slider is a theme
 * surface, laid on top with a short shadow: a part sliding in a groove. The
 * chosen option does not need colour to stand out, it is in relief.
 *
 * ## The travel slightly overshoots its target
 *
 * The emphasized curve of the system carries a light overshoot: the slider
 * arrives, goes a pixel or two past, and settles. That is what gives it
 * weight — a linear transition would give a rectangle that moves, not a
 * part that slides.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** One option of the control. */
export interface SegmentOption {
  /** Value returned by `onChange`. */
  readonly value: string
  /** Displayed label. */
  readonly label: string
  /** Icon placed before the label. */
  readonly icon?: ReactNode
  /** Option present but not selectable. */
  readonly disabled?: boolean
}

/** Properties specific to the component. */
export interface SegmentedControlOwnProps {
  /** The options, in display order. */
  options: readonly SegmentOption[]
  /** Group name for screen readers. */
  label: string
  /** Chosen option, in controlled mode. */
  value?: string
  /** Option chosen on mount, in uncontrolled mode. By default, the first one. */
  defaultValue?: string
  /** Called when the user picks an option. */
  onChange?: (value: string) => void
  /** The options share the width in equal parts. @defaultValue false */
  full?: boolean
  /** Neutralises the whole group. @defaultValue false */
  disabled?: boolean
}

/** All properties. */
export type SegmentedControlProps = Customisable<SegmentedControlOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-segmented-control'

/** Applies the rail, the slider and the options, once per document. */
function ensureSegmentRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-seg]{',
    'position:relative;display:inline-flex;align-items:stretch;',
    'padding:3px;border-radius:0.75rem;',
    'background:color-mix(in oklab,currentColor 8%,transparent);',
    'box-shadow:inset 0 1px 2px color-mix(in oklab,currentColor 8%,transparent);',
    '}',
    '[data-o-seg][data-o-seg-full]{display:flex}',
    '[data-o-seg][data-o-seg-full] [role="radio"]{flex:1 1 0}',
    '[data-o-seg][data-o-seg-disabled]{opacity:0.5;pointer-events:none}',
    '[data-o-seg] [role="radio"]{',
    'position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;gap:0.4em;',
    'border:0;background:none;cursor:pointer;border-radius:calc(0.75rem - 3px);',
    'font:inherit;color:inherit;white-space:nowrap;padding:0.4rem 0.9rem;opacity:0.65;',
    'transition:opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-seg] [role="radio"]:is(:hover,:focus-visible){opacity:0.85}',
    '[data-o-seg] [role="radio"][aria-checked="true"]{opacity:1}',
    '[data-o-seg] [role="radio"]:focus-visible{outline:2px solid currentColor;outline-offset:-2px}',
    '[data-o-seg] [role="radio"]:disabled{opacity:0.3;cursor:not-allowed}',
    // The slider: a raised surface, laid in the hollow.
    '[data-o-seg-thumb]{',
    'position:absolute;inset-block:3px;left:0;z-index:0;width:0;',
    'border-radius:calc(0.75rem - 3px);background:var(--o-theme-surface);',
    'box-shadow:0 1px 2px color-mix(in oklab,currentColor 20%,transparent),',
    '0 0 0 1px color-mix(in oklab,currentColor 6%,transparent);',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized),',
    'width var(--o-duration-slow) var(--o-ease-emphasized),scale 120ms linear;',
    '}',
    // The press squashes the part a little; `scale` does not fight with the
    // translation that places it.
    '[data-o-seg]:has([role="radio"]:active) [data-o-seg-thumb]{scale:0.96}',
    '@media (prefers-reduced-motion:reduce){[data-o-seg-thumb]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Choice among a few options, with a slider.
 *
 * @example
 * <SegmentedControl
 *   label="Period"
 *   options={[
 *     { value: 'day', label: 'Day' },
 *     { value: 'week', label: 'Week' },
 *     { value: 'month', label: 'Month' },
 *   ]}
 *   defaultValue="week"
 * />
 *
 * @example
 * // Controlled mode, full width, one option closed.
 * <SegmentedControl
 *   label="Delivery"
 *   options={[
 *     { value: 'standard', label: 'Standard' },
 *     { value: 'express', label: 'Express' },
 *     { value: 'pickup', label: 'Pickup', disabled: true },
 *   ]}
 *   value={mode}
 *   onChange={setMode}
 *   full
 * />
 */
export function SegmentedControl({
  options,
  label,
  value,
  defaultValue,
  onChange,
  full = false,
  disabled = false,
  ...rest
}: SegmentedControlProps): ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const thumbRef = useRef<HTMLSpanElement | null>(null)
  const [internal, setInternal] = useState<string | undefined>(defaultValue)
  ensureSegmentRules()

  const enabled = options.filter((option) => option.disabled !== true)
  const current = value ?? internal ?? enabled[0]?.value
  const currentIndex = options.findIndex((option) => option.value === current)

  const choose = (next: string): void => {
    if (next === current) return
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  const radios = (): HTMLButtonElement[] =>
    Array.from(
      hostRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [],
    )

  /** Places the slider under the chosen option. Without one, it folds away. */
  const place = (): void => {
    const thumb = thumbRef.current
    const target = radios()[currentIndex]
    if (thumb === null) return
    if (target === undefined) {
      thumb.style.width = '0px'
      return
    }
    thumb.style.width = `${String(target.offsetWidth)}px`
    thumb.style.transform = `translateX(${String(target.offsetLeft)}px)`
  }

  // Before paint, so that the slider is already under its option on the first
  // display; then on every choice, and if the rail changes size.
  useLayoutEffect(() => {
    place()
    const host = hostRef.current
    if (host === null || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(place)
    observer.observe(host)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, options, full])

  /** The arrows move the choice itself, skipping the closed options. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (enabled.length === 0) return
    const at = enabled.findIndex((option) => option.value === current)
    const last = enabled.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowRight: at >= last ? 0 : at + 1,
      ArrowDown: at >= last ? 0 : at + 1,
      ArrowLeft: at <= 0 ? last : at - 1,
      ArrowUp: at <= 0 ? last : at - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    const next = enabled[target]
    if (next === undefined) return
    choose(next.value)
    radios()[options.indexOf(next)]?.focus()
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={hostRef}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled ? 'true' : undefined}
      data-o-seg=""
      data-o-seg-full={full ? '' : undefined}
      data-o-seg-disabled={disabled ? '' : undefined}
      className={className}
      style={style as CSSProperties}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <span ref={thumbRef} aria-hidden="true" data-o-seg-thumb="" />
      {options.map((option, index) => {
        const checked = index === currentIndex
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={disabled || option.disabled === true}
            onClick={() => choose(option.value)}
          >
            {option.icon !== undefined && <span aria-hidden="true">{option.icon}</span>}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
