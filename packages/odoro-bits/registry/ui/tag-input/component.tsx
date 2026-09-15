/**
 * Tag field: Enter or a comma lays down a tag, Backspace on an empty field
 * arms then removes the last one.
 *
 * ## Backspace deletes in two beats
 *
 * Deleting a tag with a single Backspace means losing a word one had no
 * intention of losing — the gesture is the same as the one that fixes a
 * typo. So the first Backspace on an empty field marks the last tag; the
 * second one removes it. Typing a letter, or leaving the field,
 * disarms it.
 *
 * ## The tags sit in the tab order through their cross
 *
 * Each tag carries a remove button, named after it. That button is what takes
 * focus, through Tab or through the arrows from the field, and Backspace or
 * Delete fire it. The tag itself is not interactive: there is nothing to do
 * to it other than remove it.
 *
 * ## The draft is local state, the tags a controllable state
 *
 * What one types interests nobody before Enter: the draft stays inside the
 * component. The tags, on the other hand, are the value — controllable
 * through `value` and `onChange`, or left to the component with `defaultValue`.
 *
 * ## A tag comes in with a bounce
 *
 * A keyframe animation on mount, on `transform` and `opacity`: the tag is
 * born slightly small and overshoots its size a little before settling into
 * it. Under reduced motion it appears in place.
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
} from 'react'

/** Properties specific to the component. */
export interface TagInputOwnProps {
  /** Name of the field for screen readers. */
  label: string
  /** The tags, in controlled mode. */
  value?: readonly string[]
  /** Tags on mount, in uncontrolled mode. @defaultValue [] */
  defaultValue?: readonly string[]
  /** Called on every addition or removal. */
  onChange?: (tags: readonly string[]) => void
  /** Waiting text, displayed when the field is empty. @defaultValue 'Add...' */
  placeholder?: string
  /** Maximum number of tags. Once reached, the field closes. @defaultValue 8 */
  max?: number
  /** Accepts the same tag twice. @defaultValue false */
  duplicates?: boolean
  /** Neutralises the field. @defaultValue false */
  disabled?: boolean
}

/** All properties. */
export type TagInputProps = Customisable<TagInputOwnProps>

/** Default tags: none. */
const NONE: readonly string[] = []

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-tag-input'

