import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { admissionService } from '../../services/admissionService.js'
import { studentService } from '../../services/studentService.js'
import { MOCK_DATABASE_KEY } from '../../constants/storageKeys.js'
import { createMockDatabase } from '../../mock/mockDatabase.js'

const central = { branchId: 'demo-central' }
const input = { studentName: 'DEMO Student', guardianName: 'DEMO Guardian', contact: '03001234567', dob: '2010-01-01', course: 'Demo Course Two', courseId: 'course-demo-2' }

beforeEach(() => {
  localStorage.clear()
  history.replaceState(null, '', '/students')
})

async function signIn(userId = 'demo-admin', branchId = central.branchId) {
  await authService.login({ userId })
  await authService.selectBranch(userId, branchId)
}

describe('F03 Students module', () => {
  it('combines search, status, course and sorting while keeping the stored display serial stable', async () => {
    await signIn()
    const first = await admissionService.createWithStudent({ ...input, studentName: 'Zed DEMO', guardianName: 'Guardian Alpha', courseId: input.courseId }, central)
    const second = await admissionService.createWithStudent({ ...input, studentName: 'Amy DEMO', guardianName: 'Guardian Beta', courseId: input.courseId }, central)
    const data = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    data.courses.push({ id: 'course-alt', branchId: central.branchId, name: 'Alternate Course' })
    data.batches.push({ id: 'batch-alt', branchId: central.branchId, courseId: 'course-alt', name: 'Alternate Batch' })
    data.admissions.find(record => record.id === second.id).courseId = 'course-alt'
    data.admissions.find(record => record.id === second.id).preferredBatchId = 'batch-alt'
    data.admissions.find(record => record.id === second.id).course = 'Alternate Course'
    data.students.find(student => student.id === second.studentId).status = 'Active'
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))

    render(<App />)
    const user = userEvent.setup()
    const table = await screen.findByRole('table', { name: 'Saved DEMO students in the selected branch' })
    expect(within(table).getByRole('link', { name: 'View student Zed DEMO' })).toBeInTheDocument()
    const search = screen.getByRole('searchbox', { name: 'Search students' })
    await user.type(search, 'Guardian Beta')
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'Active')
    await user.selectOptions(screen.getByLabelText('Filter by course'), 'course-alt')
    expect(within(table).getByRole('link', { name: 'View student Amy DEMO' })).toBeInTheDocument()
    expect(within(table).queryByRole('link', { name: 'View student Zed DEMO' })).not.toBeInTheDocument()
    expect(screen.getByText(/1\s*\/\s*3 students/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear Filters' }))
    await user.selectOptions(screen.getByLabelText('Sort students'), 'name-asc')
    const rows = within(table).getAllByRole('link').filter(row => row.getAttribute('aria-label')?.startsWith('View student'))
    expect(rows.map(row => row.getAttribute('aria-label'))).toEqual(['View student Amy DEMO', 'View student Demo Student Two', 'View student Zed DEMO'])
    expect(within(rows[0]).getByText('3')).toBeInTheDocument()
    expect(within(rows[2]).getByText('2')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY)).students).toHaveLength(4)
    expect(first.studentId).not.toBe(second.studentId)
  })

  it('shows saved enrollment history and honest empty fee/attendance states on direct profile navigation', async () => {
    await signIn()
    const admission = await admissionService.createWithStudent(input, central)
    await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, central)
    await admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, central)
    history.replaceState(null, '', `/students/${admission.studentId}`)

    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Student Profile' })).toBeInTheDocument()
    expect((await screen.findAllByText('Active')).length).toBeGreaterThan(0)
    expect(screen.getByText('Demo Course Two', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getAllByText('DEMO Batch - Demo Course Two', { selector: 'dd' })).toHaveLength(2)
    expect(screen.getByText('Enrollment history')).toBeInTheDocument()
    expect(screen.getByText('No fee records available yet.')).toBeInTheDocument()
    expect(screen.getByText('No attendance records available yet.')).toBeInTheDocument()
  })

  it('allows Super Admin and Receptionist to edit only the name and keeps the linked Admission consistent', async () => {
    for (const [userId, branchId] of [['demo-admin', 'demo-central'], ['demo-reception', 'demo-north']]) {
      cleanup()
      localStorage.clear()
      const courseId = branchId === 'demo-central' ? 'course-demo-2' : 'course-demo-1'
      const branch = { branchId }
      const admission = createMockDatabase().createAdmission({ ...input, courseId }, branch)
      await signIn(userId, branchId)
      render(<App />)
      const actions = await screen.findByRole('button', { name: `Actions for ${admission.studentName}` })
      await userEvent.setup().click(actions)
      await userEvent.setup().click(await screen.findByRole('menuitem', { name: 'Edit Student' }))
      const dialog = await screen.findByRole('dialog', { name: 'Edit Student' })
      const name = within(dialog).getByLabelText('Student name')
      const dob = within(dialog).getByLabelText('Date of birth')
      const guardian = within(dialog).getByLabelText('Guardian name')
      const contact = within(dialog).getByLabelText('Guardian contact')
      await userEvent.setup().clear(name)
      await userEvent.setup().type(name, `Updated ${userId}`)
      await userEvent.setup().clear(dob)
      await userEvent.setup().type(dob, '2011-02-03')
      await userEvent.setup().clear(guardian)
      await userEvent.setup().type(guardian, `Updated Guardian ${userId}`)
      await userEvent.setup().clear(contact)
      await userEvent.setup().type(contact, '03005551234')
      await userEvent.setup().click(within(dialog).getByRole('button', { name: 'Save Student' }))
      expect(await screen.findByRole('status')).toHaveTextContent('record save')
      const saved = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
      expect(saved.students.find(item => item.id === admission.studentId).name).toBe(`Updated ${userId}`)
      expect(saved.admissions.find(item => item.id === admission.id).studentName).toBe(`Updated ${userId}`)
      expect(saved.admissions.find(item => item.id === admission.id)).toMatchObject({ dob: '2011-02-03', guardianName: `Updated Guardian ${userId}`, contact: '03005551234' })
      expect(saved.students.find(item => item.id === admission.studentId).admissionId).toBe(admission.id)
      expect(saved.students.find(item => item.id === admission.studentId).status).toBe('Provisional')
      expect(saved.students.find(item => item.id === admission.studentId).branchId).toBe(branchId)
    }
  })

  it('keeps Owner read-only and denies direct Teacher edit, invalid status edits and cross-branch profile reads', async () => {
    const admission = createMockDatabase().createAdmission(input, central)
    await signIn('demo-owner')
    render(<App />)
    await screen.findByRole('table', { name: 'Saved DEMO students in the selected branch' })
    await userEvent.setup().click(screen.getByRole('button', { name: `Actions for ${admission.studentName}` }))
    expect(screen.queryByRole('menuitem', { name: 'Edit Student' })).not.toBeInTheDocument()
    await expect(studentService.update(admission.studentId, { name: 'Unauthorized' }, central)).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    await expect(studentService.update(admission.studentId, { name: 'Invalid status', status: 'Active' }, central)).rejects.toMatchObject({ code: 'INVALID_RECORD' })

    await authService.login({ userId: 'demo-teacher' })
    history.replaceState(null, '', `/students/${admission.studentId}`)
    const view = render(<App />)
    expect(await screen.findByRole('heading', { name: 'Access unavailable' })).toBeInTheDocument()
    view.unmount()
  })
})
