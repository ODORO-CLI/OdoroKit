/**
 * Case a cocher dessinee au-dessus de l'input natif.
 *
 * @module
 */

import {
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { cx } from '../styles/cx.js'

/** Proprietes de {@link Checkbox}. */
export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type' | 'size' | 'children'
> {
  /** Libelle de la case. Obligatoire : une case sans libelle est inutilisable. */
  label: ReactNode
  /** Complement affiche sous le libelle. */
  description?: ReactNode
  /**
   * Etat intermediaire (« certains elements coches »). Purement visuel et
   * ARIA : il ne change pas la valeur soumise, et un clic repasse par le cycle
   * natif coche / decoche.
   *
   * @defaultValue false
   */
  indeterminate?: boolean
  /** Classes additionnelles appliquees a la boite dessinee. */
  className?: string
  /** Classes additionnelles appliquees au conteneur. */
  wrapperClassName?: string
  /** Ref vers l'element natif. */
  ref?: Ref<HTMLInputElement>
}

/**
 * Case a cocher.
 *
 * L'input natif reste dans la page (masque par `o-sr-only`) : clavier, formu-
 * laires et lecteurs d'ecran passent par lui ; la boite visible n'est qu'un
 * dessin `aria-hidden`. Aucun selecteur utilitaire ne cible « l'input voisin a
 * le focus » : l'anneau de focus est donc pose par l'etat React, alimente par
 * `onFocus` / `onBlur` de l'input.
 *
 * @example
 * <Checkbox
 *   label="Se souvenir de moi"
 *   description="La session reste ouverte 30 jours."
 *   defaultChecked
 * />
 */
export function Checkbox({
  label,
  description,
  indeterminate = false,
  className,
  wrapperClassName,
  id,
  ref,
  checked,
  defaultChecked,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  ...rest
}: CheckboxProps): ReactElement {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = `${inputId}-description`

  // L'etat interne suit l'input en mode non controle ; la prop `checked`
  // l'emporte des qu'elle est fournie.
  const [internal, setInternal] = useState(defaultChecked ?? false)
  const isChecked = checked ?? internal
  const [focused, setFocused] = useState(false)

  const innerRef = useRef<HTMLInputElement | null>(null)

  // `indeterminate` n'existe pas en attribut HTML : seul le DOM le porte.
  useEffect(() => {
    if (innerRef.current !== null) innerRef.current.indeterminate = indeterminate
  }, [indeterminate])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      // Un navigateur ne delivre pas de clic a un input desactive, mais un
      // clic programmatique (tests, `element.click()`) passe outre : le garde
      // rend l'etat desactive fiable dans les deux cas.
      if (disabled) return
      if (checked === undefined) setInternal(event.target.checked)
      onChange?.(event)
    },
    [checked, disabled, onChange],
  )

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setFocused(true)
      onFocus?.(event)
    },
    [onFocus],
  )

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      onBlur?.(event)
    },
    [onBlur],
  )

  const filled = isChecked || indeterminate

  return (
    <div className={cx('o-flex o-flex-col o-gap-1', wrapperClassName)}>
      <label
        htmlFor={inputId}
        className={cx(
          'o-inline-flex o-items-center o-gap-2 o-select-none',
          disabled ? 'o-opacity-50 o-cursor-not-allowed' : 'o-cursor-pointer',
        )}
      >
        <input
          {...rest}
          id={inputId}
          ref={(node) => {
            innerRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          type="checkbox"
          className="o-sr-only"
          checked={isChecked}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          aria-describedby={description !== undefined ? descriptionId : undefined}
        />

        <span
          aria-hidden="true"
          className={cx(
            'o-inline-flex o-items-center o-justify-center o-shrink-0',
            'o-h-4 o-w-4 o-rounded-sm o-border-w-1 o-transition',
            filled
              ? 'o-bg-primary o-border-primary o-text-on-primary'
              : 'o-bg-surface o-border-border-strong',
            focused && 'o-ring',
            className,
          )}
        >
          {indeterminate ? (
            <svg width="10" height="10" viewBox="0 0 24 24" focusable="false">
              <path
                d="M5 12h14"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          ) : isChecked ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" focusable="false">
              <path
                d="M4 12l6 6L20 6"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>

        <span className="o-text-sm o-font-medium o-text-fg">{label}</span>
      </label>

      {description !== undefined ? (
        <p id={descriptionId} className="o-pl-6 o-text-sm o-text-fg-muted">
          {description}
        </p>
      ) : null}
    </div>
  )
}
