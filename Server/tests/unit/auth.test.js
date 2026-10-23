import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  hashPassword,
  verifyPassword,
  hashPasswordSync,
  verifyPasswordSync,
  generateSessionToken,
  hashSessionToken,
  generateCsrfToken,
  compareTokens,
} from '../../src/shared/utils/crypto.js'
import { AuthService } from '../../src/modules/auth/auth.service.js'
import { ROLES } from '../../src/constants/roles.js'
import { USER_STATUSES } from '../../src/constants/statuses.js'
import { ERROR_CODES } from '../../src/constants/errorCodes.js'

test('password hashing uses async scrypt and salt with timing-safe verification', async () => {
  const password = 'SuperSecretPassword123!'
  const hash = await hashPassword(password)

  assert.match(hash, /^\$scrypt\$N=16384,r=8,p=1\$[0-9a-f]{32}\$[0-9a-f]{128}$/)
  assert.equal(await verifyPassword(password, hash), true)
  assert.equal(await verifyPassword('WrongPassword', hash), false)
  assert.equal(await verifyPassword('', hash), false)
  assert.equal(await verifyPassword(password, 'invalid-hash-string'), false)
})

test('sync password hashing fallback works and maintains compatibility', () => {
  const password = 'SyncSecretPassword123!'
  const syncHash = hashPasswordSync(password)

  assert.match(syncHash, /^\$scrypt\$N=16384,r=8,p=1\$[0-9a-f]{32}\$[0-9a-f]{128}$/)
  assert.equal(verifyPasswordSync(password, syncHash), true)
  assert.equal(verifyPasswordSync('Wrong', syncHash), false)
})

test('concurrent password verifications execute without blocking the event loop', async () => {
  const passwords = ['pass1', 'pass2', 'pass3', 'pass4']
  const hashes = await Promise.all(passwords.map((p) => hashPassword(p)))

  const startTime = Date.now()
  const results = await Promise.all(
    passwords.map((p, idx) => verifyPassword(p, hashes[idx]))
  )
  const duration = Date.now() - startTime

  assert.deepEqual(results, [true, true, true, true])
  assert.ok(duration < 2000, `Concurrent executions took ${duration}ms`)
})

test('session token and csrf token generation are cryptographically random and timing-safe', () => {
  const token1 = generateSessionToken()
  const token2 = generateSessionToken()
  assert.notEqual(token1, token2)
  assert.equal(token1.length, 64) // 32 bytes hex

  const hash1 = hashSessionToken(token1)
  const hash2 = hashSessionToken(token1)
  assert.equal(hash1, hash2)
  assert.notEqual(hash1, hashSessionToken(token2))

  const csrf = generateCsrfToken()
  assert.equal(csrf.length, 64)
  assert.equal(compareTokens(csrf, csrf), true)
  assert.equal(compareTokens(csrf, 'different-token'), false)
  // Length difference timing protection
  assert.equal(compareTokens(csrf, 'short'), false)
})

test('AuthService: login with valid credentials succeeds and creates secure session', async () => {
  const password = 'ValidPassword123!'
  const passwordHash = await hashPassword(password)

  const fakeUser = {
    _id: '507f1f77bcf86cd799439011',
    id: '507f1f77bcf86cd799439011',
    organizationId: 'org-tsa',
    fullName: 'Test Teacher',
    email: 'teacher@tsa.edu',
    passwordHash,
    status: USER_STATUSES.ACTIVE,
    assignments: [
      { branchId: 'branch-1', roles: [ROLES.TEACHER], status: 'active' },
    ],
  }

  let createdSessionData = null
  let updatedLastLogin = false

  const mockRepo = {
    async findUserByEmail(email, { includePassword } = {}) {
      if (email === 'teacher@tsa.edu') return fakeUser
      return null
    },
    async createSession(data) {
      createdSessionData = data
      return { _id: 'session-123', ...data }
    },
    async updateUserLastLogin(id) {
      updatedLastLogin = true
    },
  }

  const service = new AuthService({ repository: mockRepo })
  const result = await service.login({
    email: 'teacher@tsa.edu',
    password,
    ipAddress: '127.0.0.1',
    userAgent: 'NodeTest',
  })

  assert.ok(result.sessionToken)
  assert.ok(result.csrfToken)
  assert.equal(result.user.email, 'teacher@tsa.edu')
  assert.equal(result.activeBranch.id, 'branch-1')
  assert.equal(result.activeBranch.role, ROLES.TEACHER)
  assert.equal(createdSessionData.tokenHash, hashSessionToken(result.sessionToken))
  assert.equal(createdSessionData.csrfToken, result.csrfToken)
  assert.equal(updatedLastLogin, true)
})

test('AuthService: login with invalid email or password fails with generic error', async () => {
  const mockRepo = {
    async findUserByEmail() {
      return null
    },
  }
  const service = new AuthService({ repository: mockRepo })

  await assert.rejects(
    async () => {
      await service.login({
        email: 'nonexistent@tsa.edu',
        password: 'any',
      })
    },
    (err) => {
      assert.equal(err.statusCode, 401)
      assert.equal(err.code, ERROR_CODES.INVALID_CREDENTIALS)
      assert.equal(err.message, 'Invalid email or password.')
      return true
    }
  )
})

test('AuthService: disabled account is rejected with ACCOUNT_DISABLED', async () => {
  const password = 'ValidPassword123!'
  const fakeDisabledUser = {
    _id: '507f1f77bcf86cd799439012',
    email: 'disabled@tsa.edu',
    passwordHash: await hashPassword(password),
    status: USER_STATUSES.DISABLED,
    assignments: [],
  }

  const mockRepo = {
    async findUserByEmail() {
      return fakeDisabledUser
    },
  }
  const service = new AuthService({ repository: mockRepo })

  await assert.rejects(
    async () => {
      await service.login({
        email: 'disabled@tsa.edu',
        password,
      })
    },
    (err) => {
      assert.equal(err.statusCode, 401)
      assert.equal(err.code, ERROR_CODES.ACCOUNT_DISABLED)
      assert.equal(err.message, 'Account is disabled. Please contact an administrator.')
      return true
    }
  )
})

test('AuthService: logout revokes session', async () => {
  let revokedSessionId = null
  const mockRepo = {
    async revokeSession(id) {
      revokedSessionId = id
    },
  }
  const service = new AuthService({ repository: mockRepo })
  const result = await service.logout({ _id: 'session-to-revoke' })

  assert.equal(revokedSessionId, 'session-to-revoke')
  assert.equal(result.status, 'logged_out')
})
