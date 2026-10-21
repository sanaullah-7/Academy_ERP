import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { academicService } from '../../services/academicService.js'
import { facultyService } from '../../services/facultyService.js'
import { demoClassService } from '../../services/demoClassService.js'
import { classScheduleService } from '../../services/classScheduleService.js'

const scope = { branchId: 'demo-central' }
let course, batch, otherBatch
beforeEach(async () => {
  localStorage.clear()
  history.replaceState(null, '', '/demo-classes')
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', scope.branchId)
  const field = await academicService.saveStream(null, { name: 'QA Saved Field', active: true }, scope)
  course = await academicService.saveCourse(null, { name: 'QA Saved Course', streamId: field.id, active: true }, scope)
  batch = await academicService.saveBatch(null, { name: 'QA Selected Batch', courseId: course.id, active: true }, scope)
  otherBatch = await academicService.saveBatch(null, { name: 'QA Other Batch', courseId: course.id, active: true }, scope)
  const biology = await academicService.saveSubject(null, { name: 'QA Saved Biology', courseId: course.id, active: true }, scope)
  const chemistry = await academicService.saveSubject(null, { name: 'QA Other Chemistry', courseId: course.id, active: true }, scope)
  await facultyService.assignFaculty({ courseId: course.id, batchId: batch.id, subjectId: biology.id, teacherId: 'demo-teacher', days: ['Wednesday'], startTime: '08:00', endTime: '09:00', room: 'QA Actual Lab' }, scope)
  await facultyService.assignFaculty({ courseId: course.id, batchId: otherBatch.id, subjectId: chemistry.id, teacherId: 'demo-teacher', days: ['Wednesday'], startTime: '09:00', endTime: '10:00', room: 'QA Other Room' }, scope)
})

async function openRegistration() {
  const user = userEvent.setup()
  render(<App />)
  await user.click(await screen.findByRole('button', { name: /Register Demo Student/ }))
  await user.selectOptions(screen.getByLabelText('Academic Field'), 'QA Saved Field')
  await user.selectOptions(screen.getByLabelText(/Interested Course/), course.id)
  await user.selectOptions(screen.getByLabelText(/Preferred Batch/), batch.id)
  fireEvent.change(screen.getByLabelText(/Requested Date/), { target: { value: '2027-04-06' } })
  return user
}

describe('Demo registration saved class flow', () => {
  it('shows only the selected batch classes, fills timing, and persists a demo request without enrollment', async () => {
    const user = await openRegistration()
    const timing = await screen.findByRole('button', { name: 'Use QA Saved Biology timing on 2027-04-07 at 8:00 AM' })
    expect(screen.queryByText('QA Other Chemistry')).not.toBeInTheDocument()
    expect(screen.getByText('QA Actual Lab')).toBeInTheDocument()
    expect(screen.getByText('8:00 AM - 9:00 AM (Morning)')).toBeInTheDocument()
    await user.click(timing)
    expect(screen.getByLabelText(/Requested Date/)).toHaveValue('2027-04-07')
    expect(screen.getByLabelText('Preferred Time')).toHaveValue('8:00')
    await user.type(screen.getByLabelText(/Student Name/), 'QA Prospective Biology Candidate')
    await user.type(screen.getByLabelText(/Guardian Name/), 'QA Guardian')
    await user.type(screen.getByLabelText(/Guardian Contact/), '03000000076')
    await user.click(screen.getByRole('button', { name: 'Register Demo Inquiry' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect((await demoClassService.list(scope)).find(item => item.studentName === 'QA Prospective Biology Candidate')).toMatchObject({ courseId: course.id, preferredBatchId: batch.id, requestedDate: '2027-04-07', requestedTime: '08:00', status: 'Registered', scheduledSession: null })
  })

  it('refreshes newly saved classes on focus without clearing candidate input, and clears old batch choices', async () => {
    const user = await openRegistration()
    await screen.findByText('QA Saved Biology')
    await user.type(screen.getByLabelText(/Student Name/), 'QA Draft Must Survive')
    const math = await academicService.saveSubject(null, { name: 'QA New Mathematics', courseId: course.id, active: true }, scope)
    await facultyService.assignFaculty({ courseId: course.id, batchId: batch.id, subjectId: math.id, teacherId: 'demo-teacher', days: ['Wednesday'], startTime: '10:00', endTime: '11:00', room: 'QA New Room' }, scope)
    fireEvent(window, new Event('focus'))
    await screen.findByText('QA New Mathematics')
    expect(screen.getByLabelText(/Student Name/)).toHaveValue('QA Draft Must Survive')
    await user.selectOptions(screen.getByLabelText(/Preferred Batch/), otherBatch.id)
    expect(await screen.findByText('QA Other Chemistry')).toBeInTheDocument()
    expect(screen.queryByText('QA Saved Biology')).not.toBeInTheDocument()
    expect(screen.queryByText('QA New Mathematics')).not.toBeInTheDocument()
  })

  it('shows a load error with a working retry instead of inventing fallback class slots', async () => {
    vi.spyOn(classScheduleService, 'list').mockRejectedValueOnce(new Error('QA schedule temporarily unavailable'))
    const user = await openRegistration()
    expect(await screen.findByText('QA schedule temporarily unavailable')).toBeInTheDocument()
    expect(screen.queryByText('QA Saved Biology')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry classes' }))
    expect(await screen.findByText('QA Saved Biology')).toBeInTheDocument()
  })
  it('selects multiple classes, toggles independently and persists choices after registration', async () => {
    const math = await academicService.saveSubject(null, { name: 'QA Multi Mathematics', courseId: course.id, active: true }, scope)
    await facultyService.assignFaculty({ courseId: course.id, batchId: batch.id, subjectId: math.id, teacherId: 'demo-teacher', days: ['Wednesday'], startTime: '10:00', endTime: '11:00', room: 'QA Math Room' }, scope)
    const user = await openRegistration()
    const biology = await screen.findByRole('button', { name: /Use QA Saved Biology timing/ })
    const mathematics = screen.getByRole('button', { name: /Use QA Multi Mathematics timing/ })
    await user.click(biology)
    await user.click(mathematics)
    expect(biology).toHaveAttribute('aria-pressed', 'true')
    expect(mathematics).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('2 classes selected')).toBeInTheDocument()
    await user.click(biology)
    expect(biology).toHaveAttribute('aria-pressed', 'false')
    expect(mathematics).toHaveAttribute('aria-pressed', 'true')
    await user.click(biology)
    await user.type(screen.getByLabelText(/Student Name/), 'QA Multi Trial Candidate')
    await user.type(screen.getByLabelText(/Guardian Name/), 'QA Guardian')
    await user.type(screen.getByLabelText(/Guardian Contact/), '03000000077')
    await user.click(screen.getByRole('button', { name: 'Register Demo Inquiry' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    const record = (await demoClassService.list(scope)).find(item => item.studentName === 'QA Multi Trial Candidate')
    expect(record.requestedClasses).toHaveLength(2)
    expect(record.requestedClasses.map(item => item.subject).sort()).toEqual(['QA Multi Mathematics', 'QA Saved Biology'])
    expect(record.status).toBe('Registered')
    expect(record.scheduledSession).toBeNull()
    await user.click(screen.getAllByRole('button', { name: 'Actions for QA Multi Trial Candidate' })[0])
    await user.click(screen.getByRole('menuitem', { name: 'View Details' }))
    expect(screen.getByRole('region', { name: 'Requested demo classes' })).toHaveTextContent('QA Multi Mathematics')
  })

})
