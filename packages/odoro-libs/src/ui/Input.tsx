/**
 * Champ de saisie avec libelle, aide et message d'erreur.
 *
 * @module
 */

import {
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useId,
} from 'react'

import { cx, variants } from '../styles/cx.js'

/** Classes du champ, exposees pour habiller un `<textarea>` ou un `<select>`. */
export const inputClasses = variants({
  base: cx(
    'o-w-full o-rounded-md o-border-w-1 o-bg-white dark:o-bg-zinc-900 o-text-zinc-900 dark:o-text-zinc-50 o-transition',
    'o-appearance-none',
  ),
  variants: {
    size: {
      sm: 'o-h-8 o-px-2 o-text-sm',
      md: 'o-h-10 o-px-3 o-text-base',
      lg: 'o-h-12 o-px-4 o-text-lg',
    },
    invalid: {
      true: 'o-border-red-200 dark:o-border-red-800',
      false:
        'o-border-zinc-200 dark:o-border-zinc-800 hover:o-border-zinc-300 dark:hover:o-border-zinc-700',
    },
  },
  defaults: { size: 'md', invalid: 'false' },
})

/** Proprietes de {@link Input}. */
export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
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
  /** Classes additionnelles appliquees a l'element `<input>`. */
  className?: string
  /** Classes additionnelles appliquees au conteneur. */
  wrapperClassName?: string
  /** Ref vers l'element natif. */
  ref?: Ref<HTMLInputElement>
}

/**
 * Champ de saisie.
 *
 * Le libelle, l'aide et l'erreur sont relies au champ par `id` /
 * `aria-describedby` : rien a cabler cote appelant. Le message d'erreur est
 * annonce des son apparition grace a `role="alert"`.
 *
 * @example
 * <Input
 *   label="Adresse e-mail"
 *   type="email"
 *   hint="Nous ne la partagerons jamais."
 *   error={errors.email}
 * />
 */
export function Input({
  label,
  hideLabel = false,
  hint,
  error,
  size = 'md',
  className,
  wrapperClassName,
  id,
  ref,
  ...rest
}: InputProps): ReactElement {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const invalid = error !== undefined && error !== null && error !== false

  return (
    <div className={cx('o-flex o-flex-col o-gap-1', wrapperClassName)}>
      <label
        htmlFor={inputId}
        className={cx(
          'o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50',
          hideLabel && 'o-sr-only',
        )}
      >
        {label}
      </label>

      <input
        {...rest}
        id={inputId}
        ref={ref}
        className={cx(
          inputClasses({ size, invalid: invalid ? 'true' : 'false' }),
          className,
        )}
        aria-invalid={invalid || undefined}
        aria-describedby={
          cx(invalid && errorId, !invalid && hint !== undefined && hintId) || undefined
        }
      />

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
