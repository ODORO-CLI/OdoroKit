/**
 * Onglets a pastille : un fond glisse sous l'onglet actif.
 *
 * ## La pastille est mesuree, jamais devinee
 *
 * La position et la largeur viennent d'`offsetLeft` et d'`offsetWidth` sur le
 * vrai bouton, apres rendu : la pastille epouse le texte reel, quelles que
 * soient la police, la langue ou la taille. Une largeur calculee en fractions
 * — un cinquieme pour cinq onglets — mentirait des le premier libelle long.
 *
 * Le placement est ecrit d'abord, l'animation part ensuite de la position
 * precedente memorisee : si l'utilisateur clique pendant le trajet, le
 * depart est la ou la pastille se trouve logiquement, sans teleportation.
 *
 * ## Un seul onglet dans l'ordre de tabulation
 *
 * C'est le motif du roving tabindex : Tab entre dans le groupe, les fleches
 * circulent dedans. Mettre chaque onglet dans l'ordre de tabulation
 * obligerait a traverser toute la barre pour en sortir.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

/** Un onglet. */
export interface PillTabItem {
  /** Identifiant, unique dans la barre. */
  readonly id: string
  /** Libelle affiche. */
  readonly label: string
}

/** Proprietes propres au composant. */
export interface PillTabsOwnProps {
  /** Les onglets, dans l'ordre d'affichage. */
  items: readonly PillTabItem[]
  /** Identifiant de l'onglet actif, en mode controle. */
  value?: string
  /** Onglet actif au montage, en mode non controle. */
  defaultValue?: string
  /** Appele quand l'utilisateur change d'onglet. */
  onValueChange?: (id: string) => void
  /** Taille des onglets. @defaultValue 'md' */
  size?: 'sm' | 'md'
  /** Nom du groupe pour les lecteurs d'ecran. @defaultValue 'Onglets' */
  label?: string
}

/** Toutes les proprietes. */
export type PillTabsProps = Customisable<PillTabsOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-pill-tabs'

/** Pose la barre et sa pastille, une fois par document. */
function ensurePillRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pill-tabs]{',
    'position:relative;display:inline-flex;align-items:center;gap:2px;',
    'border-radius:999px;padding:4px;',
    'border:1px solid color-mix(in oklch,currentColor 15%,transparent);',
    '}',
    '[data-o-pill-tabs] [role="tab"]{',
    'position:relative;z-index:1;border:0;background:none;cursor:pointer;',
    'border-radius:999px;font:inherit;color:inherit;white-space:nowrap;',
    'opacity:0.65;transition:color var(--o-duration-base) linear,opacity var(--o-duration-base) linear;',
    '}',
    '[data-o-pill-tabs] [role="tab"][aria-selected="true"]{',
    'color:var(--o-pill-ink);opacity:1;',
    '}',
    '[data-o-pill-indicator]{',
    'position:absolute;inset-block:4px;left:0;z-index:0;',
    'border-radius:999px;background:var(--o-pill-fill);',
    '}',
  ].join('')
  document.head.append(style)
}

/** Remplissage des deux tailles, en classes du systeme. */
const SIZES = {
  sm: 'o-px-3 o-py-2 o-text-xs o-font-medium',
  md: 'o-px-4 o-py-2 o-text-sm o-font-medium',
} as const

/**
 * Barre d'onglets dont la pastille glisse sous l'onglet actif.
 *
 * @example
 * <PillTabs
 *   items={[
 *     { id: 'jour', label: 'Jour' },
 *     { id: 'semaine', label: 'Semaine' },
 *   ]}
 *   defaultValue="jour"
 * />
 *
 * @example
 * // Mode controle : la page decide.
 * <PillTabs items={vues} value={vue} onValueChange={setVue} size="sm" />
 */
export function PillTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  label = 'Onglets',
  ...rest
}: PillTabsProps): ReactElement {
  const { reduced } = useMotionState()
  const listRef = useRef<HTMLDivElement | null>(null)
  const indicatorRef = useRef<HTMLSpanElement | null>(null)
  const previousRect = useRef<{ left: number; width: number } | null>(null)
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id ?? '')
  ensurePillRules()

  const active = value ?? internal
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === active),
  )

  const select = (id: string): void => {
    if (value === undefined) setInternal(id)
    onValueChange?.(id)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const last = items.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowRight: activeIndex >= last ? 0 : activeIndex + 1,
      ArrowLeft: activeIndex <= 0 ? last : activeIndex - 1,
      Home: 0,
      End: last,
    }

    const target = moves[event.key]
    if (target === undefined) return

    event.preventDefault()
    const item = items[target]
    if (item === undefined) return
    select(item.id)
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[target]?.focus()
  }

  // Placement immediat, puis animation depuis la position precedente : voir
  // l'en-tete du module.
  useLayoutEffect(() => {
    const list = listRef.current
    const indicator = indicatorRef.current
    if (list === null || indicator === null) return

    const tab = list.querySelectorAll<HTMLElement>('[role="tab"]')[activeIndex]
    if (tab === undefined) return

    const left = tab.offsetLeft
    const width = tab.offsetWidth
    indicator.style.width = `${String(width)}px`
    indicator.style.transform = `translateX(${String(left)}px)`

    const previous = previousRect.current
    previousRect.current = { left, width }

    if (previous === null || reduced || typeof indicator.animate !== 'function') return
    if (previous.left === left && previous.width === width) return

    indicator.animate(
      [
        {
          transform: `translateX(${String(previous.left)}px)`,
          width: `${String(previous.width)}px`,
        },
        { transform: `translateX(${String(left)}px)`, width: `${String(width)}px` },
      ],
      { duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
    )
  }, [activeIndex, reduced, items])

  // Une barre dont les onglets changent invalide la position memorisee.
  useLayoutEffect(() => {
    previousRect.current = null
  }, [items])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      data-o-pill-tabs=""
      className={className}
      style={
        {
          // Des valeurs par defaut, donc **avant** le style de l'appelant :
          // ecrites apres, elles rendaient la pastille impossible a reteinter,
          // et l'encre de l'onglet actif restait claire quelle que soit la
          // palette — blanc sur blanc pour la moitie des teintes.
          '--o-pill-fill': 'var(--o-palette-brand-600)',
          '--o-pill-ink': 'var(--o-palette-zinc-50)',
          ...style,
        } as CSSProperties
      }
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={index === activeIndex}
          tabIndex={index === activeIndex ? 0 : -1}
          className={SIZES[size]}
          onClick={() => {
            select(item.id)
          }}
        >
          {item.label}
        </button>
      ))}
      <span ref={indicatorRef} aria-hidden="true" data-o-pill-indicator="" />
    </div>
  )
}
