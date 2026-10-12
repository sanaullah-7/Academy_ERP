import { describe, expect, it } from 'vitest'
import { canAccess, isKnownPermission, PERMISSIONS } from './permissions.js'
import { getBranchRoles, ROLES } from './roles.js'
import { DEMO_USERS, getAuthorizedBranches } from '../mock/authFixtures.js'

describe('approved roles and permission definitions', () => {
  it('defines only four roles and the confirmed implemented module permissions', () => {
    expect(Object.values(ROLES)).toEqual(['super_admin', 'owner', 'receptionist', 'teacher'])
    expect(Object.values(PERMISSIONS)).toEqual(['workspace.view', 'admissions.view', 'admissions.create', 'admissions.edit', 'admissions.delete', 'admissions.decide', 'students.view', 'students.create', 'students.edit'])
    expect(isKnownPermission('workspace.view')).toBe(true)
    expect(isKnownPermission('payments.reverse')).toBe(false)
  })

  it('applies confirmed single-role Admissions and Students access without a Super Admin bypass', () => {
    const get = id => DEMO_USERS.find(user => user.id === id)
    expect(canAccess(PERMISSIONS.ADMISSIONS_VIEW, get('demo-owner'), 'demo-central')).toBe(true)
    expect(canAccess(PERMISSIONS.ADMISSIONS_CREATE, get('demo-owner'), 'demo-central')).toBe(false)
    expect(canAccess(PERMISSIONS.ADMISSIONS_EDIT, get('demo-reception'), 'demo-north')).toBe(true)
    expect(canAccess(PERMISSIONS.ADMISSIONS_VIEW, get('demo-teacher'), 'demo-central')).toBe(false)
    expect(canAccess(PERMISSIONS.STUDENTS_VIEW, get('demo-owner'), 'demo-central')).toBe(true)
    expect(canAccess(PERMISSIONS.STUDENTS_VIEW, get('demo-teacher'), 'demo-central')).toBe(false)
    expect(canAccess('admissions.delete', get('demo-admin'), 'demo-central')).toBe(true)
    expect(canAccess('admissions.delete', get('demo-owner'), 'demo-central')).toBe(false)
    expect(canAccess('admissions.delete', get('demo-reception'), 'demo-north')).toBe(false)
    expect(canAccess('admissions.decide', get('demo-admin'), 'demo-central')).toBe(true)
    expect(canAccess('admissions.decide', get('demo-owner'), 'demo-central')).toBe(false)
    expect(canAccess('admissions.decide', get('demo-reception'), 'demo-north')).toBe(false)
    expect(canAccess(PERMISSIONS.ADMISSIONS_VIEW, get('demo-multi'), 'demo-central')).toBe(false)
  })

  it.each([null, {}, { enabled: true, assignments: [null] },
    { enabled: true, assignments: [{ branchId: 'demo-central', roles: [] }] },
    { enabled: true, assignments: [{ branchId: 'demo-central', roles: ['teacher', 'unknown'] }] },
    { enabled: true, assignments: [{ branchId: 'demo-central', roles: ['teacher'] }, { branchId: 'demo-central', roles: ['owner'] }] },
  ])('fails closed for malformed/ambiguous assignments %j', (user) => {
    expect(getBranchRoles(user, 'demo-central')).toEqual([])
    expect(getAuthorizedBranches(user)).toEqual([])
    expect(canAccess('workspace.view', user, 'demo-central')).toBe(false)
  })

  it('does not leak roles across branches or expose mutable fixture arrays', () => {
    const user = DEMO_USERS.find((candidate) => candidate.id === 'demo-multi')
    const roles = getBranchRoles(user, 'demo-north')
    expect(roles).toEqual(['teacher'])
    roles.push('owner')
    expect(getBranchRoles(user, 'demo-north')).toEqual(['teacher'])
    expect(getBranchRoles(user, 'demo-central')).toEqual(['teacher', 'receptionist'])
    expect(getBranchRoles(user, 'all')).toEqual([])
  })
})
