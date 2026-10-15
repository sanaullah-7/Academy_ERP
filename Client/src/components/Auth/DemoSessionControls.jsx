import { Link, useLocation } from 'react-router-dom'
import { LogOut, PanelsTopLeft } from 'lucide-react'
import { Button } from '../ui/button.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import BranchSwitcher from '../Layout/BranchSwitcher.jsx'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

export default function DemoSessionControls() {
  const { user, status, logout } = useAuth()
  const { pathname } = useLocation()
  if (status === 'loading') return <span className="text-xs text-muted-foreground" role="status">Loading…</span>
  if (!user) return <Button asChild variant="outline" size="sm"><Link to={ROUTE_PATHS.LOGIN}>Demo login</Link></Button>
  return (
    <div className="flex min-w-0 items-center gap-2">
      <BranchSwitcher />
      {pathname !== ROUTE_PATHS.WORKSPACE && <Button asChild variant="outline" size="icon"><Link to={ROUTE_PATHS.WORKSPACE} aria-label="Open demo workspace"><PanelsTopLeft size={18} aria-hidden="true" /></Link></Button>}
      <Button variant="outline" size="icon" aria-label="Log out of demo" onClick={() => void logout()}><LogOut size={18} aria-hidden="true" /></Button>
    </div>
  )
}
