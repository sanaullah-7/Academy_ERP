import dotenv from 'dotenv'

const ENVIRONMENTS = new Set(['development', 'test', 'production'])
const BODY_LIMIT_PATTERN = /^\d+(?:b|kb|mb)$/i

function readInteger(source, name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = source[name]
  if (raw === undefined || raw === '') return fallback
  const value = Number(raw)
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`)
  }
  return value
}

function readTrustProxy(value) {
  if (value === undefined || value === '' || value === 'false') return false
  if (value === 'true') return true
  if (/^\d+$/.test(value)) return Number(value)
  throw new Error('TRUST_PROXY must be true, false, or a non-negative hop count.')
}

export function loadEnvFile({ path } = {}) {
  return dotenv.config(path ? { path, override: false } : { override: false })
}

export function createConfig(source = process.env) {
  const nodeEnv = source.NODE_ENV || 'development'
  if (!ENVIRONMENTS.has(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production.')
  }

  const mongoUri = String(source.MONGODB_URI || '').trim()
  if (!mongoUri) throw new Error('MONGODB_URI is required.')
  if (!/^mongodb(?:\+srv)?:\/\//i.test(mongoUri)) {
    throw new Error('MONGODB_URI must be a valid MongoDB connection URI.')
  }

  const jsonBodyLimit = source.JSON_BODY_LIMIT || '100kb'
  if (!BODY_LIMIT_PATTERN.test(jsonBodyLimit)) {
    throw new Error('JSON_BODY_LIMIT must use b, kb, or mb units, for example 100kb.')
  }

  const minPoolSize = readInteger(source, 'MONGODB_MIN_POOL_SIZE', 0, { max: 100 })
  const maxPoolSize = readInteger(source, 'MONGODB_MAX_POOL_SIZE', 10, { min: 1, max: 100 })
  if (minPoolSize > maxPoolSize) {
    throw new Error('MONGODB_MIN_POOL_SIZE cannot exceed MONGODB_MAX_POOL_SIZE.')
  }

  return Object.freeze({
    nodeEnv,
    isProduction: nodeEnv === 'production',
    port: readInteger(source, 'PORT', 5000, { min: 1, max: 65535 }),
    trustProxy: readTrustProxy(source.TRUST_PROXY),
    jsonBodyLimit: jsonBodyLimit.toLowerCase(),
    mongo: Object.freeze({
      uri: mongoUri,
      minPoolSize,
      maxPoolSize,
      serverSelectionTimeoutMS: readInteger(source, 'MONGODB_SERVER_SELECTION_TIMEOUT_MS', 5000, { min: 100, max: 120000 }),
      connectTimeoutMS: readInteger(source, 'MONGODB_CONNECT_TIMEOUT_MS', 10000, { min: 100, max: 120000 }),
      socketTimeoutMS: readInteger(source, 'MONGODB_SOCKET_TIMEOUT_MS', 45000, { min: 1000, max: 300000 }),
    }),
  })
}

let cachedConfig

export function getConfig() {
  if (!cachedConfig) {
    loadEnvFile()
    cachedConfig = createConfig()
  }
  return cachedConfig
}
