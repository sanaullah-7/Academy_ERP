import { usePermissions } from '../../hooks/usePermissions.js'
import PermissionNotice from './PermissionNotice.jsx'

// UI-only permission boundary; real authorization belongs in the approved backend.
export default function PermissionGate({ permission, children, fallback = <PermissionNotice /> }) {
  const { can } = usePermissions()
  return can(permission) ? children : fallback
}
