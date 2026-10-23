import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  parsePagination,
  parseSort,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../../src/shared/database/pagination.js'
import {
  hasMongoOperators,
  sanitizeObject,
  sanitizeString,
  stripUnexpectedFields,
} from '../../src/shared/utils/sanitize.js'
import {
  assertTenantPrefix,
  assertTenantBranchPrefix,
  INDEX_PATTERNS,
} from '../../src/shared/database/indexes.js'
import { AppError } from '../../src/shared/errors/AppError.js'

test('Database Pagination: parsePagination boundaries and defaults', () => {
  // 1. Defaults when empty
  const empty = parsePagination({})
  assert.equal(empty.page, DEFAULT_PAGE)
  assert.equal(empty.limit, DEFAULT_PAGE_SIZE)
  assert.equal(empty.skip, 0)

  // 2. String conversion and valid calculation
  const custom = parsePagination({ page: '3', pageSize: '15' })
  assert.equal(custom.page, 3)
  assert.equal(custom.limit, 15)
  assert.equal(custom.skip, 30) // (3 - 1) * 15

  // 3. Fallback on invalid or negative page numbers
  const negative = parsePagination({ page: '-2', limit: '0' })
  assert.equal(negative.page, DEFAULT_PAGE)
  assert.equal(negative.limit, DEFAULT_PAGE_SIZE)

  // 4. Ceiling capping on maxLimit (100)
  const excessive = parsePagination({ page: '1', pageSize: '500' })
  assert.equal(excessive.limit, MAX_PAGE_SIZE)
})

test('Database Pagination: parseSort allowlist and deterministic tie-breaker', () => {
  // 1. Default sort when none specified
  const defSort = parseSort({}, { allowedFields: ['name', 'createdAt'] })
  assert.deepEqual(defSort, { createdAt: -1, _id: -1 })

  // 2. Ascending order with tie-breaker
  const ascSort = parseSort(
    { sortBy: 'name', sortDirection: 'asc' },
    { allowedFields: ['name', 'createdAt'] }
  )
  assert.deepEqual(ascSort, { name: 1, _id: -1 })

  // 3. Rejection of unallowlisted sort field
  assert.throws(
    () => {
      parseSort({ sortBy: 'passwordHash' }, { allowedFields: ['name', 'createdAt'] })
    },
    (err) => err instanceof AppError && err.statusCode === 400 && err.code === 'VALIDATION_ERROR'
  )
})

test('Sanitization & Index standards: safe input sanitization and ESR indexing', () => {
  // 1. Detect mongo operator keys
  assert.equal(hasMongoOperators({ normalKey: 'val' }), false)
  assert.equal(hasMongoOperators({ $where: 'sleep(1000)' }), true)
  assert.equal(hasMongoOperators({ nested: { 'bad.dot': 1 } }), true)

  // 2. Sanitize object strips dangerous keys
  const dirty = { safe: 'yes', $regex: '.*', nested: { ok: true, $ne: 5 } }
  const clean = sanitizeObject(dirty)
  assert.deepEqual(clean, { safe: 'yes', nested: { ok: true } })

  // 3. String bounds and control character stripping
  assert.equal(sanitizeString('  hello\0world  ', { maxLength: 5 }), 'hello')

  // 4. Strip unexpected fields
  const stripped = stripUnexpectedFields(
    { keep1: 1, keep2: 2, removeMe: 3 },
    ['keep1', 'keep2']
  )
  assert.deepEqual(stripped, { keep1: 1, keep2: 2 })

  // 5. Index ESR standards verification
  assert.equal(assertTenantPrefix(INDEX_PATTERNS.TENANT_BRANCH), true)
  assert.equal(assertTenantBranchPrefix(INDEX_PATTERNS.TENANT_BRANCH_CREATED), true)

  assert.throws(() => {
    assertTenantPrefix({ branchId: 1, organizationId: 1 })
  }, /must lead with "organizationId"/)

  assert.throws(() => {
    assertTenantBranchPrefix({ organizationId: 1, createdAt: -1 })
  }, /followed by "branchId"/)
})
