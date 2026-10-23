import assert from 'node:assert/strict'
import { test } from 'node:test'
import mongoose from 'mongoose'
import { User } from '../../src/modules/users/user.model.js'
import { Session } from '../../src/modules/auth/session.model.js'
import { Branch } from '../../src/modules/branches/branch.model.js'
import { BranchRoleAssignment } from '../../src/modules/users/branchRoleAssignment.model.js'
import { AuthRepository } from '../../src/modules/auth/auth.repository.js'
import { hashPassword, generateSessionToken, hashSessionToken, generateCsrfToken } from '../../src/shared/utils/crypto.js'
import { ROLES } from '../../src/constants/roles.js'
import { USER_STATUSES } from '../../src/constants/statuses.js'
import {
  assertSafeTestDatabase,
  parseDatabaseNameFromUri,
  UnsafeDatabaseError,
} from '../../src/config/databaseTestGuard.js'

test('Database Test Guard: rejects unsafe and non-test MongoDB URIs', () => {
  // 1. Production database name rejected even if "test" is in username or cluster
  assert.throws(
    () => {
      assertSafeTestDatabase({
        uri: 'mongodb://test_user:secret@cluster0.tsa.mongodb.net/production_db?appName=test-app',
        nodeEnv: 'test',
      })
    },
    (err) => err instanceof UnsafeDatabaseError && err.message.includes('forbidden production')
  )

  // 2. Query parameter with "test" does not bypass non-test database check
  assert.throws(
    () => {
      assertSafeTestDatabase({
        uri: 'mongodb://127.0.0.1:27017/tsa_academy?test=true',
        nodeEnv: 'test',
      })
    },
    (err) => err instanceof UnsafeDatabaseError && err.message.includes('not an approved test database')
  )

  // 3. Staging / UAT / Live rejected in database name
  assert.throws(
    () => {
      assertSafeTestDatabase({
        uri: 'mongodb://127.0.0.1:27017/staging_db_test',
        nodeEnv: 'test',
      })
    },
    (err) => err instanceof UnsafeDatabaseError && err.message.includes('forbidden')
  )

  // 4. Production keyword in HOST rejected even if database name ends in "_test"
  assert.throws(
    () => {
      assertSafeTestDatabase({
        uri: 'mongodb+srv://admin:pass@production-cluster.mongodb.net/tsa_academy_test',
        nodeEnv: 'test',
      })
    },
    (err) => err instanceof UnsafeDatabaseError && err.message.includes('Target host') && err.message.includes('forbidden')
  )

  // 5. Staging keyword in HOST rejected even if database name ends in "_test"
  assert.throws(
    () => {
      assertSafeTestDatabase({
        uri: 'mongodb://admin:pass@staging-db.internal:27017/tsa_academy_test',
        nodeEnv: 'test',
      })
    },
    (err) => err instanceof UnsafeDatabaseError && err.message.includes('Target host') && err.message.includes('forbidden')
  )

  // 6. NODE_ENV === 'production' rejected even with valid test URI
  assert.throws(
    () => {
      assertSafeTestDatabase({
        uri: 'mongodb://127.0.0.1:27017/tsa_academy_test',
        nodeEnv: 'production',
      })
    },
    (err) => err instanceof UnsafeDatabaseError && err.message.includes('NODE_ENV is "production"')
  )

  // 7. Valid test database allowed
  const verified = assertSafeTestDatabase({
    uri: 'mongodb://127.0.0.1:27017/tsa_academy_test',
    nodeEnv: 'test',
  })
  assert.equal(verified.safe, true)
  assert.equal(verified.databaseName, 'tsa_academy_test')
})

