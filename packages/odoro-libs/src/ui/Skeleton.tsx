/**
 * Silhouette de chargement.
 *
 * @module
 */

import { type CSSProperties, type HTMLAttributes, type ReactElement } from 'react'

import { cx } from '../styles/cx.js'

/** Proprietes de {@link Skeleton}. */
export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Forme de la silhouette. @defaultValue 'text' */
  variant?: 'text' | 'circle' | 'rect'
  /** Largeur, en toute unite CSS (nombre : pixels). */
  width?: string | number
  /** Hauteur, en toute unite CSS (nombre : pixels). */
  height?: string | number
  /**
   * Nombre de lignes pour la variante `text` ; la derniere est raccourcie a
   * 60 % pour evoquer une fin de paragraphe.
   *
   * @defaultValue 1
   */
  lines?: number
  /** Classes additionnelles. */
  className?: string
}

/**
 * Silhouette animee affichee pendant un chargement.
 *
 * Toujours `aria-hidden` : elle ne porte aucune information — c'est au
 * conteneur d'annoncer le chargement (`aria-busy`, `role="status"`...).
 *
 * @example
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="circle" width={40} height={40} />
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className,
  style,
  ...rest
}: SkeletonProps): ReactElement {
  const shimmer = cx(
    'o-animate-shimmer o-bg-surface-sunken',
    variant === 'circle' ? 'o-rounded-full' : 'o-rounded-md',
  )

  const dimensions: CSSProperties = { width, height, ...style }

  if (variant === 'text' && lines > 1) {
    return (
      <div
        {...rest}
        aria-hidden="true"
        className={cx('o-flex o-flex-col o-gap-2', className)}
        style={dimensions}
      >
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className={cx(shimmer, 'o-h-4 o-w-full')}
            style={index === lines - 1 ? { width: '60%' } : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      {...rest}
      aria-hidden="true"
      className={cx(shimmer, variant === 'text' && 'o-h-4', className)}
      style={dimensions}
    />
  )
}
