import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { admissionService } from '../../services/admissionService.js'
import { authService } from '../../services/authService.js'
import { MOCK_DATABASE_KEY } from '../../constants/storageKeys.js'
import { createMockDatabase } from '../../mock/mockDatabase.js'

const input = { studentName: 'DEMO Decision Student', guardianName: 'Guardian', contact: '000', dob: '2010-01-01', course: 'Demo Course Two', courseId: 'course-demo-2' }
beforeEach(() => history.replaceState(null, '', '/admissions'))

async function setupFor(userId) {
  const branchId = userId === 'demo-reception' ? 'demo-north' : 'demo-central'
  const record = createMockDatabase().createAdmission({ ...input, course: branchId === 'demo-north' ? 'Demo Course One' : input.course, courseId: branchId === 'demo-north' ? 'course-demo-1' : input.courseId }, { branchId })
  await authService.login({ userId })
  if (userId === 'demo-admin') await authService.selectBranch(userId, branchId)
  return { record, branchId }
}

describe('unresolved DEMO status authority', () => {
  it.each(['demo-admin', 'demo-owner', 'demo-reception'])('shows only confirmed actions to %s', async userId => {
    const { record } = await setupFor(userId)
    render(<App />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: `Actions for ${record.displayAdmissionId}` }))
    if (userId === 'demo-owner') {
      expect(screen.queryByRole('button', { name: 'New Admission' })).not.toBeInTheDocument()
      expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument()
    } else {
      expect(screen.getByRole('button', { name: 'New Admission' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    }
    if (userId === 'demo-admin') {
      expect(screen.getByRole('menuitem', { name: 'Approve' })).toBeInTheDocument()
      expect(screen.queryByRole('menuitem', { name: 'Reject' })).not.toBeInTheDocument()
    } else {
      expect(screen.queryByRole('menuitem', { name: 'Approve' })).not.toBeInTheDocument()
      expect(screen.queryByRole('menuitem', { name: 'Reject' })).not.toBeInTheDocument()
    }
    if (userId === 'demo-admin') expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
    else expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it.each(['demo-owner', 'demo-reception'])('denies direct status and delete service calls for %s without mutation', async userId => {
    const { record, branchId } = await setupFor(userId)
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    await expect(admissionService.changeStatus(record.id, { status: 'Approved', expectedStatus: 'Pending' }, { branchId })).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    await expect(admissionService.delete(record.id, { branchId })).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
  })

  it('approves, refreshes the list, and lets Super Admin return the admission to Pending', async () => {
    const { record } = await setupFor('demo-admin')
    render(<App />); const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: `Actions for ${record.displayAdmissionId}` }))
    await user.click(screen.getByRole('menuitem', { name: 'Approve' }))
    const dialog = await screen.findByRole('dialog', { name: `Approve DEMO Admission ${record.displayAdmissionId}` })
    await user.click(await within(dialog).findByRole('button', { name: 'Confirm Approved' }))
    expect(await screen.findByRole('status')).toHaveTextContent(`admission ${record.displayAdmissionId} approved`)
    await user.click(screen.getByRole('button', { name: `Actions for ${record.displayAdmissionId}` }))
    for (const permittedAction of ['Edit', 'Delete', 'Pending']) expect(screen.getByRole('menuitem', { name: permittedAction })).toBeEnabled()
    expect(screen.queryByRole('menuitem', { name: 'Reject' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: 'View' }))
    expect(await screen.findByRole('dialog', { name: `View DEMO Admission ${record.displayAdmissionId}` })).toBeInTheDocument()
    expect(screen.getByText(input.studentName, { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByText('Approved', { selector: 'dd' })).toBeInTheDocument()
    expect(await screen.findByRole('region', { name: 'DEMO status history' })).toHaveTextContent('Approved')
    expect(screen.getByRole('region', { name: 'DEMO status history' })).toHaveTextContent('demo-admin')
    expect(JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY)).students.find(item => item.id === record.studentId).status).toBe('Provisional')
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: `Actions for ${record.displayAdmissionId}` }))
    await user.click(screen.getByRole('menuitem', { name: 'Pending' }))
    const pendingDialog = await screen.findByRole('dialog', { name: `Pending DEMO Admission ${record.displayAdmissionId}` })
    await user.click(within(pendingDialog).getByRole('button', { name: 'Confirm Pending' }))
    expect(await screen.findByRole('status')).toHaveTextContent(`admission ${record.displayAdmissionId} pending`)
    const changed = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY)).admissions.find(item => item.id === record.id)
    expect(changed.statusHistory).toHaveLength(2)
    expect(changed.statusHistory[1]).toMatchObject({ fromStatus: 'Approved', toStatus: 'Pending' })
  })

  it('allows authorized Edit and Delete after an admission has been decided', async () => {
    const { record } = await setupFor('demo-admin')
    await admissionService.changeStatus(record.id, { status: 'Approved', expectedStatus: 'Pending' }, { branchId: 'demo-central' })
    render(<App />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: `Actions for ${record.displayAdmissionId}` }))
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))
    const editDialog = await screen.findByRole('dialog')
    const name = await within(editDialog).findByLabelText(/Student Full Name/)
    await user.clear(name)
    await user.type(name, 'DEMO Edited After Approval')
    await user.click(within(editDialog).getByRole('button', { name: 'Save Changes' }))
    expect(await screen.findByRole('status')).toHaveTextContent('updated')
    const data = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    expect(data.admissions.find(item => item.id === record.id).status).toBe('Approved')
    expect(data.students.find(item => item.id === record.studentId).name).toBe('DEMO Edited After Approval')
    await user.click(screen.getByRole('button', { name: `Actions for ${record.displayAdmissionId}` }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))
    await user.click(await screen.findByRole('button', { name: 'Delete Admission' }))
    expect(await screen.findByRole('status')).toHaveTextContent('deleted')
    const deleted = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    expect(deleted.admissions.some(item => item.id === record.id)).toBe(false)
    expect(deleted.students.some(item => item.id === record.studentId)).toBe(false)
  })

  it('denies Teacher and unresolved multi-role users at the Admissions route', async () => {
    for (const userId of ['demo-teacher', 'demo-multi']) {
      await authService.login({ userId })
      if (userId === 'demo-multi') await authService.selectBranch(userId, 'demo-central')
      const view = render(<App />)
      expect(await screen.findByRole('heading', { name: 'Access unavailable' })).toBeInTheDocument()
      view.unmount()
      history.replaceState(null, '', '/admissions')
    }
  })

  it('enforces Owner read-only and Receptionist View/Create/Edit at the service boundary', async () => {
    const { record } = await setupFor('demo-owner')
    expect(await admissionService.getById(record.id, { branchId: 'demo-central' })).toMatchObject({ id: record.id })
    await expect(admissionService.createWithStudent(input, { branchId: 'demo-central' })).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    await expect(admissionService.update(record.id, input, { branchId: 'demo-central' })).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    await authService.login({ userId: 'demo-reception' })
    const created = await admissionService.createWithStudent({ ...input, course: 'Demo Course One', courseId: 'course-demo-1' }, { branchId: 'demo-north' })
    await expect(admissionService.update(created.id, { ...input, studentName: 'Edited by Receptionist', course: 'Demo Course One', courseId: 'course-demo-1' }, { branchId: 'demo-north' })).resolves.toMatchObject({ studentName: 'Edited by Receptionist' })
  })
})
