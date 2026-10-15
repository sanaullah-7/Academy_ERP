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
const operation = async (name, args, query) => mockApi.assetOperation(name, { ...args, query }, await scope(query))
export const assetService = {
  list: query => operation('list', {}, query),
  get: (id, query) => operation('get', { id }, query),
  create: (record, query) => operation('create', { record }, query),
  update: (id, record, query) => operation('update', { id, record }, query),
  assign: (id, record, query) => operation('assign', { id, record }, query),
  unassign: (id, query) => operation('unassign', { id }, query),
  inspect: (id, record, query) => operation('inspect', { id, record }, query),
  addMaintenance: (id, record, query) => operation('maintenance', { id, record }, query),
}
