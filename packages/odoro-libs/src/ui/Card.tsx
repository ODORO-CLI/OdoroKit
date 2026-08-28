/**
 * Carte de contenu.
 *
 * @module
 */

import { type HTMLAttributes, type ReactElement, type ReactNode, type Ref } from 'react'

import { cx, variants } from '../styles/cx.js'

/**
 * Classes de la carte, exposees pour habiller un autre conteneur (un `<a>`,
 * un `<article>`) sans dupliquer la table de variantes.
 *
 * @example
 * <a href="/projets/1" className={cardClasses({ variant: 'elevated' })}>...</a>
 */
export const cardClasses = variants({
  // `o-overflow-hidden` garantit qu'un media pleine largeur epouse les coins
  // arrondis au lieu de les depasser. Le fond est porte par chaque variante :
  // deux classes de fond concurrentes seraient departagees par l'ordre de la
  // feuille, pas par l'ordre d'ecriture.
  base: 'o-flex o-flex-col o-rounded-md o-overflow-hidden',
  variants: {
    variant: {
      outlined: 'o-bg-surface o-border-w-1 o-border-border',
      elevated: 'o-bg-surface o-shadow-md',
      ghost: 'o-bg-bg-subtle',
    },
    interactive: {
      true: 'hover:o-lift-sm o-transition-transform hover:o-shadow-md o-cursor-pointer',
      false: '',
    },
  },
  defaults: { variant: 'outlined', interactive: 'false' },
})

/** Ecarts internes disponibles pour le corps de la carte. */
const PADDING_CLASSES: Readonly<Record<'none' | 'sm' | 'md' | 'lg', string>> = {
  none: '',
  sm: 'o-p-3',
  md: 'o-p-4',
  lg: 'o-p-6',
}

/** Proprietes de {@link Card}. */
export interface CardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'title'
> {
  /** Titre affiche en tete du corps. */
  title?: ReactNode
  /** Sous-titre affiche sous le titre. */
  description?: ReactNode
  /**
   * Media rendu pleine largeur au-dessus du corps, hors de tout padding
   * (image, video, illustration).
   */
  media?: ReactNode
  /** Zone de pied, sous le contenu. */
  footer?: ReactNode
  /** Contenu principal. */
  children?: ReactNode
  /** Registre visuel. @defaultValue 'outlined' */
  variant?: 'outlined' | 'elevated' | 'ghost'
  /** Reagit au survol (elevation et curseur). @defaultValue false */
  interactive?: boolean
  /** Ecart interne du corps et du pied. @defaultValue 'md' */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Classes additionnelles. */
  className?: string
  /** Ref vers l'element natif. */
  ref?: Ref<HTMLDivElement>
}

/**
 * Carte composable : media, titre, description, contenu et pied optionnels.
 *
 * @example
 * <Card
 *   variant="elevated"
 *   title="Projet Odoro"
 *   description="Librairie front maison."
 *   footer={<Button size="sm">Ouvrir</Button>}
 * >
 *   <p>Trois modules livres cette semaine.</p>
 * </Card>
 */
export function Card({
  title,
  description,
  media,
  footer,
  children,
  variant = 'outlined',
  interactive = false,
  padding = 'md',
  className,
  ref,
  ...rest
}: CardProps): ReactElement {
  const hasHeader = title !== undefined || description !== undefined
  const hasBody = hasHeader || children !== undefined

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        cardClasses({ variant, interactive: interactive ? 'true' : 'false' }),
        className,
      )}
    >
      {media === undefined ? null : (
        <div className="o-w-full o-overflow-hidden">{media}</div>
      )}

      {hasBody ? (
        <div
          className={cx('o-flex o-flex-col o-gap-2 o-flex-1', PADDING_CLASSES[padding])}
        >
          {hasHeader ? (
            <div className="o-flex o-flex-col o-gap-1">
              {title === undefined ? null : (
                <h3 className="o-text-base o-font-semibold o-text-fg">{title}</h3>
              )}
              {description === undefined ? null : (
                <p className="o-text-sm o-text-fg-muted">{description}</p>
              )}
            </div>
          ) : null}
          {children}
        </div>
      ) : null}

      {footer === undefined ? null : (
        <div className={cx('o-border-t o-border-border', PADDING_CLASSES[padding])}>
          {footer}
        </div>
      )}
    </div>
  )
}
