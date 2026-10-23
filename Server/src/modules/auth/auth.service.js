import { authRepository as defaultAuthRepo } from './auth.repository.js'
import {
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
  generateCsrfToken,
} from '../../shared/utils/crypto.js'
import { AppError } from '../../shared/errors/AppError.js'
import { ERROR_CODES } from '../../constants/errorCodes.js'
import { USER_STATUSES } from '../../constants/statuses.js'
import { isKnownRole } from '../../constants/roles.js'
import { getRolePermissions } from '../../constants/permissions.js'
import { toAuthorizedBranches } from './auth.mapper.js'

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export class AuthService {
  constructor({ repository = defaultAuthRepo } = {}) {
    this.repo = repository
  }

  resolveBranchRole(user, branchId) {
    if (!user || !Array.isArray(user.assignments) || !branchId) return null
    const assignment = user.assignments.find(
      (a) => a.branchId === branchId && a.status === 'active'
    )
    if (!assignment) return null

    // Fail closed if multiple roles or unknown role
    if (!Array.isArray(assignment.roles) || assignment.roles.length !== 1) {
      return null
    }

    const role = assignment.roles[0]
    return isKnownRole(role) ? role : null
  }

  async login({ email, password, ipAddress, userAgent }) {
    const user = await this.repo.findUserByEmail(email, { includePassword: true })

    if (!user || !user.passwordHash) {
      throw new AppError({
        statusCode: 401,
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Invalid email or password.',
      })
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      throw new AppError({
        statusCode: 401,
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Invalid email or password.',
      })
    }

    if (user.status !== USER_STATUSES.ACTIVE) {
      throw new AppError({
        statusCode: 401,
        code: ERROR_CODES.ACCOUNT_DISABLED,
        message: 'Account is disabled. Please contact an administrator.',
      })
    }

    const branches = toAuthorizedBranches(user)
    let activeBranchId = null
    let activeRole = null

    // Select initial active branch if single-role assignment exists
    for (const b of branches) {
      const resolved = this.resolveBranchRole(user, b.id)
      if (resolved) {
        activeBranchId = b.id
        activeRole = resolved
        break
      }
    }

    const sessionToken = generateSessionToken()
    const tokenHash = hashSessionToken(sessionToken)
    const csrfToken = generateCsrfToken()
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

    const session = await this.repo.createSession({
      tokenHash,
      userId: user._id || user.id,
      organizationId: user.organizationId,
      activeBranchId,
      csrfToken,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      expiresAt,
    })

    await this.repo.updateUserLastLogin(user._id || user.id)

    const permissions = activeRole ? getRolePermissions(activeRole) : []

    return {
      sessionToken,
      csrfToken,
      session,
      user,
      branches,
      activeBranch: activeBranchId ? { id: activeBranchId, role: activeRole } : null,
      permissions,
      expiresAt,
    }
  }

  async getSessionState(session, user) {
    if (!session || !user) {
      throw new AppError({
        statusCode: 401,
        code: ERROR_CODES.UNAUTHENTICATED,
        message: 'Authentication required.',
      })
    }

    const branches = toAuthorizedBranches(user)
    const activeBranchId = session.activeBranchId
    const activeRole = activeBranchId ? this.resolveBranchRole(user, activeBranchId) : null
    const permissions = activeRole ? getRolePermissions(activeRole) : []

    return {
      user,
      branches,
      activeBranch: activeBranchId ? { id: activeBranchId, role: activeRole } : null,
      permissions,
      csrfToken: session.csrfToken,
    }
  }

  async switchActiveBranch(session, user, branchId) {
    if (!session || !user) {
      throw new AppError({
        statusCode: 401,
        code: ERROR_CODES.UNAUTHENTICATED,
        message: 'Authentication required.',
      })
    }

    const assignment = user.assignments?.find(
      (a) => a.branchId === branchId && a.status === 'active'
    )

    if (!assignment) {
      throw new AppError({
        statusCode: 403,
        code: ERROR_CODES.BRANCH_ACCESS_DENIED,
        message: 'You do not have access to this branch.',
      })
    }

    // Fail closed if multiple roles exist on this branch
    if (!Array.isArray(assignment.roles) || assignment.roles.length !== 1) {
      throw new AppError({
        statusCode: 403,
        code: ERROR_CODES.BRANCH_ACCESS_DENIED,
        message: 'Ambiguous or unsupported multiple roles for this branch.',
      })
    }

    const role = assignment.roles[0]
    if (!isKnownRole(role)) {
      throw new AppError({
        statusCode: 403,
        code: ERROR_CODES.BRANCH_ACCESS_DENIED,
        message: 'Unknown role assigned for this branch.',
      })
    }

    await this.repo.updateSessionActiveBranch(session._id || session.id, branchId)
    session.activeBranchId = branchId

    const permissions = getRolePermissions(role)

    return {
      activeBranch: { id: branchId, role },
      permissions,
    }
  }

  async logout(session) {
    if (session) {
      await this.repo.revokeSession(session._id || session.id)
    }
    return { status: 'logged_out' }
  }
}

export const authService = new AuthService()
