import { beforeEach, describe, expect, it } from 'vitest'
import { authService } from '../services/authService.js'
import { academicService } from '../services/academicService.js'
import { admissionService } from '../services/admissionService.js'
import { financialService } from '../services/financialService.js'
import { MOCK_DATABASE_KEY } from '../constants/storageKeys.js'

const branchId = 'demo-north'
const query = { branchId }

async function useAccount(userId, selectedBranch = branchId) {
  await authService.login({ userId })
  const session = await authService.getSession()
  if (!session.branchId) await authService.selectBranch(userId, selectedBranch)
}

describe('academic configuration and admission integration', () => {
  beforeEach(() => localStorage.clear())

  it('persists branch-scoped configuration and links it to a pending admission without financial writes', async () => {
    await useAccount('demo-admin')
    const stream = await academicService.saveStream(null, { name: 'Pre-Medical DEMO', active: true }, query)
    const course = await academicService.saveCourse(null, { name: 'MDCAT DEMO', streamId: stream.id, active: true, pricingMode: 'subjects' }, query)
    const batch = await academicService.saveBatch(null, { name: 'Morning DEMO', courseId: course.id, active: true, capacity: 30, startTime: '08:00', endTime: '12:00' }, query)
    const subject = await academicService.saveSubject(null, { name: 'Biology DEMO', courseId: course.id, active: true, feeAmount: 15000 }, query)

    const admission = await admissionService.create({ studentName: 'Configured Applicant', guardianName: 'Configured Guardian', contact: '03000000000', dob: '2010-01-01', course: course.name, courseId: course.id, streamId: stream.id, preferredBatchId: batch.id, subjectIds: [subject.id] }, query)
    const overview = await academicService.overview(query)
    const stored = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))

    expect(overview.streams).toContainEqual(expect.objectContaining({ id: stream.id }))
    expect(overview.courses).toContainEqual(expect.objectContaining({ id: course.id, streamName: stream.name, subjectCount: 1 }))
    expect(overview.batches).toContainEqual(expect.objectContaining({ id: batch.id, remainingSeats: 30 }))
    expect(admission).toMatchObject({ status: 'Pending', courseId: course.id, streamId: stream.id, preferredBatchId: batch.id, subjectIds: [subject.id] })
    expect(stored.challans).toEqual([])
    expect(stored.payments).toEqual([])
  })

  it('denies academic writes to a receptionist and rejects cross-branch references', async () => {
    await useAccount('demo-reception')
    await expect(academicService.saveStream(null, { name: 'Denied', active: true }, query)).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })

    await authService.logout()
    await useAccount('demo-admin')
    const central = { branchId: 'demo-central' }
    await authService.selectBranch('demo-admin', central.branchId)
    const stream = await academicService.saveStream(null, { name: 'Central Stream', active: true }, central)
    await authService.selectBranch('demo-admin', branchId)
    await expect(academicService.saveCourse(null, { name: 'Wrong Branch Course', streamId: stream.id, active: true, pricingMode: 'course', feeAmount: 1000 }, query)).rejects.toMatchObject({ code: 'INVALID_RECORD' })
  })

  it('deletes only unlinked same-branch streams, courses, batches and subjects', async () => {
    await useAccount('demo-admin')
    const stream = await academicService.saveStream(null, { name: 'Disposable Stream', active: true }, query)
    const course = await academicService.saveCourse(null, { name: 'Disposable Course', streamId: stream.id, active: true, pricingMode: 'course', feeAmount: 1000 }, query)
    const batch = await academicService.saveBatch(null, { name: 'Disposable Batch', courseId: course.id, active: true }, query)
    const subject = await academicService.saveSubject(null, { name: 'Disposable Subject', courseId: course.id, active: true, feeAmount: 500 }, query)
    await expect(academicService.deleteStream(stream.id, query)).rejects.toMatchObject({ code: 'LINKED_RECORD_PROTECTED' })
    await expect(academicService.deleteCourse(course.id, query)).rejects.toMatchObject({ code: 'LINKED_RECORD_PROTECTED' })
    await expect(academicService.deleteBatch(batch.id, query)).resolves.toMatchObject({ id: batch.id })
    await expect(academicService.deleteSubject(subject.id, query)).resolves.toMatchObject({ id: subject.id })
    await expect(academicService.deleteCourse(course.id, query)).resolves.toMatchObject({ id: course.id })
    await expect(academicService.deleteStream(stream.id, query)).resolves.toMatchObject({ id: stream.id })
    const overview = await academicService.overview(query)
    expect(overview.batches.some(item => item.id === batch.id)).toBe(false)
    expect(overview.subjects.some(item => item.id === subject.id)).toBe(false)
    expect(overview.courses.some(item => item.id === course.id)).toBe(false)
    expect(overview.streams.some(item => item.id === stream.id)).toBe(false)
  })

  it('carries the validated subject total into enrollment, challan and full/partial receipts', async () => {
    await useAccount('demo-admin')
    const stream = await academicService.saveStream(null, { name: 'QA Pre-Medical', active: true }, query)
    const course = await academicService.saveCourse(null, { name: 'QA MDCAT Preparation', streamId: stream.id, active: true, pricingMode: 'subjects' }, query)
    const batch = await academicService.saveBatch(null, { name: 'QA MDCAT Morning', courseId: course.id, active: true, capacity: 20, startTime: '08:00', endTime: '12:00' }, query)
    const subjects = await Promise.all(['Biology', 'Chemistry', 'Physics'].map(name => academicService.saveSubject(null, { name: `QA ${name}`, courseId: course.id, active: true, feeAmount: 15000 }, query)))
    const admission = await admissionService.createWithStudent({ studentName: 'QA Fictional Student A', guardianName: 'QA Fictional Guardian', contact: '03000000000', dob: '2010-01-01', course: course.name, courseId: course.id, streamId: stream.id, preferredBatchId: batch.id, subjectIds: subjects.map(subject => subject.id) }, query)
    expect(admission.configuredFee).toBe(45000)
    await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, query)
    const { enrollment } = await admissionService.enroll(admission.id, { batchId: batch.id }, query)
    expect(enrollment).toMatchObject({ configuredFee: 45000, subjectIds: subjects.map(subject => subject.id) })
    await expect(financialService.createChallan({ enrollmentId: enrollment.id, description: 'QA configured tuition', amount: 44000, issueDate: '2026-10-13', dueDate: '2026-10-31' }, query)).rejects.toMatchObject({ code: 'FEE_MISMATCH' })
    const challan = await financialService.createChallan({ enrollmentId: enrollment.id, description: 'QA configured tuition', amount: 45000, issueDate: '2026-10-13', dueDate: '2026-10-31' }, query)
    await expect(financialService.createChallan({ enrollmentId: enrollment.id, description: 'Duplicate', amount: 45000, issueDate: '2026-10-13', dueDate: '2026-10-31' }, query)).rejects.toMatchObject({ code: 'DUPLICATE_CHALLAN' })
    const first = await financialService.recordPayment({ challanId: challan.id, amount: 20000, method: 'Cash' }, query)
    expect((await financialService.overview(query)).challans.find(item => item.id === challan.id)).toMatchObject({ status: 'Partial', balance: 25000 })
    const final = await financialService.recordPayment({ challanId: challan.id, amount: 25000, method: 'Bank Transfer' }, query)
    expect(first.receiptReference).not.toBe(final.receiptReference)
    expect((await financialService.financeOverview(query)).payments.filter(item => item.challanId === challan.id)).toHaveLength(2)
    const deleted = await admissionService.delete(admission.id, query)
    expect(deleted).toMatchObject({ deletedEnrollmentIds: [enrollment.id], deletedChallanIds: [challan.id] })
    expect(deleted.deletedPaymentIds).toEqual(expect.arrayContaining([first.id, final.id]))
    const stored = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    expect(stored.admissions.some(item => item.id === admission.id)).toBe(false)
    expect(stored.students.some(item => item.id === admission.studentId)).toBe(false)
    expect(stored.enrollments.some(item => item.id === enrollment.id)).toBe(false)
    expect(stored.challans.some(item => item.id === challan.id)).toBe(false)
    expect(stored.payments.some(item => item.challanId === challan.id)).toBe(false)
  })
})
