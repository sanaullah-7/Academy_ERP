import { ROLES, getBranchRoles } from '../constants/roles.js'

// Fictional demo identities and assignments. These are not production permissions.
export const DEMO_BRANCHES = Object.freeze([
  Object.freeze({ id: 'demo-north', name: 'Demo North Campus' }),
  Object.freeze({ id: 'demo-central', name: 'Demo Central Campus' }),
])

const assignment = (branchId, roles) => Object.freeze({ branchId, roles: Object.freeze(roles) })
const user = (id, name, assignments, enabled = true) => Object.freeze({ id, name, enabled, assignments: Object.freeze(assignments) })
export const DEMO_USERS = Object.freeze([
  user('demo-admin', 'Demo Administrator', [assignment('demo-north', [ROLES.SUPER_ADMIN]), assignment('demo-central', [ROLES.SUPER_ADMIN])]),
  user('demo-owner', 'Demo Owner', [assignment('demo-central', [ROLES.OWNER])]),
  user('demo-reception', 'Demo Receptionist', [assignment('demo-north', [ROLES.RECEPTIONIST])]),
  user('demo-teacher', 'Demo Teacher', [assignment('demo-central', [ROLES.TEACHER])]),
  user('demo-multi', 'Demo Multi-role Staff', [assignment('demo-north', [ROLES.TEACHER]), assignment('demo-central', [ROLES.TEACHER, ROLES.RECEPTIONIST])]),
  user('demo-unassigned', 'Demo Unassigned Staff', []),
  user('demo-disabled', 'Demo Disabled Account', [], false),
])

export function getAuthorizedBranches(user) {
  if (!user?.enabled || !Array.isArray(user.assignments)) return []
  return DEMO_BRANCHES.filter((branch) => getBranchRoles(user, branch.id).length > 0)
}
