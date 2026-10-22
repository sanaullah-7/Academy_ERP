import { ROLES, getBranchRoles } from '../constants/roles.js'
import { readOrganization } from './mockOrganization.js'

// Fictional demo identities and assignments. These are not production permissions.
export const DEMO_BRANCHES = Object.freeze([
  Object.freeze({ id: 'demo-north', name: 'North Campus' }),
  Object.freeze({ id: 'demo-central', name: 'Central Campus' }),
])

const assignment = (branchId, roles) => Object.freeze({ branchId, roles: Object.freeze(roles) })
const user = (id, name, assignments, enabled = true) => Object.freeze({ id, name, enabled, assignments: Object.freeze(assignments) })
export const DEMO_USERS = Object.freeze([
  user('demo-admin', 'Administrator', [assignment('demo-north', [ROLES.SUPER_ADMIN]), assignment('demo-central', [ROLES.SUPER_ADMIN])]),
  user('demo-owner', 'Academy Owner', [assignment('demo-central', [ROLES.OWNER])]),
  user('demo-reception', 'Receptionist', [assignment('demo-north', [ROLES.RECEPTIONIST])]),
  user('demo-teacher', 'Faculty Teacher', [assignment('demo-central', [ROLES.TEACHER])]),
  user('teacher-naeem', 'Prof. Naeem (Chem)', [assignment('demo-central', [ROLES.TEACHER]), assignment('demo-north', [ROLES.TEACHER])]),
  user('teacher-bilal', 'Engr. Bilal (Phys)', [assignment('demo-central', [ROLES.TEACHER])]),
  user('teacher-danyal', 'Sir Danyal (CS)', [assignment('demo-central', [ROLES.TEACHER])]),
  user('teacher-tariq', 'Sir Tariq (Math)', [assignment('demo-central', [ROLES.TEACHER])]),
  user('demo-multi', 'Multi-role Staff', [assignment('demo-north', [ROLES.TEACHER]), assignment('demo-central', [ROLES.TEACHER, ROLES.RECEPTIONIST])]),
  user('demo-unassigned', 'Unassigned Staff', []),
  user('demo-disabled', 'Disabled Account', [], false),
])

export const getDemoBranches = () => {
  const store = readOrganization()
  return [...DEMO_BRANCHES.map(branch => ({ ...branch, ...(store.branchOverrides?.[branch.id] || {}), id: branch.id })), ...store.branches].filter(branch => !(store.deletedBranchIds || []).includes(branch.id))
}
export const getDemoUsers = () => {
  const store = readOrganization()
  // Legacy deletion removed built-in login identities even when Faculty records
  // still referenced them. Retain the professional identity and revoke access.
  const base = DEMO_USERS.map(user => ({
    ...user,
    ...(store.profileOverrides?.[user.id] ?? {}),
    ...(store.deletedUserIds.includes(user.id) ? { accessRevoked: true } : {}),
    assignments: store.assignmentOverrides[user.id]?.length ? [...user.assignments, ...store.assignmentOverrides[user.id]] : user.assignments,
  }))
  const created = store.users.filter(user => !store.deletedUserIds.includes(user.id))
  return [...base, ...created].map(user => ({ ...user, assignments: user.assignments.filter(assignment => !(store.deletedBranchIds || []).includes(assignment.branchId)) }))
}
export const findDemoUser = id => getDemoUsers().find(user => user.id === id && !user.accessRevoked)

export function getAuthorizedBranches(user) {
  if (!user?.enabled || user.accessRevoked || !Array.isArray(user.assignments)) return []
  return getDemoBranches().filter((branch) => getBranchRoles(user, branch.id).length > 0 && branch.active !== false)
}
