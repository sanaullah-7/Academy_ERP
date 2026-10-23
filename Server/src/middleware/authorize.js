import { AppError } from '../shared/errors/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'
import { hasPermission } from '../constants/permissions.js'

export function requirePermission(permission) {
  return (request, _response, next) => {
    const role = request.userRole

    if (!role) {
      return next(
        new AppError({
          statusCode: 403,
          code: ERROR_CODES.PERMISSION_DENIED,
          message: 'Effective branch role required for this action.',
        })
      )
    }

    if (!hasPermission(role, permission)) {
      return next(
        new AppError({
          statusCode: 403,
          code: ERROR_CODES.PERMISSION_DENIED,
          message: 'You do not have permission to perform this action.',
        })
      )
    }

    next()
  }
}

export function requireRole(...allowedRoles) {
  return (request, _response, next) => {
    const role = request.userRole

    if (!role || !allowedRoles.includes(role)) {
      return next(
        new AppError({
          statusCode: 403,
          code: ERROR_CODES.PERMISSION_DENIED,
          message: 'Role not authorized for this action.',
        })
      )
    }

    next()
  }
}
