/**
 * Button and field group: a field and its button welded into a single pill,
 * with a confirmation that slides into the button after submission.
 *
 * ## No form inside the component
 *
 * A field with a submit button calls for a `form`. But this group is most
 * often dropped inside a form that already exists — a sign-up at the foot of
 * a page, a search in a header — and two nested forms are invalid. The group
 * is therefore a `role="group"`, and Enter in the field does what the button
 * does; the form, if there is one, remains the page's own.
 *
 * ## The button has two faces
 *
 * The rest label and the confirmation are two stacked lines inside a button
 * that shows only one. On submit, the stack slides by one line: the label
 * rises, the confirmation arrives from below. The button's width is that of
 * the longer of the two, measured by the browser — the button does not change
 * size along the way.
 *
 * ## A promise keeps the button busy
 *
 * If `onSubmit` returns a promise, the confirmation waits for it to settle,
 * and the button is marked busy in the meantime: one does not confirm what
 * has not left. A rejection brings the button back to rest without
 * confirming.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface ButtonGroupInputOwnProps {
  /** Name of the field for screen readers. */
  label: string
  /** Text of the field, in controlled mode. */
  value?: string
  /** Text on mount, in uncontrolled mode. @defaultValue '' */
  defaultValue?: string
  /** Called on every keystroke. */
  onChange?: (value: string) => void
  /** Called on submit. A promise keeps the button busy until it settles. */
  onSubmit?: (value: string) => void | Promise<unknown>
  /** Placeholder text of the field. */
  placeholder?: string
  /** Button label at rest. @defaultValue 'Send' */
  buttonLabel?: string
  /** Label slid into the button after submission. @defaultValue 'Sent' */
  doneLabel?: string
  /** What precedes the field inside the pill: an icon, an address prefix. */
  prefix?: ReactNode
  /** Type of the field. @defaultValue 'text' */
  type?: 'text' | 'email' | 'url' | 'search'
  /** Time the confirmation stays on display, in milliseconds. @defaultValue 1800 */
  hold?: number
  /** Disables the field and the button. @defaultValue false */
  disabled?: boolean
  /** Name of the field, passed to the input for an enclosing form. */
  name?: string
}

/** All properties. */
export type ButtonGroupInputProps = Customisable<ButtonGroupInputOwnProps>

/** Where the button currently stands. */
type Phase = 'idle' | 'busy' | 'done'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-button-group-input'

/** Applies the pill, the field and the two faces of the button, once per document. */
function ensureGroupRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-bgi]{',
    'position:relative;display:inline-flex;align-items:stretch;padding:4px;border-radius:999px;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    'transition:border-color var(--o-duration-slow) linear,box-shadow var(--o-duration-slow) linear;',
    '}',
    // The focus is that of the whole pill: the pill is what one fills in.
    '[data-o-bgi]:focus-within{border-color:var(--o-bgi-accent);',
    'box-shadow:0 0 0 3px color-mix(in oklab,var(--o-bgi-accent) 25%,transparent)}',
    '[data-o-bgi][data-o-bgi-disabled]{opacity:0.5;pointer-events:none}',
    '[data-o-bgi-live]{position:absolute;width:1px;height:1px;overflow:hidden;',
    'clip-path:inset(50%);white-space:nowrap}',
    '[data-o-bgi-prefix]{display:inline-flex;align-items:center;padding-inline:0.9rem 0;opacity:0.6}',
    '[data-o-bgi] input{',
    'min-width:0;flex:1 1 auto;border:0;background:transparent;outline:none;',
    'font:inherit;color:inherit;padding:0.5rem 0.9rem;',
    '}',
    '[data-o-bgi] input::placeholder{color:inherit;opacity:0.5}',
    // The button: a one-line window onto a stack of two.
    '[data-o-bgi-button]{',
    'position:relative;overflow:hidden;cursor:pointer;flex:0 0 auto;',
    'display:inline-grid;align-items:center;padding:0.5rem 1.1rem;border:0;border-radius:999px;',
    'font:inherit;font-weight:500;color:var(--o-bgi-ink);background:var(--o-bgi-accent);',
    'transition:background-color var(--o-duration-slow) linear,transform var(--o-duration-slow) linear;',
    '}',
    '[data-o-bgi-button]:focus-visible{outline:2px solid var(--o-bgi-accent);outline-offset:2px}',
    '[data-o-bgi-button]:active{transform:scale(0.97)}',
    '[data-o-bgi-button][data-o-bgi-phase="busy"]{cursor:progress}',
    '[data-o-bgi-button][data-o-bgi-phase="done"]{background:var(--o-bgi-done)}',
    // Both faces occupy the same grid cell: the width is that of the longer
    // one, and the stack slides by one line.
    '[data-o-bgi-face]{',
    'grid-area:1/1;white-space:nowrap;text-align:center;',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1),opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-bgi-face="done"]{transform:translateY(120%);opacity:0}',
    '[data-o-bgi-button][data-o-bgi-phase="busy"] [data-o-bgi-face="idle"]{opacity:0.5}',
    '[data-o-bgi-button][data-o-bgi-phase="done"] [data-o-bgi-face="idle"]{transform:translateY(-120%);opacity:0}',
    '[data-o-bgi-button][data-o-bgi-phase="done"] [data-o-bgi-face="done"]{transform:translateY(0);opacity:1}',
    '@media (prefers-reduced-motion:reduce){[data-o-bgi-face]{transition:opacity 0ms linear}}',
  ].join('')
  document.head.append(style)
}

