import { Router } from 'express'
import { authController as defaultController } from './auth.controller.js'
import { authenticate as defaultAuthenticate } from '../../middleware/authenticate.js'
import { csrfProtection } from '../../middleware/csrfProtection.js'
import { createRateLimiter } from '../../middleware/rateLimiter.js'

export function createAuthRouter({
  controller = defaultController,
  authenticate = defaultAuthenticate,
  rateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20 }),
} = {}) {
  const router = Router()

  router.post('/login', rateLimiter, controller.login)
  router.get('/session', authenticate, controller.getSession)
  router.delete('/session', authenticate, csrfProtection, controller.logout)
  router.patch('/active-branch', authenticate, csrfProtection, controller.switchActiveBranch)
  router.get('/branches', authenticate, controller.listAuthorizedBranches)

  return router
}
