import { idempotencyService as defaultService } from '../shared/idempotency/idempotency.service.js'
import { AppError } from '../shared/errors/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

export function createIdempotencyMiddleware({
  service = defaultService,
  required = false,
} = {}) {
  return async (request, response, next) => {
    const rawKey = request.headers['idempotency-key']

    if (!rawKey) {
      if (required) {
        return next(
          new AppError({
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Idempotency-Key header is required for this operation.',
            fieldErrors: { 'Idempotency-Key': 'Header missing.' },
          })
        )
      }
      return next()
    }

    const organizationId = request.auth?.organizationId || request.organizationId || 'system'
    const userId = request.auth?.user?._id?.toString() || 'system-user'
    const requestMethod = request.method
    const requestPath = request.baseUrl
      ? `${request.baseUrl}${request.path}`
      : request.originalUrl?.split('?')[0] || request.path

    let lockResult = null
    try {
      lockResult = await service.acquireLock({
        key: rawKey,
        organizationId,
        userId,
        requestMethod,
        requestPath,
        requestBody: request.body,
      })
    } catch (err) {
      return next(err)
    }

    if (lockResult.isReplay) {
      response.setHeader('Idempotent-Replay', 'true')
      return response.status(lockResult.responseStatus).json(lockResult.responseBody)
    }

    // Attach tracking context for the active request
    request.idempotency = {
      key: rawKey,
      organizationId,
      requestMethod,
      requestPath,
      completed: false,
    }

    // Intercept response.json safely
    const originalJson = response.json.bind(response)
    response.json = function (body) {
      response.json = originalJson // restore to prevent re-interception

      const statusCode = response.statusCode || 200
      const isError = statusCode >= 400 || Boolean(body?.error)

      if (!isError) {
        request.idempotency.completed = true
        service
          .complete({
            key: rawKey,
            organizationId,
            requestMethod,
            requestPath,
            responseStatus: statusCode,
            responseBody: body,
          })
          .catch(() => {})
      } else {
        // Status 5xx, 408 (timeout), or 409 (conflict) imply uncertain execution outcome.
        // Clean 4xx client input errors (e.g. 400, 422) allow clean retry.
        const isUncertain = statusCode >= 500 || statusCode === 408 || statusCode === 409
        service
          .fail({
            key: rawKey,
            organizationId,
            requestMethod,
            requestPath,
            uncertain: isUncertain,
            error: body?.error?.message || 'Operation failed',
          })
          .catch(() => {})
      }

      return originalJson(body)
    }

    // Safety guard: If client disconnects or aborts before response finishes, mark uncertain
    response.on('close', () => {
      if (!response.writableEnded && !request.idempotency.completed) {
        service
          .fail({
            key: rawKey,
            organizationId,
            requestMethod,
            requestPath,
            uncertain: true,
            error: 'Client disconnected before response completed',
          })
          .catch(() => {})
      }
    })

    next()
  }
}
