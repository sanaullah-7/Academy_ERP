/**Purpose: Will define mock Api for the mock area of the Academy frontend.
 * Module: mock
 * Status: Planned — functionality not implemented.
 */

import { createMockDatabase, MockDataError } from './mockDatabase.js'
import { MOCK_DATABASE_KEY } from '../constants/storageKeys.js'

// Services expose async results and reject with {name, code, message} errors.
// Failure injection exists only in test builds, before any persistence operation.
export function createMockApi({ database = createMockDatabase(), beforeRequest } = {}) {
  if (beforeRequest && (import.meta.env.MODE !== 'test' || !import.meta.env.DEV)) throw new MockDataError('INVALID_REQUEST', 'Failure simulation is test-only.')
  const serialize = (commit) => globalThis.navigator?.locks ? navigator.locks.request(MOCK_DATABASE_KEY, commit) : commit()
  return {
    async createAdmission(record, query, validateScope) {
      if (beforeRequest) {
        try { await beforeRequest({ operation: 'admissionTransaction' }) }
        catch { throw new MockDataError('SIMULATED_FAILURE', 'Test-only mock request failed.') }
      }
      return serialize(async () => {
        if (validateScope) await validateScope()
        return database.createAdmission(record, query)
      })
    },
    async admissionOperation(operation, { id, record, query }, validateScope) {
      if (beforeRequest) {
        try { await beforeRequest({ collection: 'admissions', operation }) }
        catch { throw new MockDataError('SIMULATED_FAILURE', 'Test-only mock request failed.') }
      }
      return serialize(async () => {
        if (validateScope) await validateScope()
        if (operation === 'getById') return database.getAdmission(id, query)
        if (operation === 'delete') return database.deleteAdmission(id, query)
        if (operation === 'update') return database.updateAdmission(id, record, query)
        if (operation === 'changeStatus') return database.changeAdmissionStatus(id, record, query)
        return database.run('admissions', operation, { id, record, query })
      })
    },
    async enrollAdmission(id, record, query, validateScope) {
      if (beforeRequest) {
        try { await beforeRequest({ collection: 'admissions', operation: 'enroll' }) }
        catch { throw new MockDataError('SIMULATED_FAILURE', 'Test-only mock request failed.') }
      }
      return serialize(async () => {
        if (validateScope) await validateScope()
        return database.enrollStudent(id, record, query)
      })
    },
    async studentOperation(operation, { id, query }, validateScope) {
      if (beforeRequest) {
        try { await beforeRequest({ collection: 'students', operation }) }
        catch { throw new MockDataError('SIMULATED_FAILURE', 'Test-only mock request failed.') }
      }
      return serialize(async () => {
        if (validateScope) await validateScope()
        return database.studentOperation(operation, { id, query })
      })
    },
    async updateEnrollmentFeeStatus(id, record, query, validateScope) {
      if (beforeRequest) {
        try { await beforeRequest({ collection: 'enrollments', operation: 'updateFeeStatus' }) }
        catch { throw new MockDataError('SIMULATED_FAILURE', 'Test-only mock request failed.') }
      }
      return serialize(async () => {
        if (validateScope) await validateScope()
        return database.updateEnrollmentFeeStatus(id, record, query)
      })
    },
    async academicOperation(operation, args, validateScope) {
      if (beforeRequest) {
        try { await beforeRequest({ collection: 'academics', operation }) }
        catch { throw new MockDataError('SIMULATED_FAILURE', 'Test-only mock request failed.') }
      }
      return serialize(async () => {
        if (validateScope) await validateScope()
        return database.academicOperation(operation, args)
      })
    },
    async classScheduleOperation(operation, args, validateScope) {
      return serialize(async () => { if (validateScope) await validateScope(); return database.classScheduleOperation(operation, args) })
    },
    async demoClassOperation(operation, args, validateScope) {
      if (beforeRequest) {
        try { await beforeRequest({ collection: 'demoClasses', operation }) }
        catch { throw new MockDataError('SIMULATED_FAILURE', 'Test-only mock request failed.') }
      }
      return serialize(async () => {
        if (validateScope) await validateScope()
        return database.demoClassOperation(operation, args)
      })
    },
    async financialOperation(operation, args, validateScope) {
      return serialize(async () => { if (validateScope) await validateScope(); return database.financialOperation(operation, args) })
    },
    async request(collection, operation, args) {
      if (beforeRequest) {
        try { await beforeRequest({ collection, operation }) }
        catch { throw new MockDataError('SIMULATED_FAILURE', 'Test-only mock request failed.') }
      }
      return serialize(() => database.run(collection, operation, args))
    },
    async runTransaction(operations) {
      if (beforeRequest) {
        try { await beforeRequest({ operation: 'transaction' }) }
        catch { throw new MockDataError('SIMULATED_FAILURE', 'Test-only mock request failed.') }
      }
      return serialize(() => database.runTransaction(operations))
    },
  }
}

export const mockApi = createMockApi()

export function createCollectionService(collection, adapter = mockApi) {
  return {
    list: async (query) => adapter.request(collection, 'list', { query }),
    getById: async (id, query) => adapter.request(collection, 'getById', { id, query }),
    create: async (record, query) => adapter.request(collection, 'create', { record, query }),
    update: async (id, record, query) => adapter.request(collection, 'update', { id, record, query }),
  }
}
