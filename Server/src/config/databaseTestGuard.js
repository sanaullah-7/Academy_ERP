export class UnsafeDatabaseError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UnsafeDatabaseError'
  }
}

export function parseUriDetails(uri) {
  if (typeof uri !== 'string' || !uri.trim()) {
    throw new UnsafeDatabaseError('MongoDB URI must be a non-empty string.')
  }

  // Handle mongodb:// and mongodb+srv:// protocols
  const normalized = uri.trim().replace(/^mongodb(?:\+srv)?:\/\//i, 'http://')
  try {
    const parsed = new URL(normalized)
    const dbName = parsed.pathname.replace(/^\//, '').split('?')[0].trim()
    return {
      hostname: parsed.hostname || '',
      port: parsed.port || '',
      dbName,
      search: parsed.search || '',
    }
  } catch (err) {
    throw new UnsafeDatabaseError(`Malformed MongoDB URI: ${err.message}`)
  }
}

export function parseDatabaseNameFromUri(uri) {
  return parseUriDetails(uri).dbName
}

const FORBIDDEN_SUBSTRINGS = ['prod', 'production', 'live', 'staging', 'uat']
const ALLOWED_TEST_DB_PATTERNS = [/_test$/i, /_testing$/i, /^tsa_academy_test$/i, /^test$/i]

export function assertSafeTestDatabase({ uri, nodeEnv = process.env.NODE_ENV }) {
  if (nodeEnv === 'production') {
    throw new UnsafeDatabaseError('Refusing to run tests when NODE_ENV is "production".')
  }

  const { dbName, hostname } = parseUriDetails(uri)

  if (!dbName) {
    throw new UnsafeDatabaseError('MongoDB URI does not specify a target database name.')
  }

  // Host verification: Ensure tests cannot connect to live production/staging hosts
  // merely because the database name ends with "_test"
  const lowerHost = hostname.toLowerCase()
  for (const forbidden of FORBIDDEN_SUBSTRINGS) {
    if (lowerHost.includes(forbidden)) {
      throw new UnsafeDatabaseError(
        `Target host "${hostname}" contains forbidden production/staging keyword "${forbidden}".`
      )
    }
  }

  // Database name verification
  const lowerDbName = dbName.toLowerCase()
  for (const forbidden of FORBIDDEN_SUBSTRINGS) {
    if (lowerDbName.includes(forbidden)) {
      throw new UnsafeDatabaseError(
        `Target database "${dbName}" contains forbidden production/staging keyword "${forbidden}".`
      )
    }
  }

  const isApproved = ALLOWED_TEST_DB_PATTERNS.some((pattern) => pattern.test(dbName))
  if (!isApproved) {
    throw new UnsafeDatabaseError(
      `Database "${dbName}" is not an approved test database name. Name must end with "_test" or be "tsa_academy_test".`
    )
  }

  return { safe: true, databaseName: dbName, hostname }
}

