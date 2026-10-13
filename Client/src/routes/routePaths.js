/**
 * Purpose: Will define route Paths for the routes area of the Academy frontend.
 * Module: routes
 * Status: Planned — functionality not implemented.
 */

// F00-002A: Central paths for the currently implemented public routes.
export const ROUTE_PATHS = Object.freeze({
  ROOT: '/',
  LOGIN: '/login',
  SELECT_BRANCH: '/select-branch',
  WORKSPACE: '/workspace',
  DASHBOARD: '/dashboard',
  ADMISSIONS: '/admissions',
  STUDENTS: '/students',
  STUDENT_PROFILE: '/students/:studentId',
  COURSES_BATCHES: '/courses-batches',
  FACULTY_CLASSES: '/faculty',
  FACULTY_PROFILE: '/faculty/:teacherId',
  FACULTY_SUBJECTS: '/faculty/subjects',
  FACULTY_BATCHES: '/faculty/batches',
  CLASS_SCHEDULE: '/faculty/schedule',
  CLASS_STUDENTS: '/faculty/classes/:batchId',
  NEW_ADMISSION: '/admissions/new',
  FEES: '/fees',
  FINANCE: '/finance',
  DEMO_CLASSES: '/demo-classes',
  ASSETS: '/assets',
  REPORTS: '/reports',
  BRANCHES: '/branches',
  USERS: '/users',
  SETTINGS: '/settings',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
})
