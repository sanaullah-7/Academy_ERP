/**
 * Purpose: Will define Unauthorized Page for the Errors area of the Academy frontend.
 * Module: Errors
 * Status: Planned — functionality not implemented.
 */

// F00-005: Minimal approved demo access flow.
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import PermissionNotice from '../../components/Auth/PermissionNotice.jsx'

export default function UnauthorizedPage() {
  const { user, logout } = useAuth()
  return <main className="demo-access-page"><Card className="demo-access-card">
    <CardHeader><CardTitle><h1 className="text-2xl">Access unavailable</h1></CardTitle><CardDescription><PermissionNotice /></CardDescription></CardHeader>
    <CardContent className="grid gap-3"><Button asChild><Link to={ROUTE_PATHS.ROOT}>Return home</Link></Button>{user && <Button variant="outline" onClick={() => void logout()}>Log out of demo</Button>}</CardContent>
  </Card></main>
}