/**
 * Field and button inside a single pill.
 *
 * @example
 * <ButtonGroupInput
 *   label="Email address"
 *   type="email"
 *   placeholder="you@example.com"
 *   buttonLabel="Sign up"
 *   doneLabel="Signed up"
 *   onSubmit={signUp}
 * />
 *
 * @example
 * // Controlled mode, with an address prefix.
 * <ButtonGroupInput
 *   label="Site name"
 *   prefix="https://"
 *   value={site}
 *   onChange={setSite}
 *   buttonLabel="Check"
 *   doneLabel="Checked"
 *   onSubmit={check}
 * />
 */
export function ButtonGroupInput({
  label,
  value,
  defaultValue = '',
  onChange,
  onSubmit,
  placeholder,
  buttonLabel = 'Send',
  doneLabel = 'Sent',
  prefix,
  type = 'text',
  hold = 1800,
  disabled = false,
  name,
  ...rest
}: ButtonGroupInputProps): ReactElement {
  const { reduced } = useMotionState()
  const [internal, setInternal] = useState(defaultValue)
  const [phase, setPhase] = useState<Phase>('idle')
  const timer = useRef<number | undefined>(undefined)
  const mounted = useRef(true)
  ensureGroupRules()

  const text = value ?? internal

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (timer.current !== undefined) window.clearTimeout(timer.current)
    }
  }, [])

  const edit = (next: string): void => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  /** After the confirmation, the button returns to rest. */
  const settle = (): void => {
    if (timer.current !== undefined) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      if (mounted.current) setPhase('idle')
    }, hold)
  }

  const submit = (): void => {
    if (disabled || phase !== 'idle') return
    const result = onSubmit?.(text)
    if (result instanceof Promise) {
      setPhase('busy')
      result.then(
        () => {
          if (!mounted.current) return
          setPhase('done')
          settle()
        },
        () => {
          if (mounted.current) setPhase('idle')
        },
      )
      return
    }
    setPhase('done')
    settle()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    submit()
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="group"
      aria-label={label}
      data-o-bgi=""
      data-o-bgi-disabled={disabled ? '' : undefined}
      className={className}
      style={
        {
          '--o-bgi-accent': 'var(--o-palette-brand-500)',
          '--o-bgi-done': 'var(--o-palette-emerald-500)',
          '--o-bgi-ink': 'var(--o-palette-zinc-50)',
          ...(reduced ? { '--o-duration-slow': '0ms' } : {}),
          ...style,
        } as CSSProperties
      }
    >
      {prefix !== undefined && <span data-o-bgi-prefix="">{prefix}</span>}
      <input
        type={type}
        name={name}
        value={text}
        placeholder={placeholder}
        aria-label={label}
        disabled={disabled}
        onChange={(event) => {
          edit(event.target.value)
        }}
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        data-o-bgi-button=""
        data-o-bgi-phase={phase}
        aria-busy={phase === 'busy' ? 'true' : undefined}
        disabled={disabled}
        onClick={submit}
      >
        <span data-o-bgi-face="idle">{buttonLabel}</span>
        <span data-o-bgi-face="done" aria-hidden="true">
          {doneLabel}
        </span>
      </button>
      {/* The confirmation is announced when it arrives, through an off-screen
          live region: the two visible faces are scenery. */}
      <span data-o-bgi-live="" role="status">
        {phase === 'done' ? doneLabel : ''}
      </span>
    </div>
  )
}
