/**
 * Zone de saisie multiligne avec libelle, aide et message d'erreur.
 *
 * @module
 */

import {
  type CSSProperties,
  type InputEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  useCallback,
  useId,
} from 'react'

import { cx } from '../styles/cx.js'
import { inputClasses } from './Input.jsx'

/**
 * Padding vertical par taille. Le champ texte n'herite pas du centrage d'un
 * `<input>` a hauteur fixe : la respiration verticale vient du padding.
 */
const SIZE_PADDING: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: 'o-py-1',
  md: 'o-py-2',
  lg: 'o-py-3',
}

/**
 * Hauteur minimale par taille. La feuille de base n'expose pas d'utilitaires
 * `o-min-h-*` a valeur fixe : la contrainte passe par le style en ligne.
 */
const SIZE_MIN_HEIGHT: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: '4rem',
  md: '5.5rem',
  lg: '7rem',
}

/** Proprietes de {@link Textarea}. */
export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
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
   * Ajuste la hauteur au contenu a chaque saisie. La hauteur minimale de la
   * taille choisie reste le plancher.
   *
   * @defaultValue false
   */
  autoResize?: boolean
  /** Classes additionnelles appliquees a l'element `<textarea>`. */
  className?: string
  /** Classes additionnelles appliquees au conteneur. */
  wrapperClassName?: string
  /** Ref vers l'element natif. */
  ref?: Ref<HTMLTextAreaElement>
}

/**
 * Zone de saisie multiligne.
 *
 * Reprend l'habillage d'{@link Input} (via `inputClasses`), mais remplace la
 * hauteur fixe des tailles par une hauteur minimale : un texte long doit
 * pouvoir grandir, a la poignee de redimensionnement ou via `autoResize`.
 *
 * @example
 * <Textarea
 *   label="Message"
 *   hint="Markdown accepte."
 *   autoResize
 * />
 */
export function Textarea({
  label,
  hideLabel = false,
  hint,
  error,
  size = 'md',
  autoResize = false,
  className,
  wrapperClassName,
  id,
  ref,
  style,
  onInput,
  ...rest
}: TextareaProps): ReactElement {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const hintId = `${textareaId}-hint`
  const errorId = `${textareaId}-error`
  const invalid = error !== undefined && error !== null && error !== false

  const handleInput = useCallback(
    (event: InputEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        const node = event.currentTarget
        // Repasser a 'auto' avant de mesurer : sans cela, scrollHeight ne
        // redescend jamais quand du texte est supprime.
        node.style.height = 'auto'
        node.style.height = `${node.scrollHeight}px`
      }
      onInput?.(event)
    },
    [autoResize, onInput],
  )

  // `inputClasses` pose une hauteur fixe (o-h-*) que l'ordre des classes dans
  // l'attribut ne permet pas de surcharger de facon fiable : le style en ligne
  // tranche la cascade de maniere deterministe.
  const sizeStyle: CSSProperties = {
    height: 'auto',
    minHeight: SIZE_MIN_HEIGHT[size],
  }

  return (
    <div className={cx('o-flex o-flex-col o-gap-1', wrapperClassName)}>
      <label
        htmlFor={textareaId}
        className={cx(
          'o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50',
          hideLabel && 'o-sr-only',
        )}
      >
        {label}
      </label>

      <textarea
        {...rest}
        id={textareaId}
        ref={ref}
        style={{ ...sizeStyle, ...style }}
        onInput={handleInput}
        className={cx(
          inputClasses({ size, invalid: invalid ? 'true' : 'false' }),
          SIZE_PADDING[size],
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
