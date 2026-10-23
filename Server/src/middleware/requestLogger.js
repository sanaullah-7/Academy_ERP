import { randomUUID } from 'node:crypto'

export function requestContext(request, response, next) {
  const correlationId = request.headers['x-request-id'] || randomUUID()
  request.id = correlationId
  response.setHeader('X-Request-Id', correlationId)

  const startHr = process.hrtime.bigint()

  // Track response latency and set X-Response-Time header
  const originalWriteHead = response.writeHead
  response.writeHead = function (...args) {
    const elapsedNs = process.hrtime.bigint() - startHr
    const elapsedMs = (Number(elapsedNs / 100000n) / 10).toFixed(1)
    response.setHeader('X-Response-Time', `${elapsedMs}ms`)
    return originalWriteHead.apply(this, args)
  }

  response.on('finish', () => {
    const elapsedNs = process.hrtime.bigint() - startHr
    request.durationMs = Number(elapsedNs / 1000000n)
  })

  next()
}

