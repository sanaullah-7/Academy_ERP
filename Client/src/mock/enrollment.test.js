import { beforeEach, describe, expect, it, vi } from 'vitest'
import { admissionService } from '../services/admissionService.js'
import { authService } from '../services/authService.js'
import { studentService } from '../services/studentService.js'
import { feeService } from '../services/feeService.js'
import { MOCK_DATABASE_KEY } from '../constants/storageKeys.js'
import { createMockDatabase } from './mockDatabase.js'

const branch = { branchId: 'demo-central' }
const input = { studentName: 'DEMO Enrollment Student', guardianName: 'Guardian', contact: '000', dob: '2010-01-01', course: 'Demo Course Two', courseId: 'course-demo-2' }
const saved = () => JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))

beforeEach(() => localStorage.clear())

async function setupApproved(options = {}) {
  const admission = createMockDatabase().createAdmission({ ...input, ...options }, branch)
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', branch.branchId)
  await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, branch)
  return admission
}

describe('F02-006 mock enrollment', () => {
  it('atomically creates the minimum enrollment record, activates the linked student, and survives reload', async () => {
    const admission = await setupApproved()
    const write = vi.spyOn(Storage.prototype, 'setItem')
    const result = await admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, branch)
    expect(write).toHaveBeenCalledTimes(1)
    write.mockRestore()

    const data = saved()
    expect(Object.keys(data.enrollments[0]).sort()).toEqual(['admissionId', 'batchId', 'branchId', 'courseId', 'enrolledAt', 'feeStatus', 'id', 'status', 'studentId'].sort())
    expect(result.enrollment).toMatchObject({ branchId: branch.branchId, admissionId: admission.id, studentId: admission.studentId, courseId: input.courseId, batchId: 'batch-demo-course-demo-2', status: 'Active' })
    expect(data.admissions.find(item => item.id === admission.id).status).toBe('Approved')
    expect(data.students.find(item => item.id === admission.studentId).status).toBe('Active')
    expect(createMockDatabase().run('students', 'getById', { id: admission.studentId, query: branch }).status).toBe('Active')
  })

  it('persists Super Admin fee status changes and denies other roles and branches', async () => {
    const admission = await setupApproved()
    const { enrollment } = await admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, branch)
    await expect(feeService.updateEnrollmentStatus(enrollment.id, { feeStatus: 'Paid' }, branch)).resolves.toMatchObject({ feeStatus: 'Paid' })
    expect(saved().enrollments[0].feeStatus).toBe('Paid')
    const students = await studentService.listDirectory(branch)
    expect(students.find(student => student.id === admission.studentId).enrollments[0].feeStatus).toBe('Paid')
    await authService.login({ userId: 'demo-owner' })
    await expect(feeService.updateEnrollmentStatus(enrollment.id, { feeStatus: 'Partial' }, branch)).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    expect(saved().enrollments[0].feeStatus).toBe('Paid')
  })

  it('blocks repeat enrollment, admission edit and Approved-to-Pending, then atomically deletes the verified enrolled student for Super Admin', async () => {
    const admission = await setupApproved()
    await admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, branch)
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    await expect(admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, branch)).rejects.toMatchObject({ code: 'DUPLICATE_ENROLLMENT' })
    await expect(admissionService.update(admission.id, input, branch)).rejects.toMatchObject({ code: 'ENROLLED_RECORD_PROTECTED' })
    await expect(studentService.update(admission.studentId, { name: 'DEMO edited', status: 'Provisional' }, branch)).rejects.toMatchObject({ code: 'INVALID_RECORD' })
    await expect(admissionService.changeStatus(admission.id, { status: 'Pending', expectedStatus: 'Approved' }, branch)).rejects.toMatchObject({ code: 'ENROLLED_RECORD_PROTECTED' })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
    const deleted = await admissionService.delete(admission.id, branch)
    expect(deleted).toMatchObject({ id: admission.id, deletedStudentId: admission.studentId })
    expect(deleted.deletedEnrollmentIds).toHaveLength(1)
    const after = saved()
    expect(after.admissions.some(item => item.id === admission.id)).toBe(false)
    expect(after.students.some(item => item.id === admission.studentId)).toBe(false)
    expect(after.enrollments.some(item => item.admissionId === admission.id)).toBe(false)
  })

  it('rejects unauthorized users, foreign branch sessions, and a batch from another course without writes', async () => {
    const admission = await setupApproved()
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    await authService.login({ userId: 'demo-owner' })
    await expect(admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, branch)).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    expect(() => createMockDatabase().enrollStudent(admission.id, { batchId: 'batch-demo-course-demo-2' }, branch)).toThrow(expect.objectContaining({ code: 'DEMO_ACTION_DENIED' }))
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-north')
    await expect(admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, branch)).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
    await authService.selectBranch('demo-admin', branch.branchId)
    await expect(admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-1' }, branch)).rejects.toMatchObject({ code: 'INVALID_REFERENCE' })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
  })

  it('preserves the old database bytes when the atomic write fails and allows retry', async () => {
    const admission = await setupApproved()
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Full') })
    await expect(admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, branch)).rejects.toMatchObject({ code: 'STORAGE_WRITE_FAILED' })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
    write.mockRestore()
    await admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, branch)
    expect(saved().enrollments).toHaveLength(1)
  })

  it('migrates version 3 storage without changing saved IDs, counters, or records', async () => {
    const admission = await setupApproved()
    const legacy = saved()
    const admissionId = legacy.admissions.find(item => item.id === admission.id).admissionId
    const counters = structuredClone(legacy.branchCounters)
    delete legacy.enrollments
    legacy.version = 3
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(legacy))

    createMockDatabase().run('admissions', 'getById', { id: admission.id, query: branch })
    const migrated = saved()
    expect(migrated.version).toBe(8)
    expect(migrated.classes).toEqual([])
    expect(migrated.enrollments).toEqual([])
    expect(migrated.challans).toEqual([])
    expect(migrated.payments).toEqual([])
    expect(migrated.expenses).toEqual([])
    expect(migrated.admissions.find(item => item.id === admission.id).admissionId).toBe(admissionId)
    expect(migrated.branchCounters).toEqual(counters)
  })

  it('refuses unresolved linked student records without modifying saved data', async () => {
    const admission = await setupApproved()
    const corrupted = saved()
    corrupted.admissions.find(item => item.id === admission.id).studentId = 'missing-student'
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(corrupted))
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    await expect(admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, branch)).rejects.toMatchObject({ code: 'INVALID_LINK' })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
  })

  it('allows explicit selection of a valid batch when the saved preferred batch is unresolved', async () => {
    const admission = await setupApproved({ preferredBatchId: 'batch-demo-course-demo-2' })
    const corrupted = saved()
    corrupted.admissions.find(item => item.id === admission.id).preferredBatchId = 'missing-batch'
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(corrupted))
    const result = await admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, branch)
    expect(result.enrollment.batchId).toBe('batch-demo-course-demo-2')
    expect(saved().students.find(item => item.id === admission.studentId).status).toBe('Active')
  })
})
