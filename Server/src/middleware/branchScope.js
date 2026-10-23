import { AppError } from '../shared/errors/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'
import { isKnownRole } from '../constants/roles.js'
import { getRolePermissions } from '../constants/permissions.js'

export function createBranchScopeMiddleware({ required = true } = {}) {
  return (request, _response, next) => {
    const user = request.user
    if (!user) {
      return next(
        new AppError({
          statusCode: 401,
          code: ERROR_CODES.UNAUTHENTICATED,
          message: 'Authentication required.',
        })
      )
    }

    const branchId =
      request.params?.branchId ||
      request.headers['x-branch-id'] ||
      request.query?.branchId ||
      request.session?.activeBranchId

    if (!branchId) {
      if (!required) return next()
      return next(
        new AppError({
          statusCode: 403,
          code: ERROR_CODES.BRANCH_ACCESS_DENIED,
          message: 'Branch context required.',
        })
      )
    }

    const assignment = user.assignments?.find(
      (a) => a.branchId === branchId && a.status === 'active'
    )

    if (!assignment) {
      return next(
        new AppError({
          statusCode: 403,
          code: ERROR_CODES.BRANCH_ACCESS_DENIED,
          message: 'You do not have access to this branch.',
        })
      )
    }

    // Fail closed if multiple roles exist on this branch
    if (!Array.isArray(assignment.roles) || assignment.roles.length !== 1) {
      return next(
        new AppError({
          statusCode: 403,
          code: ERROR_CODES.BRANCH_ACCESS_DENIED,
          message: 'Ambiguous or unsupported multiple roles for this branch.',
        })
      )
    }

    const role = assignment.roles[0]
    if (!isKnownRole(role)) {
      return next(
        new AppError({
          statusCode: 403,
          code: ERROR_CODES.BRANCH_ACCESS_DENIED,
          message: 'Unknown role assigned for this branch.',
        })
      )
    }

    request.activeBranchId = branchId
    request.userRole = role
    request.rolePermissions = getRolePermissions(role)

    next()
  }
}

export const branchScope = createBranchScopeMiddleware({ required: true })
