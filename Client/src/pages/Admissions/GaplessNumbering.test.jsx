import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { admissionService } from '../../services/admissionService.js'
import { MOCK_DATABASE_KEY } from '../../constants/storageKeys.js'
import { createMockDatabase } from '../../mock/mockDatabase.js'

const query = { branchId: 'demo-central' }
const input = { studentName: 'DEMO Applicant', guardianName: 'DEMO Guardian', contact: '0000000000', dob: '2010-01-01', course: 'Computer Science', courseId: 'course-demo-2' }
beforeEach(() => history.replaceState(null, '', '/admissions'))
async function setup(deleteNumber) {
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', 'demo-central')
  localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify({ version: 2, students: [], courses: [{ id: 'course-demo-2', branchId: 'demo-central', name: 'Computer Science' }], admissions: [] }))
  const records = []
  for (let i = 1; i <= 4; i++) records.push(await admissionService.createWithStudent({ ...input, studentName: `DEMO Student ${i}` }, query))
  if (deleteNumber) createMockDatabase().deleteAdmission(records[deleteNumber - 1].id, query)
  const view = render(<App />)
  await screen.findByRole('button', { name: `Actions for ADM-${deleteNumber ? 3 : 4}` })
  return { records, view, user: userEvent.setup() }
}
async function add(user) {
  await user.click(screen.getByRole('button', { name: 'New Admission' }))
  await user.type(screen.getByLabelText(/Student Full Name/), 'DEMO Next Student')
  fireEvent.change(screen.getByLabelText(/Date of Birth/), { target: { value: input.dob } })
  await user.type(screen.getByLabelText(/Guardian \/ Father Name/), input.guardianName)
  await user.type(screen.getByLabelText(/Contact Number/), input.contact)
  await user.selectOptions(screen.getByLabelText(/Desired Course/), 'course-demo-2')
  await user.click(screen.getByRole('button', { name: 'Submit Application' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
}

describe('browser-visible gapless serials', () => {
  it.each([2, 4])('renumbers after deleting visible %s, creates visible four and restores after refresh', async (number) => {
    const { user, view, records } = await setup(number)
    expect(screen.queryByRole('button', { name: 'Actions for ADM-4' })).not.toBeInTheDocument()
    expect([1, 2, 3].every((n) => !!screen.getByRole('button', { name: `Actions for ADM-${n}` }))).toBe(true)
    await add(user)
    expect(await screen.findByRole('status')).toHaveTextContent('DEMO admission ADM-4 saved')
    await user.click(await screen.findByRole('button', { name: 'Actions for ADM-4' }))
    await user.click(screen.getByRole('menuitem', { name: 'View' }))
    const dialog = await screen.findByRole('dialog', { name: 'View DEMO Admission ADM-4' })
    expect(await within(dialog).findByText('ADM-5')).toBeInTheDocument()
    expect(within(dialog).getByText('4', { selector: 'dd' })).toBeInTheDocument()
    const data = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    for (const record of records.filter((_, index) => index !== number - 1)) {
      expect(data.students.find((s) => s.id === record.studentId).admissionId).toBe(record.id)
    }
    view.unmount(); render(<App />)
    expect(await screen.findByRole('button', { name: 'Actions for ADM-4' })).toBeInTheDocument()
  })
  it('searches the complete-branch serial instead of reindexing filtered rows', async () => {
    const { user } = await setup(2)
    expect(screen.queryByRole('button', { name: 'Actions for ADM-4' })).not.toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Search admissions' }), 'DEMO Student 4')
    expect(screen.getByRole('button', { name: 'Actions for ADM-3' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actions for ADM-1' })).not.toBeInTheDocument()
    await user.clear(screen.getByRole('textbox', { name: 'Search admissions' }))
    await user.type(screen.getByRole('textbox', { name: 'Search admissions' }), 'ADM-3')
    expect(screen.getByText('DEMO Student 4')).toBeInTheDocument()
  })
})
