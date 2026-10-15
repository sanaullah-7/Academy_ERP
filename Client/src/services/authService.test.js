import { describe, expect, it, vi } from 'vitest'
import { authService } from './authService.js'
import { MOCK_SESSION_KEY } from '../constants/storageKeys.js'
import { DEMO_USERS, getAuthorizedBranches } from '../mock/authFixtures.js'
import { canAccess } from '../constants/permissions.js'
import * as fixtures from '../mock/authFixtures.js'

describe('fictional sessions and branch validation', () => {
  it.each([{ remaining: [] }, { remaining: [fixtures.DEMO_BRANCHES[1]] }])('revalidates a saved branch against changed authorized assignments: $remaining', async ({ remaining }) => {
    await authService.login({ userId: 'demo-multi' })
    await authService.selectBranch('demo-multi', 'demo-north')
    // Simulate the canonical authorized assignment list changing after persistence.
    vi.spyOn(fixtures, 'getAuthorizedBranches').mockReturnValue(remaining)
    const restored = await authService.getSession()
    expect(restored.branchId).toBe(remaining.length === 1 ? 'demo-central' : null)
    await expect(authService.selectBranch('demo-multi', 'demo-north')).rejects.toThrow('authorized')
  })

  it.each(['demo-owner', 'demo-reception', 'demo-teacher'])('auto-selects the only branch for %s and restores the session', async (userId) => {
    const session = await authService.login({ userId })
    expect(session.branchId).toBe(getAuthorizedBranches(session.user)[0].id)
    expect(await authService.getSession()).toEqual(session)
    expect(JSON.parse(localStorage.getItem(MOCK_SESSION_KEY))).toEqual({ version: 1, userId, branchId: session.branchId })
  })

  it.each(['demo-admin', 'demo-multi'])('requires an explicit branch for %s and persists a valid choice', async (userId) => {
    expect((await authService.login({ userId })).branchId).toBeNull()
    expect((await authService.selectBranch(userId, 'demo-central')).branchId).toBe('demo-central')
    expect((await authService.getSession()).branchId).toBe('demo-central')
  })

  it('rejects unassigned branches and stale user changes without changing the saved session', async () => {
    await authService.login({ userId: 'demo-owner' })
    await expect(authService.selectBranch('demo-owner', 'demo-north')).rejects.toThrow('authorized')
    await expect(authService.selectBranch('demo-admin', 'demo-central')).rejects.toThrow('session changed')
    expect((await authService.getSession()).user.id).toBe('demo-owner')
  })

  it.each(['not-a-user', 'demo-disabled'])('rejects invalid/disabled accounts: %s', async (userId) => {
    await expect(authService.login({ userId })).rejects.toThrow('valid fictional')
    expect(await authService.getSession()).toBeNull()
  })

  it.each(['{broken', JSON.stringify({ version: 2, userId: 'demo-owner' }), JSON.stringify({ version: 1, userId: 'missing' }), JSON.stringify({ version: 1, userId: 'demo-disabled' })])('clears an invalid saved session', async (raw) => {
    localStorage.setItem(MOCK_SESSION_KEY, raw)
    expect(await authService.getSession()).toBeNull()
    expect(localStorage.getItem(MOCK_SESSION_KEY)).toBeNull()
  })

  it('ignores injected storage roles and resets an invalid multi-branch choice', async () => {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ version: 1, userId: 'demo-multi', branchId: 'foreign', roles: ['super_admin'], permissions: ['payments.reverse'] }))
    const session = await authService.getSession()
    expect(session.branchId).toBeNull()
    expect(session.user).toBe(DEMO_USERS.find((user) => user.id === 'demo-multi'))
    expect(session.user.assignments[1].roles).toEqual(['teacher', 'receptionist'])
  })

  it('clears storage on logout and remains logged out after restoration', async () => {
    await authService.login({ userId: 'demo-teacher' })
    await authService.logout()
    expect(await authService.getCurrentUser()).toBeNull()
    expect(localStorage.getItem(MOCK_SESSION_KEY)).toBeNull()
  })

  it('fails closed when storage cannot be read or written', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    await expect(authService.getSession()).rejects.toThrow('unavailable')
    vi.restoreAllMocks()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    await expect(authService.login({ userId: 'demo-owner' })).rejects.toThrow('could not be saved')
  })
})

describe('only workspace viewing is granted', () => {
  it.each(DEMO_USERS.filter((user) => user.enabled && user.assignments.length))('uses branch-scoped roles and denies every ERP action for $name', (user) => {
    for (const branch of getAuthorizedBranches(user)) {
      expect(canAccess('workspace.view', user, branch.id)).toBe(true)
      for (const permission of ['unknown', '', 'dashboard.view', 'students.read', 'payments.record', 'payments.reverse', 'discounts.approve']) {
        expect(canAccess(permission, user, branch.id)).toBe(false)
      }
    }
    for (const branch of getAuthorizedBranches(user)) {
      if (user.id === 'demo-admin') {
        expect(canAccess('branches.manage', user, branch.id)).toBe(true)
        expect(canAccess('users.manage', user, branch.id)).toBe(true)
        expect(canAccess('settings.manage', user, branch.id)).toBe(true)
      } else {
        expect(canAccess('branches.manage', user, branch.id)).toBe(false)
      }
    }
    expect(canAccess('workspace.view', user, 'foreign')).toBe(false)
    expect(canAccess('workspace.view', user, 'all')).toBe(false)
  })

  it('denies anonymous, disabled, unassigned and malformed assignments', () => {
    expect(canAccess('workspace.view', null, 'demo-central')).toBe(false)
    for (const user of DEMO_USERS.filter((candidate) => !candidate.enabled || !candidate.assignments.length)) expect(canAccess('workspace.view', user, 'demo-central')).toBe(false)
    expect(canAccess('workspace.view', { enabled: true, assignments: [{ branchId: 'demo-central', roles: ['unknown'] }] }, 'demo-central')).toBe(false)
  })
})
