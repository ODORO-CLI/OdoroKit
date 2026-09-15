/**
 * Command palette: a window that opens above the page, filters a list as one
 * types, and runs whatever is picked.
 *
 * ## Opening belongs to the page
 *
 * The palette does not know the shortcut that calls it: `open` is a controlled
 * property, `onOpenChange` asks for the close. It is the only way to have a
 * global shortcut, a menu entry and a button open the same window without any
 * of the three having to know its internal state — and it leaves the component
 * testable without a keyboard.
 *
 * ## Closed, it does not exist
 *
 * No node is left behind in the document: neither the veil that intercepts the
 * clicks, nor the list that keyboard navigation would cross blindly.
 *
 * ## The field is the only focus point, the list is designated
 *
 * The arrow keys do not move the focus — they move
 * `aria-activedescendant`. That is what allows one to keep typing while going
 * through the results, and it is the ARIA `combobox` pattern. Tab is held
 * inside the window, and the focus returns where it came from on close:
 * without that, the page is reopened at the start of the document.
 *
 * ## The filter ignores case and diacritics
 *
 * A word searched without its marks must find the word that carries them: that
 * is how one types, fast and without thinking about it. The marks are removed
 * by Unicode decomposition rather than by a correspondence table, which would
 * be wrong as soon as the first unforeseen language shows up.
 *
 * ## Reduced motion
 *
 * The window appears at its size and at its place, with no rise and no veil
 * settling in.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** A command of the palette. */
export interface PaletteCommand {
  /** Identifier, unique within the palette. */
  readonly id: string
  /** Displayed label, and the one the filter applies to. */
  readonly label: string
  /** Detail shown on the right: a shortcut, a path. */
  readonly hint?: string
  /** Name of the group the command is filed under. */
  readonly group?: string
  /** Icon placed before the label. */
  readonly icon?: ReactNode
}

/** Properties specific to the component. */
export interface CommandPaletteOwnProps {
  /** The commands, in their natural order. */
  commands: readonly PaletteCommand[]
  /** Window open. The page always decides. */
  open: boolean
  /** Called when the palette asks to be closed. */
  onOpenChange?: (open: boolean) => void
  /** Called with the identifier of the command that was run. */
  onRun?: (id: string) => void
  /** Name of the window for screen readers. @defaultValue 'Commands' */
  label?: string
  /** Waiting text of the field. @defaultValue 'Search for a command...' */
  placeholder?: string
  /** Sentence shown when nothing matches. @defaultValue 'No commands.' */
  empty?: string
}

/** All the properties. */
export type CommandPaletteProps = Customisable<CommandPaletteOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-command-palette'

