import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'
import { authService } from '../services/authService.js'
import { MOCK_SESSION_KEY } from '../constants/storageKeys.js'

beforeEach(() => { window.history.replaceState(null, '', '/') })
const mountAt = (path) => { window.history.replaceState(null, '', path); return render(<App />) }

describe('approved public and protected routes', () => {
  it('preserves the existing public root without a session', async () => {
    mountAt('/')
    expect(screen.getByText('Academy Managemnt System')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Demo login' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('redirects direct unauthenticated workspace access to login', async () => {
    mountAt('/workspace')
    expect(await screen.findByRole('heading', { name: 'Demo login' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })

  it('keeps existing public content and offers a route back to the signed-in demo workspace', async () => {
    await authService.login({ userId: 'demo-owner' })
    mountAt('/')
    expect(screen.getByText('Academy Managemnt System')).toBeInTheDocument()
    await userEvent.setup().click(await screen.findByRole('link', { name: 'Open demo workspace' }))
    expect(await screen.findByText('Assigned roles: Owner')).toBeInTheDocument()
  })

  it('logs in a single-branch account, restores on refresh and logs out', async () => {
    const user = userEvent.setup()
    const first = mountAt('/login')
    await user.selectOptions(await screen.findByLabelText('Demo account'), 'demo-teacher')
    await user.click(screen.getByRole('button', { name: 'Continue with demo account' }))
    expect(await screen.findByText('Assigned roles: Teacher')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/workspace')
    first.unmount()
    const second = mountAt('/workspace')
    expect(await screen.findByText('Assigned roles: Teacher')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Log out of demo' }))
    expect(await screen.findByRole('heading', { name: 'Demo login' })).toBeInTheDocument()
    expect(localStorage.getItem(MOCK_SESSION_KEY)).toBeNull()
    second.unmount()
    mountAt('/workspace')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Demo login' })).toBeInTheDocument())
  })

  it('requires multi-branch selection and displays multiple roles in that branch', async () => {
    const user = userEvent.setup()
    mountAt('/login')
    await user.selectOptions(await screen.findByLabelText('Demo account'), 'demo-multi')
    await user.click(screen.getByRole('button', { name: 'Continue with demo account' }))
    expect(await screen.findByRole('heading', { name: 'Select a demo branch' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/select-branch')
    expect(screen.getByRole('button', { name: 'Open workspace' })).toBeDisabled()
    expect(screen.queryByRole('option', { name: 'All Branches' })).not.toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Authorized branch'), 'demo-central')
    await user.click(screen.getByRole('button', { name: 'Open workspace' }))
    expect(await screen.findByText('Assigned roles: Teacher, Receptionist')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/workspace')
  })

  it('routes a restored multi-branch user with an invalid branch to selection', async () => {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ version: 1, userId: 'demo-admin', branchId: 'foreign' }))
    mountAt('/workspace')
    expect(await screen.findByRole('heading', { name: 'Select a demo branch' })).toBeInTheDocument()
  })

  it('denies an account with no authorized branches', async () => {
    await authService.login({ userId: 'demo-unassigned' })
    mountAt('/workspace')
    expect(await screen.findByRole('heading', { name: 'Access unavailable' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/unauthorized')
    expect(screen.queryByText('Hi')).not.toBeInTheDocument()
  })

  it('preserves standalone unknown routes and client-side Return home', async () => {
    const user = userEvent.setup()
    mountAt('/missing/nested')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Return home' }))
    expect(screen.getByText('Academy Managemnt System')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('supports keyboard account selection and submission', async () => {
    const user = userEvent.setup()
    mountAt('/login')
    await screen.findByLabelText('Demo account')
    await user.tab()
    expect(screen.getByLabelText('Demo account')).toHaveFocus()
    await user.selectOptions(document.activeElement, 'demo-owner')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Continue with demo account' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(await screen.findByText('Assigned roles: Owner')).toBeInTheDocument()
  })
})
