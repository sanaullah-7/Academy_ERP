import { loginEmail, normalizeEmail, verifyPassword, makePasswordRecord, storePassword } from '../mock/mockCredentials.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
import { getBranchRoles, ROLES } from '../constants/roles.js'
/**
 * Purpose: Will define auth Service for the services area of the Academy frontend.
 * Module: services
 * Status: Planned — functionality not implemented.
 */

// F00-005: Approved frontend demo implementation; not production authentication.
import { findDemoUser, getAuthorizedBranches, getDemoUsers } from '../mock/authFixtures.js'
import { readMockSession, saveMockSession, clearMockSession } from '../mock/mockAuth.js'

export const authService = {
  async getSession() { return readMockSession() },
  async getCurrentUser() { return readMockSession()?.user ?? null },
  async login({ userId, email, password }) {
    if (email !== undefined) clearMockSession()
    // userId is retained solely for existing programmatic mock fixtures.
    const user = email !== undefined ? getDemoUsers().find(candidate => loginEmail(candidate) === normalizeEmail(email)) : findDemoUser(userId)
    if (email !== undefined && (!user?.enabled || user.accessRevoked || !await verifyPassword(user, password))) throw new Error('Email or password is incorrect.')
    if (!user?.enabled) throw new Error('Choose a valid fictional active account.')
    const branches = getAuthorizedBranches(user)
    if (email !== undefined && !branches.length) throw new Error('No active branch is assigned to this account.')
    const session = { user, branchId: branches.length === 1 ? branches[0].id : null }
    saveMockSession(session)
    return session
  },
  async switchAccount(userId) {
    const current = readMockSession()
    if (!current?.branchId || !canAccess(PERMISSIONS.USERS_MANAGE, current.user, current.branchId)) throw new Error('Only a Super Admin can switch staff accounts.')
    const user = findDemoUser(userId)
    const currentRoles = getBranchRoles(current.user, current.branchId)
    if (currentRoles.includes(ROLES.ADMIN) && !currentRoles.includes(ROLES.SUPER_ADMIN) && user?.assignments?.some(a => a.roles?.includes(ROLES.SUPER_ADMIN))) {
      throw new Error('Admin cannot switch to or escalate to a Super Admin account.')
    }
    const branches = getAuthorizedBranches(user)
    if (!user?.enabled || !branches.length) throw new Error('Choose an active staff account with an authorized branch.')
    const branchId = branches.some(branch => branch.id === current.branchId) ? current.branchId : branches.length === 1 ? branches[0].id : null
    const session = { user, branchId }
    saveMockSession(session)
    return session
  },
  async selectBranch(userId, branchId) {
    const current = readMockSession()
    if (!current || current.user.id !== userId) throw new Error('Your session changed. Please sign in again.')
    if (!getAuthorizedBranches(current.user).some((branch) => branch.id === branchId)) throw new Error('Choose one of your authorized branches.')
    const session = { user: current.user, branchId }
    saveMockSession(session)
    return session
  },
  async changePassword({ currentPassword, newPassword, confirmPassword }) {
    const session = readMockSession()
    if (!session?.user) throw new Error('Sign in again to change your password.')
    if (newPassword !== confirmPassword) throw new Error('New passwords do not match.')
    if (!await verifyPassword(session.user, currentPassword)) throw new Error('Current password is incorrect.')
    if (currentPassword === newPassword) throw new Error('Choose a different new password.')
    const record = await makePasswordRecord(newPassword)
    const current = readMockSession()
    if (current?.user.id !== session.user.id) throw new Error('Session changed. Sign in again.')
    storePassword(session.user.id, record)
  },
  async logout() { clearMockSession() },
  async listLoginUsers() { return getDemoUsers().filter(user => user.enabled && !user.accessRevoked) },
}
