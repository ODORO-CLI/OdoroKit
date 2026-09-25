/**
 * A `Base` from a `pg` pool — without depending on `pg`.
 *
 * The shape is structural: any pool whose `query` and `connect` look like
 * node-postgres works, and the site keeps the driver version it chose.
 *
 * A transaction takes ONE client for its whole length: `BEGIN` on one
 * connection and `COMMIT` on another would commit nothing, silently.
 *
 * @module
 */

import type { Base, Query } from './base.js'

interface PgResult {
  rows: unknown[]
}

export interface PgClientLike {
  query(text: string, values?: readonly unknown[]): Promise<PgResult>
  release(): void
}

export interface PgPoolLike {
  query(text: string, values?: readonly unknown[]): Promise<PgResult>
  connect(): Promise<PgClientLike>
}

function reader(
  run: (text: string, values?: readonly unknown[]) => Promise<PgResult>,
): Query {
  return {
    query: async <Row extends object>(text: string, values?: readonly unknown[]) => {
      const { rows } = await run(text, values)
      return { rows: rows as Row[] }
    },
  }
}

export function baseFromPool(pool: PgPoolLike): Base {
  return {
    ...reader((text, values) => pool.query(text, values)),
    transaction: async (work) => {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const result = await work(reader((text, values) => client.query(text, values)))
        await client.query('COMMIT')
        return result
      } catch (cause) {
        await client.query('ROLLBACK').catch(() => undefined)
        throw cause
      } finally {
        client.release()
      }
    },
  }
}
