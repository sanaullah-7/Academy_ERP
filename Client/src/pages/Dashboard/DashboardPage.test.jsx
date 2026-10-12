import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'


beforeEach(() => window.history.replaceState(null, '', '/dashboard'))

describe('approved shared dashboard skeleton', () => {
  it('redirects unauthenticated dashboard access to login', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Demo login' })).toBeInTheDocument()
    expect(location.pathname).toBe('/login')
  })
  it('requires a selected authorized branch and denies zero assignments', async () => {
    await authService.login({ userId: 'demo-admin' })
    const first = render(<App />)
    expect(await screen.findByRole('heading', { name: 'Select a demo branch' })).toBeInTheDocument()
    first.unmount()
    await authService.login({ userId: 'demo-unassigned' })
    window.history.replaceState(null, '', '/dashboard')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Access unavailable' })).toBeInTheDocument()
  })
  it.each(['demo-teacher'])('renders the teacher dashboard for %s with mock courses', async (userId) => {
    await authService.login({ userId })
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument()
    for (const title of ['Instructor Hub', 'Today\'s Schedule', 'Upcoming Sessions', 'Recent Teaching Activity', 'Instructor Actions']) expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    for (const title of ['Today\'s Classes', 'Pending Assignments', 'Average Attendance', 'Assigned Batches']) expect(await screen.findByText(title)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
  })
  it('renders the super admin dashboard for demo-admin', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-north')
    render(<App />)
    const user = userEvent.setup()
    expect(await screen.findByRole('heading', { name: 'Select Dashboard View' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Super Admin Dashboard/i }))
    expect(await screen.findByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument()
    for (const title of ['Key Metrics', 'Revenue Trend', 'Recent Activity', 'Quick Operations']) expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    for (const title of ['Total Students', 'Active Courses', 'Demo Admissions', 'Demo Revenue']) expect(await screen.findByText(title)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
  })
  it('renders the owner dashboard for demo-owner', async () => {
    await authService.login({ userId: 'demo-owner' })
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument()
    for (const title of ['Key Metrics', 'Enrollment Trend', 'Recent Activity', 'Financial Overview', 'Quick Operations']) expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    for (const title of ['Total Students', 'Active Courses', 'Demo Admissions', 'Demo Revenue']) expect(await screen.findByText(title)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
  })
  it('renders the receptionist dashboard for demo-reception', async () => {
    await authService.login({ userId: 'demo-reception' })
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument()
    for (const title of ['Today\'s Overview', 'Recent Inquiries', 'Today\'s Schedule', 'Front Desk Actions']) expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    for (const title of ['Today\'s Admissions', 'Pending Inquiries', 'Demo Follow-ups', 'Active Students']) expect(await screen.findByText(title)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
  })
  it('updates branch context in place and restores the dashboard on remount', async () => {
    await authService.login({ userId: 'demo-multi' })
    await authService.selectBranch('demo-multi', 'demo-north')
    const first = render(<App />)
    await screen.findByRole('heading', { name: 'Dashboard', level: 1 })
    expect(screen.getByText(/Demo North Campus/i, { selector: 'p' })).toBeInTheDocument()
    await userEvent.setup().selectOptions(screen.getByLabelText('Active demo branch'), 'demo-central')
    expect(await screen.findByText(/Demo Central Campus/i, { selector: 'p' })).toBeInTheDocument()
    expect(location.pathname).toBe('/dashboard')
    first.unmount()
    render(<App />)
    expect(await screen.findByText(/Demo Central Campus/i, { selector: 'p' })).toBeInTheDocument()
  })
  it('allows keyboard sidebar navigation and preserves logout protection', async () => {
    await authService.login({ userId: 'demo-owner' })
    window.history.replaceState(null, '', '/workspace')
    render(<App />)
    const user = userEvent.setup()
    const link = await screen.findByRole('link', { name: 'Dashboard' })
    link.focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Log out of demo' }))
    await waitFor(() => expect(location.pathname).toBe('/login'))
    expect(screen.queryByRole('heading', { name: 'Dashboard', level: 1 })).not.toBeInTheDocument()
  })
})
