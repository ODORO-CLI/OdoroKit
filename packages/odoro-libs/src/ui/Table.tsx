/**
 * Tableau de donnees generique.
 *
 * @module
 */

import { type ReactElement, type ReactNode } from 'react'

import { cx } from '../styles/cx.js'

/** Une colonne du tableau. */
export interface TableColumn<T> {
  /**
   * Cle de la colonne. Sans `render`, elle sert aussi a lire la valeur de la
   * ligne : `row[key]` doit alors etre affichable tel quel.
   */
  readonly key: string
  /** En-tete affiche. */
  readonly header: ReactNode
  /** Alignement du contenu de la colonne. @defaultValue 'left' */
  readonly align?: 'left' | 'center' | 'right'
  /** Rendu personnalise d'une cellule, a partir de la ligne entiere. */
  readonly render?: (row: T) => ReactNode
}

/** Proprietes de {@link Table}. */
export interface TableProps<T> {
  /** Colonnes, dans l'ordre d'affichage. */
  columns: readonly TableColumn<T>[]
  /** Lignes de donnees. */
  rows: readonly T[]
  /** Cle stable d'une ligne, pour la reconciliation. */
  rowKey: (row: T) => string
  /**
   * Legende du tableau. Masquee visuellement par defaut, elle reste le titre
   * que les lecteurs d'ecran annoncent.
   */
  caption?: ReactNode
  /** Rend la legende visible. @defaultValue false */
  showCaption?: boolean
  /** Alterne le fond des lignes. @defaultValue false */
  striped?: boolean
  /** Surligne la ligne survolee. @defaultValue false */
  hoverable?: boolean
  /** Resserre l'espacement vertical. @defaultValue false */
  dense?: boolean
  /**
   * Garde l'en-tete visible pendant le defilement vertical du conteneur.
   *
   * @defaultValue false
   */
  stickyHeader?: boolean
  /** Message affiche, centre, quand il n'y a aucune ligne. */
  empty?: ReactNode
  /** Classes additionnelles pour le conteneur defilant. */
  className?: string
}

/** Classes d'alignement, par valeur de `align`. */
const ALIGN_CLASSES: Readonly<Record<'left' | 'center' | 'right', string>> = {
  left: 'o-text-left',
  center: 'o-text-center',
  right: 'o-text-right',
}

/**
 * Tableau de donnees accessible.
 *
 * Le tableau vit dans un conteneur `o-overflow-x-auto` : sur un ecran etroit,
 * c'est lui qui defile, jamais la page.
 *
 * @example
 * <Table
 *   caption="Factures du trimestre"
 *   columns={[
 *     { key: 'ref', header: 'Reference' },
 *     { key: 'total', header: 'Total', align: 'right', render: (f) => euros(f.total) },
 *   ]}
 *   rows={invoices}
 *   rowKey={(f) => f.ref}
 *   empty="Aucune facture."
 * />
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  caption,
  showCaption = false,
  striped = false,
  hoverable = false,
  dense = false,
  stickyHeader = false,
  empty,
  className,
}: TableProps<T>): ReactElement {
  const cellPadding = dense ? 'o-px-3 o-py-1.5' : 'o-px-4 o-py-3'

  return (
    <div className={cx('o-overflow-x-auto o-w-full', className)}>
      <table className="o-w-full o-text-sm o-text-fg">
        {caption === undefined ? null : (
          <caption
            className={cx(
              showCaption ? 'o-text-left o-text-sm o-text-fg-muted o-pb-2' : 'o-sr-only',
            )}
          >
            {caption}
          </caption>
        )}
        <thead className={cx(stickyHeader && 'o-sticky o-top-0 o-bg-surface')}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cx(
                  'o-text-fg-muted o-text-sm o-font-medium',
                  'o-border-b o-border-border',
                  cellPadding,
                  ALIGN_CLASSES[column.align ?? 'left'],
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cx('o-text-center o-text-fg-muted o-py-8', 'o-px-4')}
              >
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={rowKey(row)}
                className={cx(
                  striped && index % 2 === 1 && 'o-bg-surface-sunken',
                  hoverable && 'hover:o-bg-surface-hover o-transition',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cx(
                      'o-border-b o-border-border o-align-middle',
                      cellPadding,
                      ALIGN_CLASSES[column.align ?? 'left'],
                    )}
                  >
                    {column.render === undefined
                      ? // Sans rendu personnalise, la cle designe la propriete de
                        // la ligne. Le contrat est documente sur `TableColumn.key`.
                        ((row as Record<string, unknown>)[column.key] as ReactNode)
                      : column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
