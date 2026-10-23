export class AppError extends Error {
  constructor({
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    message = 'An unexpected error occurred.',
    operational = true,
    fieldErrors = null,
    details = null,
  } = {}) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.operational = operational
    this.fieldErrors = fieldErrors
    this.details = details
  }
}
