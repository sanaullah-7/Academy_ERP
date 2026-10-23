export const SESSION_COOKIE_NAME = 'tsa_session'
export const CSRF_COOKIE_NAME = 'tsa_csrf'

export function parseCookies(cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== 'string') return {}
  const cookies = {}
  for (const pair of cookieHeader.split(';')) {
    const trimmed = pair.trim()
    if (!trimmed) continue
    const equalIdx = trimmed.indexOf('=')
    if (equalIdx > 0) {
      const name = trimmed.slice(0, equalIdx).trim()
      const val = trimmed.slice(equalIdx + 1).trim()
      try {
        cookies[name] = decodeURIComponent(val)
      } catch {
        cookies[name] = val
      }
    }
  }
  return cookies
}

export function getSessionCookieOptions(config = {}) {
  const isProduction = config.isProduction ?? (process.env.NODE_ENV === 'production')
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  }
}

export function getCsrfCookieOptions(config = {}) {
  const isProduction = config.isProduction ?? (process.env.NODE_ENV === 'production')
  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

export function cookieParserMiddleware(request, _response, next) {
  request.cookies = parseCookies(request.headers.cookie)
  next()
}
