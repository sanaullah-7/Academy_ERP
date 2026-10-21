import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { MockDataError } from '../mock/mockDatabase.js'

async function scope(query) {
  const started = await authService.getSession()
  return async () => {
    const current = await authService.getSession()
    if (!started?.user || current?.user?.id !== started.user.id || current.branchId !== query?.branchId) throw new MockDataError('INVALID_SCOPE', 'The active session or branch changed.')
  }
}
export const reportService = {
  overview: async query => mockApi.reportOperation('overview', { query }, await scope(query)),
}
