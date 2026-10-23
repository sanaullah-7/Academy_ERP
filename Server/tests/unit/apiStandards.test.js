import assert from 'node:assert/strict'
import { test } from 'node:test'
import { successResponse, paginatedResponse } from '../../src/shared/utils/response.js'
import { errorResponse } from '../../src/shared/errors/errorResponse.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { createErrorHandler } from '../../src/middleware/errorHandler.js'
import { requestContext } from '../../src/middleware/requestLogger.js'
import {
  isValidIsoDate,
  parseIsoDate,
  formatIsoDate,
  isValidDateOnly,
  parseDateOnly,
} from '../../src/shared/utils/dateTime.js'
import { isValidObjectId, assertValidObjectId } from '../../src/shared/utils/identifiers.js'

test('API Standards: success and paginated response envelopes', () => {
  // 1. Single resource response
  const single = successResponse({ id: 'rec-123', name: 'TSA' })
  assert.deepEqual(single, {
    data: { id: 'rec-123', name: 'TSA' },
  })

  // 2. Resource with metadata
  const withMeta = successResponse({ id: 'rec-123' }, { action: 'updated' })
  assert.deepEqual(withMeta, {
    data: { id: 'rec-123' },
    meta: { action: 'updated' },
  })

  // 3. Paginated collection response
  const paginated = paginatedResponse([{ id: 1 }, { id: 2 }], {
    page: 2,
    pageSize: 10,
    totalItems: 25,
    requestId: 'req-corr-1',
  })

  assert.equal(paginated.data.length, 2)
  assert.equal(paginated.meta.pagination.page, 2)
  assert.equal(paginated.meta.pagination.pageSize, 10)
  assert.equal(paginated.meta.pagination.totalItems, 25)
  assert.equal(paginated.meta.pagination.totalPages, 3)
  assert.equal(paginated.meta.pagination.hasNext, true)
  assert.equal(paginated.meta.pagination.hasPrev, true)
  assert.equal(paginated.meta.requestId, 'req-corr-1')
})

test('API Standards: error responses and Mongoose normalization', () => {
  // 1. Standard error response shape
  const errRes = errorResponse({
    code: 'VALIDATION_ERROR',
    message: 'Fix fields',
    requestId: 'req-99',
    fieldErrors: { email: 'Required' },
    details: ['detail 1'],
  })

  assert.equal(errRes.error.code, 'VALIDATION_ERROR')
  assert.equal(errRes.error.message, 'Fix fields')
  assert.equal(errRes.error.requestId, 'req-99')
  assert.equal(errRes.error.fieldErrors.email, 'Required')
  assert.equal(errRes.error.details[0], 'detail 1')

  // 2. Error handler normalizes Mongoose duplicate key (code 11000)
  const errorHandler = createErrorHandler({ logger: { error() {} }, isProduction: false })

  let capturedStatus = null
  let capturedJson = null
  const mockRes = {
    status(s) {
      capturedStatus = s
      return this
    },
    json(j) {
      capturedJson = j
    },
  }

  const dupError = new Error('Duplicate key')
  dupError.code = 11000
  dupError.keyPattern = { email: 1 }

  errorHandler(dupError, { id: 'req-dup' }, mockRes, () => {})
  assert.equal(capturedStatus, 409)
  assert.equal(capturedJson.error.code, 'CONFLICT')
  assert.match(capturedJson.error.message, /unique email already exists/)

  // 3. Error handler normalizes Mongoose ValidationError
  const valError = new Error('Validation failed')
  valError.name = 'ValidationError'
  valError.errors = {
    amount: { message: 'Amount is required' },
  }

  errorHandler(valError, { id: 'req-val' }, mockRes, () => {})
  assert.equal(capturedStatus, 422)
  assert.equal(capturedJson.error.code, 'VALIDATION_ERROR')
  assert.equal(capturedJson.error.fieldErrors.amount, 'Amount is required')

  // 4. Error handler normalizes Mongoose CastError
  const castError = new Error('Cast failed')
  castError.name = 'CastError'
  castError.path = 'branchId'

  errorHandler(castError, { id: 'req-cast' }, mockRes, () => {})
  assert.equal(capturedStatus, 400)
  assert.equal(capturedJson.error.code, 'VALIDATION_ERROR')
  assert.match(capturedJson.error.message, /branchId/)
})

test('API Standards: requestContext preserves incoming X-Request-Id and attaches X-Response-Time', () => {
  const req = {
    headers: { 'x-request-id': 'custom-inbound-id' },
  }

  const setHeaders = {}
  let writeHeadCalled = false
  const res = {
    setHeader(k, v) {
      setHeaders[k] = v
    },
    writeHead() {
      writeHeadCalled = true
    },
    on() {},
  }

  requestContext(req, res, () => {})

  assert.equal(req.id, 'custom-inbound-id')
  assert.equal(setHeaders['X-Request-Id'], 'custom-inbound-id')

  // Trigger writeHead to check latency header calculation
  res.writeHead(200)
  assert.equal(writeHeadCalled, true)
  assert.match(setHeaders['X-Response-Time'], /^\d+\.\d+ms$/)
})

test('API Standards: DateTime and Identifier utilities', () => {
  // ISO Date checks
  assert.equal(isValidIsoDate('2026-10-23T20:00:00.000Z'), true)
  assert.equal(isValidIsoDate('2026-10-23'), true)
  assert.equal(isValidIsoDate('not-a-date'), false)
  assert.equal(isValidIsoDate(''), false)

  const parsedIso = parseIsoDate('2026-10-23T12:00:00.000Z')
  assert.equal(parsedIso instanceof Date, true)
  assert.equal(formatIsoDate(parsedIso), '2026-10-23T12:00:00.000Z')

  // Date-only YYYY-MM-DD checks
  assert.equal(isValidDateOnly('2026-10-23'), true)
  assert.equal(isValidDateOnly('2026-02-30'), false) // invalid date in feb
  assert.equal(isValidDateOnly('invalid'), false)

  const parsedDateOnly = parseDateOnly('2026-10-23')
  assert.equal(parsedDateOnly.getUTCFullYear(), 2026)
  assert.equal(parsedDateOnly.getUTCMonth(), 9) // 0-indexed month (10 -> 9)
  assert.equal(parsedDateOnly.getUTCDate(), 23)

  // ObjectId checks
  const validId = '507f1f77bcf86cd799439011'
  assert.equal(isValidObjectId(validId), true)
  assert.equal(isValidObjectId('invalid-id'), false)
  assert.equal(isValidObjectId(123), false)
  assert.equal(assertValidObjectId(validId), validId)
  assert.throws(() => assertValidObjectId('short'), (err) => err instanceof AppError && err.statusCode === 400)
})
