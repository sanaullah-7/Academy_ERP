/**
 * Purpose: Will define use Permissions for the hooks area of the Academy frontend.
 * Module: hooks
 * Status: Planned — functionality not implemented.
 */

// F00-005: Approved frontend demo implementation; not production authentication.
import { useAuth } from './useAuth.js'
import { useBranch } from './useBranch.js'
import { canAccess } from '../constants/permissions.js'
import { isKnownRole } from '../constants/roles.js'

export function usePermissions() {
  const { user, status } = useAuth()
  const { branchId, roles } = useBranch()
  return {
    can: (permission) => status === 'ready' && canAccess(permission, user, branchId),
    roles,
    // Membership is informational, not an alternative authorization check.
    hasRole: (role) => status === 'ready' && isKnownRole(role) && roles.includes(role),
  }
}
