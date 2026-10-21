import '../../pages/Dashboard/DashboardPage.jsx'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { MOCK_SESSION_KEY } from '../../constants/storageKeys.js'

async function openDashboard(userId = 'demo-multi') {
  await authService.login({ userId })
  if (userId === 'demo-multi') await authService.selectBranch(userId, 'demo-north')
  window.history.replaceState({}, '', '/dashboard')
  return render(<App />)
}

describe('topbar branch switching', () => {
  it('switches roles, persists the branch and restores it after remount', async () => {
    const view = await openDashboard()
    const input = await screen.findByRole('button', { name: 'Active branch' })
    expect(input).toHaveTextContent('North Campus')
    expect(screen.getByRole('button', { name: 'Active branch' })).toHaveTextContent('North Campus')
    await userEvent.setup().click(input)
    await userEvent.setup().click(screen.getByRole('option', { name: 'Central Campus' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Active branch' })).toHaveTextContent('Central Campus'))
    expect(JSON.parse(localStorage.getItem(MOCK_SESSION_KEY)).branchId).toBe('demo-central')
    view.unmount()
    render(<App />)
    expect(await screen.findByRole('button', { name: 'Active branch' })).toHaveTextContent('Central Campus')
    expect(screen.queryByRole('option', { name: /All Branches/i })).not.toBeInTheDocument()
  })

  it('auto-selects and disables the only branch', async () => {
    await openDashboard('demo-owner')
    const input = await screen.findByRole('button', { name: 'Active branch' })
    expect(input).toBeDisabled()
    expect(input).toHaveTextContent('Central Campus')
  })

  it('supports keyboard focus and navigation after a switch', async () => {
    await openDashboard()
    const user = userEvent.setup()
    const input = await screen.findByRole('button', { name: 'Active branch' })
    input.focus()
    expect(input).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('option', { name: 'North Campus' })).toHaveFocus())
    await user.keyboard('{End}')
    await waitFor(() => expect(screen.getByRole('option', { name: 'Central Campus' })).toHaveFocus())
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Active branch' })).toHaveFocus())
    await user.tab()
    expect(screen.getByRole('button', { name: 'Open user menu' })).toHaveFocus()
    await user.keyboard('{Enter}')
    screen.getByRole('menuitem', { name: 'Log out' }).focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(localStorage.getItem(MOCK_SESSION_KEY)).toBeNull()
  })

  it('retains the previous branch and announces failed persistence', async () => {
    await openDashboard()
    const input = await screen.findByRole('button', { name: 'Active branch' })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    await userEvent.setup().click(input)
    await userEvent.setup().click(screen.getByRole('option', { name: 'Central Campus' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be saved')
    expect(screen.getByRole('button', { name: 'Active branch' })).toHaveTextContent('North Campus')
    expect(screen.getByRole('button', { name: 'Active branch' })).toHaveTextContent('North Campus')
  })
})
