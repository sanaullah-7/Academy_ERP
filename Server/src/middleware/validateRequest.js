import { AppError } from '../shared/errors/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'
import { isValidObjectId } from '../shared/utils/identifiers.js'
import { isValidIsoDate } from '../shared/utils/dateTime.js'
import { hasMongoOperators } from '../shared/utils/sanitize.js'

/**
 * Validates a single value against a field specification.
 * Returns an error string or null if valid.
 */
function validateField(value, spec, fieldName) {
  if (value === undefined || value === null) {
    if (spec.required) {
      return `Field "${fieldName}" is required.`
    }
    return null
  }

  const { type } = spec

  if (type === 'string') {
    if (typeof value !== 'string') {
      return `Field "${fieldName}" must be a string.`
    }
    const str = spec.trim !== false ? value.trim() : value
    if (spec.minLength !== undefined && str.length < spec.minLength) {
      return `Field "${fieldName}" must have at least ${spec.minLength} characters.`
    }
    if (spec.maxLength !== undefined && str.length > spec.maxLength) {
      return `Field "${fieldName}" cannot exceed ${spec.maxLength} characters.`
    }
    if (Array.isArray(spec.enum) && !spec.enum.includes(str)) {
      return `Field "${fieldName}" must be one of: ${spec.enum.join(', ')}.`
    }
    if (spec.pattern instanceof RegExp && !spec.pattern.test(str)) {
      return `Field "${fieldName}" has an invalid format.`
    }
  } else if (type === 'number') {
    const num = Number(value)
    if (typeof value !== 'number' && Number.isNaN(num)) {
      return `Field "${fieldName}" must be a number.`
    }
    if (spec.integer && !Number.isInteger(num)) {
      return `Field "${fieldName}" must be an integer.`
    }
    if (spec.min !== undefined && num < spec.min) {
      return `Field "${fieldName}" cannot be less than ${spec.min}.`
    }
    if (spec.max !== undefined && num > spec.max) {
      return `Field "${fieldName}" cannot exceed ${spec.max}.`
    }
  } else if (type === 'boolean') {
    if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
      return `Field "${fieldName}" must be a boolean.`
    }
  } else if (type === 'objectId') {
    if (!isValidObjectId(String(value))) {
      return `Field "${fieldName}" must be a valid 24-character hexadecimal identifier.`
    }
  } else if (type === 'date') {
    if (!isValidIsoDate(String(value))) {
      return `Field "${fieldName}" must be a valid ISO-8601 date.`
    }
  } else if (type === 'array') {
    if (!Array.isArray(value)) {
      return `Field "${fieldName}" must be an array.`
    }
    if (spec.minItems !== undefined && value.length < spec.minItems) {
      return `Field "${fieldName}" must contain at least ${spec.minItems} items.`
    }
    if (spec.maxItems !== undefined && value.length > spec.maxItems) {
      return `Field "${fieldName}" cannot contain more than ${spec.maxItems} items.`
    }
    if (spec.itemType) {
      for (let i = 0; i < value.length; i++) {
        const itemErr = validateField(value[i], { type: spec.itemType }, `${fieldName}[${i}]`)
        if (itemErr) return itemErr
      }
    }
  }

  return null
}

/**
 * Validates an entire target object against a schema.
 */
function validateSchema(target = {}, schema = {}, { strict = true } = {}) {
  const fieldErrors = {}

  // Check for forbidden NoSQL injection operators
  if (hasMongoOperators(target)) {
    throw new AppError({
      statusCode: 400,
      code: ERROR_CODES.UNSAFE_QUERY,
      message: 'Forbidden query operator or key detected in input.',
    })
  }

  const allowedFields = new Set(Object.keys(schema))

  // In strict mode, reject unexpected fields
  if (strict) {
    for (const key of Object.keys(target)) {
      if (!allowedFields.has(key)) {
        fieldErrors[key] = `Unexpected field "${key}" is not permitted.`
      }
    }
  }

  // Validate defined schema fields
  for (const [key, spec] of Object.entries(schema)) {
    const error = validateField(target[key], spec, key)
    if (error) {
      fieldErrors[key] = error
    }
  }

  return fieldErrors
}

/**
 * Express middleware factory for validating body, query, and params.
 * 
 * @param {Object} options
 * @param {Object} [options.body] - Body schema
 * @param {Object} [options.query] - Query schema
 * @param {Object} [options.params] - URL params schema
 * @param {boolean} [options.strict=true] - Reject unexpected fields in body
 */
export function validateRequest({ body = null, query = null, params = null, strict = true } = {}) {
  return (request, _response, next) => {
    const allFieldErrors = {}

    try {
      if (body) {
        const errors = validateSchema(request.body || {}, body, { strict })
        Object.assign(allFieldErrors, errors)
      }

      if (query) {
        // Query parameters: lenient with unknown parameters unless strict is explicitly requested
        const errors = validateSchema(request.query || {}, query, { strict: false })
        Object.assign(allFieldErrors, errors)
      }

      if (params) {
        const errors = validateSchema(request.params || {}, params, { strict: false })
        Object.assign(allFieldErrors, errors)
      }
    } catch (err) {
      return next(err)
    }

    if (Object.keys(allFieldErrors).length > 0) {
      return next(
        new AppError({
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed. Please correct the highlighted fields.',
          fieldErrors: allFieldErrors,
        })
      )
    }

    next()
  }
}
