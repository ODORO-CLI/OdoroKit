/**
 * Interrupteur a deux etats.
 *
 * @module
 */

import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
  useState,
} from 'react'

import { cx, variants } from '../styles/cx.js'

/**
 * Classes de la piste, exposees pour composer un interrupteur sur mesure sans
 * dupliquer la table de variantes.
 */
export const switchClasses = variants({
  base: cx(
    'o-inline-flex o-items-center o-shrink-0',
    'o-rounded-full o-p-0.5 o-transition',
  ),
  variants: {
    size: {
      sm: 'o-h-4 o-w-7',
      md: 'o-h-5 o-w-9',
      lg: 'o-h-6 o-w-12',
    },
    checked: {
      true: 'o-bg-primary',
      false: 'o-bg-surface-sunken',
    },
  },
  defaults: { size: 'md', checked: 'false' },
})

/** Taille du pouce par taille de piste. */
const THUMB_SIZE: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: 'o-h-3 o-w-3',
  md: 'o-h-4 o-w-4',
  lg: 'o-h-5 o-w-5',
}

/**
 * Course du pouce par taille : largeur de piste moins pouce et padding, pour
 * qu'il s'arrete au ras du bord oppose.
 */
const THUMB_TRAVEL: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: 'o-translate-x-3',
  md: 'o-translate-x-4',
  lg: 'o-translate-x-6',
}

/** Proprietes de {@link Switch}. */
export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'defaultChecked' | 'role' | 'aria-checked'
> {
  /** Libelle de l'interrupteur, rendu a cote et clicable. Obligatoire. */
  label: ReactNode
  /** Complement affiche sous le libelle. */
  description?: ReactNode
  /** Etat en mode controle. */
  checked?: boolean
  /** Etat initial en mode non controle. @defaultValue false */
  defaultChecked?: boolean
  /** Appele avec le nouvel etat a chaque bascule. */
  onCheckedChange?: (checked: boolean) => void
  /** Taille. @defaultValue 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Classes additionnelles appliquees a la piste. */
  className?: string
  /** Classes additionnelles appliquees au conteneur. */
  wrapperClassName?: string
  /** Ref vers l'element natif. */
  ref?: Ref<HTMLButtonElement>
}

/**
 * Interrupteur.
 *
 * Un `<button role="switch">` plutot qu'une case a cocher : l'effet est
 * immediat, sans notion de formulaire a soumettre. L'etat est porte par
 * `aria-checked`, la bascule repond au clic comme a Espace ou Entree (natif
 * du bouton). Le pouce glisse par transformation : une propriete composee,
 * aucune recomposition.
 *
 * @example
 * <Switch
 *   label="Notifications"
 *   description="Recevoir un courriel a chaque commentaire."
 *   defaultChecked
 *   onCheckedChange={setEnabled}
 * />
 */
export function Switch({
  label,
  description,
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = 'md',
  className,
  wrapperClassName,
  id,
  ref,
  disabled = false,
  onClick,
  ...rest
}: SwitchProps): ReactElement {
  const generatedId = useId()
  const switchId = id ?? generatedId
  const descriptionId = `${switchId}-description`

  const [internal, setInternal] = useState(defaultChecked)
  const isChecked = checked ?? internal

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const next = !isChecked
      if (checked === undefined) setInternal(next)
      onCheckedChange?.(next)
      onClick?.(event)
    },
    [checked, isChecked, onCheckedChange, onClick],
  )

  return (
    <div className={cx('o-flex o-items-start o-gap-2', wrapperClassName)}>
      <button
        {...rest}
        id={switchId}
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-describedby={description !== undefined ? descriptionId : undefined}
        disabled={disabled}
        onClick={handleClick}
        className={cx(
          switchClasses({ size, checked: isChecked ? 'true' : 'false' }),
          disabled ? 'o-opacity-50 o-cursor-not-allowed' : 'o-cursor-pointer',
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            'o-block o-rounded-full o-bg-surface o-shadow-sm o-transition-transform',
            THUMB_SIZE[size],
            isChecked ? THUMB_TRAVEL[size] : 'o-translate-x-0',
          )}
        />
      </button>

      <div className="o-flex o-flex-col o-gap-0.5">
        <label
          htmlFor={switchId}
          className={cx(
            'o-text-sm o-font-medium o-text-fg o-select-none',
            disabled ? 'o-cursor-not-allowed' : 'o-cursor-pointer',
          )}
        >
          {label}
        </label>
        {description !== undefined ? (
          <p id={descriptionId} className="o-text-sm o-text-fg-muted">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
