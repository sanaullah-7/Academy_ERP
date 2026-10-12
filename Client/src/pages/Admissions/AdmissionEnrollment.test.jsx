import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { admissionService } from '../../services/admissionService.js'
import { authService } from '../../services/authService.js'
import { MOCK_DATABASE_KEY } from '../../constants/storageKeys.js'
import { createMockDatabase } from '../../mock/mockDatabase.js'

const branch = { branchId: 'demo-central' }
const input = { studentName: 'DEMO Enrollment UI Student', guardianName: 'Guardian', contact: '000', dob: '2010-01-01', course: 'Demo Course Two', courseId: 'course-demo-2' }

beforeEach(() => {
  localStorage.clear()
  history.replaceState(null, '', '/admissions')
})

describe('F02-006 enrollment confirmation', () => {
  it('shows the selected references, requires a batch, and refreshes the linked student to Active', async () => {
    const admission = createMockDatabase().createAdmission(input, branch)
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', branch.branchId)
    await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, branch)
    const stored = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    stored.batches.push({ id: 'batch-demo-course-demo-2-evening', branchId: branch.branchId, courseId: input.courseId, name: 'Evening Batch' })
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(stored))

    render(<App />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: `Actions for ${admission.displayAdmissionId}` }))
    await user.click(screen.getByRole('menuitem', { name: 'Enroll Student' }))
    const dialog = await screen.findByRole('dialog', { name: `Enroll Student DEMO Admission ${admission.displayAdmissionId}` })
    expect(within(dialog).getByText(new RegExp(input.studentName))).toBeInTheDocument()
    expect(within(dialog).getByText(input.course)).toBeInTheDocument()
    expect(within(dialog).getByText('Demo Central Campus')).toBeInTheDocument()
    const confirm = within(dialog).getByRole('button', { name: 'Confirm Enrollment' })
    expect(confirm).toBeEnabled()
    await user.click(confirm)
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('valid batch select')
    expect(within(dialog).getByLabelText('Batch')).toHaveFocus()
    await user.selectOptions(within(dialog).getByLabelText('Batch'), 'batch-demo-course-demo-2')
    expect(confirm).toBeEnabled()
    await user.click(confirm)
    expect(await screen.findByRole('status')).toHaveTextContent('is Active')
    const data = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    expect(data.enrollments).toHaveLength(1)
    expect(data.students.find(item => item.id === admission.studentId).status).toBe('Active')
    expect(data.admissions.find(item => item.id === admission.id).status).toBe('Approved')
  })
})
