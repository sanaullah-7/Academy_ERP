import { AppError } from '../shared/errors/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'
import { USER_STATUSES } from '../constants/statuses.js'
import { SESSION_COOKIE_NAME } from '../config/cookies.js'
import { hashSessionToken } from '../shared/utils/crypto.js'
import { authRepository as defaultAuthRepo } from '../modules/auth/auth.repository.js'

export function createAuthenticateMiddleware({ repository = defaultAuthRepo } = {}) {
  return async (request, _response, next) => {
    try {
      const token = request.cookies?.[SESSION_COOKIE_NAME]

      if (!token) {
        throw new AppError({
          statusCode: 401,
          code: ERROR_CODES.UNAUTHENTICATED,
          message: 'Authentication required.',
        })
      }

      const tokenHash = hashSessionToken(token)
      const session = await repository.findSessionByTokenHash(tokenHash)

      if (!session || session.revokedAt) {
        throw new AppError({
          statusCode: 401,
          code: ERROR_CODES.SESSION_REVOKED,
          message: 'Session has been revoked or is invalid.',
        })
      }

      if (new Date(session.expiresAt) <= new Date()) {
        throw new AppError({
          statusCode: 401,
          code: ERROR_CODES.SESSION_EXPIRED,
          message: 'Session has expired.',
        })
      }

      const user = await repository.findUserById(session.userId)
      if (!user) {
        throw new AppError({
          statusCode: 401,
          code: ERROR_CODES.UNAUTHENTICATED,
          message: 'User account not found.',
        })
      }

      if (user.status !== USER_STATUSES.ACTIVE) {
        throw new AppError({
          statusCode: 401,
          code: ERROR_CODES.ACCOUNT_DISABLED,
          message: 'Account is disabled. Please contact an administrator.',
        })
      }

      request.session = session
      request.user = user
      request.organizationId = user.organizationId

      next()
    } catch (error) {
      next(error)
    }
  }
}

export const authenticate = createAuthenticateMiddleware()
