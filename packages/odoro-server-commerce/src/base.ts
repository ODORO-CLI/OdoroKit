/**
 * What the commerce module needs from a database — and nothing more.
 *
 * `query` and `transaction`, the shape `@odoro-cli/cloud-connect` already has:
 * the app wires its connection, and the tests a plain `pg` pool. The module
 * never opens a connection itself, and never reads a connection string: that
 * belongs to the app's configuration.
 *
 * @module
 */

/** Something that runs SQL: a connection, or a transaction. */
export interface Query {
  query<Row extends object = Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ readonly rows: readonly Row[] }>
}

/** A database the module can also run a transaction on. */
export interface Base extends Query {
  transaction<T>(work: (tx: Query) => Promise<T>): Promise<T>
}

/** The capability version this module speaks. A `shop` 2.x would not be read. */
export const SHOP_MAJOR = 1

/**
 * Is the `shop` capability installed, at a version this module reads?
 *
 * Read in the database's own registry (`odoro.features`), which the capability
 * manager writes. Checked once per process: a capability is not uninstalled
 * under a running site.
 */
export async function shopInstalled(base: Query): Promise<boolean> {
  try {
    const { rows } = await base.query<{ version: string }>(
      `SELECT version FROM odoro.features WHERE name = 'shop' AND active`,
    )
    const version = rows[0]?.version
    return (
      version !== undefined &&
      Number.parseInt(version.split('.')[0] ?? '', 10) === SHOP_MAJOR
    )
  } catch {
    return false
  }
}
