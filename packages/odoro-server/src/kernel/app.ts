/**
 * Assemblage de l'application Express.
 *
 * ## L'ordre des couches n'est pas négociable
 *
 * 1. **Contexte de requête** — d'abord, sans quoi les premières lignes de
 *    journal sortent sans identifiant de corrélation, et ce sont souvent
 *    celles qui comptent.
 * 2. **Corps**, avec son plafond de taille.
 * 3. **Portée du conteneur** — chaque requête ouvre la sienne, et la referme
 *    à la fin, y compris quand elle échoue.
 * 4. **Routes**, dans l'ordre topologique des modules.
 * 5. **Route absente**, qui produit un `problem+json` plutôt que la page HTML
 *    d'Express.
 * 6. **Gestionnaire d'erreurs**, en dernier — Express le reconnaît à ses
 *    quatre paramètres.
 *
 * ## Express 5 et les promesses rejetées
 *
 * Un handler `async` dont la promesse est rejetée était, en Express 4, une
 * requête suspendue jusqu'au délai d'expiration du client : le rejet ne
 * remontait pas au gestionnaire d'erreurs. C'est ce que `express-async-handler`
 * enveloppait.
 *
 * Express 5 transmet le rejet à `next` de lui-même. Aucune enveloppe n'est
 * donc nécessaire ici, et c'est la principale raison d'exiger cette version.
 *
 * @module
 */

import express, { type Express, type Request, type Response } from 'express'

import type { Container } from './container.js'
import type { KernelConfig } from './config.js'
import {
  createErrorHandler,
  notFoundHandler,
  type ProblemDocument,
} from './http/errors.js'
import { validateInput, validateOutput } from './http/validate.js'
import type { Identity, RouteDefinition } from './http/route.js'
import { createRequestContext, type Logger } from './logger.js'
import { assertCapabilities, orderModules, type ModuleDefinition } from './module.js'

/** Ce que la construction de l'application demande. */
export interface AppOptions {
  readonly config: KernelConfig
  readonly logger: Logger
  /** Le conteneur racine, déjà pourvu des services du noyau. */
  readonly container: Container<never>
  /** Les modules activés. L'ordre d'écriture n'a pas d'importance. */
  readonly modules: readonly ModuleDefinition<never>[]
  /**
   * Capacités du dialecte courant.
   *
   * Comparées aux exigences des modules avant tout montage : un module
   * incompatible fait échouer le démarrage, il ne se dégrade pas en silence.
   */
  readonly capabilities?: Readonly<Record<string, boolean>>
  /** Nom du dialecte, pour le message d'incompatibilité. */
  readonly dialect?: string
  /**
   * Résout l'identité d'une requête.
   *
   * Fournie par le module d'authentification. Absente, toute route exigeant
   * une identité refuse — ce qui est le bon défaut : un serveur sans
   * authentification ne doit pas servir ses routes privées comme si elles
   * étaient publiques.
   */
  readonly authenticate?: (request: Request) => Promise<Identity | undefined>
}

/** L'application montée, et de quoi l'inspecter. */
export interface OdoroApp {
  readonly express: Express
  /** Toutes les routes montées, pour `odoro routes` et les tests. */
  readonly routes: readonly RouteDefinition[]
  /** Les modules, dans l'ordre où ils ont été chargés. */
  readonly modules: readonly ModuleDefinition<never>[]
}

/** Assemble l'application. */
export function createApp(options: AppOptions): OdoroApp {
  const {
    config,
    logger,
    container,
    modules,
    capabilities = {},
    dialect = 'inconnu',
    authenticate,
  } = options

  // Les deux refus de demarrage, avant tout montage : un ordre impossible et
  // un module que le moteur ne peut pas servir.
  const ordered = orderModules(modules)
  assertCapabilities(ordered, capabilities, dialect)

  for (const module of ordered) module.register?.(container as never)

  const app = express()

  // Derriere un repartiteur, sans cela, l'adresse vue est celle du
  // repartiteur : la limitation de debit indexee sur l'IP compterait alors
  // tout le trafic sur une seule adresse.
  app.set('trust proxy', true)
  app.disable('x-powered-by')

  app.use(createRequestContext(logger))
  app.use(express.json({ limit: config.BODY_LIMIT }))
  app.use(express.urlencoded({ extended: false, limit: config.BODY_LIMIT }))

  const routes: RouteDefinition[] = []
  const strictOutput = config.NODE_ENV !== 'production'

  for (const module of ordered) {
    for (const definition of module.routes ?? []) {
      routes.push(definition)
      mount(app, definition, { container, authenticate, strictOutput })
    }
  }

  app.use(notFoundHandler)
  app.use(
    createErrorHandler({
      exposeInternals: config.NODE_ENV === 'development',
      log: ({ correlationId, error, expected }) => {
        const child = logger.child({ correlationId })
        // Une erreur prevue est un evenement ordinaire — un mot de passe
        // errone, une page absente. La journaliser en `error` noierait les
        // vraies pannes sous le bruit du fonctionnement normal.
        if (expected) child.info({ err: error }, 'erreur applicative')
        else child.error({ err: error }, 'erreur imprevue')
      },
    }),
  )

  return { express: app, routes, modules: ordered }
}

/** Ce que le montage d'une route a besoin de savoir. */
interface MountContext {
  readonly container: Container<never>
  readonly authenticate: AppOptions['authenticate']
  readonly strictOutput: boolean
}

/** Monte une route sur Express. */
function mount(app: Express, definition: RouteDefinition, context: MountContext): void {
  const method = definition.method.toLowerCase() as
    'get' | 'post' | 'put' | 'patch' | 'delete'

  app[method](definition.path, async (request: Request, response: Response) => {
    // La portee de la requete : ses services y vivent, et y meurent.
    const scoped = context.container.scope()

    try {
      const user = await resolveIdentity(definition, request, context)
      const input =
        definition.input === undefined
          ? undefined
          : validateInput(definition.input, request)

      const result = await (
        definition.handler as (ctx: unknown) => Promise<unknown> | unknown
      )({
        input,
        user,
        c: scoped,
        // Le signal du client : un handler long peut l'observer et abandonner
        // quand personne n'attend plus la reponse.
        signal:
          (request as Request & { signal?: AbortSignal }).signal ??
          new AbortController().signal,
      })

      if (definition.output === undefined) {
        response.status(result === undefined ? 204 : 200)
        if (result !== undefined) response.json(result)
        else response.end()
        return
      }

      // Le schema de sortie est applique, pas seulement declare : c'est ce qui
      // empeche un champ non declare de traverser.
      response.json(validateOutput(definition.output, result, context.strictOutput))
    } finally {
      await scoped.dispose()
    }
  })
}

/** Applique la garde d'une route. */
async function resolveIdentity(
  definition: RouteDefinition,
  request: Request,
  context: MountContext,
): Promise<Identity | undefined> {
  if (definition.auth === 'public') return undefined

  const identity = await context.authenticate?.(request)

  if (definition.auth === 'required' && identity === undefined) {
    // Importe ici plutot qu'en tete : la garde est le seul chemin qui en a
    // besoin, et le noyau n'a pas a lier ses erreurs a son assemblage.
    const { UnauthorizedError } = await import('./http/errors.js')
    throw new UnauthorizedError()
  }

  return identity
}

/** Le type d'un document d'erreur, réexporté pour les tests d'intégration. */
export type { ProblemDocument }
