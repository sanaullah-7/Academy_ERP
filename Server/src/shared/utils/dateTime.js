import { AppError } from '../errors/AppError.js'
import { ERROR_CODES } from '../../constants/errorCodes.js'

const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:?\d{2})?)?$/
const DATE_ONLY_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/

export function isValidIsoDate(value) {
  if (typeof value !== 'string' || !value.trim()) return false
  if (!ISO_8601_REGEX.test(value.trim())) return false
  const parsed = Date.parse(value)
  return !Number.isNaN(parsed)
}

export function parseIsoDate(value) {
  if (!isValidIsoDate(value)) {
    throw new AppError({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `Invalid ISO-8601 date string: "${value}".`,
    })
  }
  return new Date(value)
}

export function formatIsoDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) {
    throw new AppError({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Invalid Date object provided for formatting.',
    })
  }
  return d.toISOString()
}

export function isValidDateOnly(value) {
  if (typeof value !== 'string') return false
  if (!DATE_ONLY_REGEX.test(value.trim())) return false
  const [year, month, day] = value.trim().split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function parseDateOnly(value) {
  if (!isValidDateOnly(value)) {
    throw new AppError({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `Invalid date format (expected YYYY-MM-DD): "${value}".`,
    })
  }
  const [year, month, day] = value.trim().split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}
