import { Router } from 'express'
import { createAuthRouter } from '../modules/auth/auth.routes.js'
import { createBranchRouter } from '../modules/branches/branch.routes.js'

export function createApiRouter({
  database,
  startedAt = Date.now(),
  authRouter = createAuthRouter(),
  branchRouter = createBranchRouter(),
} = {}) {
  const router = Router()

  router.get('/health', (_request, response) => {
    response.status(200).json({
      status: 'ok',
      data: {
        service: 'tsa-academy-api',
        uptimeSeconds: Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
      },
    })
  })

  router.get('/ready', (_request, response) => {
    const databaseStatus = database.getStatus()
    const ready = databaseStatus.ready === true
    response.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'unavailable',
      data: { database: databaseStatus.state },
    })
  })

  router.use('/auth', authRouter)
  router.use('/branches', branchRouter)

  return router
}
