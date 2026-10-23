import { AppError } from '../shared/errors/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'
import { compareTokens } from '../shared/utils/crypto.js'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function csrfProtection(request, _response, next) {
  if (SAFE_METHODS.has(request.method)) {
    return next()
  }

  // If there's no active session (e.g. unauthenticated route), CSRF does not apply
  if (!request.session) {
    return next()
  }

  const expectedToken = request.session.csrfToken
  if (!expectedToken) {
    return next(
      new AppError({
        statusCode: 403,
        code: ERROR_CODES.CSRF_DETECTED,
        message: 'CSRF session token missing.',
      })
    )
  }

  const providedToken =
    request.headers['x-csrf-token'] ||
    request.body?._csrf

  if (!providedToken || typeof providedToken !== 'string') {
    return next(
      new AppError({
        statusCode: 403,
        code: ERROR_CODES.CSRF_DETECTED,
        message: 'Invalid or missing CSRF token.',
      })
    )
  }

  if (!compareTokens(expectedToken, providedToken)) {
    return next(
      new AppError({
        statusCode: 403,
        code: ERROR_CODES.CSRF_DETECTED,
        message: 'Invalid or missing CSRF token.',
      })
    )
  }

  next()
}
