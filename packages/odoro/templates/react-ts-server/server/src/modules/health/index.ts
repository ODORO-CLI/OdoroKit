/**
 * Module de sante — et exemple de ce a quoi ressemble un module.
 *
 * C'est le seul module de ce template, et il est ecrit ici plutot que fourni
 * par `@odoro/server` pour une raison : ecrire un module est la premiere chose
 * qu'on fait sur ce socle, et un exemple qu'on peut ouvrir vaut mieux qu'une
 * page de documentation.
 *
 * ## Un module est une fonction de ce dont il a besoin
 *
 * Celui-ci recoit la configuration en parametre plutot que de lire
 * `process.env`. C'est la regle du socle : l'environnement est valide une fois,
 * au demarrage, et tout le reste consomme le resultat. Une lecture directe
 * echappe a cette validation et se manifeste a la centieme requete.
 *
 * ## Deux points de controle, et pourquoi ils different
 *
 * `/api/health` repond que **le processus vit**. Il ne teste rien d'autre, et
 * doit repondre meme quand tout le reste est casse : c'est ce qu'un
 * orchestrateur interroge pour decider s'il faut redemarrer le conteneur. Le
 * faire dependre de la base ferait redemarrer un serveur parfaitement sain
 * chaque fois que la base hoquette — et un redemarrage ne repare pas une base.
 *
 * `/api/ready` repond que **le service peut travailler**, et rend 503 tant
 * qu'il manque quelque chose : c'est ce qu'un repartiteur interroge pour
 * decider s'il peut envoyer du trafic.
 *
 * Confondre les deux donne l'un des deux defauts : un service qui redemarre en
 * boucle pendant un incident de base, ou un repartiteur qui envoie du trafic a
 * un service incapable de repondre.
 *
 * ## Pourquoi `/ready` echoue au premier demarrage
 *
 * Un projet fraichement echafaude n'a pas encore de `DATABASE_URL`. Le client
 * demarre, l'interface s'affiche, et `/api/ready` dit ce qui manque. On voit
 * donc quelque chose des la premiere minute, et on sait exactement ce qu'il
 * reste a faire.
 *
 * @module
 */

import {
  ServiceUnavailableError,
  defineModule,
  route,
  type KernelConfig,
} from '@odoro/server'
import { z } from 'zod'

/** Ce que rend le controle de vie. */
const liveness = z.object({
  status: z.literal('ok'),
  environment: z.string(),
  uptime: z.number(),
})

/** Ce que rend le controle de disponibilite, quand tout repond. */
const readiness = z.object({
  ready: z.literal(true),
  dependencies: z.array(z.object({ name: z.string(), detail: z.string() })),
})

/** Une dependance et son etat. */
interface Dependency {
  readonly name: string
  readonly ready: boolean
  readonly detail: string
}

/**
 * Etat des dependances.
 *
 * La base n'est pas encore interrogee — le socle n'a pas sa couche de
 * persistance. Ce qui est verifie ici est sa **configuration**, ce qui suffit
 * a distinguer un projet qui n'a jamais recu d'URL d'un projet configure.
 * Quand la persistance arrivera, c'est cette fonction qui apprendra a ouvrir
 * une connexion, et rien d'autre ne changera.
 */
function inspect(config: KernelConfig): readonly Dependency[] {
  const url = config.DATABASE_URL.trim()
  return [
    {
      name: 'database',
      ready: url.length > 0,
      detail:
        url.length > 0
          ? 'URL configuree'
          : 'DATABASE_URL absente — voir .env.example, ou lancer `odoro db:create`',
    },
  ]
}

/**
 * Construit le module.
 *
 * @example
 * createApp({ modules: [createHealthModule(config)], … })
 */
export function createHealthModule(config: KernelConfig) {
  return defineModule({
    name: 'health',
    routes: [
      route({
        name: 'health.live',
        method: 'GET',
        path: '/api/health',
        auth: 'public',
        summary: 'Le processus repond.',
        output: liveness,
        handler: () => ({
          status: 'ok' as const,
          environment: config.NODE_ENV,
          uptime: Math.round(process.uptime()),
        }),
      }),

      route({
        name: 'health.ready',
        method: 'GET',
        path: '/api/ready',
        auth: 'public',
        summary: 'Les dependances repondent.',
        output: readiness,
        handler: () => {
          const dependencies = inspect(config)
          const manquantes = dependencies.filter((d) => !d.ready)

          if (manquantes.length > 0) {
            // 503 et non 500 : la demande etait valide, c'est le service qui
            // ne peut pas encore y repondre.
            throw new ServiceUnavailableError(
              manquantes.map((d) => `${d.name} — ${d.detail}`).join(' ; '),
            )
          }

          return {
            ready: true as const,
            dependencies: dependencies.map(({ name, detail }) => ({ name, detail })),
          }
        },
      }),
    ] as never,
  })
}
