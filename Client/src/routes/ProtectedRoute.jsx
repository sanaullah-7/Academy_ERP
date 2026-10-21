import { Suspense } from 'react'
/**
 * Purpose: Will define Protected Route for the routes area of the Academy frontend.
 * Module: routes
 * Status: Planned — functionality not implemented.
 */

// F00-005: Minimal approved demo access flow.
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useBranch } from '../hooks/useBranch.js'
import { usePermissions } from '../hooks/usePermissions.js'
import { PERMISSIONS } from '../constants/permissions.js'
import { ROUTE_PATHS } from './routePaths.js'
import SessionStatus from '../components/Auth/SessionStatus.jsx'

export default function ProtectedRoute({ children, permission = PERMISSIONS.DASHBOARD_VIEW }) {
  const { user, status } = useAuth()
  const { branches, branch, scopeKey } = useBranch()
  const { can } = usePermissions()
  if (status === 'loading') return <SessionStatus />
  if (!user) return <Navigate to={ROUTE_PATHS.LOGIN} replace />
  if (branches.length === 0) return <Navigate to={ROUTE_PATHS.UNAUTHORIZED} replace />
  if (!branch) return <Navigate to={ROUTE_PATHS.SELECT_BRANCH} replace />
  if (!can(permission)) return <Navigate to={ROUTE_PATHS.UNAUTHORIZED} replace />
  return <div key={scopeKey}><Suspense fallback={<SessionStatus message="Loading module..." />}>{children}</Suspense></div>
}
