import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { MockDataError } from '../mock/mockDatabase.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
import { getBranchRoles } from '../constants/roles.js'
import { readPageResource } from './localPageResources.js'

function permissionSignature(user, branchId) {
  return Object.values(PERMISSIONS).filter(permission => canAccess(permission, user, branchId)).sort().join(',')
}

async function scope(query) {
  const started = await authService.getSession()
  return async () => {
    const current = await authService.getSession()
    if (!started?.user || current?.user?.id !== started.user.id || current.branchId !== query?.branchId) throw new MockDataError('INVALID_SCOPE', 'The active account or branch changed. Reload the dashboard.')
    if (!canAccess(PERMISSIONS.DASHBOARD_VIEW, current.user, current.branchId)) throw new MockDataError('DEMO_ACTION_DENIED', 'This role is not authorized to view the dashboard.')
    return current
  }
}

export const dashboardService = {
  overview: async (query, { refresh = false } = {}) => {
    const validate = await scope(query)
    const session = await validate()
    const roles = getBranchRoles(session.user, query.branchId).sort().join(',')
    const key = ['dashboard-read', 'academy', session.user.id, query.branchId, roles, permissionSignature(session.user, query.branchId)].join(':')
    const load = () => mockApi.dashboardOperation('overview', { query }, validate)
    const result = refresh ? await load() : await readPageResource(key, load)
    const current = await validate()
    if (getBranchRoles(current.user, query.branchId).sort().join(',') !== roles || permissionSignature(current.user, query.branchId) !== permissionSignature(session.user, query.branchId)) throw new MockDataError('INVALID_SCOPE', 'Dashboard permissions changed. Reload the dashboard.')
    return result
  },
}
