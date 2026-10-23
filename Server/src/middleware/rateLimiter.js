import { AppError } from '../shared/errors/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 20,
  maxIp = max,
  maxAccount = Math.max(5, Math.floor(max / 2)),
  maxRecords = 5000,
} = {}) {
  const records = new Map()

  const cleanup = () => {
    const now = Date.now()
    for (const [key, data] of records.entries()) {
      if (now > data.resetTime) {
        records.delete(key)
      }
    }
  }

  // Periodic cleanup of expired records
  const interval = setInterval(cleanup, windowMs)
  if (interval.unref) interval.unref()

  function getOrUpdateRecord(key, limit, now) {
    let record = records.get(key)
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs, limit }
      records.set(key, record)
    } else {
      record.count += 1
    }
    return record
  }

  function pruneMemorySafely(now) {
    cleanup()
    if (records.size < maxRecords) return

    // Memory protection against eviction attacks:
    // Only prune low-count/non-blocked entries. Active violations (count >= limit)
    // MUST NEVER be evicted by attacker-flooded keys.
    for (const [key, data] of records.entries()) {
      if (records.size < maxRecords * 0.8) break
      const isBlocked = data.count >= data.limit && now <= data.resetTime
      if (!isBlocked) {
        records.delete(key)
      }
    }
  }

  return (request, response, next) => {
    const now = Date.now()
    pruneMemorySafely(now)

    // Proxy-aware client IP extraction (honors app.set('trust proxy'))
    const ip = (request.ip || request.socket?.remoteAddress || 'unknown').trim()
    const rawEmail = request.body?.email
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : ''

    const ipKey = `ip:${ip}`
    const accountKey = email ? `account:${email}` : null

    // Check existing active blocks first
    const existingIpRecord = records.get(ipKey)
    if (existingIpRecord && now <= existingIpRecord.resetTime && existingIpRecord.count > maxIp) {
      const retryAfter = Math.ceil((existingIpRecord.resetTime - now) / 1000)
      response.setHeader('Retry-After', retryAfter)
      response.setHeader('X-RateLimit-Limit', maxIp)
      response.setHeader('X-RateLimit-Remaining', 0)
      response.setHeader('X-RateLimit-Reset', Math.ceil(existingIpRecord.resetTime / 1000))
      return next(
        new AppError({
          statusCode: 429,
          code: ERROR_CODES.RATE_LIMITED,
          message: 'Too many requests from this IP. Please try again later.',
        })
      )
    }

    if (accountKey) {
      const existingAccountRecord = records.get(accountKey)
      if (existingAccountRecord && now <= existingAccountRecord.resetTime && existingAccountRecord.count > maxAccount) {
        const retryAfter = Math.ceil((existingAccountRecord.resetTime - now) / 1000)
        response.setHeader('Retry-After', retryAfter)
        response.setHeader('X-RateLimit-Limit', maxAccount)
        response.setHeader('X-RateLimit-Remaining', 0)
        response.setHeader('X-RateLimit-Reset', Math.ceil(existingAccountRecord.resetTime / 1000))
        return next(
          new AppError({
            statusCode: 429,
            code: ERROR_CODES.RATE_LIMITED,
            message: 'Too many login attempts for this account. Please try again later.',
          })
        )
      }
    }

    // Increment both independent counters
    const ipRecord = getOrUpdateRecord(ipKey, maxIp, now)
    const accountRecord = accountKey ? getOrUpdateRecord(accountKey, maxAccount, now) : null

    const remainingIp = Math.max(0, maxIp - ipRecord.count)
    const remainingAccount = accountRecord ? Math.max(0, maxAccount - accountRecord.count) : remainingIp
    const effectiveRemaining = Math.min(remainingIp, remainingAccount)

    response.setHeader('X-RateLimit-Limit', maxIp)
    response.setHeader('X-RateLimit-Remaining', effectiveRemaining)
    response.setHeader('X-RateLimit-Reset', Math.ceil(ipRecord.resetTime / 1000))

    if (ipRecord.count > maxIp) {
      const retryAfter = Math.ceil((ipRecord.resetTime - now) / 1000)
      response.setHeader('Retry-After', retryAfter)
      return next(
        new AppError({
          statusCode: 429,
          code: ERROR_CODES.RATE_LIMITED,
          message: 'Too many requests from this IP. Please try again later.',
        })
      )
    }

    if (accountRecord && accountRecord.count > maxAccount) {
      const retryAfter = Math.ceil((accountRecord.resetTime - now) / 1000)
      response.setHeader('Retry-After', retryAfter)
      return next(
        new AppError({
          statusCode: 429,
          code: ERROR_CODES.RATE_LIMITED,
          message: 'Too many login attempts for this account. Please try again later.',
        })
      )
    }

    next()
  }
}
