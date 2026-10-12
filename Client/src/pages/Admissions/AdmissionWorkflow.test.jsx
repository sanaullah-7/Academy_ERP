import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { admissionService } from '../../services/admissionService.js'
import { MOCK_DATABASE_KEY } from '../../constants/storageKeys.js'

async function fill(user) {
  await user.type(screen.getByLabelText(/Student Full Name/), 'DEMO Popup Applicant')
  fireEvent.change(screen.getByLabelText(/Date of Birth/), { target: { value: '2010-01-01' } })
  await user.type(screen.getByLabelText(/Guardian \/ Father Name/), 'DEMO Guardian')
  await user.type(screen.getByLabelText(/Contact Number/), '0000000000')
  await user.selectOptions(screen.getByLabelText(/Desired Course/), 'course-demo-2')
}

beforeEach(() => history.replaceState(null, '', '/admissions'))
describe('shared DEMO admission popup workflow', () => {
  it('opens named dialog, closes on Escape and restores trigger focus', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    render(<App />)
    const user = userEvent.setup()
    const trigger = await screen.findByRole('button', { name: 'New Admission' })
    await user.click(trigger)
    expect(screen.getByRole('dialog', { name: 'New DEMO Admission' })).toBeInTheDocument()
    expect(location.pathname).toBe('/admissions')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
  it('creates and lists the formatted ID, preserves linked records after refresh', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    const first = render(<App />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'New Admission' }))
    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Submit Application' }))
    expect(await screen.findByRole('status')).toHaveTextContent('DEMO admission ADM-3 saved')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByText('ADM-3', { selector: 'td' })).toBeInTheDocument()
    const data = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    const admission = data.admissions.find((a) => a.admissionId === 'ADM-3' && a.branchId === 'demo-central')
    expect(data.students.find((s) => s.id === admission.studentId)).toMatchObject({ status: 'Provisional', admissionId: admission.id, admissionDisplayId: 'ADM-3' })
    first.unmount()
    render(<App />)
    expect(await screen.findByText('ADM-3', { selector: 'td' })).toBeInTheDocument()
  })
  it('uses the same route form and forwards formatted success feedback', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    history.replaceState(null, '', '/admissions/new')
    render(<App />)
    const user = userEvent.setup()
    await screen.findByLabelText(/Student Full Name/)
    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Submit Application' }))
    expect(await screen.findByRole('status')).toHaveTextContent('ADM-3')
    expect(location.pathname).toBe('/admissions')
  })
  it('blocks duplicate events/dismissal while pending and allows retry after failure', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    let reject
    const create = vi.spyOn(admissionService, 'createWithStudent').mockImplementation(() => new Promise((_resolve, fail) => { reject = fail }))
    render(<App />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'New Admission' }))
    await fill(user)
    const form = screen.getByLabelText(/Student Full Name/).closest('form')
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(create).toHaveBeenCalledTimes(1)
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    reject(new Error('Controlled save failure'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Controlled save failure')
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).not.toContain('DEMO Popup Applicant')
    expect(screen.getByRole('button', { name: 'Submit Application' })).toBeEnabled()
    create.mockRestore()
    await user.click(screen.getByRole('button', { name: 'Submit Application' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
  it('preserves auth and branch-scoped routing during popup use', async () => {
    history.replaceState(null, '', '/admissions/new')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Demo login' })).toBeInTheDocument()
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
  })
})
