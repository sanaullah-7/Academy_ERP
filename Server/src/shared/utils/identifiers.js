import { randomUUID } from 'node:crypto'
import { AppError } from '../errors/AppError.js'
import { ERROR_CODES } from '../../constants/errorCodes.js'

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/

export function isValidObjectId(id) {
  if (typeof id !== 'string') return false
  return OBJECT_ID_REGEX.test(id.trim())
}

export function assertValidObjectId(id, fieldName = 'id') {
  if (!isValidObjectId(id)) {
    throw new AppError({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `Invalid identifier format for field "${fieldName}".`,
      fieldErrors: { [fieldName]: 'Must be a valid 24-character hexadecimal identifier.' },
    })
  }
  return id.trim()
}

export function generateCorrelationId() {
  return randomUUID()
}
