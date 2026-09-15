/**
 * Collapsible tree: a complete keyboard `tree`, whose open branches unfold
 * in a cascade.
 *
 * ## A closed branch is not mounted
 *
 * It would be simpler to keep the whole tree in the document and hide it in
 * order to be able to animate the collapse. It would also be a lie:
 * `aria-expanded` would announce a closed branch whose children stay in the
 * accessibility tree, reachable with the virtual keyboard. The collapse is
 * therefore immediate, and only the opening is animated — it is the only one
 * of the two gestures where there is something to look at.
 *
 * ## The arrows do four different things
 *
 * Up and down walk the visible rows, crossing the levels: the tree reads
 * like a list. Right opens a closed branch, then goes down into its first
 * child. Left closes an open branch, then goes back up to the parent. It is
 * the ARIA `tree` pattern, and the opposite of an accordion: nothing here
 * closes because something else opens.
 *
 * ## Two controllable states, because they answer two questions
 *
 * What is open and what is selected do not change together: a tree is walked
 * far more often than it is selected in. Each one therefore has its own
 * controlled / uncontrolled pair.
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

/** A node of the tree. */
export interface TreeNode {
  /** Identifier, unique across the whole tree. */
  readonly id: string
  /** Displayed label. */
  readonly label: string
  /** Detail shown muted, to the right of the label. */
  readonly hint?: string
  /** Children. A node without children is a leaf. */
  readonly children?: readonly TreeNode[]
}

/** Props specific to this component. */
export interface TreeViewOwnProps {
  /** The root nodes, in display order. */
  nodes: readonly TreeNode[]
  /** Name of the tree for screen readers. */
  label: string
  /** Selected node, in controlled mode. */
  value?: string
  /** Node selected at mount, in uncontrolled mode. */
  defaultValue?: string
  /** Called when the selection changes. */
  onChange?: (id: string) => void
  /** Open branches, in controlled mode. */
  open?: readonly string[]
  /** Branches open at mount, in uncontrolled mode. @defaultValue [] */
  defaultOpen?: readonly string[]
  /** Called with the list of open branches. */
  onOpenChange?: (open: readonly string[]) => void
  /** Delay added per row in the unfolding of a branch. @defaultValue 30 */
  stagger?: number
}

/** All props. */
export type TreeViewProps = Customisable<TreeViewOwnProps, 'ul'>

/** No open branch. */
const NONE: readonly string[] = []

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-tree-view'

/** Sets the levels, the chevron and the unfolding, once per document. */
function ensureTreeRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tree],[data-o-tree] ul{margin:0;padding:0;list-style:none}',
    '[data-o-tree] [role="group"]{',
    // The vertical rule says at a glance how far the branch goes.
    'margin-left:0.85em;padding-left:0.7em;border-left:1px solid var(--o-theme-line);',
    '}',
    '[data-o-tree] [role="treeitem"]{outline:none}',
    '[data-o-tree-row]{',
    'display:flex;align-items:center;gap:0.35rem;width:100%;',
    'padding:0.3rem 0.5rem;border-radius:0.5rem;cursor:pointer;text-align:left;',
    'border:0;background:transparent;font:inherit;color:inherit;',
    'transition:background-color var(--o-duration-fast) linear',
    '}',
    '[data-o-tree-row]:hover{background:color-mix(in oklab,currentColor 8%,transparent)}',
    '[role="treeitem"]:focus-visible > [data-o-tree-row]{',
    'outline:2px solid var(--o-tree-accent);outline-offset:-2px}',
    '[role="treeitem"][aria-selected="true"] > [data-o-tree-row]{',
    'background:color-mix(in oklab,var(--o-tree-accent) 16%,transparent);font-weight:500}',
    '[data-o-tree-chevron]{',
    'flex:none;display:inline-grid;place-items:center;width:1em;height:1em;opacity:0.55;',
    'transition:rotate var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[role="treeitem"][aria-expanded="true"] > [data-o-tree-row] [data-o-tree-chevron]{rotate:90deg}',
    // A leaf keeps the gutter of the chevron: the labels stay aligned.
    '[data-o-tree-leaf]{flex:none;width:1em}',
    '[data-o-tree-label]{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '[data-o-tree-hint]{opacity:0.5;font-size:0.875em;white-space:nowrap}',
    '[data-o-tree] [role="group"] > [role="treeitem"]{',
    'animation:o-tree-in var(--o-duration-base) var(--o-ease-entrance) both;',
    'animation-delay:calc(var(--o-tree-index) * var(--o-tree-stagger));',
    '}',
    '@keyframes o-tree-in{from{opacity:0;translate:-6px 0}to{opacity:1;translate:none}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-tree] [role="group"] > [role="treeitem"]{animation:none}',
    '[data-o-tree-chevron]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** A visible row: the node, its depth, and the node that contains it. */
interface Visible {
  readonly node: TreeNode
  readonly depth: number
  readonly parent: string | null
}

/** Unfolds the tree, keeping only what the open branches let one see. */
function flatten(
  nodes: readonly TreeNode[],
  open: ReadonlySet<string>,
  depth = 0,
  parent: string | null = null,
): Visible[] {
  const rows: Visible[] = []
  for (const node of nodes) {
    rows.push({ node, depth, parent })
    if (node.children !== undefined && node.children.length > 0 && open.has(node.id)) {
      rows.push(...flatten(node.children, open, depth + 1, node.id))
    }
  }
  return rows
}

