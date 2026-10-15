import { describe, expect, it, vi } from 'vitest'
import { createMockDatabase } from './mockDatabase.js'
import { createSeedDatabase } from './seedData.js'
import { MOCK_DATABASE_KEY } from '../constants/storageKeys.js'
import { authService } from '../services/authService.js'
import { courseService } from '../services/courseService.js'
import { batchService } from '../services/batchService.js'

const query = { branchId: 'demo-north' }
const input = { studentName: 'DEMO Applicant', guardianName: 'DEMO Guardian', contact: '0000000000', dob: '2010-01-01', course: 'Old label', courseId: 'course-demo-1' }
const batchId = 'batch-demo-course-demo-1'
const saved = () => JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
describe('F02-004 reference contracts and additive upgrade', () => {
  it('does not permit changing a legacy course name without a saved reference', () => {
    const db = createMockDatabase(); const legacy = createSeedDatabase().admissions[0]
    expect(() => db.updateAdmission(legacy.id, { studentName: legacy.studentName, guardianName: legacy.guardianName, contact: legacy.contact, dob: legacy.dob, course: 'Guessed course' }, { branchId: legacy.branchId })).toThrow(expect.objectContaining({ code: 'INVALID_REFERENCE' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
  })
  it('preserves corrupt batch storage and counter state on failure', () => {
    const db = createMockDatabase(); db.run('courses', 'list', { query })
    const data = saved(); data.batches[0].name = null
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data)); const bytes = localStorage.getItem(MOCK_DATABASE_KEY)
    expect(() => db.createAdmission(input, query)).toThrow(expect.objectContaining({ code: 'INVALID_RECORD' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(bytes)
  })
  it('saves valid IDs and canonical course text atomically with the linked student', () => {
    const a = createMockDatabase().createAdmission({ ...input, preferredBatchId: batchId }, query)
    expect(saved().version).toBe(8)
    expect(saved().admissions.find(x => x.id === a.id)).toMatchObject({ courseId: input.courseId, preferredBatchId: batchId, course: 'Demo Course One', studentId: a.studentId })
    expect(createMockDatabase().getAdmission(a.id, query)).toMatchObject({ courseLabel: 'Demo Course One', batchLabel: 'DEMO Batch - Demo Course One' })
  })
  it('accepts no batch and retains references through edit and refresh', () => {
    const db = createMockDatabase()
    const a = db.createAdmission({ ...input, preferredBatchId: null }, query)
    db.updateAdmission(a.id, { ...input, preferredBatchId: batchId, studentName: 'Edited DEMO' }, query)
    const fresh = createMockDatabase().getAdmission(a.id, query)
    expect(fresh).toMatchObject({ courseId: input.courseId, preferredBatchId: batchId, student: { name: 'Edited DEMO', admissionId: a.id } })
  })
  it.each([
    { courseId: null }, { courseId: 'missing' }, { courseId: 'course-demo-2' },
    { preferredBatchId: 'missing' }, { preferredBatchId: 'batch-demo-course-demo-2' },
  ])('rejects invalid or foreign create references %j without writing', patch => {
    const db = createMockDatabase(); db.run('courses', 'list', { query })
    const bytes = localStorage.getItem(MOCK_DATABASE_KEY)
    expect(() => db.createAdmission({ ...input, ...patch }, query)).toThrow(expect.objectContaining({ code: 'INVALID_REFERENCE' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(bytes)
  })
  it('rejects a same-branch batch belonging to another course and rolls back linked updates', () => {
    const data = createSeedDatabase()
    data.courses.push({ id: 'other-course', branchId: query.branchId, name: 'Other DEMO' })
    data.batches.push({ id: 'other-batch', branchId: query.branchId, courseId: 'other-course', name: 'Other batch' })
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    const db = createMockDatabase(); const a = db.createAdmission(input, query)
    const bytes = localStorage.getItem(MOCK_DATABASE_KEY)
    expect(() => db.updateAdmission(a.id, { ...input, studentName: 'Unsaved', preferredBatchId: 'other-batch' }, query)).toThrow(expect.objectContaining({ code: 'INVALID_REFERENCE' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(bytes)
  })
  it.each([1, 2])('upgrades version %s additively without inferring legacy course IDs', version => {
    const data = createSeedDatabase(); data.version = version; delete data.batches
    data.admissions[0].course = 'Unmatched legacy'; data.students[0].status = 'Active'
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    createMockDatabase().run('courses', 'list', { query })
    expect(saved().version).toBe(8)
    expect(saved().admissions[0]).toMatchObject({ id: data.admissions[0].id, course: 'Unmatched legacy' })
    expect(saved().admissions[0].courseId).toBeUndefined()
    expect(saved().students[0]).toMatchObject(data.students[0])
    const bytes = localStorage.getItem(MOCK_DATABASE_KEY)
    createMockDatabase().run('batches', 'list', { query })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(bytes)
  })
  it('preserves valid saved empty batches without reseeding', () => {
    const data = createSeedDatabase(); data.batches = []
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    expect(createMockDatabase().run('batches', 'list', { query })).toEqual([])
    expect(saved().batches).toEqual([])
  })
  it('preserves unchanged unresolved references and exposes explicit labels', () => {
    const db = createMockDatabase(); const a = db.createAdmission({ ...input, preferredBatchId: batchId }, query)
    const data = saved(); data.courses = data.courses.filter(x => x.id !== input.courseId); data.batches = []
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    const edited = db.updateAdmission(a.id, { ...input, course: a.course, preferredBatchId: batchId, notes: 'Legacy edit' }, query)
    expect(edited.courseId).toBe(a.courseId)
    expect(db.getAdmission(a.id, query)).toMatchObject({ courseLabel: `Unresolved course: ${a.course}`, batchLabel: `Unresolved batch: ${batchId}` })
  })
  it('retains unreferenced legacy text on unrelated edit without guessing duplicate names', () => {
    const data = createSeedDatabase(); const original = data.admissions[0]
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    const edited = createMockDatabase().updateAdmission(original.id, { studentName: original.studentName, guardianName: original.guardianName, dob: original.dob, contact: original.contact, course: original.course, notes: 'Retained' }, { branchId: original.branchId })
    expect(edited.course).toBe(original.course)
    expect(edited.courseId).toBeUndefined()
  })
  it('preserves original version-2 bytes when migration write fails', () => {
    const data = createSeedDatabase(); data.version = 2; delete data.batches
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data)); const bytes = localStorage.getItem(MOCK_DATABASE_KEY)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('Unavailable') })
    expect(() => createMockDatabase().run('batches', 'list', { query })).toThrow(expect.objectContaining({ code: 'STORAGE_WRITE_FAILED' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(bytes)
  })
  it('rejects seed ID collisions without altering saved data', () => {
    const data = createSeedDatabase(); data.version = 2; delete data.batches; data.students[0].id = batchId
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data)); const bytes = localStorage.getItem(MOCK_DATABASE_KEY)
    expect(() => createMockDatabase().run('batches', 'list', { query })).toThrow(expect.objectContaining({ code: 'ID_CONFLICT' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(bytes)
  })
  it('scopes reference reads to the current session and selected course', async () => {
    await expect(courseService.list(query)).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
    await authService.login({ userId: 'demo-reception' })
    expect(await courseService.list(query)).toHaveLength(1)
    expect(await batchService.list({ ...query, courseId: input.courseId })).toHaveLength(1)
    expect(await batchService.list({ ...query, courseId: 'missing' })).toEqual([])
    await expect(batchService.list({ branchId: 'demo-central' })).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
    await authService.logout(); await expect(batchService.list(query)).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
  })
})
