/**
 * Palette de recherche de la documentation, ouverte par Ctrl+K.
 *
 * Batie sur `<dialog>` natif en mode modal : piegeage du focus, Echap et
 * inertie de la page sont fournis par le navigateur.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { Search } from '@odoro-cli/icons/outline'
import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from '@odoro-cli/libs/router'

import { ALL_PAGES } from '../registry.js'

/**
 * Ce que les utilitaires ne savent pas ecrire.
 *
 * Le voile d un `<dialog>` est un pseudo-element : aucune classe ne l atteint.
 * Et les surfaces de verre, que le systeme ne decline pas en `dark:` sur les
 * echelles de noir et de blanc, viennent des jetons `--o-chrome-*`.
 */
const FEUILLE = [
  '#o-recherche::backdrop{background-color:rgb(9 9 11/.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}',
  '#o-recherche{background-color:var(--o-chrome-modale);',
  'border-color:var(--o-chrome-filet)}',
  '.rc-filet{background-color:var(--o-chrome-filet-doux)}',
  '.rc-tige{background-image:linear-gradient(180deg,',
  'color-mix(in oklab,var(--o-palette-brand-500) 15%,transparent),',
  'var(--o-palette-brand-500) 48%,',
  'color-mix(in oklab,var(--o-palette-brand-500) 15%,transparent))}',
  '.rc-tenu{background-color:var(--o-chrome-tenu)}',
  '.rc-touche{border-color:var(--o-chrome-filet)}',
].join('')

/** Pose la feuille du dialogue, une fois par document. */
function useFeuille(): void {
  useEffect(() => {
    const id = 'o-vitrine-recherche'
    if (document.getElementById(id) !== null) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = FEUILLE
    document.head.append(style)
  }, [])
}

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
  useFeuille()
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
      id="o-recherche"
      className="o-mt-28 o-w-full o-max-w-2xl o-overflow-hidden o-rounded-2xl o-border-w-1 o-p-0 o-text-zinc-900 dark:o-text-zinc-50 o-backdrop-blur-xl o-animate-scale-in"
      style={{ marginInline: 'auto' }}
    >
      <div className="o-relative o-flex o-items-center o-gap-3 o-px-5">
        <span
          aria-hidden="true"
          className="rc-filet o-absolute o-inset-x-0 o-bottom-0 o-h-px"
        />
        <Icon
          icon={Search}
          size={17}
          className="o-shrink-0 o-text-brand-600 dark:o-text-brand-400"
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
          className="o-h-16 o-w-full o-bg-transparent o-text-base o-text-zinc-900 dark:o-text-zinc-50 o-outline-none"
        />
        <kbd className="o-shrink-0 rc-touche o-rounded-full o-border-w-1 o-px-2.5 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          Echap
        </kbd>
      </div>

      <div
        className="o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark"
        style={{ maxHeight: '26rem' }}
        role="listbox"
        aria-label="Résultats"
      >
        {results.length === 0 ? (
          <p className="o-m-0 o-px-5 o-py-14 o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Aucun résultat pour « {query} ».
          </p>
        ) : (
          results.map((page, index) => {
            const tenu = index === activeIndex
            return (
              <button
                key={page.path}
                type="button"
                role="option"
                aria-selected={tenu}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(page.path)}
                className={`o-relative o-flex o-w-full o-cursor-pointer o-items-center o-justify-between o-gap-4 o-py-3 o-pl-6 o-pr-5 o-text-left o-transition-colors ${
                  tenu ? 'rc-tenu' : ''
                }`}
              >
                {/* La tige : le filet au repos, le degrade d accent sur la
                    ligne retenue. Un aplat plein ecrasait la description. */}
                <span
                  aria-hidden="true"
                  className={`o-absolute o-left-3 o-w-px ${tenu ? 'rc-tige' : 'rc-filet'}`}
                  style={{ top: 4, bottom: 4 }}
                />
                <span className="o-flex o-min-w-0 o-flex-col o-gap-0.5">
                  <span
                    className={`o-text-sm o-font-medium ${tenu ? 'o-text-brand-600 dark:o-text-brand-300' : 'o-text-zinc-900 dark:o-text-zinc-50'}`}
                  >
                    {page.title}
                  </span>
                  <span className="o-truncate o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                    {page.description}
                  </span>
                </span>
                <span className="o-shrink-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  {page.section}
                </span>
              </button>
            )
          })
        )}
      </div>

      {/* Le pied : ce que font les touches, en mono, sur un filet. */}
      <div className="o-relative o-flex o-items-center o-gap-5 o-px-5 o-py-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        <span
          aria-hidden="true"
          className="rc-filet o-absolute o-inset-x-0 o-top-0 o-h-px"
        />
        <span>Haut / bas pour choisir</span>
        <span>Entrée pour ouvrir</span>
        <span className="o-ml-auto o-tabular-nums">{results.length} résultats</span>
      </div>
    </dialog>
  )
}
