/**
 * Palette de recherche de la documentation, ouverte par Ctrl+K.
 *
 * Batie sur `<dialog>` natif en mode modal : piegeage du focus, Echap et
 * inertie de la page sont fournis par le navigateur.
 *
 * @module
 */

import { Icon } from 'odoro-icons'
import { Search } from 'odoro-icons/filaire'
import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'odoro-libs/router'

import { ALL_PAGES } from '../registry.js'

/** Normalise pour la recherche : minuscules, sans accents. */
function fold(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** Pages correspondant a une saisie, les titres d'abord. */
function search(query: string): typeof ALL_PAGES {
  const needle = fold(query.trim())
  if (needle === '') return ALL_PAGES
  const inTitle = ALL_PAGES.filter((page) => fold(page.title).includes(needle))
  const elsewhere = ALL_PAGES.filter(
    (page) =>
      !inTitle.includes(page) &&
      (fold(page.description).includes(needle) ||
        (page.keywords ?? []).some((keyword) => fold(keyword).includes(needle))),
  )
  return [...inTitle, ...elsewhere]
}

/** Proprietes de {@link SearchDialog}. */
export interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

/** Palette de recherche modale. */
export function SearchDialog({ open, onClose }: SearchDialogProps): ReactElement | null {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const results = useMemo(() => search(query).slice(0, 12), [query])

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return
    if (open && !dialog.open && typeof dialog.showModal === 'function') {
      setQuery('')
      setActiveIndex(0)
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  const select = useCallback(
    (path: string) => {
      onClose()
      navigate(path)
    },
    [navigate, onClose],
  )

  return (
    <dialog
      ref={dialogRef}
      aria-label="Rechercher dans la documentation"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
      className="o-w-full o-max-w-xl o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-800 o-text-zinc-900 dark:o-text-zinc-50 o-shadow-xl o-p-0 o-mt-24 o-animate-scale-in"
      style={{ marginInline: 'auto' }}
    >
      <div className="o-flex o-items-center o-gap-2 o-px-4 o-border-b o-border-zinc-200 dark:o-border-zinc-800">
        <Icon
          icon={Search}
          size={16}
          className="o-text-zinc-400 dark:o-text-zinc-500 o-shrink-0"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setActiveIndex((index) => Math.min(index + 1, results.length - 1))
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActiveIndex((index) => Math.max(index - 1, 0))
            } else if (event.key === 'Enter') {
              const active = results[activeIndex]
              if (active !== undefined) select(active.path)
            }
          }}
          placeholder="Rechercher une page, un composant, un utilitaire..."
          aria-label="Rechercher"
          className="o-w-full o-h-12 o-bg-transparent o-text-base o-text-zinc-900 dark:o-text-zinc-50 o-outline-none"
        />
        <kbd className="o-shrink-0 o-text-xs o-font-mono o-text-zinc-400 dark:o-text-zinc-500 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-rounded-sm o-px-1.5 o-py-0.5">
          Echap
        </kbd>
      </div>

      <div
        className="o-overflow-y-auto o-p-2"
        style={{ maxHeight: '24rem' }}
        role="listbox"
        aria-label="Resultats"
      >
        {results.length === 0 ? (
          <p className="o-p-6 o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Aucun resultat pour « {query} ».
          </p>
        ) : (
          results.map((page, index) => (
            <button
              key={page.path}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => select(page.path)}
              className={`o-w-full o-flex o-items-center o-justify-between o-gap-3 o-rounded-md o-px-3 o-py-2 o-text-left o-cursor-pointer o-transition-colors ${
                index === activeIndex ? 'o-bg-brand-50 dark:o-bg-brand-950' : ''
              }`}
            >
              <span className="o-flex o-flex-col o-min-w-0">
                <span
                  className={`o-text-sm o-font-medium ${index === activeIndex ? 'o-text-brand-600 dark:o-text-brand-400' : 'o-text-zinc-900 dark:o-text-zinc-50'}`}
                >
                  {page.title}
                </span>
                <span className="o-text-xs o-text-zinc-500 dark:o-text-zinc-400 o-truncate">
                  {page.description}
                </span>
              </span>
              <span className="o-shrink-0 o-text-xs o-text-zinc-400 dark:o-text-zinc-500">
                {page.section}
              </span>
            </button>
          ))
        )}
      </div>
    </dialog>
  )
}
