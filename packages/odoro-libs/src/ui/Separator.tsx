/**
 * Filet de separation.
 *
 * @module
 */

import { type HTMLAttributes, type ReactElement, type ReactNode } from 'react'

import { cx } from '../styles/cx.js'

/** Proprietes de {@link Separator}. */
export interface SeparatorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className'
> {
  /** Sens du filet. @defaultValue 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /**
   * Libelle centre entre deux filets. Horizontal seulement : un libelle sur
   * un filet vertical n'a pas de disposition raisonnable.
   */
  label?: ReactNode
  /**
   * Un separateur decoratif est retire de l'arbre d'accessibilite
   * (`aria-hidden`) ; sinon il porte `role="separator"` et son orientation.
   *
   * @defaultValue true
   */
  decorative?: boolean
  /** Classes additionnelles. */
  className?: string
}

/**
 * Filet horizontal ou vertical, avec libelle optionnel.
 *
 * @example
 * <Separator label="ou" />
 */
export function Separator({
  orientation = 'horizontal',
  label,
  decorative = true,
  className,
  ...rest
}: SeparatorProps): ReactElement {
  // ARIA considere un separateur horizontal comme l'orientation implicite ;
  // seul le vertical doit etre declare.
  const aria = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({
        role: 'separator',
        'aria-orientation':
          orientation === 'vertical' ? ('vertical' as const) : undefined,
      } as const)

  if (orientation === 'vertical') {
    return (
      <div
        {...rest}
        {...aria}
        className={cx('o-w-px o-self-stretch o-bg-border', className)}
      />
    )
  }

  if (label === undefined) {
    return (
      <div {...rest} {...aria} className={cx('o-h-px o-w-full o-bg-border', className)} />
    )
  }

  return (
    <div
      {...rest}
      {...aria}
      className={cx('o-flex o-items-center o-gap-3 o-w-full', className)}
    >
      <span className="o-h-px o-flex-1 o-bg-border" />
      <span className="o-text-sm o-text-fg-muted o-shrink-0">{label}</span>
      <span className="o-h-px o-flex-1 o-bg-border" />
    </div>
  )
}
