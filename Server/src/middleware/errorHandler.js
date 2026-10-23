import { AppError } from '../shared/errors/AppError.js'
import { errorResponse } from '../shared/errors/errorResponse.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

function normalizeError(error) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return new AppError({ statusCode: 400, code: 'INVALID_JSON', message: 'Request body contains invalid JSON.' })
  }
  if (error?.status === 413 || error?.type === 'entity.too.large') {
    return new AppError({ statusCode: 413, code: 'BODY_TOO_LARGE', message: 'Request body exceeds the allowed size.' })
  }
  // Mongoose duplicate key error (E11000)
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'field'
    return new AppError({
      statusCode: 409,
      code: ERROR_CODES.CONFLICT,
      message: `A record with this unique ${field} already exists.`,
    })
  }
  // Mongoose validation error
  if (error?.name === 'ValidationError' && error.errors) {
    const fieldErrors = {}
    for (const [key, val] of Object.entries(error.errors)) {
      fieldErrors[key] = val.message
    }
    return new AppError({
      statusCode: 422,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed.',
      fieldErrors,
    })
  }
  // Mongoose CastError (e.g. invalid ObjectId)
  if (error?.name === 'CastError') {
    return new AppError({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `Invalid format for field "${error.path}".`,
      fieldErrors: { [error.path]: 'Invalid identifier format.' },
    })
  }

  if (error instanceof AppError) return error
  return new AppError({ operational: false })
}

export function createErrorHandler({ logger, isProduction }) {
  return (error, request, response, _next) => {
    const normalized = normalizeError(error)
    const statusCode = normalized.statusCode >= 400 && normalized.statusCode <= 599 ? normalized.statusCode : 500

    if (!normalized.operational) {
      logger.error('Unexpected request failure', {
        requestId: request.id,
        method: request.method,
        path: request.path,
        ...(isProduction ? {} : { error: error.message }),
      })
    }

    response.status(statusCode).json(errorResponse({
      code: normalized.code,
      message: normalized.message,
      fieldErrors: normalized.fieldErrors,
      details: normalized.details,
      requestId: request.id,
    }))
  }
}

