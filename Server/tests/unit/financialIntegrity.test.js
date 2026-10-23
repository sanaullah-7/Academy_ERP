import assert from 'node:assert/strict'
import { test } from 'node:test'
import { IdempotencyService } from '../../src/shared/idempotency/idempotency.service.js'
import { createIdempotencyMiddleware } from '../../src/middleware/idempotency.js'
import { withTransaction } from '../../src/shared/database/transaction.js'
import { tenantScope } from '../../src/middleware/tenantScope.js'
import { AppError } from '../../src/shared/errors/AppError.js'

test('Financial Integrity: Idempotency Service concurrency, replay and mismatch handling', async () => {
  const store = new Map()

  const MockModel = {
    async findOne({ organizationId, requestMethod, requestPath, key }) {
      return store.get(`${organizationId}:${requestMethod}:${requestPath}:${key}`) || null
    },
    async create(doc) {
      const idKey = `${doc.organizationId}:${doc.requestMethod}:${doc.requestPath}:${doc.key}`
      if (store.has(idKey)) {
        const err = new Error('Duplicate key')
        err.code = 11000
        throw err
      }
      const saved = { ...doc, _id: 'rec-1' }
      store.set(idKey, saved)
      return saved
    },
    async findOneAndUpdate(filter, update) {
      let foundKey = null
      let existing = null

      if (filter._id) {
        for (const [k, v] of store.entries()) {
          if (v._id === filter._id) {
            foundKey = k
            existing = v
            break
          }
        }
      } else {
        foundKey = `${filter.organizationId}:${filter.requestMethod}:${filter.requestPath}:${filter.key}`
        existing = store.get(foundKey)
      }

      if (!existing) return null
      const updated = { ...existing, ...update }
      store.set(foundKey, updated)
      return updated
    },
    async deleteOne(filter) {
      const idKey = `${filter.organizationId}:${filter.requestMethod}:${filter.requestPath}:${filter.key}`
      store.delete(idKey)
      return { deletedCount: 1 }
    },
  }

  const service = new IdempotencyService({ Model: MockModel })

  // 1. Initial lock acquisition succeeds
  const lock1 = await service.acquireLock({
    key: 'tx-pay-001',
    organizationId: 'org-tsa',
    userId: 'user-admin',
    requestMethod: 'POST',
    requestPath: '/api/v1/payments',
    requestBody: { amount: 5000, studentId: 'stu-1' },
  })

  assert.equal(lock1.isReplay, false)

  // 2. Concurrent call with same key while pending throws 409
  await assert.rejects(
    async () => {
      await service.acquireLock({
        key: 'tx-pay-001',
        organizationId: 'org-tsa',
        userId: 'user-admin',
        requestMethod: 'POST',
        requestPath: '/api/v1/payments',
        requestBody: { amount: 5000, studentId: 'stu-1' },
      })
    },
    (err) => err instanceof AppError && err.statusCode === 409 && err.message.includes('currently being processed')
  )

  // 3. Mark completed
  await service.complete({
    key: 'tx-pay-001',
    organizationId: 'org-tsa',
    requestMethod: 'POST',
    requestPath: '/api/v1/payments',
    responseStatus: 201,
    responseBody: { paymentId: 'pay-999', status: 'collected' },
  })

  // 4. Repeated request with identical payload returns cached replay
  const replay = await service.acquireLock({
    key: 'tx-pay-001',
    organizationId: 'org-tsa',
    userId: 'user-admin',
    requestMethod: 'POST',
    requestPath: '/api/v1/payments',
    requestBody: { amount: 5000, studentId: 'stu-1' },
  })

  assert.equal(replay.isReplay, true)
  assert.equal(replay.responseStatus, 201)
  assert.equal(replay.responseBody.paymentId, 'pay-999')

  // 5. Reusing key with altered payload throws 409 Conflict
  await assert.rejects(
    async () => {
      await service.acquireLock({
        key: 'tx-pay-001',
        organizationId: 'org-tsa',
        userId: 'user-admin',
        requestMethod: 'POST',
        requestPath: '/api/v1/payments',
        requestBody: { amount: 99999, studentId: 'stu-altered' },
      })
    },
    (err) => err instanceof AppError && err.statusCode === 409 && err.message.includes('different request payload')
  )
})

