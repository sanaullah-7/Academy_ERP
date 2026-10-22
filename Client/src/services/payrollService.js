import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { MockDataError } from '../mock/mockDatabase.js'
import { notificationService } from './notificationService.js'

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
  getTeacherCompensation: (query) => operation('getTeacherCompensation', {}, query),
  getRunningOverview: (query) => operation('getRunningOverview', {}, query),
  getAgreements: (query) => operation('getAgreements', {}, query),
  saveAgreement: (record, query) => operation('saveAgreement', { record }, query),
  getPeriods: (query) => operation('getPeriods', {}, query),
  getPeriodDetails: (id, query) => operation('getPeriodDetails', { id }, query),
  recordPayment: async (record, query) => {
    const result = await operation('recordPayment', { record }, query)
    try {
      if (result?.line?.teacherId) {
        await notificationService.publish({
          type: 'salary_payment',
          branchId: query?.branchId,
          entityId: result.payment?.id || result.line.id,
          teacherId: result.line.teacherId,
          title: 'Salary Disbursed',
          message: `PKR ${Number(result.payment?.amount || 0).toLocaleString()} has been paid towards your ${result.line.subjectName || result.line.batchName || 'teaching'} assignment.`
        })
      }
    } catch {
      // Preserve payment even if notification fails
    }
    return result
  },
  requestAdvance: (record, query) => operation('requestAdvance', { record }, query),
  getAdvances: (query) => operation('getAdvances', {}, query),
  addAdjustment: (record, query) => operation('addAdjustment', { record }, query),
  getPayslip: (id, query) => operation('getPayslip', { id }, query),
}
