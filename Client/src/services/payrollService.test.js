import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { authService } from './authService.js'
import { payrollService } from './payrollService.js'
import { academicService } from './academicService.js'
import { facultyService } from './facultyService.js'
import { organizationService } from './organizationService.js'
import { studentService } from './studentService.js'
import { financialService } from './financialService.js'
import { MOCK_DATABASE_KEY } from '../constants/storageKeys.js'
import { reportService } from './reportService.js'
import { payrollReportTotals } from '../utils/payrollReport.js'

const q = { branchId: 'demo-central' }
let fixture
const read = () => JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
const write = (data) => localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
async function login(userId = 'demo-admin') {
  await authService.login({ userId })
  await authService.selectBranch(userId, q.branchId)
}
async function setup() {
  const stream = await academicService.saveStream(null, { name: 'Payroll Stream', active: true }, q)
  const course = await academicService.saveCourse(
    null,
    {
      name: 'Science Payroll',
      streamId: stream.id,
      active: true,
      pricingMode: 'course',
      feeAmount: 20000,
    },
    q
  )
  const subject = await academicService.saveSubject(
    null,
    { name: 'Biology', courseId: course.id, active: true, feeAmount: 5000 },
    q
  )
  const other = await academicService.saveSubject(
    null,
    { name: 'Other Subject', courseId: course.id, active: true, feeAmount: 1000 },
    q
  )
  const b1 = await academicService.saveBatch(
    null,
    { name: 'Batch 1', courseId: course.id, active: true },
    q
  )
  const b2 = await academicService.saveBatch(
    null,
    { name: 'Batch 2', courseId: course.id, active: true },
    q
  )
  const make = (batch) =>
    facultyService.assignFaculty(
      {
        teacherId: 'teacher-naeem',
        courseId: course.id,
        batchId: batch.id,
        subjectId: subject.id,
        days: ['Mon'],
        startTime: batch === b1 ? '10:00' : '12:00',
        endTime: batch === b1 ? '11:00' : '13:00',
        room: batch.name,
      },
      q
    )
  const a1 = await make(b1),
    a2 = await make(b2)
  return { course, subject, other, b1, b2, a1, a2 }
}
const agreement = (a, extra = {}) => ({
  teacherId: a.teacherId,
  courseId: a.courseId,
  batchId: a.batchId,
  subjectId: a.subjectId,
  facultyAssignmentId: a.id,
  calculationMethod: 'fixed',
  monthlySalary: 50000,
  effectiveFrom: '2026-10-01',
  ...extra,
})
async function contract(a, extra = {}) {
  return payrollService.saveAgreement(agreement(a, extra), q)
}
async function contracts() {
  await contract(fixture.a1, {
    calculationMethod: 'percentage',
    feeBasis: 'subject',
    feePercentage: 30,
  })
  await contract(fixture.a2)
}
function enroll(count = 50, subjectId = fixture.subject.id, batchId = fixture.b1.id) {
  const d = read()
  for (let i = 0; i < count; i++) {
    const id = 'payroll-student-' + d.students.length,
      aid = 'payroll-admission-' + d.admissions.length
    d.students.push({
      id,
      branchId: q.branchId,
      name: 'Payroll Student ' + i,
      status: 'Active',
      createdByAdmissionFlow: true,
      admissionId: aid,
    })
    d.admissions.push({
      id: aid,
      branchId: q.branchId,
      studentName: 'Payroll Student ' + i,
      guardianName: 'QA Guardian',
      contact: '03001234567',
      dob: '2010-01-01',
      course: fixture.course.name,
      courseId: fixture.course.id,
      status: 'Approved',
      createdAt: '2026-10-01T08:00:00Z',
      studentId: id,
      createdByAdmissionFlow: true,
    })
    d.enrollments.push({
      id: 'payroll-enr-' + d.enrollments.length,
      branchId: q.branchId,
      admissionId: aid,
      studentId: id,
      courseId: fixture.course.id,
      batchId,
      subjectIds: [subjectId],
      status: 'Active',
      enrolledAt: '2026-10-01T08:00:00Z',
    })
  }
  write(d)
}
const pay = (line, amount, ref = 'PAY-001', paymentDate) =>
  payrollService.recordPayment(
    { payrollLineId: line.id, amount, method: 'Cash', transactionReference: ref, paymentDate },
    q
  )
