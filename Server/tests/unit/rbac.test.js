import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ROLES, isKnownRole } from '../../src/constants/roles.js'
import {
  PERMISSIONS,
  isKnownPermission,
  hasPermission,
  getRolePermissions,
} from '../../src/constants/permissions.js'
import { assertCanManageUser } from '../../src/modules/users/user.policy.js'
import { assertBranchCreationAllowed } from '../../src/modules/branches/branch.policy.js'
import { ERROR_CODES } from '../../src/constants/errorCodes.js'

test('all five approved roles are recognized and valid', () => {
  const expectedRoles = ['super_admin', 'admin', 'owner', 'receptionist', 'teacher']
  for (const role of expectedRoles) {
    assert.equal(isKnownRole(role), true)
  }
  assert.equal(isKnownRole('platform_admin'), false)
  assert.equal(isKnownRole('student'), false)
  assert.equal(isKnownRole(''), false)
})

test('Super Admin has full approved administrative permissions', () => {
  const perms = getRolePermissions(ROLES.SUPER_ADMIN)
  assert.ok(perms.includes(PERMISSIONS.ADMISSIONS_VIEW))
  assert.ok(perms.includes(PERMISSIONS.FINANCE_VIEW))
  assert.ok(perms.includes(PERMISSIONS.PAYROLL_VIEW))
  assert.ok(perms.includes(PERMISSIONS.USERS_MANAGE))
  assert.ok(perms.includes(PERMISSIONS.AUDIT_VIEW))
  assert.equal(hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.DASHBOARD_VIEW), true)
})

test('Receptionist has full Admissions & Fees access, strictly NO Finance/Payroll/Admin', () => {
  const receptionistPerms = getRolePermissions(ROLES.RECEPTIONIST)

  // Full Admissions access
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.ADMISSIONS_VIEW), true)
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.ADMISSIONS_CREATE), true)
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.ADMISSIONS_EDIT), true)
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.ADMISSIONS_DELETE), true)
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.ADMISSIONS_DECIDE), true)

  // Full Fees access
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.FEES_VIEW), true)
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.FEES_COLLECT), true)
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.FEES_MANAGE), true)

  // Explicitly DENIED modules
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.FINANCE_VIEW), false)
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.PAYROLL_VIEW), false)
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.EXPENSES_MANAGE), false)
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.USERS_MANAGE), false)
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.BRANCHES_MANAGE), false)
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.SETTINGS_MANAGE), false)
  assert.equal(hasPermission(ROLES.RECEPTIONIST, PERMISSIONS.AUDIT_VIEW), false)

  assert.equal(receptionistPerms.includes(PERMISSIONS.FINANCE_VIEW), false)
  assert.equal(receptionistPerms.includes(PERMISSIONS.PAYROLL_VIEW), false)
})

test('Owner has approved financial and management reporting, no system admin', () => {
  assert.equal(hasPermission(ROLES.OWNER, PERMISSIONS.FINANCE_VIEW), true)
  assert.equal(hasPermission(ROLES.OWNER, PERMISSIONS.PAYROLL_VIEW), true)
  assert.equal(hasPermission(ROLES.OWNER, PERMISSIONS.EXPENSES_MANAGE), true)
  assert.equal(hasPermission(ROLES.OWNER, PERMISSIONS.REPORTS_VIEW), true)

  // Restricted admin modules
  assert.equal(hasPermission(ROLES.OWNER, PERMISSIONS.AUDIT_VIEW), false)
  assert.equal(hasPermission(ROLES.OWNER, PERMISSIONS.BRANCHES_MANAGE), false)
  assert.equal(hasPermission(ROLES.OWNER, PERMISSIONS.USERS_MANAGE), false)
  assert.equal(hasPermission(ROLES.OWNER, PERMISSIONS.SETTINGS_MANAGE), false)
  assert.equal(hasPermission(ROLES.OWNER, PERMISSIONS.ADMISSIONS_CREATE), false)
})

