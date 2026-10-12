/**
 * Purpose: Will define auth Service for the services area of the Academy frontend.
 * Module: services
 * Status: Planned — functionality not implemented.
 */

// F00-005: Approved frontend demo implementation; not production authentication.
import { DEMO_USERS, getAuthorizedBranches } from '../mock/authFixtures.js'
import { readMockSession, saveMockSession, clearMockSession } from '../mock/mockAuth.js'

export const authService = {
  async getSession() { return readMockSession() },
  async getCurrentUser() { return readMockSession()?.user ?? null },
  async login({ userId }) {
    const user = DEMO_USERS.find((candidate) => candidate.id === userId && candidate.enabled)
    if (!user) throw new Error('Choose a valid fictional demo account.')
    const branches = getAuthorizedBranches(user)
    const session = { user, branchId: branches.length === 1 ? branches[0].id : null }
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
}
