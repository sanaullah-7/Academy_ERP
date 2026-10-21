import './UserManagement/UsersPage.jsx'
import './Assets/AssetsPage.jsx'
import './BranchManagement/BranchesPage.jsx'
import './Reports/ReportsPage.jsx'
import './Settings/SettingsPage.jsx'
import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'
import { authService } from '../services/authService.js'
import { organizationService } from '../services/organizationService.js'
import { assetService } from '../services/assetService.js'
import { brandingService } from '../services/brandingService.js'

async function mount(path) {
  localStorage.clear()
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', 'demo-central')
  history.replaceState(null, '', path)
  return render(<App />)
}

describe('F09-F13 mounted admin interactions', () => {
  beforeEach(() => localStorage.clear())

  it('creates an asset through the real dialog and refreshes the directory', async () => {
    const user = userEvent.setup()
    await mount('/assets')
    await user.click(await screen.findByRole('button', { name: /Register New Asset/i }))
    await user.type(screen.getByLabelText(/Asset Tag ID/i), 'QA-AST-901')
    await user.type(screen.getByLabelText(/Asset Name/i), 'QA Projector')
    await user.type(screen.getByLabelText(/^Category/i), 'Classroom Tech')
    await user.click(screen.getByRole('button', { name: /Save Asset/i }))
    expect((await screen.findAllByText('QA-AST-901')).length).toBeGreaterThan(0)
    expect((await assetService.list({ branchId: 'demo-central' })).some(item => item.assetCode === 'QA-AST-901')).toBe(true)
  })

  it('keeps branch creation paused and permits name-only editing', async () => {
    const user = userEvent.setup()
    await mount('/branches')
    expect(await screen.findByRole('button', { name: /Add Branch/i })).toBeDisabled()
    await user.click(await screen.findByRole('button', { name: 'Edit Central Campus' }))
    expect(screen.queryByLabelText(/Branch code/i)).not.toBeInTheDocument()
    const name = screen.getByLabelText(/Branch name/i)
    await user.clear(name)
    await user.type(name, 'QA Renamed Campus')
    await user.click(screen.getByRole('button', { name: /Save Branch/i }))
    expect(await screen.findByRole('heading', { name: 'QA Renamed Campus' })).toBeInTheDocument()
    expect((await organizationService.overview()).branches.find(item => item.id === 'demo-central').name).toBe('QA Renamed Campus')
  })

  it('creates a staff account through the mounted form', async () => {
    const user = userEvent.setup()
    await mount('/users')
    await user.click(await screen.findByRole('button', { name: /Add Staff Member/i }))
    await user.type(screen.getByLabelText(/Full name/i), 'QA UI Staff')
    fireEvent.change(screen.getByLabelText(/^Email$/i), {target:{value:'qa-ui-staff@example.test'}})
    fireEvent.change(screen.getByLabelText(/^Contact/i), {target:{value:'+92 300 1112233'}})
    await user.click(screen.getByRole('button', { name: /Save Account/i }))
    fireEvent.change(screen.getByPlaceholderText('Search staff'), {target:{value:'qa-ui-staff@example.test'}})
    expect(await screen.findByText('QA UI Staff')).toBeInTheDocument()
    expect((await organizationService.overview()).users.some(item => item.login === 'qa-ui-staff@example.test')).toBe(true)
  })

  it('switches reports and persists independent sidebar settings', async () => {
    const user = userEvent.setup()
    const reportView = await mount('/reports')
    await user.click(await screen.findByRole('button', { name: /Students Directory/i }))
    expect(await screen.findByRole('columnheader', { name: 'Student Name' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Fees & Payment Defaulters/i }))
    expect(await screen.findByRole('columnheader', { name: /Remaining Balance/i })).toBeInTheDocument()
    reportView.unmount()

    history.replaceState(null, '', '/settings')
    render(<App />)
    const background = await screen.findByLabelText('Sidebar Background')
    fireEvent.change(background, { target: { value: '#123456' } })
    fireEvent.change(screen.getByLabelText('Sidebar Text'), { target: { value: '#EEEEEE' } })
    fireEvent.change(screen.getByLabelText('Sidebar Icons'), { target: { value: '#DDDDDD' } })
    await user.click(screen.getByRole('button', { name: /Save Settings/i }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Academy settings saved.'))
    expect(brandingService.get()).toMatchObject({ primaryColor: '#940016', sidebarBackground: '#123456', sidebarText: '#EEEEEE', sidebarIcon: '#DDDDDD' })
    await user.click(screen.getByRole('button', { name: 'Reset TSA Default' }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('TSA default theme restored.'))
    expect(brandingService.get()).toMatchObject({ primaryColor: '#940016', sidebarBackground: '#FFFFFF', sidebarText: '#111827', sidebarIcon: '#111827', sidebarActive: '#940016' })
  })
})
