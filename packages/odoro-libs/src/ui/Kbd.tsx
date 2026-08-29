/**
 * Touche de clavier.
 *
 * @module
 */

import { Fragment, type HTMLAttributes, type ReactElement, type ReactNode } from 'react'

import { cx } from '../styles/cx.js'

/** Habillage d'une touche isolee. */
const KEY_CLASSES = cx(
  'o-inline-flex o-items-center o-justify-center',
  'o-text-xs o-font-mono o-text-zinc-900 dark:o-text-zinc-50',
  'o-bg-zinc-100 dark:o-bg-zinc-950 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-rounded-sm o-shadow-2xs',
  'o-px-1.5 o-py-0.5 o-select-none',
)

/** Proprietes de {@link Kbd}. */
export interface KbdProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  /**
   * Combinaison : chaque touche est rendue dans son propre `<kbd>`, separee
   * par un « + ». Sans elle, `children` remplit un `<kbd>` unique.
   */
  keys?: readonly string[]
  /** Contenu de la touche quand `keys` n'est pas fournie. */
  children?: ReactNode
  /** Classes additionnelles. */
  className?: string
}

/**
 * Touche de clavier, seule ou en combinaison.
 *
 * @example
 * <Kbd>Echap</Kbd>
 * <Kbd keys={['Ctrl', 'K']} />
 */
export function Kbd({ keys, children, className, ...rest }: KbdProps): ReactElement {
  if (keys === undefined) {
    return (
      <kbd {...rest} className={cx(KEY_CLASSES, className)}>
        {children}
      </kbd>
    )
  }

  return (
    // Le conteneur reste un `<kbd>` : c'est l'imbrication que HTML prevoit
    // pour representer une combinaison de touches.
    <kbd {...rest} className={cx('o-inline-flex o-items-center o-gap-1', className)}>
      {keys.map((key, index) => (
        <Fragment key={`${key}-${index}`}>
          {index > 0 ? (
            <span
              aria-hidden="true"
              className="o-text-xs o-text-zinc-400 dark:o-text-zinc-500"
            >
              +
            </span>
          ) : null}
          <kbd className={KEY_CLASSES}>{key}</kbd>
        </Fragment>
      ))}
    </kbd>
  )
}
