import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createBranchScopeMiddleware } from '../../src/middleware/branchScope.js'
import { verifyRecordScope, requireTeacherSelfOnly } from '../../src/middleware/recordOwnership.js'
import { ROLES } from '../../src/constants/roles.js'
import { ERROR_CODES } from '../../src/constants/errorCodes.js'

test('branchScope: resolves authorized branch and single effective role', () => {
  const middleware = createBranchScopeMiddleware({ required: true })

  const user = {
    id: 'user-1',
    assignments: [
      { branchId: 'branch-main', roles: [ROLES.TEACHER], status: 'active' },
      { branchId: 'branch-north', roles: [ROLES.RECEPTIONIST], status: 'active' },
    ],
  }

  // Branch 1 -> Teacher
  const req1 = { user, params: { branchId: 'branch-main' }, headers: {} }
  let called1 = false
  middleware(req1, {}, (err) => {
    assert.equal(err, undefined)
    called1 = true
  })
  assert.equal(called1, true)
  assert.equal(req1.activeBranchId, 'branch-main')
  assert.equal(req1.userRole, ROLES.TEACHER)

  // Branch 2 -> Receptionist (different role in different branch)
  const req2 = { user, params: { branchId: 'branch-north' }, headers: {} }
  let called2 = false
  middleware(req2, {}, (err) => {
    assert.equal(err, undefined)
    called2 = true
  })
  assert.equal(called2, true)
  assert.equal(req2.activeBranchId, 'branch-north')
  assert.equal(req2.userRole, ROLES.RECEPTIONIST)
})

test('branchScope: denies access to unauthorized branch', () => {
  const middleware = createBranchScopeMiddleware({ required: true })

  const user = {
    id: 'user-1',
    assignments: [
      { branchId: 'branch-main', roles: [ROLES.TEACHER], status: 'active' },
    ],
  }

  const req = { user, params: { branchId: 'branch-unassigned' }, headers: {} }
  let receivedError = null
  middleware(req, {}, (err) => {
    receivedError = err
  })

  assert.ok(receivedError)
  assert.equal(receivedError.statusCode, 403)
  assert.equal(receivedError.code, ERROR_CODES.BRANCH_ACCESS_DENIED)
  assert.equal(receivedError.message, 'You do not have access to this branch.')
})

test('branchScope: fails closed on ambiguous same-branch multiple roles', () => {
  const middleware = createBranchScopeMiddleware({ required: true })

  const user = {
    id: 'user-multi',
    assignments: [
      {
        branchId: 'branch-ambiguous',
        roles: [ROLES.TEACHER, ROLES.RECEPTIONIST],
        status: 'active',
      },
    ],
  }

  const req = { user, params: { branchId: 'branch-ambiguous' }, headers: {} }
  let receivedError = null
  middleware(req, {}, (err) => {
    receivedError = err
  })

  assert.ok(receivedError)
  assert.equal(receivedError.statusCode, 403)
  assert.equal(receivedError.code, ERROR_CODES.BRANCH_ACCESS_DENIED)
  assert.equal(
    receivedError.message,
    'Ambiguous or unsupported multiple roles for this branch.'
  )
})

test('branchScope: denies access to inactive/revoked branch assignment', () => {
  const middleware = createBranchScopeMiddleware({ required: true })

  const user = {
    id: 'user-1',
    assignments: [
      { branchId: 'branch-inactive', roles: [ROLES.TEACHER], status: 'inactive' },
    ],
  }

  const req = { user, params: { branchId: 'branch-inactive' }, headers: {} }
  let receivedError = null
  middleware(req, {}, (err) => {
    receivedError = err
  })

  assert.ok(receivedError)
  assert.equal(receivedError.statusCode, 403)
  assert.equal(receivedError.code, ERROR_CODES.BRANCH_ACCESS_DENIED)
})

test('recordOwnership: Teacher self-only access allows own records and denies others', () => {
  const middleware = requireTeacherSelfOnly({
    getTargetTeacherId: (req) => req.params.teacherId,
  })

  // Own record: allowed
  const ownReq = {
    user: { id: 'teacher-101' },
    userRole: ROLES.TEACHER,
    params: { teacherId: 'teacher-101' },
  }
  let ownAllowed = false
  middleware(ownReq, {}, (err) => {
    assert.equal(err, undefined)
    ownAllowed = true
  })
  assert.equal(ownAllowed, true)

  // Other teacher record: strictly denied
  const otherReq = {
    user: { id: 'teacher-101' },
    userRole: ROLES.TEACHER,
    params: { teacherId: 'teacher-999' },
  }
  let otherError = null
  middleware(otherReq, {}, (err) => {
    otherError = err
  })
  assert.ok(otherError)
  assert.equal(otherError.statusCode, 403)
  assert.equal(otherError.code, ERROR_CODES.RECORD_ACCESS_DENIED)
  assert.equal(otherError.message, 'Teachers can only access their own records.')

  // Non-teacher role (Admin/Owner) bypasses self-only restriction
  const adminReq = {
    user: { id: 'admin-1' },
    userRole: ROLES.ADMIN,
    params: { teacherId: 'teacher-999' },
  }
  let adminAllowed = false
  middleware(adminReq, {}, (err) => {
    assert.equal(err, undefined)
    adminAllowed = true
  })
  assert.equal(adminAllowed, true)
})

test('verifyRecordScope: denies mismatched organization or branch', () => {
  const record = {
    id: 'rec-1',
    organizationId: 'org-tsa',
    branchId: 'branch-main',
  }

  // Matching scope: valid
  assert.equal(
    verifyRecordScope({
      record,
      expectedOrganizationId: 'org-tsa',
      expectedBranchId: 'branch-main',
    }),
    true
  )

  // Mismatched organization: denied
  assert.throws(
    () => {
      verifyRecordScope({
        record,
        expectedOrganizationId: 'org-other',
        expectedBranchId: 'branch-main',
      })
    },
    (err) => {
      assert.equal(err.code, ERROR_CODES.RECORD_ACCESS_DENIED)
      return true
    }
  )

  // Mismatched branch: denied
  assert.throws(
    () => {
      verifyRecordScope({
        record,
        expectedOrganizationId: 'org-tsa',
        expectedBranchId: 'branch-other',
      })
    },
    (err) => {
      assert.equal(err.code, ERROR_CODES.BRANCH_ACCESS_DENIED)
      return true
    }
  )
})
