import { mockApi } from '../mock/mockApi.js'
import { authService } from './authService.js'
import { MockDataError } from '../mock/mockDatabase.js'

// Canonical mock session checks are UX safeguards, not production authorization.
export function createReferenceService(collection) {
  async function read(operation, id, query) {
    const started = await authService.getSession()
    const validate = async () => {
      const current = await authService.getSession()
      if (!started?.user || current?.user?.id !== started.user.id || !current?.branchId || current.branchId !== query?.branchId) throw new MockDataError('INVALID_SCOPE', 'Your active session or branch changed. Reload the form.')
    }
    await validate()
    const result = await mockApi.request(collection, operation, { id, query, preserveSavedRecords: true })
    await validate()
    return result
  }
  return { list: query => read('list', undefined, query), getById: (id, query) => read('getById', id, query) }
}
