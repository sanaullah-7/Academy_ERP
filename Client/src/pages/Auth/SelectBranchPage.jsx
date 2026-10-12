/**
 * Purpose: Will define Select Branch Page for the Auth area of the Academy frontend.
 * Module: Auth
 * Status: Planned — functionality not implemented.
 */

// F00-005: Minimal approved demo access flow.
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useBranch } from '../../hooks/useBranch.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx'
import SessionStatus from '../../components/Auth/SessionStatus.jsx'

export default function SelectBranchPage() {
  const { user, status, error, logout } = useAuth()
  const { branches, branch, selectBranch } = useBranch()
  const [selectedId, setSelectedId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  if (status === 'loading') return <SessionStatus />
  if (!user) return <Navigate to={ROUTE_PATHS.LOGIN} replace />
  if (!branches.length) return <Navigate to={ROUTE_PATHS.UNAUTHORIZED} replace />
  if (branch) return <Navigate to={ROUTE_PATHS.WORKSPACE} replace />
  async function submit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    await selectBranch(selectedId)
    setIsSubmitting(false)
  }
  return (
    <main className="demo-access-page">
      <Card className="demo-access-card">
        <CardHeader><CardTitle><h1 className="text-2xl">Select a demo branch</h1></CardTitle><CardDescription>{user.name} has multiple authorized branches. Choose one to continue.</CardDescription></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <label className="grid gap-2" htmlFor="demo-branch">Authorized branch
              <select id="demo-branch" className="demo-select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} required disabled={isSubmitting}>
                <option value="" disabled>Select a branch</option>
                {branches.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
              </select>
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={!selectedId || isSubmitting}>{isSubmitting ? 'Selecting…' : 'Open workspace'}</Button>
            <Button variant="outline" onClick={() => void logout()}>Log out of demo</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
