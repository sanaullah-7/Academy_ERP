import { AppError } from '../../shared/errors/AppError.js'
import { ERROR_CODES } from '../../constants/errorCodes.js'
import { ROLES } from '../../constants/roles.js'

export function assertCanManageUser({ actingUserRole, targetUser, targetRoles = [] }) {
  // If acting user is Super Admin, full access within academy
  if (actingUserRole === ROLES.SUPER_ADMIN) {
    return true
  }

  // If acting user is Admin:
  if (actingUserRole === ROLES.ADMIN) {
    // Cannot assign Super Admin or Admin roles
    const escalatedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    const attemptsEscalation = targetRoles.some((r) => escalatedRoles.includes(r))
    if (attemptsEscalation) {
      throw new AppError({
        statusCode: 403,
        code: ERROR_CODES.PRIVILEGE_ESCALATION_DENIED,
        message: 'Admins cannot assign Admin or Super Admin roles.',
      })
    }

    // Cannot modify or downgrade Super Admin or protected accounts
    if (targetUser) {
      const isSuperAdminTarget =
        targetUser.assignments?.some((a) => a.roles?.includes(ROLES.SUPER_ADMIN)) ||
        targetUser.role === ROLES.SUPER_ADMIN
      if (isSuperAdminTarget || targetUser.isProtected) {
        throw new AppError({
          statusCode: 403,
          code: ERROR_CODES.PRIVILEGE_ESCALATION_DENIED,
          message: 'Admins cannot modify Super Admin or protected accounts.',
        })
      }
    }

    return true
  }

  // Any other role cannot manage users
  throw new AppError({
    statusCode: 403,
    code: ERROR_CODES.PERMISSION_DENIED,
    message: 'User management permission denied.',
  })
}
