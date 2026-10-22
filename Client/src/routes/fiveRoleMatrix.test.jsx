import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App.jsx'
import { authService } from '../services/authService.js'
import { organizationService } from '../services/organizationService.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
import { ROLES } from '../constants/roles.js'
import { visibleModules } from '../constants/moduleAccess.js'
import { readOrganization, writeOrganization } from '../mock/mockOrganization.js'
import { DEMO_USERS } from '../mock/authFixtures.js'
import { BRANCH_CREATION_PAUSED_MESSAGE } from '../constants/branchPolicy.js'

async function mountAppAs(userId, branchId, path = '/dashboard') {
  await authService.login({ userId })
  await authService.selectBranch(userId, branchId)
  history.replaceState(null, '', path)
  return render(<App />)
}

describe('TSA ERP — Comprehensive Five-Role Permission Matrix & Boundaries', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('1. Permission Matrix Assertions (All 31 Permissions)', () => {
    it('Super Admin has all 31 permissions across authorized branches', () => {
      const superAdmin = DEMO_USERS.find(u => u.id === 'demo-admin')
      const allPerms = Object.values(PERMISSIONS)
      expect(allPerms).toHaveLength(31)

      for (const perm of allPerms) {
        expect(canAccess(perm, superAdmin, 'demo-north')).toBe(true)
        expect(canAccess(perm, superAdmin, 'demo-central')).toBe(true)
      }
    })

    it('Admin has all 31 operational permissions in authorized branch, but zero in unauthorized branches', async () => {
      await authService.login({ userId: 'demo-admin' })
      await authService.selectBranch('demo-admin', 'demo-north')
      const createdAdmin = await organizationService.saveUser({
        name: 'Matrix Branch Admin',
        login: 'matrix-admin@scholar.test',
        assignments: [{ branchId: 'demo-north', roles: [ROLES.ADMIN] }],
      })

      const allPerms = Object.values(PERMISSIONS)
      for (const perm of allPerms) {
        expect(canAccess(perm, createdAdmin, 'demo-north')).toBe(true)
        expect(canAccess(perm, createdAdmin, 'demo-central')).toBe(false)
      }
    })

    it('Receptionist has full Admissions (including delete), full Fees (including manage), and zero administrative or payroll permissions', () => {
      const reception = DEMO_USERS.find(u => u.id === 'demo-reception')
      const branchId = 'demo-north'

      // Allowed permissions: full Admissions (all 5) + full Fees (all 3) + existing front-desk operations
      const expectedAllowed = [
        PERMISSIONS.DASHBOARD_VIEW,
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
      ]

      for (const perm of expectedAllowed) {
        expect(canAccess(perm, reception, branchId)).toBe(true)
      }

      // Explicitly Denied permissions (Finance, Payroll, Audit, Branches, Users, Settings, Academic deletion)
      const expectedDenied = [
        PERMISSIONS.STUDENTS_DELETE,
        PERMISSIONS.COURSES_CREATE,
        PERMISSIONS.COURSES_EDIT,
        PERMISSIONS.COURSES_DELETE,
        PERMISSIONS.FACULTY_CREATE,
        PERMISSIONS.FACULTY_EDIT,
        PERMISSIONS.FACULTY_DELETE,
        PERMISSIONS.CLASSES_DELETE,
        PERMISSIONS.FINANCE_VIEW,
        PERMISSIONS.PAYROLL_VIEW,
        PERMISSIONS.EXPENSES_MANAGE,
        PERMISSIONS.AUDIT_VIEW,
        PERMISSIONS.BRANCHES_MANAGE,
        PERMISSIONS.USERS_MANAGE,
        PERMISSIONS.SETTINGS_MANAGE,
      ]

      for (const perm of expectedDenied) {
        expect(canAccess(perm, reception, branchId)).toBe(false)
      }
    })

    it('Owner has financial overview and view-only academic permissions, but no administrative access', () => {
      const owner = DEMO_USERS.find(u => u.id === 'demo-owner')
      const branchId = 'demo-central'

      // Allowed
      const expectedAllowed = [
        PERMISSIONS.DASHBOARD_VIEW,
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
      ]

      for (const perm of expectedAllowed) {
        expect(canAccess(perm, owner, branchId)).toBe(true)
      }

      // Denied
      const expectedDenied = [
        PERMISSIONS.AUDIT_VIEW,
        PERMISSIONS.BRANCHES_MANAGE,
        PERMISSIONS.USERS_MANAGE,
        PERMISSIONS.SETTINGS_MANAGE,
        PERMISSIONS.ADMISSIONS_CREATE,
        PERMISSIONS.ADMISSIONS_EDIT,
        PERMISSIONS.ADMISSIONS_DECIDE,
        PERMISSIONS.ADMISSIONS_DELETE,
        PERMISSIONS.FEES_COLLECT,
        PERMISSIONS.FEES_MANAGE,
        PERMISSIONS.DEMO_CLASSES_MANAGE,
        PERMISSIONS.ASSETS_MANAGE,
      ]

      for (const perm of expectedDenied) {
        expect(canAccess(perm, owner, branchId)).toBe(false)
      }
    })

    it('Teacher has only dashboard.view in base ERP permissions (assigned-records-only model)', () => {
      const teacher = DEMO_USERS.find(u => u.id === 'demo-teacher')
      const branchId = 'demo-central'

      expect(canAccess(PERMISSIONS.DASHBOARD_VIEW, teacher, branchId)).toBe(true)

      const nonDashboardPerms = Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.DASHBOARD_VIEW)
      for (const perm of nonDashboardPerms) {
        expect(canAccess(perm, teacher, branchId)).toBe(false)
      }
    })
  })

  describe('2. Sidebar Module Visibility (Academics, Operations, Administration)', () => {
    it('Super Admin and Admin see all 15 navigation items', async () => {
      const superAdmin = DEMO_USERS.find(u => u.id === 'demo-admin')
      const superLabels = visibleModules(p => canAccess(p, superAdmin, 'demo-central')).map(m => m.label)
      expect(superLabels).toEqual([
        'Dashboard', 'Admissions', 'Students', 'Courses & Batches', 'Faculty & Classes',
        'Fees', 'Finance', 'Teacher Payroll', 'Demo Classes', 'Assets', 'Reports',
        'Audit Log', 'Branches', 'Users', 'Settings',
      ])

      // Admin fixture
      await authService.login({ userId: 'demo-admin' })
      await authService.selectBranch('demo-admin', 'demo-central')
      const adminUser = await organizationService.saveUser({
        name: 'Test Branch Admin',
        login: 'nav-admin@scholar.test',
        assignments: [{ branchId: 'demo-central', roles: [ROLES.ADMIN] }],
      })
      const adminLabels = visibleModules(p => canAccess(p, adminUser, 'demo-central')).map(m => m.label)
      expect(adminLabels).toHaveLength(15)
      expect(adminLabels).toEqual(superLabels)
    })

    it('Receptionist sees exactly 9 operational items (no Finance, Audit, Branches, Users, Settings)', () => {
      const reception = DEMO_USERS.find(u => u.id === 'demo-reception')
      const labels = visibleModules(p => canAccess(p, reception, 'demo-north')).map(m => m.label)

      expect(labels).toHaveLength(9)
      expect(labels).toEqual([
        'Dashboard',
        'Admissions',
        'Students',
        'Courses & Batches',
        'Faculty & Classes',
        'Fees',
        'Demo Classes',
        'Assets',
        'Reports',
      ])

      // Confirm prohibited modules are hidden
      expect(labels).not.toContain('Finance')
      expect(labels).not.toContain('Teacher Payroll')
      expect(labels).not.toContain('Audit Log')
      expect(labels).not.toContain('Branches')
      expect(labels).not.toContain('Users')
      expect(labels).not.toContain('Settings')
    })

    it('Owner sees exactly 11 modules (Academics + Operations, no Administration)', () => {
      const owner = DEMO_USERS.find(u => u.id === 'demo-owner')
      const labels = visibleModules(p => canAccess(p, owner, 'demo-central')).map(m => m.label)

      expect(labels).toHaveLength(11)
      expect(labels).toEqual([
        'Dashboard',
        'Admissions',
        'Students',
        'Courses & Batches',
        'Faculty & Classes',
        'Fees',
        'Finance',
        'Teacher Payroll',
        'Demo Classes',
        'Assets',
        'Reports',
      ])

      expect(labels).not.toContain('Audit Log')
      expect(labels).not.toContain('Branches')
      expect(labels).not.toContain('Users')
      expect(labels).not.toContain('Settings')
    })

    it('Teacher sees only 1 module (Dashboard)', () => {
      const teacher = DEMO_USERS.find(u => u.id === 'demo-teacher')
      const labels = visibleModules(p => canAccess(p, teacher, 'demo-central')).map(m => m.label)

      expect(labels).toHaveLength(1)
      expect(labels).toEqual(['Dashboard'])
    })
  })

  describe('3. Route Guards & /unauthorized Redirection', () => {
    it('redirects Receptionist to /unauthorized when accessing restricted administrative URLs', async () => {
      await mountAppAs('demo-reception', 'demo-north', '/settings')
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Access unavailable/i })).toBeInTheDocument()
      })
    })

    it('redirects Receptionist to /unauthorized when accessing /finance/payroll', async () => {
      await mountAppAs('demo-reception', 'demo-north', '/finance/payroll')
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Access unavailable/i })).toBeInTheDocument()
      })
    })

    it('redirects Owner to /unauthorized when accessing /audit-log', async () => {
      await mountAppAs('demo-owner', 'demo-central', '/audit-log')
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Access unavailable/i })).toBeInTheDocument()
      })
    })

    it('redirects Owner to /unauthorized when accessing /users', async () => {
      await mountAppAs('demo-owner', 'demo-central', '/users')
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Access unavailable/i })).toBeInTheDocument()
      })
    })

    it('redirects Teacher to /unauthorized when accessing /admissions', async () => {
      await mountAppAs('demo-teacher', 'demo-central', '/admissions')
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Access unavailable/i })).toBeInTheDocument()
      })
    })

    it('allows Admin to access /settings cleanly without unauthorized redirect', async () => {
      await authService.login({ userId: 'demo-admin' })
      await authService.selectBranch('demo-admin', 'demo-north')
      const admin = await organizationService.saveUser({
        name: 'Route Test Admin',
        login: 'route-admin@scholar.test',
        assignments: [{ branchId: 'demo-north', roles: [ROLES.ADMIN] }],
      })

      await mountAppAs(admin.id, 'demo-north', '/settings')
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /Access unavailable/i })).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /Settings/i })).toBeInTheDocument()
      })
    })
  })

  describe('4. Escalation Prevention & Service Boundary Hardening', () => {
    it('blocks Admin from switching to a Super Admin account via switchAccount', async () => {
      await authService.login({ userId: 'demo-admin' })
      await authService.selectBranch('demo-admin', 'demo-north')
      const admin = await organizationService.saveUser({
        name: 'Escalation Test Admin',
        login: 'escalation-admin@scholar.test',
        assignments: [{ branchId: 'demo-north', roles: [ROLES.ADMIN] }],
      })

      await authService.login({ userId: admin.id })
      await authService.selectBranch(admin.id, 'demo-north')

      await expect(authService.switchAccount('demo-admin')).rejects.toThrow(
        /Admin cannot switch to or escalate to a Super Admin account/i
      )
    })

    it('enforces branch creation pause and protects against Super Admin role escalation', async () => {
      await authService.login({ userId: 'demo-admin' })
      await authService.selectBranch('demo-admin', 'demo-north')
      const admin = await organizationService.saveUser({
        name: 'Branch Creator Admin',
        login: 'branch-creator@scholar.test',
        assignments: [{ branchId: 'demo-north', roles: [ROLES.ADMIN] }],
      })

      await authService.login({ userId: admin.id })
      await authService.selectBranch(admin.id, 'demo-north')

      // Verifies policy enforcement on saveBranch
      await expect(organizationService.saveBranch({
        name: 'Admin Created Campus',
        code: 'ACC',
        location: 'Branch Road',
        contact: '03001112233',
      })).rejects.toThrow(BRANCH_CREATION_PAUSED_MESSAGE)
    })

    it('blocks Admin from assigning Super Admin or Admin roles to staff', async () => {
      await authService.login({ userId: 'demo-admin' })
      await authService.selectBranch('demo-admin', 'demo-north')
      const admin = await organizationService.saveUser({
        name: 'Assigner Admin',
        login: 'assigner-admin@scholar.test',
        assignments: [{ branchId: 'demo-north', roles: [ROLES.ADMIN] }],
      })

      await authService.login({ userId: admin.id })
      await authService.selectBranch(admin.id, 'demo-north')

      await expect(organizationService.saveUser({
        name: 'Illegal Super Admin',
        login: 'illegal-super@scholar.test',
        assignments: [{ branchId: 'demo-north', roles: [ROLES.SUPER_ADMIN] }],
      })).rejects.toThrow(/Admin can assign only Owner, Receptionist or Teacher/i)

      await expect(organizationService.saveUser({
        name: 'Illegal Admin',
        login: 'illegal-admin@scholar.test',
        assignments: [{ branchId: 'demo-north', roles: [ROLES.ADMIN] }],
      })).rejects.toThrow(/Admin can assign only Owner, Receptionist or Teacher/i)
    })
  })

  describe('5. Multi-Branch Dynamic Recalculation', () => {
    it('recalculates permissions dynamically when user switches between branches with different roles', async () => {
      await authService.login({ userId: 'demo-admin' })
      await authService.selectBranch('demo-admin', 'demo-north')

      // Create a staff user assigned as Admin in North, but Teacher in Central
      const user = await organizationService.saveUser({
        name: 'Dual Role Staff',
        login: 'dual-role@scholar.test',
        assignments: [{ branchId: 'demo-north', roles: [ROLES.ADMIN] }],
      })

      const store = readOrganization()
      const targetUser = store.users.find(u => u.id === user.id)
      targetUser.assignments.push({ branchId: 'demo-central', roles: [ROLES.TEACHER] })
      writeOrganization(store)

      // Login in demo-north (Admin)
      await authService.login({ userId: user.id })
      await authService.selectBranch(user.id, 'demo-north')
      let session = await authService.getSession()
      expect(canAccess(PERMISSIONS.SETTINGS_MANAGE, session.user, 'demo-north')).toBe(true)
      expect(canAccess(PERMISSIONS.USERS_MANAGE, session.user, 'demo-north')).toBe(true)
      expect(visibleModules(p => canAccess(p, session.user, 'demo-north'))).toHaveLength(15)

      // Switch to demo-central (Teacher)
      await authService.selectBranch(user.id, 'demo-central')
      session = await authService.getSession()
      expect(canAccess(PERMISSIONS.SETTINGS_MANAGE, session.user, 'demo-central')).toBe(false)
      expect(canAccess(PERMISSIONS.USERS_MANAGE, session.user, 'demo-central')).toBe(false)
      expect(visibleModules(p => canAccess(p, session.user, 'demo-central'))).toHaveLength(1)
    })
  })
})