test('Teacher has 0 module permissions, accesses only dashboard and own records', () => {
  const teacherPerms = getRolePermissions(ROLES.TEACHER)
  assert.equal(teacherPerms.length, 0)
  assert.equal(hasPermission(ROLES.TEACHER, PERMISSIONS.DASHBOARD_VIEW), true)
  assert.equal(hasPermission(ROLES.TEACHER, PERMISSIONS.ADMISSIONS_VIEW), false)
  assert.equal(hasPermission(ROLES.TEACHER, PERMISSIONS.FINANCE_VIEW), false)
  assert.equal(hasPermission(ROLES.TEACHER, PERMISSIONS.PAYROLL_VIEW), false)
  assert.equal(hasPermission(ROLES.TEACHER, PERMISSIONS.USERS_MANAGE), false)
})

test('Unknown roles and permissions are always denied by default', () => {
  assert.equal(hasPermission('unknown_role', PERMISSIONS.DASHBOARD_VIEW), false)
  assert.equal(hasPermission(ROLES.ADMIN, 'unknown.permission'), false)
  assert.equal(isKnownPermission('unknown.permission'), false)
})

test('Admin privilege escalation protection blocks unauthorized role modification', () => {
  // Admin cannot assign Super Admin role
  assert.throws(
    () => {
      assertCanManageUser({
        actingUserRole: ROLES.ADMIN,
        targetUser: null,
        targetRoles: [ROLES.SUPER_ADMIN],
      })
    },
    (err) => {
      assert.equal(err.code, ERROR_CODES.PRIVILEGE_ESCALATION_DENIED)
      return true
    }
  )

  // Admin cannot assign Admin role
  assert.throws(
    () => {
      assertCanManageUser({
        actingUserRole: ROLES.ADMIN,
        targetUser: null,
        targetRoles: [ROLES.ADMIN],
      })
    },
    (err) => {
      assert.equal(err.code, ERROR_CODES.PRIVILEGE_ESCALATION_DENIED)
      return true
    }
  )

  // Admin cannot modify a Super Admin user
  const superAdminTarget = {
    role: ROLES.SUPER_ADMIN,
    assignments: [{ branchId: 'b1', roles: [ROLES.SUPER_ADMIN] }],
  }
  assert.throws(
    () => {
      assertCanManageUser({
        actingUserRole: ROLES.ADMIN,
        targetUser: superAdminTarget,
        targetRoles: [ROLES.TEACHER],
      })
    },
    (err) => {
      assert.equal(err.code, ERROR_CODES.PRIVILEGE_ESCALATION_DENIED)
      return true
    }
  )

  // Admin cannot modify a protected user
  const protectedUser = { isProtected: true }
  assert.throws(
    () => {
      assertCanManageUser({
        actingUserRole: ROLES.ADMIN,
        targetUser: protectedUser,
        targetRoles: [ROLES.TEACHER],
      })
    },
    (err) => {
      assert.equal(err.code, ERROR_CODES.PRIVILEGE_ESCALATION_DENIED)
      return true
    }
  )

  // Admin can manage non-privileged roles (e.g. Teacher, Receptionist)
  assert.equal(
    assertCanManageUser({
      actingUserRole: ROLES.ADMIN,
      targetUser: { isProtected: false },
      targetRoles: [ROLES.TEACHER],
    }),
    true
  )

  // Super Admin can manage any user
  assert.equal(
    assertCanManageUser({
      actingUserRole: ROLES.SUPER_ADMIN,
      targetUser: { isProtected: true },
      targetRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    }),
    true
  )
})

test('Branch creation pause is strictly enforced for all roles', () => {
  assert.throws(
    () => {
      assertBranchCreationAllowed()
    },
    (err) => {
      assert.equal(err.code, ERROR_CODES.BRANCH_CREATION_PAUSED)
      assert.equal(err.statusCode, 403)
      return true
    }
  )
})
