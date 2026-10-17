import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { admissionService } from '../../services/admissionService.js'
import { MOCK_DATABASE_KEY } from '../../constants/storageKeys.js'

const input = { studentName: 'DEMO CRUD Applicant', guardianName: 'DEMO Guardian', contact: '0000000000', dob: '2010-01-01', course: 'Computer Science', courseId: 'course-demo-2', notes: 'Original note' }
beforeEach(() => history.replaceState(null, '', '/admissions'))
async function setup() {
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', 'demo-central')
  const record = await admissionService.createWithStudent(input, { branchId: 'demo-central' })
  render(<App />)
  const trigger = await screen.findByRole('button', { name: `Actions for ${record.admissionId}` })
  return { record, trigger, user: userEvent.setup() }
}
async function setupTwoAdmissions() {
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', 'demo-central')
  const first = await admissionService.createWithStudent(input, { branchId: 'demo-central' })
  const second = await admissionService.createWithStudent({ ...input, studentName: 'DEMO Different Student', guardianName: 'Different Guardian' }, { branchId: 'demo-central' })
  render(<App />)
  return { first, second, user: userEvent.setup() }
}
async function choose(user, trigger, action) {
  await user.click(trigger)
  await user.click(screen.getByRole('menuitem', { name: action }))
}

