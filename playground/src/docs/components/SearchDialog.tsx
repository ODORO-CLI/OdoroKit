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
      className="ods-modale ods-modale-moyenne o-mt-24 o-animate-scale-in"
      style={{ marginInline: 'auto', border: 0, padding: 0 }}
    >
      {/*
        L en-tete d une modale porte son titre ; celui d une recherche porte
        son champ. Meme hauteur, meme surface, meme filet bas : ce qui change
        est ce qu on y met, pas la forme.
      */}
      <div className="ods-modale-tete" style={{ paddingRight: 16 }}>
        <Icon
          icon={Search}
          size={16}
          className="o-shrink-0"
          style={{ color: 'var(--ods-encre-douce)' }}
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
          className="o-w-full o-bg-transparent o-outline-none"
          style={{
            flex: 1,
            fontSize: 'var(--ods-corps)',
            lineHeight: 'var(--ods-corps-h)',
            color: 'var(--ods-encre)',
          }}
        />
        <kbd
          className="o-shrink-0 o-rounded-sm o-px-1.5 o-py-0.5 o-font-mono o-text-xs"
          style={{
            background: 'var(--ods-neutre-fond)',
            color: 'var(--ods-encre-douce)',
          }}
        >
          Échap
        </kbd>
      </div>

      <div
        className="ods-modale-corps ods-modale-corps-liste o-scrollbar dark:o-scrollbar-dark"
        role="listbox"
        aria-label="Résultats"
      >
        {results.length === 0 ? (
          /* Un etat vide, et non une phrase seule : une recherche sans
             resultat est une page qui attend, pas une panne. */
          <div className="ods-vide">
            <span className="ods-vide-disque" aria-hidden="true">
              <Icon icon={Search} size={44} strokeWidth={1.2} />
            </span>
            <p className="ods-vide-titre">Aucun résultat</p>
            <p className="ods-vide-texte">
              Rien ne répond à « {query} ». Essaie le nom d’un composant, d’un
              utilitaire ou d’une commande.
            </p>
          </div>
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
                data-tenu={tenu ? '' : undefined}
                className="ods-option o-justify-between"
              >
                <span className="o-flex o-min-w-0 o-flex-col">
                  <span className="ods-option-titre">{page.title}</span>
                  <span className="ods-option-detail o-truncate">
                    {page.description}
                  </span>
                </span>
                <span
                  className="o-shrink-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: 'var(--ods-encre-eteinte)' }}
                >
                  {page.section}
                </span>
              </button>
            )
          })
        )}
      </div>

      {/* Le pied : ce que font les touches, et combien de lignes repondent. */}
      <div
        className="ods-modale-pied o-justify-start o-gap-5 o-font-mono o-text-xs o-uppercase o-tracking-widest"
        style={{ color: 'var(--ods-encre-douce)' }}
      >
        <span>Haut / bas pour choisir</span>
        <span>Entrée pour ouvrir</span>
        <span className="o-ml-auto o-tabular-nums">
          {results.length} résultats
        </span>
      </div>
    </dialog>
  )
}
