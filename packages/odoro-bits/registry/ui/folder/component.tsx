/**
 * Folder: a closed cardboard folder that opens onto its cards.
 *
 * ## It is a button that opens a region, not an image that reacts to hover
 *
 * The flap is a real button, with `aria-expanded` and `aria-controls`: a
 * screen reader announces "collapsed" or "expanded" and knows where the
 * opening leads. Opening on hover would look livelier, and would make the
 * folder unusable by finger as well as by keyboard — hover exists on neither
 * of the two.
 *
 * ## Closed, the cards do not exist
 *
 * They leave the tab order and the accessibility tree. A card merely hidden by
 * a transform stays focusable: the focus would disappear behind the folder,
 * and one would tab into the void. This is the most common flaw of contents
 * that collapse.
 *
 * They stay in the document rather than being mounted on opening: a card
 * mounted at the moment it should already be moving has no starting state, and
 * jumps instead of sliding out.
 *
 * ## The flap is in front, the cards come out over it
 *
 * Three planes: the back of the folder, the cards, then the flap. The cards
 * rise beyond the top edge of the flap, so that the visible part is also the
 * clickable part — what is hidden is hidden by the folder, not by a dead zone.
 *
 * ## The hue is a tint, not a flat fill
 *
 * The cardboard is a mix of the hue and of the theme surface rather than the
 * pure hue: the folder follows the light theme as well as the dark one, and
 * the text it carries keeps its contrast without having to pick an ink by
 * hand. The back is more loaded than the flap — it is that gap which gives the
 * thickness.
 *
 * ## Reduced motion
 *
 * No transition: the fan is open or closed, never on its way.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, useState, type CSSProperties, type ReactElement } from 'react'

/** One card filed in the folder. */
export interface FolderItem {
  /** Identifier, unique within the folder. */
  readonly id: string
  /** Label displayed on the card. */
  readonly label: string
  /** Detail displayed quietly, to the right of the label. */
  readonly hint?: string
}

/** Properties owned by the component. */
export interface FolderOwnProps {
  /** The cards, in the order of the fan. */
  items: readonly FolderItem[]
  /** Name of the folder, written on the flap. */
  label: string
  /** State of the folder, in controlled mode. */
  open?: boolean
  /** State of the folder on mount, in uncontrolled mode. @defaultValue false */
  defaultOpen?: boolean
  /** Called when the folder opens or closes again. */
  onOpenChange?: (open: boolean) => void
  /** Called on click or on Enter on a card that is out. */
  onSelect?: (id: string) => void
  /** Tokens of the cardboard hue and of the card color. */
  colors?: readonly [string, string]
  /** Width of the folder, in pixels. @defaultValue 220 */
  width?: number
  /** Angle between two cards that are out, in degrees. @defaultValue 8 */
  spread?: number
  /** Rise height of the cards, as a percentage. @defaultValue 62 */
  rise?: number
}

/** All the properties. */
export type FolderProps = Customisable<FolderOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-palette-brand-500', '--o-theme-surface'] as const

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-folder'

