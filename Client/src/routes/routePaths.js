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
  NEW_ADMISSION: '/admissions/new',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
})
