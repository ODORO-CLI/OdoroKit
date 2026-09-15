/**
 * Input field that unfolds, with attachments and dictation.
 *
 * ## What was removed, and why
 *
 * The original implementation, lacking a microphone, **simulated the
 * dictation**: it wrote an example sentence word by word, with a visualizer
 * fed by random numbers. That is acceptable in a demonstration; in a component
 * that gets installed, it is a field that fills itself with a text nobody
 * said. Without a microphone, the button is simply absent.
 *
 * Its model icons also came from a CDN. A registry component does not make a
 * page depend on an address it does not control: the picker is a **slot**, and
 * the application puts in it whatever it wants.
 *
 * ## The height is measured, never guessed
 *
 * A `textarea` that grows requires reading `scrollHeight`, and `scrollHeight`
 * means nothing as long as the current height is set: it is therefore reset to
 * zero for the duration of the measure, then restored. Without that reset, the
 * field never comes back down when text is deleted — it only grows.
 *
 * The transition is cut during the measure, otherwise every keystroke triggers
 * an animation towards a value that is about to be replaced.
 *
 * ## The object URLs are revoked
 *
 * Every thumbnail holds a `blob:` created for it. Not revoking it keeps the
 * image in memory for the whole life of the tab — a defect that only shows
 * after an hour of use, and never in development.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** An attachment. */
export interface PromptAttachment {
  /** Id, unique within the list. */
  readonly id: string
  /** The file itself. */
  readonly file: File
  /** Object URL, revoked on removal. */
  readonly url: string
  /** Displayed name. */
  readonly name: string
}

/** Props specific to the component. */
export interface PromptInputOwnProps {
  /** Prompt text of the field. @defaultValue 'Ask your question' */
  placeholder?: string
  /** Maximum number of attachments. @defaultValue 6 */
  maxAttachments?: number
  /** Types accepted by the file picker. @defaultValue 'image/*' */
  accept?: string
  /**
   * Settings rendered in the bottom bar — model, effort, whatever the
   * application wants. A slot: the registry knows neither the models nor their
   * brands.
   */
  controls?: ReactNode
  /** Called on submit. */
  onSubmit?: (value: string, attachments: readonly File[]) => void
  /** Called when a thumbnail is opened. */
  onPreview?: (attachment: PromptAttachment) => void
}

/** All props. */
export type PromptInputProps = Customisable<PromptInputOwnProps>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-prompt-input'

/** Heights of the field, in pixels. */
const MIN_HEIGHT = 68
const MAX_HEIGHT = 160

/** Applies the rules of the field, once per document. */
function ensurePromptRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-prompt]{transition:max-width var(--o-duration-slow) var(--o-ease-emphasized)}',
    '[data-o-prompt-field]{resize:none;outline:none;background:transparent;',
    'transition:height var(--o-duration-fast) var(--o-ease-standard)}',
    '[data-o-prompt-shelf]{overflow:hidden;',
    'transition:height var(--o-duration-slow) var(--o-ease-emphasized)}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-prompt],[data-o-prompt-field],[data-o-prompt-shelf]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * The speech recognition of the browser, if it exists.
 *
 * Described here rather than imported from a global type: it is not standard,
 * the two names coexist, and declaring it globally would force every host
 * project to do the same.
 */
