import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { MockDataError } from '../mock/mockDatabase.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'

async function scopeCheck(query, permission) {
  const started = await authService.getSession()
  return async () => {
    const current = await authService.getSession()
    if (!started?.user || current?.user?.id !== started.user.id || current?.branchId !== query?.branchId) throw new MockDataError('INVALID_SCOPE', 'The active DEMO session or branch changed.')
    if (!canAccess(permission, current.user, current.branchId)) throw new MockDataError('DEMO_ACTION_DENIED', 'This DEMO role is not authorized for this Courses & Batches action.')
  }
}

export const academicService = {
  overview: async query => mockApi.academicOperation('overview', { query }, await scopeCheck(query, PERMISSIONS.COURSES_VIEW)),
  getCourse: async (id, query) => mockApi.academicOperation('get', { entity: 'course', id, query }, await scopeCheck(query, PERMISSIONS.COURSES_VIEW)),
  getBatch: async (id, query) => mockApi.academicOperation('get', { entity: 'batch', id, query }, await scopeCheck(query, PERMISSIONS.COURSES_VIEW)),
  getStream: async (id, query) => mockApi.academicOperation('get', { entity: 'stream', id, query }, await scopeCheck(query, PERMISSIONS.COURSES_VIEW)),
  getSubject: async (id, query) => mockApi.academicOperation('get', { entity: 'subject', id, query }, await scopeCheck(query, PERMISSIONS.COURSES_VIEW)),
  saveCourse: async (id, record, query) => mockApi.academicOperation('save', { entity: 'course', id, record, query }, await scopeCheck(query, PERMISSIONS.COURSES_MANAGE)),
  saveBatch: async (id, record, query) => mockApi.academicOperation('save', { entity: 'batch', id, record, query }, await scopeCheck(query, PERMISSIONS.COURSES_MANAGE)),
  deleteCourse: async (id, query) => mockApi.academicOperation('delete', { entity: 'course', id, query }, await scopeCheck(query, PERMISSIONS.COURSES_MANAGE)),
  deleteBatch: async (id, query) => mockApi.academicOperation('delete', { entity: 'batch', id, query }, await scopeCheck(query, PERMISSIONS.COURSES_MANAGE)),
  deleteStream: async (id, query) => mockApi.academicOperation('delete', { entity: 'stream', id, query }, await scopeCheck(query, PERMISSIONS.COURSES_MANAGE)),
  deleteSubject: async (id, query) => mockApi.academicOperation('delete', { entity: 'subject', id, query }, await scopeCheck(query, PERMISSIONS.COURSES_MANAGE)),
  saveStream: async (id, record, query) => mockApi.academicOperation('save', { entity: 'stream', id, record, query }, await scopeCheck(query, PERMISSIONS.COURSES_MANAGE)),
  saveSubject: async (id, record, query) => mockApi.academicOperation('save', { entity: 'subject', id, record, query }, await scopeCheck(query, PERMISSIONS.COURSES_MANAGE)),
}
