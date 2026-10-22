import { beforeEach, describe, expect, it } from 'vitest'
import { MOCK_NOTIFICATIONS_KEY } from '../constants/storageKeys.js'
import { ROLES } from '../constants/roles.js'
import { authService } from './authService.js'
import { notificationService } from './notificationService.js'
import { organizationService } from './organizationService.js'

async function login(userId, branchId) {
  await authService.logout()
  const session = await authService.login({ userId })
  if (session.branchId !== branchId) await authService.selectBranch(userId, branchId)
}

describe('notificationService', () => {
  beforeEach(() => localStorage.clear())

  it('routes receptionist activity to branch admins and excludes owners and other branches', async () => {
    await login('demo-admin', 'demo-north')
    const admin = await organizationService.saveUser({ name: 'North Admin', login: 'north-admin@example.test', enabled: true, assignments: [{ branchId: 'demo-north', roles: [ROLES.ADMIN] }] })
    await login('demo-reception', 'demo-north')
    const created = await notificationService.publish({ type: 'student_added', branchId: 'demo-north', entityId: 'student-1', title: 'New student', message: 'Student was added.' })
    expect(created.map(item => item.recipientUserId).sort()).toEqual(['demo-admin', admin.id].sort())
    await login('demo-admin', 'demo-central')
    expect(await notificationService.list({ branchId: 'demo-central' })).toEqual([])
    await login('demo-owner', 'demo-central')
    expect(await notificationService.list({ branchId: 'demo-central' })).toEqual([])
  })

  it('routes admin activity to receptionists in the same branch only', async () => {
    await login('demo-admin', 'demo-north')
    await notificationService.publish({ type: 'challan_created', branchId: 'demo-north', entityId: 'challan-1', title: 'Challan issued', message: 'A challan was issued.' })
    await login('demo-reception', 'demo-north')
    const items = await notificationService.list({ branchId: 'demo-north' })
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ type: 'challan_created', readAt: null })
    await notificationService.markAllRead({ branchId: 'demo-north' })
    expect((await notificationService.list({ branchId: 'demo-north' }))[0].readAt).toBeTruthy()
    expect(await notificationService.remove(items[0].id, { branchId: 'demo-north' })).toBe(true)
    expect(await notificationService.list({ branchId: 'demo-north' })).toEqual([])
  })

  it('notifies only the assigned teacher and deduplicates the same event', async () => {
    await login('demo-admin', 'demo-central')
    const event = { type: 'class_assigned', branchId: 'demo-central', entityId: 'assignment-1', teacherId: 'demo-teacher', title: 'Class assigned', message: 'Biology was assigned.' }
    expect(await notificationService.publish(event)).toHaveLength(1)
    expect(await notificationService.publish(event)).toHaveLength(0)
    await login('demo-teacher', 'demo-central')
    expect(await notificationService.list({ branchId: 'demo-central' })).toHaveLength(1)
    await login('teacher-naeem', 'demo-central')
    expect(await notificationService.list({ branchId: 'demo-central' })).toEqual([])
    expect(JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY)).items).toHaveLength(1)
  })
})
