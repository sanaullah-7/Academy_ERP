/**
 * Consistent API success response envelopes matching API_CONTRACTS.md specifications.
 */

export function successResponse(data = null, meta = null) {
  const payload = {
    data,
  }
  if (meta && typeof meta === 'object' && Object.keys(meta).length > 0) {
    payload.meta = meta
  }
  return payload
}

export function paginatedResponse(items = [], { page = 1, pageSize = 20, totalItems = 0, requestId = null } = {}) {
  const safePage = Math.max(1, Number(page) || 1)
  const safePageSize = Math.max(1, Number(pageSize) || 20)
  const safeTotal = Math.max(0, Number(totalItems) || 0)
  const totalPages = Math.ceil(safeTotal / safePageSize)

  const meta = {
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalItems: safeTotal,
      totalPages,
      hasNext: safePage * safePageSize < safeTotal,
      hasPrev: safePage > 1,
    },
  }

  if (requestId) {
    meta.requestId = requestId
  }

  return {
    data: Array.isArray(items) ? items : [],
    meta,
  }
}
