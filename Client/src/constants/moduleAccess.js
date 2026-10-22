import { PERMISSIONS } from './permissions.js'
import { ROUTE_PATHS } from '../routes/routePaths.js'

// One registry drives every module-discovery surface. Domain result providers
// stay separate, while their module visibility always comes from this list.
export const MODULE_ACCESS = Object.freeze([
  { id: 'dashboard', group: 'Academics', label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD, permission: PERMISSIONS.DASHBOARD_VIEW },
  { id: 'admissions', group: 'Academics', label: 'Admissions', path: ROUTE_PATHS.ADMISSIONS, permission: PERMISSIONS.ADMISSIONS_VIEW },
  { id: 'students', group: 'Academics', label: 'Students', path: ROUTE_PATHS.STUDENTS, permission: PERMISSIONS.STUDENTS_VIEW },
  { id: 'courses', group: 'Academics', label: 'Courses & Batches', path: ROUTE_PATHS.COURSES_BATCHES, permission: PERMISSIONS.COURSES_VIEW },
  { id: 'faculty', group: 'Academics', label: 'Faculty & Classes', path: ROUTE_PATHS.FACULTY_CLASSES, permission: PERMISSIONS.FACULTY_VIEW },
  { id: 'fees', group: 'Operations', label: 'Fees', path: ROUTE_PATHS.FEES, permission: PERMISSIONS.FEES_VIEW },
  { id: 'finance', group: 'Operations', label: 'Finance', path: ROUTE_PATHS.FINANCE, permission: PERMISSIONS.FINANCE_VIEW },
  { id: 'payroll', group: 'Operations', label: 'Teacher Payroll', path: ROUTE_PATHS.PAYROLL, permission: PERMISSIONS.PAYROLL_VIEW, nested: true },
  { id: 'demoClasses', group: 'Operations', label: 'Demo Classes', path: ROUTE_PATHS.DEMO_CLASSES, permission: PERMISSIONS.DEMO_CLASSES_VIEW },
  { id: 'assets', group: 'Operations', label: 'Assets', path: ROUTE_PATHS.ASSETS, permission: PERMISSIONS.ASSETS_VIEW },
  { id: 'reports', group: 'Operations', label: 'Reports', path: ROUTE_PATHS.REPORTS, permission: PERMISSIONS.REPORTS_VIEW },
  { id: 'audit', group: 'Administration', label: 'Audit Log', path: ROUTE_PATHS.AUDIT_LOG, permission: PERMISSIONS.AUDIT_VIEW },
  { id: 'branches', group: 'Administration', label: 'Branches', path: ROUTE_PATHS.BRANCHES, permission: PERMISSIONS.BRANCHES_MANAGE },
  { id: 'users', group: 'Administration', label: 'Users', path: ROUTE_PATHS.USERS, permission: PERMISSIONS.USERS_MANAGE },
  { id: 'settings', group: 'Administration', label: 'Settings', path: ROUTE_PATHS.SETTINGS, permission: PERMISSIONS.SETTINGS_MANAGE },
])

export const visibleModules = (can, { includeNested = true } = {}) => MODULE_ACCESS.filter(module => (includeNested || !module.nested) && can(module.permission))
