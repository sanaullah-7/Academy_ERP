import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { MockDataError } from '../mock/mockDatabase.js'
import { readPageResource } from './localPageResources.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'

async function scope(query) {
  const started = await authService.getSession()
  return async () => {
    const current = await authService.getSession()
    if (!started?.user || current?.user?.id !== started.user.id || current.branchId !== query?.branchId) throw new MockDataError('INVALID_SCOPE', 'The active session or branch changed.')
  }
}
export const reportService = {
  overview: async (query, { refresh = false } = {}) => {
    const validate = await scope(query)
    await validate()
    const session = await authService.getSession()
    if (!canAccess(PERMISSIONS.REPORTS_VIEW, session.user, query.branchId) || (query.allBranches && !canAccess(PERMISSIONS.REPORTS_COMPARE_BRANCHES, session.user, query.branchId))) throw new MockDataError('DEMO_ACTION_DENIED', 'This role is not authorized to view these reports.')
    const load = () => mockApi.reportOperation('overview', { query }, validate)
    const result = refresh ? await load() : await readPageResource(`report-read:${JSON.stringify(query)}`, load)
    await validate()
    const current = await authService.getSession()
    if (!canAccess(PERMISSIONS.REPORTS_VIEW, current.user, query.branchId) || (query.allBranches && !canAccess(PERMISSIONS.REPORTS_COMPARE_BRANCHES, current.user, query.branchId))) throw new MockDataError('DEMO_ACTION_DENIED', 'Report permissions changed.')
    return canAccess(PERMISSIONS.PAYROLL_VIEW, current.user, query.branchId) ? result : { ...result, payroll: [] }
  },
}
