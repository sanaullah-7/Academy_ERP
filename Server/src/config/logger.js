const URI_CREDENTIALS = /(mongodb(?:\+srv)?:\/\/)[^\s/@]+(?::[^\s/@]*)?@/gi
const SENSITIVE_KEY = /password|secret|token|authorization|cookie|uri/i

function sanitize(value, key = '') {
  if (SENSITIVE_KEY.test(key)) return '[REDACTED]'
  if (typeof value === 'string') return value.replace(URI_CREDENTIALS, '$1[REDACTED]@')
  if (Array.isArray(value)) return value.map((item) => sanitize(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, sanitize(child, childKey)]))
  }
  return value
}

function write(level, message, context = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: sanitize(message),
    ...sanitize(context),
  }
  const output = JSON.stringify(entry)
  if (level === 'error') console.error(output)
  else console.log(output)
}

export const logger = Object.freeze({
  info: (message, context) => write('info', message, context),
  error: (message, context) => write('error', message, context),
})
