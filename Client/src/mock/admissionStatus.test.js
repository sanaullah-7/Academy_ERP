import { describe, expect, it, vi } from 'vitest'
import { admissionService } from '../services/admissionService.js'
import { authService } from '../services/authService.js'
import { MOCK_DATABASE_KEY } from '../constants/storageKeys.js'
import { createMockDatabase } from './mockDatabase.js'

const central = { branchId: 'demo-central' }
const input = { studentName: 'DEMO Status Student', guardianName: 'Guardian', contact: '000', dob: '2010-01-01', course: 'Demo Course Two', courseId: 'course-demo-2' }
const saved = () => JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))

async function setupAdmin() {
  const admission = createMockDatabase().createAdmission(input, central)
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', central.branchId)
  return admission
}

describe('confirmed Super Admin admission status policy', () => {
  it('atomically approves an admission, records history and leaves the student Provisional', async () => {
    const admission = await setupAdmin()
    const result = await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, central)
    const data = saved(); const stored = data.admissions.find(item => item.id === admission.id)
    expect(result.status).toBe('Approved')
    expect(stored.statusHistory).toHaveLength(1)
    expect(stored.statusHistory[0]).toMatchObject({ admissionId: admission.id, branchId: central.branchId, fromStatus: 'Pending', toStatus: 'Approved', actorUserId: 'demo-admin', reason: '' })
    expect(data.students.find(item => item.id === admission.studentId).status).toBe('Provisional')
  })

  it('treats a repeated same-status request as idempotent without duplicate history or writes', async () => {
    const admission = await setupAdmin()
    await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, central)
    const bytes = localStorage.getItem(MOCK_DATABASE_KEY)
    const repeated = await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Approved' }, central)
    expect(repeated.statusHistory).toHaveLength(1)
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(bytes)
  })

  it('blocks stale/rejected transitions but allows Approved to return to Pending', async () => {
    const admission = await setupAdmin()
    await expect(admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Approved' }, central)).rejects.toMatchObject({ code: 'STALE_STATUS' })
    await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, central)
    const reversed = await admissionService.changeStatus(admission.id, { status: 'Pending', expectedStatus: 'Approved' }, central)
    expect(reversed.status).toBe('Pending')
    expect(reversed.statusHistory).toHaveLength(2)
    expect(reversed.statusHistory[1]).toMatchObject({ fromStatus: 'Approved', toStatus: 'Pending' })
    const bytes = localStorage.getItem(MOCK_DATABASE_KEY)
    await expect(admissionService.changeStatus(admission.id, { status: 'Rejected', expectedStatus: 'Pending' }, central)).rejects.toMatchObject({ code: 'INVALID_TRANSITION' })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(bytes)
  })

  it('migrates saved Rejected admissions to Pending and clears their history', async () => {
    const admission = createMockDatabase().createAdmission(input, central)
    const data = saved()
    const savedAdmission = data.admissions.find(item => item.id === admission.id)
    savedAdmission.status = 'Rejected'
    savedAdmission.statusHistory = [{ id: 'legacy-reject-event', admissionId: admission.id, branchId: central.branchId, fromStatus: 'Pending', toStatus: 'Rejected', actorUserId: 'demo-admin', occurredAt: new Date().toISOString(), reason: 'Old reason' }]
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    await authService.login({ userId: 'demo-admin' }); await authService.selectBranch('demo-admin', central.branchId)
    const records = await admissionService.list(central)
    expect(records.find(item => item.id === admission.id).status).toBe('Pending')
    const migrated = saved().admissions.find(item => item.id === admission.id)
    expect(migrated.status).toBe('Pending')
    expect(migrated).not.toHaveProperty('statusHistory')
  })

  it.each(['demo-owner', 'demo-teacher'])('denies decision authority to %s without mutation', async userId => {
    const branchId = userId === 'demo-reception' ? 'demo-north' : 'demo-central'
    const courseId = branchId === 'demo-north' ? 'course-demo-1' : 'course-demo-2'
    const admission = createMockDatabase().createAdmission({ ...input, courseId }, { branchId })
    await authService.login({ userId })
    const bytes = localStorage.getItem(MOCK_DATABASE_KEY)
    await expect(admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, { branchId })).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(bytes)
  })

  it('denies unresolved multi-role membership and dashboard preview cannot grant authority', async () => {
    const admission = createMockDatabase().createAdmission(input, central)
    await authService.login({ userId: 'demo-multi' }); await authService.selectBranch('demo-multi', central.branchId)
    await expect(admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, central)).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
  })

  it('rejects unsafe linked records and preserves saved bytes', async () => {
    const admission = await setupAdmin(); const data = saved()
    data.students.find(item => item.id === admission.studentId).status = 'Active'
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data)); const bytes = localStorage.getItem(MOCK_DATABASE_KEY)
    await expect(admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, central)).rejects.toMatchObject({ code: 'UNSAFE_LINK' })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(bytes)
  })

  it('rolls back a failed write and permits one clean retry', async () => {
    const admission = await setupAdmin(); const bytes = localStorage.getItem(MOCK_DATABASE_KEY)
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('Full') })
    await expect(admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, central)).rejects.toMatchObject({ code: 'STORAGE_WRITE_FAILED' })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(bytes)
    spy.mockRestore()
    await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, central)
    expect(saved().admissions.find(item => item.id === admission.id).statusHistory).toHaveLength(1)
  })

  it('denies a foreign active branch and logout', async () => {
    const admission = await setupAdmin()
    await authService.selectBranch('demo-admin', 'demo-north')
    await expect(admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, central)).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
    await authService.logout()
    await expect(admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, central)).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
  })
})
