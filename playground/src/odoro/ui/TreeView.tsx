/**
 * Arborescence pliable : un `tree` complet au clavier, dont les branches
 * ouvertes se deroulent en cascade.
 *
 * ## Une branche fermee n'est pas montee
 *
 * Il serait plus simple de garder tout l'arbre dans le document et de le
 * masquer pour pouvoir animer le repli. Ce serait aussi mentir : `aria-expanded`
 * annoncerait une branche fermee dont les enfants restent dans l'arbre
 * d'accessibilite, atteignables au clavier virtuel. Le repli est donc
 * immediat, et seule l'ouverture est animee — c'est le seul des deux gestes
 * ou il y a quelque chose a regarder.
 *
 * ## Les fleches font quatre choses differentes
 *
 * Haut et bas parcourent les lignes visibles, en traversant les niveaux :
 * l'arbre se lit comme une liste. Droite ouvre une branche fermee, puis
 * descend dans son premier enfant. Gauche referme une branche ouverte, puis
 * remonte vers le parent. C'est le motif `tree` de l'ARIA, et l'inverse d'un
 * accordeon : rien ici ne se ferme parce qu'autre chose s'ouvre.
 *
 * ## Deux etats controlables, parce qu'ils repondent a deux questions
 *
 * Ce qui est ouvert et ce qui est choisi ne changent pas ensemble : on
 * parcourt une arborescence bien plus souvent qu'on n'y choisit. Chacun a donc
 * son couple controle / non controle.
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

/** Un noeud de l'arborescence. */
export interface TreeNode {
  /** Identifiant, unique dans tout l'arbre. */
  readonly id: string
  /** Libelle affiche. */
  readonly label: string
  /** Precision affichee en sourdine, a droite du libelle. */
  readonly hint?: string
  /** Enfants. Un noeud sans enfants est une feuille. */
  readonly children?: readonly TreeNode[]
}

/** Proprietes propres au composant. */
export interface TreeViewOwnProps {
  /** Les noeuds racines, dans l'ordre d'affichage. */
  nodes: readonly TreeNode[]
  /** Nom de l'arborescence pour les lecteurs d'ecran. */
  label: string
  /** Noeud choisi, en mode controle. */
  value?: string
  /** Noeud choisi au montage, en mode non controle. */
  defaultValue?: string
  /** Appele quand le choix change. */
  onChange?: (id: string) => void
  /** Branches ouvertes, en mode controle. */
  open?: readonly string[]
  /** Branches ouvertes au montage, en mode non controle. @defaultValue [] */
  defaultOpen?: readonly string[]
  /** Appele avec la liste des branches ouvertes. */
  onOpenChange?: (open: readonly string[]) => void
  /** Retard ajoute par ligne dans le deroulement d'une branche. @defaultValue 30 */
  stagger?: number
}

/** Toutes les proprietes. */
export type TreeViewProps = Customisable<TreeViewOwnProps, 'ul'>

/** Aucune branche ouverte. */
const NONE: readonly string[] = []

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-tree-view'

/** Pose les niveaux, le chevron et le deroulement, une fois par document. */
function ensureTreeRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tree],[data-o-tree] ul{margin:0;padding:0;list-style:none}',
    '[data-o-tree] [role="group"]{',
    // Le filet vertical dit d'un coup d'oeil jusqu'ou va la branche.
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
    // Une feuille garde la gouttiere du chevron : les libelles restent alignes.
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

/** Une ligne visible : le noeud, sa profondeur, et le noeud qui la contient. */
interface Visible {
  readonly node: TreeNode
  readonly depth: number
  readonly parent: string | null
}

/** Deroule l'arbre en ne gardant que ce que les branches ouvertes laissent voir. */
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
 * Arborescence pliable, parcourue aux fleches.
 *
 * @example
 * <TreeView
 *   label="Fichiers"
 *   nodes={[
 *     { id: 'src', label: 'src', children: [{ id: 'app', label: 'App.tsx' }] },
 *     { id: 'lisez', label: 'lisez-moi.md' },
 *   ]}
 *   defaultOpen={['src']}
 * />
 *
 * @example
 * // Mode controle des deux etats : la page decide de tout.
 * <TreeView label="Rayons" nodes={rayons} value={choix} onChange={setChoix} open={ouverts} onOpenChange={setOuverts} />
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
  // La ligne dans l'ordre de tabulation : celle que l'on vient de parcourir,
  // sinon celle qui est choisie, sinon la premiere. Un arbre n'a qu'une entree.
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

  /** Donne le focus a une ligne, et la retient comme point d'entree. */
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
        // Fermee, elle s'ouvre ; ouverte, on entre dedans.
        if (openSet.has(row.node.id)) goTo(rows[at + 1]?.node.id)
        else toggle(row.node.id, true)
        return
      case 'ArrowLeft':
        event.preventDefault()
        // Ouverte, elle se ferme ; sinon on remonte d'un niveau.
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

  /** Rend un niveau. L'index sert au retard de la cascade, pas a l'identite. */
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
