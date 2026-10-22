import { AuditLogPage, DashboardPage, AdmissionsPage, StudentsPage, StudentProfilePage, CoursesBatchesPage, FacultyClassesPage, FacultyProfilePage, ClassDetailsPage, FeesPage, FinancePage, DemoClassesPage, AssetsPage, ReportsPage, BranchesPage, UsersPage, SettingsPage } from './routeModules.js'
/**
 * Purpose: Will define App Router for the routes area of the Academy frontend.
 * Module: routes
 * Status: Planned � functionality not implemented.
 */

// F00-002A: Basic routing implemented; authentication and layouts remain deferred.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import NotFoundPage from '../pages/Errors/NotFoundPage.jsx'
import { ROUTE_PATHS } from './routePaths.js'
import LoginPage from '../pages/Auth/LoginPage.jsx'
import SelectBranchPage from '../pages/Auth/SelectBranchPage.jsx'
import UnauthorizedPage from '../pages/Errors/UnauthorizedPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

import { PERMISSIONS } from '../constants/permissions.js'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTE_PATHS.ROOT} element={<Navigate to={ROUTE_PATHS.LOGIN} replace />} />
        <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
        <Route path={ROUTE_PATHS.SELECT_BRANCH} element={<SelectBranchPage />} />
        <Route path={ROUTE_PATHS.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.MY_PROFILE} element={<ProtectedRoute><FacultyProfilePage isMyProfile={true} /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.ADMISSIONS} element={<ProtectedRoute permission={PERMISSIONS.ADMISSIONS_VIEW}><AdmissionsPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.STUDENTS} element={<ProtectedRoute permission={PERMISSIONS.STUDENTS_VIEW}><StudentsPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.STUDENT_PROFILE} element={<ProtectedRoute permission={PERMISSIONS.STUDENTS_VIEW}><StudentProfilePage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.COURSES_BATCHES} element={<ProtectedRoute permission={PERMISSIONS.COURSES_VIEW}><CoursesBatchesPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.FACULTY_CLASSES} element={<ProtectedRoute permission={PERMISSIONS.FACULTY_VIEW}><FacultyClassesPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.FACULTY_SUBJECTS} element={<ProtectedRoute permission={PERMISSIONS.FACULTY_VIEW}><FacultyClassesPage section="subjects" /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.FACULTY_BATCHES} element={<ProtectedRoute permission={PERMISSIONS.FACULTY_VIEW}><FacultyClassesPage section="batches" /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.CLASS_SCHEDULE} element={<ProtectedRoute permission={PERMISSIONS.CLASSES_VIEW}><Navigate to={ROUTE_PATHS.FACULTY_CLASSES} replace /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.CLASS_STUDENTS} element={<ProtectedRoute permission={PERMISSIONS.CLASSES_VIEW}><ClassDetailsPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.FACULTY_PROFILE} element={<ProtectedRoute permission={PERMISSIONS.FACULTY_VIEW}><FacultyProfilePage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.NEW_ADMISSION} element={<ProtectedRoute permission={PERMISSIONS.ADMISSIONS_CREATE}><Navigate to={ROUTE_PATHS.ADMISSIONS} replace state={{ focusNewAdmission: true }} /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.FEES} element={<ProtectedRoute permission={PERMISSIONS.FEES_VIEW}><FeesPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.FINANCE} element={<ProtectedRoute permission={PERMISSIONS.FINANCE_VIEW}><FinancePage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.PAYROLL} element={<ProtectedRoute permission={PERMISSIONS.PAYROLL_VIEW}><FinancePage initialTab="payroll" /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.DEMO_CLASSES} element={<ProtectedRoute permission={PERMISSIONS.DEMO_CLASSES_VIEW}><DemoClassesPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.ASSETS} element={<ProtectedRoute permission={PERMISSIONS.ASSETS_VIEW}><AssetsPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.REPORTS} element={<ProtectedRoute permission={PERMISSIONS.REPORTS_VIEW}><ReportsPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.BRANCHES} element={<ProtectedRoute permission={PERMISSIONS.BRANCHES_MANAGE}><BranchesPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.USERS} element={<ProtectedRoute permission={PERMISSIONS.USERS_MANAGE}><UsersPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.AUDIT_LOG} element={<ProtectedRoute permission={PERMISSIONS.AUDIT_VIEW}><AuditLogPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.SETTINGS} element={<ProtectedRoute permission={PERMISSIONS.SETTINGS_MANAGE}><SettingsPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path={ROUTE_PATHS.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
