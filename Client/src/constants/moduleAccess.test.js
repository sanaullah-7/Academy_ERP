import { describe, expect, it } from 'vitest'
import { canAccess } from './permissions.js'
import { visibleModules } from './moduleAccess.js'
import { ROLES } from './roles.js'

const user = role => ({ enabled: true, assignments: [{ branchId: 'demo-central', roles: [role] }] })
const labels = role => visibleModules(permission => canAccess(permission, user(role), 'demo-central')).map(module => module.label)

describe('central module visibility registry', () => {
  it.each([ROLES.SUPER_ADMIN, ROLES.ADMIN])('shows every authorized module to %s', role => {
    expect(labels(role)).toEqual([
      'Dashboard', 'Admissions', 'Students', 'Courses & Batches', 'Faculty & Classes',
      'Fees', 'Finance', 'Teacher Payroll', 'Demo Classes', 'Assets', 'Reports',
      'Audit Log', 'Branches', 'Users', 'Settings',
    ])
  })

  it('shows only approved Receptionist modules', () => {
    expect(labels(ROLES.RECEPTIONIST)).toEqual([
      'Dashboard', 'Admissions', 'Students', 'Courses & Batches', 'Faculty & Classes',
      'Fees', 'Demo Classes', 'Assets', 'Reports',
    ])
  })

  it('shows Owner financial and readonly operational modules without administration', () => {
    expect(labels(ROLES.OWNER)).toEqual([
      'Dashboard', 'Admissions', 'Students', 'Courses & Batches', 'Faculty & Classes',
      'Fees', 'Finance', 'Teacher Payroll', 'Demo Classes', 'Assets', 'Reports',
    ])
  })

  it('keeps Teacher on the implemented self-service dashboard until scoped modules are enabled', () => {
    expect(labels(ROLES.TEACHER)).toEqual(['Dashboard'])
  })

  it('recomputes from the selected branch and fails closed for mixed roles', () => {
    const mixed = { enabled: true, assignments: [
      { branchId: 'demo-north', roles: [ROLES.ADMIN] },
      { branchId: 'demo-central', roles: [ROLES.TEACHER, ROLES.RECEPTIONIST] },
    ] }
    expect(visibleModules(permission => canAccess(permission, mixed, 'demo-north')).length).toBe(15)
    expect(visibleModules(permission => canAccess(permission, mixed, 'demo-central')).map(module => module.label)).toEqual(['Dashboard'])
  })
})
