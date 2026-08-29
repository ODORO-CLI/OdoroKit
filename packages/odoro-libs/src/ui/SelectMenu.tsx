/**
 * Liste deroulante riche, avec recherche.
 *
 * ## Pourquoi elle ne remplace pas `Select`
 *
 * `Select` habille un `<select>` natif. Il herite donc gratuitement du menu
 * du systeme, de la saisie au clavier, du comportement sur mobile, et il ne
 * peut pas se desynchroniser d'un formulaire. C'est le bon choix par defaut,
 * et il le restera.
 *
 * Ce composant-ci existe pour ce que le natif ne permet pas : des options
 * riches — une icone, une description, un statut — et une recherche quand la
 * liste depasse la dizaine. Le prix est que tout doit etre reconstruit, et
 * c'est precisement ce que la plupart des implementations oublient a moitie.
 *
 * ## Ce qui est reconstruit
 *
 * Le motif `combobox` de l'ARIA, entierement. Le champ porte le role et
 * l'etat d'ouverture ; la liste porte le sien ; l'option active est designee
 * par `aria-activedescendant` plutot que par le focus, parce que le focus doit
 * rester dans le champ pour que la frappe continue d'y arriver.
 *
 * Les fleches deplacent l'option active, `Entree` la choisit, `Echap` ferme,
 * `Origine` et `Fin` sautent aux extremites. La liste defile pour garder
 * l'option active visible — sans quoi le clavier deplacerait une selection
 * qu'on ne voit pas.
 *
 * ## Ce qui reste au natif
 *
 * La valeur est portee par un `<input type="hidden">`. Un formulaire ordinaire
 * la soumet donc sans savoir que le champ n'est pas un `<select>`.
 *
 * @module
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

import { cx } from '../styles/cx.js'

/** Une option de la liste. */
export interface SelectMenuOption {
  /** Valeur soumise. */
  readonly value: string
  /** Libelle affiche et recherche. */
  readonly label: string
  /** Complement affiche sous le libelle. */
  readonly description?: string
  /** Element decoratif affiche a gauche. */
  readonly icon?: ReactNode
  /** Option presente mais non selectionnable. */
  readonly disabled?: boolean
}

/** Proprietes de {@link SelectMenu}. */
export interface SelectMenuProps {
  /** Options proposees. */
  options: readonly SelectMenuOption[]
  /** Valeur choisie. */
  value?: string | null
  /** Appele quand la valeur change. */
  onValueChange?: (value: string) => void
  /** Nom du champ, pour la soumission du formulaire. */
  name?: string
  /** Libelle du champ. */
  label?: ReactNode
  /** Texte affiche quand rien n'est choisi. @defaultValue 'Choisir…' */
  placeholder?: string
  /** Affiche un champ de recherche. @defaultValue false */
  searchable?: boolean
  /** Texte affiche quand la recherche ne rend rien. @defaultValue 'Aucun resultat' */
  emptyLabel?: string
  /** Desactive le champ. */
  disabled?: boolean
  /** Message d'erreur. Sa presence marque le champ comme invalide. */
  error?: string
  /** Classes additionnelles. */
  className?: string
}

/**
 * Liste deroulante riche.
 *
 * @example
 * <SelectMenu
 *   label="Environnement"
 *   searchable
 *   options={[
 *     { value: 'prod', label: 'Production', description: 'Trafic reel' },
 *     { value: 'staging', label: 'Recette' },
 *   ]}
 *   value={env}
 *   onValueChange={setEnv}
 * />
 */
