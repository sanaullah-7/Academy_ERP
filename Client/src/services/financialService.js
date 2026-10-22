import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { notificationService } from './notificationService.js'
import { MockDataError } from '../mock/mockDatabase.js'

async function scope(query) {
  const started = await authService.getSession()
  return async () => {
    const current = await authService.getSession()
    if (!started?.user || current?.user?.id !== started.user.id || current.branchId !== query?.branchId) throw new MockDataError('INVALID_SCOPE', 'The active session or branch changed.')
  }
}

const operation = async (name, args, query) => mockApi.financialOperation(name, { ...args, query }, await scope(query))
export const financialService = {
  overview: query => operation('overview', {}, query),
  financeOverview: query => operation('financeOverview', {}, query),
  getReceipt: (id, query) => operation('getReceipt', { id }, query),
  createChallan: async (record, query) => {
    const result = await operation('createChallan', { record }, query)
    try { await notificationService.publish({ type: 'challan_created', branchId: query?.branchId, entityId: result?.id, title: 'Fee challan issued', message: `${result?.studentName ?? 'A student'}'s challan ${result?.reference ?? ''} was issued.` }) } catch { /* Preserve the successful finance operation. */ }
    return result
  },
  recordPayment: (record, query) => operation('recordPayment', { record }, query),
  createExpense: (record, query) => operation('createExpense', { record }, query),
}
