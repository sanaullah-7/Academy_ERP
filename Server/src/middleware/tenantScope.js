import { AppError } from '../shared/errors/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

/**
 * Middleware that ensures an authenticated organizationId is present and binds
 * scoped filter builders to the request object for use by controllers and repositories.
 */
export function tenantScope(request, _response, next) {
  const organizationId = request.auth?.organizationId || request.organizationId

  if (!organizationId) {
    return next(
      new AppError({
        statusCode: 401,
        code: ERROR_CODES.UNAUTHENTICATED,
        message: 'Organization context could not be resolved from session.',
      })
    )
  }

  request.organizationId = organizationId

  /**
   * Helper that returns a query filter guaranteed to be bounded to the current organization.
   */
  request.scopedQuery = (baseFilter = {}) => {
    return {
      ...baseFilter,
      organizationId,
    }
  }

  /**
   * Helper that returns a query filter guaranteed to be bounded to both organization and active branch.
   */
  request.branchScopedQuery = (baseFilter = {}) => {
    const branchId = request.auth?.activeBranch?.id || request.activeBranchId
    if (!branchId) {
      throw new AppError({
        statusCode: 403,
        code: ERROR_CODES.BRANCH_ACCESS_DENIED,
        message: 'Active branch context is required for branch-scoped queries.',
      })
    }
    return {
      ...baseFilter,
      organizationId,
      branchId,
    }
  }

  next()
}
