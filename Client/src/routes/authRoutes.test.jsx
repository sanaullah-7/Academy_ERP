import '../pages/Dashboard/DashboardPage.jsx'
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'
import { authService } from '../services/authService.js'
import { MOCK_SESSION_KEY } from '../constants/storageKeys.js'

beforeEach(() => { window.history.replaceState(null, '', '/') })
const mountAt = (path) => { window.history.replaceState(null, '', path); return render(<App />) }

describe('approved public and protected routes', () => {
  it('opens root at login without a session', async () => {
    mountAt('/')
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })
  it('redirects direct unauthenticated dashboard access to login', async () => {
    mountAt('/dashboard')
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })
  it('shows login at root even with an existing saved session', async () => {
    await authService.login({ userId: 'demo-owner' })
    mountAt('/')
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
    expect(screen.queryByRole('button', { name: 'Open user menu' })).not.toBeInTheDocument()
  })

  it('logs in a single-branch account, restores on refresh and logs out', async () => {
    const user = userEvent.setup()
    const first = mountAt('/login')
    await user.type(await screen.findByLabelText('Email'), 'demo-teacher@tsa.local')
    await user.type(screen.getByLabelText('Password'), import.meta.env.VITE_MOCK_STAFF_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('button', { name: 'Active branch' })).toHaveTextContent('Central Campus')
    expect(window.location.pathname).toBe('/dashboard')
    first.unmount()
    const second = mountAt('/dashboard')
    expect(await screen.findByRole('button', { name: 'Active branch' })).toHaveTextContent('Central Campus')
    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }))
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(localStorage.getItem(MOCK_SESSION_KEY)).toBeNull()
    second.unmount()
    mountAt('/dashboard')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument())
  })

  it('requires multi-branch selection and displays multiple roles in that branch', async () => {
    const user = userEvent.setup()
    mountAt('/login')
    await user.type(await screen.findByLabelText('Email'), 'demo-multi@tsa.local')
    await user.type(screen.getByLabelText('Password'), import.meta.env.VITE_MOCK_STAFF_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { name: 'Select a branch' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/select-branch')
    expect(screen.getByRole('button', { name: 'Open dashboard' })).toBeDisabled()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Central Campus/ }))
    await user.click(screen.getByRole('button', { name: 'Open dashboard' }))
    expect(await screen.findByRole('button', { name: 'Active branch' })).toHaveTextContent('Central Campus')
    expect(window.location.pathname).toBe('/dashboard')
  })

  it('routes a restored multi-branch user with an invalid branch to selection', async () => {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ version: 1, userId: 'demo-admin', branchId: 'foreign' }))
    mountAt('/dashboard')
    expect(await screen.findByRole('heading', { name: 'Select a branch' })).toBeInTheDocument()
  })

  it('opens permission-aware global search from the topbar shortcut', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    const user=userEvent.setup()
    mountAt('/dashboard')
    await screen.findByRole('button',{name:'Open user menu'})
    await user.keyboard('{Control>}k{/Control}')
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    const search=screen.getByRole('textbox',{name:'Global search'})
    await user.type(search,'Courses')
    expect((await screen.findAllByText('Courses & Batches')).length).toBeGreaterThan(0)
  })

  it('denies an account with no authorized branches', async () => {
    await authService.login({ userId: 'demo-unassigned' })
    mountAt('/dashboard')
    expect(await screen.findByRole('heading', { name: 'Access unavailable' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/unauthorized')
    expect(screen.queryByText('Hi')).not.toBeInTheDocument()
  })

  it('preserves standalone unknown routes and client-side Return home', async () => {
    const user = userEvent.setup()
    mountAt('/missing/nested')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Return home' }))
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })

  it('supports keyboard account selection and submission', async () => {
    const user = userEvent.setup()
    mountAt('/login')
    await screen.findByLabelText('Email')
    await user.tab()
    expect(screen.getByLabelText('Email')).toHaveFocus()
    await user.type(document.activeElement,'demo-owner@tsa.local')
    await user.tab()
    expect(screen.getByLabelText('Password')).toHaveFocus()
    await user.type(document.activeElement,import.meta.env.VITE_MOCK_STAFF_PASSWORD)
    await user.tab()
    expect(screen.getByRole('button',{name:'Show password'})).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button',{name:'Sign in'})).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('button', { name: 'Active branch' })).toHaveTextContent('Central Campus')
  })
})