interface SpeechLike {
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult:
    | ((event: {
        resultIndex: number
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>
      }) => void)
    | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

/** Returns the speech recognition constructor, if there is one. */
function speechFactory(): (new () => SpeechLike) | undefined {
  if (typeof window === 'undefined') return undefined
  const scope = window as unknown as Record<string, unknown>
  const found = scope['SpeechRecognition'] ?? scope['webkitSpeechRecognition']
  return typeof found === 'function' ? (found as new () => SpeechLike) : undefined
}

/**
 * Input field that unfolds.
 *
 * @example
 * <PromptInput onSubmit={(text, files) => send(text, files)} />
 *
 * @example
 * // The settings are a slot: model, effort, whatever the page wants.
 * <PromptInput controls={<ModelPicker />} />
 */
export function PromptInput({
  placeholder = 'Ask your question',
  maxAttachments = 6,
  accept = 'image/*',
  controls,
  onSubmit,
  onPreview,
  ...rest
}: PromptInputProps): ReactElement {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [attachments, setAttachments] = useState<readonly PromptAttachment[]>([])
  const [listening, setListening] = useState(false)

  const field = useRef<HTMLTextAreaElement | null>(null)
  const picker = useRef<HTMLInputElement | null>(null)
  const speech = useRef<SpeechLike | null>(null)

  ensurePromptRules()

  const hasContent = value.trim() !== '' || attachments.length > 0

  // The height of the field, measured on every keystroke.
  useEffect(() => {
    const element = field.current
    if (element === null) return

    // The measure requires a null height: `scrollHeight` never goes below the
    // height that is set, and the field would not close back.
    const previous = element.style.height
    element.style.transition = 'none'
    element.style.height = '0px'
    const needed = element.scrollHeight
    element.style.height = previous
    // A forced read, so that the reset is not merged with the next value by
    // the browser.
    void element.offsetHeight
    element.style.transition = ''
    element.style.height = `${String(Math.max(MIN_HEIGHT, Math.min(needed, MAX_HEIGHT)))}px`
  }, [value, open])

  // The object URLs die with the component, and only with it.
  //
  // The cleanup goes through a ref, not through the list: were it to depend on
  // the list, it would run on every addition and revoke the URLs of the
  // thumbnails still displayed. They would then become broken images, and only
  // from the second one onwards — which does not show when trying it once.
  const liveRef = useRef(attachments)
  liveRef.current = attachments

  useEffect(
    () => () => {
      for (const item of liveRef.current) URL.revokeObjectURL(item.url)
      speech.current?.stop()
    },
    [],
  )

  const send = useCallback((): void => {
    if (!hasContent) return
    onSubmit?.(
      value,
      attachments.map((item) => item.file),
    )
    for (const item of attachments) URL.revokeObjectURL(item.url)
    setAttachments([])
    setValue('')
    setOpen(false)
  }, [hasContent, onSubmit, value, attachments])

  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    // Enter sends, Shift+Enter breaks the line: it is the convention of a
    // conversation field, and the opposite surprises everyone.
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    send()
  }

  const choose = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = [...(event.target.files ?? [])]
    // The input is emptied so that picking the same file twice does trigger a
    // second event.
    event.target.value = ''
    if (files.length === 0) return

