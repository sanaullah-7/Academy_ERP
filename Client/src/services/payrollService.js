import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { MockDataError } from '../mock/mockDatabase.js'

async function scope(query) {
  const started = await authService.getSession()
  return async () => {
    const current = await authService.getSession()
    if (!started?.user || current?.user?.id !== started.user.id || current.branchId !== query?.branchId) {
      throw new MockDataError('INVALID_SCOPE', 'The active session or branch changed.')
    }
  }
}

const operation = async (name, args, query) => mockApi.payrollOperation(name, { ...args, query }, await scope(query))

export const payrollService = {
  getSettings: (query) => operation('getSettings', {}, query),
  updateSettings: (record, query) => operation('updateSettings', { record }, query),
  getAgreements: (query) => operation('getAgreements', {}, query),
  saveAgreement: (record, query) => operation('saveAgreement', { record }, query),
  getPeriods: (query) => operation('getPeriods', {}, query),
  getPeriodDetails: (id, query) => operation('getPeriodDetails', { id }, query),
  calculatePeriod: (record, query) => operation('calculatePeriod', { record }, query),
  approvePeriod: (id, query) => operation('approvePeriod', { id }, query),
  recordPayment: (record, query) => operation('recordPayment', { record }, query),
  requestAdvance: (record, query) => operation('requestAdvance', { record }, query),
  getAdvances: (query) => operation('getAdvances', {}, query),
  addAdjustment: (record, query) => operation('addAdjustment', { record }, query),
  getPayslip: (id, query) => operation('getPayslip', { id }, query),
}
