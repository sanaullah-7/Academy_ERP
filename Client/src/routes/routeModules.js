import { lazy } from 'react'

const loaders = {
  AuditLogPage: () => import('../pages/AuditLog/AuditLogPage.jsx'),
  DashboardPage: () => import('../pages/Dashboard/DashboardPage.jsx'),
  AdmissionsPage: () => import('../pages/Admissions/AdmissionsPage.jsx'),
  StudentsPage: () => import('../pages/Students/StudentsPage.jsx'),
  StudentProfilePage: () => import('../pages/Students/StudentProfilePage.jsx'),
  CoursesBatchesPage: () => import('../pages/CoursesBatches/CoursesBatchesPage.jsx'),
  FacultyClassesPage: () => import('../pages/FacultyClasses/FacultyClassesPage.jsx'),
  FacultyProfilePage: () => import('../pages/FacultyClasses/FacultyProfilePage.jsx'),
  ClassDetailsPage: () => import('../pages/FacultyClasses/ClassDetailsPage.jsx'),
  FeesPage: () => import('../pages/Fees/FeesPage.jsx'),
  FinancePage: () => import('../pages/Finance/FinancePage.jsx'),
  DemoClassesPage: () => import('../pages/DemoClasses/DemoClassesPage.jsx'),
  AssetsPage: () => import('../pages/Assets/AssetsPage.jsx'),
  ReportsPage: () => import('../pages/Reports/ReportsPage.jsx'),
  BranchesPage: () => import('../pages/BranchManagement/BranchesPage.jsx'),
  UsersPage: () => import('../pages/UserManagement/UsersPage.jsx'),
  SettingsPage: () => import('../pages/Settings/SettingsPage.jsx'),
}
const pending = new Map()
function load(name) {
  if (!pending.has(name)) pending.set(name, loaders[name]().catch(error => { pending.delete(name); throw error }))
  return pending.get(name)
}

export const DashboardPage = lazy(() => load('DashboardPage'))
export const AdmissionsPage = lazy(() => load('AdmissionsPage'))
export const StudentsPage = lazy(() => load('StudentsPage'))
export const StudentProfilePage = lazy(() => load('StudentProfilePage'))
export const CoursesBatchesPage = lazy(() => load('CoursesBatchesPage'))
export const FacultyClassesPage = lazy(() => load('FacultyClassesPage'))
export const FacultyProfilePage = lazy(() => load('FacultyProfilePage'))
export const ClassDetailsPage = lazy(() => load('ClassDetailsPage'))
export const FeesPage = lazy(() => load('FeesPage'))
export const FinancePage = lazy(() => load('FinancePage'))
export const DemoClassesPage = lazy(() => load('DemoClassesPage'))
export const AssetsPage = lazy(() => load('AssetsPage'))
export const ReportsPage = lazy(() => load('ReportsPage'))
export const BranchesPage = lazy(() => load('BranchesPage'))
export const UsersPage = lazy(() => load('UsersPage'))
export const SettingsPage = lazy(() => load('SettingsPage'))

const routeModules = { '/audit-log': 'AuditLogPage', '/dashboard': 'DashboardPage', '/admissions': 'AdmissionsPage', '/students': 'StudentsPage', '/courses-batches': 'CoursesBatchesPage', '/faculty': 'FacultyClassesPage', '/fees': 'FeesPage', '/finance': 'FinancePage', '/demo-classes': 'DemoClassesPage', '/assets': 'AssetsPage', '/reports': 'ReportsPage', '/branches': 'BranchesPage', '/users': 'UsersPage', '/settings': 'SettingsPage' }
export function preloadRoute(path) {
  const name = routeModules[path]
  if (name) void load(name).catch(() => {}) // Navigation owns visible import errors.
}

export const AuditLogPage = lazy(() => load('AuditLogPage'))
