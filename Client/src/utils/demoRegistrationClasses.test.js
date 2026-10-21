import { describe, expect, it } from 'vitest'
import { demoRegistrationClasses } from './demoRegistrationClasses.js'

const batch = { id: 'batch-a', courseId: 'course-a', branchId: 'branch-a', active: true }
const assignment = { id: 'assignment-a', branchId: 'branch-a', courseId: 'course-a', batchId: 'batch-a', subjectName: 'Biology', teacherId: 'teacher-a', teacherName: 'Saved Teacher', days: ['Monday', 'Wednesday'], startTime: '08:00', endTime: '09:00', room: 'Lab 2' }
const query = { assignments: [assignment], batches: [batch], branchId: 'branch-a', courseId: 'course-a', batchId: 'batch-a', fromDate: '2027-04-06' }

describe('saved demo registration class timings', () => {
  it('projects the next matching saved weekday with actual teacher and room', () => {
    expect(demoRegistrationClasses(query)).toEqual([expect.objectContaining({ subject: 'Biology', teacherName: 'Saved Teacher', room: 'Lab 2', nextDate: '2027-04-07', days: 'Mon, Wed' })])
  })
  it.each(['branchId', 'courseId', 'batchId'])('never exposes another %s', key => {
    expect(demoRegistrationClasses({ ...query, assignments: [{ ...assignment, [key]: 'other' }] })).toEqual([])
  })
  it('requires the selected batch to belong to the active branch and course', () => {
    expect(demoRegistrationClasses({ ...query, batches: [{ ...batch, courseId: 'other' }] })).toEqual([])
    expect(demoRegistrationClasses({ ...query, batches: [{ ...batch, active: false }] })).toEqual([])
  })
  it('includes dated classes and excludes older or cancelled occurrences', () => {
    const dated = { ...assignment, id: 'dated', subject: 'Chemistry', subjectName: undefined, classDate: '2027-04-08', location: 'Hall 3', room: undefined }
    const result = demoRegistrationClasses({ ...query, sessions: [dated, { ...dated, id: 'old', classDate: '2027-04-01' }, { ...dated, id: 'cancelled', status: 'Cancelled' }] })
    expect(result).toHaveLength(2)
    expect(result[1]).toMatchObject({ source: 'dated', subject: 'Chemistry', room: 'Hall 3', nextDate: '2027-04-08' })
  })
  it('prefers a saved dated occurrence when it duplicates a recurring slot', () => {
    const sessions = [{ ...assignment, id: 'dated', subject: 'Biology', classDate: '2027-04-07' }]
    expect(demoRegistrationClasses({ ...query, sessions })).toEqual([expect.objectContaining({ key: 'dated:dated', source: 'dated' })])
  })
  it('rejects invalid dates, invalid times and unspecified weekdays without fabricating classes', () => {
    expect(demoRegistrationClasses({ ...query, fromDate: '2027-02-31' })).toEqual([])
    expect(demoRegistrationClasses({ ...query, assignments: [{ ...assignment, startTime: '28:00' }] })).toEqual([])
    expect(demoRegistrationClasses({ ...query, assignments: [{ ...assignment, days: [] }] })).toEqual([])
  })
  it('handles short weekdays and calendar rollover independently of host timezone', () => {
    const result = demoRegistrationClasses({ ...query, fromDate: '2026-12-31', assignments: [{ ...assignment, days: ['Mon'] }] })
    expect(result[0].nextDate).toBe('2027-01-04')
  })
})
