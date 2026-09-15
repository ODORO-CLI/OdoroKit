/**
 * Copies to the clipboard, along with the state the interface has to show.
 *
 * ## Why a state, and not just a call
 *
 * Copying produces no visible feedback: nothing moves, no sound, and the
 * clipboard cannot be looked at. Without a confirmation, people click again —
 * then go paste somewhere else to check. The confirmation is therefore not an
 * ornament, it is the only proof that the action happened.
 *
 * It also has to fade. A "copied!" that stays forever no longer says anything
 * about the last action, and the button looks stuck in a state.
 *
 * ## Why failure is a state of its own
 *
 * The clipboard API fails for ordinary reasons: page served without
 * encryption, permission denied, document without focus. Treating failure as
 * success is the worst of both worlds — we display "copied" and the paste
 * yields something else. The caller can then offer manual selection, which is
 * always still possible.
 *
 * ## Why a fallback path remains
 *
 * `navigator.clipboard` requires a secure context. In development on a local
 * network address — a phone pointing at the machine — it simply does not
 * exist. The old editing command, on the other hand, still works everywhere;
 * it is deprecated, not removed, and that is the difference between a button
 * that works and a button that only works for the person who wrote it.
 *
 * ## Why unmounting is watched
 *
 * The copy is asynchronous and the return to rest is deferred. A panel closed
 * in the meantime — the common case, one copies then closes — would see two
 * state writes on a component that is gone: a timer that outlives it, and a
 * promise that resolves into the void.
 *
 * @module
 */

import { useCallback, useEffect, useRef, useState } from 'react'

/** Where the last copy stands. */
export type CopyState = 'idle' | 'copied' | 'failed'

/** Options of `useCopy`. */
export interface CopyOptions {
  /**
   * Delay before the return to rest, in milliseconds.
   *
   * @defaultValue 1600
   */
  delay?: number
}

/** What the hook returns. */
export interface CopyHandle {
  /** State of the last copy. */
  readonly state: CopyState
  /**
   * Copies a text.
   *
   * @returns `true` if the clipboard did receive the text.
   */
  copy(text: string): Promise<boolean>
}

/**
 * Writes to the clipboard through the document editing command.
 *
 * The field is placed outside the visible area rather than hidden: a
 * `display: none` element cannot be selected, and the command would then have
 * nothing to copy.
 */
function fallbackCopy(text: string): boolean {
  if (typeof document === 'undefined') return false

  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.setAttribute('aria-hidden', 'true')
  field.style.position = 'fixed'
  field.style.top = '0'
  field.style.left = '-9999px'

  document.body.append(field)
  const previousFocus = document.activeElement

  try {
    field.select()
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    field.remove()
    // Give focus back: without this, the button that was just clicked loses
    // it, and keyboard navigation restarts from the top of the document.
    if (previousFocus instanceof HTMLElement) previousFocus.focus()
  }
}

/**
 * Copies to the clipboard, with a state that falls back on its own.
 *
 * @example
 * const { state, copy } = useCopy()
 *
 * <button type="button" onClick={() => void copy(commande)}>
 *   {state === 'copied' ? 'Copied' : state === 'failed' ? 'Failed' : 'Copy'}
 * </button>
 */
export function useCopy(options: CopyOptions = {}): CopyHandle {
  const { delay = 1600 } = options

  const [state, setEtat] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(timer.current)
    }
  }, [])

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      let succeeded = false

      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard !== undefined) {
          await navigator.clipboard.writeText(text)
          succeeded = true
        } else {
          succeeded = fallbackCopy(text)
        }
      } catch {
        // Permission denied, document without focus, insecure context: the old
        // command stays a chance, not a certainty.
        succeeded = fallbackCopy(text)
      }

      if (!mounted.current) return succeeded

      clearTimeout(timer.current)
      setEtat(succeeded ? 'copied' : 'failed')
      timer.current = setTimeout(() => {
        if (mounted.current) setEtat('idle')
      }, delay)

      return succeeded
    },
    [delay],
  )

  return { state, copy }
}
