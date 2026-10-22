/**
 * Purpose: Will define permissions for the constants area of the Academy frontend.
 * Module: constants
 * Status: Planned — functionality not implemented.
 */

// F00-005: Approved frontend demo implementation; not production authentication.
import { getAuthorizedBranches } from '../mock/authFixtures.js'
import { getBranchRoles, ROLES } from './roles.js'
export const PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: 'dashboard.view',
  ADMISSIONS_VIEW: 'admissions.view',
  ADMISSIONS_CREATE: 'admissions.create',
  ADMISSIONS_EDIT: 'admissions.edit',
  ADMISSIONS_DELETE: 'admissions.delete',
  ADMISSIONS_DECIDE: 'admissions.decide',
  STUDENTS_VIEW: 'students.view',
  STUDENTS_CREATE: 'students.create',
  STUDENTS_EDIT: 'students.edit',
  COURSES_VIEW: 'courses.view',
  COURSES_MANAGE: 'courses.manage',
  FACULTY_VIEW: 'faculty.view',
  CLASSES_VIEW: 'classes.view',
  CLASSES_MANAGE: 'classes.manage',
  CLASSES_EDIT: 'classes.edit',
  FEES_MANAGE: 'fees.manage',
  FEES_VIEW: 'fees.view',
  FEES_COLLECT: 'fees.collect',
  FINANCE_VIEW: 'finance.view',
  PAYROLL_VIEW: 'payroll.view',
  EXPENSES_MANAGE: 'expenses.manage',
  DEMO_CLASSES_VIEW: 'demoClasses.view',
  DEMO_CLASSES_MANAGE: 'demoClasses.manage',
  ASSETS_VIEW: 'assets.view',
  ASSETS_MANAGE: 'assets.manage',
  REPORTS_VIEW: 'reports.view',
  REPORTS_COMPARE_BRANCHES: 'reports.compareBranches',
  BRANCHES_MANAGE: 'branches.manage',
  USERS_MANAGE: 'users.manage',
  SETTINGS_MANAGE: 'settings.manage',
  AUDIT_VIEW: 'audit.view',
})
export const isKnownPermission = (permission) => Object.values(PERMISSIONS).includes(permission)

const FULL_ACCESS_GRANTS = Object.freeze([
    PERMISSIONS.ADMISSIONS_VIEW,
    PERMISSIONS.ADMISSIONS_CREATE,
    PERMISSIONS.ADMISSIONS_EDIT,
    PERMISSIONS.ADMISSIONS_DELETE,
    PERMISSIONS.ADMISSIONS_DECIDE,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.STUDENTS_EDIT,
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.COURSES_MANAGE,
    PERMISSIONS.FACULTY_VIEW,
    PERMISSIONS.CLASSES_VIEW,
    PERMISSIONS.CLASSES_MANAGE,
    PERMISSIONS.CLASSES_EDIT,
    PERMISSIONS.FEES_MANAGE,
    PERMISSIONS.FEES_VIEW,
    PERMISSIONS.FEES_COLLECT,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.EXPENSES_MANAGE,
    PERMISSIONS.DEMO_CLASSES_VIEW,
    PERMISSIONS.DEMO_CLASSES_MANAGE,
    PERMISSIONS.ASSETS_VIEW,
    PERMISSIONS.ASSETS_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_COMPARE_BRANCHES,
    PERMISSIONS.BRANCHES_MANAGE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
  ])

const SINGLE_ROLE_GRANTS = Object.freeze({
  [ROLES.SUPER_ADMIN]: FULL_ACCESS_GRANTS,
  [ROLES.ADMIN]: FULL_ACCESS_GRANTS,
  [ROLES.RECEPTIONIST]: Object.freeze([
    PERMISSIONS.ADMISSIONS_VIEW,
    PERMISSIONS.ADMISSIONS_CREATE,
    PERMISSIONS.ADMISSIONS_EDIT,
    PERMISSIONS.ADMISSIONS_DELETE,
    PERMISSIONS.ADMISSIONS_DECIDE,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.STUDENTS_EDIT,
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.FACULTY_VIEW,
    PERMISSIONS.CLASSES_VIEW,
    PERMISSIONS.CLASSES_EDIT,
    PERMISSIONS.FEES_VIEW,
    PERMISSIONS.FEES_COLLECT,
    PERMISSIONS.FEES_MANAGE,
    PERMISSIONS.DEMO_CLASSES_VIEW,
    PERMISSIONS.DEMO_CLASSES_MANAGE,
    PERMISSIONS.ASSETS_VIEW,
    PERMISSIONS.ASSETS_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
  ]),
  [ROLES.OWNER]: Object.freeze([
    PERMISSIONS.ADMISSIONS_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.FACULTY_VIEW,
    PERMISSIONS.CLASSES_VIEW,
    PERMISSIONS.FEES_VIEW,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.EXPENSES_MANAGE,
    PERMISSIONS.DEMO_CLASSES_VIEW,
    PERMISSIONS.ASSETS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ]),
  [ROLES.TEACHER]: Object.freeze([]),
})

// The unresolved multi-role combination policy fails closed for module actions.
export function canAccess(permission, user, branchId) {
  const assigned = getAuthorizedBranches(user).some((branch) => branch.id === branchId)
  if (!assigned) return false
  if (permission === PERMISSIONS.DASHBOARD_VIEW) return true
  const roles = getBranchRoles(user, branchId)
  return roles.length === 1 && SINGLE_ROLE_GRANTS[roles[0]]?.includes(permission) === true
}
