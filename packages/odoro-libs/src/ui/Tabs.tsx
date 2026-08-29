/**
 * Onglets avec indicateur glissant.
 *
 * @module
 */

import {
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { usePrefersReducedMotion } from '../shared/motionPreference.js'
import { motionDuration, motionEasing } from '../motion/tokens.js'
import { cx } from '../styles/cx.js'

/** Un onglet. */
export interface TabItem {
  /** Identifiant unique de l'onglet. */
  readonly id: string
  /** Libelle affiche. */
  readonly label: ReactNode
  /** Contenu du panneau associe. */
  readonly content: ReactNode
  /** Rend l'onglet inactivable. */
  readonly disabled?: boolean
}

/** Proprietes de {@link Tabs}. */
export interface TabsProps {
  /** Onglets, dans l'ordre d'affichage. */
  items: readonly TabItem[]
  /** Onglet actif en mode controle. */
  value?: string
  /** Onglet actif initial en mode non controle. @defaultValue le premier */
  defaultValue?: string
  /** Appele au changement d'onglet. */
  onValueChange?: (id: string) => void
  /** Libelle accessible de la barre d'onglets. */
  label: string
  /** Classes additionnelles pour le conteneur. */
  className?: string
}

/** Indice de l'onglet actif suivant, en sautant les onglets desactives. */
function nextEnabled(items: readonly TabItem[], from: number, direction: 1 | -1): number {
  const count = items.length
  for (let step = 1; step <= count; step += 1) {
    const index = (from + direction * step + count * count) % count
    if (items[index]?.disabled !== true) return index
  }
  return from
}

/**
 * Onglets accessibles.
 *
 * La navigation clavier suit le motif ARIA : fleches pour changer d'onglet,
 * Home et End pour aller aux extremites, un seul onglet dans l'ordre de
 * tabulation. L'indicateur est anime par le moteur du navigateur, a partir de
 * la position mesuree — jamais par une transition sur `left` et `width`, qui
 * declencherait une recomposition a chaque image.
 *
 * @example
 * <Tabs
 *   label="Sections du projet"
 *   items={[
 *     { id: 'apercu', label: 'Apercu', content: <Overview /> },
 *     { id: 'reglages', label: 'Reglages', content: <Settings /> },
 *   ]}
 * />
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  label,
  className,
}: TabsProps): ReactElement {
  const baseId = useId()
  const [internal, setInternal] = useState(() => defaultValue ?? items[0]?.id ?? '')
  const active = value ?? internal

  const listRef = useRef<HTMLDivElement | null>(null)
  const indicatorRef = useRef<HTMLSpanElement | null>(null)
  const previousRect = useRef<{ left: number; width: number } | null>(null)
  const reduced = usePrefersReducedMotion()

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === active),
  )

  const select = useCallback(
    (id: string) => {
      if (value === undefined) setInternal(id)
      onValueChange?.(id)
    },
    [onValueChange, value],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const moves: Readonly<Record<string, number | undefined>> = {
        ArrowRight: nextEnabled(items, activeIndex, 1),
        ArrowLeft: nextEnabled(items, activeIndex, -1),
        Home: nextEnabled(items, -1, 1),
        End: nextEnabled(items, items.length, -1),
      }

      const target = moves[event.key]
      if (target === undefined) return

      event.preventDefault()
      const item = items[target]
      if (item === undefined) return
      select(item.id)
      listRef.current
        ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
        [target]?.focus()
    },
    [activeIndex, items, select],
  )

  // L'indicateur est place par transformation, puis anime depuis sa position
  // precedente : une seule propriete composee, aucune recomposition.
  useLayoutEffect(() => {
    const list = listRef.current
    const indicator = indicatorRef.current
    if (list === null || indicator === null) return

    const tab = list.querySelectorAll<HTMLElement>('[role="tab"]')[activeIndex]
    if (tab === undefined) return

    const left = tab.offsetLeft
    const width = tab.offsetWidth
    indicator.style.width = `${width}px`
    indicator.style.transform = `translateX(${left}px)`

    const previous = previousRect.current
    previousRect.current = { left, width }

    if (previous === null || reduced || typeof indicator.animate !== 'function') return
    if (previous.left === left && previous.width === width) return

    indicator.animate(
      [
        {
          transform: `translateX(${previous.left}px)`,
          width: `${previous.width}px`,
        },
        { transform: `translateX(${left}px)`, width: `${width}px` },
      ],
      { duration: motionDuration.fast, easing: motionEasing.standard },
    )
  }, [activeIndex, reduced, items])

  // Une liste dont les onglets changent invalide la position memorisee.
  useEffect(() => {
    previousRect.current = null
  }, [items])

  return (
    <div className={cx('o-flex o-flex-col o-gap-4', className)}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className="o-relative o-flex o-gap-1 o-border-b o-border-zinc-200 dark:o-border-zinc-800"
      >
        {items.map((item, index) => {
          const selected = index === activeIndex
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-controls={`${baseId}-panel-${item.id}`}
              aria-selected={selected}
              aria-disabled={item.disabled || undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                if (item.disabled !== true) select(item.id)
              }}
              className={cx(
                'o-px-3 o-py-2 o-text-sm o-font-medium o-transition o-rounded-t-sm',
                selected
                  ? 'o-text-brand-600 dark:o-text-brand-400'
                  : 'o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50',
                item.disabled === true
                  ? 'o-opacity-50 o-cursor-not-allowed'
                  : 'o-cursor-pointer',
              )}
            >
              {item.label}
            </button>
          )
        })}
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="o-absolute o-bottom-0 o-left-0 o-h-0.5 o-bg-brand-600 dark:o-bg-brand-400"
        />
      </div>

      {items.map((item, index) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={index !== activeIndex}
          tabIndex={0}
        >
          {index === activeIndex ? item.content : null}
        </div>
      ))}
    </div>
  )
}
