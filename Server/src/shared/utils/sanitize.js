import { AppError } from '../errors/AppError.js'
import { ERROR_CODES } from '../../constants/errorCodes.js'

/**
 * Checks if an object or nested object contains forbidden MongoDB query operators ($ or dot notation).
 */
export function hasMongoOperators(value) {
  if (!value || typeof value !== 'object') return false

  if (Array.isArray(value)) {
    return value.some((item) => hasMongoOperators(item))
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      return true
    }
    if (hasMongoOperators(value[key])) {
      return true
    }
  }

  return false
}

/**
 * Asserts that input contains no MongoDB operator keys. Throws AppError 400 if found.
 */
export function assertNoMongoOperators(value, fieldName = 'input') {
  if (hasMongoOperators(value)) {
    throw new AppError({
      statusCode: 400,
      code: ERROR_CODES.UNSAFE_QUERY,
      message: `Forbidden query operator or key detected in ${fieldName}.`,
    })
  }
}

/**
 * Recursively strips keys starting with '$' or containing '.' from an object.
 */
export function sanitizeObject(value) {
  if (!value || typeof value !== 'object') return value

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item))
  }

  const clean = {}
  for (const [key, val] of Object.entries(value)) {
    if (!key.startsWith('$') && !key.includes('.')) {
      clean[key] = sanitizeObject(val)
    }
  }
  return clean
}

/**
 * Safely sanitizes a string by trimming, removing null bytes, and bounding max length.
 */
export function sanitizeString(value, { maxLength = 255, trim = true } = {}) {
  if (typeof value !== 'string') return ''
  let result = value.replace(/\0/g, '')
  if (trim) result = result.trim()
  if (typeof maxLength === 'number' && maxLength > 0) {
    result = result.slice(0, maxLength)
  }
  return result
}

/**
 * Returns a new object containing only allowlisted fields.
 */
export function stripUnexpectedFields(data, allowedFields = []) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
  const allowedSet = new Set(allowedFields)
  const result = {}
  for (const [key, val] of Object.entries(data)) {
    if (allowedSet.has(key)) {
      result[key] = val
    }
  }
  return result
}
