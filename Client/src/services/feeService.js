import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { MockDataError } from '../mock/mockDatabase.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'

async function scopeCheck(query) {
  const started = await authService.getSession()
  return async () => {
    const current = await authService.getSession()
    if (!started?.user || current?.user?.id !== started.user.id || current?.branchId !== query?.branchId) throw new MockDataError('INVALID_SCOPE', 'The active DEMO session or branch changed.')
    if (!canAccess(PERMISSIONS.FEES_MANAGE, current.user, current.branchId)) throw new MockDataError('DEMO_ACTION_DENIED', 'This DEMO role is not authorized to update enrollment fee status.')
  }
}

export const feeService = {
  updateEnrollmentStatus: async (id, record, query) => mockApi.updateEnrollmentFeeStatus(id, record, query, await scopeCheck(query)),
}
