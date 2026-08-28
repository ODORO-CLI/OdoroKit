/**
 * Fil d'Ariane.
 *
 * @module
 */

import { Fragment, type ReactElement, type ReactNode } from 'react'

import { cx } from '../styles/cx.js'

/** Une etape du fil d'Ariane. */
export interface BreadcrumbItem {
  /** Libelle affiche. */
  readonly label: ReactNode
  /** Destination. Sans lien, l'etape est rendue en texte simple. */
  readonly href?: string
}

/** Proprietes de {@link Breadcrumb}. */
export interface BreadcrumbProps {
  /** Etapes, de la racine a la page courante. */
  items: readonly BreadcrumbItem[]
  /** Libelle accessible de la navigation. @defaultValue "Fil d'Ariane" */
  label?: string
  /** Separateur entre les etapes. @defaultValue un chevron */
  separator?: ReactNode
  /** Classes additionnelles pour la navigation. */
  className?: string
}

/** Chevron separateur par defaut. */
function Chevron(): ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="o-shrink-0 o-text-fg-subtle"
    >
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Fil d'Ariane semantique.
 *
 * La derniere etape represente la page courante : elle porte
 * `aria-current="page"` et n'est jamais un lien. Les separateurs sont hors du
 * flux accessible, la structure `ol`/`li` suffit aux lecteurs d'ecran.
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: 'Accueil', href: '/' },
 *     { label: 'Projets', href: '/projets' },
 *     { label: 'OdoroKit' },
 *   ]}
 * />
 */
export function Breadcrumb({
  items,
  label = "Fil d'Ariane",
  separator,
  className,
}: BreadcrumbProps): ReactElement {
  return (
    <nav aria-label={label} className={className}>
      <ol className="o-flex o-flex-wrap o-items-center o-gap-2 o-list-none o-m-0 o-p-0 o-text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            // Une etape n'a pas d'identifiant : sa position suffit.
            <Fragment key={index}>
              {index === 0 ? null : (
                <li aria-hidden="true" className="o-flex o-items-center">
                  {separator ?? <Chevron />}
                </li>
              )}
              <li className="o-flex o-items-center">
                {isLast ? (
                  <span aria-current="page" className="o-text-fg o-font-medium">
                    {item.label}
                  </span>
                ) : item.href === undefined ? (
                  <span className="o-text-fg-muted">{item.label}</span>
                ) : (
                  <a
                    href={item.href}
                    className={cx('o-text-fg-muted hover:o-text-fg', 'o-transition')}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
