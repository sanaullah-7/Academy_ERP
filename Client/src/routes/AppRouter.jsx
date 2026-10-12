/**
 * Purpose: Will define App Router for the routes area of the Academy frontend.
 * Module: routes
 * Status: Planned — functionality not implemented.
 */

// F00-002A: Basic routing implemented; authentication and layouts remain deferred.
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NotFoundPage from '../pages/Errors/NotFoundPage.jsx'
import { ROUTE_PATHS } from './routePaths.js'
import LoginPage from '../pages/Auth/LoginPage.jsx'
import SelectBranchPage from '../pages/Auth/SelectBranchPage.jsx'
import WorkspacePage from '../pages/Auth/WorkspacePage.jsx'
import UnauthorizedPage from '../pages/Errors/UnauthorizedPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import DashboardPage from '../pages/Dashboard/DashboardPage.jsx'
import AdmissionsPage from '../pages/Admissions/AdmissionsPage.jsx'
import NewAdmissionPage from '../pages/Admissions/NewAdmissionPage.jsx'
import StudentsPage from '../pages/Students/StudentsPage.jsx'
import StudentProfilePage from '../pages/Students/StudentProfilePage.jsx'
import { PERMISSIONS } from '../constants/permissions.js'

export default function AppRouter({ children }) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTE_PATHS.ROOT} element={children} />
        <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
        <Route path={ROUTE_PATHS.SELECT_BRANCH} element={<SelectBranchPage />} />
        <Route path={ROUTE_PATHS.WORKSPACE} element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.ADMISSIONS} element={<ProtectedRoute permission={PERMISSIONS.ADMISSIONS_VIEW}><AdmissionsPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.STUDENTS} element={<ProtectedRoute permission={PERMISSIONS.STUDENTS_VIEW}><StudentsPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.STUDENT_PROFILE} element={<ProtectedRoute permission={PERMISSIONS.STUDENTS_VIEW}><StudentProfilePage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.NEW_ADMISSION} element={<ProtectedRoute permission={PERMISSIONS.ADMISSIONS_CREATE}><NewAdmissionPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path={ROUTE_PATHS.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