/**
 * Collapsible tree, walked with the arrow keys.
 *
 * @example
 * <TreeView
 *   label="Files"
 *   nodes={[
 *     { id: 'src', label: 'src', children: [{ id: 'app', label: 'App.tsx' }] },
 *     { id: 'readme', label: 'readme.md' },
 *   ]}
 *   defaultOpen={['src']}
 * />
 *
 * @example
 * // Controlled mode for both states: the page decides everything.
 * <TreeView label="Shelves" nodes={shelves} value={choice} onChange={setChoice} open={opened} onOpenChange={setOpened} />
 */
export function TreeView({
  nodes,
  label,
  value,
  defaultValue,
  onChange,
  open,
  defaultOpen = NONE,
  onOpenChange,
  stagger = 30,
  ...rest
}: TreeViewProps): ReactElement {
  const hostRef = useRef<HTMLUListElement | null>(null)
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue)
  const [internalOpen, setInternalOpen] = useState<readonly string[]>(defaultOpen)
  const [active, setActive] = useState<string | undefined>(defaultValue)
  ensureTreeRules()

  const selected = value ?? internalValue
  const opened = open ?? internalOpen
  const openSet = new Set(opened)
  const rows = flatten(nodes, openSet)
  // The row in the tab order: the one just walked to, otherwise the one that
  // is selected, otherwise the first. A tree has only one entry.
  const focused =
    rows.find((row) => row.node.id === active)?.node.id ??
    rows.find((row) => row.node.id === selected)?.node.id ??
    rows[0]?.node.id

  const choose = (id: string): void => {
    if (value === undefined) setInternalValue(id)
    onChange?.(id)
  }

  const setOpen = (next: readonly string[]): void => {
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const toggle = (id: string, wanted?: boolean): void => {
    const isOpen = openSet.has(id)
    const target = wanted ?? !isOpen
    if (target === isOpen) return
    setOpen(target ? [...opened, id] : opened.filter((entry) => entry !== id))
  }

  /** Gives the focus to a row, and retains it as the entry point. */
  const goTo = (id: string | undefined): void => {
    if (id === undefined) return
    setActive(id)
    hostRef.current?.querySelector<HTMLLIElement>(`[data-o-tree-id="${id}"]`)?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>): void => {
    const at = rows.findIndex((row) => row.node.id === focused)
    const row = rows[at]
    if (row === undefined) return
    const branch = row.node.children !== undefined && row.node.children.length > 0

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        goTo(rows[Math.min(rows.length - 1, at + 1)]?.node.id)
        return
      case 'ArrowUp':
        event.preventDefault()
        goTo(rows[Math.max(0, at - 1)]?.node.id)
        return
      case 'Home':
        event.preventDefault()
        goTo(rows[0]?.node.id)
        return
      case 'End':
        event.preventDefault()
        goTo(rows.at(-1)?.node.id)
        return
      case 'ArrowRight':
        event.preventDefault()
        if (!branch) return
        // Closed, it opens; open, one steps inside it.
        if (openSet.has(row.node.id)) goTo(rows[at + 1]?.node.id)
        else toggle(row.node.id, true)
        return
      case 'ArrowLeft':
        event.preventDefault()
        // Open, it closes; otherwise one goes back up one level.
        if (branch && openSet.has(row.node.id)) toggle(row.node.id, false)
        else goTo(row.parent ?? undefined)
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        choose(row.node.id)
        if (branch) toggle(row.node.id)
        return
      default:
        return
    }
  }

  const { className, style } = mergePresentation({}, rest)

  /** Renders one level. The index serves the cascade delay, not the identity. */
  const level = (list: readonly TreeNode[], depth: number): ReactElement[] =>
    list.map((node, index) => {
      const branch = node.children !== undefined && node.children.length > 0
      const isOpen = branch && openSet.has(node.id)
      return (
        <li
          key={node.id}
          role="treeitem"
          data-o-tree-id={node.id}
          aria-expanded={branch ? isOpen : undefined}
          aria-selected={node.id === selected}
          tabIndex={node.id === focused ? 0 : -1}
          style={{ '--o-tree-index': index } as CSSProperties}
          onFocus={(event) => {
            if (event.target === event.currentTarget) setActive(node.id)
          }}
        >
          <span
            data-o-tree-row=""
            onClick={(event) => {
              event.stopPropagation()
              choose(node.id)
              if (branch) toggle(node.id)
              goTo(node.id)
            }}
          >
            {branch ? (
              <span data-o-tree-chevron="" aria-hidden="true">
                <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
                  <path d="M4 2 L9 6 L4 10 Z" />
                </svg>
              </span>
            ) : (
              <span data-o-tree-leaf="" aria-hidden="true" />
            )}
            <span data-o-tree-label="">{node.label}</span>
            {node.hint !== undefined && <span data-o-tree-hint="">{node.hint}</span>}
          </span>
          {isOpen && node.children !== undefined && (
            <ul role="group">{level(node.children, depth + 1)}</ul>
          )}
        </li>
      )
    })

  return (
    <ul
      {...rest}
      ref={hostRef}
      role="tree"
      aria-label={label}
      data-o-tree=""
      className={className}
      style={
        {
          '--o-tree-accent': 'var(--o-palette-brand-500)',
          '--o-tree-stagger': `${String(stagger)}ms`,
          ...style,
        } as CSSProperties
      }
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      {level(nodes, 0)}
    </ul>
  )
}
