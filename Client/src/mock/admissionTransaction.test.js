import { describe, expect, it, vi } from 'vitest'
import { createMockDatabase } from './mockDatabase.js'
import { createMockApi } from './mockApi.js'
import { createSeedDatabase } from './seedData.js'
import { MOCK_DATABASE_KEY } from '../constants/storageKeys.js'
import { admissionService } from '../services/admissionService.js'
import { authService } from '../services/authService.js'

const north = { branchId: 'demo-north' }
const central = { branchId: 'demo-central' }
const input = { studentName: 'DEMO Applicant', guardianName: 'DEMO Guardian', contact: '0000000000', dob: '2010-01-01', course: 'Computer Science', courseId: 'course-demo-1' }
const saved = () => JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))

describe('atomic admission/student sequence and compatibility', () => {
  it('creates one Pending admission and Provisional student with immutable separate internal/display IDs', () => {
    const db = createMockDatabase()
    const admission = db.createAdmission(input, north)
    expect(admission).toMatchObject({ admissionId: 'ADM-4', admissionNumber: 4, status: 'Pending' })
    expect(admission.id).not.toBe(admission.admissionId)
    expect(admission.student.id).not.toBe(admission.id)
    expect(admission.student).toMatchObject({ status: 'Provisional', branchId: north.branchId, admissionId: admission.id, admissionDisplayId: 'ADM-4' })
    expect(admission.studentId).toBe(admission.student.id)
    expect(saved().branchCounters[north.branchId].admission).toBe(4)
    expect(db.run('admissions', 'list', { query: north })).toHaveLength(2)
    expect(db.run('admissions', 'list', { query: central })).toHaveLength(2)
  })
  it('initializes from legacy formatted IDs and increments independently across branches/reload', () => {
    const data = createSeedDatabase()
    data.admissions[0].id = 'ADM-1,242'
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    const a = createMockDatabase().createAdmission(input, north)
    const b = createMockDatabase().createAdmission({ ...input, courseId: 'course-demo-2' }, central)
    expect([a.admissionId, b.admissionId]).toEqual(['ADM-4', 'ADM-1,243'])
    expect(createMockDatabase().run('admissions', 'getById', { id: a.id, query: north }).admissionId).toBe('ADM-4')
    expect(saved().branchCounters[central.branchId].admission).toBe(1243)
  })
  it('never reuses removed record numbers when the durable high-water counter remains', () => {
    const first = createMockDatabase().createAdmission(input, north)
    const data = saved()
    data.admissions = data.admissions.filter((a) => a.id !== first.id)
    data.students = data.students.filter((s) => s.id !== first.studentId)
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    expect(createMockDatabase().createAdmission(input, north).admissionId).toBe('ADM-5')
  })
  it('preserves valid v1 records and existing admissions instead of overwriting them with seeds', () => {
    const data = createSeedDatabase()
    data.version = 1
    data.students.push({ id: 'legacy-custom', branchId: north.branchId, name: 'Saved legacy student' })
    data.admissions[0].studentName = 'Saved legacy applicant'
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    createMockDatabase().run('students', 'list', { query: north })
    expect(saved().students.find((s) => s.id === 'legacy-custom').name).toBe('Saved legacy student')
    expect(saved().admissions[0].studentName).toBe('Saved legacy applicant')
    expect(saved().version).toBe(4)
  })
  it('migrates an opaque legacy admission/student pair without changing internal IDs or optional statuses', () => {
    const data = createSeedDatabase()
    data.admissions[0].id = 'old-uuid-admission'
    data.students.push({ id: 'old-student', branchId: central.branchId, name: 'Legacy', status: 'Provisional', admissionId: 'old-uuid-admission' })
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    createMockDatabase().run('admissions', 'list', { query: central })
    expect(saved().admissions[0]).toMatchObject({ id: 'old-uuid-admission', studentId: 'old-student', admissionId: 'ADM-3' })
    expect(saved().students.at(-1)).toMatchObject({ admissionId: 'old-uuid-admission', admissionDisplayId: 'ADM-3', status: 'Provisional' })
    const raw = localStorage.getItem(MOCK_DATABASE_KEY)
    createMockDatabase().run('admissions', 'list', { query: central })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(raw)
  })
  it('rolls back both records and sequence on student ID collision', () => {
    createMockDatabase().run('admissions', 'list', { query: north })
    const raw = localStorage.getItem(MOCK_DATABASE_KEY)
    const makeId = vi.fn().mockReturnValueOnce('new-admission').mockReturnValueOnce('student-demo-1')
    expect(() => createMockDatabase({ makeId }).createAdmission(input, north)).toThrow(expect.objectContaining({ code: 'ID_CONFLICT' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(raw)
    expect(createMockDatabase().createAdmission(input, north).admissionId).toBe('ADM-4')
  })
  it('does not seed/migrate or consume a number on failed first commit', () => {
    const makeId = vi.fn().mockReturnValueOnce('same-id').mockReturnValueOnce('same-id')
    expect(() => createMockDatabase({ makeId }).createAdmission(input, north)).toThrow()
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
    const legacy = { version: 1, students: [], courses: [{ id: 'course-demo-1', branchId: north.branchId, name: 'Computer Science' }] }
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(legacy))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    expect(() => createMockDatabase().createAdmission(input, north)).toThrow(expect.objectContaining({ code: 'STORAGE_WRITE_FAILED' }))
    expect(JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))).toEqual(legacy)
  })
  it.each(['counter', 'version', 'record', 'cross-branch', 'duplicate-number', 'unsafe-id'])('rejects %s corruption without erasing or migrating saved bytes', (kind) => {
    const data = createSeedDatabase()
    if (kind === 'counter') data.admissionCounter = -1
    if (kind === 'version') data.version = 999
    if (kind === 'record') { data.version = 1; data.students[0].name = null }
    if (kind === 'cross-branch') data.students[0].admissionId = data.admissions[0].id
    if (kind === 'duplicate-number') data.admissions[1].id = 'ADM-1'
    if (kind === 'unsafe-id') data.admissions[0].id = 'ADM-999999999999999999'
    const raw = JSON.stringify(data)
    localStorage.setItem(MOCK_DATABASE_KEY, raw)
    expect(() => createMockDatabase().run('admissions', 'list', { query: north })).toThrow()
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(raw)
  })
  it('rejects orphan transaction and immutable ID injection', () => {
    const db = createMockDatabase()
    expect(() => db.runTransaction([{ collection: 'admissions', operation: 'create', record: input, query: north }])).toThrow(expect.objectContaining({ code: 'INVALID_LINK' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
    const a = db.createAdmission(input, north)
    const raw = localStorage.getItem(MOCK_DATABASE_KEY)
    expect(() => db.run('admissions', 'update', { id: a.id, record: { ...input, admissionId: 'ADM-999' }, query: north })).toThrow()
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(raw)
  })
  it('retains IDs/links during supported updates and isolates branch access', () => {
    const db = createMockDatabase()
    const a = db.createAdmission(input, north)
    expect(db.run('admissions', 'update', { id: a.id, record: { ...input, contact: '0000000001' }, query: north })).toMatchObject({ id: a.id, admissionId: a.admissionId, studentId: a.studentId })
    expect(() => db.run('admissions', 'getById', { id: a.id, query: central })).toThrow(expect.objectContaining({ code: 'NOT_FOUND' }))
  })
  it('rejects invalid queries/input and exhausted counters without a write', () => {
    const db = createMockDatabase()
    expect(() => db.createAdmission(input, { branchId: 'all' })).toThrow()
    expect(() => db.createAdmission({ ...input, notes: {} }, north)).toThrow()
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
    const data = createSeedDatabase()
    data.admissionCounter = Number.MAX_SAFE_INTEGER
    const raw = JSON.stringify(data)
    localStorage.setItem(MOCK_DATABASE_KEY, raw)
    expect(() => db.createAdmission(input, north)).toThrow(expect.objectContaining({ code: 'COUNTER_EXHAUSTED' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(raw)
  })
  it('simulates failure before transaction then persists consecutive concurrent successes', async () => {
    const adapter = createMockApi({ beforeRequest: () => { throw new Error('controlled') } })
    await expect(adapter.createAdmission(input, north)).rejects.toMatchObject({ code: 'SIMULATED_FAILURE' })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
    const api = createMockApi()
    const records = await Promise.all([api.createAdmission(input, north), api.createAdmission({ ...input, courseId: 'course-demo-2' }, central)])
    expect(records.map((a) => a.admissionNumber)).toEqual([4, 3])
  })
  it('validates the active authorized session before service commit, including logout', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    await expect(admissionService.createWithStudent(input, north)).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
    const a = await admissionService.createWithStudent({ ...input, courseId: 'course-demo-2' }, central)
    expect(a.student.admissionDisplayId).toBe(a.admissionId)
    await authService.logout()
    await expect(admissionService.createWithStudent({ ...input, courseId: 'course-demo-2' }, central)).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
  })
  it('checks scope inside native Web Lock before committing queued writes', async () => {
    const request = vi.fn(async (_key, commit) => commit())
    vi.stubGlobal('navigator', { locks: { request } })
    try {
      const validateScope = vi.fn().mockRejectedValue(new Error('scope changed'))
      await expect(createMockApi().createAdmission(input, north, validateScope)).rejects.toThrow('scope changed')
      expect(request).toHaveBeenCalled()
      expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
    } finally { vi.unstubAllGlobals() }
  })
})