/** Sets up the field, the tags and their bounce, once per document. */
function ensureTagRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tags]{',
    'display:flex;flex-wrap:wrap;align-items:center;gap:6px;cursor:text;',
    'padding:6px 8px;border-radius:0.75rem;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    'transition:border-color var(--o-duration-slow) linear,box-shadow var(--o-duration-slow) linear;',
    '}',
    '[data-o-tags]:focus-within{border-color:var(--o-tags-accent);',
    'box-shadow:0 0 0 3px color-mix(in oklab,var(--o-tags-accent) 25%,transparent)}',
    '[data-o-tags][data-o-tags-disabled]{opacity:0.5;pointer-events:none}',
    '[data-o-tags] ul{display:contents;margin:0;padding:0;list-style:none}',
    '[data-o-tag]{',
    'display:inline-flex;align-items:center;gap:2px;',
    'padding:2px 4px 2px 10px;border-radius:999px;font-size:0.875em;line-height:1.5;',
    'background:color-mix(in oklab,currentColor 8%,transparent);',
    'border:1px solid color-mix(in oklab,currentColor 15%,transparent);',
    'transition:background-color var(--o-duration-base) linear,border-color var(--o-duration-base) linear;',
    'animation:o-tag-in var(--o-duration-slow) cubic-bezier(0.2,0,0,1.3) both;',
    '}',
    // Armed: the next Backspace removes it.
    '[data-o-tag][data-o-tag-armed]{',
    'background:color-mix(in oklab,var(--o-tags-accent) 18%,transparent);',
    'border-color:var(--o-tags-accent)}',
    '[data-o-tag] button{',
    'display:inline-grid;place-items:center;width:1.4em;height:1.4em;border-radius:999px;',
    'border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;opacity:0.6;',
    '}',
    '[data-o-tag] button:is(:hover,:focus-visible){opacity:1;',
    'background:color-mix(in oklab,currentColor 12%,transparent)}',
    '[data-o-tag] button:focus-visible{outline:2px solid var(--o-tags-accent);outline-offset:1px}',
    '[data-o-tags] input{',
    'flex:1 1 6ch;min-width:6ch;border:0;background:transparent;outline:none;',
    'font:inherit;color:inherit;padding:2px 4px;',
    '}',
    '[data-o-tags] input::placeholder{color:inherit;opacity:0.5}',
    '@keyframes o-tag-in{from{transform:scale(0.7);opacity:0}to{transform:scale(1);opacity:1}}',
    '@media (prefers-reduced-motion:reduce){[data-o-tag]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Field that turns what one types into tags.
 *
 * @example
 * <TagInput label="Keywords" defaultValue={['design', 'motion']} />
 *
 * @example
 * // Controlled mode, five tags at most.
 * <TagInput label="Recipients" value={tags} onChange={setTags} max={5} placeholder="Add a name" />
 */
export function TagInput({
  label,
  value,
  defaultValue = NONE,
  onChange,
  placeholder = 'Add...',
  max = 8,
  duplicates = false,
  disabled = false,
  ...rest
}: TagInputProps): ReactElement {
  const [internal, setInternal] = useState<readonly string[]>(defaultValue)
  const [draft, setDraft] = useState('')
  const [armed, setArmed] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  ensureTagRules()

  const tags = value ?? internal
  const full = tags.length >= max

  const commit = (next: readonly string[]): void => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  /** Lays the draft down as a tag, if it is worth one. */
  const add = (): void => {
    const text = draft.trim()
    setDraft('')
    if (text === '' || full) return
    if (!duplicates && tags.includes(text)) return
    commit([...tags, text])
  }

  const remove = (index: number): void => {
    commit(tags.filter((_, at) => at !== index))
    setArmed(false)
    inputRef.current?.focus()
  }

  const removeButtons = (): HTMLButtonElement[] =>
    Array.from(
      hostRef.current?.querySelectorAll<HTMLButtonElement>('[data-o-tag] button') ?? [],
    )

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      add()
      return
    }
    if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
      event.preventDefault()
      if (armed) remove(tags.length - 1)
      else setArmed(true)
      return
    }
    if (event.key === 'ArrowLeft' && draft === '' && tags.length > 0) {
      event.preventDefault()
      removeButtons().at(-1)?.focus()
      return
    }
    // Any other key disarms: what one is writing does not get removed.
    if (armed) setArmed(false)
  }

  const onTagKeyDown = (index: number, event: KeyboardEvent<HTMLButtonElement>): void => {
    const buttons = removeButtons()
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault()
      remove(index)
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      buttons[Math.max(0, index - 1)]?.focus()
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      if (index + 1 < buttons.length) buttons[index + 1]?.focus()
      else inputRef.current?.focus()
    }
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={hostRef}
      role="group"
      aria-label={label}
      data-o-tags=""
      data-o-tags-disabled={disabled ? '' : undefined}
      className={className}
      style={
        { '--o-tags-accent': 'var(--o-palette-brand-500)', ...style } as CSSProperties
      }
      onClick={(event) => {
        // Clicking in the margin of the field means wanting to write in it.
        if (event.target === event.currentTarget) inputRef.current?.focus()
        rest.onClick?.(event)
      }}
    >
      <ul>
        {tags.map((tag, index) => (
          <li
            key={`${tag}-${String(index)}`}
            data-o-tag=""
            data-o-tag-armed={armed && index === tags.length - 1 ? '' : undefined}
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              disabled={disabled}
              onClick={() => remove(index)}
              onKeyDown={(event) => {
                onTagKeyDown(index, event)
              }}
            >
              <span aria-hidden="true">{'\u00D7'}</span>
            </button>
          </li>
        ))}
      </ul>
      {!full && (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          placeholder={tags.length === 0 ? placeholder : ''}
          aria-label={label}
          disabled={disabled}
          onChange={(event) => {
            setDraft(event.target.value)
            if (armed) setArmed(false)
          }}
          onKeyDown={onInputKeyDown}
          onBlur={() => {
            // Leaving the field lays the draft down and disarms.
            add()
            setArmed(false)
          }}
        />
      )}
    </div>
  )
}
