import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateRequest } from '../../src/middleware/validateRequest.js'
import { AppError } from '../../src/shared/errors/AppError.js'

test('Validation: rejects NoSQL operator injection in body, query, and params', () => {
  const middleware = validateRequest({
    body: { name: { type: 'string', required: true } },
  })

  // Body containing $gt operator
  const reqInjection = {
    body: { name: { $gt: '' } },
    query: {},
    params: {},
  }

  let error = null
  middleware(reqInjection, {}, (err) => {
    error = err
  })

  assert.ok(error)
  assert.equal(error.statusCode, 400)
  assert.equal(error.code, 'UNSAFE_QUERY')
  assert.match(error.message, /Forbidden query operator/)
})

test('Validation: validates types, bounds, enums and formats correctly', () => {
  const schema = {
    body: {
      fullName: { type: 'string', required: true, minLength: 3, maxLength: 50 },
      age: { type: 'number', required: false, min: 18, max: 65, integer: true },
      role: { type: 'string', required: true, enum: ['admin', 'teacher'] },
      studentId: { type: 'objectId', required: true },
      dateOfBirth: { type: 'date', required: true },
      isActive: { type: 'boolean', required: true },
      tags: { type: 'array', required: false, maxItems: 3, itemType: 'string' },
    },
    strict: true,
  }

  const middleware = validateRequest(schema)

  // 1. Valid payload passes
  const validReq = {
    body: {
      fullName: 'John Doe',
      age: 25,
      role: 'admin',
      studentId: '507f1f77bcf86cd799439011',
      dateOfBirth: '2000-01-15T00:00:00.000Z',
      isActive: true,
      tags: ['scholarship', 'science'],
    },
    query: {},
    params: {},
  }

  let validErr = null
  middleware(validReq, {}, (err) => {
    validErr = err
  })
  assert.equal(validErr, undefined)

  // 2. Multiple violations collected in fieldErrors
  const invalidReq = {
    body: {
      fullName: 'J', // too short
      age: 15, // below min
      role: 'super_hero', // not in enum
      studentId: 'invalid-hex', // bad objectId
      dateOfBirth: 'not-a-date', // bad date
      isActive: 'yes', // bad boolean
      tags: ['a', 'b', 'c', 'd'], // exceeds maxItems
      unwantedField: 'malicious', // unexpected field in strict mode
    },
    query: {},
    params: {},
  }

  let invalidErr = null
  middleware(invalidReq, {}, (err) => {
    invalidErr = err
  })

  assert.ok(invalidErr instanceof AppError)
  assert.equal(invalidErr.statusCode, 400)
  assert.equal(invalidErr.code, 'VALIDATION_ERROR')
  assert.ok(invalidErr.fieldErrors)

  assert.match(invalidErr.fieldErrors.fullName, /at least 3 characters/)
  assert.match(invalidErr.fieldErrors.age, /cannot be less than 18/)
  assert.match(invalidErr.fieldErrors.role, /must be one of/)
  assert.match(invalidErr.fieldErrors.studentId, /valid 24-character/)
  assert.match(invalidErr.fieldErrors.dateOfBirth, /valid ISO-8601/)
  assert.match(invalidErr.fieldErrors.isActive, /must be a boolean/)
  assert.match(invalidErr.fieldErrors.tags, /cannot contain more than 3/)
  assert.match(invalidErr.fieldErrors.unwantedField, /Unexpected field/)
})
