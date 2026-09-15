/**
 * Drop zone: it lifts when a file hovers over it.
 *
 * ## The native input does the real work
 *
 * Drag and drop is an extra layer: the reliable path — keyboard, mobile,
 * screen readers, file managers — is an ordinary `input type="file"`, present
 * and focusable, simply taken off the screen. The whole zone is its label:
 * clicking anywhere opens the picker.
 *
 * ## The dashes are four gradients, not a border
 *
 * `border-style: dashed` does not animate. The dashes are therefore
 * painted in the background — two repeated gradients for the horizontal
 * edges, two for the vertical ones — and it is their `background-position`
 * that scrolls. The march only runs while a file hovers: an ant line
 * scrolling all the time is a distraction, not an invitation. Under
 * reduced motion, it never runs — the border stays, and so does the
 * lifted state.
 *
 * ## The hover counter, or why `dragleave` lies
 *
 * `dragleave` fires when passing over every child of the zone. Without a
 * counter of entries and exits, the zone would blink on every crossing over
 * a piece of text.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface FileDropOwnProps {
  /** Accepts several files at once. @defaultValue true */
  multiple?: boolean
  /** Called with the dropped or chosen files. */
  onFiles?: (files: readonly File[]) => void
  /** Invitation shown in the zone. @defaultValue 'Drop your files here' */
  children?: ReactNode
}

/** All the properties. */
export type FileDropProps = Customisable<FileDropOwnProps, 'label'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-file-drop'

/** Places the zone, its dashes and their march, once per document. */
function ensureDropRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-drop]{',
    '--o-drop-edge:color-mix(in oklch,currentColor 35%,transparent);',
    'position:relative;display:flex;flex-direction:column;align-items:center;',
    'justify-content:center;gap:0.5rem;cursor:pointer;',
    'border-radius:1rem;padding:2.5rem 2rem;text-align:center;',
    // Four gradients: two horizontal edges, two vertical ones.
    'background-image:',
    'repeating-linear-gradient(90deg,var(--o-drop-edge) 0 8px,transparent 8px 16px),',
    'repeating-linear-gradient(90deg,var(--o-drop-edge) 0 8px,transparent 8px 16px),',
    'repeating-linear-gradient(0deg,var(--o-drop-edge) 0 8px,transparent 8px 16px),',
    'repeating-linear-gradient(0deg,var(--o-drop-edge) 0 8px,transparent 8px 16px);',
    'background-size:100% 1px,100% 1px,1px 100%,1px 100%;',
    'background-position:0 0,0 100%,0 0,100% 0;',
    'background-repeat:no-repeat;',
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-drop]:focus-within{outline:2px solid var(--o-drop-tint);outline-offset:4px}',
    '[data-o-drop][data-o-drop-over="true"]{',
    '--o-drop-edge:var(--o-drop-tint);',
    'transform:scale(1.02) translateY(-2px);',
    'animation:o-drop-march 600ms linear infinite;',
    '}',
    '@keyframes o-drop-march{',
    'to{background-position:16px 0,-16px 100%,0 -16px,100% 16px}',
    '}',
    // Reduced motion: the border lights up but never scrolls, and the zone
    // does not lift.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-drop][data-o-drop-over="true"]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * File drop zone, placed over a native input.
 *
 * @example
 * <FileDrop onFiles={upload} />
 *
 * @example
 * // A single file, and an invitation of its own to the context.
 * <FileDrop multiple={false} onFiles={([file]) => open(file)}>
 *   Drag your resume here
 * </FileDrop>
 */
export function FileDrop({
  multiple = true,
  onFiles,
  children = 'Drop your files here',
  ...rest
}: FileDropProps): ReactElement {
  const { reduced } = useMotionState()
  const inputId = useId()
  const [over, setOver] = useState(false)
  const [names, setNames] = useState<readonly string[]>([])
  const depth = useRef(0)
  ensureDropRules()

  const accept = (files: readonly File[]): void => {
    const kept = multiple ? files : files.slice(0, 1)
    if (kept.length === 0) return
    setNames(kept.map((file) => file.name))
    onFiles?.(kept)
  }

  const onDragEnter = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault()
    depth.current += 1
    setOver(true)
  }

  const onDragLeave = (): void => {
    depth.current = Math.max(0, depth.current - 1)
    if (depth.current === 0) setOver(false)
  }

  const onDrop = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault()
    depth.current = 0
    setOver(false)
    accept([...event.dataTransfer.files])
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <label
      {...rest}
      htmlFor={inputId}
      data-o-drop=""
      data-o-drop-over={over}
      onDragEnter={onDragEnter}
      onDragOver={(event) => {
        event.preventDefault()
      }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={className}
      style={
        {
          ...style,
          '--o-drop-tint': 'var(--o-palette-brand-500)',
          ...(reduced ? { '--o-duration-base': '0ms' } : {}),
        } as CSSProperties
      }
    >
      <input
        id={inputId}
        type="file"
        multiple={multiple}
        className="o-sr-only"
        aria-label="Choose files"
        onChange={(event) => {
          accept([...(event.target.files ?? [])])
          // The same selection twice in a row must fire the event again.
          event.target.value = ''
        }}
      />
      <span className="o-font-medium">{children}</span>
      <span className="o-text-sm o-opacity-70">or click to browse</span>
      {names.length > 0 ? (
        <ul aria-live="polite" className="o-mt-2 o-text-sm o-opacity-70">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      ) : null}
    </label>
  )
}
