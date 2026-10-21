/**
 * Purpose: Will define demo Class Service for the services area of the Academy frontend.
 * Module: services
 * Status: Implemented — branch-scoped Demo Classes operations.
 */

import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { MockDataError } from '../mock/mockDatabase.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'

async function scopeCheck(query, permission) {
  const startedSession = await authService.getSession()
  return async () => {
    const session = await authService.getSession()
    if (!session?.user || session.user.id !== startedSession?.user.id || !session.branchId || session.branchId !== query?.branchId) {
      throw new MockDataError('INVALID_SCOPE', 'The active DEMO session or branch changed. Try again in the current branch.')
    }
    if (permission && !canAccess(permission, session.user, session.branchId)) {
      throw new MockDataError('DEMO_ACTION_DENIED', 'This DEMO role is not authorized for the requested Demo Classes action.')
    }
  }
}

export const demoClassService = {
  list: async (query) => mockApi.demoClassOperation('list', { query }, await scopeCheck(query, PERMISSIONS.DEMO_CLASSES_VIEW)),
  getById: async (id, query) => mockApi.demoClassOperation('get', { id, query }, await scopeCheck(query, PERMISSIONS.DEMO_CLASSES_VIEW)),
  register: async (record, query) => mockApi.demoClassOperation('register', { record, query }, await scopeCheck(query, PERMISSIONS.DEMO_CLASSES_MANAGE)),
  update: async (id, record, query) => mockApi.demoClassOperation('update', { id, record, query }, await scopeCheck(query, PERMISSIONS.DEMO_CLASSES_MANAGE)),
  schedule: async (id, record, query) => mockApi.demoClassOperation('schedule', { id, record, query }, await scopeCheck(query, PERMISSIONS.DEMO_CLASSES_MANAGE)),
  recordAttendance: async (id, record, query) => mockApi.demoClassOperation('attendance', { id, record, query }, await scopeCheck(query, PERMISSIONS.DEMO_CLASSES_MANAGE)),
  delete: async (id, query) => mockApi.demoClassOperation('delete', { id, query }, await scopeCheck(query, PERMISSIONS.DEMO_CLASSES_MANAGE)),
  cancel: async (id, record, query) => mockApi.demoClassOperation('cancel', { id, record, query }, await scopeCheck(query, PERMISSIONS.DEMO_CLASSES_MANAGE)),
  convertToAdmission: async (id, record, query) => mockApi.demoClassOperation('convert', { id, record, query }, await scopeCheck(query, PERMISSIONS.DEMO_CLASSES_MANAGE)),
}