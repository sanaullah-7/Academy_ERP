import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(crypto.scrypt)

const SCRYPT_PREFIX = '$scrypt$'
const DEFAULT_N = 16384
const DEFAULT_R = 8
const DEFAULT_P = 1
const KEY_LEN = 64
const SALT_LEN = 16

export async function hashPassword(password) {
  if (typeof password !== 'string' || !password) {
    throw new Error('Password must be a non-empty string.')
  }
  const salt = crypto.randomBytes(SALT_LEN)
  const derivedKey = await scryptAsync(password, salt, KEY_LEN, {
    N: DEFAULT_N,
    r: DEFAULT_R,
    p: DEFAULT_P,
    maxmem: 32 * 1024 * 1024,
  })
  return `${SCRYPT_PREFIX}N=${DEFAULT_N},r=${DEFAULT_R},p=${DEFAULT_P}$${salt.toString('hex')}$${derivedKey.toString('hex')}`
}

export function hashPasswordSync(password) {
  if (typeof password !== 'string' || !password) {
    throw new Error('Password must be a non-empty string.')
  }
  const salt = crypto.randomBytes(SALT_LEN)
  const derivedKey = crypto.scryptSync(password, salt, KEY_LEN, {
    N: DEFAULT_N,
    r: DEFAULT_R,
    p: DEFAULT_P,
    maxmem: 32 * 1024 * 1024,
  })
  return `${SCRYPT_PREFIX}N=${DEFAULT_N},r=${DEFAULT_R},p=${DEFAULT_P}$${salt.toString('hex')}$${derivedKey.toString('hex')}`
}

export async function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || typeof storedHash !== 'string') return false
  if (!storedHash.startsWith(SCRYPT_PREFIX)) return false

  try {
    const parts = storedHash.slice(SCRYPT_PREFIX.length).split('$')
    if (parts.length !== 3) return false

    const [paramsStr, saltHex, keyHex] = parts
    const params = {}
    for (const item of paramsStr.split(',')) {
      const [k, v] = item.split('=')
      params[k] = parseInt(v, 10)
    }

    const { N = DEFAULT_N, r = DEFAULT_R, p = DEFAULT_P } = params
    const salt = Buffer.from(saltHex, 'hex')
    const expectedKey = Buffer.from(keyHex, 'hex')

    if (salt.length !== SALT_LEN || expectedKey.length !== KEY_LEN) return false

    const actualKey = await scryptAsync(password, salt, KEY_LEN, {
      N,
      r,
      p,
      maxmem: 32 * 1024 * 1024,
    })

    return crypto.timingSafeEqual(expectedKey, actualKey)
  } catch {
    return false
  }
}

export function verifyPasswordSync(password, storedHash) {
  if (typeof password !== 'string' || typeof storedHash !== 'string') return false
  if (!storedHash.startsWith(SCRYPT_PREFIX)) return false

  try {
    const parts = storedHash.slice(SCRYPT_PREFIX.length).split('$')
    if (parts.length !== 3) return false

    const [paramsStr, saltHex, keyHex] = parts
    const params = {}
    for (const item of paramsStr.split(',')) {
      const [k, v] = item.split('=')
      params[k] = parseInt(v, 10)
    }

    const { N = DEFAULT_N, r = DEFAULT_R, p = DEFAULT_P } = params
    const salt = Buffer.from(saltHex, 'hex')
    const expectedKey = Buffer.from(keyHex, 'hex')

    if (salt.length !== SALT_LEN || expectedKey.length !== KEY_LEN) return false

    const actualKey = crypto.scryptSync(password, salt, KEY_LEN, {
      N,
      r,
      p,
      maxmem: 32 * 1024 * 1024,
    })

    return crypto.timingSafeEqual(expectedKey, actualKey)
  } catch {
    return false
  }
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function hashSessionToken(token) {
  if (typeof token !== 'string') throw new Error('Token must be a string.')
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function compareTokens(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const hashA = crypto.createHash('sha256').update(a).digest()
  const hashB = crypto.createHash('sha256').update(b).digest()
  return crypto.timingSafeEqual(hashA, hashB)
}