test('Integration: Mongoose persistence, indexes, and AuthRepository against MongoDB', async (t) => {
  const candidateUri =
    process.env.TEST_MONGODB_URI ||
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/tsa_academy_test'

  let safeUri = null
  try {
    assertSafeTestDatabase({ uri: candidateUri })
    safeUri = candidateUri
  } catch (err) {
    t.skip(`MongoDB test skipped due to safety guard: ${err.message}`)
    return
  }

  let isConnected = false
  try {
    await mongoose.connect(safeUri, {
      serverSelectionTimeoutMS: 2000,
    })
    isConnected = true
  } catch (err) {
    t.skip(`MongoDB integration test BLOCKED: ${err.message}`)
    return
  }

  try {
    // Scoped cleanup: strictly clean test partition records only
    await User.deleteMany({ organizationId: 'test-org-db' })
    await Session.deleteMany({ organizationId: 'test-org-db' })
    await Branch.deleteMany({ organizationId: 'test-org-db' })
    await BranchRoleAssignment.deleteMany({ organizationId: 'test-org-db' })

    // Ensure all indexes are built
    await Promise.all([
      Branch.init(),
      User.init(),
      Session.init(),
      BranchRoleAssignment.init(),
    ])

    const repo = new AuthRepository({ User, Session, Branch, BranchRoleAssignment })

    // 1. Create a Branch in MongoDB
    const branch = await Branch.create({
      organizationId: 'test-org-db',
      code: 'MAIN',
      name: 'Main Campus',
    })
    assert.ok(branch._id)
    assert.equal(branch.code, 'MAIN')

    // Duplicate branch code within same organization must fail unique index (11000)
    await assert.rejects(
      async () => {
        await Branch.create({
          organizationId: 'test-org-db',
          code: 'MAIN',
          name: 'Duplicate Campus',
        })
      },
      (err) => err.code === 11000
    )

    // 2. Create User with async passwordHash in MongoDB
    const plainPassword = 'RealDbPassword123!'
    const hashed = await hashPassword(plainPassword)

    const user = await User.create({
      organizationId: 'test-org-db',
      fullName: 'Real DB User',
      email: 'realdb@tsa.edu',
      passwordHash: hashed,
      status: USER_STATUSES.ACTIVE,
      assignments: [
        {
          branchId: 'stale-embedded-branch',
          roles: [ROLES.ADMIN],
          status: 'active',
        },
      ],
    })

    assert.ok(user._id)
    assert.equal(user.email, 'realdb@tsa.edu')

    // Verify passwordHash is NOT returned in standard queries (select: false)
    const fetchedDefault = await repo.findUserByEmail('realdb@tsa.edu')
    assert.equal(fetchedDefault.passwordHash, undefined)

    // Verify passwordHash IS returned when explicitly selected
    const fetchedWithPass = await repo.findUserByEmail('realdb@tsa.edu', { includePassword: true })
    assert.ok(fetchedWithPass.passwordHash)
    assert.equal(fetchedWithPass.passwordHash, hashed)

    // Duplicate email must fail unique constraint
    await assert.rejects(
      async () => {
        await User.create({
          organizationId: 'test-org-db',
          fullName: 'Duplicate Email User',
          email: 'realdb@tsa.edu',
          passwordHash: hashed,
        })
      },
      (err) => err.code === 11000
    )

    // 3. Create Session in MongoDB
    const sessionToken = generateSessionToken()
    const tokenHash = hashSessionToken(sessionToken)
    const csrfToken = generateCsrfToken()
    const expiresAt = new Date(Date.now() + 3600000)

    const session = await repo.createSession({
      tokenHash,
      userId: user._id,
      organizationId: 'test-org-db',
      activeBranchId: branch._id.toString(),
      csrfToken,
      expiresAt,
    })

    assert.ok(session._id)
    assert.equal(session.tokenHash, tokenHash)

    // Find session by token hash
    const foundSession = await repo.findSessionByTokenHash(tokenHash)
    assert.ok(foundSession)
    assert.equal(foundSession.userId.toString(), user._id.toString())
    assert.equal(foundSession.revokedAt, null)

    // Revoke session
    await repo.revokeSession(session._id)
    const revokedSession = await repo.findSessionByTokenHash(tokenHash)
    assert.ok(revokedSession.revokedAt instanceof Date)

    // 4. Branch Membership Authority: Negative tests for Deletion, Revocation & Stale Embedded Data

    // A. User currently has NO records in BranchRoleAssignment, but has stale embedded assignment:
    // Stale embedded data MUST NOT be active!
    const userWithNoCollections = await repo.findUserById(user._id)
    assert.equal(
      userWithNoCollections.assignments.length,
      0,
      'Stale embedded assignments must not grant access when no collection records exist'
    )

    // B. Create authoritative record in BranchRoleAssignment:
    const assignment = await BranchRoleAssignment.create({
      userId: user._id,
      organizationId: 'test-org-db',
      branchId: branch._id.toString(),
      roles: [ROLES.RECEPTIONIST],
      status: 'active',
    })
    assert.ok(assignment._id)

    // User lookup should reflect authoritative assignment from BranchRoleAssignment ONLY (not stale embedded)
    const userWithAssignment = await repo.findUserById(user._id)
    assert.equal(userWithAssignment.assignments.length, 1)
    assert.equal(userWithAssignment.assignments[0].branchId, branch._id.toString())
    assert.equal(userWithAssignment.assignments[0].roles[0], ROLES.RECEPTIONIST)

    // C. Revocation test: mark assignment inactive
    await BranchRoleAssignment.updateOne({ _id: assignment._id }, { status: 'inactive' })
    const userAfterRevocation = await repo.findUserById(user._id)
    assert.equal(
      userAfterRevocation.assignments.length,
      0,
      'Revoked assignment must not be active and must not fall back to embedded data'
    )

    // D. Deletion / Removal test: delete the assignment record entirely
    await BranchRoleAssignment.deleteOne({ _id: assignment._id })
    const userAfterDeletion = await repo.findUserById(user._id)
    assert.equal(
      userAfterDeletion.assignments.length,
      0,
      'Deleted assignment must not be resurrected by stale embedded data'
    )

    // 5. Cleanup Scope Isolation Verification:
    // Insert a record for another organization
    const unrelatedBranch = await Branch.create({
      organizationId: 'other-unrelated-org',
      code: 'OTHER',
      name: 'Other Org Branch',
    })

    // Perform test-owned cleanup
    await Branch.deleteMany({ organizationId: 'test-org-db' })

    // Verify unrelated organization's record is completely untouched
    const foundOther = await Branch.findById(unrelatedBranch._id)
    assert.ok(foundOther, 'Cleanup must not touch records of other organizations')
    assert.equal(foundOther.organizationId, 'other-unrelated-org')

    // Clean up other test record
    await Branch.deleteOne({ _id: unrelatedBranch._id })
    await User.deleteMany({ organizationId: 'test-org-db' })
    await Session.deleteMany({ organizationId: 'test-org-db' })
    await BranchRoleAssignment.deleteMany({ organizationId: 'test-org-db' })
  } finally {
    if (isConnected) {
      await mongoose.disconnect()
    }
  }
})
