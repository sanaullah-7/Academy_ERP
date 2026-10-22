import { beforeEach, expect, it } from 'vitest'
import { authService } from './authService.js'
import { dashboardService } from './dashboardService.js'
import { academicService } from './academicService.js'
import { facultyService } from './facultyService.js'
import { admissionService } from './admissionService.js'
import { financialService } from './financialService.js'
import { payrollService } from './payrollService.js'

const central = { branchId: 'demo-central' }
const north = { branchId: 'demo-north' }

beforeEach(() => localStorage.clear())

async function login(userId, branchId) {
  await authService.login({ userId })
  const session = await authService.getSession()
  if (session.branchId !== branchId) await authService.selectBranch(userId, branchId)
}

it('projects one saved faculty assignment to Admin and only the assigned Teacher account', async () => {
  await login('demo-admin', central.branchId)
  const subject = await academicService.saveSubject(null, { name: 'Dashboard QA Subject', courseId: 'course-demo-2', active: true }, central)
  const assignment = await facultyService.assignFaculty({ teacherId: 'demo-teacher', courseId: 'course-demo-2', batchId: 'batch-demo-course-demo-2', subjectId: subject.id, days: ['Thursday'], startTime: '18:00', endTime: '19:00', room: 'QA Dashboard Room' }, central)
  expect((await dashboardService.overview(central)).assignments).toContainEqual(expect.objectContaining({ id: assignment.id }))

  await login('demo-teacher', central.branchId)
  const teacher = await dashboardService.overview(central)
  expect(teacher.assignments).toContainEqual(expect.objectContaining({ id: assignment.id, room: 'QA Dashboard Room' }))
  expect(teacher.assignments.every(item => item.teacherId === 'demo-teacher')).toBe(true)
  expect(teacher.payments).toEqual([])
  expect(teacher.expenses).toEqual([])
})

it('invalidates a cached dashboard after enrollment and verified payment mutations', async () => {
  await login('demo-admin', north.branchId)
  const before = await dashboardService.overview(north)
  const admission = await admissionService.create({ studentName: 'Dashboard Flow Student', guardianName: 'Dashboard Guardian', contact: '03000000000', dob: '2010-01-01', course: 'Demo Course One', courseId: 'course-demo-1', preferredBatchId: 'batch-demo-course-demo-1' }, north)
  await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, north)
  const enrolled = await admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-1' }, north)
  const challan = await financialService.createChallan({ enrollmentId: enrolled.enrollment.id, description: 'Dashboard fee', amount: 10000, issueDate: '2026-10-22', dueDate: '2026-11-22' }, north)
  await financialService.recordPayment({ challanId: challan.id, amount: 100, method: 'Cash' }, north)
  const after = await dashboardService.overview(north)
  expect(after.students.length).toBe(before.students.length + 1)
  expect(after.enrollments.length).toBe(before.enrollments.length + 1)
  expect(after.payments.length).toBe(before.payments.length + 1)
})

it('keeps Owner finance/payroll authorized and Receptionist payroll/expenses hidden across branches', async () => {
  await login('demo-owner', central.branchId)
  const owner = await dashboardService.overview(central)
  expect(owner.role).toBe('owner')
  expect(Array.isArray(owner.payroll)).toBe(true)
  expect(Array.isArray(owner.expenses)).toBe(true)

  await login('demo-reception', north.branchId)
  const receptionist = await dashboardService.overview(north)
  expect(receptionist.role).toBe('receptionist')
  expect(receptionist.payroll).toEqual([])
  expect(receptionist.expenses).toEqual([])
  await expect(dashboardService.overview(central)).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
})

it('propagates an Admin salary agreement and payment to Owner reporting and only the matching Teacher salary', async () => {
  await login('demo-admin', central.branchId)
  const subject = await academicService.saveSubject(null, { name: 'Dashboard Salary Subject', courseId: 'course-demo-2', active: true }, central)
  const assignment = await facultyService.assignFaculty({ teacherId: 'demo-teacher', courseId: 'course-demo-2', batchId: 'batch-demo-course-demo-2', subjectId: subject.id, days: ['Friday'], startTime: '20:00', endTime: '21:00', room: 'Salary QA' }, central)
  await payrollService.saveAgreement({ teacherId: assignment.teacherId, courseId: assignment.courseId, batchId: assignment.batchId, subjectId: assignment.subjectId, facultyAssignmentId: assignment.id, calculationMethod: 'fixed', monthlySalary: 15000, effectiveFrom: '2026-10-01' }, central)
  const line = (await payrollService.getRunningOverview(central)).lines.find(item => item.facultyAssignmentId === assignment.id)
  await payrollService.recordPayment({ payrollLineId: line.id, amount: 5000, method: 'Cash', transactionReference: 'DASHBOARD-QA', paymentDate: '2026-10-22' }, central)

  await login('demo-owner', central.branchId)
  expect((await dashboardService.overview(central)).payroll).toContainEqual(expect.objectContaining({ teacherId: 'demo-teacher', paid: 5000, remainingBalance: 10000 }))
  await login('demo-teacher', central.branchId)
  const teacher = await dashboardService.overview(central)
  expect(teacher.payroll).toHaveLength(1)
  expect(teacher.payroll[0]).toMatchObject({ teacherId: 'demo-teacher', paid: 5000, remainingBalance: 10000 })
  expect(teacher.payments).toEqual([])
})
