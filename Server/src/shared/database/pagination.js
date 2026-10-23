import { AppError } from '../errors/AppError.js'
import { ERROR_CODES } from '../../constants/errorCodes.js'

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

/**
 * Safely parses and bounds pagination parameters from request query.
 */
export function parsePagination(query = {}, {
  defaultPage = DEFAULT_PAGE,
  defaultLimit = DEFAULT_PAGE_SIZE,
  maxLimit = MAX_PAGE_SIZE,
} = {}) {
  const rawPage = query.page !== undefined ? Number.parseInt(query.page, 10) : defaultPage
  const rawLimit = (query.pageSize !== undefined ? query.pageSize : query.limit) !== undefined
    ? Number.parseInt(query.pageSize !== undefined ? query.pageSize : query.limit, 10)
    : defaultLimit

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : defaultPage
  let limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : defaultLimit

  if (limit > maxLimit) {
    limit = maxLimit
  }

  const skip = (page - 1) * limit

  return {
    page,
    limit,
    pageSize: limit,
    skip,
  }
}

/**
 * Validates and normalizes sort parameters against an explicit allowlist.
 * Guarantees a deterministic tie-breaker (_id: -1) to prevent pagination drifts.
 */
export function parseSort(query = {}, {
  allowedFields = ['createdAt', 'updatedAt'],
  defaultSort = { createdAt: -1 },
} = {}) {
  const allowedSet = new Set(allowedFields)
  const sortBy = query.sortBy ? String(query.sortBy).trim() : null

  if (sortBy && !allowedSet.has(sortBy)) {
    throw new AppError({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `Invalid sort field: "${sortBy}". Allowed fields: ${[...allowedSet].join(', ')}.`,
      fieldErrors: { sortBy: `Must be one of: ${[...allowedSet].join(', ')}.` },
    })
  }

  const effectiveField = sortBy || Object.keys(defaultSort)[0] || 'createdAt'
  const rawDirection = String(query.sortDirection || '').toLowerCase().trim()

  let direction = -1
  if (rawDirection === 'asc' || rawDirection === '1') {
    direction = 1
  } else if (rawDirection === 'desc' || rawDirection === '-1') {
    direction = -1
  } else if (!sortBy && defaultSort[effectiveField] !== undefined) {
    direction = defaultSort[effectiveField]
  }

  const sortSpec = { [effectiveField]: direction }
  if (effectiveField !== '_id') {
    sortSpec._id = -1
  }

  return sortSpec
}

/**
 * Reusable helper to execute a paginated, sorted, and projected Mongoose query.
 */
export async function paginateQuery(model, filter = {}, {
  page = DEFAULT_PAGE,
  limit = DEFAULT_PAGE_SIZE,
  sort = { createdAt: -1, _id: -1 },
  projection = null,
  lean = true,
} = {}) {
  const skip = (page - 1) * limit

  const countQuery = model.countDocuments(filter)
  let findQuery = model.find(filter)

  if (projection) {
    findQuery = findQuery.select(projection)
  }

  findQuery = findQuery.sort(sort).skip(skip).limit(limit)

  if (lean && typeof findQuery.lean === 'function') {
    findQuery = findQuery.lean()
  }

  const [totalItems, items] = await Promise.all([
    countQuery.exec ? countQuery.exec() : countQuery,
    findQuery.exec ? findQuery.exec() : findQuery,
  ])

  const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0

  return {
    items: items || [],
    pagination: {
      page,
      pageSize: limit,
      totalItems: Number(totalItems) || 0,
      totalPages,
      hasNext: page * limit < totalItems,
      hasPrev: page > 1,
    },
  }
}
