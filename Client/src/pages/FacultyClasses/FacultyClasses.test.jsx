import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { admissionService } from '../../services/admissionService.js'

beforeEach(() => {
  localStorage.clear()
  history.replaceState(null, '', '/faculty')
})

async function signIn(userId = 'demo-admin', branchId = 'demo-central') {
  await authService.login({ userId })
  await authService.selectBranch(userId, branchId)
}

describe('F05 Faculty & Classes screens', () => {
  it('shows branch teachers, combined search/filter/sort and links the exact teacher profile', async () => {
    await signIn()
    render(<App />)
    await screen.findAllByRole('link', { name: 'Faculty Teacher' })
    expect(screen.getByText('6 / 6 teachers')).toBeInTheDocument()
    await userEvent.setup().type(screen.getByRole('searchbox', { name: 'Search faculty' }), 'no match')
    expect(screen.queryByRole('link', { name: 'Faculty Teacher' })).not.toBeInTheDocument()
    await userEvent.setup().clear(screen.getByRole('searchbox', { name: 'Search faculty' }))
    await userEvent.setup().click(await screen.findAllByRole('link', { name: 'Faculty Teacher' }).then(found => found[0]))
    expect(await screen.findByRole('heading', { name: 'Faculty Teacher' })).toBeInTheDocument()
    expect(screen.getByText('Faculty Teacher', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByText('Central Campus', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByText('Professional & Academic Credentials')).toBeInTheDocument()
    expect(screen.getAllByText('Not recorded').length).toBeGreaterThan(0)
  })

  it('keeps subject assignments read-only and shows only branch batches with explicit unassigned state', async () => {
    await signIn()
    const admission = await admissionService.createWithStudent({
      studentName: 'DEMO F05 Enrolled Student',
      guardianName: 'DEMO Guardian',
      contact: '03001234567',
      dob: '2010-01-01',
      course: 'Demo Course Two',
      courseId: 'course-demo-2',
    }, { branchId: 'demo-central' })
    await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, { branchId: 'demo-central' })
    await admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, { branchId: 'demo-central' })
    history.replaceState(null, '', '/faculty/subjects')
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByText(/Subject records and teacher-subject assignment links are not available/)).toBeInTheDocument()
    await user.click(await screen.findByRole('link', { name: 'Batch assignments' }))
    expect(await screen.findByText('DEMO Batch - Demo Course Two')).toBeInTheDocument()
    expect(screen.getAllByText('Teacher assignment: None saved').length).toBeGreaterThan(0)
    await user.click(screen.getAllByRole('link', { name: 'View enrolled students' }).find(link => link.getAttribute('href') === '/faculty/classes/batch-demo-course-demo-2'))
    expect(await screen.findByRole('heading', { name: 'Enrolled Students' })).toBeInTheDocument()
    expect(await screen.findByText('DEMO F05 Enrolled Student')).toBeInTheDocument()
    expect(screen.getByText(admission.admissionId)).toBeInTheDocument()
  })

  it('redirects the retired schedule URL to the current faculty assignment interface', async () => {
    await signIn()
    history.replaceState(null, '', '/faculty/schedule')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Faculty & Classes', level: 1 })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Add Class' })).toBeEnabled()
    expect(screen.getByText('ASSIGNED CLASSES & TIMETABLE')).toBeInTheDocument()
    expect(screen.queryByLabelText('Filter classes by date')).not.toBeInTheDocument()
  })

  it('denies Teacher and ambiguous multi-role accounts direct module access', async () => {
    await signIn('demo-teacher')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Access unavailable' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Faculty & Classes' })).not.toBeInTheDocument()
  })
})