export function SelectMenu({
  options,
  value = null,
  onValueChange,
  name,
  label,
  placeholder = 'Choisir…',
  searchable = false,
  emptyLabel = 'Aucun resultat',
  disabled = false,
  error,
  className,
}: SelectMenuProps): ReactElement {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const root = useRef<HTMLDivElement | null>(null)
  const list = useRef<HTMLUListElement | null>(null)
  const field = useRef<HTMLButtonElement | null>(null)
  const search = useRef<HTMLInputElement | null>(null)

  const shown = options.filter((option) =>
    searchable && query !== ''
      ? option.label.toLowerCase().includes(query.toLowerCase())
      : true,
  )
  const chosen = options.find((option) => option.value === value)

  // Fermeture au clic exterieur. Le `pointerdown` plutot que le `click` :
  // fermer au relachement laisserait le menu ouvert pendant tout un
  // glissement commence ailleurs.
  useEffect(() => {
    if (!open) return

    const onDown = (event: PointerEvent): void => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // Le champ de recherche prend le focus a l'ouverture ; sinon il reste sur le
  // declencheur, ou les fleches continuent d'arriver.
  useEffect(() => {
    if (open && searchable) search.current?.focus()
    if (!open) setQuery('')
  }, [open, searchable])

  // L'option active doit rester visible : le clavier deplacerait sinon une
  // selection hors du champ de vision.
  useEffect(() => {
    if (!open) return
    const element = list.current?.querySelector(`[data-index="${String(active)}"]`)
    element?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  /** Retient une option, ferme, et rend le focus au declencheur. */
  const choose = (option: SelectMenuOption): void => {
    if (option.disabled === true) return
    onValueChange?.(option.value)
    setOpen(false)
    field.current?.focus()
  }

  /** Deplace l'option active en sautant les options desactivees. */
  const move = (direction: 1 | -1): void => {
    if (shown.length === 0) return
    let next = active

    for (let step = 0; step < shown.length; step += 1) {
      next = (next + direction + shown.length) % shown.length
      if (shown[next]?.disabled !== true) break
    }
    setActive(next)
  }

  const onKeyDown = (event: React.KeyboardEvent): void => {
    if (
      !open &&
      (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')
    ) {
      event.preventDefault()
      setOpen(true)
      setActive(
        Math.max(
          0,
          shown.findIndex((option) => option.value === value),
        ),
      )
      return
    }
    if (!open) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        move(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        move(-1)
        break
      case 'Home':
        event.preventDefault()
        setActive(0)
        break
      case 'End':
        event.preventDefault()
        setActive(shown.length - 1)
        break
      case 'Enter': {
        event.preventDefault()
        const option = shown[active]
        if (option !== undefined) choose(option)
        break
      }
      case 'Escape':
        event.preventDefault()
        setOpen(false)
        field.current?.focus()
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        break
    }
  }

  const invalid = error !== undefined && error !== ''

  return (
    <div ref={root} className={cx('o-flex o-flex-col o-gap-1.5', className)}>
      {label === undefined ? null : (
        <label
          htmlFor={`${id}-field`}
          className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50"
        >
          {label}
        </label>
      )}

      {name === undefined ? null : (
        <input type="hidden" name={name} value={value ?? ''} />
      )}

      <button
        ref={field}
        id={`${id}-field`}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-haspopup="listbox"
        aria-activedescendant={
          open && shown[active] !== undefined
            ? `${id}-option-${String(active)}`
            : undefined
        }
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={onKeyDown}
        className={cx(
          'o-flex o-h-10 o-w-full o-items-center o-justify-between o-gap-2 o-rounded-md o-border-w-1 o-px-3 o-text-left o-text-base o-transition-colors',
          'o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50',
          'focus:o-ring disabled:o-opacity-50 disabled:o-cursor-default',
          invalid
            ? 'o-border-red-500 dark:o-border-red-400'
            : 'o-border-zinc-200 dark:o-border-zinc-800 hover:o-border-zinc-300 dark:hover:o-border-zinc-700',
        )}
      >
        <span className="o-flex o-min-w-0 o-items-center o-gap-2">
          {chosen?.icon}
          <span
            className={cx(
              'o-truncate',
              chosen === undefined && 'o-text-zinc-400 dark:o-text-zinc-500',
            )}
          >
            {chosen?.label ?? placeholder}
          </span>
        </span>
        <span aria-hidden className="o-text-zinc-400 dark:o-text-zinc-500">
          ▾
        </span>
      </button>

      {open ? (
        <div className="o-relative">
          <div className="o-absolute o-z-dropdown o-mt-1 o-w-full o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-shadow-lg">
            {searchable ? (
              <div className="o-border-b o-border-zinc-100 dark:o-border-zinc-800 o-p-2">
                <input
                  ref={search}
                  type="text"
                  value={query}
                  placeholder="Rechercher…"
                  aria-label="Rechercher dans la liste"
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setActive(0)
                  }}
                  onKeyDown={onKeyDown}
                  className="o-h-8 o-w-full o-rounded-sm o-bg-transparent o-px-2 o-text-sm o-text-zinc-900 dark:o-text-zinc-50 focus:o-ring"
                />
              </div>
            ) : null}

            <ul
              ref={list}
              id={`${id}-list`}
              role="listbox"
              aria-label={typeof label === 'string' ? label : 'Options'}
              className="o-max-h-64 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-1"
            >
              {shown.length === 0 ? (
                <li className="o-px-3 o-py-2 o-text-sm o-text-zinc-400 dark:o-text-zinc-500">
                  {emptyLabel}
                </li>
              ) : (
                shown.map((option, index) => (
                  <li
                    key={option.value}
                    id={`${id}-option-${String(index)}`}
                    data-index={index}
                    role="option"
                    aria-selected={option.value === value}
                    aria-disabled={option.disabled === true || undefined}
                    onPointerEnter={() => setActive(index)}
                    onClick={() => choose(option)}
                    className={cx(
                      'o-flex o-cursor-pointer o-items-start o-gap-2 o-rounded-sm o-px-3 o-py-2 o-text-sm',
                      option.disabled === true && 'o-opacity-40 o-cursor-default',
                      index === active &&
                        option.disabled !== true &&
                        'o-bg-zinc-100 dark:o-bg-zinc-800',
                    )}
                  >
                    {option.icon === undefined ? null : (
                      <span className="o-mt-0.5 o-shrink-0">{option.icon}</span>
                    )}
                    <span className="o-flex o-min-w-0 o-flex-col">
                      <span className="o-text-zinc-900 dark:o-text-zinc-50">
                        {option.label}
                      </span>
                      {option.description === undefined ? null : (
                        <span className="o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {option.value === value ? (
                      <span
                        aria-hidden
                        className="o-ml-auto o-text-brand-600 dark:o-text-brand-400"
                      >
                        ✓
                      </span>
                    ) : null}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}

      {invalid ? (
        <p id={`${id}-error`} className="o-text-sm o-text-red-600 dark:o-text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}
