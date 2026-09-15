/**
 * Putting a server on the air, sliding to a free port when needed.
 *
 * @module
 */

import type { Server } from 'node:http'

/**
 * How many ports to try before giving up.
 *
 * Enough to walk past a handful of forgotten servers, not so many as to search
 * for a minute: if ten ports in a row are taken, something else is wrong, and
 * saying so is better than carrying on.
 */
const ATTEMPTS = 10

/** What a successful listen returns. */
export interface Listening {
  /** The port actually obtained. */
  readonly port: number
  /**
   * The requested port, when it differs from the one obtained.
   *
   * Exists to be said: a server that opens somewhere other than where it is
   * expected must announce it, otherwise you reload a page that will not move.
   */
  readonly requested?: number
}

/**
 * Puts a server on the air, sliding to the next port when it is taken.
 *
 * ## Why slide rather than fail
 *
 * `EADDRINUSE` used to stop the command. That is the right behaviour for a
 * production server, whose port is part of the contract; it is the wrong one
 * for a development server, where the port is only a convenience and where the
 * culprit is almost always a forgotten terminal window.
 *
 * The error then forced you to find the process, kill it, start again — for a
 * result the machine could find on its own.
 *
 * ## What is not caught
 *
 * Only `EADDRINUSE` slides. A port refused for another reason — insufficient
 * rights under 1024, non-existent address — is a configuration error: sliding
 * would hide it, and the server would open elsewhere without anyone
 * understanding why.
 *
 * @param server Server to put on the air.
 * @param port Desired port.
 * @param host Interface to listen on.
 * @returns The port obtained, and the requested port if sliding was needed.
 *
 * @example
 * const { port, requested } = await listen(server, 5180, 'localhost')
 * if (requested !== undefined) log.warn(`${requested} was in use`)
 */
export async function listen(
  server: Server,
  port: number,
  host: string,
  attempts = ATTEMPTS,
): Promise<Listening> {
  for (let offset = 0; offset < attempts; offset += 1) {
    const candidate = port + offset

    const taken = await new Promise<boolean>((resolve, reject) => {
      // Both listeners are removed before handing back control: without that,
      // an error occurring later — the port taken over by someone else during
      // the session — would replay the already settled promise.
      const onError = (cause: NodeJS.ErrnoException): void => {
        server.removeListener('listening', onListening)
        if (cause.code === 'EADDRINUSE') {
          resolve(true)
          return
        }
        reject(cause)
      }

      const onListening = (): void => {
        server.removeListener('error', onError)
        resolve(false)
      }

      server.once('error', onError)
      server.once('listening', onListening)
      server.listen(candidate, host)
    })

    if (!taken) {
      // The port **obtained**, and not the one requested: with `0`, the system
      // assigns one, and returning the zero would announce an address where
      // nobody listens.
      const address = server.address()
      const obtained =
        typeof address === 'object' && address !== null ? address.port : candidate

      return offset === 0 ? { port: obtained } : { port: obtained, requested: port }
    }
  }

  throw new Error(
    `[odoro] No free port between ${String(port)} and ${String(port + attempts - 1)}.`,
  )
}
