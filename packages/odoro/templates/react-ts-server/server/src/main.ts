/**
 * Le serveur applicatif : un assemblage de modules, rien de plus.
 *
 * ## Ce fichier ne contient aucune logique
 *
 * C'est voulu. Tout ce qu'une application fait vit dans un module, et ce
 * fichier ne fait que dire lesquels sont actifs. Activer ou desactiver une
 * fonctionnalite tient alors en une ligne, et rien d'autre ne bouge.
 *
 * Un serveur ou les routes s'ajoutent directement ici finit par melanger
 * l'assemblage et le metier, et « desactiver l'authentification » devient un
 * travail d'archeologie plutot qu'une ligne commentee.
 *
 * ## En developpement et en production
 *
 * En developpement, ce serveur n'expose que l'API : le client est servi par
 * Odoro, qui lui transmet les appels commencant par `/api`. En production, il
 * sert en plus le resultat de la compilation du client — une seule chose a
 * deployer.
 *
 * @module
 */

import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  ConfigError,
  createApp,
  createContainer,
  createLogger,
  loadConfig,
} from '@odoro/server'
import express from 'express'

import { createHealthModule } from './modules/health/index.js'

/** Racine du module compile, pour retrouver le client a cote. */
const HERE = dirname(fileURLToPath(import.meta.url))

/** Assemble l'application. Exporte pour que les tests la montent sans l'ecouter. */
export function buildServer() {
  const config = loadConfig()

  const logger = createLogger({
    level: config.LOG_LEVEL,
    pretty: config.NODE_ENV === 'development',
  })

  // La configuration et le journal sont dans le conteneur : un module les y
  // trouve sans qu'on les lui passe de main en main a travers trois couches.
  const container = createContainer()
    .register('config', () => config)
    .register('logger', () => logger)

  const app = createApp({
    config,
    logger,
    container: container as never,
    modules: [
      createHealthModule(config),
      // Les modules du socle s'ajoutent ici, dans n'importe quel ordre :
      // le noyau les trie selon leurs dependances.
      //
      //   authModule,
      //   accountModule,
      //   settingsModule,
    ],
  })

  if (config.NODE_ENV === 'production') {
    // `dist/server/main.js` -> `dist/client`
    const client = resolve(HERE, '..', 'client')
    if (existsSync(client)) {
      app.express.use(
        express.static(client, { index: false, maxAge: '1y', immutable: true }),
      )
      // Repli d'application monopage : toute route hors API rend le document,
      // et c'est le routeur client qui decide de la suite.
      app.express.get(/^(?!\/api\/).*/, (_request, response) => {
        response.sendFile(join(client, 'index.html'))
      })
    }
  }

  return { app, config, logger }
}

/** Demarre le serveur. */
function main(): void {
  let server
  try {
    server = buildServer()
  } catch (cause) {
    if (cause instanceof ConfigError) {
      // La configuration est incomplete : le message liste tout ce qui manque,
      // d'un coup. Rien ne sert de demarrer a moitie.
      console.error(cause.message)
      process.exit(1)
    }
    throw cause
  }

  const { app, config, logger } = server

  const listener = app.express.listen(config.PORT, () => {
    logger.info({ port: config.PORT, environment: config.NODE_ENV }, 'serveur a l ecoute')
  })

  // Arret propre : on cesse d'accepter, on laisse finir ce qui est en cours, et
  // on abandonne au-dela du delai plutot que de rester suspendu.
  const stop = (signal: string): void => {
    logger.info({ signal }, 'arret demande')
    const deadline = setTimeout(() => {
      logger.warn('delai depasse, arret force')
      process.exit(1)
    }, config.SHUTDOWN_TIMEOUT)
    deadline.unref()

    listener.close(() => {
      clearTimeout(deadline)
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => stop('SIGTERM'))
  process.on('SIGINT', () => stop('SIGINT'))
}

main()
