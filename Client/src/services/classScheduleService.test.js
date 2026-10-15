import { beforeEach, describe, expect, it } from 'vitest'
import { authService } from './authService.js'
import { classScheduleService } from './classScheduleService.js'

const central = { branchId: 'demo-central' }
const record = { subject: 'Biology', batchId: 'batch-demo-course-demo-2', teacherId: 'demo-teacher', classDate: '2026-10-13', startTime: '16:00', endTime: '17:30', location: 'Lecture Hall 2' }
beforeEach(async () => { localStorage.clear(); await authService.login({ userId: 'demo-admin' }); await authService.selectBranch('demo-admin', central.branchId) })

describe('class schedule service', () => {
  it('creates, persists, updates and deletes a branch class', async () => {
    const created = await classScheduleService.create(record, central)
    expect(await classScheduleService.list(central)).toEqual([expect.objectContaining({ id: created.id, subject: 'Biology', teacherName: 'Demo Teacher', enrolledCount: 0 })])
    expect(await classScheduleService.update(created.id, { ...record, subject: 'Chemistry' }, central)).toMatchObject({ subject: 'Chemistry' })
    await classScheduleService.delete(created.id, central)
    expect(await classScheduleService.list(central)).toEqual([])
  })
  it('rejects overlapping teacher, batch or location and foreign references', async () => {
    await classScheduleService.create(record, central)
    await expect(classScheduleService.create({ ...record, subject: 'Physics', startTime: '17:00', endTime: '18:00' }, central)).rejects.toMatchObject({ code: 'SCHEDULE_CONFLICT' })
    await expect(classScheduleService.create({ ...record, batchId: 'batch-demo-course-demo-1' }, central)).rejects.toMatchObject({ code: 'INVALID_REFERENCE' })
  })
  it('allows Owner view but denies writes and denies Teacher access', async () => {
    await classScheduleService.create(record, central)
    await authService.login({ userId: 'demo-owner' })
    expect(await classScheduleService.list(central)).toHaveLength(1)
    await expect(classScheduleService.create(record, central)).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    await authService.login({ userId: 'demo-teacher' })
    await expect(classScheduleService.list(central)).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
  })
})
