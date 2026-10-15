import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
import { MockDataError } from '../mock/mockDatabase.js'

async function scope(query, permission) {
  const started = await authService.getSession()
  return async () => {
    const current = await authService.getSession()
    if (!started?.user || current?.user?.id !== started.user.id || current.branchId !== query?.branchId) throw new MockDataError('INVALID_SCOPE', 'The active DEMO session or branch changed.')
    if (!canAccess(permission, current.user, current.branchId)) throw new MockDataError('DEMO_ACTION_DENIED', 'This role is not authorized for this class action.')
  }
}

export const classScheduleService = {
  list: async query => mockApi.classScheduleOperation('list', { query }, await scope(query, PERMISSIONS.CLASSES_VIEW)),
  getById: async (id, query) => mockApi.classScheduleOperation('get', { id, query }, await scope(query, PERMISSIONS.CLASSES_VIEW)),
  create: async (record, query) => mockApi.classScheduleOperation('create', { record, query }, await scope(query, PERMISSIONS.CLASSES_MANAGE)),
  update: async (id, record, query) => mockApi.classScheduleOperation('update', { id, record, query }, await scope(query, PERMISSIONS.CLASSES_MANAGE)),
  delete: async (id, query) => mockApi.classScheduleOperation('delete', { id, query }, await scope(query, PERMISSIONS.CLASSES_MANAGE)),
}
