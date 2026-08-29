/**
 * Barre de progression.
 *
 * @module
 */

import { type HTMLAttributes, type ReactElement } from 'react'

import { cx } from '../styles/cx.js'

/** Couleur du remplissage par registre. */
const TONE_CLASSES: Readonly<
  Record<'primary' | 'success' | 'warning' | 'danger', string>
> = {
  primary: 'o-bg-brand-600 dark:o-bg-brand-400',
  success: 'o-bg-emerald-600 dark:o-bg-emerald-400',
  warning: 'o-bg-amber-600 dark:o-bg-amber-400',
  danger: 'o-bg-red-600 dark:o-bg-red-400',
}

/** Hauteur de la piste par taille. */
const SIZE_CLASSES: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: 'o-h-1',
  md: 'o-h-2',
  lg: 'o-h-3',
}

/** Proprietes de {@link Progress}. */
export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Valeur courante, bornee entre 0 et `max`. @defaultValue 0 */
  value?: number
  /** Valeur maximale. @defaultValue 100 */
  max?: number
  /**
   * Progression inconnue : une barre partielle defile en boucle et
   * `aria-valuenow` est omis, comme le veut ARIA pour un etat indetermine.
   *
   * @defaultValue false
   */
  indeterminate?: boolean
  /** Registre de couleur du remplissage. @defaultValue 'primary' */
  tone?: 'primary' | 'success' | 'warning' | 'danger'
  /** Taille (hauteur de la piste). @defaultValue 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Libelle accessible de la barre. */
  label?: string
  /**
   * Affiche le pourcentage a droite de la piste. Sans effet en mode
   * indetermine : il n'y a rien a chiffrer.
   *
   * @defaultValue false
   */
  showValue?: boolean
  /** Classes additionnelles. */
  className?: string
}

/**
 * Barre de progression.
 *
 * Le remplissage est dimensionne par un `width` en pourcentage : la feuille
 * utilitaire ne peut pas couvrir un continuum de largeurs.
 *
 * @example
 * <Progress value={done} max={total} label="Import des fichiers" showValue />
 */
export function Progress({
  value = 0,
  max = 100,
  indeterminate = false,
  tone = 'primary',
  size = 'md',
  label,
  showValue = false,
  className,
  ...rest
}: ProgressProps): ReactElement {
  const bounded = Math.min(Math.max(value, 0), max)
  const percent = max > 0 ? (bounded / max) * 100 : 0

  return (
    <div {...rest} className={cx('o-flex o-items-center o-gap-3', className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : bounded}
        className={cx(
          'o-flex-1 o-bg-zinc-100 dark:o-bg-zinc-950 o-rounded-full o-overflow-hidden',
          SIZE_CLASSES[size],
        )}
      >
        <div
          className={cx(
            'o-h-full o-rounded-full',
            TONE_CLASSES[tone],
            indeterminate && 'o-animate-indeterminate',
          )}
          style={{ width: indeterminate ? '25%' : `${percent}%` }}
        />
      </div>
      {showValue && !indeterminate ? (
        <span className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-tabular-nums o-shrink-0">
          {Math.round(percent)}%
        </span>
      ) : null}
    </div>
  )
}
