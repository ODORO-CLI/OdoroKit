/**
 * Bouton.
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
} from 'react'

import { useAnimate } from '../motion/useAnimate.js'
import { cx, variants } from '../styles/cx.js'

/**
 * Classes du bouton, exposees pour habiller un `<a>` ou un `<Link>` a
 * l'identique sans dupliquer la table de variantes.
 *
 * @example
 * <Link to="/docs" className={buttonClasses({ tone: 'secondary' })}>Docs</Link>
 */
export const buttonClasses = variants({
  base: cx(
    'o-inline-flex o-items-center o-justify-center o-gap-2',
    'o-rounded-md o-font-medium o-select-none o-transition',
  ),
  variants: {
    tone: {
      primary:
        'o-bg-primary o-text-on-primary hover:o-bg-primary-hover active:o-bg-primary-active',
      secondary:
        'o-bg-surface-sunken o-text-fg o-border-w-1 o-border-border hover:o-bg-surface-hover',
      ghost: 'o-text-fg hover:o-bg-surface-hover',
      danger: 'o-bg-danger o-text-on-danger hover:o-bg-danger-hover',
    },
    size: {
      sm: 'o-h-8 o-px-3 o-text-sm',
      md: 'o-h-10 o-px-4 o-text-base',
      lg: 'o-h-12 o-px-5 o-text-lg',
    },
    block: {
      true: 'o-w-full',
      false: '',
    },
  },
  defaults: { tone: 'primary', size: 'md', block: 'false' },
})

/** Proprietes de {@link Button}. */
export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  /** Registre visuel. @defaultValue 'primary' */
  tone?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** Taille. @defaultValue 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Occupe toute la largeur disponible. @defaultValue false */
  block?: boolean
  /**
   * Affiche un indicateur de chargement et neutralise le bouton. Le libelle
   * reste en place : sa disparition ferait sauter la mise en page et priverait
   * les lecteurs d'ecran du contexte.
   */
  loading?: boolean
  /** Element decoratif place avant le libelle. */
  startSlot?: ReactNode
  /** Element decoratif place apres le libelle. */
  endSlot?: ReactNode
  /** Classes additionnelles. */
  className?: string
  /** Ref vers l'element natif. */
  ref?: Ref<HTMLButtonElement>
  /**
   * Joue une breve pression a l'activation.
   *
   * Neutralise sous `prefers-reduced-motion`.
   *
   * @defaultValue true
   */
  press?: boolean
}

/** Indicateur de chargement. Purement decoratif : l'etat est porte par ARIA. */
function Spinner(): ReactElement {
  return (
    <svg
      className="o-animate-spin o-shrink-0"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Bouton d'action.
 *
 * Le libelle reste visible pendant le chargement ; l'etat est annonce par
 * `aria-busy` et l'activation est bloquee par `aria-disabled` plutot que par
 * `disabled`, ce qui garde le bouton focusable et donc annoncable.
 *
 * @example
 * <Button tone="danger" size="sm" loading={pending} onClick={remove}>
 *   Supprimer
 * </Button>
 */
export function Button({
  tone = 'primary',
  size = 'md',
  block = false,
  loading = false,
  startSlot,
  endSlot,
  className,
  children,
  disabled = false,
  press = true,
  onClick,
  ref,
  ...rest
}: ButtonProps): ReactElement {
  const [animationRef, controls] = useAnimate<HTMLButtonElement>()
  const inert = disabled || loading

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (inert) {
        event.preventDefault()
        return
      }
      if (press) {
        void controls.play(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(0.97)' },
            { transform: 'scale(1)' },
          ],
          { duration: 'faster', easing: 'emphasized' },
        )
      }
      onClick?.(event)
    },
    [controls, inert, onClick, press],
  )

  return (
    <button
      {...rest}
      ref={(node) => {
        animationRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      type={rest.type ?? 'button'}
      className={cx(
        buttonClasses({ tone, size, block: block ? 'true' : 'false' }),
        inert && 'o-opacity-50 o-cursor-not-allowed',
        !inert && 'o-cursor-pointer',
        className,
      )}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {loading ? <Spinner /> : startSlot}
      {children}
      {endSlot}
    </button>
  )
}
