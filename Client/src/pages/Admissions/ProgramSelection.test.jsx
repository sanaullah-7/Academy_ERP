import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { admissionService } from '../../services/admissionService.js'
import { courseService } from '../../services/courseService.js'
import { createSeedDatabase } from '../../mock/seedData.js'
import { MOCK_DATABASE_KEY } from '../../constants/storageKeys.js'

beforeEach(async () => {
  history.replaceState(null, '', '/admissions')
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', 'demo-central')
  const data = createSeedDatabase()
  data.admissions = []; data.students = []
  data.courses.push({ id: 'second', branchId: 'demo-central', name: 'Second DEMO Course' })
  data.batches.push({ id: 'second-batch', branchId: 'demo-central', courseId: 'second', name: 'Second DEMO Batch' })
  localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
})
async function open() {
  const user = userEvent.setup(); render(<App />)
  await user.click(await screen.findByRole('button', { name: 'New Admission' }))
  await waitFor(() => expect(screen.getByLabelText(/Desired Course/)).toBeEnabled())
  return user
}
async function fill(user) {
  await user.type(screen.getByLabelText(/Student Full Name/), 'DEMO Selected Student')
  fireEvent.change(screen.getByLabelText(/Date of Birth/), { target: { value: '2010-01-01' } })
  await user.type(screen.getByLabelText(/Guardian \/ Father Name/), 'DEMO Guardian')
  await user.type(screen.getByLabelText(/Contact Number/), '0000000000')
}
describe('shared program and batch selectors', () => {
  it('handles an empty course catalogue without restoring hardcoded options', async () => {
    const data = createSeedDatabase(); data.courses = []; data.batches = []
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    await open()
    expect(screen.getByText('No active course is configured for this stream.')).toBeInTheDocument()
    expect(screen.getByLabelText(/Preferred Batch/)).toBeDisabled()
    expect(within(screen.getByLabelText(/Desired Course/)).getAllByRole('option')).toHaveLength(1)
  })
  it('preserves a legacy free-text course when editing unrelated fields', async () => {
    const data = createSeedDatabase(); localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    const user = userEvent.setup(); render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Actions for ADM-1' })); await user.click(screen.getByRole('menuitem', { name: 'Edit' }))
    const editDialog = await screen.findByRole('dialog')
    await waitFor(() => expect(within(editDialog).getByLabelText(/Desired Course/)).toBeEnabled())
    expect(within(editDialog).getByRole('option', { name: 'Legacy (unresolved): Computer Science' })).toBeInTheDocument()
    await user.type(within(editDialog).getByLabelText(/Additional Notes/), 'Unrelated DEMO edit')
    await user.click(within(editDialog).getByRole('button', { name: 'Save Changes' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    const record = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY)).admissions[0]
    expect(record.course).toBe('Computer Science')
    expect(record.courseId).toBeNull()
  })
  it('loads saved branch courses, filters batches and clears batch on course change', async () => {
    const user = await open()
    const course = screen.getByLabelText(/Desired Course/), batch = screen.getByLabelText(/Preferred Batch/)
    expect(within(course).queryByRole('option', { name: 'Demo Course One' })).not.toBeInTheDocument()
    expect(batch).toBeDisabled()
    await user.selectOptions(course, 'course-demo-2')
    expect(within(batch).getByRole('option', { name: 'DEMO Batch - Demo Course Two' })).toBeInTheDocument()
    expect(within(batch).queryByRole('option', { name: 'Second DEMO Batch' })).not.toBeInTheDocument()
    await user.selectOptions(batch, 'batch-demo-course-demo-2')
    await user.selectOptions(course, 'second')
    expect(batch).toHaveValue('')
    expect(within(batch).getByRole('option', { name: 'Second DEMO Batch' })).toBeInTheDocument()
  })
  it.each([false, true])('creates, views and prefills saved references; batch selected=%s', async selected => {
    const user = await open(); await fill(user)
    await user.selectOptions(screen.getByLabelText(/Desired Course/), 'course-demo-2')
    if (selected) await user.selectOptions(screen.getByLabelText(/Preferred Batch/), 'batch-demo-course-demo-2')
    await user.click(screen.getByRole('button', { name: 'Submit Application' }))
    const actions = await screen.findByRole('button', { name: 'Actions for ADM-1' })
    await user.click(actions); await user.click(screen.getByRole('menuitem', { name: 'View' }))
    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText(selected ? 'DEMO Batch - Demo Course Two' : 'Not selected')).toBeInTheDocument()
    await user.keyboard('{Escape}'); await user.click(actions); await user.click(screen.getByRole('menuitem', { name: 'Edit' }))
    const editDialog = await screen.findByRole('dialog')
    await waitFor(() => expect(within(editDialog).getByLabelText(/Desired Course/)).toBeEnabled())
    expect(within(editDialog).getByLabelText(/Desired Course/)).toHaveValue('course-demo-2')
    expect(within(editDialog).getByLabelText(/Preferred Batch/)).toHaveValue(selected ? 'batch-demo-course-demo-2' : '')
    await user.selectOptions(within(editDialog).getByLabelText(/Desired Course/), 'second')
    await user.click(within(editDialog).getByRole('button', { name: 'Save Changes' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    const saved = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    expect(saved.admissions[0]).toMatchObject({ courseId: 'second', preferredBatchId: null, course: 'Second DEMO Course' })
    expect(saved.students[0].admissionId).toBe(saved.admissions[0].id)
  })
  it('shows missing references rather than selecting another course automatically', async () => {
    const record = await admissionService.createWithStudent({ studentName: 'Missing DEMO', guardianName: 'Guardian', contact: '000', dob: '2010-01-01', course: 'Demo Course Two', courseId: 'course-demo-2', preferredBatchId: 'batch-demo-course-demo-2' }, { branchId: 'demo-central' })
    const data = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY)); data.courses = data.courses.filter(x => x.id !== record.courseId); data.batches = []
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    const user = userEvent.setup(); render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Actions for ADM-1' })); await user.click(screen.getByRole('menuitem', { name: 'Edit' }))
    const editDialog = await screen.findByRole('dialog')
    await waitFor(() => expect(within(editDialog).getByLabelText(/Desired Course/)).toBeEnabled())
    expect(within(editDialog).getByRole('option', { name: 'Unresolved course: Demo Course Two' })).toBeInTheDocument()
    expect(within(editDialog).getByRole('option', { name: /Unresolved batch/ })).toBeInTheDocument()
    expect(within(editDialog).getByLabelText(/Desired Course/)).toHaveValue(record.courseId)
  })
  it('shows a selection loading failure and supports retry', async () => {
    vi.spyOn(courseService, 'list').mockRejectedValueOnce(Error('DEMO unavailable'))
    const user = userEvent.setup(); render(<App />)
    await user.click(await screen.findByRole('button', { name: 'New Admission' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('DEMO unavailable')
    expect(screen.getByRole('button', { name: 'Submit Application' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Retry selections' }))
    await waitFor(() => expect(screen.getByLabelText(/Desired Course/)).toBeEnabled())
  })
})
