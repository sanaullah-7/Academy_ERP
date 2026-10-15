/**
 * Purpose: Will define roles for the constants area of the Academy frontend.
 * Module: constants
 * Status: Planned — functionality not implemented.
 */

// F00-005: Approved frontend demo implementation; not production authentication.
export const ROLES = Object.freeze({ SUPER_ADMIN: 'super_admin', OWNER: 'owner', RECEPTIONIST: 'receptionist', TEACHER: 'teacher' })
export const ROLE_LABELS = Object.freeze({ super_admin: 'Super Admin', owner: 'Owner', receptionist: 'Receptionist', teacher: 'Teacher' })
export const isKnownRole = (role) => Object.values(ROLES).includes(role)

// Role membership describes the selected branch; it never grants a capability.
export function getBranchRoles(user, branchId) {
  if (!user?.enabled || typeof branchId !== 'string' || !Array.isArray(user.assignments)) return []
  const assignments = user.assignments.filter((entry) => entry?.branchId === branchId)
  // Ambiguous duplicate assignments or malformed roles fail closed.
  if (assignments.length !== 1) return []
  const roles = assignments[0].roles
  return Array.isArray(roles) && roles.length > 0 && roles.every(isKnownRole) ? [...new Set(roles)] : []
}
