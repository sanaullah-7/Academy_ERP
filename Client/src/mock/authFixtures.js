import { ROLES, getBranchRoles } from '../constants/roles.js'
import { readOrganization } from './mockOrganization.js'

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
  user('teacher-irfan', 'Dr. Irfan (Bio)', [assignment('demo-central', [ROLES.TEACHER]), assignment('demo-north', [ROLES.TEACHER])]),
  user('teacher-naeem', 'Prof. Naeem (Chem)', [assignment('demo-central', [ROLES.TEACHER])]),
  user('teacher-bilal', 'Engr. Bilal (Phys)', [assignment('demo-central', [ROLES.TEACHER])]),
  user('teacher-danyal', 'Sir Danyal (CS)', [assignment('demo-central', [ROLES.TEACHER])]),
  user('teacher-tariq', 'Sir Tariq (Math)', [assignment('demo-central', [ROLES.TEACHER])]),
  user('demo-multi', 'Demo Multi-role Staff', [assignment('demo-north', [ROLES.TEACHER]), assignment('demo-central', [ROLES.TEACHER, ROLES.RECEPTIONIST])]),
  user('demo-unassigned', 'Demo Unassigned Staff', []),
  user('demo-disabled', 'Demo Disabled Account', [], false),
])

export const getDemoBranches = () => [...DEMO_BRANCHES, ...readOrganization().branches]
export const getDemoUsers = () => {
  const store = readOrganization()
  const base = DEMO_USERS.map(user => store.assignmentOverrides[user.id]?.length ? { ...user, assignments: [...user.assignments, ...store.assignmentOverrides[user.id]] } : user)
  return [...base, ...store.users]
}
export const findDemoUser = id => getDemoUsers().find(user => user.id === id)

export function getAuthorizedBranches(user) {
  if (!user?.enabled || !Array.isArray(user.assignments)) return []
  return getDemoBranches().filter((branch) => getBranchRoles(user, branch.id).length > 0 && branch.active !== false)
}
