/**
 * Purpose: Will define permissions for the constants area of the Academy frontend.
 * Module: constants
 * Status: Planned — functionality not implemented.
 */

// F00-005: Approved frontend demo implementation; not production authentication.
import { getAuthorizedBranches } from '../mock/authFixtures.js'
import { getBranchRoles, ROLES } from './roles.js'
export const PERMISSIONS = Object.freeze({
  WORKSPACE_VIEW: 'workspace.view',
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
})
export const isKnownPermission = (permission) => Object.values(PERMISSIONS).includes(permission)

const SINGLE_ROLE_GRANTS = Object.freeze({
  [ROLES.SUPER_ADMIN]: Object.freeze([PERMISSIONS.ADMISSIONS_VIEW, PERMISSIONS.ADMISSIONS_CREATE, PERMISSIONS.ADMISSIONS_EDIT, PERMISSIONS.ADMISSIONS_DELETE, PERMISSIONS.ADMISSIONS_DECIDE, PERMISSIONS.STUDENTS_VIEW, PERMISSIONS.STUDENTS_CREATE, PERMISSIONS.STUDENTS_EDIT, PERMISSIONS.COURSES_VIEW, PERMISSIONS.COURSES_MANAGE, PERMISSIONS.FACULTY_VIEW, PERMISSIONS.CLASSES_VIEW]),
  [ROLES.RECEPTIONIST]: Object.freeze([PERMISSIONS.ADMISSIONS_VIEW, PERMISSIONS.ADMISSIONS_CREATE, PERMISSIONS.ADMISSIONS_EDIT, PERMISSIONS.STUDENTS_VIEW, PERMISSIONS.STUDENTS_CREATE, PERMISSIONS.STUDENTS_EDIT, PERMISSIONS.COURSES_VIEW, PERMISSIONS.FACULTY_VIEW, PERMISSIONS.CLASSES_VIEW]),
  [ROLES.OWNER]: Object.freeze([PERMISSIONS.ADMISSIONS_VIEW, PERMISSIONS.STUDENTS_VIEW, PERMISSIONS.COURSES_VIEW, PERMISSIONS.FACULTY_VIEW, PERMISSIONS.CLASSES_VIEW]),
  [ROLES.TEACHER]: Object.freeze([]),
})

// The unresolved multi-role combination policy fails closed for module actions.
export function canAccess(permission, user, branchId) {
  const assigned = getAuthorizedBranches(user).some((branch) => branch.id === branchId)
  if (!assigned) return false
  if (permission === PERMISSIONS.WORKSPACE_VIEW) return true
  const roles = getBranchRoles(user, branchId)
  return roles.length === 1 && SINGLE_ROLE_GRANTS[roles[0]]?.includes(permission) === true
}