/** Sets the folder, its three planes and the fan, once per document. */
function ensureFolderRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-folder]{',
    'position:relative;display:block;width:var(--o-folder-width);',
    'aspect-ratio:5 / 4;perspective:900px;',
    '}',
    // The back: more loaded with hue than the flap, with its tab.
    '[data-o-folder-dos]{',
    'position:absolute;inset:14% 0 0;border-radius:0.6rem;',
    'background:color-mix(in oklab,var(--o-folder-carton) 42%,var(--o-theme-surface));',
    'box-shadow:0 0 0 1px color-mix(in oklab,var(--o-folder-carton) 30%,var(--o-theme-line));',
    '}',
    '[data-o-folder-dos]::before{',
    'content:"";position:absolute;left:0;top:-11%;width:44%;height:14%;',
    'border-radius:0.5rem 0.5rem 0 0;background:inherit;',
    '}',
    // The cards: anchored at the bottom of the folder, they rise in a fan.
    '[data-o-folder-fiches]{',
    'position:absolute;inset:26% 7% 12%;margin:0;padding:0;list-style:none;z-index:2;',
    'pointer-events:none;',
    '}',
    '[data-o-folder][data-o-folder-ouvert] [data-o-folder-fiches]{pointer-events:auto}',
    '[data-o-folder-fiches]>li{position:absolute;inset:auto 0 0}',
    '[data-o-folder-fiche]{',
    'display:flex;align-items:center;justify-content:space-between;gap:0.75rem;width:100%;',
    'padding:0.45rem 0.65rem;border-radius:0.45rem;text-align:start;cursor:pointer;',
    'font:inherit;color:inherit;font-size:0.8125em;',
    'background:var(--o-folder-fiche);',
    'border:1px solid var(--o-theme-line);',
    'box-shadow:0 8px 18px -14px currentColor;',
    'transform-origin:50% 100%;opacity:0;transform:translateY(8%) scale(0.94);',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized),',
    'opacity var(--o-duration-slow) linear;',
    '}',
    // The fan is an arc: the cards at the edges rise less high than the one in
    // the middle. Without that arc, three cards at the same height overlap and
    // one only reads the last of them.
    '[data-o-folder][data-o-folder-ouvert] [data-o-folder-fiche]{',
    'opacity:1;',
    'transform:translateY(calc(var(--o-folder-monte) * -1 + var(--o-folder-arc)))',
    ' translateX(calc(var(--o-folder-row) * 20%))',
    ' rotate(calc(var(--o-folder-row) * var(--o-folder-ecart)));',
    '}',
    '[data-o-folder-fiche]:focus-visible{outline:2px solid var(--o-folder-carton);outline-offset:2px}',
    '[data-o-folder-indice]{color:var(--o-theme-muted);white-space:nowrap}',
    // The flap: the front plane, and the opening control.
    '[data-o-folder-rabat]{',
    'position:absolute;inset:auto 0 0;height:64%;z-index:3;',
    'display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;gap:0.15rem;',
    'padding:0.7rem 0.9rem;border-radius:0.6rem;cursor:pointer;text-align:start;',
    'font:inherit;color:inherit;',
    'background:color-mix(in oklab,var(--o-folder-carton) 20%,var(--o-theme-surface));',
    'border:1px solid color-mix(in oklab,var(--o-folder-carton) 40%,var(--o-theme-line));',
    'transform-origin:50% 100%;',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized);',
    '}',
    '[data-o-folder][data-o-folder-ouvert] [data-o-folder-rabat]{transform:rotateX(-28deg)}',
    '[data-o-folder-rabat]:focus-visible{outline:2px solid var(--o-folder-carton);outline-offset:3px}',
    '[data-o-folder-nom]{font-weight:600}',
    '[data-o-folder-compte]{font-size:0.8125em;color:var(--o-theme-muted)}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-folder-fiche],[data-o-folder-rabat]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Folder that opens onto its cards, by click as well as by keyboard.
 *
 * @example
 * <Folder
 *   label="Client folder"
 *   items={[
 *     { id: 'contract', label: 'Signed contract', hint: 'PDF' },
 *     { id: 'quote', label: 'March quote', hint: 'PDF' },
 *     { id: 'photos', label: 'Site photos', hint: '48 files' },
 *   ]}
 *   onSelect={openCard}
 * />
 *
 * @example
 * // Controlled mode, wide fan, slate hue.
 * <Folder
 *   label="Archives 2025"
 *   items={documents}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   colors={['--o-palette-slate-500', '--o-theme-surface']}
 *   spread={16}
 * />
 */
export function Folder({
  items,
  label,
  open,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  colors = DEFAULT_TOKENS,
  width = 220,
  spread = 8,
  rise = 62,
  ...rest
}: FolderProps): ReactElement {
  const [internal, setInternal] = useState(defaultOpen)
  const panel = useId()
  ensureFolderRules()

  const isOpen = open ?? internal
  const middle = (items.length - 1) / 2

  const toggle = (): void => {
    if (open === undefined) setInternal(!isOpen)
    onOpenChange?.(!isOpen)
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-folder=""
      data-o-folder-ouvert={isOpen ? '' : undefined}
      className={className}
      style={
        {
          '--o-folder-carton': `var(${colors[0]})`,
          '--o-folder-fiche': `var(${colors[1]})`,
          '--o-folder-width': `${String(width)}px`,
          '--o-folder-ecart': `${String(spread)}deg`,
          // A length, not a percentage: a percentage in `translateY` refers to
          // the height of the card, which has nothing to do with the height of
          // the folder. The rise is therefore computed here, on the real
          // height of the cardboard.
          '--o-folder-monte': `${String(Math.round(((width * 4) / 5) * (rise / 100)))}px`,
          ...style,
        } as CSSProperties
      }
    >
      <span data-o-folder-dos="" aria-hidden="true" />

      <ul id={panel} data-o-folder-fiches="" aria-hidden={isOpen ? undefined : true}>
        {items.map((item, index) => (
          <li
            key={item.id}
            // The signed rank: negative left of the center, positive right of
            // it. It is what decides the tilt and the offset.
            style={
              {
                '--o-folder-row': index - middle,
                '--o-folder-arc': `${String(Math.abs(index - middle) * 12)}px`,
                zIndex: index + 1,
              } as CSSProperties
            }
          >
            <button
              type="button"
              data-o-folder-fiche=""
              tabIndex={isOpen ? 0 : -1}
              onClick={() => {
                onSelect?.(item.id)
              }}
            >
              <span>{item.label}</span>
              {item.hint === undefined ? null : (
                <span data-o-folder-indice="">{item.hint}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        data-o-folder-rabat=""
        aria-expanded={isOpen}
        aria-controls={panel}
        onClick={toggle}
      >
        <span data-o-folder-nom="">{label}</span>
        <span data-o-folder-compte="">
          {items.length} {items.length > 1 ? 'items' : 'item'}
        </span>
      </button>
    </div>
  )
}
