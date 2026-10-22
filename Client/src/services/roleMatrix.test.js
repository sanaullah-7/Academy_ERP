import { beforeEach, expect, it } from 'vitest'
import { authService } from './authService.js'
import { organizationService } from './organizationService.js'
import { admissionService } from './admissionService.js'
import { reportService } from './reportService.js'
import { auditService } from './auditService.js'
import { assetService } from './assetService.js'
import { payrollService } from './payrollService.js'
import { academicService } from './academicService.js'
import { facultyService } from './facultyService.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
import { MOCK_DATABASE_KEY } from '../constants/storageKeys.js'
import { readOrganization, writeOrganization } from '../mock/mockOrganization.js'

const query = { branchId: 'demo-north' }
beforeEach(() => localStorage.clear())
async function login(id, branchId = 'demo-north') {
  await authService.login({ userId: id })
  await authService.selectBranch(id, branchId)
}

it('allows Receptionist create, edit, approve, enroll and delete without granting finance or administration', async () => {
  await login('demo-reception')
  const input = { studentName: 'QA Matrix Applicant', guardianName: 'QA Guardian', contact: '03000000000', dob: '2010-01-01', course: 'Demo Course One', courseId: 'course-demo-1' }
  const admission = await admissionService.create(input, query)
  await admissionService.update(admission.id, { ...input, studentName: 'QA Updated Applicant' }, query)
  await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, query)
  await admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-1' }, query)
  const data = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
  expect(data.students.find(student => student.id === admission.studentId).status).toBe('Active')
  expect(data.admissions.find(item => item.id === admission.id).statusHistory.at(-1).actorUserId).toBe('demo-reception')
  const session = await authService.getSession()
  expect(canAccess(PERMISSIONS.ADMISSIONS_DELETE, session.user, query.branchId)).toBe(true)
  expect(canAccess(PERMISSIONS.FEES_MANAGE, session.user, query.branchId)).toBe(true)
  for (const permission of [PERMISSIONS.FINANCE_VIEW, PERMISSIONS.EXPENSES_MANAGE, PERMISSIONS.AUDIT_VIEW, PERMISSIONS.USERS_MANAGE, PERMISSIONS.BRANCHES_MANAGE, PERMISSIONS.SETTINGS_MANAGE]) expect(canAccess(permission, session.user, query.branchId)).toBe(false)
  await expect(payrollService.getRunningOverview(query)).rejects.toThrow()
})

it.each([['demo-reception', 'demo-north'], ['demo-owner', 'demo-central'], ['demo-teacher', 'demo-central']])('denies restricted service calls for %s', async (id, branchId) => {
  await login(id, branchId)
  await expect(auditService.list({ branchId })).rejects.toThrow()
  await expect(organizationService.overview()).rejects.toThrow()
  await expect(organizationService.staffOverview()).rejects.toThrow()
  await expect(organizationService.saveSettings({ academyName: 'Forbidden' })).rejects.toThrow()
})

it('limits receptionist reports and assets while allowing Owner readonly reports/assets', async () => {
  await login('demo-reception')
  const reports = await reportService.overview(query)
  expect(reports.expenses).toEqual([])
  await expect(reportService.overview({ ...query, allBranches: true })).rejects.toThrow()
  const asset = await assetService.create({ name: 'QA Chair', assetCode: 'QA-MATRIX-01', category: 'Furniture', purchaseCost: 500, quantity: 1 }, query)
  await expect(assetService.update(asset.id, { ...asset, name: 'QA Updated Chair' }, query)).resolves.toMatchObject({ name: 'QA Updated Chair' })
  await expect(assetService.assign(asset.id, { assignedToId: 'demo-reception' }, query)).rejects.toThrow()
  await login('demo-owner', 'demo-central')
  await expect(reportService.overview({ branchId: 'demo-central' })).resolves.toHaveProperty('expenses')
  await expect(assetService.list({ branchId: 'demo-central' })).resolves.toEqual([])
  await expect(assetService.create({ name: 'Forbidden' }, { branchId: 'demo-central' })).rejects.toThrow()
})

it('prevents Admin modifying higher-role identities and confines full access to assigned branches', async () => {
  await login('demo-admin')
  const make = (role, suffix) => organizationService.saveUser({ name: `QA ${suffix}`, login: `${suffix}@example.test`, assignments: [{ branchId: query.branchId, roles: [role] }] })
  const admin = await make('admin', 'matrix-admin')
  const higher = await make('super_admin', 'matrix-super')
  await login(admin.id)
  const session = await authService.getSession()
  for (const permission of Object.values(PERMISSIONS)) {
    expect(canAccess(permission, session.user, query.branchId)).toBe(true)
    expect(canAccess(permission, session.user, 'demo-central')).toBe(false)
  }
  await expect(auditService.list(query)).resolves.toBeInstanceOf(Array)
  await expect(organizationService.saveSettings({ academyName: 'QA Matrix Academy' })).resolves.toHaveProperty('academyName', 'QA Matrix Academy')
  await expect(organizationService.toggleUser(higher.id)).rejects.toThrow('Admin cannot')
  await expect(organizationService.deleteUser(higher.id)).rejects.toThrow('Admin cannot')
  await expect(organizationService.saveUser({ ...higher, assignments: [{ branchId: query.branchId, roles: ['teacher'] }] }, higher.id)).rejects.toThrow('Admin cannot')
  await expect(make('super_admin', 'escalation')).rejects.toThrow()
  await expect(authService.selectBranch(admin.id, 'demo-central')).rejects.toThrow()
})

it('allows Receptionist to edit an existing class without creating or deleting assignments', async () => {
  await login('demo-admin')
  const subject = await academicService.saveSubject(null, { name: 'QA Matrix Biology', courseId: 'course-demo-1', active: true }, query)
  const record = { teacherId: 'teacher-naeem', courseId: 'course-demo-1', batchId: 'batch-demo-course-demo-1', subjectId: subject.id, days: ['Mon'], startTime: '10:00', endTime: '11:00', room: 'QA Matrix Room' }
  const assignment = await facultyService.assignFaculty(record, query)
  await login('demo-reception')
  await expect(facultyService.updateAssignment(assignment.id, { ...record, room: 'QA Updated Room' }, query)).resolves.toMatchObject({ room: 'QA Updated Room' })
  await expect(facultyService.assignFaculty(record, query)).rejects.toThrow()
  await expect(facultyService.removeAssignment(assignment.id, query)).rejects.toThrow()
})

it('rechecks per-branch roles in report comparisons and after branch switching', async () => {
  await login('demo-admin')
  const user = await organizationService.saveUser({ name: 'QA Mixed Role', login: 'matrix-mixed@example.test', assignments: [{ branchId: query.branchId, roles: ['admin'] }] })
  const store = readOrganization()
  store.users.find(item => item.id === user.id).assignments.push({ branchId: 'demo-central', roles: ['teacher'] })
  writeOrganization(store)
  await login(user.id)
  expect((await reportService.overview({ ...query, allBranches: true })).branchIds).toEqual(['demo-north'])
  await authService.selectBranch(user.id, 'demo-central')
  await expect(organizationService.staffOverview()).rejects.toThrow()
  await expect(auditService.list({ branchId: 'demo-central' })).rejects.toThrow()
  await expect(reportService.overview({ branchId: 'demo-central' })).rejects.toThrow()
})