test('Financial Integrity: Prevents cross-endpoint key collisions and handles uncertain failures', async () => {
  const store = new Map()

  const MockModel = {
    async findOne({ organizationId, requestMethod, requestPath, key }) {
      return store.get(`${organizationId}:${requestMethod}:${requestPath}:${key}`) || null
    },
    async create(doc) {
      const idKey = `${doc.organizationId}:${doc.requestMethod}:${doc.requestPath}:${doc.key}`
      if (store.has(idKey)) {
        const err = new Error('Duplicate key')
        err.code = 11000
        throw err
      }
      const saved = { ...doc, _id: `rec-${store.size + 1}` }
      store.set(idKey, saved)
      return saved
    },
    async findOneAndUpdate(filter, update) {
      const foundKey = `${filter.organizationId}:${filter.requestMethod}:${filter.requestPath}:${filter.key}`
      const existing = store.get(foundKey)
      if (!existing) return null
      const updated = { ...existing, ...update }
      store.set(foundKey, updated)
      return updated
    },
    async deleteOne(filter) {
      const idKey = `${filter.organizationId}:${filter.requestMethod}:${filter.requestPath}:${filter.key}`
      store.delete(idKey)
      return { deletedCount: 1 }
    },
  }

  const service = new IdempotencyService({ Model: MockModel })

  // 1. Cross-endpoint isolation: Same key 'TX-GLOBAL-01' on different endpoints does NOT collide
  const admissionLock = await service.acquireLock({
    key: 'TX-GLOBAL-01',
    organizationId: 'org-tsa',
    userId: 'user-1',
    requestMethod: 'POST',
    requestPath: '/api/v1/admissions',
    requestBody: { applicantName: 'Ali' },
  })
  assert.equal(admissionLock.isReplay, false)

  const feeLock = await service.acquireLock({
    key: 'TX-GLOBAL-01',
    organizationId: 'org-tsa',
    userId: 'user-1',
    requestMethod: 'POST',
    requestPath: '/api/v1/fees',
    requestBody: { feeAmount: 10000 },
  })
  assert.equal(feeLock.isReplay, false, 'Cross-endpoint key collision must not occur')

  // 2. Uncertain failure: Never automatically deleted when write outcome is uncertain
  await service.fail({
    key: 'TX-GLOBAL-01',
    organizationId: 'org-tsa',
    requestMethod: 'POST',
    requestPath: '/api/v1/fees',
    uncertain: true,
    error: 'Database commit timed out',
  })

  // Subsequent retry with the same key must be rejected to prevent duplicate writes
  await assert.rejects(
    async () => {
      await service.acquireLock({
        key: 'TX-GLOBAL-01',
        organizationId: 'org-tsa',
        userId: 'user-1',
        requestMethod: 'POST',
        requestPath: '/api/v1/fees',
        requestBody: { feeAmount: 10000 },
      })
    },
    (err) =>
      err instanceof AppError &&
      err.statusCode === 409 &&
      err.code === 'IDEMPOTENCY_CONFLICT' &&
      err.message.includes('uncertain outcome')
  )
})