    const room = Math.max(0, maxAttachments - attachments.length)
    const added = files.slice(0, room).map((file) => ({
      id: `${file.name}-${String(file.lastModified)}-${String(Math.random()).slice(2, 8)}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }))

    setAttachments((current) => [...current, ...added])
    setOpen(true)
  }

  const drop = (id: string): void => {
    setAttachments((current) => {
      const target = current.find((item) => item.id === id)
      if (target !== undefined) URL.revokeObjectURL(target.url)
      return current.filter((item) => item.id !== id)
    })
  }

  const dictate = (): void => {
    if (listening) {
      speech.current?.stop()
      return
    }

    const Factory = speechFactory()
    if (Factory === undefined) return

    const engine = new Factory()
    engine.continuous = true
    engine.interimResults = true

    let settled = value
    engine.onresult = (event) => {
      let pending = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const text = result?.[0]?.transcript ?? ''
        if (result?.isFinal === true) settled += (settled === '' ? '' : ' ') + text
        else pending += text
      }
      setValue((settled + (pending === '' ? '' : ` ${pending}`)).trim())
    }
    const finish = (): void => {
      setListening(false)
      speech.current = null
    }
    engine.onend = finish
    engine.onerror = finish

    speech.current = engine
    setListening(true)
    setOpen(true)
    engine.start()
  }

  const { className, style } = mergePresentation(
    { className: 'o-relative o-flex o-w-full o-flex-col' },
    rest,
  )

  const canDictate = speechFactory() !== undefined

  return (
    <div
      {...rest}
      data-o-prompt
      className={className}
      style={{ maxWidth: open ? 480 : 320, ...style }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return
        if (!hasContent && !listening) setOpen(false)
      }}
    >
      <input
        ref={picker}
        type="file"
        accept={accept}
        multiple
        onChange={choose}
        className="o-hidden"
        tabIndex={-1}
        aria-hidden
      />

      {/* The shelf of thumbnails, which rises from behind the field. */}
      <div
        data-o-prompt-shelf
        style={{ height: attachments.length > 0 && open ? 68 : 0 }}
        className="o-relative o-w-full"
      >
        <ul className="o-flex o-list-none o-gap-2 o-overflow-x-auto o-p-2">
          {attachments.map((item) => (
            <li key={item.id} className="o-relative o-flex-none">
              <button
                type="button"
                onClick={() => onPreview?.(item)}
                className="o-block o-h-12 o-w-12 o-overflow-hidden o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800"
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="o-h-full o-w-full o-object-cover"
                  draggable={false}
                />
              </button>
              <button
                type="button"
                onClick={() => drop(item.id)}
                className="o-absolute o-right-0 o-top-0 o-flex o-h-4 o-w-4 o-items-center o-justify-center o-rounded-full o-bg-zinc-950 o-text-xs o-text-zinc-50"
              >
                <span className="o-sr-only">Remove {item.name}</span>
                <span aria-hidden>&times;</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="o-relative o-rounded-3xl o-border-w-1 o-border-zinc-200 o-bg-zinc-50 o-p-3 dark:o-border-zinc-800 dark:o-bg-zinc-900">
        <label htmlFor="o-prompt-field" className="o-sr-only">
          {placeholder}
        </label>
        <textarea
          id="o-prompt-field"
          ref={field}
          data-o-prompt-field
          rows={1}
          value={value}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={keyDown}
          className="o-w-full o-text-base o-text-zinc-950 dark:o-text-zinc-50"
          style={{ minHeight: MIN_HEIGHT }}
        />

        <div className="o-mt-2 o-flex o-items-center o-gap-2">
          <button
            type="button"
            onClick={() => picker.current?.click()}
            disabled={attachments.length >= maxAttachments}
            className="o-flex o-h-8 o-w-8 o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-zinc-200 o-text-zinc-600 disabled:o-opacity-50 dark:o-border-zinc-700 dark:o-text-zinc-300"
          >
            <span className="o-sr-only">Attach a file</span>
            <span aria-hidden>+</span>
          </button>

          {controls}

          <span className="o-flex-1" />

          {/* A single button, three states: send, dictate, stop. Three buttons
              side by side would require reading which one is active. */}
          {hasContent || !canDictate ? (
            <button
              type="button"
              onClick={send}
              disabled={!hasContent}
              className="o-flex o-h-8 o-w-8 o-items-center o-justify-center o-rounded-full o-bg-zinc-950 o-text-zinc-50 disabled:o-opacity-40 dark:o-bg-zinc-50 dark:o-text-zinc-950"
            >
              <span className="o-sr-only">Send</span>
              <span aria-hidden>&uarr;</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={dictate}
              aria-pressed={listening}
              className="o-flex o-h-8 o-w-8 o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-zinc-200 o-text-zinc-600 dark:o-border-zinc-700 dark:o-text-zinc-300"
            >
              <span className="o-sr-only">
                {listening ? 'Stop dictation' : 'Dictate'}
              </span>
              <span aria-hidden>{listening ? '■' : '●'}</span>
            </button>
          )}
        </div>
      </div>

      {/* The state of the dictation is announced: without it, nothing tells
          that the microphone is listening to whoever does not see the button
          change. */}
      <p role="status" aria-live="polite" className="o-sr-only">
        {listening ? 'Dictation in progress.' : ''}
      </p>
    </div>
  )
}
