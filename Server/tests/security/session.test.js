import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from '../../src/app.js'
import { hashPasswordSync } from '../../src/shared/utils/crypto.js'
import { testConfig, silentLogger, withServer, databaseStub } from '../unit/testHelpers.js'
import { SESSION_COOKIE_NAME, CSRF_COOKIE_NAME } from '../../src/config/cookies.js'
import { ROLES } from '../../src/constants/roles.js'
import { USER_STATUSES } from '../../src/constants/statuses.js'
import { AuthService } from '../../src/modules/auth/auth.service.js'
import { AuthController } from '../../src/modules/auth/auth.controller.js'
import { createAuthRouter } from '../../src/modules/auth/auth.routes.js'
import { createAuthenticateMiddleware } from '../../src/middleware/authenticate.js'
import { createRateLimiter } from '../../src/middleware/rateLimiter.js'
import { createBranchRouter } from '../../src/modules/branches/branch.routes.js'
import { createApiRouter } from '../../src/routes/index.js'

function buildTestAuthHarness({
  rateLimiter = createRateLimiter({ windowMs: 2000, maxIp: 5, maxAccount: 3 }),
} = {}) {
  const users = new Map()
  const sessions = new Map()

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    id: '507f1f77bcf86cd799439011',
    organizationId: 'org-tsa',
    fullName: 'Test Receptionist',
    email: 'receptionist@tsa.edu',
    passwordHash: hashPasswordSync('SecretPass123!'),
    status: USER_STATUSES.ACTIVE,
    assignments: [
      { branchId: 'branch-1', roles: [ROLES.RECEPTIONIST], status: 'active' },
      { branchId: 'branch-2', roles: [ROLES.TEACHER], status: 'active' },
    ],
  }
  users.set(mockUser.email, mockUser)
  users.set(mockUser.id, mockUser)

  const repo = {
    async findUserByEmail(email) {
      return users.get(email) || null
    },
    async findUserById(id) {
      return users.get(id?.toString()) || null
    },
    async updateUserLastLogin(id) {
      const u = users.get(id?.toString())
      if (u) u.lastLoginAt = new Date()
    },
    async createSession(data) {
      const id = 'sess-' + Math.random().toString(36).slice(2)
      const session = { _id: id, id, ...data }
      sessions.set(data.tokenHash, session)
      sessions.set(id, session)
      return session
    },
    async findSessionByTokenHash(tokenHash) {
      return sessions.get(tokenHash) || null
    },
    async updateSessionActiveBranch(sessionId, branchId) {
      const s = sessions.get(sessionId)
      if (s) s.activeBranchId = branchId
      return s
    },
    async revokeSession(sessionId) {
      const s = sessions.get(sessionId)
      if (s) s.revokedAt = new Date()
      return s
    },
    async revokeUserSessions(userId) {
      for (const s of sessions.values()) {
        if (s.userId === userId) s.revokedAt = new Date()
      }
    },
  }

  const authService = new AuthService({ repository: repo })
  const authController = new AuthController({ service: authService, config: testConfig })
  const authenticateMiddleware = createAuthenticateMiddleware({ repository: repo })

  const authRouter = createAuthRouter({
    controller: authController,
    authenticate: authenticateMiddleware,
    rateLimiter,
  })

  const apiRouter = createApiRouter({
    database: databaseStub(),
    authRouter,
    branchRouter: createBranchRouter({ authenticate: authenticateMiddleware }),
  })

  const app = createApp({
    config: testConfig,
    database: databaseStub(),
    logger: silentLogger,
    apiRouter,
  })

  return { app, users, sessions, repo, authRouter }
}

