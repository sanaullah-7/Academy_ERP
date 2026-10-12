import { beforeEach, describe, expect, it } from 'vitest'
import { authService } from './authService.js'
import { admissionService } from './admissionService.js'
import { facultyService } from './facultyService.js'
import { batchService } from './batchService.js'

const north = { branchId: 'demo-north' }
const central = { branchId: 'demo-central' }
const admissionInput = { studentName: 'DEMO Class Student', guardianName: 'DEMO Guardian', contact: '03001234567', dob: '2010-01-01', course: 'Demo Course Two', courseId: 'course-demo-2' }

beforeEach(() => localStorage.clear())

async function signIn(userId = 'demo-admin', branchId = central.branchId) {
  await authService.login({ userId })
  await authService.selectBranch(userId, branchId)
}

describe('F05 branch-scoped Faculty & Classes reads', () => {
  it('lists only explicit single-role Teacher identities for the selected branch', async () => {
    await signIn()
    expect(await facultyService.list(central)).toEqual([expect.objectContaining({ id: 'demo-teacher', name: 'Demo Teacher', branchId: central.branchId })])
    await authService.selectBranch('demo-admin', north.branchId)
    expect(await facultyService.list(north)).toEqual([expect.objectContaining({ id: 'demo-multi', branchId: north.branchId })])
    await expect(facultyService.getById('demo-teacher', north)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('returns only saved identity data and fails closed for unauthorized roles and changed branch scope', async () => {
    await signIn()
    const profile = await facultyService.getById('demo-teacher', central)
    expect(profile).toMatchObject({ id: 'demo-teacher', name: 'Demo Teacher', contact: null, qualifications: null, assignedSubjects: [], assignedBatches: [], schedules: [] })
    await expect(facultyService.getById('demo-multi', central)).rejects.toMatchObject({ code: 'NOT_FOUND' })
    await authService.login({ userId: 'demo-teacher' })
    await expect(facultyService.list(central)).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', north.branchId)
    await expect(facultyService.list(central)).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
  })

  it('reports missing subject/teacher assignments without manufacturing relationships', async () => {
    await signIn()
    expect(await facultyService.listSubjectAssignments(central)).toEqual({ available: false, assignments: [] })
    const batches = await facultyService.listBatchAssignments(central)
    expect(batches).toHaveLength(1)
    expect(batches[0]).toMatchObject({ id: 'batch-demo-course-demo-2', courseName: 'Demo Course Two', teacherAssignments: [] })
  })

  it('lists only students with a saved Active enrollment linked to the selected batch', async () => {
    await signIn()
    const admission = await admissionService.createWithStudent(admissionInput, central)
    await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, central)
    await admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, central)
    const students = await facultyService.listClassStudents('batch-demo-course-demo-2', central)
    expect(students).toEqual([expect.objectContaining({
      id: admission.studentId,
      name: admissionInput.studentName,
      status: 'Active',
      admissionReference: admission.admissionId,
      branchId: central.branchId,
      batchId: 'batch-demo-course-demo-2',
    })])
  })

  it('rejects invalid and foreign batch references without returning unrelated branch data', async () => {
    await signIn()
    await expect(facultyService.listClassStudents('', central)).rejects.toMatchObject({ code: 'INVALID_REQUEST' })
    await expect(facultyService.listClassStudents('batch-demo-course-demo-1', central)).rejects.toMatchObject({ code: 'NOT_FOUND' })
    await authService.selectBranch('demo-admin', north.branchId)
    await expect(batchService.getById('batch-demo-course-demo-2', north)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