test('Financial Integrity: Idempotency middleware enforces required header, replay and client abort', async () => {
  const service = {
    async acquireLock() {
      return { isReplay: false }
    },
    async complete() {},
    async fail() {},
  }

  // 1. Required header missing
  const strictMw = createIdempotencyMiddleware({ service, required: true })
  let missingErr = null
  await strictMw({ headers: {} }, {}, (err) => {
    missingErr = err
  })
  assert.ok(missingErr)
  assert.equal(missingErr.statusCode, 400)
  assert.equal(missingErr.code, 'VALIDATION_ERROR')

  // 2. Replay interception
  let replayStatus = null
  let replayBody = null
  let replayHeaders = {}

  const replayService = {
    async acquireLock() {
      return {
        isReplay: true,
        responseStatus: 200,
        responseBody: { cached: true },
      }
    },
  }

  const replayMw = createIdempotencyMiddleware({ service: replayService })
  const mockRes = {
    setHeader(k, v) {
      replayHeaders[k] = v
    },
    status(s) {
      replayStatus = s
      return this
    },
    json(b) {
      replayBody = b
    },
    on() {},
  }

  await replayMw(
    { headers: { 'idempotency-key': 'valid-key-123' }, auth: { organizationId: 'org-1' }, method: 'POST', path: '/pay' },
    mockRes,
    () => {}
  )
  assert.equal(replayStatus, 200)
  assert.equal(replayBody.cached, true)
  assert.equal(replayHeaders['Idempotent-Replay'], 'true')

  // 3. Client connection drop triggers uncertain failure
  let failedUncertain = null
  const trackingService = {
    async acquireLock() {
      return { isReplay: false }
    },
    async complete() {},
    async fail({ uncertain }) {
      failedUncertain = uncertain
    },
  }

  let closeCallback = null
  const mockAbortRes = {
    writableEnded: false,
    on(event, cb) {
      if (event === 'close') closeCallback = cb
    },
    json() {},
  }

  const abortMw = createIdempotencyMiddleware({ service: trackingService })
  const mockAbortReq = {
    headers: { 'idempotency-key': 'abort-key' },
    auth: { organizationId: 'org-1' },
    method: 'POST',
    path: '/pay',
  }

  await abortMw(mockAbortReq, mockAbortRes, () => {})
  // Simulate client connection abort
  closeCallback()
  assert.equal(failedUncertain, true, 'Aborted client connection must be marked uncertain')
})

