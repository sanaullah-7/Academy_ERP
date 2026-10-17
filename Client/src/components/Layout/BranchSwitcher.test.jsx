import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { MOCK_SESSION_KEY } from '../../constants/storageKeys.js'

async function openWorkspace(userId = 'demo-multi') {
  await authService.login({ userId })
  if (userId === 'demo-multi') await authService.selectBranch(userId, 'demo-north')
  window.history.replaceState({}, '', '/workspace')
  return render(<App />)
}

describe('topbar branch switching', () => {
  it('switches roles, persists the branch and restores it after remount', async () => {
    const view = await openWorkspace()
    const input = await screen.findByRole('button', { name: 'Active demo branch' })
    expect(input).toHaveTextContent('Demo North Campus')
    expect(screen.getByText('Assigned roles: Teacher')).toBeInTheDocument()
    await userEvent.setup().click(input)
    await userEvent.setup().click(screen.getByRole('option', { name: 'Demo Central Campus' }))
    expect(await screen.findByText('Assigned roles: Teacher, Receptionist')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(MOCK_SESSION_KEY)).branchId).toBe('demo-central')
    view.unmount()
    render(<App />)
    expect(await screen.findByRole('button', { name: 'Active demo branch' })).toHaveTextContent('Demo Central Campus')
    expect(screen.queryByRole('option', { name: /All Branches/i })).not.toBeInTheDocument()
  })

  it('auto-selects and disables the only branch', async () => {
    await openWorkspace('demo-owner')
    const input = await screen.findByRole('button', { name: 'Active demo branch' })
    expect(input).toBeDisabled()
    expect(input).toHaveTextContent('Demo Central Campus')
  })

  it('supports keyboard focus and navigation after a switch', async () => {
    await openWorkspace()
    const user = userEvent.setup()
    const input = await screen.findByRole('button', { name: 'Active demo branch' })
    input.focus()
    expect(input).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('option', { name: 'Demo North Campus' })).toHaveFocus())
    await user.keyboard('{End}')
    await waitFor(() => expect(screen.getByRole('option', { name: 'Demo Central Campus' })).toHaveFocus())
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Active demo branch' })).toHaveFocus())
    await user.tab()
    expect(screen.getByRole('button', { name: 'Open user menu' })).toHaveFocus()
    await user.keyboard('{Enter}')
    screen.getByRole('menuitem', { name: 'Log out of demo' }).focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('heading', { name: 'Demo login' })).toBeInTheDocument()
    expect(localStorage.getItem(MOCK_SESSION_KEY)).toBeNull()
  })

  it('retains the previous branch and announces failed persistence', async () => {
    await openWorkspace()
    const input = await screen.findByRole('button', { name: 'Active demo branch' })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    await userEvent.setup().click(input)
    await userEvent.setup().click(screen.getByRole('option', { name: 'Demo Central Campus' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be saved')
    expect(screen.getByRole('button', { name: 'Active demo branch' })).toHaveTextContent('Demo North Campus')
    expect(screen.getByText('Assigned roles: Teacher')).toBeInTheDocument()
  })
})
