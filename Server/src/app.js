import express from 'express'
import { securityHeaders } from './config/security.js'
import { createCorsMiddleware } from './config/cors.js'
import { cookieParserMiddleware } from './config/cookies.js'
import { requestContext } from './middleware/requestLogger.js'
import { notFound } from './middleware/notFound.js'
import { createErrorHandler } from './middleware/errorHandler.js'
import { createApiRouter } from './routes/index.js'

export function createApp({ config, database, logger, testRoutes, apiRouter } = {}) {
  if (!config || !database || !logger) throw new Error('App dependencies are required.')

  const app = express()
  app.disable('x-powered-by')
  if (config.trustProxy !== false) app.set('trust proxy', config.trustProxy)

  app.use(requestContext)
  app.use(securityHeaders)
  app.use(createCorsMiddleware({ isProduction: config.isProduction }))
  app.use(cookieParserMiddleware)
  app.use(express.json({ limit: config.jsonBodyLimit }))
  app.use('/api/v1', apiRouter || createApiRouter({ database }))
  if (testRoutes && config.nodeEnv === 'test') app.use('/__test__', testRoutes)
  app.use(notFound)
  app.use(createErrorHandler({ logger, isProduction: config.isProduction }))

  return app
}
