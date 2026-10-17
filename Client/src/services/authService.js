import { canAccess, PERMISSIONS } from '../constants/permissions.js'
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
  async login({ userId }) {
    const user = findDemoUser(userId)
    if (!user?.enabled) throw new Error('Choose a valid fictional demo account.')
    const branches = getAuthorizedBranches(user)
    const session = { user, branchId: branches.length === 1 ? branches[0].id : null }
    saveMockSession(session)
    return session
  },
  async switchAccount(userId) {
    const current = readMockSession()
    if (!current?.branchId || !canAccess(PERMISSIONS.USERS_MANAGE, current.user, current.branchId)) throw new Error('Only a Super Admin can switch staff accounts.')
    const user = findDemoUser(userId)
    const branches = getAuthorizedBranches(user)
    if (!user?.enabled || !branches.length) throw new Error('Choose an active staff account with an authorized branch.')
    const branchId = branches.some(branch => branch.id === current.branchId) ? current.branchId : branches.length === 1 ? branches[0].id : null
    const session = { user, branchId }
    saveMockSession(session)
    return session
  },
  async selectBranch(userId, branchId) {
    const current = readMockSession()
    if (!current || current.user.id !== userId) throw new Error('Your demo session changed. Please sign in again.')
    if (!getAuthorizedBranches(current.user).some((branch) => branch.id === branchId)) throw new Error('Choose one of your authorized demo branches.')
    const session = { user: current.user, branchId }
    saveMockSession(session)
    return session
  },
  async logout() { clearMockSession() },
  async listLoginUsers() { return getDemoUsers().filter(user => user.enabled) },
}
