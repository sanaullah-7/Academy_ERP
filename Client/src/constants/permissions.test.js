import { describe, expect, it } from 'vitest'
import { canAccess, isKnownPermission, PERMISSIONS } from './permissions.js'
import { getBranchRoles, ROLES } from './roles.js'
import { DEMO_USERS, getAuthorizedBranches } from '../mock/authFixtures.js'

describe('approved roles and permission definitions', () => {
  it('defines only four roles and the confirmed implemented module permissions', () => {
    expect(Object.values(ROLES)).toEqual(['super_admin', 'owner', 'receptionist', 'teacher'])
    expect(Object.values(PERMISSIONS)).toEqual(['dashboard.view', 'admissions.view', 'admissions.create', 'admissions.edit', 'admissions.delete', 'admissions.decide', 'students.view', 'students.create', 'students.edit', 'courses.view', 'courses.manage', 'faculty.view', 'classes.view', 'classes.manage', 'fees.manage', 'fees.view', 'fees.collect', 'finance.view', 'expenses.manage', 'demoClasses.view', 'demoClasses.manage', 'assets.view', 'assets.manage', 'reports.view', 'reports.compareBranches', 'branches.manage', 'users.manage', 'settings.manage', 'audit.view'])
    expect(isKnownPermission('dashboard.view')).toBe(true)
    expect(isKnownPermission('payments.reverse')).toBe(false)
  })

  it('fails closed outside the approved F09-F13 Super Admin demo authority', () => {
    const get = id => DEMO_USERS.find(user => user.id === id)
    expect(canAccess(PERMISSIONS.ASSETS_MANAGE, get('demo-admin'), 'demo-central')).toBe(true)
    expect(canAccess(PERMISSIONS.REPORTS_COMPARE_BRANCHES, get('demo-admin'), 'demo-central')).toBe(true)
    for (const userId of ['demo-owner', 'demo-reception', 'demo-teacher', 'demo-multi']) {
      expect(canAccess(PERMISSIONS.ASSETS_VIEW, get(userId), userId === 'demo-reception' ? 'demo-north' : 'demo-central')).toBe(false)
      expect(canAccess(PERMISSIONS.REPORTS_VIEW, get(userId), userId === 'demo-reception' ? 'demo-north' : 'demo-central')).toBe(false)
    }
  })

  it('applies the confirmed Courses & Batches role matrix', () => {
    const get = id => DEMO_USERS.find(user => user.id === id)
    expect(canAccess(PERMISSIONS.COURSES_MANAGE, get('demo-admin'), 'demo-north')).toBe(true)
    expect(canAccess(PERMISSIONS.COURSES_VIEW, get('demo-reception'), 'demo-north')).toBe(true)
    expect(canAccess(PERMISSIONS.COURSES_MANAGE, get('demo-reception'), 'demo-north')).toBe(false)
    expect(canAccess(PERMISSIONS.COURSES_VIEW, get('demo-owner'), 'demo-central')).toBe(true)
    expect(canAccess(PERMISSIONS.COURSES_VIEW, get('demo-teacher'), 'demo-central')).toBe(false)
    expect(canAccess(PERMISSIONS.COURSES_VIEW, get('demo-multi'), 'demo-central')).toBe(false)
  })

  it('applies confirmed single-role Admissions and Students access without a Super Admin bypass', () => {
    const get = id => DEMO_USERS.find(user => user.id === id)
    expect(canAccess(PERMISSIONS.ADMISSIONS_VIEW, get('demo-owner'), 'demo-central')).toBe(true)
    expect(canAccess(PERMISSIONS.ADMISSIONS_CREATE, get('demo-owner'), 'demo-central')).toBe(false)
    expect(canAccess(PERMISSIONS.ADMISSIONS_EDIT, get('demo-reception'), 'demo-north')).toBe(true)
    expect(canAccess(PERMISSIONS.ADMISSIONS_VIEW, get('demo-teacher'), 'demo-central')).toBe(false)
    expect(canAccess(PERMISSIONS.STUDENTS_VIEW, get('demo-owner'), 'demo-central')).toBe(true)
    expect(canAccess(PERMISSIONS.STUDENTS_VIEW, get('demo-teacher'), 'demo-central')).toBe(false)
    expect(canAccess(PERMISSIONS.FACULTY_VIEW, get('demo-admin'), 'demo-north')).toBe(true)
    expect(canAccess(PERMISSIONS.FACULTY_VIEW, get('demo-reception'), 'demo-north')).toBe(true)
    expect(canAccess(PERMISSIONS.FACULTY_VIEW, get('demo-owner'), 'demo-central')).toBe(true)
    expect(canAccess(PERMISSIONS.FACULTY_VIEW, get('demo-teacher'), 'demo-central')).toBe(false)
    expect(canAccess(PERMISSIONS.CLASSES_VIEW, get('demo-multi'), 'demo-central')).toBe(false)
    expect(canAccess(PERMISSIONS.FEES_MANAGE, get('demo-admin'), 'demo-north')).toBe(true)
    expect(canAccess(PERMISSIONS.FEES_MANAGE, get('demo-owner'), 'demo-central')).toBe(false)
    expect(canAccess('admissions.delete', get('demo-admin'), 'demo-central')).toBe(true)
    expect(canAccess('admissions.delete', get('demo-owner'), 'demo-central')).toBe(false)
    expect(canAccess('admissions.delete', get('demo-reception'), 'demo-north')).toBe(false)
    expect(canAccess('admissions.decide', get('demo-admin'), 'demo-central')).toBe(true)
    expect(canAccess('admissions.decide', get('demo-owner'), 'demo-central')).toBe(false)
    expect(canAccess('admissions.decide', get('demo-reception'), 'demo-north')).toBe(false)
    expect(canAccess(PERMISSIONS.ADMISSIONS_VIEW, get('demo-multi'), 'demo-central')).toBe(false)
  })

  it('applies the approved Fees and Finance role boundaries', () => {
    const get = id => DEMO_USERS.find(user => user.id === id)
    expect(canAccess(PERMISSIONS.FEES_MANAGE, get('demo-admin'), 'demo-central')).toBe(true)
    expect(canAccess(PERMISSIONS.FEES_VIEW, get('demo-reception'), 'demo-north')).toBe(true)
    expect(canAccess(PERMISSIONS.FEES_COLLECT, get('demo-reception'), 'demo-north')).toBe(true)
    expect(canAccess(PERMISSIONS.FEES_MANAGE, get('demo-reception'), 'demo-north')).toBe(false)
    expect(canAccess(PERMISSIONS.FEES_VIEW, get('demo-owner'), 'demo-central')).toBe(true)
    expect(canAccess(PERMISSIONS.FINANCE_VIEW, get('demo-owner'), 'demo-central')).toBe(true)
    expect(canAccess(PERMISSIONS.EXPENSES_MANAGE, get('demo-owner'), 'demo-central')).toBe(true)
    expect(canAccess(PERMISSIONS.FEES_VIEW, get('demo-teacher'), 'demo-central')).toBe(false)
    expect(canAccess(PERMISSIONS.FINANCE_VIEW, get('demo-teacher'), 'demo-central')).toBe(false)
    expect(canAccess(PERMISSIONS.FINANCE_VIEW, get('demo-multi'), 'demo-central')).toBe(false)
  })

  it.each([null, {}, { enabled: true, assignments: [null] },
    { enabled: true, assignments: [{ branchId: 'demo-central', roles: [] }] },
    { enabled: true, assignments: [{ branchId: 'demo-central', roles: ['teacher', 'unknown'] }] },
    { enabled: true, assignments: [{ branchId: 'demo-central', roles: ['teacher'] }, { branchId: 'demo-central', roles: ['owner'] }] },
  ])('fails closed for malformed/ambiguous assignments %j', (user) => {
    expect(getBranchRoles(user, 'demo-central')).toEqual([])
    expect(getAuthorizedBranches(user)).toEqual([])
    expect(canAccess('dashboard.view', user, 'demo-central')).toBe(false)
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
