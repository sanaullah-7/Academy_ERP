/**
 * Purpose: Will define App Router for the routes area of the Academy frontend.
 * Module: routes
 * Status: Planned — functionality not implemented.
 */

// F00-002A: Basic routing implemented; authentication and layouts remain deferred.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import NotFoundPage from '../pages/Errors/NotFoundPage.jsx'
import { ROUTE_PATHS } from './routePaths.js'
import LoginPage from '../pages/Auth/LoginPage.jsx'
import SelectBranchPage from '../pages/Auth/SelectBranchPage.jsx'
import WorkspacePage from '../pages/Auth/WorkspacePage.jsx'
import UnauthorizedPage from '../pages/Errors/UnauthorizedPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import DashboardPage from '../pages/Dashboard/DashboardPage.jsx'
import AdmissionsPage from '../pages/Admissions/AdmissionsPage.jsx'
import StudentsPage from '../pages/Students/StudentsPage.jsx'
import StudentProfilePage from '../pages/Students/StudentProfilePage.jsx'
import CoursesBatchesPage from '../pages/CoursesBatches/CoursesBatchesPage.jsx'
import FacultyClassesPage from '../pages/FacultyClasses/FacultyClassesPage.jsx'
import FacultyProfilePage from '../pages/FacultyClasses/FacultyProfilePage.jsx'
import ClassDetailsPage from '../pages/FacultyClasses/ClassDetailsPage.jsx'
import ComingSoonPage from '../pages/ComingSoon/ComingSoonPage.jsx'
import FeesPage from '../pages/Fees/FeesPage.jsx'
import FinancePage from '../pages/Finance/FinancePage.jsx'
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
        <Route path={ROUTE_PATHS.COURSES_BATCHES} element={<ProtectedRoute permission={PERMISSIONS.COURSES_VIEW}><CoursesBatchesPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.FACULTY_CLASSES} element={<ProtectedRoute permission={PERMISSIONS.FACULTY_VIEW}><FacultyClassesPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.FACULTY_SUBJECTS} element={<ProtectedRoute permission={PERMISSIONS.FACULTY_VIEW}><FacultyClassesPage section="subjects" /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.FACULTY_BATCHES} element={<ProtectedRoute permission={PERMISSIONS.FACULTY_VIEW}><FacultyClassesPage section="batches" /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.CLASS_SCHEDULE} element={<ProtectedRoute permission={PERMISSIONS.CLASSES_VIEW}><FacultyClassesPage section="schedule" /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.CLASS_STUDENTS} element={<ProtectedRoute permission={PERMISSIONS.CLASSES_VIEW}><ClassDetailsPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.FACULTY_PROFILE} element={<ProtectedRoute permission={PERMISSIONS.FACULTY_VIEW}><FacultyProfilePage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.NEW_ADMISSION} element={<ProtectedRoute permission={PERMISSIONS.ADMISSIONS_CREATE}><Navigate to={ROUTE_PATHS.ADMISSIONS} replace state={{ focusNewAdmission: true }} /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.FEES} element={<ProtectedRoute permission={PERMISSIONS.FEES_VIEW}><FeesPage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.FINANCE} element={<ProtectedRoute permission={PERMISSIONS.FINANCE_VIEW}><FinancePage /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.DEMO_CLASSES} element={<ProtectedRoute><ComingSoonPage moduleName="Demo Classes" /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.ASSETS} element={<ProtectedRoute><ComingSoonPage moduleName="Assets" /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.REPORTS} element={<ProtectedRoute><ComingSoonPage moduleName="Reports" /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.BRANCHES} element={<ProtectedRoute><ComingSoonPage moduleName="Branches" /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.USERS} element={<ProtectedRoute><ComingSoonPage moduleName="Users" /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.SETTINGS} element={<ProtectedRoute><ComingSoonPage moduleName="Settings" /></ProtectedRoute>} />
        <Route path={ROUTE_PATHS.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path={ROUTE_PATHS.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
