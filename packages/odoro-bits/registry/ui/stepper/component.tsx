/**
 * Numbered steps: the line fills in behind the progress, and the panel slides
 * in from the side one is heading to.
 *
 * ## The arrows move focus, not the step
 *
 * Elsewhere in the registry — dot tabs, segmented control — the arrows move
 * the choice itself, because changing option costs nothing. Here, changing
 * step replaces the content of the page: walking a five step form from the
 * keyboard would then scroll past four panels just to look at one. So the
 * arrows walk focus around, and Enter commits. It is the pattern of a menu,
 * not that of a group of radio buttons.
 *
 * ## The line is a fill, not a width
 *
 * The segment between two steps carries a child at `scaleX(0)` that goes to 1
 * once the step is passed: a transform, therefore composited, where an
 * animated width would lay the bar out again on every frame.
 *
 * ## The panel knows which way one is going
 *
 * Going forward and going back do not look alike: the panel enters from the side
 * one comes from. The direction is deduced from the gap between the old step and
 * the new one, and set as an attribute; the React key forces the animation to
 * play again, without which coming back to the same panel would show nothing.
 *
 * ## Reduced motion
 *
 * The line is filled in one go and the panel appears without sliding: the
 * final state, never the starting state.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** One step. */
export interface StepperStep {
  /** Id, unique within the flow. */
  readonly id: string
  /** Label displayed under the token. */
  readonly label: string
  /** Detail displayed in a muted tone. */
  readonly hint?: string
}

/** What one can reach by clicking. */
export type StepperReach = 'done' | 'all' | 'none'

/** Properties specific to the component. */
export interface StepperOwnProps {
  /** The steps, in the order of the flow. */
  steps: readonly StepperStep[]
  /** Name of the flow for screen readers. */
  label: string
  /** Index of the current step, in controlled mode. */
  value?: number
  /** Index of the current step on mount, in uncontrolled mode. @defaultValue 0 */
  defaultValue?: number
  /** Called with the index of the chosen step. */
  onChange?: (index: number) => void
  /** Content of the current step, animated on every change. */
  children?: ReactNode
  /** Reading direction of the rail. @defaultValue 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /**
   * What one can reach: the steps already passed, all of them, or none —
   * in that last case the page alone decides.
   *
   * @defaultValue 'done'
   */
  reach?: StepperReach
}

/** All properties. */
export type StepperProps = Customisable<StepperOwnProps>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-stepper'

/** Sets up the rail, the tokens, the line and the panel, once per document. */
function ensureStepperRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-stepper]{display:flex;flex-direction:column;gap:1.25rem}',
    '[data-o-step-rail]{display:flex;margin:0;padding:0;list-style:none}',
    '[data-o-step-rail] > li{display:flex;flex:1 1 0;min-width:0}',
    '[data-o-step-rail] > li:last-child{flex:none}',
    '[data-o-stepper][data-o-stepper-vertical] [data-o-step-rail]{flex-direction:column;gap:0}',
    '[data-o-stepper][data-o-stepper-vertical] [data-o-step-rail] > li{flex-direction:column;flex:none}',
    '[data-o-step]{',
    'display:flex;align-items:center;gap:0.6rem;flex:none;',
    'border:0;background:transparent;font:inherit;color:inherit;cursor:pointer;',
    'padding:0.25rem;border-radius:0.6rem;text-align:left;',
    '}',
    '[data-o-step][aria-disabled="true"]{cursor:default;opacity:0.45}',
    '[data-o-step]:focus-visible{outline:2px solid var(--o-step-accent);outline-offset:2px}',
    // The token: hollow while the step lies ahead, filled as soon as it is reached.
    '[data-o-step-token]{',
    'display:grid;place-items:center;flex:none;width:2rem;height:2rem;border-radius:999px;',
    'border:1px solid var(--o-theme-line);background:var(--o-theme-surface);',
    'font-size:0.8125em;font-weight:600;font-variant-numeric:tabular-nums;',
    'transition:background-color var(--o-duration-base) linear,',
    'border-color var(--o-duration-base) linear,color var(--o-duration-base) linear,',
    'scale var(--o-duration-slow) var(--o-ease-emphasized);',
    '}',
    '[data-o-step][data-o-step-state="done"] [data-o-step-token]{',
    'background:var(--o-step-accent);border-color:var(--o-step-accent);color:var(--o-step-ink)}',
    '[data-o-step][data-o-step-state="current"] [data-o-step-token]{',
    'border-color:var(--o-step-accent);scale:1.12;',
    'box-shadow:0 0 0 4px color-mix(in oklab,var(--o-step-accent) 20%,transparent)}',
    '[data-o-step-text]{display:flex;flex-direction:column;min-width:0}',
    '[data-o-step-hint]{font-size:0.8125em;opacity:0.55}',
    // The segment between two steps, and its fill done as a transform.
    '[data-o-step-line]{',
    'position:relative;flex:1 1 auto;align-self:center;height:2px;margin:0 0.5rem;',
    'border-radius:999px;background:var(--o-theme-line);overflow:hidden;',
    '}',
    '[data-o-stepper][data-o-stepper-vertical] [data-o-step-line]{',
    'width:2px;height:1.4rem;flex:none;align-self:flex-start;margin:0.25rem 0 0.25rem 1rem}',
    '[data-o-step-line] span{',
    'position:absolute;inset:0;background:var(--o-step-accent);',
    'transform:scaleX(0);transform-origin:left center;',
    'transition:transform var(--o-duration-slower) var(--o-ease-standard);',
    '}',
    '[data-o-stepper][data-o-stepper-vertical] [data-o-step-line] span{',
    'transform:scaleY(0);transform-origin:center top}',
    '[data-o-step-line][data-o-step-filled] span{transform:none}',
    // The panel: it enters from the side one comes from.
    '[data-o-step-panel]{animation:o-step-next var(--o-duration-slow) var(--o-ease-standard) both}',
    '[data-o-step-panel][data-o-step-back]{animation-name:o-step-prev}',
    '@keyframes o-step-next{from{opacity:0;translate:24px 0}to{opacity:1;translate:none}}',
    '@keyframes o-step-prev{from{opacity:0;translate:-24px 0}to{opacity:1;translate:none}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-step-panel]{animation:none}',
    '[data-o-step-line] span,[data-o-step-token]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Step by step flow, with one panel per step.
 *
 * @example
 * <Stepper
 *   label="Order"
 *   steps={[
 *     { id: 'cart', label: 'Cart' },
 *     { id: 'shipping', label: 'Shipping' },
 *     { id: 'payment', label: 'Payment' },
 *   ]}
 * >
 *   <p>Content of the current step.</p>
 * </Stepper>
 *
 * @example
 * // Controlled mode: the page moves on when its form is valid.
 * <Stepper label="Sign up" steps={steps} value={step} onChange={setStep} reach="none" />
 */