test('Financial Integrity: Transaction fail-closed on standalone MongoDB and session cleanup', async () => {
  // 1. Standalone MongoDB without replica set fails closed (throws TRANSACTION_FAILED)
  let opExecuted = false
  const standaloneConnection = {
    async startSession() {
      const err = new Error('Transaction numbers are only allowed on a replica set member or mongos')
      err.code = 20
      throw err
    },
  }

  await assert.rejects(
    async () => {
      await withTransaction(standaloneConnection, async () => {
        opExecuted = true
      })
    },
    (err) =>
      err instanceof AppError &&
      err.statusCode === 500 &&
      err.code === 'TRANSACTION_FAILED' &&
      err.message.includes('replica set is required')
  )
  assert.equal(opExecuted, false, 'Operation must NEVER be executed when transactions are unsupported')

  // 2. Normal error inside operation aborts transaction and ends session without retrying
  let sessionEnded = false
  let transactionAborted = false
  let attempts = 0

  const normalErrorConnection = {
    async startSession() {
      return {
        inTransaction() {
          return true
        },
        startTransaction() {},
        async commitTransaction() {},
        async abortTransaction() {
          transactionAborted = true
        },
        async endSession() {
          sessionEnded = true
        },
      }
    },
  }

  await assert.rejects(
    async () => {
      await withTransaction(normalErrorConnection, async () => {
        attempts += 1
        throw new AppError({ statusCode: 400, message: 'Invalid business input' })
      })
    },
    (err) => err.statusCode === 400 && err.message.includes('Invalid business input')
  )

  assert.equal(attempts, 1, 'Non-transient error must not be retried')
  assert.equal(transactionAborted, true, 'Transaction must be aborted on failure')
  assert.equal(sessionEnded, true, 'Session must always be ended')

  // 3. Transient error during operation retries fresh transaction
  let transientAttempts = 0
  const transientConnection = {
    async startSession() {
      return {
        inTransaction() {
          return true
        },
        startTransaction() {},
        async commitTransaction() {},
        async abortTransaction() {},
        async endSession() {},
      }
    },
  }

  const result = await withTransaction(
    transientConnection,
    async () => {
      transientAttempts += 1
      if (transientAttempts === 1) {
        const transientErr = new Error('WriteConflict')
        transientErr.hasErrorLabel = (label) => label === 'TransientTransactionError'
        throw transientErr
      }
      return { success: true }
    },
    { maxRetries: 3 }
  )

  assert.equal(transientAttempts, 2)
  assert.equal(result.success, true)

  // 4. UnknownTransactionCommitResult retries commitTransaction on the SAME session without re-executing operation
  let opRunCount = 0
  let commitAttempts = 0

  const commitRetryConnection = {
    async startSession() {
      return {
        inTransaction() {
          return true
        },
        startTransaction() {},
        async commitTransaction() {
          commitAttempts += 1
          if (commitAttempts === 1) {
            const commitErr = new Error('Socket timeout waiting for commit')
            commitErr.hasErrorLabel = (label) => label === 'UnknownTransactionCommitResult'
            throw commitErr
          }
        },
        async abortTransaction() {},
        async endSession() {},
      }
    },
  }

  const commitOutcome = await withTransaction(
    commitRetryConnection,
    async () => {
      opRunCount += 1
      return { committedData: 100 }
    },
    { maxCommitRetries: 3 }
  )

  assert.equal(opRunCount, 1, 'Operation function must NOT be re-executed when commit retries')
  assert.equal(commitAttempts, 2, 'Commit must be retried on the same session')
  assert.equal(commitOutcome.committedData, 100)

  // 5. Uncertain commit outcome throws TRANSACTION_UNCERTAIN without blind re-run
  let uncertainOpCount = 0
  const uncertainConnection = {
    async startSession() {
      return {
        inTransaction() {
          return true
        },
        startTransaction() {},
        async commitTransaction() {
          const commitErr = new Error('Network dropped during commit')
          commitErr.hasErrorLabel = (label) => label === 'UnknownTransactionCommitResult'
          throw commitErr
        },
        async abortTransaction() {},
        async endSession() {},
      }
    },
  }

  await assert.rejects(
    async () => {
      await withTransaction(
        uncertainConnection,
        async () => {
          uncertainOpCount += 1
        },
        { maxCommitRetries: 2 }
      )
    },
    (err) =>
      err instanceof AppError &&
      err.code === 'TRANSACTION_UNCERTAIN' &&
      err.message.includes('commit result is uncertain')
  )
  assert.equal(uncertainOpCount, 1, 'Operation function must not be re-run on uncertain commit')
})

test('Tenant Scope: enforces organizationId and binds scopedQuery builder', () => {
  // 1. Missing organizationId fails with 401
  let unauthErr = null
  tenantScope({ auth: {} }, {}, (err) => {
    unauthErr = err
  })
  assert.ok(unauthErr)
  assert.equal(unauthErr.statusCode, 401)
  assert.equal(unauthErr.code, 'UNAUTHENTICATED')

  // 2. Bound scoped queries
  const req = {
    auth: {
      organizationId: 'org-tsa-main',
      activeBranch: { id: 'branch-south' },
    },
  }

  let passed = false
  tenantScope(req, {}, () => {
    passed = true
  })
  assert.equal(passed, true)

  const tenantFilter = req.scopedQuery({ status: 'active' })
  assert.deepEqual(tenantFilter, { status: 'active', organizationId: 'org-tsa-main' })

  const branchFilter = req.branchScopedQuery({ role: 'teacher' })
  assert.deepEqual(branchFilter, {
    role: 'teacher',
    organizationId: 'org-tsa-main',
    branchId: 'branch-south',
  })
})
