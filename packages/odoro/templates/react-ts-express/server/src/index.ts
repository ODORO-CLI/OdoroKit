/**
 * Serveur applicatif.
 *
 * En developpement, il n'expose que l'API : le client est servi par le moteur
 * Odoro, qui lui transmet les appels commencant par `/api`. En production, il
 * sert en plus le resultat de la compilation du client, ce qui evite d'avoir a
 * deployer deux choses.
 *
 * @module
 */

import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import express, { type NextFunction, type Request, type Response } from 'express'

import { EnvError, readEnv } from './env.js'

/** Racine du projet, deduite de l'emplacement du module. */
const HERE = dirname(fileURLToPath(import.meta.url))

/** Construit l'application, sans la demarrer : c'est ce qui la rend testable. */
export function createApp(env: ReturnType<typeof readEnv>): express.Express {
  const app = express()

  app.disable('x-powered-by')
  app.use(express.json({ limit: '1mb' }))

  if (env.allowedOrigins.length > 0) {
    app.use((request, response, next) => {
      const origin = request.headers.origin
      if (origin !== undefined && env.allowedOrigins.includes(origin)) {
        response.setHeader('Access-Control-Allow-Origin', origin)
        response.setHeader('Vary', 'Origin')
      }
      next()
    })
  }

  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ok',
      environment: env.nodeEnv,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    })
  })

  if (env.isProduction) {
    // `dist/server/index.js` -> `dist/client`
    const client = resolve(HERE, '..', 'client')
    if (existsSync(client)) {
      app.use(express.static(client, { index: false, maxAge: '1y', immutable: true }))
      // Repli d'application monopage : toute route non-API rend le document,
      // et c'est le routeur client qui decide de la suite.
      app.get(/^(?!\/api\/).*/, (_request, response) => {
        response.sendFile(join(client, 'index.html'))
      })
    }
  }

  app.use('/api', (_request, response) => {
    response.status(404).json({ error: 'Route introuvable.' })
  })

  app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
    console.error(error)
    response.status(500).json({
      error: env.isProduction ? 'Erreur interne.' : error.message,
    })
  })

  return app
}

/** Demarre le serveur. */
function main(): void {
  let env
  try {
    env = readEnv()
  } catch (cause) {
    if (cause instanceof EnvError) {
      console.error(cause.message)
      process.exit(1)
    }
    throw cause
  }

  createApp(env).listen(env.port, () => {
    console.log(`[serveur] a l'ecoute sur http://localhost:${env.port} (${env.nodeEnv})`)
  })
}

main()