/** Places the veil, the window, the field and the list, once per document. */
function ensurePaletteRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-palette]{',
    'position:fixed;inset:0;z-index:var(--o-z-modal);',
    'display:flex;align-items:flex-start;justify-content:center;padding:12vh 1rem 1rem;',
    // A veil is dark in both themes: it is the only place where the hue does
    // not switch, otherwise the light window would sink into white.
    'background:color-mix(in oklab,var(--o-palette-zinc-950) 45%,transparent);',
    'animation:o-palette-veil var(--o-duration-base) linear both;',
    '}',
    '[data-o-palette-panel]{',
    'display:flex;flex-direction:column;overflow:hidden;',
    'width:min(34rem,100%);max-height:min(28rem,70vh);',
    'border-radius:0.9rem;background:var(--o-theme-surface);',
    'border:1px solid var(--o-theme-line);',
    'box-shadow:0 24px 60px color-mix(in oklab,var(--o-palette-zinc-950) 35%,transparent);',
    'animation:o-palette-in var(--o-duration-slow) var(--o-ease-emphasized) both;',
    '}',
    '[data-o-palette-field]{',
    'display:flex;align-items:center;gap:0.6rem;padding:0.85rem 1rem;',
    'border-bottom:1px solid var(--o-theme-line);',
    '}',
    '[data-o-palette-field] input{',
    'flex:1 1 auto;min-width:0;border:0;background:transparent;outline:none;',
    'font:inherit;color:inherit;font-size:1rem;',
    '}',
    '[data-o-palette-field] input::placeholder{color:inherit;opacity:0.45}',
    '[data-o-palette-list]{',
    'flex:1 1 auto;overflow-y:auto;overscroll-behavior:contain;padding:0.4rem}',
    '[data-o-palette-group]{',
    'padding:0.5rem 0.6rem 0.25rem;font-size:0.75em;text-transform:uppercase;',
    'letter-spacing:0.06em;opacity:0.5}',
    '[data-o-palette-list] [role="option"]{',
    'display:flex;align-items:center;gap:0.6rem;',
    'padding:0.5rem 0.6rem;border-radius:0.55rem;cursor:pointer;',
    'transition:background-color var(--o-duration-fast) linear;',
    '}',
    '[data-o-palette-list] [role="option"][aria-selected="true"]{',
    'background:color-mix(in oklab,var(--o-cmd-accent) 15%,transparent)}',
    '[data-o-palette-label]{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '[data-o-palette-hint]{flex:none;font-size:0.8125em;opacity:0.5;font-variant-numeric:tabular-nums}',
    '[data-o-palette-empty]{padding:1.5rem 1rem;text-align:center;opacity:0.6}',
    '[data-o-palette-foot]{',
    'display:flex;justify-content:space-between;gap:1rem;',
    'padding:0.5rem 1rem;border-top:1px solid var(--o-theme-line);',
    'font-size:0.75em;opacity:0.55}',
    '@keyframes o-palette-veil{from{opacity:0}to{opacity:1}}',
    '@keyframes o-palette-in{from{opacity:0;scale:0.97;translate:0 -10px}to{opacity:1;scale:1;translate:none}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-palette],[data-o-palette-panel]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Strips the diacritics and the case, so that two texts can be compared.
 *
 * The decomposition separates the letter from its mark; the range then removes
 * every combining mark at once, with no table to keep up to date.
 */
function plain(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
}

/**
 * Command palette, opened by the page.
 *
 * @example
 * const [open, setOpen] = useState(false)
 * <CommandPalette
 *   open={open}
 *   onOpenChange={setOpen}
 *   onRun={(id) => { run(id) }}
 *   commands={[
 *     { id: 'new', label: 'New document', group: 'File', hint: 'Ctrl N' },
 *     { id: 'open', label: 'Open a project', group: 'File' },
 *   ]}
 * />
 */
export function CommandPalette({
  commands,
  open,
  onOpenChange,
  onRun,
  label = 'Commands',
  placeholder = 'Search for a command...',
  empty = 'No commands.',
  ...rest
}: CommandPaletteProps): ReactElement | null {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [at, setAt] = useState(0)
  const baseId = useId()
  ensurePaletteRules()

  const needle = plain(query.trim())
  const found = commands.filter(
    (command) =>
      needle === '' ||
      plain(command.label).includes(needle) ||
      (command.group !== undefined && plain(command.group).includes(needle)),
  )
  const active = Math.min(at, Math.max(0, found.length - 1))

  // On open: empty field, first result, focus in the field. On close: the
  // focus returns exactly where it came from.
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement
    setQuery('')
    setAt(0)
    inputRef.current?.focus()
    return () => {
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [open])

  if (!open) return null

  const close = (): void => {
    onOpenChange?.(false)
  }

  const run = (id: string): void => {
    onRun?.(id)
    close()
  }

  /** Holds Tab inside the window: outside, there is no reachable page left. */
  const trap = (event: KeyboardEvent<HTMLDivElement>): void => {
    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        'input, button, [href], [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute('disabled'))
    const first = focusable[0]
    const last = focusable.at(-1)
    if (first === undefined || last === undefined) return
    event.preventDefault()
    const forward = !event.shiftKey
    const current = document.activeElement
    const index = focusable.findIndex((element) => element === current)
    const next = forward
      ? focusable[(index + 1) % focusable.length]
      : focusable[(index - 1 + focusable.length) % focusable.length]
    next?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key === 'Tab') {
      trap(event)
      return
    }
    const last = found.length - 1
    if (last < 0) return
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowDown: active >= last ? 0 : active + 1,
      ArrowUp: active <= 0 ? last : active - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target !== undefined) {
      event.preventDefault()
      setAt(target)
      panelRef.current
        ?.querySelectorAll<HTMLElement>('[role="option"]')
        [target]?.scrollIntoView({ block: 'nearest' })
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const command = found[active]
      if (command !== undefined) run(command.id)
    }
  }

  // The results are filed under consecutive groups: the order given by the
  // page is kept, and a heading only appears when the group changes.
  const segments: {
    name?: string
    items: { command: PaletteCommand; index: number }[]
  }[] = []
  for (const [index, command] of found.entries()) {
    const tail = segments.at(-1)
    if (tail !== undefined && tail.name === command.group)
      tail.items.push({ command, index })
    else segments.push({ name: command.group, items: [{ command, index }] })
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-palette=""
      className={className}
      style={
        { '--o-cmd-accent': 'var(--o-palette-brand-500)', ...style } as CSSProperties
      }
      onPointerDown={(event) => {
        // Clicking beside the window means wanting it closed.
        if (event.target === event.currentTarget) close()
        rest.onPointerDown?.(event)
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-o-palette-panel=""
        onKeyDown={onKeyDown}
      >
        <div data-o-palette-field="">
          <svg
            viewBox="0 0 16 16"
            width="15"
            height="15"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5 L14 14" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${baseId}-list`}
            aria-activedescendant={
              found[active] === undefined ? undefined : `${baseId}-${String(active)}`
            }
            aria-label={label}
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setAt(0)
            }}
          />
        </div>
        {found.length === 0 ? (
          <p data-o-palette-empty="">{empty}</p>
        ) : (
          <div
            id={`${baseId}-list`}
            role="listbox"
            aria-label={label}
            data-o-palette-list=""
          >
            {segments.map((segment) => (
              <div
                key={segment.name ?? ''}
                role="group"
                aria-label={segment.name}
                data-o-palette-segment=""
              >
                {segment.name !== undefined && (
                  <p data-o-palette-group="" aria-hidden="true">
                    {segment.name}
                  </p>
                )}
                {segment.items.map(({ command, index }) => (
                  <div
                    key={command.id}
                    id={`${baseId}-${String(index)}`}
                    role="option"
                    aria-selected={index === active}
                    onPointerEnter={() => {
                      setAt(index)
                    }}
                    onClick={() => {
                      run(command.id)
                    }}
                  >
                    {command.icon !== undefined && (
                      <span aria-hidden="true">{command.icon}</span>
                    )}
                    <span data-o-palette-label="">{command.label}</span>
                    {command.hint !== undefined && (
                      <span data-o-palette-hint="">{command.hint}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div data-o-palette-foot="">
          <span>Arrows to browse, Enter to run</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  )
}
