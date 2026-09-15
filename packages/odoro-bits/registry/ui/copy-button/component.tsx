/**
 * Copy button: the value goes to the clipboard, the icon becomes a check.
 *
 * ## The morph is a cross-fade, not a replacement
 *
 * Both icons occupy the same cell; the copy spins one towards zero while the
 * other arrives growing. Swapping the SVG node at that same moment would look
 * the same to the eye, but any interruption — a second click during the return
 * — would jump from one frame to the next. Two opacity and scale transitions
 * always restart from the current state instead.
 *
 * ## The state is announced, not only shown
 *
 * An off-screen `aria-live="polite"` region receives "Copied" on success: a
 * screen reader announces it without being interrupted. The icon alone would
 * be mute, and changing the button label while it holds focus is announced
 * inconsistently from one reader to the next.
 *
 * ## Failure does not pretend
 *
 * `navigator.clipboard` can refuse — insecure page, permission revoked. In
 * that case the button does not switch to the check: showing a success that
 * never happened would be worse than doing nothing.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface CopyButtonOwnProps {
  /** Text copied to the clipboard. */
  value: string
  /** Button label at rest. @defaultValue 'Copy' */
  label?: string
  /** Time before returning to the rest state, in milliseconds. @defaultValue 2000 */
  delay?: number
}

/** All properties. */
export type CopyButtonProps = Customisable<CopyButtonOwnProps, 'button'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-copy-button'

/** Applies the crossing of the two icons, once per document. */
function ensureCopyRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-copy]{',
    'display:inline-flex;align-items:center;cursor:pointer;',
    'background:transparent;color:inherit;font:inherit;',
    'border:1px solid color-mix(in oklch,currentColor 25%,transparent);',
    '}',
    '[data-o-copy-icons]{position:relative;width:1em;height:1em}',
    '[data-o-copy-icons] svg{',
    'position:absolute;inset:0;width:100%;height:100%;',
    'transition:opacity var(--o-duration-base) linear,',
    'transform var(--o-duration-base) var(--o-ease-emphasized);',
    '}',
    '[data-o-copy-plain]{opacity:1;transform:scale(1)}',
    '[data-o-copy-done]{opacity:0;transform:scale(0.4);color:var(--o-copy-tint)}',
    '[data-o-copy][data-o-copy-state="done"] [data-o-copy-plain]{opacity:0;transform:scale(0.4)}',
    '[data-o-copy][data-o-copy-state="done"] [data-o-copy-done]{opacity:1;transform:scale(1)}',
    // Reduced motion: the replacement is instant.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-copy-icons] svg{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Copies a value on click and shows it — and announces it — for the length of a delay.
 *
 * @example
 * <CopyButton value="pnpm dlx odoro add ui/copy-button" />
 *
 * @example
 * // A context-specific label, a shorter return.
 * <CopyButton value={url} label="Copy the address" delay={1200} />
 */
export function CopyButton({
  value,
  label = 'Copy',
  delay = 2000,
  ...rest
}: CopyButtonProps): ReactElement {
  const { reduced } = useMotionState()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)
  ensureCopyRules()

  // A timer still in flight at unmount would announce into the void.
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  const copy = (): void => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true)
        if (timer.current !== null) window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => {
          setCopied(false)
        }, delay)
      })
      .catch(() => {
        // See the module header: no check without a real copy.
      })
  }

  const { className, style } = mergePresentation(
    { className: 'o-rounded-lg o-px-3 o-py-2 o-text-sm o-font-medium o-gap-2' },
    rest,
  )

  return (
    <button
      type="button"
      {...rest}
      data-o-copy=""
      data-o-copy-state={copied ? 'done' : 'idle'}
      onClick={copy}
      className={className}
      style={
        {
          ...style,
          '--o-copy-tint': 'var(--o-palette-emerald-500)',
          ...(reduced ? { '--o-duration-base': '0ms' } : {}),
        } as CSSProperties
      }
    >
      <span data-o-copy-icons="" aria-hidden="true">
        <svg
          data-o-copy-plain=""
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg
          data-o-copy-done=""
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12.5 9.5 18 20 6.5" />
        </svg>
      </span>
      <span>{label}</span>
      <span aria-live="polite" className="o-sr-only">
        {copied ? 'Copied' : ''}
      </span>
    </button>
  )
}
