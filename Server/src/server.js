import { createApp } from './app.js'
import { databaseOptions, createDatabaseManager } from './config/database.js'
import { getConfig } from './config/env.js'
import { logger } from './config/logger.js'
import { pathToFileURL } from 'node:url'

export async function startServer({ config = getConfig(), database, appLogger = logger } = {}) {
  const databaseManager = database || createDatabaseManager({ options: databaseOptions(config) })
  const app = createApp({ config, database: databaseManager, logger: appLogger })
  const server = app.listen(config.port, () => {
    appLogger.info('HTTP server started', { port: server.address().port, environment: config.nodeEnv })
  })
  const databaseConnection = databaseManager.connect(config.mongo.uri)
    .then((status) => {
      appLogger.info('Database connected successfully', {
        state: status?.state || databaseManager.getStatus().state,
      })
      return true
    })
    .catch((error) => {
      appLogger.error('Database connection unavailable', { error: error.message })
      return false
    })

  let shuttingDown = false
  let shutdownPromise
  async function shutdown(signal) {
    if (shuttingDown) return shutdownPromise
    shuttingDown = true
    appLogger.info('Graceful shutdown started', { signal })
    shutdownPromise = new Promise((resolve) => {
      server.close(async (closeError) => {
        try {
          await databaseConnection
          await databaseManager.disconnect()
        } catch (error) {
          appLogger.error('Database disconnect failed', { error: error.message })
          process.exitCode = 1
        }
        if (closeError) process.exitCode = 1
        process.off('SIGTERM', onSigterm)
        process.off('SIGINT', onSigint)
        resolve()
      })
    })
    return shutdownPromise
  }

  const onSigterm = () => void shutdown('SIGTERM')
  const onSigint = () => void shutdown('SIGINT')
  process.once('SIGTERM', onSigterm)
  process.once('SIGINT', onSigint)
  return { app, server, database: databaseManager, databaseConnection, shutdown }
}

function isEntryPoint() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
}

if (isEntryPoint()) {
  startServer()
    .then(async (result) => {
      await result.databaseConnection
    })
    .catch((error) => {
      logger.error('Backend startup failed', { error: error.message })
      process.exitCode = 1
    })
}
