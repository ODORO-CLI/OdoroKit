/**
 * Mise a l'ecoute d'un serveur, avec bascule sur un port libre.
 *
 * @module
 */

import type { Server } from 'node:http'

/**
 * Combien de ports essayer avant d'abandonner.
 *
 * Assez pour traverser une poignee de serveurs oublies, pas au point de
 * chercher pendant une minute : si dix ports d'affilee sont pris, quelque chose
 * d'autre ne va pas, et le dire vaut mieux que continuer.
 */
const ESSAIS = 10

/** Ce que rend une mise a l'ecoute reussie. */
export interface Ecoute {
  /** Le port reellement obtenu. */
  readonly port: number
  /**
   * Le port demande, s'il differe de celui obtenu.
   *
   * Sert a le dire : un serveur qui s'ouvre ailleurs que la ou on l'attend
   * doit l'annoncer, sinon on recharge une page qui ne bougera pas.
   */
  readonly demande?: number
}

/**
 * Met un serveur a l'ecoute, en glissant vers le port suivant s'il est pris.
 *
 * ## Pourquoi glisser plutot qu'echouer
 *
 * `EADDRINUSE` arretait la commande. C'est le bon comportement pour un
 * serveur de production, dont le port fait partie du contrat ; c'en est un
 * mauvais pour un serveur de developpement, ou le port n'est qu'une commodite
 * et ou le coupable est presque toujours une fenetre de terminal oubliee.
 *
 * L'erreur obligeait alors a chercher le processus, le tuer, relancer — pour
 * un resultat que la machine pouvait trouver seule.
 *
 * ## Ce qui n'est pas rattrape
 *
 * Seul `EADDRINUSE` fait glisser. Un port refuse pour une autre raison — droits
 * insuffisants sous 1024, adresse inexistante — est une erreur de
 * configuration : glisser la masquerait, et le serveur s'ouvrirait ailleurs
 * sans que personne ne comprenne pourquoi.
 *
 * @param server Serveur a mettre a l'ecoute.
 * @param port Port souhaite.
 * @param host Interface d'ecoute.
 * @returns Le port obtenu, et le port demande s'il a fallu glisser.
 *
 * @example
 * const { port, demande } = await ecouter(server, 5180, 'localhost')
 * if (demande !== undefined) log.warn(`${demande} etait pris`)
 */
export async function ecouter(
  server: Server,
  port: number,
  host: string,
  essais = ESSAIS,
): Promise<Ecoute> {
  for (let decalage = 0; decalage < essais; decalage += 1) {
    const candidat = port + decalage

    const pris = await new Promise<boolean>((resolve, reject) => {
      // Les deux ecouteurs sont retires avant de rendre la main : sans cela,
      // une erreur survenue plus tard — le port repris par un autre pendant la
      // session — rejouerait la promesse deja resolue.
      const surErreur = (cause: NodeJS.ErrnoException): void => {
        server.removeListener('listening', surEcoute)
        if (cause.code === 'EADDRINUSE') {
          resolve(true)
          return
        }
        reject(cause)
      }

      const surEcoute = (): void => {
        server.removeListener('error', surErreur)
        resolve(false)
      }

      server.once('error', surErreur)
      server.once('listening', surEcoute)
      server.listen(candidat, host)
    })

    if (!pris) {
      // Le port **obtenu**, et non celui demande : avec `0`, le systeme en
      // attribue un, et rendre le zero ferait annoncer une adresse ou
      // personne n'ecoute.
      const adresse = server.address()
      const obtenu =
        typeof adresse === 'object' && adresse !== null ? adresse.port : candidat

      return decalage === 0 ? { port: obtenu } : { port: obtenu, demande: port }
    }
  }

  throw new Error(
    `[odoro] Aucun port libre entre ${String(port)} et ${String(port + essais - 1)}.`,
  )
}
