/**
 * Purpose: Will define Login Page for the Auth area of the Academy frontend.
 * Module: Auth
 * Status: Planned — functionality not implemented.
 */

// F00-005: Minimal approved demo access flow.
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useBranch } from '../../hooks/useBranch.js'
import { DEMO_USERS } from '../../mock/authFixtures.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx'
import SessionStatus from '../../components/Auth/SessionStatus.jsx'

export default function LoginPage() {
  const { user, status, error, login } = useAuth()
  const { branch } = useBranch()
  const [userId, setUserId] = useState('')
  if (status === 'loading') return <SessionStatus />
  if (user) return <Navigate to={branch ? ROUTE_PATHS.WORKSPACE : ROUTE_PATHS.SELECT_BRANCH} replace />
  return (
    <main className="demo-access-page">
      <Card className="demo-access-card">
        <CardHeader><CardTitle><h1 className="text-2xl">Demo login</h1></CardTitle><CardDescription>Choose a fictional account. This is frontend mock authentication, not production security.</CardDescription></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void login(userId) }}>
            <label className="grid gap-2" htmlFor="demo-account">Demo account
              <select id="demo-account" className="demo-select" value={userId} onChange={(event) => setUserId(event.target.value)} required>
                <option value="" disabled>Select a demo account</option>
                {DEMO_USERS.filter((candidate) => candidate.enabled).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
              </select>
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={!userId}>Continue with demo account</Button>
            <Button asChild variant="link"><Link to={ROUTE_PATHS.ROOT}>Return home</Link></Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