describe('accessible saved admission DEMO CRUD', () => {
  it.each(['row', 'name', 'menu'])('%s opens the same selected admission details without opening a different student', async entry => {
    const { first, second, user } = await setupTwoAdmissions()
    const getById = vi.spyOn(admissionService, 'getById')
    const row = await screen.findByRole('button', { name: `View admission ${first.displayAdmissionId} for ${first.studentName}` })
    if (entry === 'row') await user.click(row)
    if (entry === 'name') await user.click(within(row).getByText(first.studentName))
    if (entry === 'menu') {
      const trigger = within(row).getByRole('button', { name: `Actions for ${first.displayAdmissionId}` })
      await user.click(trigger)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await user.click(screen.getByRole('menuitem', { name: 'View' }))
    }
    const dialog = await screen.findByRole('dialog', { name: `View DEMO Admission ${first.displayAdmissionId}` })
    expect(within(dialog).getByText(first.studentName, { selector: 'dd' })).toBeInTheDocument()
    expect(within(dialog).getByText(first.guardianName, { selector: 'dd' })).toBeInTheDocument()
    expect(within(dialog).queryByText(second.studentName)).not.toBeInTheDocument()
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(getById).toHaveBeenCalledTimes(1)
    await user.keyboard('{Escape}')
    if (entry === 'menu') expect(within(row).getByRole('button', { name: `Actions for ${first.displayAdmissionId}` })).toHaveFocus()
    else expect(row).toHaveFocus()
  })

  it('opens admission details from the focused row with Enter and Space', async () => {
    const { record, user } = await setup()
    const row = await screen.findByRole('button', { name: `View admission ${record.displayAdmissionId} for ${record.studentName}` })
    row.focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('dialog', { name: `View DEMO Admission ${record.displayAdmissionId}` })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    row.focus()
    await user.keyboard(' ')
    expect(await screen.findByRole('dialog', { name: `View DEMO Admission ${record.displayAdmissionId}` })).toBeInTheDocument()
  })

  it('supports arrow-key menu navigation, Escape and focus restoration', async () => {
    const { user, trigger } = await setup()
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'View' })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus()
    await user.keyboard('{End}')
    expect(screen.getByRole('menuitem', { name: 'Approve' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
  it('views saved details and linked branch student number without mutation', async () => {
    const { user, trigger, record } = await setup()
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    await choose(user, trigger, 'View')
    const dialog = await screen.findByRole('dialog', { name: `View DEMO Admission ${record.admissionId}` })
    expect(await within(dialog).findByText('Original note')).toBeInTheDocument()
    expect(within(dialog).getByText('Student Number')).toBeInTheDocument()
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
  })
  it('prefills, validates, edits and immediately refreshes filters and linked student', async () => {
    const { user, trigger, record } = await setup()
    await choose(user, trigger, 'Edit')
    const editDialog = await screen.findByRole('dialog', { name: `Edit DEMO Admission ${record.admissionId}` })
    const name = within(editDialog).getByLabelText(/Student Full Name/)
    expect(name).toHaveValue(input.studentName)
    await user.clear(name)
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))
    expect(name).toHaveFocus()
    expect(screen.getByText('Student name is required')).toBeInTheDocument()
    await user.type(name, 'DEMO Edited Applicant')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))
    expect(await screen.findByRole('status')).toHaveTextContent('updated')
    expect(screen.getByRole('button', { name: 'New Admission' })).toHaveFocus()
    expect(await screen.findByText('DEMO Edited Applicant', { selector: 'td' })).toBeInTheDocument()
    const data = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    expect(data.students.find((s) => s.id === record.studentId).name).toBe('DEMO Edited Applicant')
    await user.type(screen.getByRole('textbox', { name: 'Search admissions' }), 'DEMO CRUD Applicant')
    expect(screen.getByText('No admissions found')).toBeInTheDocument()
  })
  it('offers confirmed Super Admin Delete and status actions', async () => {
    const { user, trigger } = await setup()
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    await user.click(trigger)
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Approve' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Reject' })).not.toBeInTheDocument()
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
  })
  it('closes branch-scoped dialogs when switching authorized branch', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    const record = await admissionService.createWithStudent(input, { branchId: 'demo-central' })
    render(<App />)
    const user = userEvent.setup()
    await choose(user, await screen.findByRole('button', { name: `Actions for ${record.admissionId}` }), 'Edit')
    const editDialog = await screen.findByRole('dialog', { name: `Edit DEMO Admission ${record.admissionId}` })
    expect(within(editDialog).getByLabelText(/Student Full Name/)).toBeInTheDocument()
    fireEvent.click(document.getElementById('active-demo-branch'))
    fireEvent.click(screen.getByRole('option', { name: 'Demo North Campus', hidden: true }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByText('Bilal Qureshi')).toBeInTheDocument()
    expect(screen.queryByText(input.studentName)).not.toBeInTheDocument()
  })

  it('confirms deletion, supports cancel/Escape and atomically removes only the linked pair', async () => {
    const { user, trigger, record } = await setup()
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    await choose(user, trigger, 'Delete')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete Admission' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(trigger).toHaveFocus()
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
    await choose(user, trigger, 'Delete')
    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
    await choose(user, trigger, 'Delete')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete Admission' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: 'Delete Admission' }))
    expect(await screen.findByRole('status')).toHaveTextContent('deleted')
    const saved = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    const original = JSON.parse(before)
    expect(saved.admissions).toEqual(original.admissions.filter(a => a.id !== record.id))
    expect(saved.students).toEqual(original.students.filter(s => s.id !== record.studentId))
    expect(saved.branchCounters).toEqual(original.branchCounters)
    expect(await admissionService.list({ branchId: 'demo-central' })).not.toContainEqual(expect.objectContaining({ id: record.id }))
  })

  it('keeps data on a failed delete, blocks duplicate clicks and allows retry', async () => {
    const { user, trigger } = await setup()
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    let reject
    const spy = vi.spyOn(admissionService, 'delete').mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail }))
    await choose(user, trigger, 'Delete')
    const confirm = screen.getByRole('button', { name: 'Delete Admission' })
    await waitFor(() => expect(confirm).toBeEnabled())
    fireEvent.click(confirm); fireEvent.click(confirm)
    expect(spy).toHaveBeenCalledTimes(1)
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    reject(Error('Controlled delete failure'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Controlled delete failure')
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
    await user.click(screen.getByRole('button', { name: 'Delete Admission' }))
    expect(await screen.findByRole('status')).toHaveTextContent('deleted')
  })

  it('allows authorized deletion after the record becomes Approved', async () => {
    const status = 'Approved'
    const { user, trigger, record } = await setup()
    const data = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    data.admissions.find(a => a.id === record.id).status = status
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    await choose(user, trigger, 'View')
    expect(await screen.findByText(status, { selector: 'dd' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(await admissionService.delete(record.id, { branchId: 'demo-central' })).toMatchObject({ id: record.id, deletedStudentId: record.studentId })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).not.toBe(before)
  })
})