test('Auth API: full login, session lookup, active-branch switch and logout flow', async () => {
  const { app } = buildTestAuthHarness()

  await withServer(app, async (baseUrl) => {
    // 1. Attempt login with wrong password -> 401
    const badLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@tsa.edu', password: 'Wrong' }),
    })
    assert.equal(badLoginRes.status, 401)
    const badLoginBody = await badLoginRes.json()
    assert.equal(badLoginBody.error.code, 'INVALID_CREDENTIALS')

    // 2. Login with correct credentials -> 200 with cookies & safe user response
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@tsa.edu', password: 'SecretPass123!' }),
    })
    assert.equal(loginRes.status, 200)
    const loginBody = await loginRes.json()

    assert.ok(loginBody.data.user)
    assert.equal(loginBody.data.user.email, 'receptionist@tsa.edu')
    assert.equal(loginBody.data.user.passwordHash, undefined) // Never leaks password hash
    assert.equal(loginBody.data.activeBranch.id, 'branch-1')
    assert.equal(loginBody.data.activeBranch.role, ROLES.RECEPTIONIST)
    assert.ok(loginBody.data.csrfToken)

    const cookieHeader = loginRes.headers.get('set-cookie')
    assert.ok(cookieHeader)
    assert.match(cookieHeader, new RegExp(SESSION_COOKIE_NAME))
    assert.match(cookieHeader, /HttpOnly/i)

    // Extract cookies for subsequent requests
    const sessionCookie = cookieHeader
      .split(',')
      .map((c) => c.trim().split(';')[0])
      .join('; ')

    const csrfToken = loginBody.data.csrfToken

    // 3. GET current session -> 200
    const sessionRes = await fetch(`${baseUrl}/api/v1/auth/session`, {
      headers: { cookie: sessionCookie },
    })
    assert.equal(sessionRes.status, 200)
    const sessionBody = await sessionRes.json()
    assert.equal(sessionBody.data.user.email, 'receptionist@tsa.edu')
    assert.equal(sessionBody.data.activeBranch.id, 'branch-1')
    assert.ok(sessionBody.data.permissions.includes('admissions.view'))

    // 4. CSRF protection: PATCH active-branch without CSRF token -> 403 CSRF_DETECTED
    const noCsrfRes = await fetch(`${baseUrl}/api/v1/auth/active-branch`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        cookie: sessionCookie,
      },
      body: JSON.stringify({ branchId: 'branch-2' }),
    })
    assert.equal(noCsrfRes.status, 403)
    const noCsrfBody = await noCsrfRes.json()
    assert.equal(noCsrfBody.error.code, 'CSRF_DETECTED')

    // 5. Query string CSRF token must be REJECTED (hardening against query token leakage)
    const queryCsrfRes = await fetch(`${baseUrl}/api/v1/auth/active-branch?_csrf=${csrfToken}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        cookie: sessionCookie,
      },
      body: JSON.stringify({ branchId: 'branch-2' }),
    })
    assert.equal(queryCsrfRes.status, 403)
    const queryCsrfBody = await queryCsrfRes.json()
    assert.equal(queryCsrfBody.error.code, 'CSRF_DETECTED')

    // 6. PATCH active-branch with valid CSRF token in header -> 200 (Switches to Branch 2 -> Teacher)
    const switchRes = await fetch(`${baseUrl}/api/v1/auth/active-branch`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        cookie: sessionCookie,
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify({ branchId: 'branch-2' }),
    })
    assert.equal(switchRes.status, 200)
    const switchBody = await switchRes.json()
    assert.equal(switchBody.data.activeBranch.id, 'branch-2')
    assert.equal(switchBody.data.activeBranch.role, ROLES.TEACHER)
    assert.equal(switchBody.data.permissions.length, 0) // Teacher has 0 module permissions

    // 7. DELETE /auth/session (Logout) with CSRF -> 200 and cookies cleared
    const logoutRes = await fetch(`${baseUrl}/api/v1/auth/session`, {
      method: 'DELETE',
      headers: {
        cookie: sessionCookie,
        'x-csrf-token': csrfToken,
      },
    })
    assert.equal(logoutRes.status, 200)
    const logoutBody = await logoutRes.json()
    assert.equal(logoutBody.data.status, 'logged_out')

    // 8. Reusing session after logout -> 401 SESSION_REVOKED
    const postLogoutRes = await fetch(`${baseUrl}/api/v1/auth/session`, {
      headers: { cookie: sessionCookie },
    })
    assert.equal(postLogoutRes.status, 401)
    const postLogoutBody = await postLogoutRes.json()
    assert.equal(postLogoutBody.error.code, 'SESSION_REVOKED')
  })
})

test('Session Security: missing or expired session is denied', async () => {
  const { app } = buildTestAuthHarness()

  await withServer(app, async (baseUrl) => {
    // Missing session cookie
    const missingRes = await fetch(`${baseUrl}/api/v1/auth/session`)
    assert.equal(missingRes.status, 401)
    const missingBody = await missingRes.json()
    assert.equal(missingBody.error.code, 'UNAUTHENTICATED')

    // Fake / invalid session cookie
    const fakeRes = await fetch(`${baseUrl}/api/v1/auth/session`, {
      headers: { cookie: `${SESSION_COOKIE_NAME}=nonexistent-token` },
    })
    assert.equal(fakeRes.status, 401)
    const fakeBody = await fakeRes.json()
    assert.equal(fakeBody.error.code, 'SESSION_REVOKED')

    // Bearer token alone without session cookie is rejected (cookie is authoritative)
    const bearerRes = await fetch(`${baseUrl}/api/v1/auth/session`, {
      headers: { authorization: 'Bearer some-arbitrary-token' },
    })
    assert.equal(bearerRes.status, 401)
    const bearerBody = await bearerRes.json()
    assert.equal(bearerBody.error.code, 'UNAUTHENTICATED')
  })
})

test('CORS and Preflight: unauthorized origins are blocked and credentials enforced', async () => {
  const { app } = buildTestAuthHarness()

  await withServer(app, async (baseUrl) => {
    // 1. Authorized preflight OPTIONS request
    const validPreflight = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'POST',
      },
    })
    assert.equal(validPreflight.status, 204)
    assert.equal(validPreflight.headers.get('access-control-allow-origin'), 'http://localhost:5173')
    assert.equal(validPreflight.headers.get('access-control-allow-credentials'), 'true')

    // 2. Unauthorized preflight from unapproved origin is rejected with 403
    const badPreflight = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'OPTIONS',
      headers: {
        origin: 'http://malicious-site.com',
        'access-control-request-method': 'POST',
      },
    })
    assert.equal(badPreflight.status, 403)
  })
})

test('Branch creation pause is rejected on POST /api/v1/branches', async () => {
  const { app } = buildTestAuthHarness()

  await withServer(app, async (baseUrl) => {
    // Login to get valid session and csrf
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@tsa.edu', password: 'SecretPass123!' }),
    })
    const loginBody = await loginRes.json()
    const cookie = loginRes.headers.get('set-cookie')
      .split(',')
      .map((c) => c.trim().split(';')[0])
      .join('; ')

    const createBranchRes = await fetch(`${baseUrl}/api/v1/branches`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie,
        'x-csrf-token': loginBody.data.csrfToken,
      },
      body: JSON.stringify({ name: 'New Branch', code: 'NEW' }),
    })

    assert.equal(createBranchRes.status, 403)
    const body = await createBranchRes.json()
    assert.equal(body.error.code, 'BRANCH_CREATION_PAUSED')
    assert.equal(body.error.message, 'Branch creation is currently paused by policy.')
  })
})

test('Rate Limiter: changing submitted email cannot bypass IP-level rate limit', async () => {
  const { app } = buildTestAuthHarness({
    rateLimiter: createRateLimiter({ windowMs: 2000, maxIp: 4, maxAccount: 10 }),
  })

  await withServer(app, async (baseUrl) => {
    // Attacker submits different emails on each attempt from the same IP
    for (let i = 1; i <= 4; i++) {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: `rotating_user_${i}@tsa.edu`, password: 'Wrong' }),
      })
      assert.equal(res.status, 401)
    }

    // 5th attempt with yet another new email must STILL be blocked by IP-level limit
    const blockedRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'rotating_user_new@tsa.edu', password: 'Wrong' }),
    })

    assert.equal(blockedRes.status, 429)
    const body = await blockedRes.json()
    assert.equal(body.error.code, 'RATE_LIMITED')
    assert.match(body.error.message, /Too many requests from this IP/)
  })
})

test('Rate Limiter: account-level rate limit protects individual user against distributed attacks', async () => {
  const { app } = buildTestAuthHarness({
    rateLimiter: createRateLimiter({ windowMs: 2000, maxIp: 20, maxAccount: 3 }),
  })

  await withServer(app, async (baseUrl) => {
    const targetEmail = 'targeted_victim@tsa.edu'

    // 3 attempts targeting this specific account
    for (let i = 0; i < 3; i++) {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: 'Wrong' }),
      })
      assert.equal(res.status, 401)
    }

    // 4th attempt targeting the same account triggers account-level rate limit
    const accountBlockedRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, password: 'Wrong' }),
    })

    assert.equal(accountBlockedRes.status, 429)
    const body = await accountBlockedRes.json()
    assert.equal(body.error.code, 'RATE_LIMITED')
    assert.match(body.error.message, /Too many login attempts for this account/)
  })
})

test('Rate Limiter: active rate-limit blocks cannot be evicted by flooding dummy keys', () => {
  // Test unit limiter with very small capacity (5 records) and maxIp = 2
  const limiter = createRateLimiter({ windowMs: 5000, maxIp: 2, maxRecords: 5 })

  const attackerReq = { ip: '198.51.100.1', body: { email: 'attacker@tsa.edu' } }
  let blockedStatus = null
  let blockedError = null

  const mockRes = {
    setHeader() {},
  }

  // Exhaust attacker IP limit (2 attempts)
  limiter(attackerReq, mockRes, () => {})
  limiter(attackerReq, mockRes, () => {})

  // 3rd attempt is blocked
  limiter(attackerReq, mockRes, (err) => {
    blockedError = err
  })
  assert.ok(blockedError)
  assert.equal(blockedError.statusCode, 429)

  // Now flood the limiter with 30 dummy requests to trigger capacity pruning
  for (let i = 0; i < 30; i++) {
    const dummyReq = { ip: `10.0.0.${i}`, body: { email: `dummy_${i}@tsa.edu` } }
    limiter(dummyReq, mockRes, () => {})
  }

  // Attacker IP must STILL be blocked (active block was NOT evicted)
  let postFloodError = null
  limiter(attackerReq, mockRes, (err) => {
    postFloodError = err
  })
  assert.ok(postFloodError, 'Active rate-limit block must not be evicted by flood of dummy keys')
  assert.equal(postFloodError.statusCode, 429)
})
