import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { academicService } from '../../services/academicService.js'
import { facultyService } from '../../services/facultyService.js'
import { payrollService } from '../../services/payrollService.js'
import { notificationService } from '../../services/notificationService.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

beforeEach(() => {
  localStorage.clear()
  history.replaceState(null, '', ROUTE_PATHS.DASHBOARD)
})

async function signInAsTeacher() {
  await authService.login({ userId: 'demo-teacher' })
  await authService.selectBranch('demo-teacher', 'demo-central')
}

async function signInAsAdmin() {
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', 'demo-central')
}

async function setupTeacherAssignment() {
  await signInAsAdmin()
  const q = { branchId: 'demo-central' }
  const stream = await academicService.saveStream(null, { name: 'Faculty Stream', active: true }, q)
  const course = await academicService.saveCourse(
    null,
    { name: 'Faculty Course', streamId: stream.id, active: true, pricingMode: 'course', feeAmount: 20000 },
    q
  )
  const subject = await academicService.saveSubject(
    null,
    { name: 'Faculty Subject', courseId: course.id, active: true, feeAmount: 5000 },
    q
  )
  const batch = await academicService.saveBatch(
    null,
    { name: 'Faculty Batch', courseId: course.id, active: true },
    q
  )

  const assignment = await facultyService.assignFaculty({
    teacherId: 'demo-teacher',
    courseId: course.id,
    batchId: batch.id,
    subjectId: subject.id,
    days: ['Mon', 'Wed'],
    startTime: '10:00',
    endTime: '11:30',
    room: 'Room 101'
  }, q)

  await payrollService.saveAgreement({
    teacherId: 'demo-teacher',
    courseId: course.id,
    batchId: batch.id,
    subjectId: subject.id,
    facultyAssignmentId: assignment.id,
    calculationMethod: 'fixed',
    monthlySalary: 35000,
    notes: 'Approved teaching remuneration'
  }, q)

  return { course, batch, subject, assignment }
}

describe('Teacher "My Profile" & Salary Compensation flow', () => {
  it('renders My Profile link in sidebar for Teacher role and navigates to /my-profile', async () => {
    await signInAsTeacher()
    render(<App />)

    const profileLink = await screen.findByRole('link', { name: 'My Profile' }, { timeout: 10000 })
    expect(profileLink).toBeInTheDocument()
    expect(profileLink).toHaveAttribute('href', ROUTE_PATHS.MY_PROFILE)

    await userEvent.setup().click(profileLink)

    expect(await screen.findByRole('heading', { name: 'Faculty Teacher' }, { timeout: 10000 })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Back to Dashboard/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /WhatsApp/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^Call$/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Salary & Compensation/i })).toBeInTheDocument()
  })

  it('projects saved assignment metrics into the teacher profile KPI cards', async () => {
    await setupTeacherAssignment()
    await signInAsTeacher()
    history.replaceState(null, '', ROUTE_PATHS.MY_PROFILE)
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Faculty Teacher' }, { timeout: 10000 })).toBeInTheDocument()
    const cardFor = label => screen.getByText(label).closest('[data-slot="card"]')
    expect(within(cardFor('Total Batches')).getByText('1')).toBeInTheDocument()
    expect(within(cardFor('Weekly Hours')).getByText('3')).toBeInTheDocument()
    expect(within(cardFor('Student Reach')).getByText('0')).toBeInTheDocument()
    expect(within(cardFor('Class Slots')).getByText('1')).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: /Academic Assignments/i }))
    expect(await screen.findByText('Faculty Batch')).toBeInTheDocument()
  })

  it('allows teacher to switch to Salary & Compensation tab and view financial KPIs and tables', async () => {
    await signInAsTeacher()
    history.replaceState(null, '', ROUTE_PATHS.MY_PROFILE)
    render(<App />)

    const salaryTab = await screen.findByRole('button', { name: /Salary & Compensation/i }, { timeout: 10000 })
    expect(salaryTab).toBeInTheDocument()

    await userEvent.setup().click(salaryTab)

    expect(await screen.findByText('Official Faculty Compensation & Teaching Ledgers', {}, { timeout: 10000 })).toBeInTheDocument()
    expect(screen.getByText('Total Contracted')).toBeInTheDocument()
    expect(screen.getByText('Disbursed / Paid')).toBeInTheDocument()
    expect(screen.getByText('Remaining Balance')).toBeInTheDocument()
    expect(screen.getByText('Settlement Ratio')).toBeInTheDocument()
    expect(screen.getByText('Course & Batch Remuneration Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Verified Payment Receipts & Disbursement History')).toBeInTheDocument()
  })

  it('opens a Teacher dashboard session in the own-profile timetable instead of the denied Faculty route', async () => {
    const { assignment } = await setupTeacherAssignment()
    const today = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', weekday: 'short' }).format(new Date())
    await facultyService.updateAssignment(assignment.id, { days: [today] }, { branchId: 'demo-central' })
    await signInAsTeacher()
    render(<App />)
    const session = await screen.findByRole('button', { name: /Faculty Subject.*Faculty Course.*Faculty Batch/i }, { timeout: 10000 })
    await userEvent.setup().click(session)
    expect(location.pathname).toBe(ROUTE_PATHS.MY_PROFILE)
    expect(await screen.findByRole('heading', { name: 'Faculty Teacher' }, { timeout: 10000 })).toBeInTheDocument()
    expect(screen.getAllByText('Faculty Subject').length).toBeGreaterThan(0)
    expect(screen.queryByText('Teacher particulars')).not.toBeInTheDocument()
  })

  it('opens Payslip modal when clicking Payslip action on a salary assignment', async () => {
    await setupTeacherAssignment()

    await signInAsTeacher()
    history.replaceState(null, '', ROUTE_PATHS.MY_PROFILE)
    render(<App />)

    const salaryTab = await screen.findByRole('button', { name: /Salary & Compensation/i }, { timeout: 10000 })
    await userEvent.setup().click(salaryTab)

    const payslipBtn = await screen.findByRole('button', { name: /^Payslip$/i }, { timeout: 10000 })
    expect(payslipBtn).toBeInTheDocument()

    await userEvent.setup().click(payslipBtn)

    expect(await screen.findByRole('heading', { name: /Official Faculty Payslip/i }, { timeout: 10000 })).toBeInTheDocument()
    expect(screen.getAllByText('Faculty Teacher').length).toBeGreaterThan(0)
  })

  it('notifies teacher when Super Admin disburses a salary payment', async () => {
    await setupTeacherAssignment()

    const overview = await payrollService.getRunningOverview({ branchId: 'demo-central' })
    const line = overview.lines.find(l => l.teacherId === 'demo-teacher')
    expect(line).toBeDefined()

    await payrollService.recordPayment({
      payrollLineId: line.id,
      amount: 10000,
      method: 'Bank Transfer',
      transactionReference: 'TXN-SAL-NOTIF-01'
    }, { branchId: 'demo-central' })

    // Now teacher checks notifications
    await signInAsTeacher()
    const notifs = await notificationService.list({ branchId: 'demo-central' })
    const salaryNotif = notifs.find(n => n.type === 'salary_payment')
    expect(salaryNotif).toBeDefined()
    expect(salaryNotif.title).toBe('Salary Disbursed')
    expect(salaryNotif.message).toContain('10,000')
  })

  it('prevents teachers from inspecting another faculty member compensation', async () => {
    await signInAsTeacher()
    await expect(
      payrollService.getTeacherCompensation({ branchId: 'demo-central', teacherId: 'teacher-naeem' })
    ).rejects.toThrow('Teachers can only view their own compensation')
  })
})
