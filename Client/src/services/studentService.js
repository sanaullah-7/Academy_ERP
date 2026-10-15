/**
 * Purpose: Will define student Service for the services area of the Academy frontend.
 * Module: services
 * Status: Planned — functionality not implemented.
 */

import { createCollectionService, mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { MockDataError } from '../mock/mockDatabase.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
const collection = createCollectionService('students')
async function inScope(operation, query, permission) {
  const started = await authService.getSession()
  const validate = async () => {
    const current = await authService.getSession()
    if (!started?.user || !current?.user || current.user.id !== started.user.id || !current.branchId || current.branchId !== query?.branchId) throw new MockDataError('INVALID_SCOPE', 'Choose your active authorized DEMO branch before reading students.')
    if (!canAccess(permission, current.user, current.branchId)) throw new MockDataError('DEMO_ACTION_DENIED', 'This DEMO role is not authorized for the requested Students action.')
  }
  await validate()
  const result = await operation()
  await validate()
  return result
}
export const studentService = {
  list: (query) => inScope(() => mockApi.request('students', 'list', { query, preserveSavedRecords: true }), query, PERMISSIONS.STUDENTS_VIEW),
  getById: (id, query) => inScope(() => mockApi.request('students', 'getById', { id, query, preserveSavedRecords: true }), query, PERMISSIONS.STUDENTS_VIEW),
  listDirectory: (query) => inScope(() => mockApi.studentOperation('listDirectory', { query }), query, PERMISSIONS.STUDENTS_VIEW),
  getProfile: (id, query) => inScope(() => mockApi.studentOperation('getProfile', { id, query }), query, PERMISSIONS.STUDENTS_VIEW),
  create: (record, query) => inScope(() => collection.create(record, query), query, PERMISSIONS.STUDENTS_CREATE),
  update: (id, record, query) => inScope(() => collection.update(id, record, query), query, PERMISSIONS.STUDENTS_EDIT),
}
