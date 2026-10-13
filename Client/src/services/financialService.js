import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { MockDataError } from '../mock/mockDatabase.js'

async function scope(query) {
  const started = await authService.getSession()
  return async () => {
    const current = await authService.getSession()
    if (!started?.user || current?.user?.id !== started.user.id || current.branchId !== query?.branchId) throw new MockDataError('INVALID_SCOPE', 'The active DEMO session or branch changed.')
  }
}

const operation = async (name, args, query) => mockApi.financialOperation(name, { ...args, query }, await scope(query))
export const financialService = {
  overview: query => operation('overview', {}, query),
  financeOverview: query => operation('financeOverview', {}, query),
  getReceipt: (id, query) => operation('getReceipt', { id }, query),
  createChallan: (record, query) => operation('createChallan', { record }, query),
  recordPayment: (record, query) => operation('recordPayment', { record }, query),
  createExpense: (record, query) => operation('createExpense', { record }, query),
}
