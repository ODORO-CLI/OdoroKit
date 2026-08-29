/**
 * Liste deroulante native habillee comme un champ de saisie.
 *
 * @module
 */

import {
  type ReactElement,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  useId,
} from 'react'

import { cx } from '../styles/cx.js'
import { inputClasses } from './Input.jsx'

/** Une option de {@link Select}. */
export interface SelectOption {
  /** Valeur soumise. */
  readonly value: string
  /** Libelle affiche. */
  readonly label: string
  /** Rend l'option non selectionnable. */
  readonly disabled?: boolean
}

/** Proprietes de {@link Select}. */
export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'className' | 'size'
> {
  /** Libelle du champ. Obligatoire : un champ sans libelle est inutilisable. */
  label: ReactNode
  /** Masque visuellement le libelle sans le retirer de l'arbre d'accessibilite. */
  hideLabel?: boolean
  /** Texte d'aide affiche sous le champ. */
  hint?: ReactNode
  /**
   * Message d'erreur. Sa presence met le champ en etat invalide et remplace
   * l'aide dans la description annoncee.
   */
  error?: ReactNode
  /** Taille. @defaultValue 'md' */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Options a afficher. En son absence, les `children` (`<option>`,
   * `<optgroup>`) sont rendus tels quels.
   */
  options?: readonly SelectOption[]
  /**
   * Texte affiche tant qu'aucune valeur n'est choisie, rendu comme une option
   * vide et desactivee : elle ne peut pas etre re-selectionnee ensuite.
   */
  placeholder?: string
  /** Classes additionnelles appliquees a l'element `<select>`. */
  className?: string
  /** Classes additionnelles appliquees au conteneur. */
  wrapperClassName?: string
  /** Ref vers l'element natif. */
  ref?: Ref<HTMLSelectElement>
}

/** Chevron decoratif. Le natif est masque par `o-appearance-none`. */
function Chevron(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Liste deroulante.
 *
 * S'appuie sur le `<select>` natif : le panneau d'options garde le
 * comportement du systeme (clavier, tactile, lecteurs d'ecran). Seule la boite
 * fermee est habillee, avec le chevron redessine par-dessus.
 *
 * @example
 * <Select
 *   label="Pays"
 *   placeholder="Choisir un pays"
 *   options={[
 *     { value: 'fr', label: 'France' },
 *     { value: 'be', label: 'Belgique' },
 *   ]}
 * />
 */
export function Select({
  label,
  hideLabel = false,
  hint,
  error,
  size = 'md',
  options,
  placeholder,
  className,
  wrapperClassName,
  id,
  ref,
  disabled = false,
  children,
  ...rest
}: SelectProps): ReactElement {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const hintId = `${selectId}-hint`
  const errorId = `${selectId}-error`
  const invalid = error !== undefined && error !== null && error !== false

  // Sans valeur initiale, le natif retiendrait la premiere vraie option : le
  // placeholder n'apparaitrait jamais. La valeur vide le rend effectif, sans
  // toucher au mode controle ni a un defaultValue fourni.
  const defaultValue =
    placeholder !== undefined &&
    rest.value === undefined &&
    rest.defaultValue === undefined
      ? ''
      : rest.defaultValue

  return (
    <div className={cx('o-flex o-flex-col o-gap-1', wrapperClassName)}>
      <label
        htmlFor={selectId}
        className={cx(
          'o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50',
          hideLabel && 'o-sr-only',
        )}
      >
        {label}
      </label>

      <div className="o-relative">
        <select
          {...rest}
          defaultValue={defaultValue}
          id={selectId}
          ref={ref}
          disabled={disabled}
          className={cx(
            inputClasses({ size, invalid: invalid ? 'true' : 'false' }),
            'o-pr-8',
            disabled ? 'o-opacity-50 o-cursor-not-allowed' : 'o-cursor-pointer',
            className,
          )}
          aria-invalid={invalid || undefined}
          aria-describedby={
            cx(invalid && errorId, !invalid && hint !== undefined && hintId) || undefined
          }
        >
          {placeholder !== undefined ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options !== undefined
            ? options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>

        <span
          aria-hidden="true"
          className="o-pointer-events-none o-absolute o-inset-y-0 o-right-3 o-flex o-items-center o-text-zinc-500 dark:o-text-zinc-400"
        >
          <Chevron />
        </span>
      </div>

      {invalid ? (
        <p
          id={errorId}
          role="alert"
          className="o-text-sm o-text-red-600 dark:o-text-red-400"
        >
          {error}
        </p>
      ) : hint !== undefined ? (
        <p id={hintId} className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
