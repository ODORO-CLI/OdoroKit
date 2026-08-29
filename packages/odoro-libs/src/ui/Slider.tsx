/**
 * Curseur de valeur numerique sur une plage.
 *
 * @module
 */

import {
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
  useState,
} from 'react'

import { cx } from '../styles/cx.js'

/** Proprietes de {@link Slider}. */
export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'size' | 'type' | 'value' | 'defaultValue' | 'min' | 'max' | 'step'
> {
  /** Libelle du curseur. Obligatoire : un champ sans libelle est inutilisable. */
  label: ReactNode
  /** Masque visuellement le libelle sans le retirer de l'arbre d'accessibilite. */
  hideLabel?: boolean
  /** Texte d'aide affiche sous le curseur. */
  hint?: ReactNode
  /**
   * Message d'erreur. Sa presence met le curseur en etat invalide et remplace
   * l'aide dans la description annoncee.
   */
  error?: ReactNode
  /** Borne basse. @defaultValue 0 */
  min?: number
  /** Borne haute. @defaultValue 100 */
  max?: number
  /** Pas d'incrementation. @defaultValue 1 */
  step?: number
  /** Valeur en mode controle. */
  value?: number
  /** Valeur initiale en mode non controle. @defaultValue le milieu de la plage */
  defaultValue?: number
  /**
   * Affiche la valeur courante a droite du libelle. En chiffres tabulaires :
   * la largeur ne tressaute pas pendant le glissement.
   *
   * @defaultValue false
   */
  showValue?: boolean
  /** Met en forme la valeur affichee par `showValue`. @defaultValue String */
  formatValue?: (value: number) => string
  /** Classes additionnelles appliquees a l'element `<input>`. */
  className?: string
  /** Classes additionnelles appliquees au conteneur. */
  wrapperClassName?: string
  /** Ref vers l'element natif. */
  ref?: Ref<HTMLInputElement>
}

/**
 * Curseur de valeur.
 *
 * S'appuie sur l'input natif `type="range"` : clavier, tactile et lecteurs
 * d'ecran sont pris en charge par le navigateur ; la couleur vient de
 * `accent-color` via `o-accent-brand-600 dark:o-accent-brand-400` (ou le registre danger en erreur).
 *
 * @example
 * <Slider
 *   label="Volume"
 *   min={0}
 *   max={100}
 *   showValue
 *   formatValue={(value) => `${value} %`}
 * />
 */
export function Slider({
  label,
  hideLabel = false,
  hint,
  error,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  showValue = false,
  formatValue,
  className,
  wrapperClassName,
  id,
  ref,
  disabled = false,
  onChange,
  ...rest
}: SliderProps): ReactElement {
  const generatedId = useId()
  const sliderId = id ?? generatedId
  const hintId = `${sliderId}-hint`
  const errorId = `${sliderId}-error`
  const invalid = error !== undefined && error !== null && error !== false

  // Meme valeur initiale que le natif sans attribut : le milieu de la plage.
  const [internal, setInternal] = useState(defaultValue ?? (min + max) / 2)
  const current = value ?? internal

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) setInternal(Number(event.target.value))
      onChange?.(event)
    },
    [onChange, value],
  )

  return (
    <div className={cx('o-flex o-flex-col o-gap-1', wrapperClassName)}>
      <div className="o-flex o-items-center o-justify-between o-gap-2">
        <label
          htmlFor={sliderId}
          className={cx(
            'o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50',
            hideLabel && 'o-sr-only',
          )}
        >
          {label}
        </label>
        {showValue ? (
          <span
            aria-hidden="true"
            className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-tabular-nums"
          >
            {formatValue !== undefined ? formatValue(current) : String(current)}
          </span>
        ) : null}
      </div>

      <input
        {...rest}
        id={sliderId}
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={handleChange}
        disabled={disabled}
        className={cx(
          'o-w-full',
          invalid
            ? 'o-accent-red-600 dark:o-accent-red-400'
            : 'o-accent-brand-600 dark:o-accent-brand-400',
          disabled ? 'o-opacity-50 o-cursor-not-allowed' : 'o-cursor-pointer',
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
