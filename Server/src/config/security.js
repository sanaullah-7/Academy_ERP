const SECURITY_HEADERS = Object.freeze({
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
})

export function securityHeaders(_request, response, next) {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.setHeader(name, value)
  next()
}
