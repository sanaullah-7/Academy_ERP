import { User as UserModel } from '../users/user.model.js'
import { Session as SessionModel } from './session.model.js'
import { Branch as BranchModel } from '../branches/branch.model.js'
import { BranchRoleAssignment as BranchRoleAssignmentModel } from '../users/branchRoleAssignment.model.js'

export class AuthRepository {
  constructor({
    User = UserModel,
    Session = SessionModel,
    Branch = BranchModel,
    BranchRoleAssignment = BranchRoleAssignmentModel,
  } = {}) {
    this.User = User
    this.Session = Session
    this.Branch = Branch
    this.BranchRoleAssignment = BranchRoleAssignment
  }

  async getUserBranchAssignments(userId, fallbackAssignments = []) {
    if (!userId) return []

    // When BranchRoleAssignment model is configured, it is the sole authoritative
    // source of truth. Revoked or deleted assignments can NEVER be resurrected by
    // stale embedded User.assignments data.
    if (this.BranchRoleAssignment && typeof this.BranchRoleAssignment.find === 'function') {
      try {
        const activeAssignments = await this.BranchRoleAssignment.find({
          userId,
          status: 'active',
        }).lean().exec()

        return (activeAssignments || []).map((a) => ({
          branchId: a.branchId,
          roles: Array.isArray(a.roles) ? [...a.roles] : [],
          status: a.status,
        }))
      } catch {
        return []
      }
    }

    // Isolated unit test fallback only (when BranchRoleAssignment model is not configured)
    return Array.isArray(fallbackAssignments)
      ? fallbackAssignments.filter((a) => a.status === 'active')
      : []
  }

  async findUserByEmail(email, { includePassword = false } = {}) {
    if (!email) return null
    const normalized = email.trim().toLowerCase()
    const query = this.User.findOne({ email: normalized })
    if (includePassword) {
      query.select('+passwordHash')
    }
    const user = await query.exec()
    if (!user) return null

    const authoritativeAssignments = await this.getUserBranchAssignments(
      user._id,
      user.assignments
    )
    user.assignments = authoritativeAssignments
    return user
  }

  async findUserById(id, { includePassword = false } = {}) {
    if (!id) return null
    const query = this.User.findById(id)
    if (includePassword) {
      query.select('+passwordHash')
    }
    const user = await query.exec()
    if (!user) return null

    const authoritativeAssignments = await this.getUserBranchAssignments(
      user._id,
      user.assignments
    )
    user.assignments = authoritativeAssignments
    return user
  }

  async updateUserLastLogin(id) {
    if (!id) return null
    return this.User.findByIdAndUpdate(id, { lastLoginAt: new Date() }, { returnDocument: 'after' }).exec()
  }

  async createSession(data) {
    return this.Session.create(data)
  }

  async findSessionByTokenHash(tokenHash) {
    if (!tokenHash) return null
    return this.Session.findOne({ tokenHash }).exec()
  }

  async updateSessionActiveBranch(sessionId, branchId) {
    if (!sessionId) return null
    return this.Session.findByIdAndUpdate(
      sessionId,
      { activeBranchId: branchId },
      { returnDocument: 'after' }
    ).exec()
  }

  async revokeSession(sessionId) {
    if (!sessionId) return null
    return this.Session.findByIdAndUpdate(
      sessionId,
      { revokedAt: new Date() },
      { returnDocument: 'after' }
    ).exec()
  }

  async revokeUserSessions(userId) {
    if (!userId) return null
    return this.Session.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    ).exec()
  }

  async findBranchById(branchId) {
    if (!branchId) return null
    return this.Branch.findById(branchId).exec()
  }

  async findBranchesByIds(branchIds) {
    if (!Array.isArray(branchIds) || branchIds.length === 0) return []
    return this.Branch.find({ _id: { $in: branchIds } }).exec()
  }
}

export const authRepository = new AuthRepository()
