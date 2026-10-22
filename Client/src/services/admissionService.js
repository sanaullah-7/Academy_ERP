/**
 * Purpose: Will define admission Service for the services area of the Academy frontend.
 * Module: services
 * Status: Provisional — basic demo operations.
 */

// Historical scaffold explanation retained; the approved DEMO implementation follows.
/**
 * Purpose: Will define admission Service for the services area of the Academy frontend.
 * Module: services
 * Status: Planned — functionality not implemented.
 */

import { createCollectionService, mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { MockDataError } from '../mock/mockDatabase.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
import { notificationService } from './notificationService.js'

async function notifyAdmission(result, query) {
  try {
    const admission = result?.admission ?? result
    await notificationService.publish({ type: 'student_added', branchId: query?.branchId, entityId: admission?.id, title: 'New student admission', message: `${admission?.studentName ?? result?.student?.name ?? 'A student'} was added by staff.` })
  } catch { /* A notification failure must not roll back a completed admission. */ }
  return result
}

async function scopeCheck(query, permission) {
  const startedSession = await authService.getSession()
  return async () => {
    const session = await authService.getSession()
    if (!session?.user || session.user.id !== startedSession?.user.id || !session.branchId || session.branchId !== query?.branchId) throw new MockDataError('INVALID_SCOPE', 'The active session or branch changed. Try again in the current branch.')
    if (!permission || !canAccess(permission, session.user, session.branchId)) throw new MockDataError('DEMO_ACTION_DENIED', 'This role is not authorized for the requested Admissions action.')
  }
}

export const admissionService = {
  ...createCollectionService('admissions'),
  list: async (query) => mockApi.admissionOperation('list', { query }, await scopeCheck(query, PERMISSIONS.ADMISSIONS_VIEW)),
  getById: async (id, query) => mockApi.admissionOperation('getById', { id, query }, await scopeCheck(query, PERMISSIONS.ADMISSIONS_VIEW)),
  create: async (record, query) => notifyAdmission(await mockApi.createAdmission(record, query, await scopeCheck(query, PERMISSIONS.ADMISSIONS_CREATE)), query),
  createWithStudent: async (record, query) => notifyAdmission(await mockApi.createAdmission(record, query, await scopeCheck(query, PERMISSIONS.ADMISSIONS_CREATE)), query),
  update: async (id, record, query) => mockApi.admissionOperation('update', { id, record, query }, await scopeCheck(query, PERMISSIONS.ADMISSIONS_EDIT)),
  delete: async (id, query) => mockApi.admissionOperation('delete', { id, query }, await scopeCheck(query, PERMISSIONS.ADMISSIONS_DELETE)),
  changeStatus: async (id, record, query) => mockApi.admissionOperation('changeStatus', { id, record, query }, await scopeCheck(query, PERMISSIONS.ADMISSIONS_DECIDE)),
  enroll: async (id, record, query) => mockApi.enrollAdmission(id, record, query, await scopeCheck(query, PERMISSIONS.ADMISSIONS_DECIDE)),
  completeAdmission: async (record, query) => notifyAdmission(await mockApi.completeAdmission(record, query, await scopeCheck(query, PERMISSIONS.ADMISSIONS_DECIDE)), query),
}
