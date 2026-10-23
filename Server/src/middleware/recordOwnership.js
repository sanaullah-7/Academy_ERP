import { AppError } from '../shared/errors/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'
import { ROLES } from '../constants/roles.js'

export function requireTeacherSelfOnly({
  getTargetTeacherId = (req) =>
    req.params?.teacherId ||
    req.params?.userId ||
    req.query?.teacherId ||
    req.body?.teacherId,
} = {}) {
  return (request, _response, next) => {
    if (request.userRole === ROLES.TEACHER) {
      const currentUserId = (request.user?._id || request.user?.id)?.toString()
      const targetTeacherId = getTargetTeacherId(request)?.toString()

      if (!targetTeacherId || targetTeacherId !== currentUserId) {
        return next(
          new AppError({
            statusCode: 403,
            code: ERROR_CODES.RECORD_ACCESS_DENIED,
            message: 'Teachers can only access their own records.',
          })
        )
      }
    }
    next()
  }
}

export function verifyRecordScope({
  record,
  expectedOrganizationId,
  expectedBranchId,
} = {}) {
  if (!record) {
    throw new AppError({
      statusCode: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: 'Resource not found.',
    })
  }

  if (
    expectedOrganizationId &&
    record.organizationId &&
    record.organizationId.toString() !== expectedOrganizationId.toString()
  ) {
    throw new AppError({
      statusCode: 403,
      code: ERROR_CODES.RECORD_ACCESS_DENIED,
      message: 'Record belongs to another organization.',
    })
  }

  if (
    expectedBranchId &&
    record.branchId &&
    record.branchId.toString() !== expectedBranchId.toString()
  ) {
    throw new AppError({
      statusCode: 403,
      code: ERROR_CODES.BRANCH_ACCESS_DENIED,
      message: 'Record belongs to another branch.',
    })
  }

  return true
}
