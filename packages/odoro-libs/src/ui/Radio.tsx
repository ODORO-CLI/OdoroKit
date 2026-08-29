/**
 * Groupe de boutons radio dessines au-dessus des inputs natifs.
 *
 * @module
 */

import { type ReactElement, type ReactNode, useCallback, useId, useState } from 'react'

import { cx } from '../styles/cx.js'

/** Un choix de {@link RadioGroup}. */
export interface RadioItem {
  /** Valeur soumise. */
  readonly value: string
  /** Libelle affiche. */
  readonly label: ReactNode
  /** Complement affiche sous le libelle. */
  readonly description?: ReactNode
  /** Rend le choix non selectionnable. */
  readonly disabled?: boolean
}

/** Proprietes de {@link RadioGroup}. */
export interface RadioGroupProps {
  /** Libelle du groupe, rendu en `<legend>`. Obligatoire. */
  label: ReactNode
  /** Choix, dans l'ordre d'affichage. */
  items: readonly RadioItem[]
  /** Valeur selectionnee en mode controle. */
  value?: string
  /** Valeur initiale en mode non controle. */
  defaultValue?: string
  /** Appele avec la nouvelle valeur a chaque selection. */
  onValueChange?: (value: string) => void
  /** Sens d'empilement des choix. @defaultValue 'vertical' */
  orientation?: 'vertical' | 'horizontal'
  /** Classes additionnelles appliquees au `<fieldset>`. */
  className?: string
}

/**
 * Groupe de boutons radio.
 *
 * Le `<fieldset>` et sa `<legend>` donnent le nom de groupe aux lecteurs
 * d'ecran ; les inputs natifs (masques par `o-sr-only`) portent la navigation
 * clavier du groupe (fleches, un seul arret de tabulation). Le `name` commun
 * est genere : deux groupes sur la meme page ne se volent jamais la selection.
 * Comme pour la case a cocher, l'anneau de focus de la pastille est pose par
 * l'etat React, faute de selecteur utilitaire ciblant l'input voisin.
 *
 * @example
 * <RadioGroup
 *   label="Visibilite"
 *   defaultValue="prive"
 *   items={[
 *     { value: 'prive', label: 'Prive', description: 'Vous seul y accedez.' },
 *     { value: 'public', label: 'Public' },
 *   ]}
 * />
 */
export function RadioGroup({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  className,
}: RadioGroupProps): ReactElement {
  const name = useId()
  const [internal, setInternal] = useState<string | undefined>(defaultValue)
  const selected = value ?? internal
  const [focusedValue, setFocusedValue] = useState<string | null>(null)

  const select = useCallback(
    (next: string, itemDisabled: boolean) => {
      // Un navigateur ne delivre pas de clic a un input desactive, mais un
      // clic programmatique (tests, `element.click()`) passe outre : le garde
      // rend l'etat desactive fiable dans les deux cas.
      if (itemDisabled) return
      if (value === undefined) setInternal(next)
      onValueChange?.(next)
    },
    [onValueChange, value],
  )

  return (
    // Le navigateur dote le fieldset d'une bordure et de marges : remises a
    // zero pour qu'il soit invisible dans la mise en page.
    <fieldset className={cx('o-m-0 o-border-w-0 o-p-0', className)}>
      <legend className="o-p-0 o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50">
        {label}
      </legend>

      <div
        className={cx(
          'o-mt-0.5 o-flex',
          orientation === 'horizontal'
            ? 'o-flex-row o-flex-wrap o-gap-4'
            : 'o-flex-col o-gap-2',
        )}
      >
        {items.map((item) => {
          const itemId = `${name}-${item.value}`
          const descriptionId = `${itemId}-description`
          const isSelected = selected === item.value
          const itemDisabled = item.disabled === true

          return (
            <div key={item.value} className="o-flex o-flex-col o-gap-1">
              <label
                htmlFor={itemId}
                className={cx(
                  'o-inline-flex o-items-center o-gap-2 o-select-none',
                  itemDisabled ? 'o-opacity-50 o-cursor-not-allowed' : 'o-cursor-pointer',
                )}
              >
                <input
                  id={itemId}
                  type="radio"
                  name={name}
                  value={item.value}
                  className="o-sr-only"
                  checked={isSelected}
                  onChange={() => select(item.value, itemDisabled)}
                  onFocus={() => setFocusedValue(item.value)}
                  onBlur={() => setFocusedValue(null)}
                  disabled={itemDisabled}
                  aria-describedby={
                    item.description !== undefined ? descriptionId : undefined
                  }
                />

                <span
                  aria-hidden="true"
                  className={cx(
                    'o-inline-flex o-items-center o-justify-center o-shrink-0',
                    'o-h-4 o-w-4 o-rounded-full o-border-w-1 o-transition',
                    isSelected
                      ? 'o-bg-brand-600 dark:o-bg-brand-400 o-border-brand-600 dark:o-border-brand-400'
                      : 'o-bg-white dark:o-bg-zinc-900 o-border-zinc-300 dark:o-border-zinc-700',
                    focusedValue === item.value && 'o-ring',
                  )}
                >
                  {isSelected ? (
                    <span className="o-h-1.5 o-w-1.5 o-rounded-full o-bg-white dark:o-bg-zinc-950" />
                  ) : null}
                </span>

                <span className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50">
                  {item.label}
                </span>
              </label>

              {item.description !== undefined ? (
                <p
                  id={descriptionId}
                  className="o-pl-6 o-text-sm o-text-zinc-500 dark:o-text-zinc-400"
                >
                  {item.description}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
