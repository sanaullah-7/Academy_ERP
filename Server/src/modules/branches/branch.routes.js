import { Router } from 'express'
import { authenticate as defaultAuthenticate } from '../../middleware/authenticate.js'
import { csrfProtection } from '../../middleware/csrfProtection.js'
import { assertBranchCreationAllowed } from './branch.policy.js'

export function createBranchRouter({ authenticate = defaultAuthenticate } = {}) {
  const router = Router()

  router.post('/', authenticate, csrfProtection, (_request, _response, next) => {
    try {
      assertBranchCreationAllowed()
    } catch (error) {
      next(error)
    }
  })

  return router
}