const overview = () => payrollService.getRunningOverview(q)
beforeEach(async () => {
  localStorage.clear()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-22T07:00:00Z'))
  await login()
  fixture = await setup()
})
afterEach(() => vi.useRealTimers())

describe('one running salary balance', () => {
  it('reconciles cached reports after partial and full payments without duplicate expenses', async () => {
    await contract(fixture.a1, { monthlySalary: 15000 })
    await contract(fixture.a2, { monthlySalary: 20000 })
    const first = await reportService.overview(q)
    expect(payrollReportTotals(first.payroll)).toMatchObject({ payable: 35000, paid: 0, outstanding: 35000, teachers: 1, pendingEntries: 2 })
    const line = (await overview()).lines.find(item => item.facultyAssignmentId === fixture.a1.id)
    const expensesBefore = read().expenses.length
    await pay(line, 5000, 'REPORT-PART', '2026-10-10')
    const partial = await reportService.overview(q)
    expect(payrollReportTotals(partial.payroll)).toMatchObject({ payable: 35000, paid: 5000, outstanding: 30000 })
    await pay(line, 10000, 'REPORT-FULL', '2026-10-11')
    expect(payrollReportTotals((await reportService.overview(q)).payroll)).toMatchObject({ paid: 15000, outstanding: 20000, paidEntries: 1 })
    expect(read().expenses.length).toBe(expensesBefore + 2)
    await authService.selectBranch('demo-admin', 'demo-north')
    expect((await reportService.overview({ branchId: 'demo-north' })).payroll).toEqual([])
    await authService.selectBranch('demo-admin', q.branchId)
    expect((await reportService.overview(q)).payroll).toHaveLength(2)
    await login('demo-owner')
    expect((await reportService.overview(q)).payroll).toHaveLength(2)
    await authService.login({ userId: 'demo-reception' })
    await authService.selectBranch('demo-reception', 'demo-north')
    expect((await reportService.overview({ branchId: 'demo-north' })).payroll).toEqual([])
    await expect(reportService.overview(q)).rejects.toThrow()
  })
  it('has no salary rows without assignments and never writes a new monthly salary on read', async () => {
    const d = read()
    d.facultyAssignments = []
    write(d)
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    expect((await overview()).lines).toEqual([])
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
  })
  it('records 15000 salary, accepts 5000 immediately, and keeps 10000 until any later date', async () => {
    await contract(fixture.a1, { monthlySalary: 15000 })
    let line = (await overview()).lines.find((l) => l.facultyAssignmentId === fixture.a1.id)
    const posted = await pay(line, 5000, 'PART-1', '2026-10-10')
    expect(posted.line).toMatchObject({
      netPayable: 15000,
      totalPaid: 5000,
      outstanding: 10000,
      status: 'Partially Paid',
    })
    expect(posted.expense.entryDate).toBe('2026-10-10')
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    for (const date of ['2026-11-22', '2027-01-01', '2027-05-06']) {
      vi.setSystemTime(new Date(date + 'T07:00:00Z'))
      line = (await overview()).lines.find((l) => l.facultyAssignmentId === fixture.a1.id)
      expect(line).toMatchObject({ netPayable: 15000, totalPaid: 5000, outstanding: 10000 })
      expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
    }
    await pay(line, 10000, 'PART-2', '2027-05-06')
    expect((await overview()).lines.find((l) => l.id === line.id)).toMatchObject({
      netPayable: 15000,
      totalPaid: 15000,
      outstanding: 0,
      status: 'Paid',
    })
    expect(read().payrollPeriods).toHaveLength(0)
  })
  it('keeps a single balance when the same salary agreement is saved repeatedly', async () => {
    for (let i = 0; i < 3; i++) await contract(fixture.a1, { monthlySalary: 15000 })
    const lines = (await overview()).lines.filter((l) => l.facultyAssignmentId === fixture.a1.id)
    expect(lines).toHaveLength(1)
    expect(lines[0].netPayable).toBe(15000)
    expect(lines[0].salaryRevisions.length).toBe(2)
  })
  it('preserves payments when salary changes and rejects salary below the amount already paid', async () => {
    await contract(fixture.a1, { monthlySalary: 15000 })
    let line = (await overview()).lines[0]
    await pay(line, 5000)
    const history = read().payrollPayments
    await contract(fixture.a1, { monthlySalary: 20000 })
    line = (await overview()).lines[0]
    expect(line).toMatchObject({ netPayable: 20000, totalPaid: 5000, outstanding: 15000 })
    await expect(contract(fixture.a1, { monthlySalary: 4000 })).rejects.toThrow(
      'lower than payments'
    )
    expect(read().payrollPayments).toEqual(history)
  })
  it('keeps percentage and fixed salaries separate by assignment, using actual listed fees and enrolled students', async () => {
    enroll()
    await contracts()
    const lines = (await overview()).lines
    expect(lines[0]).toMatchObject({
      netPayable: 75000,
      calculationDetails: { eligibleStudents: 50, feeSourceId: fixture.subject.id },
    })
    expect(lines[1]).toMatchObject({ netPayable: 50000 })
    await pay(lines[0], 5000)
    expect((await overview()).lines[1].totalPaid).toBe(0)
  })
  it('freezes a saved percentage salary on navigation and recomputes only on explicit agreement save', async () => {
    enroll(2)
    await contracts()
    const before = (await overview()).lines[0].netPayable
    await academicService.saveSubject(
      fixture.subject.id,
      { name: 'Biology', courseId: fixture.course.id, active: true, feeAmount: 6000 },
      q
    )
    expect((await overview()).lines[0].netPayable).toBe(before)
    await contract(fixture.a1, {
      calculationMethod: 'percentage',
      feeBasis: 'subject',
      feePercentage: 30,
    })
    expect((await overview()).lines[0].netPayable).toBe(3600)
  })
  it('requires actual subject mapping and fee instead of fabricating salary', async () => {
    enroll(2)
    let d = read()
    delete d.enrollments.find((e) => e.courseId === fixture.course.id).subjectIds
    write(d)
    const percentage = { calculationMethod: 'percentage', feeBasis: 'subject', feePercentage: 30 }
    await expect(contract(fixture.a1, percentage)).rejects.toThrow('mapping is missing')
    d = read()
    d.enrollments
      .filter((e) => e.courseId === fixture.course.id)
      .forEach((e) => (e.subjectIds = [fixture.subject.id]))
    delete d.subjects.find((s) => s.id === fixture.subject.id).feeAmount
    write(d)
    await expect(contract(fixture.a1, percentage)).rejects.toThrow('fee is missing')
  })
  it('requires explicit full-course fee authorization', async () => {
    const options = { calculationMethod: 'percentage', feeBasis: 'course', feePercentage: 30 }
    await expect(contract(fixture.a1, options)).rejects.toThrow('Explicitly authorize')
    enroll(2)
    await contract(fixture.a1, { ...options, fullCourseFeeAuthorized: true })
    expect((await overview()).lines[0].netPayable).toBe(12000)
  })
  it.each([0, -1, 101, Infinity, NaN])('rejects invalid percentages %s', async (feePercentage) => {
    await expect(
      contract(fixture.a1, { calculationMethod: 'percentage', feeBasis: 'subject', feePercentage })
    ).rejects.toThrow()
  })
  it('rejects duplicate, negative, invalid-date and excessive payments with one Finance posting per payment', async () => {
    await contract(fixture.a1, { monthlySalary: 15000 })
    await contract(fixture.a2)
    const lines = (await overview()).lines,
      before = (await financialService.financeOverview(q)).expenses.length
    await pay(lines[0], 5000)
    await expect(pay(lines[0], 5000)).rejects.toThrow('already been posted')
    await expect(pay(lines[1], 100, 'PAY-001')).rejects.toThrow('already been posted')
    await expect(pay(lines[0], 10001, 'OVER')).rejects.toThrow('exceeds')
    await expect(pay(lines[0], -1, 'NEG')).rejects.toThrow('positive')
    await expect(pay(lines[0], 1, 'BAD-DATE', '2026-02-30')).rejects.toThrow('payment date')
    expect((await financialService.financeOverview(q)).expenses).toHaveLength(before + 1)
    expect((await payrollService.getPayslip(lines[0].id, q)).payments).toHaveLength(1)
  })
  it('carries legacy paid/unpaid salaries without editing their periods or source lines', async () => {
    const d = read(),
      legacy = {
        id: 'old-line',
        branchId: q.branchId,
        payrollPeriodId: 'old-period',
        teacherId: fixture.a1.teacherId,
        courseId: fixture.a1.courseId,
        batchId: fixture.a1.batchId,
        subjectId: fixture.a1.subjectId,
        facultyAssignmentId: fixture.a1.id,
        teacherName: 'Prof. Naeem',
        netPayable: 15000,
        totalPaid: 5000,
        outstanding: 10000,
        status: 'Partially Paid',
        payrollVersion: 2,
        yearMonth: '2026-09',
      }
    d.payrollPeriods.push({
      id: 'old-period',
      branchId: q.branchId,
      yearMonth: '2026-09',
      status: 'Approved',
    })
    d.payrollLines.push(legacy)
    d.payrollPayments.push({
      id: 'old-pay',
      branchId: q.branchId,
      payrollLineId: 'old-line',
      amount: 5000,
      paidAt: '2026-09-03T07:00:00Z',
      transactionReference: 'OLD',
    })
    write(d)
    const periods = read().payrollPeriods
    const line = (await overview()).lines.find((l) => l.sourcePayrollLineIds.includes('old-line'))
    await pay(line, 10000, 'SETTLE')
    const updated = (await overview()).lines.find((l) =>
      l.sourcePayrollLineIds.includes('old-line')
    )
    expect(updated).toMatchObject({ totalPaid: 15000, outstanding: 0 })
    expect(
      (await overview()).lines.filter((l) => l.facultyAssignmentId === fixture.a1.id)
    ).toHaveLength(1)
    expect(read().payrollLines.find((l) => l.id === 'old-line')).toEqual(legacy)
    expect(read().payrollPeriods).toEqual(periods)
    await expect(pay(legacy, 1, 'OLD-ID')).rejects.toThrow('exceeds')
    expect((await payrollService.getPayslip(updated.id, q)).payments).toHaveLength(2)
  })
  it('preserves earned balances after assignment removal but creates no new unearned salary', async () => {
    await contract(fixture.a1, { monthlySalary: 15000 })
    await facultyService.removeAssignment(fixture.a1.id, q)
    const line = (await overview()).lines.find((l) => l.facultyAssignmentId === fixture.a1.id)
    expect(line.outstanding).toBe(15000)
    await pay(line, 5000)
    await expect(contract(fixture.a1)).rejects.toThrow('valid saved teaching assignment')
  })
  it('enforces role and branch access while allowing Owner read-only payroll', async () => {
    const receptionist = await organizationService.saveUser({
      name: 'Pay Reception',
      login: 'pay-rec@example.test',
      assignments: [{ branchId: q.branchId, roles: ['receptionist'] }],
    })
    const admin = await organizationService.saveUser({
      name: 'Pay Admin',
      login: 'pay-adm@example.test',
      assignments: [{ branchId: q.branchId, roles: ['admin'] }],
    })
    await login(admin.id)
    await contract(fixture.a1, { monthlySalary: 15000 })
    const line = (await overview()).lines[0]
    await expect(
      payrollService.recordPayment(
        { payrollLineId: line.id, amount: 1, method: 'Cash', transactionReference: 'CROSS' },
        { branchId: 'demo-north' }
      )
    ).rejects.toThrow()
    await login('demo-owner')
    await expect(overview()).resolves.toBeDefined()
    await expect(pay(line, 1)).rejects.toThrow('Only Admin')
    for (const id of ['demo-teacher', receptionist.id]) {
      await login(id)
      await expect(overview()).rejects.toThrow()
    }
  })
  it('keeps academic/student/Finance data readable and disables old approval/cycle entry points', async () => {
    await contract(fixture.a1, { monthlySalary: 15000 })
    expect((await studentService.list(q)).length).toBeGreaterThanOrEqual(0)
    expect(
      (await academicService.overview(q)).courses.some((c) => c.id === fixture.course.id)
    ).toBe(true)
    expect(payrollService.approvePeriod).toBeUndefined()
    expect(payrollService.calculatePeriod).toBeUndefined()
  })
})
