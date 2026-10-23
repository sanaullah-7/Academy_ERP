const DEFAULT_ALLOWED_ORIGINS = Object.freeze([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

export function createCorsMiddleware({
  allowedOrigins = DEFAULT_ALLOWED_ORIGINS,
} = {}) {
  const originSet = new Set(allowedOrigins)

  return (request, response, next) => {
    const origin = request.headers.origin

    if (origin) {
      if (originSet.has(origin)) {
        response.setHeader('Access-Control-Allow-Origin', origin)
        response.setHeader('Access-Control-Allow-Credentials', 'true')
        response.setHeader(
          'Access-Control-Allow-Methods',
          'GET, POST, PATCH, PUT, DELETE, OPTIONS'
        )
        response.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, X-Requested-With, X-CSRF-Token, X-Request-ID, X-Branch-ID'
        )
        response.setHeader('Access-Control-Max-Age', '86400')
        response.setHeader('Vary', 'Origin')
      } else if (request.method === 'OPTIONS') {
        // Reject preflight from unapproved origin
        return response.status(403).end()
      }
    }

    if (request.method === 'OPTIONS') {
      return response.status(204).end()
    }

    next()
  }
}
