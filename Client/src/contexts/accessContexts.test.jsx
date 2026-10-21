import { useState } from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext.jsx'
import { BranchProvider } from './BranchContext.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useBranch } from '../hooks/useBranch.js'
import ProtectedRoute from '../routes/ProtectedRoute.jsx'
import { authService } from '../services/authService.js'

function Controls() {
  const { user, login, logout, error } = useAuth()
  const { branch, roles, selectBranch } = useBranch()
  return <>
    <p data-testid="identity">{user?.id ?? 'anonymous'}:{branch?.id ?? 'none'}:{roles.join(',')}</p>
    {error && <p role="alert">{error}</p>}
    <button onClick={() => void login('demo-owner')}>Change user</button>
    <button onClick={() => void selectBranch('demo-central')}>Select central</button>
    <button onClick={() => void logout()}>Logout</button>
  </>
}
function Draft() {
  const [text, setText] = useState('fresh')
  return <input aria-label="Branch draft" value={text} onChange={(event) => setText(event.target.value)} />
}
function Harness({ permission = 'dashboard.view' }) {
  return <AuthProvider><BranchProvider><MemoryRouter initialEntries={['/dashboard']}>
    <Controls /><Routes>
      <Route path="/dashboard" element={<ProtectedRoute permission={permission}><Draft /></ProtectedRoute>} />
      <Route path="/login" element={<p>Login required</p>} />
      <Route path="/unauthorized" element={<p>Permission denied</p>} />
    </Routes>
  </MemoryRouter></BranchProvider></AuthProvider>
}

describe('context invalidation and deny-by-default guard', () => {
  it('removes stale branch state when assignments are removed during a selection', async () => {
    await authService.login({ userId: 'demo-multi' })
    await authService.selectBranch('demo-multi', 'demo-north')
    render(<Harness />)
    await screen.findByLabelText('Branch draft')
    vi.spyOn(authService, 'selectBranch').mockRejectedValue(new Error('Assignment removed.'))
    vi.spyOn(authService, 'getSession').mockResolvedValue({ user: { id: 'demo-multi', enabled: true, assignments: [] }, branchId: null })
    await userEvent.setup().click(screen.getByRole('button', { name: 'Select central' }))
    expect(await screen.findByText('Permission denied')).toBeInTheDocument()
    expect(screen.getByTestId('identity')).toHaveTextContent('demo-multi:none:')
    expect(screen.queryByLabelText('Branch draft')).not.toBeInTheDocument()
  })

  it('resets branch-specific component state on branch and user changes', async () => {
    await authService.login({ userId: 'demo-multi' })
    await authService.selectBranch('demo-multi', 'demo-north')
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(await screen.findByLabelText('Branch draft'), ' modified')
    await user.click(screen.getByRole('button', { name: 'Select central' }))
    expect(await screen.findByTestId('identity')).toHaveTextContent('demo-multi:demo-central:teacher,receptionist')
    expect(screen.getByLabelText('Branch draft')).toHaveValue('fresh')
    await user.type(screen.getByLabelText('Branch draft'), ' changed')
    await user.click(screen.getByRole('button', { name: 'Change user' }))
    expect(await screen.findByLabelText('Branch draft')).toHaveValue('fresh')
    expect(screen.getByTestId('identity')).toHaveTextContent('demo-owner:demo-central:owner')
  })

  it('denies sensitive/unknown guarded navigation even for Super Admin', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    render(<Harness permission="payments.reverse" />)
    expect(await screen.findByText('Permission denied')).toBeInTheDocument()
    expect(screen.queryByLabelText('Branch draft')).not.toBeInTheDocument()
  })

  it('ignores a stale session restoration that finishes after a login', async () => {
    let finishRestore
    vi.spyOn(authService, 'getSession').mockReturnValue(new Promise((resolve) => { finishRestore = resolve }))
    render(<Harness />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Change user' }))
    const restored = { user: { id: 'stale', enabled: true, assignments: [] }, branchId: null }
    await act(async () => finishRestore(restored))
    expect(screen.getByTestId('identity')).toHaveTextContent('demo-owner:demo-central:owner')
  })

  it('clears in-memory identity and reports failure if saved logout cannot be cleared', async () => {
    await authService.login({ userId: 'demo-owner' })
    render(<Harness />)
    await screen.findByLabelText('Branch draft')
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('blocked') })
    await userEvent.setup().click(screen.getByRole('button', { name: 'Logout' }))
    expect(screen.getByTestId('identity')).toHaveTextContent('anonymous:none:')
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be cleared')
    expect(screen.queryByLabelText('Branch draft')).not.toBeInTheDocument()
  })
})