export function Stepper({
  steps,
  label,
  value,
  defaultValue = 0,
  onChange,
  children,
  orientation = 'horizontal',
  reach = 'done',
  ...rest
}: StepperProps): ReactElement {
  const railRef = useRef<HTMLOListElement | null>(null)
  const [internal, setInternal] = useState(defaultValue)
  const [focusIndex, setFocusIndex] = useState(defaultValue)
  ensureStepperRules()

  const current = Math.min(Math.max(0, value ?? internal), Math.max(0, steps.length - 1))

  // The direction of travel is deduced from the gap, and kept in state rather
  // than in a ref: writing to a ref during the render would give two different
  // results depending on whether React replays it or not.
  const [seen, setSeen] = useState(current)
  const [back, setBack] = useState(false)
  if (seen !== current) {
    setBack(current < seen)
    setSeen(current)
  }

  const reachable = (index: number): boolean =>
    reach === 'all' || (reach === 'done' && index <= current)

  const go = (index: number): void => {
    if (index === current || !reachable(index)) return
    if (value === undefined) setInternal(index)
    setFocusIndex(index)
    onChange?.(index)
  }

  /** The arrows walk focus around; it is Enter that changes step. */
  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>): void => {
    const last = steps.length - 1
    const forward = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const backward = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    const moves: Readonly<Record<string, number | undefined>> = {
      [forward]: focusIndex >= last ? 0 : focusIndex + 1,
      [backward]: focusIndex <= 0 ? last : focusIndex - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    setFocusIndex(target)
    railRef.current?.querySelectorAll<HTMLButtonElement>('[data-o-step]')[target]?.focus()
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-stepper=""
      data-o-stepper-vertical={orientation === 'vertical' ? '' : undefined}
      className={className}
      style={
        {
          '--o-step-accent': 'var(--o-palette-brand-500)',
          '--o-step-ink': 'var(--o-palette-zinc-50)',
          ...style,
        } as CSSProperties
      }
    >
      <ol ref={railRef} data-o-step-rail="" aria-label={label} onKeyDown={onKeyDown}>
        {steps.map((step, index) => {
          const state = index === current ? 'current' : index < current ? 'done' : 'todo'
          return (
            <li key={step.id}>
              <button
                type="button"
                data-o-step=""
                data-o-step-state={state}
                aria-current={index === current ? 'step' : undefined}
                aria-disabled={reachable(index) ? undefined : 'true'}
                tabIndex={index === focusIndex ? 0 : -1}
                onClick={() => {
                  go(index)
                }}
              >
                <span data-o-step-token="" aria-hidden="true">
                  {state === 'done' ? '✓' : index + 1}
                </span>
                <span data-o-step-text="">
                  <span>{step.label}</span>
                  {step.hint !== undefined && (
                    <span data-o-step-hint="">{step.hint}</span>
                  )}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  data-o-step-line=""
                  data-o-step-filled={index < current ? '' : undefined}
                  aria-hidden="true"
                >
                  <span />
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {children !== undefined && (
        <div
          key={current}
          data-o-step-panel=""
          data-o-step-back={back ? '' : undefined}
          role="group"
          aria-label={steps[current]?.label ?? label}
        >
          {children}
        </div>
      )}
    </div>
  )
}
