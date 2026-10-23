import { AppError } from '../../shared/errors/AppError.js'
import { ERROR_CODES } from '../../constants/errorCodes.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLoginInput(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Request body must be a valid JSON object.',
    })
  }

  const { email, password } = body

  if (typeof email !== 'string' || !email.trim() || !EMAIL_REGEX.test(email.trim())) {
    throw new AppError({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'A valid email address is required.',
    })
  }

  if (typeof password !== 'string' || !password) {
    throw new AppError({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Password is required.',
    })
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  }
}

export function validateActiveBranchInput(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Request body must be a valid JSON object.',
    })
  }

  const { branchId } = body

  if (typeof branchId !== 'string' || !branchId.trim()) {
    throw new AppError({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'branchId must be a non-empty string.',
    })
  }

  return {
    branchId: branchId.trim(),
  }
}
