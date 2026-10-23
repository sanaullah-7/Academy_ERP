import { createHash } from 'node:crypto'
import { IdempotencyRecord as DefaultModel } from './idempotency.model.js'
import { AppError } from '../errors/AppError.js'
import { ERROR_CODES } from '../../constants/errorCodes.js'

const KEY_REGEX = /^[a-zA-Z0-9_\-.:]{1,128}$/

/**
 * Deterministically serializes an object so key ordering does not alter the hash.
 */
function canonicalStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj)
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalStringify).join(',')}]`
  }
  const keys = Object.keys(obj).sort()
  const entries = keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify(obj[k])}`)
  return `{${entries.join(',')}}`
}

function normalizePath(rawPath = '/') {
  if (typeof rawPath !== 'string') return '/'
  const pathWithoutQuery = rawPath.split('?')[0].trim()
  return pathWithoutQuery.replace(/\/+$/, '') || '/'
}

export class IdempotencyService {
  constructor({ Model = DefaultModel } = {}) {
    this.Model = Model
  }

  computeRequestHash(body) {
    const canonical = canonicalStringify(body ?? {})
    return createHash('sha256').update(canonical).digest('hex')
  }

  validateKey(key) {
    if (typeof key !== 'string' || !KEY_REGEX.test(key.trim())) {
      throw new AppError({
        statusCode: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Idempotency-Key must be an alphanumeric string between 1 and 128 characters.',
        fieldErrors: { 'Idempotency-Key': 'Invalid idempotency key format.' },
      })
    }
    return key.trim()
  }

  async acquireLock({
    key,
    organizationId,
    userId,
    requestMethod = 'POST',
    requestPath = '/',
    requestBody,
  }) {
    const validKey = this.validateKey(key)
    const method = String(requestMethod || 'POST').trim().toUpperCase()
    const path = normalizePath(requestPath)
    const requestHash = this.computeRequestHash(requestBody)

    // Check existing idempotency record scoped by organization, method, and endpoint path
    const query = this.Model.findOne({
      organizationId,
      requestMethod: method,
      requestPath: path,
      key: validKey,
    })
    const existing = typeof query?.exec === 'function' ? await query.exec() : await query

    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new AppError({
          statusCode: 409,
          code: ERROR_CODES.CONFLICT,
          message: 'Idempotency key reused with different request payload.',
        })
      }

      if (existing.status === 'pending') {
        throw new AppError({
          statusCode: 409,
          code: ERROR_CODES.CONFLICT,
          message: 'A request with this idempotency key is currently being processed.',
        })
      }

      if (existing.status === 'completed') {
        return {
          isReplay: true,
          responseStatus: existing.responseStatus || 200,
          responseBody: existing.responseBody,
        }
      }

      if (existing.status === 'failed') {
        if (existing.uncertain) {
          throw new AppError({
            statusCode: 409,
            code: ERROR_CODES.IDEMPOTENCY_CONFLICT,
            message:
              'Previous request with this idempotency key failed with an uncertain outcome. Automatic retry blocked to prevent duplicate business effects.',
          })
        }

        // Clean failure (e.g. client validation error): transition back to pending for retry
        const updateQuery = this.Model.findOneAndUpdate(
          { _id: existing._id, status: 'failed' },
          {
            status: 'pending',
            requestHash,
            failedAt: null,
            errorMessage: null,
          },
          { returnDocument: 'after' }
        )
        const updated = typeof updateQuery?.exec === 'function' ? await updateQuery.exec() : await updateQuery
        if (updated) {
          return { isReplay: false }
        }
      }
    }

    // Try to create pending record
    try {
      await this.Model.create({
        organizationId,
        requestMethod: method,
        requestPath: path,
        key: validKey,
        userId,
        requestHash,
        status: 'pending',
      })

      return { isReplay: false }
    } catch (err) {
      if (err.code === 11000) {
        // Race condition: another concurrent request just inserted this record
        throw new AppError({
          statusCode: 409,
          code: ERROR_CODES.CONFLICT,
          message: 'A request with this idempotency key is currently being processed.',
        })
      }
      throw err
    }
  }

  async complete({
    key,
    organizationId,
    requestMethod = 'POST',
    requestPath = '/',
    responseStatus,
    responseBody,
  }) {
    if (!key || !organizationId) return null
    const method = String(requestMethod || 'POST').trim().toUpperCase()
    const path = normalizePath(requestPath)

    const query = this.Model.findOneAndUpdate(
      { organizationId, requestMethod: method, requestPath: path, key },
      {
        status: 'completed',
        responseStatus,
        responseBody,
      },
      { returnDocument: 'after' }
    )
    return typeof query?.exec === 'function' ? query.exec() : query
  }

  async fail({
    key,
    organizationId,
    requestMethod = 'POST',
    requestPath = '/',
    uncertain = false,
    error = null,
  }) {
    if (!key || !organizationId) return null
    const method = String(requestMethod || 'POST').trim().toUpperCase()
    const path = normalizePath(requestPath)

    if (uncertain) {
      // NEVER delete when outcome is uncertain; record failure state to block duplicate writes
      const query = this.Model.findOneAndUpdate(
        { organizationId, requestMethod: method, requestPath: path, key, status: 'pending' },
        {
          status: 'failed',
          uncertain: true,
          errorMessage: typeof error === 'string' ? error : error?.message || 'Uncertain write outcome',
          failedAt: new Date(),
        },
        { returnDocument: 'after' }
      )
      return typeof query?.exec === 'function' ? query.exec() : query
    }

    // Clean client-side validation failure: delete pending record so client can retry safely
    const query = this.Model.deleteOne({
      organizationId,
      requestMethod: method,
      requestPath: path,
      key,
      status: 'pending',
    })
    return typeof query?.exec === 'function' ? query.exec() : query
  }
}

export const idempotencyService = new IdempotencyService()
